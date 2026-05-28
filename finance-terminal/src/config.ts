/** 환경설정 및 공급자(provider) 가용성 플래그 */

// .env 파일이 있으면 로드 (Node 20.12+ / 22+ 내장 기능, 없으면 무시)
try {
  // @ts-ignore - loadEnvFile 는 일부 타입 정의에 없음
  if (typeof process.loadEnvFile === 'function') process.loadEnvFile();
} catch {
  /* .env 없음 - 무시 */
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== '' ? v.trim() : undefined;
}

export const config = {
  port: Number(env('PORT') ?? 3100),

  // SEC 는 키가 필요 없지만 정책상 식별 가능한 User-Agent 를 요구한다.
  secUserAgent:
    env('SEC_USER_AGENT') ??
    'korean-finance-terminal (contact: set SEC_USER_AGENT env)',

  // 키가 필요한 공급자
  fredApiKey: env('FRED_API_KEY'), // 미국 금리/거시지표
  dartApiKey: env('DART_API_KEY'), // 한국 전자공시(DART)
  finnhubApiKey: env('FINNHUB_API_KEY'), // 미국 실적/뉴스 보강

  // 외부 요청 타임아웃 (ms)
  fetchTimeoutMs: Number(env('FETCH_TIMEOUT_MS') ?? 8000),
  // 캐시 TTL (초)
  cacheTtlSeconds: Number(env('CACHE_TTL_SECONDS') ?? 20),
} as const;

export interface ProviderStatus {
  id: string;
  label: string;
  /** 키 없이도 실데이터 제공 가능한가 */
  keyless: boolean;
  /** 현재 사용 가능한가 */
  available: boolean;
  /** 필요한 환경변수 이름 (있으면) */
  requiresKey?: string;
  note: string;
}

export function providerStatuses(): ProviderStatus[] {
  return [
    {
      id: 'yahoo',
      label: '미국·한국 주식 / ETF / 지수 / 환율 / 원자재 (Yahoo Finance)',
      keyless: true,
      available: true,
      note: '무료 공개 데이터. 일부 종목은 15분 지연될 수 있음. 비로그인 사용자도 이용 가능.',
    },
    {
      id: 'sec',
      label: '미국 SEC 공시 (EDGAR)',
      keyless: true,
      available: true,
      note: 'API 키 불필요. 식별용 SEC_USER_AGENT(이메일 포함) 설정 권장.',
    },
    {
      id: 'fred',
      label: '미국 금리·거시지표 (FRED)',
      keyless: false,
      available: !!config.fredApiKey,
      requiresKey: 'FRED_API_KEY',
      note: 'FRED 무료 API 키 필요. 미설정 시 국채금리 등은 Yahoo 대체값으로 표기.',
    },
    {
      id: 'dart',
      label: '한국 전자공시 (DART)',
      keyless: false,
      available: !!config.dartApiKey,
      requiresKey: 'DART_API_KEY',
      note: 'OpenDART 무료 API 키 필요. 미설정 시 "API 키 필요"로 표시.',
    },
    {
      id: 'finnhub',
      label: '실적 캘린더 / 뉴스 보강 (Finnhub)',
      keyless: false,
      available: !!config.finnhubApiKey,
      requiresKey: 'FINNHUB_API_KEY',
      note: 'Finnhub 무료 API 키 필요(선택). 미설정 시 Yahoo 기반 대체.',
    },
  ];
}
