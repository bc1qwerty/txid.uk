// ═══════════════════════════════════════════
// tools.js — 도구 모달 (수수료 계산, QR, 변환기, 단축키 등)
// ═══════════════════════════════════════════

import { state, t, api, loadScript, CDN_QRCODE, escHtml, formatNum, formatBtc, shortHash, showToast, getFavorites, coloredFeeRate, trapFocus } from './core.js';
import { statsData } from './stats.js';

function navigate(hash) { location.hash = hash; }

// ═══════════════════════════════════════════
// FEE CALCULATOR
// ═══════════════════════════════════════════
function renderFeeCalcModal() {
  const fees = statsData.fees || {};
  const fastFee = fees.fastestFee || 10;
  const halfFee = fees.halfHourFee || 5;
  const hourFee = fees.hourFee || 2;

  const txTypes = [
    { label: 'Simple send (P2WPKH)', vb: 141 },
    { label: 'Multi-input 2-in-2-out', vb: 208 },
    { label: state.lang === 'ko' ? '직접 입력' : state.lang === 'ja' ? 'カスタム' : 'Custom', vb: 0 },
  ];

  return `<div class="modal-overlay" id="fee-calc-modal" onclick="if(event.target===this)this.remove()">
    <div class="modal">
      <button class="modal-close" onclick="document.getElementById('fee-calc-modal').remove()">✕</button>
      <h2>${t('feeCalc')}</h2>
      <label>TX ${t('type')}</label>
      <select id="fc-type" onchange="updateFeeCalc()">
        ${txTypes.map((tt, i) => `<option value="${i}">${tt.label} ${tt.vb ? '(~' + tt.vb + ' vB)' : ''}</option>`).join('')}
      </select>
      <div id="fc-custom-wrap" style="display:none">
        <label>vBytes</label>
        <input type="number" id="fc-vbytes" value="200" min="1" onchange="updateFeeCalc()">
      </div>
      <table class="fee-table" id="fc-table">
        <thead><tr><th>${t('speed')}</th><th>${t('feeRate')}</th><th>${t('estFee')} (sat)</th><th>${t('estFee')} (BTC)</th><th>${t('estTime')}</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>
  </div>`;
}

function updateFeeCalc() {
  const typeIdx = parseInt(document.getElementById('fc-type').value);
  const customWrap = document.getElementById('fc-custom-wrap');
  const txTypes = [141, 208, 0];
  let vb = txTypes[typeIdx];

  if (typeIdx === 2) {
    customWrap.style.display = '';
    vb = parseInt(document.getElementById('fc-vbytes').value) || 200;
  } else {
    customWrap.style.display = 'none';
  }

  const fees = statsData.fees || {};
  const timeUnit = state.lang === "ko" ? "분" : state.lang === "ja" ? "分" : "min";
  const hourUnit = state.lang === "ko" ? "시간+" : state.lang === "ja" ? "時間+" : "h+";
  const rows = [
    { label: t('fast'), rate: fees.fastestFee || 10, time: '~10' + timeUnit },
    { label: t('normal'), rate: fees.halfHourFee || 5, time: '~30' + timeUnit },
    { label: t('slow'), rate: fees.hourFee || 2, time: '~1' + hourUnit },
  ];

  const tbody = document.querySelector('#fc-table tbody');
  if (!tbody) return;
  tbody.innerHTML = rows.map(r => {
    const feeSat = r.rate * vb;
    return `<tr>
      <td><strong>${r.label}</strong></td>
      <td>${coloredFeeRate(r.rate)}</td>
      <td>${formatNum(feeSat)}</td>
      <td>${(feeSat / 1e8).toFixed(8)}</td>
      <td>${r.time}</td>
    </tr>`;
  }).join('');
}

// coloredFeeRate, statsData: core.js, stats.js에서 import

