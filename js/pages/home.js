/**
 * home.js — txid.uk Home Page Module
 *
 * Contains: renderHome, renderRecentBlocks, renderFeeHistogram,
 *           loadBtcPriceChart, loadMempoolHistoryChart, drawLineChart,
 *           drawAreaChart, loadLightningStats, loadDifficultyTimer,
 *           loadMempoolHeatmap, drawFeeHeatmap
 */

import {
  state, t, api, icon, NProgress,
  escHtml, formatNum, formatBtc, formatBytes,
  timeAgo, fullDate,
  feeColorHex, coloredFeeRate,
  skeletonCards,
  breadcrumb,
  loadScript, CDN_CHARTS,
  renderFavoritesSection,
} from '../core.js';
import { getMempoolFeeEstimates } from '../search.js';

function navigate(hash) { location.hash = hash; }

// ═══════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════
let _lastBlockHeights = null;

export async function renderHome(app) {
  NProgress.done();
  document.title = 'txid.uk | Bitcoin Block Explorer';
  app.innerHTML = '';

  // 멤풀 섹션
  let mempoolSection = document.getElementById('mempool-section');
  if (!mempoolSection) {
    mempoolSection = document.createElement('div');
    mempoolSection.id = 'mempool-section';
    mempoolSection.innerHTML = `
      <canvas id="mempool-canvas"></canvas>
      <div id="mempool-legend">
        <div class="leg"><div class="leg-dot" style="background:#ff4444"></div><span>100+ sat/vB</span></div>
        <div class="leg"><div class="leg-dot" style="background:#ff8800"></div><span>20~100</span></div>
        <div class="leg"><div class="leg-dot" style="background:#f7931a"></div><span>5~20</span></div>
        <div class="leg"><div class="leg-dot" style="background:#ffcc00"></div><span>2~5</span></div>
        <div class="leg"><div class="leg-dot" style="background:#44bb44"></div><span>1~2</span></div>
        <div class="leg"><div class="leg-dot" style="background:#4488ff"></div><span>0.5~1</span></div>
        <div class="leg"><div class="leg-dot" style="background:#445566"></div><span>&lt;0.5</span></div>
      </div>
      <div class="mempool-hint" id="mempool-hint-text">${t('clickBlockHint')}</div>
    `;
    app.before(mempoolSection);
  }
  mempoolSection.style.display = '';
  const hintEl = document.getElementById('mempool-hint-text');
  if (hintEl) hintEl.textContent = t('clickBlockHint');

  if (typeof MempoolViz !== 'undefined') {
    MempoolViz.init(document.getElementById('mempool-canvas'));
  }

  // 즐겨찾기
  const favHtml = renderFavoritesSection();
  if (favHtml) {
    const favDiv = document.createElement('div');
    favDiv.innerHTML = favHtml;
    app.appendChild(favDiv.firstElementChild);
  }

  // Chain status + 멤풀 예측 섹션
  const chainDiv = document.createElement('div');
  chainDiv.className = 'section';
  chainDiv.innerHTML = `
    <div class="section-header"><span class="section-title">${state.lang==='ko'?'블록체인 상태':'Chain Status'}</span></div>
    <div class="chain-status-grid">
      <div class="cs-card"><div class="cs-label">${state.lang==='ko'?'난이도 조정':'Difficulty Adj.'}</div><div class="cs-val" id="diff-timer">—</div></div>
      <div class="cs-card"><div class="cs-label">${state.lang==='ko'?'수수료별 예상 대기':'Estimated Wait'}</div><div class="cs-val" id="mempool-predict" style="font-size:.72rem">—</div></div>
    </div>`;
  app.appendChild(chainDiv);

  // 최근 블록
  _lastBlockHeights = null;  // 라우팅 시 캐시 초기화
  const blocksSection = document.createElement('div');
  blocksSection.innerHTML = `<div class="section-title">${t('recentBlocks')}</div><div class="blocks-grid" id="recent-blocks">${skeletonCards(8)}</div>`;
  app.appendChild(blocksSection);

  // Charts placeholder
  const chartsDiv = document.createElement('div');
  chartsDiv.id = 'home-charts';
  chartsDiv.innerHTML = `<div class="charts-grid">
    <div class="chart-card"><h3>${icon('trending-up')} ${t('btcPrice')} (${t('days30')})</h3><div id="price-info" class="chart-subtitle">${t('loading')}</div><div id="price-chart" style="height:200px"></div></div>
    <div class="chart-card"><h3>${icon('package')} ${t('mempoolSizeHistory')}</h3><div class="chart-subtitle">&nbsp;</div><canvas id="mempool-history-chart"></canvas></div>
  </div>`;
  app.appendChild(chartsDiv);

  // 데이터 로드
  try {
    const [blocks, mempoolBlocks] = await Promise.all([
      api('/v1/blocks'),
      api('/v1/fees/mempool-blocks')
    ]);

    renderRecentBlocks(blocks.slice(0, 8));

    if (typeof MempoolViz !== 'undefined') {
      MempoolViz.updateData(blocks.slice(0, 6), mempoolBlocks);
    }
  } catch (e) {
    const el = document.getElementById('recent-blocks');
    if (el) el.innerHTML = `<div class="error-box" role="alert">${t('error')}</div>`;
  }

  // Load charts & lightning in parallel
  loadBtcPriceChart();
  loadMempoolHistoryChart();
  // loadLightningStats();
  try { loadMempoolHeatmap(); } catch(e) { console.warn('mempool heatmap:', e); }
  try { loadDifficultyTimer(); } catch(e) { console.warn('difficulty timer:', e); }
  // pool chart는 mining 페이지에서만 렌더링
  getMempoolFeeEstimates().then(est => {
    const el = document.getElementById('mempool-predict');
    if (!el || !est) return;
    const fmt = (e) => `<span style="font-family:var(--font);color:var(--accent)">${e.fee}</span><small style="font-family:var(--font-ko);color:var(--text3)"> sat/vB → ~${e.mins}분</small>`;
    el.innerHTML = fmt(est.fastest) + '<br>' + fmt(est.halfHour) + '<br>' + fmt(est.economy);
  }).catch(function(){});
}

