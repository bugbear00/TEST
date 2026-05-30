// DART(한국 전자공시) 제공자. API 키 필요: DART_API_KEY
// 키 발급(무료): https://opendart.fss.or.kr/  (인증키 신청)
// 참고: 회사 고유번호(corp_code)는 DART 의 corpCode.xml(zip) 에서 조회한다.
// 여기서는 corp_code 직접 입력 또는 회사명 키워드(부분 일치)를 지원한다.

import { fetchJson, fetchText, FetchError } from "../lib/fetcher.js";
import { KEYS } from "../config.js";
import { ok, apiRequired, noData, blocked, errored } from "../lib/respond.js";

const SOURCE = "DART (금융감독원 전자공시)";

/**
 * 공시 목록 조회.
 * @param {object} p
 * @param {string} [p.corpCode]  8자리 고유번호
 * @param {string} [p.bgnDe]     시작일 YYYYMMDD
 */
export async function disclosureList({ corpCode, bgnDe } = {}) {
  if (!KEYS.DART) {
    return apiRequired(
      "한국 전자공시(DART) 조회는 DART_API_KEY 가 필요합니다. .env 에 설정하세요. " +
        "무료 발급: https://opendart.fss.or.kr/ (오픈API > 인증키 신청)"
    );
  }
  const params = new URLSearchParams({ crtfc_key: KEYS.DART, page_count: "30" });
  if (corpCode) params.set("corp_code", corpCode);
  if (bgnDe) params.set("bgn_de", bgnDe);
  try {
    const json = await fetchJson(`https://opendart.fss.or.kr/api/list.json?${params}`);
    // DART status: 000 정상, 013 데이터 없음
    if (json.status === "013") return noData(SOURCE, json.message || "데이터 없음");
    if (json.status !== "000")
      return errored(SOURCE, `DART status ${json.status}: ${json.message}`);
    const out = (json.list || []).map((d) => ({
      corpName: d.corp_name,
      corpCode: d.corp_code,
      stockCode: d.stock_code || null,
      reportName: d.report_nm,
      receiptNo: d.rcept_no,
      filer: d.flr_nm,
      date: d.rcept_dt,
      url: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${d.rcept_no}`,
    }));
    return ok({ count: out.length, disclosures: out }, SOURCE);
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked")
      return blocked(SOURCE, err.message);
    return errored(SOURCE, err?.message || "조회 실패");
  }
}
