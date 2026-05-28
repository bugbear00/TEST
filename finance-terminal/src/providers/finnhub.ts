import { getJson, HttpError, NetworkError } from '../http.js';
import { config } from '../config.js';
import { cached } from '../cache.js';
import type { ApiResult, EarningsRow, Meta } from '../types.js';

const SOURCE = 'Finnhub';

function errMeta(e: unknown): Meta {
  if (e instanceof HttpError) return { status: 'error', source: SOURCE, asOf: null, note: `Finnhub 응답 오류 (HTTP ${e.status}).` };
  if (e instanceof NetworkError) return { status: 'error', source: SOURCE, asOf: null, note: `Finnhub 연결 실패: ${e.message}` };
  return { status: 'error', source: SOURCE, asOf: null, note: '알 수 없는 오류' };
}

/** 종목별 과거 실적(EPS/매출) — Finnhub 키가 있을 때만 */
export async function getEarningsCalendar(symbol: string): Promise<ApiResult<EarningsRow[]>> {
  if (!config.finnhubApiKey) {
    return {
      meta: {
        status: 'api_required',
        source: SOURCE,
        asOf: null,
        requiresKey: 'FINNHUB_API_KEY',
        note: '정형화된 실적 데이터(EPS/매출 추정·실제)를 보려면 Finnhub 무료 API 키가 필요합니다. https://finnhub.io',
      },
      data: null,
    };
  }
  return cached(
    `finnhub:earn:${symbol}`,
    600,
    async () => {
      try {
        const url = `https://finnhub.io/api/v1/stock/earnings?symbol=${encodeURIComponent(symbol)}&token=${config.finnhubApiKey}`;
        const json = await getJson<any>(url);
        if (!Array.isArray(json) || json.length === 0) {
          return { meta: { status: 'no_data', source: SOURCE, asOf: null, note: '실적 데이터가 없습니다.' }, data: [] };
        }
        const rows: EarningsRow[] = json.map((r: any) => ({
          date: r.period ?? null,
          epsActual: typeof r.actual === 'number' ? r.actual : null,
          epsEstimate: typeof r.estimate === 'number' ? r.estimate : null,
          revenueActual: null,
          revenueEstimate: null,
        }));
        return { meta: { status: 'live', source: SOURCE, asOf: new Date().toISOString(), note: '실적 EPS 실제 vs 추정.' }, data: rows };
      } catch (e) {
        return { meta: errMeta(e), data: null };
      }
    },
    (r) => r.data != null && r.data.length > 0,
  );
}
