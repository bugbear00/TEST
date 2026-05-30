/**
 * Vercel 서버리스 함수 — 모든 /api/* 요청을 공유 라우터로 위임.
 * (로컬 개발 서버는 src/server.ts 사용)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApi } from '../src/router.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const { status, body } = await handleApi(url.pathname, url.searchParams);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    res.status(status).json(body);
  } catch (e: any) {
    res.status(500).json({
      meta: { status: 'error', source: 'server', asOf: null, note: `서버 내부 오류: ${e?.message ?? e}` },
      data: null,
    });
  }
}
