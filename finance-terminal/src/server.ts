import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, providerStatuses } from './config.js';
import * as yahoo from './providers/yahoo.js';
import * as sec from './providers/sec.js';
import { getRates } from './providers/fred.js';
import { getDisclosures } from './providers/dart.js';
import { getEarningsCalendar } from './providers/finnhub.js';
import type { ApiResult } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

// ─────────────────────────────────────────────────────────────
// 대시보드 큐레이션 심볼
// ─────────────────────────────────────────────────────────────
const MARKET_GROUPS: { id: string; label: string; symbols: { sym: string; label: string }[] }[] = [
  {
    id: 'us_index',
    label: '미국 지수',
    symbols: [
      { sym: '^GSPC', label: 'S&P 500' },
      { sym: '^IXIC', label: '나스닥 종합' },
      { sym: '^DJI', label: '다우존스' },
      { sym: '^RUT', label: '러셀 2000' },
      { sym: '^VIX', label: 'VIX 변동성' },
    ],
  },
  {
    id: 'kr_index',
    label: '한국 지수',
    symbols: [
      { sym: '^KS11', label: '코스피' },
      { sym: '^KQ11', label: '코스닥' },
    ],
  },
  {
    id: 'etf',
    label: '주요 ETF',
    symbols: [
      { sym: 'SPY', label: 'S&P500 (SPY)' },
      { sym: 'QQQ', label: '나스닥100 (QQQ)' },
      { sym: 'DIA', label: '다우 (DIA)' },
      { sym: 'IWM', label: '러셀2000 (IWM)' },
      { sym: 'TLT', label: '美 장기국채 (TLT)' },
      { sym: 'GLD', label: '금 ETF (GLD)' },
      { sym: 'EWY', label: '한국 ETF (EWY)' },
    ],
  },
  {
    id: 'fx',
    label: '환율',
    symbols: [
      { sym: 'KRW=X', label: '달러/원 (USD/KRW)' },
      { sym: 'EURUSD=X', label: '유로/달러' },
      { sym: 'JPY=X', label: '달러/엔' },
      { sym: 'DX-Y.NYB', label: '달러 인덱스(DXY)' },
    ],
  },
  {
    id: 'commodity',
    label: '원자재',
    symbols: [
      { sym: 'GC=F', label: '금(Gold)' },
      { sym: 'SI=F', label: '은(Silver)' },
      { sym: 'CL=F', label: 'WTI 원유' },
      { sym: 'BZ=F', label: '브렌트유' },
      { sym: 'NG=F', label: '천연가스' },
    ],
  },
  {
    id: 'crypto',
    label: '암호화폐',
    symbols: [
      { sym: 'BTC-USD', label: '비트코인' },
      { sym: 'ETH-USD', label: '이더리움' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// 응답 헬퍼
// ─────────────────────────────────────────────────────────────
function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(payload);
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveStatic(res: http.ServerResponse, urlPath: string): void {
  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = path.resolve(PUBLIC_DIR, rel);
  // 경로 탈출 방지
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] ?? 'application/octet-stream' });
    res.end(data);
  });
}

// ─────────────────────────────────────────────────────────────
// 라우팅
// ─────────────────────────────────────────────────────────────
async function handleApi(pathname: string, params: URLSearchParams): Promise<{ status: number; body: unknown }> {
  switch (pathname) {
    case '/api/health':
      return { status: 200, body: { ok: true, time: new Date().toISOString() } };

    case '/api/config':
      return {
        status: 200,
        body: { providers: providerStatuses(), asOf: new Date().toISOString() },
      };

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
      if (!symbol) return { status: 400, body: bad('symbol 파라미터가 필요합니다.') };
      const range = params.get('range') ?? '1mo';
      const interval = params.get('interval') ?? '1d';
      return { status: 200, body: await yahoo.getChart(symbol, range, interval) };
    }

    case '/api/search': {
      const q = params.get('q') ?? '';
      return { status: 200, body: await yahoo.search(q) };
    }

    case '/api/news':
      return { status: 200, body: await yahoo.getNews(params.get('symbol')) };

    case '/api/sec': {
      const symbol = params.get('symbol') ?? '';
      if (!symbol) return { status: 400, body: bad('symbol 파라미터가 필요합니다.') };
      return { status: 200, body: await sec.getFilings(symbol) };
    }

    case '/api/options': {
      const symbol = params.get('symbol') ?? '';
      if (!symbol) return { status: 400, body: bad('symbol 파라미터가 필요합니다.') };
      return { status: 200, body: await yahoo.getOptions(symbol, params.get('expiration') ?? undefined) };
    }

    case '/api/earnings': {
      const symbol = params.get('symbol') ?? '';
      if (!symbol) return { status: 400, body: bad('symbol 파라미터가 필요합니다.') };
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
      return { status: 404, body: bad('알 수 없는 API 경로입니다.') };
  }
}

function bad(note: string): ApiResult<null> {
  return { meta: { status: 'error', source: 'server', asOf: null, note }, data: null };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      const { status, body } = await handleApi(url.pathname, url.searchParams);
      sendJson(res, status, body);
      return;
    }
    serveStatic(res, url.pathname);
  } catch (e: any) {
    sendJson(res, 500, bad(`서버 내부 오류: ${e?.message ?? e}`));
  }
});

server.listen(config.port, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   한국어 미국주식 금융 터미널 (Korean Finance Terminal)     ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║   ▶ http://localhost:${config.port}`.padEnd(60) + '║');
  console.log('║   종료: Ctrl+C                                              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  const ps = providerStatuses();
  for (const p of ps) {
    const mark = p.available ? '✅' : '⚠️ ';
    console.log(`${mark} ${p.id.padEnd(8)} ${p.available ? '사용 가능' : `키 필요(${p.requiresKey})`}`);
  }
  console.log('');
});
