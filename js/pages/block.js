/**
 * block.js — txid.uk Block Page Module
 *
 * Contains: renderBlock, loadBlockTxs, openBlockTreemap, drawBlockTreemap
 */

import {
  state, t, api, icon, NProgress,
  escHtml, formatNum, formatBtc, formatBytes, satToBtc,
  timeAgo, fullDate, shortHash,
  feeColorHex, coloredFeeRate,
  skeletonTable,
  breadcrumb,
  favButton,
  copyToClip, shareUrl,
  highlightWhaleTx,
} from '../core.js';

function navigate(hash) { location.hash = hash; }

// ═══════════════════════════════════════════
// BLOCK PAGE
// ═══════════════════════════════════════════
export async function renderBlock(app, param) {
  app.innerHTML = `<div class="skeleton-page"><div class="skel skel-title"></div><div class="skel skel-hash"></div><div class="skel-grid">${'<div class="skel skel-info-item"></div>'.repeat(8)}</div></div>`;

  try {
    let block;
    if (/^\d+$/.test(param)) {
      const hash = await api('/block-height/' + param);
      block = await api('/block/' + hash);
    } else {
      block = await api('/block/' + param);
    }

    document.title = `블록 #${formatNum(block.height)} | txid.uk`;
    const pool = block.extras?.pool?.name || 'Unknown';
    const totalFees = block.extras?.totalFees || 0;
    const reward = block.extras?.reward || 0;
    const totalOutput = block.extras?.totalOutputAmt || 0;
    const medianFee = block.extras?.medianFee || 0;
    const avgFeeRate = block.extras?.avgFeeRate || null;
    const feeRange = block.extras?.feeRange || null;

    let feeRangeHtml = '';
    if (feeRange && feeRange.length >= 2) {
      feeRangeHtml = `${coloredFeeRate(feeRange[0])} ~ ${coloredFeeRate(feeRange[feeRange.length - 1])}`;
    }

    const favLabel = '#' + formatNum(block.height);

    NProgress.done();
    app.innerHTML = `
      ${breadcrumb([
        { href: '#/', label: t('home') },
        { href: '#/block/' + param, label: t('block') },
        { href: '#/block/' + param, label: '#' + formatNum(block.height) }
      ])}

      <div class="page-actions">
        <div class="page-title">${t('blockExplorer')} #${formatNum(block.height)}</div>
        ${favButton('block', block.id, favLabel)}
        <button class="icon-btn" onclick="openBlockTreemap('${block.id}', ${block.height})" title="Treemap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></button>
        <button class="icon-btn" onclick="showQR('${block.id}','Block Hash QR')" title="QR"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="7" y="7" width="3" height="3" fill="currentColor" stroke="none"/><rect x="14" y="14" width="7" height="7"/><rect x="18" y="7" width="3" height="3" fill="currentColor" stroke="none"/><rect x="7" y="18" width="3" height="3" fill="currentColor" stroke="none"/></svg></button>
        <button class="share-btn" onclick="shareUrl(location.href)" title="Share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
      </div>
      <div class="page-hash-wrap"><div class="page-hash" title="${block.id}">${block.id}</div><button class="copy-hash-btn" onclick="copyToClip('${block.id}',this)" title="${t('copy')}">⧉</button></div>

      <div class="info-grid">
        <div class="info-item"><div class="info-label">${t('height')}</div><div class="info-value accent">${formatNum(block.height)}</div></div>
        <div class="info-item"><div class="info-label">${t('timestamp')}</div><div class="info-value">${fullDate(block.timestamp)}<br><small style="color:var(--text3)">${timeAgo(block.timestamp)}</small></div></div>
        <div class="info-item"><div class="info-label">${t('size')}</div><div class="info-value">${formatBytes(block.size)}</div></div>
        <div class="info-item"><div class="info-label">${t('weight')}</div><div class="info-value">${formatNum(block.weight)} WU</div></div>
        <div class="info-item"><div class="info-label">${t('version')}</div><div class="info-value">0x${block.version.toString(16)}</div></div>
        <div class="info-item"><div class="info-label">${t('merkleRoot')}</div><div class="info-value small">${block.merkle_root}</div></div>
        <div class="info-item"><div class="info-label">${t('bits')}</div><div class="info-value">${block.bits}</div></div>
        <div class="info-item"><div class="info-label">${t('nonce')}</div><div class="info-value">${formatNum(block.nonce)}</div></div>
        <div class="info-item"><div class="info-label">${t('difficulty')}</div><div class="info-value">${Number(block.difficulty).toExponential(2)}</div></div>
        <div class="info-item"><div class="info-label">${t('totalFees')}</div><div class="info-value">${formatBtc(totalFees)}</div></div>
        <div class="info-item"><div class="info-label">${t('subsidy')}</div><div class="info-value">${formatBtc(reward - totalFees)}</div></div>
        <div class="info-item"><div class="info-label">${t('totalOutput')}</div><div class="info-value">${formatBtc(totalOutput)}</div></div>
        <div class="info-item"><div class="info-label">${t('miner')}</div><div class="info-value accent"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle"><path d="M15 4l5 5-11 11H4v-5L15 4z"/><line x1="9" y1="9" x2="15" y2="15"/></svg> ${escHtml(pool)}</div></div>
        <div class="info-item"><div class="info-label">${t('txCount')}</div><div class="info-value">${formatNum(block.tx_count)}</div></div>
        ${avgFeeRate ? `<div class="info-item"><div class="info-label">${t('feeRate')} (avg)</div><div class="info-value">${coloredFeeRate(avgFeeRate)}</div></div>` : ''}
        ${feeRangeHtml ? `<div class="info-item"><div class="info-label">${t('feeRate')} (min~max)</div><div class="info-value">${feeRangeHtml}</div></div>` : ''}
      </div>

      <div id="coinbase-msg-wrap"></div>
      <div class="section-title">${icon('list')} ${t('transactions')}</div>
      <div id="block-txs">${skeletonTable(6)}</div>
      <div id="block-txs-pagination"></div>
    `;

    // 코인베이스 메시지 디코드
    (async () => {
      try {
        const txs = await api('/block/' + block.id + '/txs/0');
        if (txs && txs[0] && txs[0].vin && txs[0].vin[0]) {
          const hex = txs[0].vin[0].scriptsig || '';
          if (hex.length > 4) {
            const bytes = hex.match(/.{2}/g) || [];
            const decoded = bytes.map(b => {
              const c = parseInt(b, 16);
              return (c >= 0x20 && c <= 0x7e) ? String.fromCharCode(c) : '';
            }).join('');
            const filtered = decoded.replace(/\s+/g, ' ').trim();
            if (filtered.length > 2) {
              const wrap = document.getElementById('coinbase-msg-wrap');
              if (wrap) wrap.innerHTML = '<div class="coinbase-msg"><span class="coinbase-label">Coinbase</span><span class="coinbase-text font-mono">' + escHtml(filtered) + '</span></div>';
            }
          }
        }
      } catch {}
    })();

    // 블록 네비게이션 삽입
    const prevHash = block.previousblockhash;
    const heightNum = block.height;
    const blockNavHtml = `<div class="block-nav">
      ${prevHash ? `<a href="#/block/${prevHash}" class="block-nav-btn">← #${formatNum(heightNum-1)}</a>` : `<span class="block-nav-btn disabled">← Genesis</span>`}
      <span class="block-nav-current">#${formatNum(heightNum)}</span>
      <button class="block-nav-btn" id="next-block-btn">#${formatNum(heightNum+1)} →</button>
    </div>`;
    const infoGrid = app.querySelector('.info-grid');
    if (infoGrid) infoGrid.insertAdjacentHTML('beforebegin', blockNavHtml);
    api('/block-height/' + (heightNum + 1)).then(nextHash => {
      const btn = document.getElementById('next-block-btn');
      if (btn && nextHash) btn.onclick = () => navigate('#/block/' + nextHash);
    }).catch(() => {
      const btn = document.getElementById('next-block-btn');
      if (btn) btn.style.display = 'none';
    });

    loadBlockTxs(block.id, block.tx_count, 0);
    // 블록 treemap 버튼 (page-actions에 이미 있음)
  } catch (e) {
    NProgress.done(); app.innerHTML = `<div class="error-box">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

export async function loadBlockTxs(blockHash, totalCount, startIdx) {
  const container = document.getElementById('block-txs');
  const pagination = document.getElementById('block-txs-pagination');
  if (!container) return;

  container.innerHTML = skeletonTable(6);

  try {
    const txs = await api(`/block/${blockHash}/txs/${startIdx}`);
    const perPage = 25;
    const currentPage = Math.floor(startIdx / perPage);
    const totalPages = Math.ceil(totalCount / perPage);

    container.innerHTML = `
      <div class="tx-table-wrap">
        <table class="tx-table">
          <thead><tr>
            <th>TXID</th>
            <th>${t('inputs')}</th>
            <th>${t('outputs')}</th>
            <th>${t('value')} (BTC)</th>
            <th>${t('fee')} (sat)</th>
            <th>${t('feeRate')}</th>
            <th>${t('size')}</th>
          </tr></thead>
          <tbody>
            ${txs.map((tx, i) => {
              const isCoinbase = tx.vin && tx.vin[0] && tx.vin[0].is_coinbase;
              const totalOut = tx.vout ? tx.vout.reduce((s, o) => s + (o.value || 0), 0) : 0;
              const feeRate = !isCoinbase && tx.weight ? (tx.fee / (tx.weight / 4)).toFixed(1) : null;
              const whaleCls = highlightWhaleTx(tx);
              return `<tr class="stagger-item ${whaleCls}" style="--i:${i}">
                <td class="txid-col"><a href="#/tx/${tx.txid}">${isCoinbase ? '<span class="coinbase">[CB]</span> ' : ''}${tx.txid.slice(0, 16)}...</a></td>
                <td>${tx.vin ? tx.vin.length : 0}</td>
                <td>${tx.vout ? tx.vout.length : 0}</td>
                <td>${satToBtc(totalOut)}</td>
                <td>${isCoinbase ? '—' : formatNum(tx.fee)}</td>
                <td>${feeRate ? coloredFeeRate(feeRate) : '—'}</td>
                <td>${formatNum(tx.size)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    pagination.innerHTML = `
      <div class="pagination">
        <button ${currentPage === 0 ? 'disabled' : ''} onclick="loadBlockTxs('${blockHash}', ${totalCount}, ${(currentPage - 1) * perPage})">${t('prev')}</button>
        <span class="page-info">${t('page')} ${currentPage + 1} ${t('of')} ${totalPages}</span>
        <button ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="loadBlockTxs('${blockHash}', ${totalCount}, ${(currentPage + 1) * perPage})">${t('next')}</button>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<div class="error-box">${t('error')}</div>`;
  }
}

// ── 블록 Treemap ──
export async function openBlockTreemap(blockId, height) {
  document.getElementById('treemap-modal')?.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'treemap-modal';
  modal.innerHTML = `<div class="modal-box" style="max-width:620px;width:95vw">
    <div class="modal-header">
      <span>Block #${height} Treemap</span>
      <button class="modal-close" onclick="document.getElementById('treemap-modal')?.remove()">✕</button>
    </div>
    <div style="font-size:.68rem;color:var(--text3);margin-bottom:8px">${state.lang==='ko'?'크기 = 가상 크기 (vsize), 색 = 수수료율':'Size = vsize, Color = fee rate'}</div>
    <canvas id="treemap-canvas" style="width:100%;height:300px;display:block;border-radius:6px"></canvas>
    <div class="treemap-legend">
      ${[['#ff4444','≥100'],['#ff8800','≥20'],['#f7931a','≥10'],['#ffcc00','≥5'],['#44bb44','≥2'],['#4488ff','<2']].map(([c,l])=>`<span><i style="background:${c}"></i>${l} sat/vB</span>`).join('')}
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });

  try {
    const txs = await api('/block/' + blockId + '/txs/0');
    setTimeout(() => drawBlockTreemap(txs), 80);
  } catch {}
}

function drawBlockTreemap(txs) {
  const canvas = document.getElementById('treemap-canvas');
  if (!canvas || !txs?.length) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;

  function feeCol(rate) {
    if (rate >= 100) return '#ff4444';
    if (rate >= 20) return '#ff8800';
    if (rate >= 10) return '#f7931a';
    if (rate >= 5) return '#ffcc00';
    if (rate >= 2) return '#44bb44';
    return '#4488ff';
  }

  // coinbase 제외, vsize 기준 정렬
  const items = txs.slice(1).map(t => ({
    v: t.vsize || 250,
    rate: t.fee && t.vsize ? t.fee / t.vsize : 1
  })).sort((a,b) => b.v - a.v);

  const total = items.reduce((s,t) => s + t.v, 0);
  if (!total) return;

  // 단순 strip treemap
  function layoutStrip(items, x, y, w, h) {
    if (!items.length || w < 1 || h < 1) return;
    const stripTotal = items.reduce((s,t) => s + t.v, 0);
    const horizontal = w >= h;
    let offset = 0;
    items.forEach(item => {
      const ratio = item.v / stripTotal;
      if (horizontal) {
        const tw = w * ratio;
        ctx.fillStyle = feeCol(item.rate);
        ctx.fillRect(x + offset + 0.5, y + 0.5, tw - 1, h - 1);
        offset += tw;
      } else {
        const th = h * ratio;
        ctx.fillStyle = feeCol(item.rate);
        ctx.fillRect(x + 0.5, y + offset + 0.5, w - 1, th - 1);
        offset += th;
      }
    });
  }

  // 행 단위로 나눠서 배치
  const ROW_SIZE = Math.ceil(items.length / Math.ceil(Math.sqrt(items.length)));
  let y = 0;
  for (let i = 0; i < items.length; i += ROW_SIZE) {
    const row = items.slice(i, i + ROW_SIZE);
    const rowTotal = row.reduce((s,t) => s + t.v, 0);
    const rh = (rowTotal / total) * H;
    layoutStrip(row, 0, y, W, rh);
    y += rh;
  }
}

// Register globals for onclick handlers
window.loadBlockTxs = loadBlockTxs;
window.openBlockTreemap = openBlockTreemap;
