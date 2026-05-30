/** 로컬 개발용 Node http 서버. 배포(Vercel)는 api/ 디렉터리의 서버리스 함수 사용. */
import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, providerStatuses } from './config.js';
import { handleApi } from './router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(body));
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
    sendJson(res, 500, { meta: { status: 'error', source: 'server', asOf: null, note: `서버 내부 오류: ${e?.message ?? e}` }, data: null });
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
  for (const p of providerStatuses()) {
    const mark = p.available ? '✅' : '⚠️ ';
    console.log(`${mark} ${p.id.padEnd(8)} ${p.available ? '사용 가능' : `키 필요(${p.requiresKey})`}`);
  }
  console.log('');
});
