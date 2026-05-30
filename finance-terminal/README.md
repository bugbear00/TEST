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

이 프로젝트는 Vercel 서버리스 구조 (`api/[...slug].ts`)로 작성. Vercel 런타임은 외부 네트워크 제한이 없어 실데이터가 흐릅니다.

### 권장: 방법 A — Vercel UI 일회 연결 (2분, 이후 push마다 자동)

1. https://vercel.com/new → GitHub 저장소 `bugbear00/test` 임포트
2. **Root Directory** = `finance-terminal` *(필수)*
3. Framework Preset = **Other**
4. (선택) Environment Variables 에 키 등록
5. Deploy

이후 이 저장소에 push할 때마다 Vercel이 자동으로 배포합니다. **GitHub Actions 불필요.**

### 방법 B — GitHub Actions 자동 배포 (커스터마이즈 원할 때)

저장소 루트의 `.github/workflows/vercel-deploy.yml` 워크플로가 push마다 배포합니다.
한 번만 시크릿 3개를 GitHub 저장소에 등록:

| Secret | 값 | 발급 |
|---|---|---|
| `VERCEL_TOKEN` | API 토큰 | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | 팀/계정 ID | 로컬에서 `cd finance-terminal && npx vercel link` → `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | 프로젝트 ID | 같은 파일 |

등록: GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret.

### 방법 C — 로컬 CLI (직접 배포)

```bash
cd finance-terminal
npx vercel login          # 최초 1회 (브라우저)
npx vercel --prod
```

### 환경변수 (선택, Vercel Project Settings에 등록)

| 변수 | 효과 |
|---|---|
| `SEC_USER_AGENT` | 미국 SEC 공시 안정화 (예: `"Hong gildong hong@example.com"`) |
| `FRED_API_KEY` | 정확한 미국 금리 데이터 |
| `DART_API_KEY` | 한국 전자공시 활성화 |
| `FINNHUB_API_KEY` | 정형 실적 데이터 |

키가 없어도 시세·차트·뉴스·SEC 공시는 정상 동작합니다.

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
