// SEC EDGAR 제공자 (API 키 불필요, 식별용 User-Agent 권장).
// 미국 기업 공시(10-K, 10-Q, 8-K 등)를 실제로 가져온다.
// 문서: https://www.sec.gov/edgar/sec-api-documentation

import { fetchJson, FetchError } from "../lib/fetcher.js";
import { delayed, ok, noData, blocked, errored } from "../lib/respond.js";

const SOURCE = "SEC EDGAR";
const TICKERS_URL = "https://www.sec.gov/files/company_tickers.json";

let tickerCache = null; // { AAPL: {cik_str, ticker, title}, ... }
let tickerCacheAt = 0;

async function loadTickerMap() {
  const now = Date.now();
  if (tickerCache && now - tickerCacheAt < 12 * 3600 * 1000) return tickerCache;
  const json = await fetchJson(TICKERS_URL);
  const map = {};
  for (const key of Object.keys(json)) {
    const row = json[key];
    if (row && row.ticker) map[row.ticker.toUpperCase()] = row;
  }
  tickerCache = map;
  tickerCacheAt = now;
  return map;
}

function pad10(cik) {
  return String(cik).padStart(10, "0");
}

/** 티커로 최근 공시 목록 조회 */
export async function filingsByTicker(ticker, limit = 25) {
  const t = (ticker || "").trim().toUpperCase();
  if (!t) return noData(SOURCE, "티커가 필요합니다.");
  try {
    const map = await loadTickerMap();
    const found = map[t];
    if (!found) return noData(SOURCE, `EDGAR 에서 티커 '${t}' 를 찾지 못했습니다.`);
    const cik = pad10(found.cik_str);
    const sub = await fetchJson(`https://data.sec.gov/submissions/CIK${cik}.json`);
    const recent = sub?.filings?.recent;
    if (!recent || !recent.form) return noData(SOURCE, "공시 데이터가 없습니다.");
    const out = [];
    const n = Math.min(limit, recent.form.length);
    for (let i = 0; i < n; i++) {
      const accNoDash = recent.accessionNumber[i].replace(/-/g, "");
      out.push({
        form: recent.form[i],
        filingDate: recent.filingDate[i],
        reportDate: recent.reportDate?.[i] || null,
        accessionNumber: recent.accessionNumber[i],
        primaryDocument: recent.primaryDocument?.[i] || null,
        url: recent.primaryDocument?.[i]
          ? `https://www.sec.gov/Archives/edgar/data/${found.cik_str}/${accNoDash}/${recent.primaryDocument[i]}`
          : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}`,
      });
    }
    return ok(
      { ticker: t, cik, companyName: sub.name || found.title, filings: out },
      SOURCE
    );
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked") {
      return blocked(SOURCE, err.message);
    }
    return errored(SOURCE, err?.message || "조회 실패");
  }
}

/** EDGAR 전문 검색 (full-text search) */
export async function fullTextSearch(q, limit = 20) {
  const query = (q || "").trim();
  if (!query) return noData(SOURCE, "검색어가 필요합니다.");
  try {
    const json = await fetchJson(
      `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(query)}`
    ).catch(async () =>
      // 공개 검색 엔드포인트 폴백
      fetchJson(`https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(query)}`)
    );
    const hits = json?.hits?.hits || [];
    if (hits.length === 0) return noData(SOURCE, "검색 결과가 없습니다.");
    const out = hits.slice(0, limit).map((h) => ({
      form: h._source?.file_type || h._source?.root_form || null,
      date: h._source?.file_date || null,
      display: h._source?.display_names?.join(", ") || null,
      id: h._id,
    }));
    return ok({ query, results: out }, SOURCE);
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked") {
      return blocked(SOURCE, err.message);
    }
    return errored(SOURCE, err?.message || "검색 실패");
  }
}
