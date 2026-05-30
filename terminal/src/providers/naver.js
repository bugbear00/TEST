// 네이버 금융 제공자 — 한국 주식(KOSPI/KOSDAQ) 정확·근실시간 시세.
// API 키 불필요(비공식 엔드포인트). Referer/User-Agent 헤더가 필요하다.
//
// KRX 공식 시장데이터(MDC)는 OTP 발급 후 폼 POST 가 필요해 서버 환경에서 불안정하므로,
// 실무적으로 정확도가 높고 응답이 안정적인 네이버 금융을 1차 소스로 사용한다.
// 1차: 실시간 폴링 API, 2차: 모바일 기본정보 API 로 폴백한다.

import { fetchJson, FetchError } from "../lib/fetcher.js";
import { ok, delayed, noData, blocked, errored } from "../lib/respond.js";

const SOURCE = "네이버 금융 (KRX, 근실시간)";

const NAVER_HEADERS = {
  // 네이버는 브라우저성 헤더가 없으면 차단할 수 있다.
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  Referer: "https://finance.naver.com/",
  Accept: "application/json",
};

// 등락 방향 코드: 1 상한, 2 상승, 3 보합, 4 하한, 5 하락
const RISE = new Set(["1", "2"]);
const FALL = new Set(["4", "5"]);

function num(v) {
  if (v == null) return null;
  const cleaned = String(v).replace(/,/g, "").trim();
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** 방향 코드/비율 부호를 반영해 변동값에 올바른 부호를 적용 */
function signedChange(rawChange, directionCode, ratio) {
  let c = num(rawChange);
  if (c == null) return null;
  c = Math.abs(c);
  const code = directionCode != null ? String(directionCode) : null;
  if (code && FALL.has(code)) return -c;
  if (code && RISE.has(code)) return c;
  // 방향 코드가 없으면 비율 부호로 판단
  const r = num(ratio);
  if (r != null && r < 0) return -c;
  return c;
}

function buildQuote(code, d) {
  const price = num(d.closePrice ?? d.nv ?? d.now);
  const dirCode =
    d.compareToPreviousPrice?.code ?? d.compareToPreviousPrice?.cd ?? null;
  const change = signedChange(
    d.compareToPreviousClosePrice ?? d.cv,
    dirCode,
    d.fluctuationsRatio ?? d.cr
  );
  let changePct = num(d.fluctuationsRatio ?? d.cr);
  if (changePct != null && change != null && change < 0 && changePct > 0) {
    changePct = -changePct; // 비율이 절대값으로만 올 때 부호 보정
  }
  return {
    symbol: code,
    name: d.stockName ?? d.nm ?? null,
    market: d.stockExchangeType?.code ?? d.marketStatus ?? null,
    price,
    open: num(d.openPrice ?? d.ov),
    high: num(d.highPrice ?? d.hv),
    low: num(d.lowPrice ?? d.lv),
    volume: num(d.accumulatedTradingVolume ?? d.aq),
    change,
    changePct,
    currency: "KRW",
    tradedAt: d.localTradedAt ?? null,
    available: price != null,
  };
}

async function fromPolling(code) {
  const url = `https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`;
  const json = await fetchJson(url, { headers: NAVER_HEADERS });
  const d = Array.isArray(json?.datas) ? json.datas[0] : null;
  if (!d) return null;
  const q = buildQuote(code, d);
  q.marketOpen = json.isMarketOpen ?? null;
  return q;
}

async function fromBasic(code) {
  const url = `https://m.stock.naver.com/api/stock/${code}/basic`;
  const d = await fetchJson(url, { headers: NAVER_HEADERS });
  if (!d || (!d.closePrice && !d.stockName)) return null;
  return buildQuote(code, d);
}

/**
 * 한국 종목 시세 조회 (6자리 종목코드).
 * @param {string} code 예: "005930"
 */
export async function quote(code) {
  const c = (code || "").trim();
  if (!/^\d{6}$/.test(c)) {
    return noData(SOURCE, "유효한 6자리 한국 종목코드가 필요합니다 (예: 005930).");
  }
  // 차단(blocked)은 no_data 로 뭉개지 않도록 분리해서 상위 catch 로 전달한다.
  const rethrowIfBlocked = (e) => {
    if (e instanceof FetchError && e.kind === "blocked") throw e;
    return null;
  };
  try {
    let q = await fromPolling(c).catch(rethrowIfBlocked);
    if (!q || !q.available) {
      const fb = await fromBasic(c).catch(rethrowIfBlocked);
      if (fb && fb.available) q = fb;
    }
    if (!q || !q.available) {
      return noData(SOURCE, `종목코드 '${c}' 의 시세를 찾지 못했습니다.`);
    }
    // 네이버 시세는 장중 근실시간이나 거래소 규정상 약간의 지연이 있을 수 있다.
    // data 는 다른 시세 응답과 동일하게 배열로 통일한다.
    const fn = q.marketOpen ? ok : delayed;
    return fn([q], SOURCE, {
      note: q.marketOpen === false ? "현재 정규장 시간이 아닙니다 (종가/시간외 기준)." : null,
    });
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked") {
      return blocked(SOURCE, err.message);
    }
    return errored(SOURCE, err?.message || "조회 실패");
  }
}

const INDEX_SOURCE = "네이버 금융 (KRX 지수, 근실시간)";

function buildIndex(code, name, d) {
  const q = buildQuote(code, d);
  q.name = name || q.name || code;
  q.currency = "P"; // 지수 포인트
  delete q.volume; // 지수는 거래량 표기 생략
  return q;
}

/**
 * 한국 주요 지수 일괄 조회.
 * @param {{code:string,name:string}[]} defs
 */
export async function indices(defs) {
  try {
    const out = [];
    for (const def of defs) {
      const url = `https://polling.finance.naver.com/api/realtime/domestic/index/${def.code}`;
      let d = null;
      try {
        const json = await fetchJson(url, { headers: NAVER_HEADERS });
        d = Array.isArray(json?.datas) ? json.datas[0] : null;
      } catch (e) {
        if (e instanceof FetchError && e.kind === "blocked") throw e;
      }
      out.push(
        d ? buildIndex(def.code, def.name, d) : { symbol: def.code, name: def.name, available: false }
      );
    }
    const any = out.some((o) => o.available);
    if (!any) return noData(INDEX_SOURCE, "지수 데이터를 가져오지 못했습니다.");
    return delayed(out, INDEX_SOURCE);
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked") {
      return blocked(INDEX_SOURCE, err.message);
    }
    return errored(INDEX_SOURCE, err?.message || "조회 실패");
  }
}
