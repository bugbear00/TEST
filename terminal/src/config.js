// 환경 설정 및 심볼 매핑.
// API 키는 모두 환경변수에서 읽는다. 없으면 해당 기능은 api_required 로 응답.

export const KEYS = {
  FRED: process.env.FRED_API_KEY || null, // 금리 (미 국채 수익률 등)
  FINNHUB: process.env.FINNHUB_API_KEY || null, // 뉴스, 실적 캘린더
  DART: process.env.DART_API_KEY || null, // 한국 전자공시 (opendart.fss.or.kr)
  KRX: process.env.KRX_API_KEY || null, // KRX 공식 시장데이터 open API (data.krx.co.kr)
  POLYGON: process.env.POLYGON_API_KEY || null, // 옵션 체인(선택)
  ALPHAVANTAGE: process.env.ALPHAVANTAGE_API_KEY || null, // 보조 시세(선택)
};

// 한국 주요 지수 (네이버 실시간 폴링 코드)
export const DEFAULT_KR_INDICES = [
  { code: "KOSPI", name: "코스피" },
  { code: "KOSDAQ", name: "코스닥" },
  { code: "KPI200", name: "코스피200" },
];

// 비로그인 사용자도 볼 수 있는 "일반 시장" 기본 구성.
// 모두 키가 필요 없는 Stooq(지연) 로 제공된다.
export const DEFAULT_INDICES = [
  { symbol: "^spx", name: "S&P 500" },
  { symbol: "^ndq", name: "나스닥 종합" },
  { symbol: "^dji", name: "다우존스" },
  { symbol: "^vix", name: "VIX 변동성" },
];

export const DEFAULT_COMMODITIES = [
  { symbol: "gc.f", name: "금 (Gold, 선물)" },
  { symbol: "si.f", name: "은 (Silver, 선물)" },
  { symbol: "cl.f", name: "WTI 원유 (선물)" },
  { symbol: "ng.f", name: "천연가스 (선물)" },
  { symbol: "hg.f", name: "구리 (Copper, 선물)" },
];

export const DEFAULT_FOREX = [
  { symbol: "usdkrw", name: "USD/KRW (원/달러)" },
  { symbol: "eurusd", name: "EUR/USD" },
  { symbol: "usdjpy", name: "USD/JPY" },
  { symbol: "dx.f", name: "달러인덱스 (DXY)" },
];

// FRED 시리즈 (금리)
export const FRED_SERIES = [
  { id: "DFF", name: "미 연방기금금리 (실효)" },
  { id: "DGS3MO", name: "미 국채 3개월" },
  { id: "DGS2", name: "미 국채 2년" },
  { id: "DGS10", name: "미 국채 10년" },
  { id: "DGS30", name: "미 국채 30년" },
];

export const PORT = process.env.PORT || 3000;
