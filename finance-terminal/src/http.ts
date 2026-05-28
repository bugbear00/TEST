import { config } from './config.js';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

interface FetchOpts {
  headers?: Record<string, string>;
  timeoutMs?: number;
  /** 추가 쿠키 헤더 */
  cookie?: string;
}

const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (compatible; korean-finance-terminal/0.1; +https://localhost)',
  Accept: 'application/json,text/plain,*/*',
  'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
};

async function rawFetch(url: string, opts: FetchOpts): Promise<Response> {
  const controller = new AbortController();
  const timeout = opts.timeoutMs ?? config.fetchTimeoutMs;
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const headers: Record<string, string> = { ...DEFAULT_HEADERS, ...opts.headers };
    if (opts.cookie) headers['Cookie'] = opts.cookie;
    const res = await fetch(url, { headers, signal: controller.signal, redirect: 'follow' });
    return res;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new NetworkError(`요청 시간 초과 (${timeout}ms)`);
    throw new NetworkError(e?.message ?? '네트워크 오류');
  } finally {
    clearTimeout(timer);
  }
}

export async function getJson<T = any>(url: string, opts: FetchOpts = {}): Promise<T> {
  const res = await rawFetch(url, opts);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new HttpError(res.status, `${res.status} ${res.statusText} ${body.slice(0, 120)}`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new NetworkError(`JSON 파싱 실패: ${text.slice(0, 80)}`);
  }
}

export async function getText(url: string, opts: FetchOpts = {}): Promise<string> {
  const res = await rawFetch(url, opts);
  if (!res.ok) {
    throw new HttpError(res.status, `${res.status} ${res.statusText}`);
  }
  return res.text();
}

/** set-cookie 헤더까지 필요한 경우 */
export async function getWithCookies(
  url: string,
  opts: FetchOpts = {},
): Promise<{ body: string; setCookie: string[] }> {
  const res = await rawFetch(url, opts);
  const setCookie =
    typeof (res.headers as any).getSetCookie === 'function'
      ? (res.headers as any).getSetCookie()
      : res.headers.get('set-cookie')
        ? [res.headers.get('set-cookie') as string]
        : [];
  const body = await res.text();
  return { body, setCookie };
}
