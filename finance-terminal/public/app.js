'use strict';

// ───────────────────────── 유틸 ─────────────────────────
const STATUS_KO = {
  live: '실시간',
  delayed: '지연',
  no_data: '데이터 없음',
  api_required: 'API 키 필요',
  error: '오류',
};

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function statusText(meta) {
  let t = STATUS_KO[meta.status] || meta.status;
  if (meta.status === 'delayed' && meta.delayMinutes) t += ` ${meta.delayMinutes}분`;
  return t;
}

function badge(meta) {
  return `<span class="badge ${meta.status}">${esc(statusText(meta))}</span>`;
}

function metaLine(meta) {
  const parts = [];
  if (meta.source) parts.push(`출처: ${esc(meta.source)}`);
  if (meta.asOf) parts.push(`기준: ${fmtTime(meta.asOf)}`);
  let html = `<div class="source-line">${parts.join(' · ')}</div>`;
  if (meta.note) html += `<p class="note">${esc(meta.note)}${meta.requiresKey ? ` <code>(${esc(meta.requiresKey)})</code>` : ''}</p>`;
  return html;
}

// data 가 비었을 때 명확한 상태 박스
function stateBox(meta) {
  return `<div class="state-box">${badge(meta)} <span>${esc(meta.note || statusText(meta))}</span>${
    meta.requiresKey ? ` <code>(${esc(meta.requiresKey)})</code>` : ''
  }${meta.source ? `<div class="source-line">출처: ${esc(meta.source)}</div>` : ''}</div>`;
}

