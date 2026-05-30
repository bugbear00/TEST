// 표준 응답 봉투(envelope). 모든 /api 응답은 이 형식을 따른다.
// 절대 가짜 숫자를 만들지 않는다. 데이터가 없으면 data=null 로 두고
// status 로 사유를 명확히 전달한다.

/**
 * status 값 의미
 *  - ok          : 실시간 또는 정상 데이터
 *  - delayed     : 지연된 실제 데이터 (예: Stooq 무료 시세)
 *  - no_data     : 소스에 해당 데이터가 없음
 *  - api_required: 이 기능은 별도 API 키가 필요함 (.env 미설정)
 *  - blocked     : 네트워크 정책(allowlist)으로 외부 접속이 차단됨
 *  - error       : 소스 호출 중 오류 발생
 */
export const STATUS = {
  OK: "ok",
  DELAYED: "delayed",
  NO_DATA: "no_data",
  API_REQUIRED: "api_required",
  BLOCKED: "blocked",
  ERROR: "error",
};

const LABEL = {
  ok: "실시간",
  delayed: "지연 데이터",
  no_data: "데이터 없음",
  api_required: "API 필요",
  blocked: "접속 차단",
  error: "오류",
};

/**
 * 표준 응답 객체를 만든다.
 * @param {object} opts
 * @param {string} opts.status   STATUS 중 하나
 * @param {*}      [opts.data]   실제 데이터 (없으면 null)
 * @param {string} [opts.source] 데이터 출처 표기 (예: "Stooq (지연)")
 * @param {string} [opts.asOf]   기준 시각 ISO 문자열
 * @param {string} [opts.note]   사람이 읽을 수 있는 부가 설명
 */
export function envelope({ status, data = null, source = null, asOf = null, note = null }) {
  return {
    status,
    statusLabel: LABEL[status] || status,
    source,
    asOf: asOf || new Date().toISOString(),
    note,
    data,
  };
}

export const ok = (data, source, extra = {}) =>
  envelope({ status: STATUS.OK, data, source, ...extra });
export const delayed = (data, source, extra = {}) =>
  envelope({ status: STATUS.DELAYED, data, source, ...extra });
export const noData = (source, note) =>
  envelope({ status: STATUS.NO_DATA, source, note });
export const apiRequired = (note) =>
  envelope({ status: STATUS.API_REQUIRED, note });
export const blocked = (source, note) =>
  envelope({ status: STATUS.BLOCKED, source, note });
export const errored = (source, note) =>
  envelope({ status: STATUS.ERROR, source, note });