// ═══════════════════════════════════════════
// QR CODE
// ═══════════════════════════════════════════
async function showQRModal(address) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'qr-modal';
  modal.onclick = function(e) { if (e.target === this) this.remove(); };
  modal.innerHTML = `<div class="modal">
    <button class="modal-close">✕</button>
    <div class="qr-modal-content">
      <h2>📱 ${t('qrView')}</h2>
      <div id="qr-code"></div>
      <div class="qr-addr-text">${escHtml(address)}</div>
      <button class="copy-btn">${t('copy')}</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('.copy-btn').addEventListener('click', function() {
    const btn = this;
    navigator.clipboard.writeText(address).then(() => { btn.textContent = t('copied'); });
    setTimeout(() => { btn.textContent = t('copy'); }, 1500);
  });
  trapFocus(modal);

  // Generate QR using qrcode-generator (동적 로드)
  await loadScript(CDN_QRCODE).catch(()=>{});
  if (typeof qrcode !== 'undefined') {
    const qr = qrcode(0, 'M');
    qr.addData('bitcoin:' + address);
    qr.make();
    document.getElementById('qr-code').innerHTML = qr.createSvgTag(5);
  } else {
    document.getElementById('qr-code').innerHTML = '<p style="color:var(--text3);font-size:.75rem">QR library not loaded</p>';
  }
}

// ═══════════════════════════════════════════
// UNIT CONVERTER
// ═══════════════════════════════════════════
function openConverter() {
  const krw = window._btcKrw || 0;
  const usd = window._btcUsd || 0;
  document.getElementById('converter-modal')?.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'converter-modal';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:340px">
      <div class="modal-header">
        <span>${state.lang==='ko'?'단위 변환기':state.lang==='ja'?'単位換算':'Unit Converter'}</span>
        <button class="modal-close" onclick="document.getElementById('converter-modal')?.remove()">✕</button>
      </div>
      <div class="converter-rows" id="conv-rows">
        ${['BTC','Sat','KRW','USD'].map(u => `
        <div class="conv-row">
          <label class="conv-label">${u}</label>
          <input class="conv-input" id="conv-${u.toLowerCase()}" type="number" min="0" placeholder="0" />
        </div>`).join('')}
      </div>
      ${!krw && !usd ? '<p style="font-size:.7rem;color:var(--text3);margin-top:8px">※ ' + (state.lang==='ko'?'가격 데이터 로딩 중...':'Loading price data...') + '</p>' : ''}
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  const rates = { krw, usd };
  function updateFrom(unit, val) {
    const n = parseFloat(String(val).replace(/,/g, '')) || 0;
    let btc = unit==='btc'?n : unit==='sat'?n/1e8 : unit==='krw'?(rates.krw?n/rates.krw:0) : (rates.usd?n/rates.usd:0);
    if (unit!=='btc') document.getElementById('conv-btc').value = btc ? btc.toFixed(8) : '';
    if (unit!=='sat') document.getElementById('conv-sat').value = btc ? Math.round(btc*1e8) : '';
    if (unit!=='krw') document.getElementById('conv-krw').value = (btc&&rates.krw) ? Math.round(btc*rates.krw).toLocaleString() : '';
    if (unit!=='usd') document.getElementById('conv-usd').value = (btc&&rates.usd) ? (btc*rates.usd).toFixed(2) : '';
  }
  ['btc','sat','krw','usd'].forEach(u => {
    document.getElementById('conv-'+u)?.addEventListener('input', e => updateFrom(u, e.target.value.replace(/,/g, '')));
  });
}

// ── 키보드 단축키 도움말 ──
function showShortcuts() {
  document.getElementById('shortcuts-modal')?.remove();
  const kbShortcuts = [
    ['/', state.lang==='ko'?'검색 포커스':'Focus search'],
    ['Esc', state.lang==='ko'?'모달 닫기':'Close modal'],
    ['?', state.lang==='ko'?'이 도움말':state.lang==='ja'?'ショートカット':'This help'],
  ];
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'shortcuts-modal';
  modal.innerHTML = `<div class="modal-box" style="max-width:340px">
    <div class="modal-header">
      <span>${state.lang==='ko'?'키보드 단축키':state.lang==='ja'?'キーボードショートカット':'Keyboard Shortcuts'}</span>
      <button class="modal-close" onclick="document.getElementById('shortcuts-modal')?.remove()">✕</button>
    </div>
    <div class="shortcuts-list">
      ${kbShortcuts.map(([k,d]) => `<div class="shortcut-row"><kbd class="shortcut-key">${k}</kbd><span class="shortcut-desc">${d}</span></div>`).join('')}
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}

