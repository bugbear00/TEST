// 안전한 외부 호출 래퍼.
// 네트워크 차단(allowlist), 타임아웃, 비정상 응답을 분류해서
// 호출부가 정직한 status 를 만들 수 있게 한다.

export class FetchError extends Error {
  /** @param {"blocked"|"error"|"no_data"} kind */
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

const DEFAULT_HEADERS = {
  // SEC EDGAR 등은 식별 가능한 User-Agent 를 요구한다.
  "User-Agent": process.env.CONTACT_USER_AGENT || "us-finance-terminal-ko (contact: set CONTACT_USER_AGENT)",
  Accept: "application/json, text/csv, text/plain, */*",
};

/**
 * 외부 URL 을 가져와 텍스트로 반환한다.
 * @param {string} url
 * @param {object} [opts]
 * @param {number} [opts.timeoutMs=10000]
 * @param {Record<string,string>} [opts.headers]
 * @returns {Promise<string>}
 */
export async function fetchText(url, opts = {}) {
  const { timeoutMs = 10000, headers = {} } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: { ...DEFAULT_HEADERS, ...headers },
    });
  } catch (err) {
    clearTimeout(timer);
    // 네트워크 자체 실패 (DNS, abort, 연결 거부 등)
    throw new FetchError("error", `network error: ${err?.message || err}`);
  }
  clearTimeout(timer);

  const text = await res.text();

  // 일부 샌드박스/프록시는 차단된 호스트에 대해 이 본문을 돌려준다.
  if (text.trim() === "Host not in allowlist" || res.status === 451) {
    throw new FetchError(
      "blocked",
      "외부 호스트가 네트워크 allowlist 에 없어 차단되었습니다."
    );
  }
  if (res.status === 403 && text.includes("allowlist")) {
    throw new FetchError("blocked", "네트워크 정책으로 차단됨(403/allowlist).");
  }
  if (!res.ok) {
    throw new FetchError("error", `HTTP ${res.status}`);
  }
  return text;
}

/** JSON 으로 파싱해서 반환 */
export async function fetchJson(url, opts = {}) {
  const text = await fetchText(url, opts);
  try {
    return JSON.parse(text);
  } catch {
    throw new FetchError("error", "JSON 파싱 실패");
  }
}
