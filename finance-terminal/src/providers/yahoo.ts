import { getJson, getWithCookies, HttpError, NetworkError } from '../http.js';
import { config } from '../config.js';
import { cached } from '../cache.js';
import type {
  ApiResult,
  ChartSeries,
  Meta,
  NewsItem,
  OptionChain,
  OptionContract,
  Quote,
} from '../types.js';

const SOURCE = 'Yahoo Finance';
const Q1 = 'https://query1.finance.yahoo.com';
const Q2 = 'https://query2.finance.yahoo.com';

function nowIso(): string {
  return new Date().toISOString();
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function errMeta(e: unknown): Meta {
  if (e instanceof HttpError) {
    return {
      status: 'error',
      source: SOURCE,
      asOf: null,
      note: `데이터 제공처 응답 오류 (HTTP ${e.status}).`,
    };
  }
  if (e instanceof NetworkError) {
    return {
      status: 'error',
      source: SOURCE,
      asOf: null,
      note: `외부 데이터에 연결할 수 없습니다: ${e.message}`,
    };
  }
  return { status: 'error', source: SOURCE, asOf: null, note: '알 수 없는 오류' };
}

// ─────────────────────────────────────────────────────────────
// Crumb / cookie 처리 (v7/v10 엔드포인트에 필요)
// ─────────────────────────────────────────────────────────────
let crumbCache: { crumb: string; cookie: string; ts: number } | null = null;

async function getCrumb(): Promise<{ crumb: string; cookie: string } | null> {
  if (crumbCache && Date.now() - crumbCache.ts < 30 * 60 * 1000) {
    return { crumb: crumbCache.crumb, cookie: crumbCache.cookie };
  }
  try {
    const { setCookie } = await getWithCookies('https://fc.yahoo.com', {
      timeoutMs: 4000,
    });
    const cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
    if (!cookie) return null;
    const crumb = await (
      await import('../http.js')
    ).getText(`${Q1}/v1/test/getcrumb`, { cookie, timeoutMs: 4000 });
    if (!crumb || crumb.includes('<')) return null;
    crumbCache = { crumb, cookie, ts: Date.now() };
    return { crumb, cookie };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 시세 (Quote)
// ─────────────────────────────────────────────────────────────
function mapDelay(delaySec: number | null): { status: 'live' | 'delayed'; delayMinutes?: number } {
  if (delaySec == null || delaySec <= 0) return { status: 'live' };
  return { status: 'delayed', delayMinutes: Math.round(delaySec / 60) };
}

async function quoteViaV7(symbols: string[]): Promise<Quote[] | null> {
  const cr = await getCrumb();
  if (!cr) return null;
  const url = `${Q1}/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}&crumb=${encodeURIComponent(cr.crumb)}`;
  const json = await getJson<any>(url, { cookie: cr.cookie });
  const rows = json?.quoteResponse?.result;
  if (!Array.isArray(rows)) return null;
  return rows.map((r: any) => mapV7Quote(r));
}

function mapV7Quote(r: any): Quote {
  return {
    symbol: r.symbol,
    name: str(r.longName) ?? str(r.shortName),
    price: num(r.regularMarketPrice),
    change: num(r.regularMarketChange),
    changePercent: num(r.regularMarketChangePercent),
    currency: str(r.currency),
    marketState: str(r.marketState),
    previousClose: num(r.regularMarketPreviousClose),
    dayHigh: num(r.regularMarketDayHigh),
    dayLow: num(r.regularMarketDayLow),
    volume: num(r.regularMarketVolume),
    fiftyTwoWeekHigh: num(r.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: num(r.fiftyTwoWeekLow),
    exchange: str(r.fullExchangeName) ?? str(r.exchange),
    marketTime: r.regularMarketTime ? new Date(r.regularMarketTime * 1000).toISOString() : null,
  };
}

/** v8 chart 메타에서 시세 복원 (crumb 불필요, 가장 안정적인 fallback) */
async function quoteViaChart(symbol: string): Promise<{ quote: Quote; delaySec: number | null } | null> {
  const url = `${Q1}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
  const json = await getJson<any>(url);
  const m = json?.chart?.result?.[0]?.meta;
  if (!m) return null;
  const price = num(m.regularMarketPrice);
  const prev = num(m.chartPreviousClose) ?? num(m.previousClose);
  const change = price != null && prev != null ? price - prev : null;
  const changePct = change != null && prev ? (change / prev) * 100 : null;
  const quote: Quote = {
    symbol: m.symbol ?? symbol,
    name: str(m.longName) ?? str(m.shortName),
    price,
    change,
    changePercent: changePct,
    currency: str(m.currency),
    marketState: null,
    previousClose: prev,
    dayHigh: num(m.regularMarketDayHigh),
    dayLow: num(m.regularMarketDayLow),
    volume: num(m.regularMarketVolume),
    fiftyTwoWeekHigh: num(m.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: num(m.fiftyTwoWeekLow),
    exchange: str(m.fullExchangeName) ?? str(m.exchangeName),
    marketTime: m.regularMarketTime ? new Date(m.regularMarketTime * 1000).toISOString() : null,
  };
  const delaySec = typeof m.exchangeDataDelayedBy === 'number' ? m.exchangeDataDelayedBy : null;
  return { quote, delaySec };
}

export async function getQuotes(symbols: string[]): Promise<ApiResult<Quote[]>> {
  if (symbols.length === 0) {
    return { meta: { status: 'no_data', source: SOURCE, asOf: null, note: '심볼이 없습니다.' }, data: [] };
  }
  return cached(
    `quotes:${symbols.join(',')}`,
    config.cacheTtlSeconds,
    async () => {
      try {
        // 1) v7 일괄 조회 시도
        const v7 = await quoteViaV7(symbols).catch(() => null);
        if (v7 && v7.length > 0) {
          return {
            meta: {
              status: 'delayed',
              source: SOURCE,
              asOf: nowIso(),
              delayMinutes: 15,
              note: '무료 공개 데이터입니다. 거래소·종목에 따라 실시간이거나 최대 15분 지연될 수 있습니다.',
            },
            data: v7,
          } as ApiResult<Quote[]>;
        }
        // 2) chart 메타로 종목별 fallback
        const settled = await Promise.allSettled(symbols.map((s) => quoteViaChart(s)));
        const quotes: NonNullable<Awaited<ReturnType<typeof quoteViaChart>>>[] = [];
        let lastError: unknown = null;
        for (const s of settled) {
          if (s.status === 'fulfilled' && s.value) quotes.push(s.value);
          else if (s.status === 'rejected') lastError = s.reason;
        }
        if (quotes.length === 0) {
          // 연결/응답 자체가 실패했으면 '오류', 데이터만 없으면 '데이터 없음'으로 구분
          if (lastError) return { meta: errMeta(lastError), data: null };
          return {
            meta: { status: 'no_data', source: SOURCE, asOf: nowIso(), note: '해당 심볼의 데이터를 찾지 못했습니다.' },
            data: [],
          } as ApiResult<Quote[]>;
        }
        const anyDelay = quotes.some((q) => (q.delaySec ?? 0) > 0);
        const mapped = mapDelay(anyDelay ? 900 : 0);
        return {
          meta: {
            ...mapped,
            source: SOURCE,
            asOf: nowIso(),
            note:
              mapped.status === 'delayed'
                ? '무료 공개 데이터입니다. 최대 15분 지연될 수 있습니다.'
                : '무료 공개 데이터입니다.',
          },
          data: quotes.map((q) => q.quote),
        } as ApiResult<Quote[]>;
      } catch (e) {
        return { meta: errMeta(e), data: null };
      }
    },
    (r) => r.data != null && r.data.length > 0,
  );
}

// ─────────────────────────────────────────────────────────────
// 차트 (히스토리)
// ─────────────────────────────────────────────────────────────
export async function getChart(
  symbol: string,
  range: string,
  interval: string,
): Promise<ApiResult<ChartSeries>> {
  return cached(
    `chart:${symbol}:${range}:${interval}`,
    Math.max(config.cacheTtlSeconds, 60),
    async () => {
      try {
        const url = `${Q1}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`;
        const json = await getJson<any>(url);
        const result = json?.chart?.result?.[0];
        if (!result?.timestamp) {
          return {
            meta: { status: 'no_data', source: SOURCE, asOf: nowIso(), note: '차트 데이터가 없습니다.' },
            data: null,
          };
        }
        const ts: number[] = result.timestamp;
        const q = result.indicators?.quote?.[0] ?? {};
        const points = ts.map((t, i) => ({
          t,
          close: num(q.close?.[i]),
          open: num(q.open?.[i]),
          high: num(q.high?.[i]),
          low: num(q.low?.[i]),
          volume: num(q.volume?.[i]),
        }));
        return {
          meta: {
            status: 'delayed',
            source: SOURCE,
            asOf: nowIso(),
            note: '과거 시세 기준. 최근 구간은 지연될 수 있습니다.',
          },
          data: {
            symbol: result.meta?.symbol ?? symbol,
            currency: str(result.meta?.currency),
            range,
            interval,
            points,
          },
        };
      } catch (e) {
        return { meta: errMeta(e), data: null };
      }
    },
    (r) => r.data != null,
  );
}

// ─────────────────────────────────────────────────────────────
// 검색 + 뉴스 (v1/finance/search)
// ─────────────────────────────────────────────────────────────
export interface SearchHit {
  symbol: string;
  name: string | null;
  exchange: string | null;
  type: string | null;
}

export async function search(query: string): Promise<ApiResult<{ quotes: SearchHit[]; news: NewsItem[] }>> {
  if (!query.trim()) {
    return { meta: { status: 'no_data', source: SOURCE, asOf: null, note: '검색어가 비었습니다.' }, data: null };
  }
  try {
    const url = `${Q1}/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=8&quotesCount=10`;
    const json = await getJson<any>(url);
    const quotes: SearchHit[] = (json?.quotes ?? [])
      .filter((q: any) => q.symbol)
      .map((q: any) => ({
        symbol: q.symbol,
        name: str(q.longname) ?? str(q.shortname),
        exchange: str(q.exchDisp) ?? str(q.exchange),
        type: str(q.quoteType) ?? str(q.typeDisp),
      }));
    const news: NewsItem[] = (json?.news ?? []).map((n: any) => ({
      title: n.title,
      publisher: str(n.publisher),
      link: n.link,
      publishedAt: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : null,
      relatedTickers: Array.isArray(n.relatedTickers) ? n.relatedTickers : undefined,
    }));
    return {
      meta: { status: 'live', source: SOURCE, asOf: nowIso(), note: '검색/뉴스 결과' },
      data: { quotes, news },
    };
  } catch (e) {
    return { meta: errMeta(e), data: null };
  }
}

export async function getNews(symbol: string | null): Promise<ApiResult<NewsItem[]>> {
  const q = symbol && symbol.trim() ? symbol.trim() : 'stock market';
  const r = await search(q);
  if (!r.data) return { meta: r.meta, data: null };
  if (r.data.news.length === 0) {
    return { meta: { status: 'no_data', source: SOURCE, asOf: nowIso(), note: '관련 뉴스가 없습니다.' }, data: [] };
  }
  return { meta: { status: 'live', source: SOURCE, asOf: nowIso(), note: '뉴스 (영문 출처)' }, data: r.data.news };
}

// ─────────────────────────────────────────────────────────────
// 옵션 체인
// ─────────────────────────────────────────────────────────────
function mapContract(c: any): OptionContract {
  return {
    contractSymbol: c.contractSymbol,
    strike: num(c.strike) ?? 0,
    lastPrice: num(c.lastPrice),
    bid: num(c.bid),
    ask: num(c.ask),
    volume: num(c.volume),
    openInterest: num(c.openInterest),
    impliedVolatility: num(c.impliedVolatility),
    inTheMoney: !!c.inTheMoney,
  };
}

export async function getOptions(symbol: string, expiration?: string): Promise<ApiResult<OptionChain>> {
  try {
    const cr = await getCrumb();
    const params = new URLSearchParams();
    if (expiration) params.set('date', expiration);
    if (cr) params.set('crumb', cr.crumb);
    const qs = params.toString();
    const url = `${Q2}/v7/finance/options/${encodeURIComponent(symbol)}${qs ? `?${qs}` : ''}`;
    const json = await getJson<any>(url, cr ? { cookie: cr.cookie } : {});
    const result = json?.optionChain?.result?.[0];
    if (!result) {
      return { meta: { status: 'no_data', source: SOURCE, asOf: nowIso(), note: '옵션 데이터가 없습니다.' }, data: null };
    }
    const expDates: string[] = (result.expirationDates ?? []).map((d: number) =>
      new Date(d * 1000).toISOString().slice(0, 10),
    );
    const opt = result.options?.[0];
    return {
      meta: {
        status: 'delayed',
        source: SOURCE,
        asOf: nowIso(),
        delayMinutes: 15,
        note: '옵션 시세는 지연될 수 있습니다.',
      },
      data: {
        symbol: result.underlyingSymbol ?? symbol,
        expiration: opt?.expirationDate ? new Date(opt.expirationDate * 1000).toISOString().slice(0, 10) : null,
        expirationDates: expDates,
        underlyingPrice: num(result.quote?.regularMarketPrice),
        calls: (opt?.calls ?? []).map(mapContract),
        puts: (opt?.puts ?? []).map(mapContract),
      },
    };
  } catch (e) {
    return { meta: errMeta(e), data: null };
  }
}

// ─────────────────────────────────────────────────────────────
// 실적 (quoteSummary - earnings)
// ─────────────────────────────────────────────────────────────
export async function getEarnings(symbol: string): Promise<ApiResult<any>> {
  try {
    const cr = await getCrumb();
    const params = new URLSearchParams({ modules: 'earnings,earningsHistory,calendarEvents' });
    if (cr) params.set('crumb', cr.crumb);
    const url = `${Q2}/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?${params.toString()}`;
    const json = await getJson<any>(url, cr ? { cookie: cr.cookie } : {});
    const result = json?.quoteSummary?.result?.[0];
    if (!result) {
      return {
        meta: { status: 'no_data', source: SOURCE, asOf: nowIso(), note: '실적 데이터가 없습니다.' },
        data: null,
      };
    }
    return {
      meta: { status: 'delayed', source: SOURCE, asOf: nowIso(), note: '실적/추정치 (참고용).' },
      data: result,
    };
  } catch (e) {
    return { meta: errMeta(e), data: null };
  }
}
