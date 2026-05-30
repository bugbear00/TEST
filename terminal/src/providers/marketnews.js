// 키가 필요 없는 뉴스 폴백 (RSS). 비로그인 사용자도 실제 뉴스를 볼 수 있게 한다.
// 종목 헤드라인 RSS(Yahoo Finance) 를 가져와 간단히 파싱한다. 외부 의존성 없음.
// Finnhub 키가 있으면 라우트에서 Finnhub 를 우선 사용하고, 없을 때 이 소스로 폴백한다.

import { fetchText, FetchError } from "../lib/fetcher.js";
import { delayed, noData, blocked, errored } from "../lib/respond.js";

const SOURCE = "Yahoo Finance RSS (무료)";

// CDATA/태그 제거
function clean(s) {
  if (!s) return null;
  return s
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? clean(m[1]) : null;
}

/** 간단한 RSS <item> 파서 */
function parseRss(xml) {
  const items = [];
  const re = /<item[\s\S]*?<\/item>/gi;
  let mm;
  while ((mm = re.exec(xml)) !== null) {
    const block = mm[0];
    const pub = pick(block, "pubDate");
    items.push({
      headline: pick(block, "title"),
      url: pick(block, "link"),
      datetime: pub ? new Date(pub).toISOString() : null,
      source: pick(block, "source") || "Yahoo Finance",
      summary: pick(block, "description"),
    });
  }
  return items.filter((i) => i.headline);
}

/** 종목 뉴스 (키 불필요) */
export async function rssNews(ticker) {
  const t = (ticker || "").trim().toUpperCase();
  if (!t) return noData(SOURCE, "티커가 필요합니다.");
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(t)}&region=US&lang=en-US`;
  try {
    const xml = await fetchText(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    const news = parseRss(xml).slice(0, 30);
    if (news.length === 0) return noData(SOURCE, "최근 뉴스가 없습니다.");
    return delayed({ ticker: t, news }, SOURCE);
  } catch (err) {
    if (err instanceof FetchError && err.kind === "blocked") {
      return blocked(SOURCE, err.message);
    }
    return errored(SOURCE, err?.message || "조회 실패");
  }
}
