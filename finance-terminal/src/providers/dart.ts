import { getJson, HttpError, NetworkError } from '../http.js';
import { config } from '../config.js';
import { cached } from '../cache.js';
import type { ApiResult, Filing, Meta } from '../types.js';

const SOURCE = 'DART (금융감독원 전자공시)';

function errMeta(e: unknown): Meta {
  if (e instanceof HttpError) return { status: 'error', source: SOURCE, asOf: null, note: `DART 응답 오류 (HTTP ${e.status}).` };
  if (e instanceof NetworkError) return { status: 'error', source: SOURCE, asOf: null, note: `DART 연결 실패: ${e.message}` };
  return { status: 'error', source: SOURCE, asOf: null, note: '알 수 없는 오류' };
}

function apiRequired(): ApiResult<Filing[]> {
  return {
    meta: {
      status: 'api_required',
      source: SOURCE,
      asOf: null,
      requiresKey: 'DART_API_KEY',
      note: '한국 전자공시(DART)를 보려면 OpenDART 무료 API 키가 필요합니다. https://opendart.fss.or.kr 에서 발급 후 DART_API_KEY 환경변수에 설정하세요.',
    },
    data: null,
  };
}

function yyyymmdd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * 최근 공시 목록 조회.
 * corpCode(8자리 고유번호)가 있으면 해당 회사, 없으면 전체 최신 공시.
 */
export async function getDisclosures(corpCode?: string): Promise<ApiResult<Filing[]>> {
  if (!config.dartApiKey) return apiRequired();
  const key = corpCode ? `dart:${corpCode}` : 'dart:all';
  return cached(
    key,
    180,
    async () => {
      try {
        const end = new Date();
        const start = new Date(end.getTime() - 30 * 24 * 3600 * 1000);
        const params = new URLSearchParams({
          crtfc_key: config.dartApiKey!,
          bgn_de: yyyymmdd(start),
          end_de: yyyymmdd(end),
          page_no: '1',
          page_count: '30',
        });
        if (corpCode) params.set('corp_code', corpCode);
        const json = await getJson<any>(`https://opendart.fss.or.kr/api/list.json?${params.toString()}`);
        if (json.status !== '000') {
          // 013: 데이터 없음
          if (json.status === '013') {
            return { meta: { status: 'no_data', source: SOURCE, asOf: new Date().toISOString(), note: '해당 기간 공시가 없습니다.' }, data: [] };
          }
          return { meta: { status: 'error', source: SOURCE, asOf: null, note: `DART 오류: ${json.message ?? json.status}` }, data: null };
        }
        const filings: Filing[] = (json.list ?? []).map((it: any) => ({
          form: it.report_nm,
          title: `${it.corp_name} · ${it.report_nm}`,
          filedAt: it.rcept_dt ? `${it.rcept_dt.slice(0, 4)}-${it.rcept_dt.slice(4, 6)}-${it.rcept_dt.slice(6, 8)}` : null,
          accessionNumber: it.rcept_no,
          link: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${it.rcept_no}`,
        }));
        return {
          meta: { status: 'live', source: SOURCE, asOf: new Date().toISOString(), note: '한국 금융감독원 공식 전자공시.' },
          data: filings,
        };
      } catch (e) {
        return { meta: errMeta(e), data: null };
      }
    },
    (r) => r.data != null && r.data.length > 0,
  );
}
