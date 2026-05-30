// 프런트엔드 로직. 모든 데이터는 /api 에서 받은 표준 봉투를 그대로 신뢰해 표시한다.
// 핵심 원칙: 값이 없으면(null) 절대 0 이나 가짜 숫자를 보여주지 않고 "—" 와 상태 배지로 표시.

const STATUS_LABEL = {
  ok: "실시간",
  delayed: "지연 데이터",
  no_data: "데이터 없음",
  api_required: "API 필요",
  blocked: "접속 차단",
  error: "오류",
};

function badge(status, label) {
  const text = label || STATUS_LABEL[status] || status;
  return `<span class="badge ${status}">${text}</span>`;
}

function fmtNum(v, digits = 2) {
  if (v == null || Number.isNaN(v)) return '<span class="muted">—</span>';
  return Number(v).toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtPct(v) {
  if (v == null || Number.isNaN(v)) return '<span class="muted">—</span>';
  const cls = v > 0 ? "up" : v < 0 ? "down" : "";
  const sign = v > 0 ? "+" : "";
  return `<span class="${cls}">${sign}${v.toFixed(2)}%</span>`;
}

function fmtChange(v) {
  if (v == null || Number.isNaN(v)) return '<span class="muted">—</span>';
  const cls = v > 0 ? "up" : v < 0 ? "down" : "";
  const sign = v > 0 ? "+" : "";
  return `<span class="${cls}">${sign}${fmtNum(v)}</span>`;
}

function sourceLine(env) {
  const parts = [];
  if (env.source) parts.push(`출처: ${env.source}`);
  if (env.asOf) parts.push(`기준: ${new Date(env.asOf).toLocaleString("ko-KR")}`);
  return `<div class="source-line">${parts.join(" · ")}</div>`;
}

function notice(env) {
  if (!env.note) return "";
  return `<div class="notice">ℹ️ ${env.note}</div>`;
}

async function api(path) {
  try {
    const res = await fetch(`/api${path}`);
    return await res.json();
  } catch (e) {
    return { status: "error", statusLabel: "오류", note: `요청 실패: ${e.message}`, data: null };
  }
}

// 시세 테이블 (지수/원자재/환율/종목 공용)
function renderQuoteTable(env, opts = {}) {
  const header = `<div style="margin-bottom:8px">${badge(env.status, env.statusLabel)}</div>`;
  if (!env.data || !Array.isArray(env.data)) {
    return header + notice(env) + sourceLine(env);
  }
  const rows = env.data
    .map((q) => {
      const name = q.displayName || q.name || q.symbol || "—";
      if (!q.available) {
        return `<tr><td>${name}</td><td colspan="4" class="muted">데이터 없음</td></tr>`;
      }
      return `<tr>
        <td>${name}<div class="muted" style="font-size:11px">${q.symbol || ""}</div></td>
        <td class="num">${fmtNum(q.price)}</td>
        <td class="num">${fmtChange(q.change)}</td>
        <td class="num">${fmtPct(q.changePct)}</td>
        <td class="num muted">${q.volume != null ? fmtNum(q.volume, 0) : "—"}</td>
      </tr>`;
    })
    .join("");
  return `${header}
    <table>
      <thead><tr><th>${opts.firstCol || "항목"}</th><th>현재가</th><th>변동</th><th>변동률</th><th>거래량</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>${notice(env)}${sourceLine(env)}`;
}

// --- 시장 개요 ---
async function loadMarket() {
  setBody("panel-indices", '<span class="muted">불러오는 중…</span>');
  setBody("panel-forex", '<span class="muted">불러오는 중…</span>');
  setBody("panel-commodities", '<span class="muted">불러오는 중…</span>');
  setBody("panel-rates", '<span class="muted">불러오는 중…</span>');

  api("/indices").then((e) => setBody("panel-indices", renderQuoteTable(e, { firstCol: "지수" })));
  api("/forex").then((e) => setBody("panel-forex", renderQuoteTable(e, { firstCol: "통화쌍" })));
  api("/commodities").then((e) => setBody("panel-commodities", renderQuoteTable(e, { firstCol: "원자재" })));
  api("/rates").then((e) => setBody("panel-rates", renderRates(e)));
}

function renderRates(env) {
  const header = `<div style="margin-bottom:8px">${badge(env.status, env.statusLabel)}</div>`;
  if (!env.data || !Array.isArray(env.data)) return header + notice(env) + sourceLine(env);
  const rows = env.data
    .map(
      (r) => `<tr><td>${r.name}</td>
        <td class="num">${r.percent != null ? fmtNum(r.percent) + "%" : '<span class="muted">데이터 없음</span>'}</td>
        <td class="num muted">${r.date || "—"}</td></tr>`
    )
    .join("");
  return `${header}<table><thead><tr><th>항목</th><th>금리</th><th>기준일</th></tr></thead><tbody>${rows}</tbody></table>${notice(env)}${sourceLine(env)}`;
}

// --- 종목 ---
async function loadStock(ticker) {
  if (!ticker) return;
  setBody("panel-quote", '<span class="muted">불러오는 중…</span>');
  setBody("panel-earnings", '<span class="muted">불러오는 중…</span>');
  setBody("panel-news", '<span class="muted">불러오는 중…</span>');
  setBody("panel-options", '<span class="muted">불러오는 중…</span>');
  setBody("panel-filings", '<span class="muted">불러오는 중…</span>');

  api(`/quote?symbols=${encodeURIComponent(ticker)}`).then((e) =>
    setBody("panel-quote", renderQuoteTable(e, { firstCol: "종목" }))
  );
  api(`/earnings?ticker=${encodeURIComponent(ticker)}`).then((e) => setBody("panel-earnings", renderEarnings(e)));
  api(`/news?ticker=${encodeURIComponent(ticker)}`).then((e) => setBody("panel-news", renderNews(e)));
  api(`/options?ticker=${encodeURIComponent(ticker)}`).then((e) => setBody("panel-options", renderOptions(e)));
  api(`/sec/filings?ticker=${encodeURIComponent(ticker)}`).then((e) => setBody("panel-filings", renderFilings(e)));
}

function renderEarnings(env) {
  const header = `<div style="margin-bottom:8px">${badge(env.status, env.statusLabel)}</div>`;
  const list = env.data?.earnings;
  if (!list || list.length === 0) return header + notice(env) + sourceLine(env);
  const rows = list
    .map(
      (e) => `<tr><td>${e.symbol}</td><td class="num">${e.date}</td>
      <td class="num">${e.epsActual ?? e.epsEstimate ?? "—"}</td><td class="muted">${e.hour || ""}</td></tr>`
    )
    .join("");
  return `${header}<table><thead><tr><th>종목</th><th>발표일</th><th>EPS</th><th>시점</th></tr></thead><tbody>${rows}</tbody></table>${notice(env)}${sourceLine(env)}`;
}

function renderNews(env) {
  const header = `<div style="margin-bottom:8px">${badge(env.status, env.statusLabel)}</div>`;
  const list = env.data?.news;
  if (!list || list.length === 0) return header + notice(env) + sourceLine(env);
  const items = list
    .map(
      (n) => `<li><a href="${n.url}" target="_blank" rel="noopener">${n.headline}</a>
      <div class="muted" style="font-size:11px">${n.source || ""} · ${n.datetime ? new Date(n.datetime).toLocaleString("ko-KR") : ""}</div></li>`
    )
    .join("");
  return `${header}<ul class="clean">${items}</ul>${sourceLine(env)}`;
}

function renderOptions(env) {
  const header = `<div style="margin-bottom:8px">${badge(env.status, env.statusLabel)}</div>`;
  const list = env.data?.contracts;
  if (!list || list.length === 0) return header + notice(env) + sourceLine(env);
  const rows = list
    .map(
      (o) => `<tr><td>${o.type || "—"}</td><td class="num">${fmtNum(o.strike)}</td>
      <td class="num">${o.expiration || "—"}</td><td class="num">${fmtNum(o.lastPrice)}</td>
      <td class="num">${o.iv != null ? (o.iv * 100).toFixed(1) + "%" : "—"}</td></tr>`
    )
    .join("");
  return `${header}<table><thead><tr><th>구분</th><th>행사가</th><th>만기</th><th>가격</th><th>IV</th></tr></thead><tbody>${rows}</tbody></table>${notice(env)}${sourceLine(env)}`;
}

function renderFilings(env) {
  const header = `<div style="margin-bottom:8px">${badge(env.status, env.statusLabel)}</div>`;
  const d = env.data;
  if (!d || !d.filings || d.filings.length === 0) return header + notice(env) + sourceLine(env);
  const rows = d.filings
    .map(
      (f) => `<tr><td><a href="${f.url}" target="_blank" rel="noopener">${f.form}</a></td>
      <td class="num">${f.filingDate}</td><td class="num muted">${f.reportDate || "—"}</td></tr>`
    )
    .join("");
  return `${header}<div class="notice">${d.companyName || ""} · CIK ${d.cik}</div>
    <table><thead><tr><th>양식</th><th>접수일</th><th>보고기준일</th></tr></thead><tbody>${rows}</tbody></table>${sourceLine(env)}`;
}

// --- 한국 ---
async function loadKoreaIndices() {
  setBody("panel-krindices", '<span class="muted">불러오는 중…</span>');
  const e = await api("/korea/indices");
  setBody("panel-krindices", renderQuoteTable(e, { firstCol: "지수" }));
}

async function loadKoreaQuote(code) {
  if (!code) return;
  setBody("panel-krquote", '<span class="muted">불러오는 중…</span>');
  setBody("panel-krx", "");
  const e = await api(`/korea/quote?code=${encodeURIComponent(code)}`);
  setBody("panel-krquote", renderQuoteTable(e, { firstCol: "종목" }));
}

async function loadKrx(code) {
  if (!code) return;
  setBody("panel-krx", '<span class="muted">KRX 공식 확정값 불러오는 중…</span>');
  // 코스피 우선 조회, 데이터 없으면 코스닥 재시도
  let e = await api(`/korea/krx?market=KOSPI&code=${encodeURIComponent(code)}`);
  if (e.status === "no_data") {
    const k = await api(`/korea/krx?market=KOSDAQ&code=${encodeURIComponent(code)}`);
    if (k.status === "ok") e = k;
  }
  setBody("panel-krx", renderKrx(e));
}

function renderKrx(env) {
  const header = `<div style="margin:8px 0">KRX 공식 확정값 ${badge(env.status, env.statusLabel)}</div>`;
  const items = env.data?.items;
  if (!items || items.length === 0) return header + notice(env) + sourceLine(env);
  const rows = items
    .map(
      (r) => `<tr><td>${r.name || r.isuCd}</td>
      <td class="num">${fmtNum(r.close, 0)}</td>
      <td class="num">${fmtChange(r.change)}</td>
      <td class="num">${fmtPct(r.changePct)}</td>
      <td class="num muted">${r.volume != null ? fmtNum(r.volume, 0) : "—"}</td></tr>`
    )
    .join("");
  return `${header}<div class="notice">기준일 ${env.data.baseDate} · ${env.data.market}</div>
    <table><thead><tr><th>종목</th><th>종가</th><th>대비</th><th>등락률</th><th>거래량</th></tr></thead><tbody>${rows}</tbody></table>${sourceLine(env)}`;
}

async function loadDart(corp) {
  setBody("panel-dart", '<span class="muted">불러오는 중…</span>');
  const e = await api(`/korea/dart?corp_code=${encodeURIComponent(corp || "")}`);
  const header = `<div style="margin-bottom:8px">${badge(e.status, e.statusLabel)}</div>`;
  const list = e.data?.disclosures;
  if (!list || list.length === 0) return setBody("panel-dart", header + notice(e) + sourceLine(e));
  const rows = list
    .map(
      (d) => `<tr><td><a href="${d.url}" target="_blank" rel="noopener">${d.reportName}</a>
      <div class="muted" style="font-size:11px">${d.corpName}</div></td>
      <td class="num">${d.date}</td><td class="muted">${d.filer || ""}</td></tr>`
    )
    .join("");
  setBody("panel-dart", `${header}<table><thead><tr><th>보고서</th><th>접수일</th><th>제출인</th></tr></thead><tbody>${rows}</tbody></table>${sourceLine(e)}`);
}

// --- 소스 ---
async function loadSources() {
  const e = await api("/sources");
  const d = e.data;
  if (!d) return setBody("panel-sources", notice(e));
  const free = d.noKeyRequired
    .map((s) => `<li><b>${s.name}</b> — ${s.use} ${badge("ok", "키 불필요")}</li>`)
    .join("");
  const keyed = d.keyRequired
    .map(
      (s) =>
        `<li><b>${s.name}</b> (<code>${s.env}</code>) — ${s.use} ${
          s.configured ? badge("ok", "설정됨") : badge("api_required", "키 미설정")
        }</li>`
    )
    .join("");
  setBody(
    "panel-sources",
    `<h3 style="margin:4px 0">키가 필요 없는 실데이터</h3><ul class="clean">${free}</ul>
     <h3 style="margin:14px 0 4px">키가 필요한 기능</h3><ul class="clean">${keyed}</ul>
     <div class="notice">키 미설정 기능은 화면에서 "API 필요" 로 표시되며 가짜 데이터로 채우지 않습니다.</div>`
  );
}

// --- 공용 유틸 ---
function setBody(panelId, html) {
  const el = document.getElementById(panelId);
  if (!el) return;
  const body = el.classList.contains("panel-body") ? el : el.querySelector(".panel-body") || el;
  body.innerHTML = html;
}

function switchView(view) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === view));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.dataset.view === view));
  if (view === "market") loadMarket();
  if (view === "korea") loadKoreaIndices();
  if (view === "sources") loadSources();
}

function doSearch() {
  const t = document.getElementById("symbolInput").value.trim().toUpperCase();
  if (!t) return;
  switchView("stock");
  loadStock(t);
}

function renderLegend() {
  const items = ["ok", "delayed", "no_data", "api_required", "blocked"];
  document.getElementById("legend").innerHTML = items.map((s) => badge(s)).join(" ");
}

document.addEventListener("DOMContentLoaded", () => {
  renderLegend();
  document.getElementById("tabs").addEventListener("click", (e) => {
    if (e.target.matches(".tab")) switchView(e.target.dataset.view);
  });
  document.getElementById("searchBtn").addEventListener("click", doSearch);
  document.getElementById("symbolInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });
  document.getElementById("krQuoteBtn").addEventListener("click", () =>
    loadKoreaQuote(document.getElementById("krCode").value.trim())
  );
  document.getElementById("krxBtn").addEventListener("click", () =>
    loadKrx(document.getElementById("krCode").value.trim())
  );
  document.getElementById("dartBtn").addEventListener("click", () =>
    loadDart(document.getElementById("dartCorp").value.trim())
  );

  setInterval(() => {
    document.getElementById("clock").textContent = new Date().toLocaleString("ko-KR");
  }, 1000);

  loadMarket();
});
