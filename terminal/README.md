# US 터미널 — 미국주식 한국어 금융 터미널

미국주식 투자자를 위한 **한국어 기반 금융 터미널**입니다. 미국 주식·ETF·지수·금리·원자재·환율을 중심으로, **SEC 공시·실적·뉴스·옵션**과 **한국 주식·DART 공시**까지 한 화면에서 봅니다.

> **데이터 원칙:** 데이터가 없으면 **절대 가짜 숫자로 채우지 않습니다.** 모든 응답은
> `실시간 / 지연 데이터 / 데이터 없음 / API 필요 / 접속 차단` 중 하나의 상태 배지로 표시됩니다.
> 비로그인 사용자도 키가 필요 없는 소스(Stooq·SEC)로 **실제 시장 데이터**를 볼 수 있습니다.

---

## 빠른 시작 (로컬)

```bash
cd terminal
npm install
cp .env.example .env      # (선택) API 키 입력
npm start                 # http://localhost:3000
```

키를 하나도 넣지 않아도 **지수·환율·원자재(지연 시세)와 SEC 공시**는 바로 동작합니다.
키가 필요한 기능(금리·뉴스·실적·옵션·DART)은 화면에 "API 필요"로 정직하게 표시됩니다.

---

## 데이터 소스 & 필요한 API 키

| 기능 | 소스 | API 키 | 환경변수 | 발급 |
|------|------|--------|----------|------|
| 미국/글로벌 주식·ETF·지수·원자재·환율 (지연) | **Stooq** | 불필요 | — | — |
| 미국 공시 (10-K/10-Q/8-K) | **SEC EDGAR** | 불필요 (User-Agent 권장) | `CONTACT_USER_AGENT` | — |
| 미국 금리 / 국채 수익률 | **FRED** | 필요 | `FRED_API_KEY` | https://fredaccount.stlouisfed.org/apikeys |
| 종목 뉴스 · 실적 캘린더 | **Finnhub** | 필요 (무료 티어) | `FINNHUB_API_KEY` | https://finnhub.io/register |
| **한국 주식·지수 (KOSPI/KOSDAQ, 근실시간)** | **네이버 금융** | 불필요 | — | — |
| 종목 뉴스 (키 없을 때 폴백) | **Yahoo Finance RSS** | 불필요 | — | — |
| 한국 전자공시 | **DART** | 필요 | `DART_API_KEY` | https://opendart.fss.or.kr/ |
| 한국거래소 공식 일별 확정 시세 | **KRX Open API** | 필요 | `KRX_API_KEY` | https://data.krx.co.kr/ |
| 옵션 체인 (선택) | **Polygon.io** | 필요 | `POLYGON_API_KEY` | https://polygon.io/ |
| 보조 시세 (선택) | **Alpha Vantage** | 필요 | `ALPHAVANTAGE_API_KEY` | https://www.alphavantage.co/ |

> **한국 주식 시세:** 정확·근실시간 시세는 **네이버 금융**(KRX 데이터)을 1차 소스로 사용합니다
> (실시간 폴링 API → 모바일 기본정보 API 폴백). 네이버가 실패하면 **Stooq(지연)** 로 폴백하며,
> 둘 다 실패하면 가짜 값 대신 "데이터 없음/접속 차단"으로 표시합니다.
> KRX 공식 시장데이터(MDC)는 OTP 발급 후 폼 POST 가 필요해 서버 환경에서 불안정하여
> 1차 소스로 채택하지 않았습니다(원하면 연동 추가 가능).

---

## ⚠️ 네트워크 정책 (중요)

이 프로젝트는 외부 금융 API를 호출합니다. **Claude Code 웹 실행 환경**에서는 네트워크가
allowlist로 제한되어 `stooq.com`, `data.sec.gov`, `finnhub.io` 등이 **차단**될 수 있습니다.
그 경우 앱은 정상 동작하지만 데이터는 "접속 차단"으로 표시됩니다.