function fmtNum(v, digits = 2) {
  if (v == null || !isFinite(v)) return '<span class="na">—</span>';
  return Number(v).toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return esc(iso);
  return d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

function changeClass(v) {
  if (v == null || !isFinite(v)) return 'flat';
  return v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
}
function sign(v) {
  return v > 0 ? '+' : '';
}

async function api(path) {
  try {
    const r = await fetch(path);
    return await r.json();
  } catch (e) {
    return { meta: { status: 'error', source: 'client', asOf: null, note: `요청 실패: ${e.message}` }, data: null };
  }
}

// ───────────────────────── 시세 행 ─────────────────────────
function quoteRow(q) {
  const chg = q.change, pct = q.changePercent;
  const cls = changeClass(chg);
  const priceHtml = q.price == null ? '<span class="na">데이터 없음</span>' : fmtNum(q.price);
  const chgHtml =
    chg == null
      ? '<span class="na">—</span>'
      : `${sign(chg)}${fmtNum(chg)} (${sign(pct)}${fmtNum(pct)}%)`;
  return `<div class="quote-row" data-symbol="${esc(q.symbol)}">
      <div><div class="q-name">${esc(q.label || q.name || q.symbol)}</div><div class="q-sym">${esc(q.symbol)}${q.currency ? ' · ' + esc(q.currency) : ''}</div></div>
      <div class="q-right"><div class="q-price">${priceHtml}</div><div class="q-chg ${cls}">${chgHtml}</div></div>
    </div>`;
}

// ───────────────────────── 시장 개요 ─────────────────────────
async function loadMarkets() {
  const body = document.getElementById('markets-body');
  body.innerHTML = '<p class="loading">불러오는 중…</p>';
  const res = await api('/api/markets');
  const groups = res.groups || [];
  body.innerHTML = groups
    .map((g) => {
      let inner;
      if (!g.data || g.data.length === 0) {
        inner = stateBox(g.meta);
      } else {
        inner = g.data.map(quoteRow).join('') + metaLine(g.meta);
      }
      return `<div class="group"><h3>${esc(g.label)} ${badge(g.meta)}</h3>${inner}</div>`;
    })
    .join('');
  bindQuoteRows(body);
}

function bindQuoteRows(scope) {
  scope.querySelectorAll('.quote-row').forEach((el) => {
    el.addEventListener('click', () => openDetail(el.dataset.symbol));
  });
}

// ───────────────────────── 금리 ─────────────────────────
async function loadRates() {
  const body = document.getElementById('rates-body');
  const bdg = document.getElementById('rates-badge');
  const res = await api('/api/rates');
  bdg.innerHTML = badge(res.meta);
  if (!res.data || res.data.length === 0) {
    body.innerHTML = stateBox(res.meta);
    return;
  }
  body.innerHTML =
    `<table><thead><tr><th>항목</th><th class="num">값</th><th class="num">기준일</th></tr></thead><tbody>` +
    res.data
      .map(
        (r) =>
          `<tr><td>${esc(r.label)}</td><td class="num">${r.value == null ? '<span class="na">—</span>' : fmtNum(r.value) + esc(r.unit)}</td><td class="num">${r.asOf ? esc(String(r.asOf).slice(0, 10)) : '—'}</td></tr>`,
      )
      .join('') +
    `</tbody></table>` +
    metaLine(res.meta);
}

// ───────────────────────── DART ─────────────────────────
async function loadDart() {
  const body = document.getElementById('dart-body');
  const bdg = document.getElementById('dart-badge');
  const res = await api('/api/dart');
  bdg.innerHTML = badge(res.meta);
  if (!res.data || res.data.length === 0) {
    body.innerHTML = stateBox(res.meta);
    return;
  }
  body.innerHTML = filingsTable(res.data) + metaLine(res.meta);
}

function filingsTable(list) {
  return (
    `<table><thead><tr><th>구분</th><th>제목</th><th class="num">일자</th></tr></thead><tbody>` +
    list
      .map(
        (f) =>
          `<tr><td>${esc(f.form)}</td><td><a href="${esc(f.link)}" target="_blank" rel="noopener">${esc(f.title)}</a></td><td class="num">${esc(f.filedAt || '—')}</td></tr>`,
      )
      .join('') +
    `</tbody></table>`
  );
}

// ───────────────────────── 데이터 소스 상태 ─────────────────────────
async function loadProviders() {
  const body = document.getElementById('providers-body');
  const res = await api('/api/config');
  const list = res.providers || [];
  body.innerHTML =
    '<div class="providers-list">' +
    list
      .map(
        (p) =>
          `<div class="provider"><div class="pstat">${p.available ? '✅' : '⚠️'}</div><div>
            <div><strong>${esc(p.label)}</strong> ${p.available ? '<span class="badge live">사용 가능</span>' : `<span class="badge api_required">키 필요</span>`}</div>
            <div class="note">${esc(p.note)}${p.requiresKey ? ` <code>${esc(p.requiresKey)}</code>` : ''}</div>
          </div></div>`,
      )
      .join('') +
    '</div>';
}

// ───────────────────────── 검색 ─────────────────────────
async function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  const res = await api('/api/search?q=' + encodeURIComponent(q));
  const hits = res.data?.quotes || [];
  if (hits.length === 0) {
    openDetailDirect(q.toUpperCase());
    return;
  }
  if (hits.length === 1) {
    openDetail(hits[0].symbol);
    return;
  }
  // 결과 목록 표시
  openModal(
    `<div class="detail-head"><h2>검색 결과: "${esc(q)}"</h2></div>` +
      badge(res.meta) +
      '<table><thead><tr><th>심볼</th><th>이름</th><th>거래소</th><th>유형</th></tr></thead><tbody>' +
      hits
        .map(
          (h) =>
            `<tr class="quote-row" data-symbol="${esc(h.symbol)}" style="cursor:pointer"><td><strong>${esc(h.symbol)}</strong></td><td>${esc(h.name || '—')}</td><td>${esc(h.exchange || '—')}</td><td>${esc(h.type || '—')}</td></tr>`,
        )
        .join('') +
      '</tbody></table>',
  );
  document.querySelectorAll('#detail-content .quote-row').forEach((el) => {
    el.addEventListener('click', () => openDetail(el.dataset.symbol));
  });
}

// ───────────────────────── 상세 모달 ─────────────────────────
function openModal(html) {
  document.getElementById('detail-content').innerHTML = html;
  document.getElementById('detail').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('detail').classList.add('hidden');
}

function openDetailDirect(symbol) {
  openDetail(symbol);
}

