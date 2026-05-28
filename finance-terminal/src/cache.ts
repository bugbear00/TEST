/** 아주 단순한 인메모리 TTL 캐시 (외부 API 호출량 절감용) */

interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const e = store.get(key);
  if (!e) return undefined;
  if (Date.now() > e.expires) {
    store.delete(key);
    return undefined;
  }
  return e.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

/** 캐시에 없으면 fn 실행 후 저장. 단, 실패/빈 결과는 캐시하지 않는다. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
  shouldCache: (v: T) => boolean = () => true,
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;
  const value = await fn();
  if (shouldCache(value)) cacheSet(key, value, ttlSeconds);
  return value;
}