export function renderRecentBlocks(blocks) {
  const grid = document.getElementById('recent-blocks');
  if (!grid) return;

  // 블록 높이가 변경되지 않았으면 리빌드 스킵
  const heights = blocks.map(b => b.height).join(',');
  if (_lastBlockHeights === heights) return;
  _lastBlockHeights = heights;

  grid.innerHTML = blocks.map((b, idx) => {
    const pool = b.extras?.pool?.name || 'Unknown';
    const totalFees = b.extras?.totalFees || 0;
    const feeRange = b.extras?.feeRange || null;
    const medianFee = b.extras?.medianFee || null;

    let feeBarStyle = 'background: var(--border);';
    if (feeRange && feeRange.length >= 2) {
      const minFee = feeRange[0];
      const maxFee = feeRange[feeRange.length - 1];
      feeBarStyle = `background: linear-gradient(90deg, ${feeColorHex(minFee)}, ${feeColorHex(maxFee)});`;
    }

    let feeRangeText = '';
    if (feeRange && feeRange.length >= 2) {
      const minF = Math.round(feeRange[0]);
      const maxF = Math.round(feeRange[feeRange.length - 1]);
      feeRangeText = `<span style="color:${feeColorHex(minF)}">${minF}</span>~<span style="color:${feeColorHex(maxF)}">${maxF}</span> sat/vB`;
    } else if (medianFee) {
      feeRangeText = `<span style="color:${feeColorHex(medianFee)}">~${Math.round(medianFee)}</span> sat/vB`;
    }

    return `
      <div class="block-card stagger-item" style="--i:${idx}" data-nav="#/block/${b.id}" title="${b.id}">
        <div class="bc-top">
          <span class="bc-height">#${formatNum(b.height)}</span>
          <span class="bc-time" title="${fullDate(b.timestamp)}">${timeAgo(b.timestamp)}</span>
        </div>
        <div class="bc-row"><span>TX</span><span>${formatNum(b.tx_count)}</span></div>
        <div class="bc-row"><span>${t('size')}</span><span>${formatBytes(b.size)}</span></div>
        <div class="bc-row"><span>${t('fee')}</span><span>${formatBtc(totalFees)}</span></div>
        ${feeRangeText ? `<div class="bc-fee-range">${feeRangeText}</div>` : ''}
        <div class="bc-fee-bar" style="${feeBarStyle}"></div>
        <div class="bc-miner">${escHtml(pool)}</div>
      </div>
    `;
  }).join('');
}

