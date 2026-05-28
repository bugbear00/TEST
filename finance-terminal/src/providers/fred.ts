import { getJson, HttpError, NetworkError } from '../http.js';
import { config } from '../config.js';
import { cached } from '../cache.js';
import type { ApiResult, Meta, RateRow } from '../types.js';
import { getQuotes } from './yahoo.js';

const SOURCE = 'FRED (미국 연준)';

// 대표 금리/거시 시리즈
const SERIES: { id: string; label: string; unit: string }[] = [
  { id: 'DGS2', label: '미국 국채 2년', unit: '%' },
  { id: 'DGS10', label: '미국 국채 10년', unit: '%' },
  { id: 'DGS30', label: '미국 국채 30년', unit: '%' },
  { id: 'FEDFUNDS', label: '연방기금금리(실효)', unit: '%' },
  { id: 'T10Y2Y', label: '장단기 금리차(10Y-2Y)', unit: '%p' },
];

function errMeta(e: unknown): Meta {
  if (e instanceof HttpError) return { status: 'error', source: SOURCE, asOf: null, note: `FRED 응답 오류 (HTTP ${e.status}).` };
  if (e instanceof NetworkError) return { status: 'error', source: SOURCE, asOf: null, note: `FRED 연결 실패: ${e.message}` };
  return { status: 'error', source: SOURCE, asOf: null, note: '알 수 없는 오류' };
}

/** Yahoo 국채 ETF/지수 기반 대체 금리 (FRED 키 없을 때) */
async function fallbackRatesFromYahoo(): Promise<ApiResult<RateRow[]>> {
  // ^TNX=10년물(×10), ^FVX=5년물, ^TYX=30년물, ^IRX=13주 단기물
  const map: { sym: string; label: string }[] = [
    { sym: '^IRX', label: '미국 13주 단기금리' },
    { sym: '^FVX', label: '미국 국채 5년' },
    { sym: '^TNX', label: '미국 국채 10년' },
    { sym: '^TYX', label: '미국 국채 30년' },
  ];
  const q = await getQuotes(map.map((m) => m.sym));
  if (!q.data || q.data.length === 0) {
    return {
      meta: {
        status: 'api_required',
        source: 'FRED',
        asOf: null,
        requiresKey: 'FRED_API_KEY',
        note:
          q.meta.status === 'error'
            ? `정확한 금리는 FRED API 키가 필요합니다. 대체 데이터(Yahoo)도 불러오지 못했습니다: ${q.meta.note ?? ''}`
            : '정확한 금리 데이터를 보려면 FRED API 키가 필요합니다. (대체 데이터 없음)',
      },
      data: null,
    };
  }
  const rows: RateRow[] = q.data.map((quote, i) => ({
    id: map[i].sym,
    label: map[i].label,
    value: quote.price, // ^TNX 등은 이미 %단위(수익률)로 표기됨
    unit: '%',
    asOf: quote.marketTime,
  }));
  return {
    meta: {
      status: q.meta.status === 'live' ? 'live' : 'delayed',
      source: 'Yahoo Finance (대체)',
      asOf: q.meta.asOf,
      delayMinutes: q.meta.delayMinutes,
      note: 'FRED API 키가 없어 Yahoo 국채 수익률 지수로 대체했습니다. 정확/공식 값은 FRED 키 설정 시 제공됩니다.',
    },
    data: rows,
  };
}

export async function getRates(): Promise<ApiResult<RateRow[]>> {
  if (!config.fredApiKey) {
    return fallbackRatesFromYahoo();
  }
  return cached(
    'fred:rates',
    600,
    async () => {
      try {
        const rows: RateRow[] = [];
        for (const s of SERIES) {
          const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${s.id}&api_key=${config.fredApiKey}&file_type=json&sort_order=desc&limit=1`;
          const json = await getJson<any>(url);
          const obs = json?.observations?.[0];
          const v = obs && obs.value !== '.' ? Number(obs.value) : null;
          rows.push({ id: s.id, label: s.label, value: Number.isFinite(v as number) ? v : null, unit: s.unit, asOf: obs?.date ?? null });
        }
        return {
          meta: { status: 'live', source: SOURCE, asOf: new Date().toISOString(), note: '미국 연준 공식 데이터.' },
          data: rows,
        };
      } catch (e) {
        return { meta: errMeta(e), data: null };
      }
    },
    (r) => r.data != null,
  );
}
