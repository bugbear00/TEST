// 옵션 체인 제공자. 신뢰할 수 있는 무료 소스가 없어 키 기반(Polygon)을 사용한다.
// API 키 필요: POLYGON_API_KEY  (https://polygon.io/)

import { fetchJson, FetchError } from "../lib/fetcher.js";
import { KEYS } from "../config.js";
import { ok, apiRequired, noData, blocked, errored } from "../lib/respond.js";

const SOURCE = "Polygon.io";

export async function optionChain(ticker) {
  const t = (ticker || "").trim().toUpperCase();
  if (!t) return noData(SOURCE, "티커가 필요합니다.");
  if (!KEYS.POLYGON) {
    return apiRequired(
      `'${t}' 옵션 체인은 별도 옵션 데이터 제공사가 필요합니다(무료·실시간 공개 소스 없음). ` +
        ".env 에 POLYGON_API_KEY 설정. 발급: https://polygon.io/"
    );
  }
  try {
    const json = await fetchJson(
      `https://api.polygon.io/v3/snapshot/options/${t}?limit=50&apiKey=${KEYS.POLYGON}`
    );
    const results = json?.results || [];
    if (results.length === 0) return noData(SOURCE, "옵션 데이터가 없습니다.");
    const out = results.map((o) => ({
      contract: o.details?.ticker || null,
      type: o.details?.contract_type || null,
      strike: o.details?.strike_price ?? null,
      expiration: o.details?.expiration_date || null,
      lastPrice: o.day?.close ?? null,
      iv: o.implied_volatility ?? null,
      openInterest: o.open_interest ?? null,
    }));
    return ok({ ticker: t, contracts: out }, SOURCE);
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked")
      return blocked(SOURCE, err.message);
    return errored(SOURCE, err?.message || "조회 실패");
  }
}
