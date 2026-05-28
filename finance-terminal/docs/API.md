# API 키 발급 및 설정 가이드

이 터미널은 **키 없이도** 시장 개요·시세·차트·뉴스·미국 SEC 공시를 실데이터로 보여줍니다(Yahoo Finance, SEC EDGAR 사용). 아래 키는 정확도/추가 기능을 위한 **선택 사항**입니다. 설정하지 않은 기능은 화면에 `API 키 필요`로 명확히 표시됩니다.

키는 `.env` 파일(또는 배포 환경의 환경변수)에 넣습니다.

```bash
cp .env.example .env
# 편집기로 .env 를 열어 값 입력
```

---

## 1. SEC_USER_AGENT (키 아님, 강력 권장)

- **용도**: 미국 SEC EDGAR 공시 조회.
- **왜 필요한가**: SEC는 API 키 대신 *식별 가능한 User-Agent*(이름 + 이메일)를 요구합니다. 없으면 `403`이 발생할 수 있습니다.
- **설정**:
  ```
  SEC_USER_AGENT="Hong Gildong hong@example.com"
  ```
- 비용: 무료. 발급 절차 없음.
- 요청 한도: 초당 10건 권장. (본 앱은 캐시로 호출을 줄입니다.)

## 2. FRED_API_KEY (미국 금리/거시)

- **용도**: 미국 국채금리(2/10/30년), 연방기금금리, 장단기 금리차 등 공식 데이터.
- **발급**:
  1. https://fred.stlouisfed.org 회원가입
  2. https://fredaccount.stlouisfed.org/apikeys 에서 API Key 발급(무료)
  3. `.env`에 `FRED_API_KEY=...`
- **미설정 시**: Yahoo의 국채수익률 지수(^IRX, ^FVX, ^TNX, ^TYX)로 **대체**하여 표기하고, 출처를 "Yahoo Finance (대체)"로 명시합니다.

## 3. DART_API_KEY (한국 전자공시)

- **용도**: 한국 상장사 전자공시(사업보고서, 주요사항보고 등).
- **발급**:
  1. https://opendart.fss.or.kr 접속 → 인증키 신청/관리
  2. 이메일 인증 후 API 인증키 발급(무료, 일 20,000건 한도)
  3. `.env`에 `DART_API_KEY=...`
- **미설정 시**: DART 패널은 `API 키 필요`로 표시됩니다.
- 특정 회사 조회는 8자리 `corp_code`가 필요합니다. (예: 삼성전자 `00126380`) — `/api/dart?corp=00126380`

## 4. FINNHUB_API_KEY (실적/뉴스 보강, 선택)

- **용도**: 정형화된 EPS 실제/추정 등 실적 데이터.
- **발급**: https://finnhub.io 가입 → 무료 API 키.
- **미설정 시**: Yahoo `quoteSummary`의 실적 데이터로 대체하며, 정형 실적표는 `API 키 필요`로 안내합니다.

---

## 데이터 지연/정확도에 대한 안내

- Yahoo Finance 공개 엔드포인트는 **비공식**입니다. 무료인 대신 가용성과 실시간성이 보장되지 않으며, 종목/거래소에 따라 **최대 15분 지연**될 수 있습니다. 앱은 이를 `지연` 배지로 표시합니다.
- 상용 서비스로 운영하려면 정식 라이선스가 있는 데이터 벤더(예: Polygon.io, IEX Cloud, Finnhub 유료, Refinitiv 등) 연동을 권장합니다. `src/providers/` 아래에 같은 인터페이스(`ApiResult<T>`)로 공급자를 추가하면 됩니다.

## 새 데이터 공급자 추가 방법(개발자)

1. `src/providers/<name>.ts` 생성.
2. 함수가 `Promise<ApiResult<T>>`를 반환하도록 구현 — `meta.status`로 `live | delayed | no_data | api_required | error`를 정확히 설정.
3. 키가 필요하면 `src/config.ts`의 `providerStatuses()`에 항목 추가.
4. `src/server.ts`의 라우팅에 연결.