export function renderFeeHistogram(mempoolBlocks, canvasEl) {
  const canvas = canvasEl || document.getElementById('fee-chart');
  if (!canvas || !mempoolBlocks || !mempoolBlocks.length) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;

  const ranges = [
    { label: '0-1', min: 0, max: 1, color: '#445566', count: 0 },
    { label: '1-2', min: 1, max: 2, color: '#4488ff', count: 0 },
    { label: '2-5', min: 2, max: 5, color: '#44bb44', count: 0 },
    { label: '5-20', min: 5, max: 20, color: '#ffcc00', count: 0 },
    { label: '20-50', min: 20, max: 50, color: '#f7931a', count: 0 },
    { label: '50-100', min: 50, max: 100, color: '#ff8800', count: 0 },
    { label: '100+', min: 100, max: Infinity, color: '#ff4444', count: 0 },
  ];

  mempoolBlocks.forEach(mb => {
    if (mb.feeRange) {
      const median = mb.feeRange[Math.floor(mb.feeRange.length / 2)] || mb.feeRange[0];
      for (const r of ranges) {
        if (median >= r.min && median < r.max) { r.count += mb.nTx || 0; break; }
      }
    }
  });

  const maxCount = Math.max(...ranges.map(r => r.count), 1);
  const barW = Math.floor((W - 40) / ranges.length);
  const barGap = 4;
  const chartH = H - 30;

  ctx.clearRect(0, 0, W, H);

  ranges.forEach((r, i) => {
    const x = 20 + i * barW + barGap / 2;
    const bw = barW - barGap;
    const bh = (r.count / maxCount) * (chartH - 10);
    const y = chartH - bh;

    ctx.fillStyle = r.color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, [3, 3, 0, 0]);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (r.count > 0) {
      ctx.fillStyle = '#8b949e';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(formatNum(r.count), x + bw / 2, y - 4);
    }

    ctx.fillStyle = '#6e7681';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(r.label, x + bw / 2, H - 4);
  });

  ctx.fillStyle = '#6e7681';
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('sat/vB', W - 4, H - 4);
}

