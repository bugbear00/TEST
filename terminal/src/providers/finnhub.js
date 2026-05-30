// Finnhub 제공자. API 키 필요: FINNHUB_API_KEY
// 키 발급(무료 티어): https://finnhub.io/register
// 무료 티어로 회사 뉴스, 실적 캘린더 등을 제공. (옵션 체인은 유료)

import { fetchJson, FetchError } from "../lib/fetcher.js";
import { KEYS } from "../config.js";
import { ok, apiRequired, noData, blocked, errored } from "../lib/respond.js";

const SOURCE = "Finnhub";

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

/** 특정 종목 뉴스 (최근 7일) */
export async function companyNews(ticker) {
  const t = (ticker || "").trim().toUpperCase();
  if (!t) return noData(SOURCE, "티커가 필요합니다.");
  if (!KEYS.FINNHUB) {
    return apiRequired(
      `'${t}' 종목 뉴스는 Finnhub API 키가 필요합니다. .env 에 FINNHUB_API_KEY 설정. ` +
        "무료 발급: https://finnhub.io/register"
    );
  }
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 3600 * 1000);
  try {
    const arr = await fetchJson(
      `https://finnhub.io/api/v1/company-news?symbol=${t}` +
        `&from=${fmtDate(from)}&to=${fmtDate(to)}&token=${KEYS.FINNHUB}`
    );
    if (!Array.isArray(arr) || arr.length === 0)
      return noData(SOURCE, "최근 뉴스가 없습니다.");
    const out = arr.slice(0, 30).map((n) => ({
      headline: n.headline,
      source: n.source,
      url: n.url,
      datetime: n.datetime ? new Date(n.datetime * 1000).toISOString() : null,
      summary: n.summary || null,
    }));
    return ok({ ticker: t, news: out }, SOURCE);
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked")
      return blocked(SOURCE, err.message);
    return errored(SOURCE, err?.message || "조회 실패");
  }
}

/** 실적 캘린더 (향후 일정) */
export async function earningsCalendar(ticker) {
  if (!KEYS.FINNHUB) {
    return apiRequired(
      "실적 캘린더는 Finnhub API 키가 필요합니다. .env 에 FINNHUB_API_KEY 설정. " +
        "무료 발급: https://finnhub.io/register"
    );
  }
  const from = new Date();
  const to = new Date(from.getTime() + 60 * 24 * 3600 * 1000);
  const t = (ticker || "").trim().toUpperCase();
  try {
    const url =
      `https://finnhub.io/api/v1/calendar/earnings?from=${fmtDate(from)}&to=${fmtDate(to)}` +
      (t ? `&symbol=${t}` : "") +
      `&token=${KEYS.FINNHUB}`;
    const json = await fetchJson(url);
    const list = json?.earningsCalendar || [];
    if (list.length === 0) return noData(SOURCE, "예정된 실적 발표가 없습니다.");
    const out = list.slice(0, 50).map((e) => ({
      symbol: e.symbol,
      date: e.date,
      epsEstimate: e.epsEstimate ?? null,
      epsActual: e.epsActual ?? null,
      revenueEstimate: e.revenueEstimate ?? null,
      revenueActual: e.revenueActual ?? null,
      hour: e.hour || null,
    }));
    return ok({ ticker: t || null, earnings: out }, SOURCE);
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked")
      return blocked(SOURCE, err.message);
    return errored(SOURCE, err?.message || "조회 실패");
  }
}
