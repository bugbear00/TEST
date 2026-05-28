/**
 * 모든 데이터 포인트는 출처와 신뢰 상태를 함께 전달한다.
 * "데이터 없음 / API 필요 / 지연" 등을 절대 가짜 숫자로 채우지 않고 명시한다.
 */

export type DataStatus =
  | 'live' // 실시간
  | 'delayed' // 지연 데이터
  | 'no_data' // 데이터 없음
  | 'api_required' // API 키 필요
  | 'error'; // 오류

export interface Meta {
  status: DataStatus;
  /** 데이터 출처 (예: "Yahoo Finance", "SEC EDGAR") */
  source: string;
  /** 데이터 기준 시각 (ISO 8601). 알 수 없으면 null */
  asOf: string | null;
  /** 지연 분 단위 (delayed 상태일 때) */
  delayMinutes?: number;
  /** 사용자에게 보여줄 한국어 설명 */
  note?: string;
  /** api_required 상태일 때, 필요한 환경변수 이름 */
  requiresKey?: string;
}

export interface ApiResult<T> {
  meta: Meta;
  data: T | null;
}

export interface Quote {
  symbol: string;
  name: string | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string | null;
  /** PRE / REGULAR / POST / CLOSED 등 */
  marketState: string | null;
  previousClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  exchange: string | null;
  marketTime: string | null;
}

export interface ChartPoint {
  t: number; // unix seconds
  close: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  volume?: number | null;
}

export interface ChartSeries {
  symbol: string;
  currency: string | null;
  range: string;
  interval: string;
  points: ChartPoint[];
}

export interface NewsItem {
  title: string;
  publisher: string | null;
  link: string;
  publishedAt: string | null;
  relatedTickers?: string[];
}

export interface Filing {
  form: string; // 10-K, 10-Q, 8-K 등
  title: string;
  filedAt: string | null;
  link: string;
  accessionNumber?: string;
}

export interface OptionContract {
  contractSymbol: string;
  strike: number;
  lastPrice: number | null;
  bid: number | null;
  ask: number | null;
  volume: number | null;
  openInterest: number | null;
  impliedVolatility: number | null;
  inTheMoney: boolean;
}

export interface OptionChain {
  symbol: string;
  expiration: string | null;
  expirationDates: string[];
  underlyingPrice: number | null;
  calls: OptionContract[];
  puts: OptionContract[];
}

export interface EarningsRow {
  date: string | null;
  epsActual: number | null;
  epsEstimate: number | null;
  revenueActual: number | null;
  revenueEstimate: number | null;
}

export interface RateRow {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  asOf: string | null;
}