async function openDetail(symbol) {
  openModal(`<p class="loading">${esc(symbol)} 불러오는 중…</p>`);
  const res = await api('/api/quote?symbols=' + encodeURIComponent(symbol));
  const q = res.data?.[0];
  const head = q
    ? `<div class="detail-head">
        <h2>${esc(q.name || symbol)}</h2>
        <span class="q-sym">${esc(q.symbol)}${q.exchange ? ' · ' + esc(q.exchange) : ''}</span>
        ${badge(res.meta)}
      </div>
      <div class="detail-head">
        <span class="detail-price ${changeClass(q.change)}">${q.price == null ? '데이터 없음' : fmtNum(q.price)}</span>
        <span class="${changeClass(q.change)}">${q.change == null ? '' : `${sign(q.change)}${fmtNum(q.change)} (${sign(q.changePercent)}${fmtNum(q.changePercent)}%)`}</span>
        <span class="q-sym">${q.currency ? esc(q.currency) : ''} ${q.marketState ? '· ' + esc(q.marketState) : ''}</span>
      </div>
      ${metaLine(res.meta)}`
    : `<div class="detail-head"><h2>${esc(symbol)}</h2>${badge(res.meta)}</div>${stateBox(res.meta)}`;

  const tabs = ['개요', '뉴스', 'SEC 공시', '옵션', '실적'];
  const tabBar =
    '<div class="tabs">' +
    tabs.map((t, i) => `<button class="tab ${i === 0 ? 'active' : ''}" data-tab="${i}">${t}</button>`).join('') +
    '</div><div class="tab-content" id="tab-content"></div>';

  openModal(head + tabBar);

  const tabContent = document.getElementById('tab-content');
  const renderers = [
    () => renderOverview(tabContent, symbol),
    () => renderNews(tabContent, symbol),
    () => renderSec(tabContent, symbol),
    () => renderOptions(tabContent, symbol),
    () => renderEarnings(tabContent, symbol),
  ];
  document.querySelectorAll('#detail-content .tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#detail-content .tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderers[Number(btn.dataset.tab)]();
    });
  });
  renderers[0]();
}

// 개요: 차트 + 주요 지표
async function renderOverview(el, symbol) {
  el.innerHTML = '<div class="range-btns" id="range-btns"></div><div class="chart-wrap" id="chart-wrap"><p class="loading">차트 불러오는 중…</p></div>';
  const ranges = [
    ['1d', '1일', '5m'],
    ['5d', '5일', '30m'],
    ['1mo', '1개월', '1d'],
    ['6mo', '6개월', '1d'],
    ['1y', '1년', '1d'],
    ['5y', '5년', '1wk'],
  ];
  const rb = document.getElementById('range-btns');
  rb.innerHTML = ranges.map((r, i) => `<button data-r="${r[0]}" data-i="${r[2]}" class="${i === 2 ? 'active' : ''}">${r[1]}</button>`).join('');
  rb.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => {
      rb.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      drawChart(symbol, b.dataset.r, b.dataset.i);
    }),
  );
  drawChart(symbol, '1mo', '1d');
}

async function drawChart(symbol, range, interval) {
  const wrap = document.getElementById('chart-wrap');
  wrap.innerHTML = '<p class="loading">차트 불러오는 중…</p>';
  const res = await api(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}`);
  if (!res.data || !res.data.points || res.data.points.length === 0) {
    wrap.innerHTML = stateBox(res.meta);
    return;
  }
  wrap.innerHTML = sparkline(res.data.points) + metaLine(res.meta);
}

function sparkline(points) {
  const vals = points.map((p) => p.close).filter((v) => v != null && isFinite(v));
  if (vals.length < 2) return '<p class="na">표시할 데이터가 부족합니다.</p>';
  const min = Math.min(...vals), max = Math.max(...vals);
  const W = 800, H = 220, pad = 8;
  const span = max - min || 1;
  const n = points.length;
  const pts = [];
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const c = points[i].close;
    if (c == null || !isFinite(c)) continue;
    const x = pad + (i / (n - 1)) * (W - 2 * pad);
    const y = pad + (1 - (c - min) / span) * (H - 2 * pad);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    idx++;
  }
  const first = vals[0], last = vals[vals.length - 1];
  const color = last >= first ? 'var(--up)' : 'var(--down)';
  const area = `${pad},${H - pad} ${pts.join(' ')} ${W - pad},${H - pad}`;
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <polygon points="${area}" fill="${color}" opacity="0.08" />
      <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2" />
    </svg>
    <div class="source-line">최저 ${fmtNum(min)} · 최고 ${fmtNum(max)} · 최근 ${fmtNum(last)}</div>`;
}

async function renderNews(el, symbol) {
  el.innerHTML = '<p class="loading">뉴스 불러오는 중…</p>';
  const res = await api('/api/news?symbol=' + encodeURIComponent(symbol));
  if (!res.data || res.data.length === 0) {
    el.innerHTML = stateBox(res.meta);
    return;
  }
  el.innerHTML =
    badge(res.meta) +
    res.data
      .map(
        (n) =>
          `<div class="news-item"><div class="nt"><a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.title)}</a></div>
           <div class="nm">${esc(n.publisher || '')} · ${fmtTime(n.publishedAt)}</div></div>`,
      )
      .join('') +
    metaLine(res.meta);
}

