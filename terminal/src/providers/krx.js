// KRX 공식 시장데이터 Open API 제공자.
// API 키 필요: KRX_API_KEY  (https://data.krx.co.kr 회원가입 > Open API > 인증키 신청)
// 인증은 요청 헤더 AUTH_KEY 로 전달한다.
//
// 이 API 는 '일별' 확정(EOD) 데이터를 제공한다(실시간 아님).
// 실시간 시세는 네이버(providers/naver.js), 공식 확정 종가/거래대금은 KRX 로 본다.
// 문서: https://data.krx.co.kr/contents/MDC/MAIN/main/index.cmd (Open API)

import { fetchJson, FetchError } from "../lib/fetcher.js";
import { KEYS } from "../config.js";
import { ok, apiRequired, noData, blocked, errored } from "../lib/respond.js";

const SOURCE = "KRX (한국거래소 공식, 일별 확정)";
const BASE = "https://data-dbg.krx.co.kr/svc/apis";

// 시장별 일별매매정보 엔드포인트
const MARKET_PATH = {
  KOSPI: "/sto/stk_bydd_trd",
  KOSDAQ: "/sto/ksq_bydd_trd",
};

function num(v) {
  if (v == null) return null;
  const c = String(v).replace(/,/g, "").trim();
  if (c === "" || c === "-") return null;
  const n = Number(c);
  return Number.isFinite(n) ? n : null;
}

/** 최근 영업일 추정 (주말이면 직전 금요일). 공휴일은 빈 응답으로 처리됨. */
function recentBusinessDay() {
  const d = new Date();
  const day = d.getDay(); // 0 일, 6 토
  if (day === 0) d.setDate(d.getDate() - 2);
  else if (day === 6) d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
}

/**
 * 시장 일별매매정보 조회 (선택적으로 6자리 종목코드 필터).
 * @param {object} p
 * @param {"KOSPI"|"KOSDAQ"} [p.market="KOSPI"]
 * @param {string} [p.basDd]   기준일 YYYYMMDD (미지정 시 최근 영업일)
 * @param {string} [p.code]    6자리 종목코드 필터 (예: 005930)
 */
export async function dailyTrade({ market = "KOSPI", basDd, code } = {}) {
  if (!KEYS.KRX) {
    return apiRequired(
      "KRX 공식 일별 시세는 KRX_API_KEY 가 필요합니다. .env 에 설정하세요. " +
        "무료 발급: https://data.krx.co.kr (Open API > 인증키 신청). " +
        "실시간 시세는 키 없이 네이버 소스(/api/korea/quote)로 제공됩니다."
    );
  }
  const m = MARKET_PATH[market] ? market : "KOSPI";
  const day = basDd || recentBusinessDay();
  try {
    const json = await fetchJson(`${BASE}${MARKET_PATH[m]}?basDd=${day}`, {
      headers: { AUTH_KEY: KEYS.KRX },
    });
    let rows = json?.OutBlock_1 || [];
    if (!Array.isArray(rows) || rows.length === 0) {
      return noData(SOURCE, `${day} (${m}) 확정 데이터가 없습니다. (휴장일이거나 아직 미게시)`);
    }
    if (code) {
      rows = rows.filter((r) => String(r.ISU_CD || "").includes(code) || r.ISU_NM === code);
      if (rows.length === 0) return noData(SOURCE, `종목코드 '${code}' 데이터를 찾지 못했습니다.`);
    }
    const out = rows.slice(0, code ? rows.length : 50).map((r) => ({
      isuCd: r.ISU_CD,
      name: r.ISU_NM,
      close: num(r.TDD_CLSPRC),
      open: num(r.TDD_OPNPRC),
      high: num(r.TDD_HGPRC),
      low: num(r.TDD_LWPRC),
      change: num(r.CMPPREVDD_PRC),
      changePct: num(r.FLUC_RT),
      volume: num(r.ACC_TRDVOL),
      tradeValue: num(r.ACC_TRDVAL),
      marketCap: num(r.MKTCAP),
    }));
    return ok({ market: m, baseDate: day, count: out.length, items: out }, SOURCE);
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked") {
      return blocked(SOURCE, err.message);
    }
    return errored(SOURCE, err?.message || "조회 실패");
  }
}
