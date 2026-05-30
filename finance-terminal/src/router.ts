/** 로컬 Node http 서버와 Vercel 서버리스 함수가 공유하는 API 라우터 */
import * as yahoo from './providers/yahoo.js';
import * as sec from './providers/sec.js';
import { getRates } from './providers/fred.js';
import { getDisclosures } from './providers/dart.js';
import { getEarningsCalendar } from './providers/finnhub.js';
import { providerStatuses } from './config.js';
import { MARKET_GROUPS } from './markets.js';
import type { ApiResult } from './types.js';

export function badRequest(note: string): ApiResult<null> {
  return { meta: { status: 'error', source: 'server', asOf: null, note }, data: null };
}

export async function handleApi(
  pathname: string,
  params: URLSearchParams,
): Promise<{ status: number; body: unknown }> {
  switch (pathname) {
    case '/api/health':
      return { status: 200, body: { ok: true, time: new Date().toISOString() } };

    case '/api/config':
      return { status: 200, body: { providers: providerStatuses(), asOf: new Date().toISOString() } };

    case '/api/markets': {
      const groups = await Promise.all(
        MARKET_GROUPS.map(async (g) => {
          const result = await yahoo.getQuotes(g.symbols.map((s) => s.sym));
          const labelBySym = new Map(g.symbols.map((s) => [s.sym, s.label]));
          const data =
            result.data?.map((q) => ({ ...q, label: labelBySym.get(q.symbol) ?? q.name ?? q.symbol })) ?? null;
          return { id: g.id, label: g.label, meta: result.meta, data };
        }),
      );
      return { status: 200, body: { groups, asOf: new Date().toISOString() } };
    }

    case '/api/quote': {
      const symbols = (params.get('symbols') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return { status: 200, body: await yahoo.getQuotes(symbols) };
    }

    case '/api/chart': {
      const symbol = params.get('symbol') ?? '';
      if (!symbol) return { status: 400, body: badRequest('symbol 파라미터가 필요합니다.') };
      return {
        status: 200,
        body: await yahoo.getChart(symbol, params.get('range') ?? '1mo', params.get('interval') ?? '1d'),
      };
    }

    case '/api/search':
      return { status: 200, body: await yahoo.search(params.get('q') ?? '') };

    case '/api/news':
      return { status: 200, body: await yahoo.getNews(params.get('symbol')) };

    case '/api/sec': {
      const symbol = params.get('symbol') ?? '';
      if (!symbol) return { status: 400, body: badRequest('symbol 파라미터가 필요합니다.') };
      return { status: 200, body: await sec.getFilings(symbol) };
    }

    case '/api/options': {
      const symbol = params.get('symbol') ?? '';
      if (!symbol) return { status: 400, body: badRequest('symbol 파라미터가 필요합니다.') };
      return { status: 200, body: await yahoo.getOptions(symbol, params.get('expiration') ?? undefined) };
    }

    case '/api/earnings': {
      const symbol = params.get('symbol') ?? '';
      if (!symbol) return { status: 400, body: badRequest('symbol 파라미터가 필요합니다.') };
      if (params.get('provider') === 'finnhub') {
        return { status: 200, body: await getEarningsCalendar(symbol) };
      }
      return { status: 200, body: await yahoo.getEarnings(symbol) };
    }

    case '/api/rates':
      return { status: 200, body: await getRates() };

    case '/api/dart':
      return { status: 200, body: await getDisclosures(params.get('corp') ?? undefined) };

    default:
      return { status: 404, body: badRequest('알 수 없는 API 경로입니다.') };
  }
}
