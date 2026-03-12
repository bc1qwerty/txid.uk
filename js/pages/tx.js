/**
 * tx.js — txid.uk Transaction Page Module
 *
 * Contains: renderTx, renderTxFlowDiagram, renderTxFlowD3, renderTxFlowFallback
 */

import {
  state, t, api, NProgress,
  escHtml, formatNum, formatBtc, satToBtc,
  timeAgo, fullDate, shortHash,
  coloredFeeRate,
  breadcrumb,
  favButton,
  copyToClip, shareUrl,
  loadScript, CDN_D3,
} from '../core.js';

function navigate(hash) { location.hash = hash; }

// ═══════════════════════════════════════════
// TRANSACTION PAGE
// ═══════════════════════════════════════════
export async function renderTx(app, txid) {
  app.innerHTML = `<div class="skeleton-page"><div class="skel skel-title"></div><div class="skel skel-hash"></div><div class="skel-grid">${'<div class="skel skel-info-item"></div>'.repeat(6)}</div><div class="skel skel-section"></div></div>`;

  try {
    const tx = await api('/tx/' + txid);
    document.title = `TX ${txid.slice(0,8)}… | txid.uk`;
    const isConfirmed = tx.status && tx.status.confirmed;
    const totalIn = tx.vin ? tx.vin.reduce((s, v) => s + (v.prevout ? v.prevout.value || 0 : 0), 0) : 0;
    const totalOut = tx.vout ? tx.vout.reduce((s, o) => s + (o.value || 0), 0) : 0;
    const isCoinbase = tx.vin && tx.vin[0] && tx.vin[0].is_coinbase;
    const feeRate = !isCoinbase && tx.weight ? (tx.fee / (tx.weight / 4)) : 0;

    // RBF / CPFP 감지
    const isRbf = !isCoinbase && tx.vin && tx.vin.some(v => v.sequence < 0xfffffffe && v.sequence !== 0xffffffff);
    const hasCpfp = !isConfirmed && !isCoinbase && tx.vin && tx.vin.some(v => !v.prevout);

    function getAddrType(scriptpubkey_type) {
      const types = {
        'p2pkh': 'P2PKH', 'p2sh': 'P2SH', 'v0_p2wpkh': 'P2WPKH',
        'v0_p2wsh': 'P2WSH', 'v1_p2tr': 'P2TR', 'op_return': 'OP_RETURN',
        'multisig': 'Multisig', 'p2pk': 'P2PK'
      };
      return types[scriptpubkey_type] || scriptpubkey_type || '?';
    }

    let bcItems = [{ href: '#/', label: t('home') }];
    if (isConfirmed) {
      bcItems.push({ href: '#/block/' + tx.status.block_hash, label: t('block') + ' #' + formatNum(tx.status.block_height) });
    }
    bcItems.push({ href: '#/tx/' + txid, label: 'TX ' + shortHash(txid) });

    const favLabel = 'TX ' + shortHash(txid);

    NProgress.done();
    app.innerHTML = `
      ${breadcrumb(bcItems)}

      <div class="page-actions">
        <div class="page-title">
          ${isCoinbase ? '' : ''}${t('transaction')}
          <span class="badge ${isConfirmed ? 'badge-confirmed' : 'badge-unconfirmed'}">${isConfirmed ? t('confirmed') : t('unconfirmed')}</span>
          ${isRbf ? '<span class="tx-badge rbf">RBF</span>' : ''}
          ${hasCpfp ? '<span class="tx-badge cpfp">CPFP</span>' : ''}
        </div>
        ${favButton('tx', tx.txid, favLabel)}
        <button class="icon-btn" onclick="showQR('' + txid + '','TXID QR')" title="QR Code"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="7" y="7" width="3" height="3" fill="currentColor" stroke="none"/><rect x="14" y="14" width="7" height="7"/><rect x="18" y="7" width="3" height="3" fill="currentColor" stroke="none"/><rect x="7" y="18" width="3" height="3" fill="currentColor" stroke="none"/></svg></button>
        <button class="share-btn" onclick="shareUrl(location.href)" title="Share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
      </div>
      <div class="page-hash-wrap"><div class="page-hash" title="${tx.txid}">${tx.txid}</div><button class="copy-hash-btn" onclick="copyToClip('${tx.txid}',this)" title="${t('copy')}">⧉</button></div>

      <div class="info-grid">
        <div class="info-item"><div class="info-label">TXID</div><div class="info-value small">${tx.txid}</div></div>
        <div class="info-item"><div class="info-label">${t('height')}</div><div class="info-value">${isConfirmed ? `<a href="#/block/${tx.status.block_hash}">${formatNum(tx.status.block_height)}</a>` : '—'}</div></div>
        <div class="info-item"><div class="info-label">${t('timestamp')}</div><div class="info-value">${isConfirmed ? fullDate(tx.status.block_time) + '<br><small style="color:var(--text3)">' + timeAgo(tx.status.block_time) + '</small>' : '—'}</div></div>
        <div class="info-item"><div class="info-label">${t('fee')}</div><div class="info-value">${isCoinbase ? '—' : formatNum(tx.fee) + ' sat (' + formatBtc(tx.fee) + ')'}</div></div>
        <div class="info-item"><div class="info-label">${t('feeRate')}</div><div class="info-value">${isCoinbase ? '—' : coloredFeeRate(feeRate)}</div></div>
        <div class="info-item"><div class="info-label">${t('size')}</div><div class="info-value">${formatNum(tx.size)} bytes</div></div>
        <div class="info-item"><div class="info-label">${t('vsize')}</div><div class="info-value">${formatNum(Math.ceil(tx.weight / 4))} vBytes</div></div>
        <div class="info-item"><div class="info-label">${t('weight')}</div><div class="info-value">${formatNum(tx.weight)} WU</div></div>
        <div class="info-item"><div class="info-label">${t('version')}</div><div class="info-value">${tx.version}</div></div>
        <div class="info-item"><div class="info-label">${t('locktime')}</div><div class="info-value">${formatNum(tx.locktime)}</div></div>
        <div class="info-item"><div class="info-label">${t('rbf')}</div><div class="info-value">${tx.vin && tx.vin.some(v => v.sequence < 0xfffffffe) ? 'Yes' : 'No'}</div></div>
      </div>

      <div class="subsite-links" style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">
        <button class="icon-btn" style="padding:6px 12px;font-size:.72rem;font-family:var(--font-ko);border-color:var(--accent);color:var(--accent)" onclick="openViz('tx','${tx.txid}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> 시각화</button>
        <button class="icon-btn" style="padding:6px 12px;font-size:.72rem;font-family:var(--font-ko)" onclick="openTxLookup('${tx.txid}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> TX 분석</button>
      </div>
      ${!isConfirmed ? `<div class="tx-status-bar unconfirmed" id="tx-poll-status">⏳ ${t('unconfirmed')} | ${feeRate.toFixed(1)} sat/vB | ${t('estimatedConf')}: ~10-60min</div>` : ''}

      <div class="tx-flow-summary">
        <div class="fs-item"><div class="fs-label">${t('inputs')}</div><div class="fs-val">${isCoinbase ? '' + t('coinbaseReward') : formatBtc(totalIn)}</div></div>
        <div class="fs-item"><div class="fs-label">→</div><div class="fs-val"></div></div>
        <div class="fs-item"><div class="fs-label">${t('outputs')}</div><div class="fs-val green">${formatBtc(totalOut)}</div></div>
        ${!isCoinbase ? `<div class="fs-item"><div class="fs-label">${t('fee')}</div><div class="fs-val red">${formatBtc(tx.fee)}</div></div>` : ''}
      </div>

      <div class="tx-flow">
        <div class="tx-flow-col">
          <h4>${t('inputs')} (${tx.vin ? tx.vin.length : 0})</h4>
          ${(tx.vin || []).map((v, i) => {
            if (v.is_coinbase) return `<div class="tx-io-item coinbase-item stagger-item" style="--i:${i}"><div class="io-addr" style="color:var(--accent)">${t('coinbaseReward')}</div><div class="io-val">${formatBtc(totalOut)}</div></div>`;
            const addr = v.prevout ? (v.prevout.scriptpubkey_address || (v.prevout.scriptpubkey_type === 'p2pk' ? `P2PK:${(v.prevout.scriptpubkey||'').slice(2,14)}…` : (v.prevout.scriptpubkey_type||'Unknown').toUpperCase())) : 'Unknown';
            const val = v.prevout ? v.prevout.value || 0 : 0;
            const addrType = v.prevout ? getAddrType(v.prevout.scriptpubkey_type) : '?';
            return `<div class="tx-io-item stagger-item" style="--i:${i}">
              <div class="io-addr" ${/^(bc1|1|3)[a-zA-Z0-9]{25,62}$/.test(addr) ? `data-addr="${addr}" style="cursor:pointer"` : 'style="cursor:default;opacity:.7"'}>${addr}</div>
              <div class="io-val">${formatBtc(val)}</div>
              <div class="io-type">${addrType}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="tx-flow-arrow">
          <div class="arrow-icon">→</div>
          ${!isCoinbase ? `<div class="arrow-fee">${formatNum(tx.fee)} sat<br>${feeRate.toFixed(1)} sat/vB</div>` : ''}
        </div>
        <div class="tx-flow-col">
          <h4>${t('outputs')} (${tx.vout ? tx.vout.length : 0})</h4>
          ${(tx.vout || []).map((o, i) => {
            const isOpReturn = o.scriptpubkey_type === 'op_return';
            const addr = o.scriptpubkey_address || (isOpReturn ? 'OP_RETURN' : (o.scriptpubkey_type === 'p2pk' ? `P2PK:${(o.scriptpubkey||'').slice(2,14)}…` : (o.scriptpubkey_type||'Unknown').toUpperCase()));
            const addrType = getAddrType(o.scriptpubkey_type);
            const itemClass = isOpReturn ? 'tx-io-item op-return-item' : 'tx-io-item';
            let opReturnText = "";
            if (isOpReturn) {
              try {
                const hexData = o.scriptpubkey.replace(/^6a/, "").replace(/^[0-9a-f]{2}/, "");
                const bytes = hexData.match(/.{2}/g) || [];
                const text = bytes.map(b => String.fromCharCode(parseInt(b, 16))).join("");
                const isPrintable = /^[\x20-\x7E]*$/.test(text) && text.length > 0;
                opReturnText = isPrintable
                  ? `<div class="op-return-decoded">\u{1F4AC} "${escHtml(text)}"</div>`
                  : `<div class="op-return-decoded">0x${hexData.slice(0, 40)}${hexData.length > 40 ? "…" : ""}</div>`;
              } catch(e) { console.warn('OP_RETURN decode:', e); }
            }
            return `<div class="${itemClass} stagger-item" style="--i:${i}">
              <div class="io-addr" ${!isOpReturn && /^(bc1|1|3)[a-zA-Z0-9]{25,62}$/.test(addr) ? `data-addr="${addr}" style="cursor:pointer"` : `style="cursor:default;${isOpReturn?'':'opacity:.7'}"`}>${isOpReturn ? '\u{1F4DD} OP_RETURN' : addr}</div>
              <div class="io-val">${formatBtc(o.value)}</div>
              <div class="io-type">${addrType}</div>
              ${opReturnText}
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  // 주소 클릭 이벤트 위임
  app.querySelectorAll('.io-addr[data-addr]').forEach(el => {
    el.addEventListener('click', () => { location.hash = '#/address/' + el.dataset.addr; });
  });

  // 미확인 TX 폴링
  if (!isConfirmed) {
    window._txPollInterval = setInterval(async () => {
      try {
        const updated = await api('/tx/' + txid);
        if (updated.status && updated.status.confirmed) {
          clearInterval(window._txPollInterval);
          window._txPollInterval = null;
          const statusBar = document.getElementById('tx-poll-status');
          if (statusBar) {
            statusBar.className = 'tx-status-bar confirmed';
            statusBar.textContent = '\u2713 ' + t('confirmed') + ' — Block #' + formatNum(updated.status.block_height);
          }
        }
      } catch(e) { console.warn('TX poll:', e); }
    }, 20000);
  }
  } catch (e) {
    NProgress.done(); app.innerHTML = `<div class="error-box" role="alert">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

// ── TX 플로우 다이어그램 ──
export function renderTxFlowDiagram(tx) {
  const container = document.getElementById('tx-flow-diagram');
  if (!container) return;
  container.innerHTML = '';

  if (typeof d3 !== 'undefined') {
    renderTxFlowD3(tx, container);
  } else {
    renderTxFlowFallback(tx, container);
  }
}

async function renderTxFlowD3(tx, container) {
  await loadScript(CDN_D3).catch(()=>{});
  const W = container.clientWidth || 600;
  const ins = (tx.vin || []).slice(0, 8);
  const outs = (tx.vout || []).slice(0, 8);
  const H = Math.max(ins.length, outs.length) * 44 + 40;
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const textCol = isDark ? '#8b949e' : '#555';
  const accentCol = '#f7931a';
  const nodeCol = isDark ? '#161b22' : '#f5f5f5';
  const borderCol = isDark ? '#30363d' : '#ddd';
  const lineCol = isDark ? '#30363d' : '#ccc';

  const svg = d3.select(container).append('svg')
    .attr('width', '100%').attr('height', H)
    .attr('viewBox', `0 0 ${W} ${H}`);

  const colIn = 10, colMid = W / 2, colOut = W - 10;
  const nodeW = Math.min(W * 0.32, 180), nodeH = 36;

  // 입력 노드
  ins.forEach((v, i) => {
    const y = 20 + i * 44;
    const val = v.prevout?.value != null ? formatBtc(v.prevout.value) + ' BTC' : 'coinbase';
    const addr = v.prevout?.scriptpubkey_address ? v.prevout.scriptpubkey_address.slice(0,12)+'…' : '—';
    const g = svg.append('g').style('cursor', v.prevout?.scriptpubkey_address ? 'pointer' : 'default')
      .on('click', () => { if (v.prevout?.scriptpubkey_address) navigate('#/address/'+v.prevout.scriptpubkey_address); });
    g.append('rect').attr('x', colIn).attr('y', y).attr('width', nodeW).attr('height', nodeH)
      .attr('rx', 5).attr('fill', nodeCol).attr('stroke', '#4488ff').attr('stroke-width', 1.5);
    g.append('text').attr('x', colIn+8).attr('y', y+13).attr('fill', textCol).attr('font-size', 10).attr('font-family','monospace').text(addr);
    g.append('text').attr('x', colIn+8).attr('y', y+27).attr('fill', accentCol).attr('font-size', 9).attr('font-family','monospace').text(val);
    // 연결선
    svg.append('path').attr('d', `M${colIn+nodeW},${y+nodeH/2} C${colMid-40},${y+nodeH/2} ${colMid-40},${H/2} ${colMid},${H/2}`)
      .attr('fill','none').attr('stroke',lineCol).attr('stroke-width',1).attr('opacity',0.5);
  });

  // 중앙 TX 노드
  const txG = svg.append('g');
  txG.append('rect').attr('x', colMid-30).attr('y', H/2-16).attr('width', 60).attr('height', 32)
    .attr('rx', 6).attr('fill', accentCol).attr('opacity', 0.15).attr('stroke', accentCol).attr('stroke-width', 1.5);
  txG.append('text').attr('x', colMid).attr('y', H/2+4).attr('text-anchor','middle')
    .attr('fill', accentCol).attr('font-size', 10).attr('font-weight','bold').attr('font-family','monospace').text('TX');

  // 출력 노드
  outs.forEach((v, i) => {
    const y = 20 + i * 44;
    const val = formatBtc(v.value) + ' BTC';
    const addr = v.scriptpubkey_address ? v.scriptpubkey_address.slice(0,12)+'…' : (v.scriptpubkey_type||'—');
    const g = svg.append('g').style('cursor', v.scriptpubkey_address ? 'pointer' : 'default')
      .on('click', () => { if (v.scriptpubkey_address) navigate('#/address/'+v.scriptpubkey_address); });
    g.append('rect').attr('x', colOut-nodeW).attr('y', y).attr('width', nodeW).attr('height', nodeH)
      .attr('rx', 5).attr('fill', nodeCol).attr('stroke', accentCol).attr('stroke-width', 1.5);
    g.append('text').attr('x', colOut-nodeW+8).attr('y', y+13).attr('fill', textCol).attr('font-size', 10).attr('font-family','monospace').text(addr);
    g.append('text').attr('x', colOut-nodeW+8).attr('y', y+27).attr('fill', accentCol).attr('font-size', 9).attr('font-family','monospace').text(val);
    // 연결선
    svg.append('path').attr('d', `M${colMid},${H/2} C${colMid+40},${H/2} ${colMid+40},${y+nodeH/2} ${colOut-nodeW},${y+nodeH/2}`)
      .attr('fill','none').attr('stroke',lineCol).attr('stroke-width',1).attr('opacity',0.5);
  });

  if ((tx.vin||[]).length > 8) {
    svg.append('text').attr('x', colIn+8).attr('y', H-8).attr('fill', textCol).attr('font-size', 9)
      .text(`+${tx.vin.length-8}개 입력 더`);
  }
  if ((tx.vout||[]).length > 8) {
    svg.append('text').attr('x', colOut-nodeW+8).attr('y', H-8).attr('fill', textCol).attr('font-size', 9)
      .text(`+${tx.vout.length-8}개 출력 더`);
  }
}

function renderTxFlowFallback(tx, container) {
  const ins = (tx.vin || []).slice(0, 5);
  const outs = (tx.vout || []).slice(0, 5);
  const inItems = ins.map((v,i) => {
    const val = v.prevout?.value != null ? formatBtc(v.prevout.value)+' BTC' : 'coinbase';
    const addr = v.prevout?.scriptpubkey_address ? v.prevout.scriptpubkey_address.slice(0,14)+'…' : '—';
    return `<div class="tfd-node tfd-in">${escHtml(addr)}<span>${val}</span></div>`;
  }).join('');
  const outItems = outs.map((v,i) => {
    const val = formatBtc(v.value)+' BTC';
    const addr = v.scriptpubkey_address ? v.scriptpubkey_address.slice(0,14)+'…' : (v.scriptpubkey_type||'—');
    return `<div class="tfd-node tfd-out">${escHtml(addr)}<span>${val}</span></div>`;
  }).join('');
  container.innerHTML = `<div class="tfd-col">${inItems}</div><div class="tfd-arrow">→</div><div class="tfd-col">${outItems}</div>`;
}

// Register globals for onclick handlers
window.renderTxFlowDiagram = renderTxFlowDiagram;
