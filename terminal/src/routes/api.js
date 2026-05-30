// /api 라우터. 각 엔드포인트는 표준 응답 봉투를 반환한다.
import { Router } from "express";
import * as stooq from "../providers/stooq.js";
import * as naver from "../providers/naver.js";
import * as krx from "../providers/krx.js";
import * as sec from "../providers/sec.js";
import * as fred from "../providers/fred.js";
import * as finnhub from "../providers/finnhub.js";
import * as marketnews from "../providers/marketnews.js";
import * as dart from "../providers/dart.js";
import * as options from "../providers/options.js";
import {
  DEFAULT_INDICES,
  DEFAULT_COMMODITIES,
  DEFAULT_FOREX,
  DEFAULT_KR_INDICES,
  KEYS,
} from "../config.js";
import { ok } from "../lib/respond.js";

export const api = Router();

// --- 일반 시장 대시보드 (비로그인 사용자도 실제 데이터로 볼 수 있음) ---

api.get("/indices", async (_req, res) => {
  const r = await stooq.quotes(DEFAULT_INDICES.map((i) => i.symbol));
  attachNames(r, DEFAULT_INDICES);
  res.json(r);
});

api.get("/commodities", async (_req, res) => {
  const r = await stooq.quotes(DEFAULT_COMMODITIES.map((i) => i.symbol));
  attachNames(r, DEFAULT_COMMODITIES);
  res.json(r);
});

api.get("/forex", async (_req, res) => {
  const r = await stooq.quotes(DEFAULT_FOREX.map((i) => i.symbol));
  attachNames(r, DEFAULT_FOREX);
  res.json(r);
});

api.get("/rates", async (_req, res) => {
  res.json(await fred.rates());
});

// --- 미국 주식 / ETF ---

// /api/quote?symbols=AAPL,MSFT,SPY  (ETF 도 동일 처리)
api.get("/quote", async (req, res) => {
  const raw = String(req.query.symbols || req.query.symbol || "");
  const symbols = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => stooq.usSymbol(s));
  res.json(await stooq.quotes(symbols));
});

// /api/history?symbol=AAPL
api.get("/history", async (req, res) => {
  const sym = stooq.usSymbol(String(req.query.symbol || ""));
  res.json(await stooq.history(sym));
});

// --- SEC 공시 / 실적 / 뉴스 / 옵션 ---

api.get("/sec/filings", async (req, res) => {
  res.json(await sec.filingsByTicker(String(req.query.ticker || "")));
});

api.get("/sec/search", async (req, res) => {
  res.json(await sec.fullTextSearch(String(req.query.q || "")));
});

// 뉴스: Finnhub 키가 있으면 우선, 없거나 실패하면 키 불필요 RSS 로 폴백.
api.get("/news", async (req, res) => {
  const ticker = String(req.query.ticker || "");
  const primary = await finnhub.companyNews(ticker);
  if (primary.status === "ok") return res.json(primary);
  const rss = await marketnews.rssNews(ticker);
  if (rss.status === "ok" || rss.status === "delayed") return res.json(rss);
  // 둘 다 데이터 없음/차단 → Finnhub 가 api_required 였다면 RSS 사유가 더 유용
  res.json(primary.status === "api_required" ? rss : primary);
});

api.get("/earnings", async (req, res) => {
  res.json(await finnhub.earningsCalendar(String(req.query.ticker || "")));
});

api.get("/options", async (req, res) => {
  res.json(await options.optionChain(String(req.query.ticker || "")));
});

// --- 한국 주식 / DART ---

// /api/korea/quote?code=005930
// 1차: 네이버 금융(KRX 근실시간, 정확). 2차: Stooq(지연) 폴백.
api.get("/korea/quote", async (req, res) => {
  const code = String(req.query.code || "").trim();
  const primary = await naver.quote(code);
  if (primary.status === "ok" || primary.status === "delayed") {
    return res.json(primary);
  }
  // 네이버 실패/차단 시 Stooq 로 폴백 시도
  const fallback = await stooq.quotes([`${code}.kr`]);
  const fbHasData = fallback.data?.some?.((d) => d.available);
  if (fbHasData) {
    fallback.note =
      (fallback.note ? fallback.note + " " : "") +
      "네이버 응답 실패로 Stooq(지연) 데이터로 대체했습니다.";
    return res.json(fallback);
  }
  // 둘 다 실패 → 더 의미있는 1차 응답(차단/사유)을 반환
  res.json(primary);
});

// 한국 주요 지수 (코스피/코스닥/코스피200) - 네이버 근실시간
api.get("/korea/indices", async (_req, res) => {
  res.json(await naver.indices(DEFAULT_KR_INDICES));
});

// KRX 공식 일별 확정 시세 (선택적 종목 필터)
// /api/korea/krx?market=KOSPI&code=005930&basDd=20240105
api.get("/korea/krx", async (req, res) => {
  res.json(
    await krx.dailyTrade({
      market: req.query.market ? String(req.query.market).toUpperCase() : undefined,
      basDd: req.query.basDd ? String(req.query.basDd) : undefined,
      code: req.query.code ? String(req.query.code) : undefined,
    })
  );
});

api.get("/korea/dart", async (req, res) => {
  res.json(
    await dart.disclosureList({
      corpCode: req.query.corp_code ? String(req.query.corp_code) : undefined,
      bgnDe: req.query.bgn_de ? String(req.query.bgn_de) : undefined,
    })
  );
});

// --- 소스/키 상태 (어떤 API 키가 설정됐는지 한눈에) ---

api.get("/sources", (_req, res) => {
  res.json(
    ok(
      {
        noKeyRequired: [
          { name: "Stooq", use: "미국/글로벌 시세·지수·원자재·환율(지연)", status: "사용 가능" },
          { name: "SEC EDGAR", use: "미국 공시(10-K/10-Q/8-K)", status: "사용 가능 (User-Agent 권장)" },
          { name: "네이버 금융", use: "한국 주식·지수(KOSPI/KOSDAQ) 근실시간", status: "사용 가능" },
          { name: "Yahoo Finance RSS", use: "종목 뉴스(키 없을 때 폴백)", status: "사용 가능" },
        ],
        keyRequired: [
          { name: "FRED", env: "FRED_API_KEY", use: "미국 금리/국채 수익률", configured: !!KEYS.FRED },
          { name: "Finnhub", env: "FINNHUB_API_KEY", use: "종목 뉴스(고품질)·실적 캘린더", configured: !!KEYS.FINNHUB },
          { name: "DART", env: "DART_API_KEY", use: "한국 전자공시", configured: !!KEYS.DART },
          { name: "KRX", env: "KRX_API_KEY", use: "한국거래소 공식 일별 확정 시세", configured: !!KEYS.KRX },
          { name: "Polygon", env: "POLYGON_API_KEY", use: "옵션 체인(선택)", configured: !!KEYS.POLYGON },
          { name: "Alpha Vantage", env: "ALPHAVANTAGE_API_KEY", use: "보조 시세(선택)", configured: !!KEYS.ALPHAVANTAGE },
        ],
      },
      "내부 설정"
    )
  );
});

api.get("/health", (_req, res) => res.json(ok({ up: true }, "self")));

// 응답 data 배열에 사람이 읽을 이름을 붙인다.
function attachNames(envelopeObj, defs) {
  if (!envelopeObj?.data || !Array.isArray(envelopeObj.data)) return;
  envelopeObj.data.forEach((row, i) => {
    if (defs[i] && (!row.name || row.name === null)) row.name = defs[i].name;
    if (defs[i]) row.displayName = defs[i].name;
  });
}