// ── 13. BTC 구매력 계산기 ──
function openBtcCalculator() {
  document.getElementById('btc-calc-modal')?.remove();
  const historicPrices = [
    { year: 2010, usd: 0.08 }, { year: 2012, usd: 5 }, { year: 2014, usd: 800 },
    { year: 2016, usd: 600 }, { year: 2017, usd: 20000 }, { year: 2019, usd: 7000 },
    { year: 2021, usd: 69000 }, { year: 2023, usd: 45000 }, { year: 2024, usd: 100000 },
  ];
  const curUsd = window._btcUsd || 66000;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'btc-calc-modal';
  modal.innerHTML = `<div class="modal-box" style="max-width:440px">
    <div class="modal-header">
      <span>${state.lang==='ko'?'BTC 구매력 계산기':state.lang==='ja'?'BTC購買力':'BTC Purchasing Power'}</span>
      <button class="modal-close" onclick="document.getElementById('btc-calc-modal')?.remove()">✕</button>
    </div>
    <div style="margin-bottom:12px;font-size:.78rem;color:var(--text2);font-family:var(--font-ko)">
      ${state.lang==='ko'?'당시 BTC를 얼마에 샀다면 지금 얼마일까?':'If you had bought BTC back then...'}
    </div>
    <div class="btc-calc-grid">
      ${historicPrices.map(({year,usd}) => {
        const mult = (curUsd / usd).toFixed(0);
        const multStr = mult >= 1000 ? (mult/1000).toFixed(1)+'K' : mult;
        return `<div class="btc-calc-row">
          <span class="btc-calc-year">${year}</span>
          <span class="btc-calc-price">$${usd.toLocaleString()}</span>
          <span class="btc-calc-arrow">→</span>
          <span class="btc-calc-mult">×${multStr}</span>
        </div>`;
      }).join('')}
    </div>
    <div style="font-size:.65rem;color:var(--text3);margin-top:10px;font-family:var(--font-ko)">현재 BTC: $${formatNum(Math.round(curUsd))}</div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}

// ── 4. 즐겨찾기 대시보드 ──
async function openFavDashboard() {
  document.getElementById('fav-dashboard-modal')?.remove();
  const favs = getFavorites().filter(f => f.type === 'address');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'fav-dashboard-modal';
  modal.innerHTML = `<div class="modal-box" style="max-width:500px">
    <div class="modal-header">
      <span>${state.lang==='ko'?'즐겨찾기 대시보드':state.lang==='ja'?'お気に入りダッシュボード':'Favorites Dashboard'}</span>
      <button class="modal-close" onclick="document.getElementById('fav-dashboard-modal')?.remove()">✕</button>
    </div>
    <div id="fav-dash-list">
      ${favs.length ? favs.map(f => `<div class="fav-dash-row" id="fav-dash-${f.value.slice(0,8)}">
        <a href="#/address/${f.value}" onclick="document.getElementById('fav-dashboard-modal')?.remove()" class="fav-dash-addr">${f.label||shortHash(f.value)}</a>
        <span class="fav-dash-bal" id="fdbal-${f.value.slice(0,8)}">…</span>
      </div>`).join('') : `<div class="empty-state">${state.lang==='ko'?'즐겨찾기한 주소가 없습니다.':'No favorite addresses.'}</div>`}
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
  // 잔액 병렬 로드
  favs.forEach(async f => {
    try {
      const info = await api('/address/' + f.value);
      const chain = info.chain_stats || {};
      const mem = info.mempool_stats || {};
      const bal = (chain.funded_txo_sum - chain.spent_txo_sum + mem.funded_txo_sum - mem.spent_txo_sum) / 1e8;
      const el = document.getElementById('fdbal-' + f.value.slice(0,8));
      if (el) el.textContent = bal.toFixed(8) + ' BTC';
    } catch(e) { console.warn(e); }
  });
}