해결 방법:
1. **환경 네트워크 정책 변경** — 환경 생성 시 위 데이터 호스트를 allowlist에 추가
   (참고: https://code.claude.com/docs/en/claude-code-on-the-web).
2. **외부 호스팅에 배포** — Render/Railway/Fly/Docker 등 일반 서버에서는 제한이 없습니다(아래 배포 참고).

---

## 배포

### Vercel (권장)
이 프로젝트는 Vercel 서버리스에 맞게 구성돼 있습니다.
- 정적 프런트엔드(`public/`)는 Vercel CDN 이 서빙
- `api/[...path].js` 가 Express 앱을 서버리스 함수로 실행 (`/api/*`)

**대시보드로 배포**
1. https://vercel.com/new 에서 이 GitHub 저장소를 import
2. **Root Directory** 를 `terminal` 로 지정 (중요 — 앱이 하위 폴더에 있음)
3. Framework Preset: **Other** (빌드 명령 불필요, `npm install` 자동)
4. **Environment Variables** 에 필요한 키 입력 (`FRED_API_KEY`, `FINNHUB_API_KEY`, `DART_API_KEY`, `CONTACT_USER_AGENT` 등). 키 없이도 시세·공시·한국주식은 동작합니다.
5. Deploy → `https://<프로젝트>.vercel.app` 발급

**CLI 로 배포**
```bash
cd terminal
npm i -g vercel
vercel            # 최초 1회 프로젝트 연결 (Root Directory = ./ 로 두고 terminal 안에서 실행)
vercel --prod     # 운영 배포
```

> 참고: Vercel 같은 일반 호스팅에는 네트워크 allowlist 제한이 없어 모든 외부 데이터 소스가
> 정상 동작합니다.

### Render (대안, 무료 플랜)
저장소를 Render에 연결하면 `render.yaml` Blueprint로 자동 배포됩니다. 대시보드에서 위 환경변수를 입력하세요.

### Docker (어디서나)
```bash
cd terminal
docker build -t us-terminal .
docker run -p 3000:3000 --env-file .env us-terminal
```

### 그 외 (Railway / Fly.io / VPS)
Node 18+ 환경에서 `npm install && node src/server.js` 만으로 실행됩니다. `PORT` 환경변수를 따릅니다.

---

## API 엔드포인트

모든 응답은 표준 봉투 `{ status, statusLabel, source, asOf, note, data }` 형식입니다.

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/indices` | 주요 지수 (S&P500, 나스닥, 다우, VIX) |
| GET | `/api/forex` | 환율 / 달러인덱스 |
| GET | `/api/commodities` | 금·은·원유·천연가스·구리 |
| GET | `/api/rates` | 미국 국채 수익률 (FRED 키 필요) |
| GET | `/api/quote?symbols=AAPL,MSFT` | 미국 주식/ETF 시세 |
| GET | `/api/history?symbol=AAPL` | 일봉 히스토리 |
| GET | `/api/sec/filings?ticker=AAPL` | SEC 공시 목록 |
| GET | `/api/sec/search?q=...` | EDGAR 전문 검색 |
| GET | `/api/news?ticker=AAPL` | 종목 뉴스 (Finnhub 키) |
| GET | `/api/earnings?ticker=AAPL` | 실적 캘린더 (Finnhub 키) |
| GET | `/api/options?ticker=AAPL` | 옵션 체인 (Polygon 키) |
| GET | `/api/korea/quote?code=005930` | 한국 주식 시세 (네이버 1차, Stooq 폴백) |
| GET | `/api/korea/indices` | 코스피·코스닥·코스피200 (네이버 근실시간) |
| GET | `/api/korea/krx?market=KOSPI&code=005930` | KRX 공식 일별 확정 시세 (KRX 키) |
| GET | `/api/korea/dart?corp_code=...` | DART 공시 (DART 키) |
| GET | `/api/sources` | 소스/키 설정 상태 |
| GET | `/api/health` | 헬스체크 |

---

## 면책

본 서비스의 모든 데이터는 정보 제공 목적이며 투자 권유가 아닙니다. 무료 소스는 지연될 수 있고
정확성을 보장하지 않습니다. 투자 판단과 책임은 이용자 본인에게 있습니다.
