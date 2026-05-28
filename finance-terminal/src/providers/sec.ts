import { getJson, HttpError, NetworkError } from '../http.js';
import { config } from '../config.js';
import { cached } from '../cache.js';
import type { ApiResult, Filing, Meta } from '../types.js';

const SOURCE = 'SEC EDGAR';

function secHeaders() {
  return { 'User-Agent': config.secUserAgent, 'Accept-Encoding': 'gzip, deflate' };
}

function errMeta(e: unknown): Meta {
  if (e instanceof HttpError) {
    const hint =
      e.status === 403
        ? ' SEC는 식별 가능한 User-Agent(이메일 포함)를 요구합니다. SEC_USER_AGENT 환경변수를 설정하세요.'
        : '';
    return { status: 'error', source: SOURCE, asOf: null, note: `SEC 응답 오류 (HTTP ${e.status}).${hint}` };
  }
  if (e instanceof NetworkError) {
    return { status: 'error', source: SOURCE, asOf: null, note: `SEC에 연결할 수 없습니다: ${e.message}` };
  }
  return { status: 'error', source: SOURCE, asOf: null, note: '알 수 없는 오류' };
}

// ticker -> CIK (10자리) 매핑 (장시간 캐시)
let tickerMap: Map<string, string> | null = null;

async function loadTickerMap(): Promise<Map<string, string>> {
  if (tickerMap) return tickerMap;
  const json = await getJson<any>('https://www.sec.gov/files/company_tickers.json', {
    headers: secHeaders(),
    timeoutMs: 10000,
  });
  const map = new Map<string, string>();
  for (const key of Object.keys(json)) {
    const row = json[key];
    if (row?.ticker && row?.cik_str != null) {
      map.set(String(row.ticker).toUpperCase(), String(row.cik_str).padStart(10, '0'));
    }
  }
  tickerMap = map;
  return map;
}

export async function resolveCik(symbol: string): Promise<string | null> {
  const s = symbol.toUpperCase().trim();
  // 이미 CIK 형식이면 그대로
  if (/^\d{1,10}$/.test(s)) return s.padStart(10, '0');
  // 네트워크 오류는 호출부(getFilings)의 catch 에서 '오류'로 표시되도록 그대로 전파.
  const map = await loadTickerMap();
  return map.get(s) ?? null;
}

export async function getFilings(symbol: string, limit = 20): Promise<ApiResult<Filing[]>> {
  return cached(
    `sec:${symbol}:${limit}`,
    300,
    async () => {
      try {
        const cik = await resolveCik(symbol);
        if (!cik) {
          return {
            meta: {
              status: 'no_data',
              source: SOURCE,
              asOf: null,
              note: `"${symbol}"에 해당하는 미국 상장사 CIK를 찾지 못했습니다. (미국 종목 티커를 입력하세요)`,
            },
            data: null,
          };
        }
        const json = await getJson<any>(`https://data.sec.gov/submissions/CIK${cik}.json`, {
          headers: secHeaders(),
          timeoutMs: 10000,
        });
        const recent = json?.filings?.recent;
        if (!recent?.form) {
          return { meta: { status: 'no_data', source: SOURCE, asOf: null, note: '공시 내역이 없습니다.' }, data: [] };
        }
        const cikNum = String(Number(cik));
        const filings: Filing[] = [];
        for (let i = 0; i < recent.form.length && filings.length < limit; i++) {
          const accession = recent.accessionNumber?.[i] ?? '';
          const accNoDash = accession.replace(/-/g, '');
          const doc = recent.primaryDocument?.[i] ?? '';
          filings.push({
            form: recent.form[i],
            title: recent.primaryDocDescription?.[i] || recent.form[i],
            filedAt: recent.filingDate?.[i] ?? null,
            accessionNumber: accession,
            link: doc
              ? `https://www.sec.gov/Archives/edgar/data/${cikNum}/${accNoDash}/${doc}`
              : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=&dateb=&owner=include&count=40`,
          });
        }
        return {
          meta: {
            status: 'live',
            source: `${SOURCE} (${json.name ?? symbol})`,
            asOf: new Date().toISOString(),
            note: '미국 증권거래위원회 공식 공시.',
          },
          data: filings,
        };
      } catch (e) {
        return { meta: errMeta(e), data: null };
      }
    },
    (r) => r.data != null && r.data.length > 0,
  );
}