async function renderSec(el, symbol) {
  el.innerHTML = '<p class="loading">SEC 공시 불러오는 중…</p>';
  const res = await api('/api/sec?symbol=' + encodeURIComponent(symbol));
  if (!res.data || res.data.length === 0) {
    el.innerHTML = stateBox(res.meta);
    return;
  }
  el.innerHTML = badge(res.meta) + filingsTable(res.data) + metaLine(res.meta);
}

async function renderOptions(el, symbol) {
  el.innerHTML = '<p class="loading">옵션 불러오는 중…</p>';
  const res = await api('/api/options?symbol=' + encodeURIComponent(symbol));
  const d = res.data;
  if (!d) {
    el.innerHTML = stateBox(res.meta);
    return;
  }
  function optTable(rows, title) {
    if (!rows || rows.length === 0) return `<p class="na">${title}: 데이터 없음</p>`;
    const top = rows.slice(0, 12);
    return (
      `<h4>${title}</h4><table><thead><tr><th class="num">행사가</th><th class="num">현재가</th><th class="num">매수호가</th><th class="num">매도호가</th><th class="num">미결제</th><th class="num">IV</th></tr></thead><tbody>` +
      top
        .map(
          (c) =>
            `<tr><td class="num">${fmtNum(c.strike)}</td><td class="num">${fmtNum(c.lastPrice)}</td><td class="num">${fmtNum(c.bid)}</td><td class="num">${fmtNum(c.ask)}</td><td class="num">${c.openInterest ?? '—'}</td><td class="num">${c.impliedVolatility == null ? '—' : fmtNum(c.impliedVolatility * 100) + '%'}</td></tr>`,
        )
        .join('') +
      `</tbody></table>`
    );
  }
  el.innerHTML =
    badge(res.meta) +
    `<p class="note">만기: ${esc(d.expiration || '—')} · 기초자산가: ${fmtNum(d.underlyingPrice)}</p>` +
    optTable(d.calls, '콜 (Call)') +
    optTable(d.puts, '풋 (Put)') +
    metaLine(res.meta);
}

async function renderEarnings(el, symbol) {
  el.innerHTML = '<p class="loading">실적 불러오는 중…</p>';
  const res = await api('/api/earnings?symbol=' + encodeURIComponent(symbol));
  if (!res.data) {
    el.innerHTML = stateBox(res.meta) + '<p class="note">정형화된 실적표는 Finnhub 키 설정 시 제공됩니다.</p>';
    return;
  }
  // Yahoo quoteSummary earnings 구조에서 분기 EPS 차트 데이터 추출
  const eh = res.data.earnings?.earningsChart?.quarterly || [];
  const fin = res.data.earnings?.financialsChart?.quarterly || [];
  let html = badge(res.meta);
  if (eh.length) {
    html +=
      '<h4>분기 EPS (실제 vs 추정)</h4><table><thead><tr><th>분기</th><th class="num">실제</th><th class="num">추정</th></tr></thead><tbody>' +
      eh
        .map(
          (q) =>
            `<tr><td>${esc(q.date)}</td><td class="num">${fmtNum(q.actual?.raw)}</td><td class="num">${fmtNum(q.estimate?.raw)}</td></tr>`,
        )
        .join('') +
      '</tbody></table>';
  }
  if (fin.length) {
    html +=
      '<h4>분기 매출/이익</h4><table><thead><tr><th>분기</th><th class="num">매출</th><th class="num">이익</th></tr></thead><tbody>' +
      fin
        .map(
          (q) =>
            `<tr><td>${esc(q.date)}</td><td class="num">${q.revenue?.fmt ?? '—'}</td><td class="num">${q.earnings?.fmt ?? '—'}</td></tr>`,
        )
        .join('') +
      '</tbody></table>';
  }
  if (!eh.length && !fin.length) html += '<p class="na">표시할 실적 데이터가 없습니다.</p>';
  html += metaLine(res.meta);
  el.innerHTML = html;
}

// ───────────────────────── 초기화 ─────────────────────────
document.getElementById('search-btn').addEventListener('click', doSearch);
document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doSearch();
});
document.getElementById('detail-close').addEventListener('click', closeModal);
document.getElementById('detail').addEventListener('click', (e) => {
  if (e.target.id === 'detail') closeModal();
});
document.querySelectorAll('[data-refresh]').forEach((b) =>
  b.addEventListener('click', () => {
    if (b.dataset.refresh === 'markets') loadMarkets();
  }),
);

loadMarkets();
loadRates();
loadDart();
loadProviders();
