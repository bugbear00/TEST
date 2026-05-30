# 한국어 금융 터미널 (Korean Finance Terminal)

미국 주식 투자자를 위한 **한국어 기반 금융 터미널**입니다. 미국 주식·ETF·지수·금리·원자재·환율을 중심으로, 미국 뉴스/SEC 공시/옵션/실적과 한국 주식/DART 공시까지 한 화면에서 봅니다.

## 핵심 원칙 — 가짜 숫자 금지

데이터가 없거나 키가 필요할 때 **임의의 숫자로 채우지 않습니다.** 모든 데이터 포인트는 상태 배지로 신뢰도를 표시합니다.

| 배지 | 의미 |
| --- | --- |
| `실시간` | 실시간 데이터 |
| `지연 N분` | N분 지연 데이터 (무료 공개 데이터) |
| `데이터 없음` | 해당 항목 데이터 없음 |
| `API 키 필요` | 환경변수에 API 키를 넣어야 사용 가능 |
| `오류` | 외부 데이터 제공처 연결/응답 오류 |

비로그인(키 없음) 상태에서도 **Yahoo Finance·SEC EDGAR 기반 실데이터**로 시장 개요·시세·차트·뉴스·미국 공시를 볼 수 있습니다. (로그인/회원 기능은 별도이며, 기본 시장 정보는 누구나 실데이터로 열람 가능합니다.)

## 빠른 시작 (로컬)

```bash
cd finance-terminal
npm install
cp .env.example .env   # (선택) 키 설정
npm start              # tsx 로 실행
```

브라우저에서 http://localhost:3100 접속.

## Vercel 배포 (실데이터 확인용)

이 프로젝트는 Vercel 서버리스 구조로 작성되어 있습니다 (`api/[...slug].ts`가 모든 `/api/*` 요청을 처리).
Vercel 런타임은 외부 네트워크 제한이 없어 실제 시세·뉴스·SEC 데이터를 가져올 수 있습니다.

### 방법 1 — Vercel 대시보드 (한 번 설정)

1. https://vercel.com/new 에서 GitHub 저장소 `bugbear00/test` 임포트.
2. **Root Directory** 를 `finance-terminal` 으로 설정 (중요 — 저장소가 모노리포 구조).
3. Framework Preset: **Other** (자동 감지됨).
4. (선택) Environment Variables에 `SEC_USER_AGENT`, `FRED_API_KEY`, `DART_API_KEY`, `FINNHUB_API_KEY` 입력.
5. Deploy.

### 방법 2 — CLI

```bash
cd finance-terminal
npx vercel login          # 최초 1회
npx vercel --prod         # 배포
```

### 환경변수

배포 후 Vercel 프로젝트 → Settings → Environment Variables 에서 `.env.example` 의 키들을 등록하면 해당 기능이 활성화됩니다.
키가 없어도 시장 시세·차트·뉴스·SEC 공시는 정상 동작합니다.

## 데이터 소스 / 필요한 API 키

| 영역 | 소스 | 키 필요 | 환경변수 | 비고 |
| --- | --- | --- | --- | --- |
| 미국·한국 주식 / ETF / 지수 / 환율 / 원자재 / 암호화폐 시세·차트·검색·뉴스 | Yahoo Finance (공개) | ❌ | — | 무료, 일부 15분 지연 가능 |
| 미국 SEC 공시 | SEC EDGAR | ❌ | `SEC_USER_AGENT` (권장) | 키 불필요. 식별용 User-Agent 권장(미설정 시 403 가능) |
| 미국 금리/거시 | FRED | ✅ | `FRED_API_KEY` | 미설정 시 Yahoo 국채수익률 지수로 대체 표기 |
| 한국 전자공시 | OpenDART | ✅ | `DART_API_KEY` | 미설정 시 "API 키 필요" 표시 |
| 실적(EPS) 정형 데이터 | Finnhub | ✅ | `FINNHUB_API_KEY` | 선택. 미설정 시 Yahoo quoteSummary 대체 |

키 발급 방법은 [`docs/API.md`](docs/API.md) 참고.

## 기능

- **시장 개요 대시보드**: 미국 지수(S&P500·나스닥·다우·러셀·VIX), 한국 지수(코스피·코스닥), 환율(USD/KRW·유로·엔·DXY), 원자재(금·은·WTI·브렌트·천연가스), 암호화폐(BTC·ETH)
- **종목 검색** → 상세(시세, 가격 차트(1일~5년), 뉴스, SEC 공시, 옵션 체인, 실적)
- **금리/거시** 패널 (FRED 또는 Yahoo 대체)
- **한국 공시(DART)** 패널
- **데이터 소스 상태** 패널: 어떤 API가 활성/필요한지 한눈에

미국·한국 종목 모두 Yahoo 티커 규칙을 따릅니다. 예) 애플 `AAPL`, 삼성전자 `005930.KS`, 코스닥 종목 `.KQ`, S&P500 `^GSPC`.

## API 엔드포인트 (서버)

| 경로 | 설명 |
| --- | --- |
| `GET /api/markets` | 대시보드용 그룹별 시세 |
| `GET /api/quote?symbols=AAPL,MSFT` | 시세(복수) |
| `GET /api/chart?symbol=AAPL&range=1mo&interval=1d` | 차트 |
| `GET /api/search?q=apple` | 종목/뉴스 검색 |
| `GET /api/news?symbol=AAPL` | 뉴스 |
| `GET /api/sec?symbol=AAPL` | 미국 SEC 공시 |
| `GET /api/options?symbol=AAPL` | 옵션 체인 |
| `GET /api/earnings?symbol=AAPL` | 실적(Yahoo) / `&provider=finnhub` |
| `GET /api/rates` | 금리/거시 |
| `GET /api/dart?corp=00126380` | 한국 공시(DART) |
| `GET /api/config` | 데이터 소스 상태 |

모든 응답은 `{ meta: { status, source, asOf, note, ... }, data }` 형식이며, `meta.status`로 신뢰 상태를 전달합니다.

## 주의

- 정보 제공용이며 투자 권유가 아닙니다.
- Yahoo Finance 공개 엔드포인트는 비공식이며 가용성/지연이 보장되지 않습니다. 상용 환경에서는 정식 데이터 벤더(Polygon, IEX, Finnhub 유료 등) 연동을 권장합니다.
- 네트워크가 차단된 환경(예: 일부 CI/샌드박스)에서는 시세가 `오류`로 표시됩니다. 이는 의도된 동작(가짜 데이터 미표시)입니다.
