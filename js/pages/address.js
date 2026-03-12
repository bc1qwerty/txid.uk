/**
 * address.js — txid.uk Address Page Module
 *
 * Contains: renderAddress, loadAddrTxs, loadAddrUtxo,
 *           loadAddressBalanceChart, showAddressCluster
 */

import {
  state, t, api, icon, NProgress,
  escHtml, formatNum, formatBtc, satToBtc,
  timeAgo, fullDate, shortHash, shortAddr,
  coloredFeeRate,
  skeletonTable, skeletonAddrStats,
  breadcrumb,
  favButton,
  copyToClip, shareUrl,
  toggleMonitor, getMonitoredAddrs, saveMonitoredAddrs,
  getAddrLabel, promptAddrLabel,
  highlightWhaleTx,
} from '../core.js';
import { drawLineChart } from './home.js';

function navigate(hash) { location.hash = hash; }

// ═══════════════════════════════════════════
// ADDRESS PAGE
// ═══════════════════════════════════════════
export async function renderAddress(app, address) {
  app.innerHTML = skeletonAddrStats(5) + skeletonTable(6);

  try {
    const info = await api('/address/' + address);
    document.title = `${address.slice(0,12)}… | txid.uk`;
    const chain = info.chain_stats || {};
    const mempool = info.mempool_stats || {};
    const balance = (chain.funded_txo_sum - chain.spent_txo_sum) + (mempool.funded_txo_sum - mempool.spent_txo_sum);
    const totalReceived = chain.funded_txo_sum + mempool.funded_txo_sum;
    const totalSent = chain.spent_txo_sum + mempool.spent_txo_sum;
    const txCount = chain.tx_count + mempool.tx_count;

    function getAddrTypeFromAddr(addr) {
      if (addr.startsWith('bc1p') || addr.startsWith('tb1p')) return 'P2TR';
      if (addr.startsWith('bc1q') || addr.startsWith('tb1q')) return 'P2WPKH';
      if (addr.startsWith('3') || addr.startsWith('2')) return 'P2SH';
      if (addr.startsWith('1') || addr.startsWith('m') || addr.startsWith('n')) return 'P2PKH';
      return '?';
    }

    const isMonitored = !!getMonitoredAddrs()[address];
    const favLabel = shortAddr(address);

    // Update monitor txCount
    const m = getMonitoredAddrs();
    if (m[address]) {
      m[address].txCount = txCount;
      saveMonitoredAddrs(m);
    }

    NProgress.done();
    app.innerHTML = `
      ${breadcrumb([
        { href: '#/', label: t('home') },
        { href: '#/address/' + address, label: t('address') },
        { href: '#/address/' + address, label: shortHash(address) }
      ])}

      <div class="page-actions">
        <div class="page-title">${t('address')}</div>
        ${favButton('address', address, favLabel)}
        <button class="icon-btn" onclick="showQR('${address}', '${state.lang==='ko'?'주소 QR':'Address QR'}')" title="QR Code"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="7" y="7" width="3" height="3" fill="currentColor" stroke="none"/><rect x="14" y="14" width="7" height="7"/><rect x="18" y="7" width="3" height="3" fill="currentColor" stroke="none"/><rect x="7" y="18" width="3" height="3" fill="currentColor" stroke="none"/></svg></button>
        <button class="icon-btn" id="addr-label-btn" onclick="promptAddrLabel('${address}')" title="${getAddrLabel(address)||'메모 추가'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
        <button class="share-btn" onclick="shareUrl(location.href)" title="Share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
        <button class="monitor-btn ${isMonitored ? 'active' : ''}" data-addr="${address}" onclick="toggleMonitor('${address}')">${icon('bell')} ${t('monitoring')}</button>
        <button class="monitor-btn" onclick="App.showQR('${address}')">📱 ${t('qrView')}</button>
        <button class="icon-btn" style="padding:6px 12px;font-size:.72rem;font-family:var(--font-ko);border-color:var(--accent);color:var(--accent)" onclick="openViz('addr','${address}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> 시각화</button>
        <button class="icon-btn" style="padding:6px 12px;font-size:.72rem;font-family:var(--font-ko)" onclick="openPortfolioAdd('${address}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> 포트폴리오</button>
        <button class="icon-btn" onclick="showAddressCluster('${address}')" title="${state.lang==='ko'?'연관 주소 분석':'Cluster'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/></svg></button>
        <button class="icon-btn" onclick="openAddressNotes('${address}')" title="${state.lang==='ko'?'메모':'Notes'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></button>
      </div>
      ${getAddrLabel(address) ? `<div class="addr-label-display" id="addr-label-display">${escHtml(getAddrLabel(address))}</div>` : '<div class="addr-label-display" id="addr-label-display" style="display:none"></div>'}
      <div class="page-hash-wrap"><div class="page-hash" title="${address}">${address}</div><button class="copy-hash-btn" onclick="copyToClip('${address}',this)" title="${t('copy')}">⧉</button></div>

      <div class="addr-summary">
        <div class="addr-stat stagger-item" style="--i:0"><div class="as-val">${getAddrTypeFromAddr(address)}</div><div class="as-lbl">${t('type')}</div></div>
        <div class="addr-stat addr-balance stagger-item" style="--i:1"><div class="as-val">${formatBtc(balance)}</div><div class="as-lbl">${t('balance')}</div></div>
        <div class="addr-stat stagger-item" style="--i:2"><div class="as-val">${formatBtc(totalReceived)}</div><div class="as-lbl">${t('totalReceived')}</div></div>
        <div class="addr-stat stagger-item" style="--i:3"><div class="as-val">${formatBtc(totalSent)}</div><div class="as-lbl">${t('totalSent')}</div></div>
        <div class="addr-stat stagger-item" style="--i:4"><div class="as-val">${formatNum(txCount)}</div><div class="as-lbl">${t('txCount')}</div></div>
      </div>

      <div class="addr-tabs">
        <button class="addr-tab active" data-tab="txs">${t('txHistory')}</button>
        <button class="addr-tab" data-tab="utxo">UTXO</button>
      </div>
      <div id="tab-txs">
        <div id="addr-txs">${skeletonTable(6)}</div>
        <div id="addr-txs-more"></div>
      </div>
      <div id="tab-utxo" hidden></div>
    `;

    // 탭 전환
    app.querySelectorAll('.addr-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        app.querySelectorAll('.addr-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.getElementById('tab-txs').hidden = tab !== 'txs';
        document.getElementById('tab-utxo').hidden = tab !== 'utxo';
        if (tab === 'utxo' && !document.getElementById('tab-utxo').dataset.loaded) {
          loadAddrUtxo(address);
        }
      });
    });

    loadAddrTxs(address, null);
    loadAddressBalanceChart(address);
  } catch (e) {
    NProgress.done(); app.innerHTML = `<div class="error-box" role="alert">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

export async function loadAddrTxs(address, lastTxid) {
  const container = document.getElementById('addr-txs');
  const moreBtn = document.getElementById('addr-txs-more');
  if (!container) return;

  if (!lastTxid) container.innerHTML = skeletonTable(6);

  try {
    const url = lastTxid ? `/address/${address}/txs/chain/${lastTxid}` : `/address/${address}/txs`;
    const txs = await api(url);

    const html = txs.map((tx, i) => {
      const totalOut = tx.vout ? tx.vout.reduce((s, o) => s + (o.value || 0), 0) : 0;
      const isConfirmed = tx.status && tx.status.confirmed;
      const whaleCls = highlightWhaleTx(tx);
      return `<tr class="stagger-item ${whaleCls}" style="--i:${i}">
        <td class="txid-col"><a href="#/tx/${tx.txid}">${tx.txid.slice(0, 16)}...</a></td>
        <td><span class="badge ${isConfirmed ? 'badge-confirmed' : 'badge-unconfirmed'}" style="font-size:.6rem;padding:1px 5px">${isConfirmed ? formatNum(tx.status.block_height) : t('unconfirmed')}</span></td>
        <td>${satToBtc(totalOut)}</td>
        <td>${tx.fee != null ? formatNum(tx.fee) : '—'}</td>
      </tr>`;
    }).join('');

    if (!lastTxid) {
      container.innerHTML = `
        <div class="tx-table-wrap">
          <table class="tx-table" id="addr-tx-table">
            <thead><tr>
              <th>TXID</th>
              <th>${t('height')}</th>
              <th>${t('value')} (BTC)</th>
              <th>${t('fee')} (sat)</th>
            </tr></thead>
            <tbody>${html}</tbody>
          </table>
        </div>
      `;
    } else {
      const tbody = document.querySelector('#addr-tx-table tbody');
      if (tbody) tbody.insertAdjacentHTML('beforeend', html);
    }

    if (txs.length >= 25) {
      const lastId = txs[txs.length - 1].txid;
      moreBtn.innerHTML = '<div id="addr-txs-sentinel" style="height:8px"></div>';
      if (typeof IntersectionObserver !== 'undefined') {
        const obs = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) { obs.disconnect(); loadAddrTxs(address, lastId); }
        }, { threshold: 0.1 });
        obs.observe(document.getElementById('addr-txs-sentinel'));
      } else {
        moreBtn.innerHTML = `<div class="pagination"><button class="load-more-btn" data-address="${escHtml(address)}" data-last="${escHtml(lastId)}">${t('next')} →</button></div>`;
        moreBtn.querySelector('.load-more-btn').addEventListener('click', () => loadAddrTxs(address, lastId));
      }
    } else {
      moreBtn.innerHTML = '';
    }
  } catch (e) {
    container.innerHTML = `<div class="error-box" role="alert">${t('error')}</div>`;
  }
}

// ═══════════════════════════════════════════
// UTXO LOADER
// ═══════════════════════════════════════════
export async function loadAddrUtxo(address) {
  const container = document.getElementById('tab-utxo');
  if (!container) return;
  container.dataset.loaded = '1';
  container.innerHTML = `<div class="loading">${t('loading')}</div>`;
  try {
    const utxos = await api('/address/' + address + '/utxo');
    const totalBtc = utxos.reduce((s, u) => s + (u.value || 0), 0);
    container.innerHTML = `
      <div class="utxo-sum">${state.lang==='ko'?'UTXO':state.lang==='ja'?'UTXO':'UTXO'}: <strong>${formatNum(utxos.length)}</strong> ${state.lang==='ko'?'개':''} · ${state.lang==='ko'?'합계':state.lang==='ja'?'合計':'Total'}: <strong>${satToBtc(totalBtc)} BTC</strong></div>
      <div class="tx-table-wrap">
        <table class="utxo-table">
          <thead><tr><th>TXID</th><th>${state.lang==='ko'?'블록높이':state.lang==='ja'?'ブロック高':'Block'}</th><th>BTC</th></tr></thead>
          <tbody>${utxos.map(u => `<tr>
            <td><a href="#/tx/${u.txid}" style="color:var(--blue)">${u.txid.slice(0,12)}…:${u.vout}</a></td>
            <td>${u.status && u.status.confirmed ? formatNum(u.status.block_height) : t('unconfirmed')}</td>
            <td>${satToBtc(u.value)}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>`;
  } catch (e) {
    container.innerHTML = `<div class="error-box" role="alert">${t('error')}</div>`;
  }
}

// ── 주소 잔액 히스토리 ──
export async function loadAddressBalanceChart(address) {
  const canvas = document.getElementById('addr-balance-chart');
  if (!canvas) return;
  try {
    const txs = await api('/address/' + address + '/txs');
    if (!txs?.length) return;
    // 누적 잔액 계산
    let balance = 0;
    const points = [];
    [...txs].reverse().forEach(tx => {
      const recv = (tx.vout||[]).filter(v => v.scriptpubkey_address === address).reduce((s,v) => s+v.value,0);
      const sent = (tx.vin||[]).filter(v => v.prevout?.scriptpubkey_address === address).reduce((s,v) => s+(v.prevout?.value||0),0);
      balance += recv - sent;
      points.push({ t: tx.status?.block_time || Date.now()/1000, v: balance / 1e8 });
    });
    if (points.length < 2) return;
    drawLineChart(canvas, points, 'BTC', '#f7931a');
  } catch(e) { console.warn('address balance chart:', e); }
}

// ── 주소 클러스터 분석 ──
export async function showAddressCluster(address) {
  document.getElementById('cluster-modal')?.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'cluster-modal';
  modal.innerHTML = `<div class="modal-box" style="max-width:520px">
    <div class="modal-header">
      <span>${state.lang==='ko'?'연관 주소 분석':'Address Cluster'}</span>
      <button class="modal-close" onclick="document.getElementById('cluster-modal')?.remove()">✕</button>
    </div>
    <div id="cluster-content" style="font-size:.78rem;color:var(--text2)">
      <div class="loading">${t('loading')}</div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
  try {
    const txs = await api('/address/' + address + '/txs');
    const related = {};
    txs.slice(0, 10).forEach(tx => {
      (tx.vin||[]).forEach(v => {
        const a = v.prevout?.scriptpubkey_address;
        if (a && a !== address) related[a] = (related[a]||0) + 1;
      });
      (tx.vout||[]).forEach(v => {
        const a = v.scriptpubkey_address;
        if (a && a !== address) related[a] = (related[a]||0) + 1;
      });
    });
    const sorted = Object.entries(related).sort((a,b)=>b[1]-a[1]).slice(0,15);
    const el = document.getElementById('cluster-content');
    if (!el) return;
    if (!sorted.length) { el.innerHTML = `<div class="empty-state">${state.lang==='ko'?'연관 주소 없음':'No related addresses'}</div>`; return; }
    el.innerHTML = `<div style="margin-bottom:8px;color:var(--text3);font-size:.7rem">${state.lang==='ko'?'최근 10개 TX 기반 연관 주소':'Related addresses from last 10 TXs'}</div>
      <div class="cluster-list">
        ${sorted.map(([addr, cnt]) => `
          <div class="cluster-row">
            <a href="#/address/${addr}" onclick="document.getElementById('cluster-modal')?.remove()" class="cluster-addr">${addr.slice(0,20)}…</a>
            <span class="cluster-cnt">${cnt}회</span>
          </div>`).join('')}
      </div>`;
  } catch { document.getElementById('cluster-content').innerHTML = `<div class="empty-state">데이터 로드 실패</div>`; }
}

// Register globals for onclick handlers
window.loadAddrTxs = loadAddrTxs;
window.loadAddrUtxo = loadAddrUtxo;
window.loadAddressBalanceChart = loadAddressBalanceChart;
window.showAddressCluster = showAddressCluster;