// ═══════════════════════════════════════════
// CHARTS
// ═══════════════════════════════════════════
async function loadBtcPriceChart() {
  const infoElFail = () => {
    const el = document.getElementById('price-info');
    if (el && el.textContent.includes(t('loading'))) {
      // 이미 updateStats에서 가격을 받았으면 그걸로 표시
      const p = window._btcUsd;
      if (p) el.innerHTML = `<span class="price-current">$${formatNum(Math.round(p))}</span>`;
      else el.textContent = 'Price unavailable';
    }
    const c = document.getElementById('price-chart');
    if (c) c.style.display = 'none';
  };
  try {
    // OHLCV 데이터 (CoinGecko - 30일 일봉, 8초 타임아웃)
    const data = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=30', {signal: AbortSignal.timeout(8000)}).then(r => r.json());
    if (!data?.length) { infoElFail(); return; }

    const current = data[data.length - 1][4];
    const prev = data[data.length - 2]?.[4] || current;
    const change24h = ((current - prev) / prev * 100);
    const infoEl = document.getElementById('price-info');
    if (infoEl) {
      const changeClass = change24h >= 0 ? 'up' : 'down';
      infoEl.innerHTML = `<span class="price-current">$${formatNum(Math.round(current))}</span><span class="price-change ${changeClass}">${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}% (24h)</span>`;
    }

    const container = document.getElementById('price-chart');
    if (!container) return;
    container.innerHTML = '';
    // DOM 렌더링 후 width 읽기
    await new Promise(r => setTimeout(r, 50));

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const bg = isDark ? '#0d1117' : '#ffffff';
    const textColor = isDark ? '#8b949e' : '#555';
    const borderColor = isDark ? '#21262d' : '#e0e0e0';

    // Lightweight Charts 동적 로드
    await loadScript(CDN_CHARTS).catch(()=>{});
    if (typeof LightweightCharts !== 'undefined') {
      const chart = LightweightCharts.createChart(container, {
        width: container.clientWidth || container.parentElement?.clientWidth || 400,
        height: 200,
        layout: { background: { color: bg }, textColor },
        grid: { vertLines: { color: borderColor }, horzLines: { color: borderColor } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        rightPriceScale: { borderColor },
        timeScale: { borderColor, timeVisible: true },
      });
      const series = chart.addCandlestickSeries({
        upColor: '#3fb950', downColor: '#f85149',
        borderUpColor: '#3fb950', borderDownColor: '#f85149',
        wickUpColor: '#3fb950', wickDownColor: '#f85149',
      });
      const candles = data.map(([t, o, h, l, cl]) => ({
        time: Math.floor(t / 1000), open: o, high: h, low: l, close: cl
      }));
      series.setData(candles);
      chart.timeScale().fitContent();
      window._priceChart = chart;
      // 테마 변경 시 차트 재생성
      window._priceChartData = data;
      new ResizeObserver(() => chart.applyOptions({ width: container.clientWidth })).observe(container);
    } else {
      // 폴백: 기존 라인 차트
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      const priceColor = '#f7931a';
      drawLineChart(canvas, data.map(d => d[4]), priceColor);
    }
  } catch(e) { console.warn('price chart:', e); infoElFail(); }
}

async function loadMempoolHistoryChart() {
  try {
    // Use mempool stats API
    const data = await api('/v1/mining/hashrate/3m');
    // We'll draw the difficulty as a proxy since mempool size history isn't directly available
    // Use the currentHashrate field as a fallback; try fetching mempool stats
    let chartData = [];
    try {
      const mempoolStats = await fetch('https://mempool.space/api/v1/statistics/2h').then(r => r.json());
      if (mempoolStats && mempoolStats.length) {
        chartData = mempoolStats.map(s => s.vbytes_per_second || 0);
      }
    } catch(e) { console.warn('mempool stats fetch:', e); }

    if (!chartData.length && data.hashrates) {
      chartData = data.hashrates.map(h => h.avgHashrate / 1e18);
    }

    const canvas = document.getElementById('mempool-history-chart');
    if (!canvas || !chartData.length) return;
    drawAreaChart(canvas, chartData, '#4488ff');
  } catch(e) { console.warn('mempool history chart:', e); }
}

export function drawLineChart(canvas, values, color) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  const padL = 10, padR = 10, padT = 10, padB = 10;
  const chartW = W - padL - padR, chartH = H - padT - padB;

  const maxVal = Math.max(...values) * 1.02;
  const minVal = Math.min(...values) * 0.98;
  const range = maxVal - minVal || 1;

  ctx.clearRect(0, 0, W, H);

  // Line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  values.forEach((v, i) => {
    const x = padL + (i / (values.length - 1)) * chartW;
    const y = padT + chartH - ((v - minVal) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Gradient fill (separate path)
  const r = parseInt(color.slice(1, 3), 16), g = parseInt(color.slice(3, 5), 16), b = parseInt(color.slice(5, 7), 16);
  const grad2 = ctx.createLinearGradient(0, padT, 0, H - padB);
  grad2.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
  grad2.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = padL + (i / (values.length - 1)) * chartW;
    const y = padT + chartH - ((v - minVal) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(padL + chartW, H - padB);
  ctx.lineTo(padL, H - padB);
  ctx.closePath();
  ctx.fillStyle = grad2;
  ctx.fill();
}

function drawAreaChart(canvas, values, color) {
  drawLineChart(canvas, values, color);
}

// ═══════════════════════════════════════════
// LIGHTNING NETWORK STATS
// ═══════════════════════════════════════════
export async function loadLightningStats() {
  const container = document.getElementById('ln-stats');
  if (!container) return;
  try {
    const data = await api('/v1/lightning/statistics/latest');
    const channelCount = data.latest?.channel_count || data.channel_count || 0;
    const totalCapacity = data.latest?.total_capacity || data.total_capacity || 0;
    const nodeCount = data.latest?.node_count || data.node_count || 0;
    const avgSize = channelCount > 0 ? totalCapacity / channelCount : 0;

    container.innerHTML = `
      <div class="ln-stat stagger-item" style="--i:0"><div class="ln-val">${formatNum(channelCount)}</div><div class="ln-lbl">${t('channels')}</div></div>
      <div class="ln-stat stagger-item" style="--i:1"><div class="ln-val">${(totalCapacity / 1e8).toFixed(2)} BTC</div><div class="ln-lbl">${t('capacity')}</div></div>
      <div class="ln-stat stagger-item" style="--i:2"><div class="ln-val">${formatNum(nodeCount)}</div><div class="ln-lbl">${t('nodes')}</div></div>
      <div class="ln-stat stagger-item" style="--i:3"><div class="ln-val">${formatNum(Math.round(avgSize))} sat</div><div class="ln-lbl">${t('avgChannelSize')}</div></div>
    `;
  } catch {
    container.innerHTML = '<div style="color:var(--text3);font-size:.75rem;padding:8px">Lightning data unavailable</div>';
  }
}

// ── 난이도 조정 타이머 ──
export async function loadDifficultyTimer() {
  try {
    const adj = await api('/v1/difficulty-adjustment');
    const blocksLeft = adj.remainingBlocks;
    const estTime = adj.estimatedRetargetDate;
    const pct = ((adj.difficultyChange || 0) * 100).toFixed(2);
    const sign = adj.difficultyChange >= 0 ? '+' : '';
    const el = document.getElementById('diff-timer');
    if (!el) return;
    const days = Math.floor(blocksLeft * 10 / 60 / 24);
    const hrs = Math.floor((blocksLeft * 10 / 60) % 24);
    el.innerHTML = `<span class="diff-blocks">${formatNum(blocksLeft)} 블록</span> <span class="diff-days">(~${days}일 ${hrs}시간)</span> <span class="diff-pct ${adj.difficultyChange>=0?'up':'down'}">${sign}${pct}% 예상</span>`;
  } catch(e) { console.warn('difficulty timer:', e); }
}

// ── 멤풀 수수료 히트맵 ──
export async function loadMempoolHeatmap() {
  const canvas = document.getElementById('mempool-heatmap');
  if (!canvas) return;
  try {
    // mempool-blocks 데이터 활용
    const blocks = await api('/v1/fees/mempool-blocks');
    if (!blocks?.length) return;
    drawFeeHeatmap(canvas, blocks);
  } catch(e) { console.warn('mempool heatmap:', e); }
}

function drawFeeHeatmap(canvas, blocks) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;

  const feeBands = [1,2,3,4,5,6,8,10,15,20,30,50,100,200];
  const bandH = H / feeBands.length;
  const blockW = Math.min((W - 40) / blocks.length, 60);

  // Y축 라벨
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text3').trim() || '#666';
  ctx.font = `${10 * dpr / dpr}px monospace`;
  ctx.textAlign = 'right';
  feeBands.forEach((fee, i) => {
    const y = H - (i + 1) * bandH;
    ctx.fillText(fee + '+', 34, y + bandH / 2 + 4);
  });

  blocks.forEach((block, bi) => {
    const feeRange = block.feeRange || [];
    const x = 40 + bi * blockW;
    feeBands.forEach((fee, fi) => {
      const y = H - (fi + 1) * bandH;
      // 이 수수료 범위에 tx가 얼마나 있는지
      const inRange = feeRange.filter(f => f >= fee).length / Math.max(feeRange.length, 1);
      const alpha = Math.min(inRange * 2, 1);
      ctx.fillStyle = `rgba(247,147,26,${alpha.toFixed(2)})`;
      ctx.fillRect(x + 1, y + 1, blockW - 2, bandH - 2);
    });
    // 블록 번호
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text3').trim() || '#666';
    ctx.textAlign = 'center';
    ctx.font = `9px sans-serif`;
    ctx.fillText(bi === 0 ? 'Next' : '+' + bi, x + blockW / 2, H - 2);
  });
}

// Register globals for onclick handlers
window.loadDifficultyTimer = loadDifficultyTimer;
window.loadMempoolHeatmap = loadMempoolHeatmap;