// ── 15. 주소 공개 메모장 (로컬) ──
function openAddressNotes(address) {
  document.getElementById('addr-notes-modal')?.remove();
  const key = 'addr_notes_' + address;
  const saved = localStorage.getItem(key) || '';
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'addr-notes-modal';
  modal.innerHTML = `<div class="modal-box" style="max-width:400px">
    <div class="modal-header">
      <span>${state.lang==='ko'?'주소 메모':state.lang==='ja'?'アドレスメモ':'Address Notes'}</span>
      <button class="modal-close" onclick="document.getElementById('addr-notes-modal')?.remove()">✕</button>
    </div>
    <div style="font-size:.68rem;color:var(--text3);margin-bottom:8px;font-family:var(--font)">${address.slice(0,20)}…</div>
    <textarea id="addr-notes-text" style="width:100%;height:120px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text1);padding:10px;font-family:var(--font-ko);font-size:.82rem;resize:vertical;outline:none;box-sizing:border-box">${escHtml(saved)}</textarea>
    <div style="display:flex;gap:8px;margin-top:10px;justify-content:flex-end">
      <button onclick="document.getElementById('addr-notes-modal')?.remove()" style="background:none;border:1px solid var(--border);color:var(--text2);padding:6px 14px;border-radius:5px;cursor:pointer;font-family:var(--font-ko)">${state.lang==='ko'?'취소':'Cancel'}</button>
      <button onclick="(()=>{localStorage.setItem('addr_notes_${address}',document.getElementById('addr-notes-text').value);document.getElementById('addr-notes-modal')?.remove();showToast('📝','${state.lang==='ko'?'메모 저장됨':'Saved'}',null,2000);})()" style="background:var(--accent);border:none;color:#000;padding:6px 14px;border-radius:5px;cursor:pointer;font-family:var(--font-ko);font-weight:600">${state.lang==='ko'?'저장':'Save'}</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}

// ── 12. 라이트닝 노드 지도 (국가별) ──
async function openLightningMap() {
  document.getElementById('ln-map-modal')?.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'ln-map-modal';
  modal.innerHTML = `<div class="modal-box" style="max-width:560px">
    <div class="modal-header">
      <span>${state.lang==='ko'?'라이트닝 노드 분포':'Lightning Node Distribution'}</span>
      <button class="modal-close" onclick="document.getElementById('ln-map-modal')?.remove()">✕</button>
    </div>
    <div id="ln-map-content"><div class="loading">${t('loading')}</div></div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
  try {
    const stats = await api('/v1/lightning/statistics/latest');
    const nodes = await fetch('https://mempool.space/api/v1/lightning/nodes/countries').then(r=>r.json());
    const el = document.getElementById('ln-map-content');
    if (!el) return;
    const total = Object.values(nodes).reduce((s,n)=>s+(n.count||0),0);
    const sorted = Object.entries(nodes).sort((a,b)=>b[1].count-a[1].count).slice(0,20);
    const flags = {US:'🇺🇸',DE:'🇩🇪',GB:'🇬🇧',FR:'🇫🇷',NL:'🇳🇱',CA:'🇨🇦',SG:'🇸🇬',JP:'🇯🇵',AU:'🇦🇺',CH:'🇨🇭',
                   FI:'🇫🇮',SE:'🇸🇪',NO:'🇳🇴',BR:'🇧🇷',KR:'🇰🇷',IN:'🇮🇳',RU:'🇷🇺',IT:'🇮🇹',ES:'🇪🇸',PL:'🇵🇱'};
    const countryNames = {
      US:'미국',DE:'독일',GB:'영국',FR:'프랑스',NL:'네덜란드',CA:'캐나다',SG:'싱가포르',JP:'일본',
      AU:'호주',CH:'스위스',FI:'핀란드',SE:'스웨덴',NO:'노르웨이',BR:'브라질',KR:'한국',
      IN:'인도',RU:'러시아',IT:'이탈리아',ES:'스페인',PL:'폴란드',AT:'오스트리아',CZ:'체코',
      UA:'우크라이나',TR:'터키',AR:'아르헨티나',MX:'멕시코',ZA:'남아공',TH:'태국',ID:'인도네시아',
      TW:'대만',HK:'홍콩',CN:'중국',MY:'말레이시아',PH:'필리핀',VN:'베트남',
    };
    el.innerHTML = `
      <div style="font-size:.72rem;color:var(--text3);margin-bottom:10px">${state.lang==='ko'?'상위 20개국':'Top 20 countries'} · 전체 ${formatNum(total)}개 노드</div>
      <div class="ln-country-list">
        ${sorted.map(([cc, data]) => {
          const pct = ((data.count/total)*100).toFixed(1);
          const w = Math.max((data.count/sorted[0][1].count)*100, 2);
          return `<div class="ln-country-row">
            <span class="ln-flag" style="font-size:1.1rem">${flags[cc]||'🌐'}</span>
            <span class="ln-cc">${countryNames[cc]||cc}</span>
            <div class="ln-bar-wrap"><div class="ln-bar" style="width:${w}%"></div></div>
            <span class="ln-count">${formatNum(data.count)}</span>
            <span class="ln-pct">${pct}%</span>
          </div>`;
        }).join('')}
      </div>`;
  } catch(e) { document.getElementById('ln-map-content').innerHTML = '<div class="empty-state">데이터 로드 실패</div>'; }
}

export { renderFeeCalcModal, updateFeeCalc, showQRModal, openConverter, showShortcuts, openBtcCalculator, openFavDashboard, openAddressNotes, openLightningMap };
