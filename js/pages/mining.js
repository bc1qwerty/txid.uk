/**
 * mining.js — txid.uk Mining Page Module
 *
 * Contains: renderMining, renderHashrateChart, renderPoolChart
 */

import {
  state, t, api, icon, NProgress,
  escHtml, formatNum, formatBtc,
  skeletonCards,
  breadcrumb,
} from '../core.js';

function navigate(hash) { location.hash = hash; }

// ═══════════════════════════════════════════
// MINING PAGE
// ═══════════════════════════════════════════
export async function renderMining(app) {
  app.innerHTML = skeletonCards(6);

  try {
    document.title = (state.lang==='ko'?'채굴 통계':state.lang==='ja'?'マイニング統計':'Mining Stats') + ' | txid.uk';
    const [hashrate, diffAdj, blocks] = await Promise.all([
      api('/v1/mining/hashrate/1m'),
      api('/v1/difficulty-adjustment'),
      api('/v1/blocks')
    ]);

    const recentBlocks = blocks.slice(0, 144);
    const minerMap = {};
    let totalFees = 0, totalReward = 0;
    recentBlocks.forEach(b => {
      const pool = b.extras?.pool?.name || 'Unknown';
      minerMap[pool] = (minerMap[pool] || 0) + 1;
      totalFees += b.extras?.totalFees || 0;
      totalReward += b.extras?.reward || 0;
    });
    const topMiners = Object.entries(minerMap).sort((a, b) => b[1] - a[1]);

    let avgBlockTime = 600;
    if (recentBlocks.length > 1) {
      const first = recentBlocks[recentBlocks.length - 1].timestamp;
      const last = recentBlocks[0].timestamp;
      avgBlockTime = (last - first) / (recentBlocks.length - 1);
    }

    const diffProgress = diffAdj.progressPercent || 0;
    const estChange = diffAdj.difficultyChange || 0;

    NProgress.done();
    app.innerHTML = `
      ${breadcrumb([
        { href: '#/', label: t('home') },
        { href: '#/mining', label: t('miningStats') }
      ])}

      <div class="page-title">${icon('pickaxe')} ${t('miningStats')}</div>

      <div class="mining-stats-row">
        <div class="ms-card stagger-item" style="--i:0"><div class="ms-val">${formatNum(recentBlocks[0]?.height)}</div><div class="ms-lbl">${t('blockHeight')}</div></div>
        <div class="ms-card stagger-item" style="--i:1"><div class="ms-val">${Math.round(avgBlockTime / 60 * 10) / 10} min</div><div class="ms-lbl">${t('avgBlockTime')} (${t('blocks144')})</div></div>
        <div class="ms-card stagger-item" style="--i:2"><div class="ms-val">${formatBtc(Math.round(totalReward / recentBlocks.length))}</div><div class="ms-lbl">${t('blockReward')} (avg)</div></div>
        <div class="ms-card stagger-item" style="--i:3"><div class="ms-val">${formatBtc(Math.round(totalFees / recentBlocks.length))}</div><div class="ms-lbl">${t('fee')} (avg/block)</div></div>
      </div>

      <div class="mining-grid">
        <div class="mining-card stagger-item" style="--i:4">
          <h3>${icon('trending-up')} ${t('hashrate')} (30${state.lang === 'ko' ? '일' : state.lang === 'ja' ? '日' : ' days'})</h3>
          <canvas id="hashrate-chart"></canvas>
        </div>
        <div class="mining-card stagger-item" style="--i:5">
          <h3>${icon('target')} ${t('diffAdj')}</h3>
          <div style="margin-bottom:8px;font-size:.75rem;color:var(--text2)">
            ${t('progress')}: ${diffProgress.toFixed(1)}% (${diffAdj.remainingBlocks || '?'} ${state.lang === 'ko' ? '블록 남음' : state.lang === 'ja' ? 'ブロック残り' : 'blocks left'})
          </div>
          <div class="diff-bar-wrap">
            <div class="diff-bar" style="width:${diffProgress}%"></div>
            <div class="diff-bar-text">${diffProgress.toFixed(1)}%</div>
          </div>
          <div style="margin-top:8px;font-size:.75rem;color:var(--text2)">
            ${t('estimatedAdj')}: <span style="color:${estChange >= 0 ? 'var(--green)' : 'var(--red)'}">${estChange >= 0 ? '+' : ''}${estChange.toFixed(2)}%</span>
          </div>
          <div style="margin-top:4px;font-size:.68rem;color:var(--text3)">
            ${state.lang === 'ko' ? '예상 시간' : state.lang === 'ja' ? '推定時間' : 'Estimated'}: ${diffAdj.estimatedRetargetDate ? new Date(diffAdj.estimatedRetargetDate).toLocaleDateString() : '?'}
          </div>
        </div>
      </div>

      <div class="mining-card stagger-item" style="--i:6;margin-bottom:20px">
        <h3>${icon('trophy')} ${t('topMiners')} (${t('blocks144')})</h3>
        <table class="miners-table">
          <thead><tr><th>${t('miner')}</th><th>${state.lang === 'ko' ? '블록' : state.lang === 'ja' ? 'ブロック' : 'Blocks'}</th><th>%</th><th></th></tr></thead>
          <tbody>
            ${topMiners.slice(0, 15).map(([name, count], i) => {
              const pct = (count / recentBlocks.length * 100).toFixed(1);
              return `<tr class="stagger-item" style="--i:${i + 7}">
                <td>${escHtml(name)}</td>
                <td>${count}</td>
                <td>${pct}%</td>
                <td><div class="miner-bar" style="width:${pct}%"></div></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    renderHashrateChart(hashrate);
    // 파이차트 카드 삽입
    const poolCard = document.createElement('div');
    poolCard.className = 'mining-card';
    poolCard.style.marginBottom = '20px';
    poolCard.innerHTML = `<h3>${icon('bar-chart')} ${state.lang==='ko'?'풀 점유율':state.lang==='ja'?'プールシェア':'Pool Share'} (${t('blocks144')})</h3><canvas id="pool-chart" style="width:100%;height:220px;display:block"></canvas>`;
    app.appendChild(poolCard);
    setTimeout(() => renderPoolChart(topMiners, recentBlocks.length), 200);
  } catch (e) {
    NProgress.done(); app.innerHTML = `<div class="error-box">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

export function renderHashrateChart(data) {
  const canvas = document.getElementById('hashrate-chart');
  if (!canvas) return;

  const hashrates = data.hashrates || [];
  if (!hashrates.length) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;

  const values = hashrates.map(h => h.avgHashrate / 1e18);
  const maxVal = Math.max(...values) * 1.1;
  const minVal = Math.min(...values) * 0.9;
  const range = maxVal - minVal || 1;
  const padL = 50, padR = 10, padT = 10, padB = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  ctx.clearRect(0, 0, W, H);

  const cssBorder = getComputedStyle(document.documentElement).getPropertyValue("--border").trim() || "#21262d";
  const cssText3 = getComputedStyle(document.documentElement).getPropertyValue("--text3").trim() || "#6e7681";
  const cssAccent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#f7931a";

  ctx.strokeStyle = cssBorder;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    const val = maxVal - (range / 4) * i;
    ctx.fillStyle = cssText3;
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(0) + ' EH/s', padL - 4, y + 3);
  }

  ctx.beginPath();
  ctx.strokeStyle = cssAccent;
  ctx.lineWidth = 1.5;
  values.forEach((v, i) => {
    const x = padL + (i / (values.length - 1)) * chartW;
    const y = padT + chartH - ((v - minVal) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Parse accent color for gradient
  const accentHex = cssAccent.startsWith('#') ? cssAccent : '#f7931a';
  const ar = parseInt(accentHex.slice(1, 3), 16), ag = parseInt(accentHex.slice(3, 5), 16), ab = parseInt(accentHex.slice(5, 7), 16);
  const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
  grad.addColorStop(0, `rgba(${ar},${ag},${ab},0.15)`);
  grad.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = padL + (i / (values.length - 1)) * chartW;
    const y = padT + chartH - ((v - minVal) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(padL + chartW, H - padB);
  ctx.lineTo(padL, H - padB);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
}

export function renderPoolChart(miners, total) {
  const canvas = document.getElementById('pool-chart');
  if (!canvas || !miners.length) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  const cx = W * 0.3, cy = H / 2, r = Math.min(cx - 10, cy - 10);
  const colors = ['#f7931a','#4488ff','#3fb950','#f85149','#d29922','#ff8800','#a855f7','#06b6d4','#f43f5e','#84cc16','#8b949e'];
  const top10 = miners.slice(0, 10);
  const otherCount = miners.slice(10).reduce((s, [,c]) => s + c, 0);
  const segs = otherCount > 0 ? [...top10, ['Other', otherCount]] : top10;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text2').trim();
  let angle = -Math.PI / 2;
  segs.forEach(([, count], i) => {
    const slice = (count / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length]; ctx.fill();
    ctx.strokeStyle = bg; ctx.lineWidth = 2; ctx.stroke();
    angle += slice;
  });
  ctx.textAlign = 'left';
  ctx.font = '11px sans-serif';
  segs.forEach(([name, count], i) => {
    const y = 18 + i * 18;
    if (y > H - 8) return;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(W * 0.63, y - 11, 12, 12);
    ctx.fillStyle = textColor;
    ctx.fillText(name.slice(0, 13) + ' ' + (count/total*100).toFixed(1) + '%', W * 0.63 + 16, y);
  });
}

// Register globals for onclick handlers
window.renderPoolChart = renderPoolChart;
