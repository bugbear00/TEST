// Stooq 데이터 제공자 (API 키 불필요, 지연 시세).
// 미국 주식/ETF/지수/원자재/환율, 일부 글로벌 심볼 지원.
// 무료이며 보통 15분 이상 지연된 실제 데이터다. 가짜 값은 만들지 않는다.

import { fetchText, FetchError } from "../lib/fetcher.js";
import { parseCsv, isStooqMissing } from "../lib/csv.js";
import { STATUS, delayed, noData, blocked, errored } from "../lib/respond.js";

const SOURCE = "Stooq (무료·지연 데이터)";
const Q_URL = "https://stooq.com/q/l/";
const H_URL = "https://stooq.com/q/d/l/";

function toNum(v) {
  if (isStooqMissing(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function rowToQuote(row, fallbackSymbol) {
  const close = toNum(row.Close);
  const open = toNum(row.Open);
  const change = close != null && open != null ? close - open : null;
  const changePct =
    change != null && open ? (change / open) * 100 : null;
  return {
    symbol: row.Symbol || fallbackSymbol || null,
    name: isStooqMissing(row.Name) ? null : row.Name,
    date: isStooqMissing(row.Date) ? null : row.Date,
    time: isStooqMissing(row.Time) ? null : row.Time,
    open,
    high: toNum(row.High),
    low: toNum(row.Low),
    price: close,
    volume: toNum(row.Volume),
    change,
    changePct,
    // close 가 null 이면 Stooq 가 해당 심볼 데이터를 못 준 것
    available: close != null,
  };
}

/**
 * 여러 심볼의 시세를 한 번에 조회.
 * @param {string[]} symbols  예: ["aapl.us","msft.us","^spx"]
 */
export async function quotes(symbols) {
  const list = symbols.map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return noData(SOURCE, "심볼이 지정되지 않았습니다.");
  const url = `${Q_URL}?s=${encodeURIComponent(list.join(","))}&f=sd2t2ohlcvn&h&e=csv`;
  try {
    const csv = await fetchText(url);
    const rows = parseCsv(csv);
    if (rows.length === 0) return noData(SOURCE, "응답에 데이터가 없습니다.");
    const data = rows.map((r, i) => rowToQuote(r, list[i]));
    const anyAvailable = data.some((d) => d.available);
    return delayed(data, SOURCE, {
      note: anyAvailable
        ? null
        : "요청한 심볼에 대한 시세를 찾지 못했습니다.",
      status: anyAvailable ? STATUS.DELAYED : STATUS.NO_DATA,
    });
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked") {
      return blocked(SOURCE, err.message);
    }
    return errored(SOURCE, err?.message || "조회 실패");
  }
}

/** 단일 심볼 일봉 히스토리 (Date,Open,High,Low,Close,Volume) */
export async function history(symbol) {
  const sym = (symbol || "").trim();
  if (!sym) return noData(SOURCE, "심볼이 필요합니다.");
  const url = `${H_URL}?s=${encodeURIComponent(sym)}&i=d`;
  try {
    const csv = await fetchText(url);
    const rows = parseCsv(csv);
    const points = rows
      .map((r) => ({
        date: r.Date,
        open: toNum(r.Open),
        high: toNum(r.High),
        low: toNum(r.Low),
        close: toNum(r.Close),
        volume: toNum(r.Volume),
      }))
      .filter((p) => p.date && p.close != null);
    if (points.length === 0) return noData(SOURCE, "히스토리 데이터가 없습니다.");
    return delayed({ symbol: sym, points }, SOURCE);
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked") {
      return blocked(SOURCE, err.message);
    }
    return errored(SOURCE, err?.message || "조회 실패");
  }
}

/** 미국 주식/ETF 심볼 정규화: 접미사가 없으면 .us 를 붙인다. */
export function usSymbol(ticker) {
  const t = (ticker || "").trim().toLowerCase();
  if (!t) return "";
  if (t.startsWith("^") || t.includes(".")) return t;
  return `${t}.us`;
}
