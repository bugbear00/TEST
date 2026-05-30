// FRED 제공자 (금리). API 키 필요: FRED_API_KEY
// 키 발급(무료): https://fredaccount.stlouisfed.org/apikeys

import { fetchJson, FetchError } from "../lib/fetcher.js";
import { KEYS, FRED_SERIES } from "../config.js";
import { ok, apiRequired, noData, blocked, errored } from "../lib/respond.js";

const SOURCE = "FRED (세인트루이스 연준)";

async function latest(seriesId) {
  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${encodeURIComponent(seriesId)}&api_key=${KEYS.FRED}` +
    `&file_type=json&sort_order=desc&limit=1`;
  const json = await fetchJson(url);
  const obs = json?.observations?.[0];
  if (!obs || obs.value === "." ) return { value: null, date: null };
  return { value: Number(obs.value), date: obs.date };
}

/** 주요 금리 일괄 조회 */
export async function rates() {
  if (!KEYS.FRED) {
    return apiRequired(
      "미국 금리(국채 수익률 등) 표시는 FRED API 키가 필요합니다. " +
        ".env 에 FRED_API_KEY 를 설정하세요. 무료 발급: https://fredaccount.stlouisfed.org/apikeys"
    );
  }
  try {
    const out = [];
    for (const s of FRED_SERIES) {
      const v = await latest(s.id);
      out.push({ id: s.id, name: s.name, percent: v.value, date: v.date });
    }
    const any = out.some((o) => o.percent != null);
    if (!any) return noData(SOURCE, "금리 데이터를 가져오지 못했습니다.");
    return ok(out, SOURCE);
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked") {
      return blocked(SOURCE, err.message);
    }
    return errored(SOURCE, err?.message || "조회 실패");
  }
}
