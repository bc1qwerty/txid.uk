/* ═══════════════════════════════════════════
   txid.uk — Main Entry Point (ES Module)
   Router, App object, event listeners, globals
   ═══════════════════════════════════════════ */

import {
  state, t, i18n, NProgress, api, icon, ICONS,
  loadScript, CDN_QRCODE, CDN_CHARTS, CDN_D3,
  escHtml, formatNum, formatBtc, formatBytes, satToBtc, btcWithKrw,
  timeAgo, fullDate, shortHash, shortAddr,
  feeLevel, feeColorHex, coloredFeeRate,
  skeletonCards, skeletonTable, skeletonAddrStats,
  breadcrumb, showToast, renderNotFound,
  favButton, isFavorite, toggleFavorite, removeFavorite, getFavorites, saveFavorites, renderFavoritesSection,
  toggleMonitor, getMonitoredAddrs, updateMonitorBadge, checkMonitoredAddresses,
  detectSearchType, resolveHex64,
  copyToClip, shareUrl, highlightWhaleTx,
  getAddrLabel, setAddrLabel, promptAddrLabel,
  validateSearchInput, checkOnline,
  openViz, openPortfolioAdd, openTxLookup,
  LEARN_LINKS, learnLinksHtml
} from './core.js';

import { updateStats, updateSecondaryStats, flashStat, onNewBlock } from './stats.js';
import { getSearchHistory, addSearchHistory, showSearchHistory, estimateConfirmTime, getMempoolFeeEstimates } from './search.js';
import { renderFeeCalcModal, updateFeeCalc, showQRModal, openConverter, showShortcuts, openBtcCalculator, openFavDashboard, openAddressNotes, openLightningMap } from './tools.js';

// ── Navigation ──
function updateActiveNav(path) {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === path);
  });
}

// ── Router ──
function getRoute() {
  const hash = location.hash || '#/';
  const parts = hash.slice(2).split('/');
  return { path: parts[0] || '', param: parts.slice(1).join('/') };
}

function navigate(hash) {
  location.hash = hash;
}

// Scroll position save/restore
const _scrollPos = {};
function saveScroll() { _scrollPos[location.hash] = window.scrollY; }
window.addEventListener('scroll', () => { if (window._routeReady) saveScroll(); }, { passive: true });

let _txPollInterval = null;

async function route() {
  NProgress.start();
  if (_txPollInterval) { clearInterval(_txPollInterval); _txPollInterval = null; }
  window._txPollInterval = null;
  const { path, param } = getRoute();
  const app = document.getElementById('app');

  const mempoolSection = document.getElementById('mempool-section');
  if (mempoolSection) mempoolSection.style.display = path === '' ? '' : 'none';

  updateActiveNav(path);

  const learnBar = document.getElementById('learn-links-bar');
  if (learnBar) {
    const ctx = path === '' ? 'home' : path;
    learnBar.innerHTML = LEARN_LINKS[ctx] ? learnLinksHtml(ctx) : '';
  }

  switch (path) {
    case '': {
      const { renderHome } = await import('./pages/home.js?v=20260312');
      renderHome(app);
      break;
    }
    case 'block': {
      const { renderBlock } = await import('./pages/block.js');
      renderBlock(app, param);
      break;
    }
    case 'tx': {
      const { renderTx } = await import('./pages/tx.js');
      renderTx(app, param);
      break;
    }
    case 'address': {
      const { renderAddress } = await import('./pages/address.js');
      renderAddress(app, param);
      break;
    }
    case 'mining': {
      const { renderMining } = await import('./pages/mining.js');
      renderMining(app);
      break;
    }
    default:
      app.innerHTML = `<div class="error-box">${t('notFound')}</div>`;
      NProgress.done();
      break;
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);

// ═══════════════════════════════════════════
// APP (Global Object)
// ═══════════════════════════════════════════
window.App = {
  toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeBtn();
  },

  toggleLangMenu() {
    document.getElementById('lang-menu')?.classList.toggle('open');
  },

  setLang(newLang) {
    state.lang = newLang;
    localStorage.setItem('lang', state.lang);
    document.documentElement.lang = state.lang;
    ['ko','en','ja'].forEach(l => {
      const b = document.getElementById('slang-' + l);
      if (b) b.classList.toggle('active', l === state.lang);
    });
    document.getElementById('search-input').placeholder = t('search_ph');
    document.getElementById('tagline').textContent = t('tagline');
    document.querySelectorAll('[data-ko]').forEach(el => {
      const val = el.dataset[state.lang] || el.dataset.en || el.dataset.ko;
      el.textContent = val;
    });
    document.querySelectorAll('.appbar a span').forEach(el => {
      if (el.dataset.ko) {
        el.textContent = el.dataset[state.lang] || el.dataset.en || el.dataset.ko;
      }
    });
    route();
  },

  async doSearch(fromMobile) {
    const inputId = fromMobile ? 'mobile-search-input' : 'search-input';
    const input = document.getElementById(inputId);
    const q = input.value.trim();
    if (!q) return;

    if (fromMobile) App.closeMobileSearch();

    const detected = detectSearchType(q);
    if (!detected) {
      showToast(t("search"), t("notFound"), null, 3000);
      return;
    }

    switch (detected.type) {
      case 'height':
        addSearchHistory(q, 'block');
        navigate('#/block/' + detected.val);
        break;
      case 'address':
        addSearchHistory(q, 'address');
        navigate('#/address/' + detected.val);
        break;
      case 'hex64': {
        const app = document.getElementById('app');
        app.innerHTML = `<div class="loading">${t('loading')}</div>`;
        const resolved = await resolveHex64(detected.val);
        if (resolved === 'block') { addSearchHistory(q, 'block'); navigate('#/block/' + detected.val); }
        else if (resolved === 'tx') { addSearchHistory(q, 'tx'); navigate('#/tx/' + detected.val); }
        else { app.innerHTML = `<div class="error-box">${t('notFound')}</div>`; }
        break;
      }
    }
    input.value = '';
  },

  openMobileSearch() {
    const overlay = document.getElementById('mobile-search-overlay');
    overlay.classList.add('open');
    const input = document.getElementById('mobile-search-input');
    setTimeout(() => input.focus(), 100);
  },

  closeMobileSearch() {
    const overlay = document.getElementById('mobile-search-overlay');
    overlay.classList.remove('open');
  },

  openToolsSheet() {
    document.getElementById('mobile-tools-sheet').classList.add('open');
    document.body.style.overflow = 'hidden';
  },
  closeToolsSheet() {
    document.getElementById('mobile-tools-sheet').classList.remove('open');
    document.body.style.overflow = '';
  },

  openFeeCalc() {
    const existing = document.getElementById('fee-calc-modal');
    if (existing) { existing.remove(); return; }
    document.body.insertAdjacentHTML('beforeend', renderFeeCalcModal());
    updateFeeCalc();
  },

  showQR(address) {
    showQRModal(address);
  }
};

// ── Theme Init ──
function updateThemeBtn() {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const tIcon = document.getElementById('theme-icon');
  const tLabel = document.getElementById('theme-label');
  if (tIcon) tIcon.innerHTML = isDark
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  if (tLabel) {
    const themeLabelTexts = {
      ko: isDark ? '라이트 모드로 변경' : '다크 모드로 변경',
      en: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      ja: isDark ? 'ライトモードに変更' : 'ダークモードに変更',
    };
    tLabel.textContent = themeLabelTexts[state.lang] || themeLabelTexts.ko;
  }
  ['ko','en','ja'].forEach(l => {
    const b = document.getElementById('slang-' + l);
    if (b) b.classList.toggle('active', l === state.lang);
  });
  btn.innerHTML = isDark
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const themeLabels = {
    ko: isDark ? '라이트 모드로 전환' : '다크 모드로 전환',
    en: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
    ja: isDark ? 'ライトモードへ' : 'ダークモードへ',
  };
  btn.title = themeLabels[state.lang] || themeLabels.en;
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeBtn();
  const lbtn = document.getElementById('lang-btn');
  if (lbtn) lbtn.textContent = { ko: 'KO', en: 'EN', ja: '日' }[state.lang] || 'KO';
})();

// ── Search Event Listeners ──
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') App.doSearch(false);
});
document.getElementById('search-input').addEventListener('focus', () => {
  if (!document.getElementById('search-input').value) showSearchHistory();
});
document.getElementById('search-input').addEventListener('input', e => {
  const val = e.target.value.trim();
  if (!val) { showSearchHistory(); return; }
  document.getElementById('search-history-drop')?.remove();
  const hint = document.getElementById('search-status');
  if (hint) {
    if (/^\d+$/.test(val)) hint.textContent = '블록 높이';
    else if (/^[0-9a-fA-F]{64}$/.test(val)) hint.textContent = 'TXID / Block Hash';
    else if (/^(bc1|1|3)/.test(val)) hint.textContent = '비트코인 주소';
    else hint.textContent = '';
  }
});
document.addEventListener('click', e => {
  if (!e.target.closest('#lang-wrap')) {
    document.getElementById('lang-menu')?.classList.remove('open');
  }
  if (!e.target.closest('#search-wrap')) {
    document.getElementById('search-history-drop')?.remove();
  }
});
document.getElementById('mobile-search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') App.doSearch(true);
  if (e.key === 'Escape') App.closeMobileSearch();
});
document.getElementById('mobile-tools-sheet')?.addEventListener('click', function(e) {
  if (e.target === this) App.closeToolsSheet();
});

// "/" key to focus search
document.addEventListener('keydown', e => {
  if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    document.getElementById('search-input').focus();
  }
  if (e.key === 'Escape') {
    document.getElementById('search-input').blur();
    App.closeMobileSearch();
    App.closeToolsSheet();
    document.getElementById('fee-calc-modal')?.remove();
    document.getElementById('qr-modal')?.remove();
    document.getElementById('converter-modal')?.remove();
  }
});

// ═══════════════════════════════════════════
// Global function assignments (for onclick handlers in dynamic HTML)
// ═══════════════════════════════════════════
window.toggleFavorite = toggleFavorite;
window.removeFavorite = removeFavorite;
window.toggleMonitor = toggleMonitor;
window.updateFeeCalc = updateFeeCalc;
window.copyToClip = copyToClip;
window.shareUrl = shareUrl;
window.showQR = showQRModal;
window.getAddrLabel = getAddrLabel;
window.promptAddrLabel = promptAddrLabel;
window.validateSearchInput = validateSearchInput;
window.showSearchHistory = showSearchHistory;
window.addSearchHistory = addSearchHistory;
window.highlightWhaleTx = highlightWhaleTx;
window.renderNotFound = renderNotFound;
window.openViz = openViz;
window.openPortfolioAdd = openPortfolioAdd;
window.openTxLookup = openTxLookup;
window.showShortcuts = showShortcuts;
window.openConverter = openConverter;
window.openBtcCalculator = openBtcCalculator;
window.openFavDashboard = openFavDashboard;
window.openAddressNotes = openAddressNotes;
window.openLightningMap = openLightningMap;
window.estimateConfirmTime = estimateConfirmTime;
window.escHtml = escHtml;
window.formatNum = formatNum;
window.formatBtc = formatBtc;
window.satToBtc = satToBtc;
window.btcWithKrw = btcWithKrw;
window.timeAgo = timeAgo;
window.shortHash = shortHash;
window.shortAddr = shortAddr;
window.navigate = navigate;
window.showToast = showToast;

// Lazy-loaded page functions (assigned on first use)
window.loadBlockTxs = async (...args) => {
  const { loadBlockTxs } = await import('./pages/block.js');
  window.loadBlockTxs = loadBlockTxs;
  return loadBlockTxs(...args);
};
window.loadAddrTxs = async (...args) => {
  const { loadAddrTxs } = await import('./pages/address.js');
  window.loadAddrTxs = loadAddrTxs;
  return loadAddrTxs(...args);
};
window.renderFeeHistogram = async (...args) => {
  const { renderFeeHistogram } = await import('./pages/home.js');
  window.renderFeeHistogram = renderFeeHistogram;
  return renderFeeHistogram(...args);
};
window.loadAddressBalanceChart = async (...args) => {
  const { loadAddressBalanceChart } = await import('./pages/address.js');
  window.loadAddressBalanceChart = loadAddressBalanceChart;
  return loadAddressBalanceChart(...args);
};
window.loadMempoolHeatmap = async (...args) => {
  const { loadMempoolHeatmap } = await import('./pages/home.js');
  window.loadMempoolHeatmap = loadMempoolHeatmap;
  return loadMempoolHeatmap(...args);
};
window.openBlockTreemap = async (...args) => {
  const { openBlockTreemap } = await import('./pages/block.js');
  window.openBlockTreemap = openBlockTreemap;
  return openBlockTreemap(...args);
};
window.renderTxFlowDiagram = async (...args) => {
  const { renderTxFlowDiagram } = await import('./pages/tx.js');
  window.renderTxFlowDiagram = renderTxFlowDiagram;
  return renderTxFlowDiagram(...args);
};
window.loadDifficultyTimer = async (...args) => {
  const { loadDifficultyTimer } = await import('./pages/home.js');
  window.loadDifficultyTimer = loadDifficultyTimer;
  return loadDifficultyTimer(...args);
};
window.showAddressCluster = async (...args) => {
  const { showAddressCluster } = await import('./pages/address.js');
  window.showAddressCluster = showAddressCluster;
  return showAddressCluster(...args);
};
window.renderRecentBlocks = async (...args) => {
  const { renderRecentBlocks } = await import('./pages/home.js');
  window.renderRecentBlocks = renderRecentBlocks;
  return renderRecentBlocks(...args);
};

// ── ResizeObserver for charts ──
if (typeof ResizeObserver !== 'undefined') {
  const _chartObs = new ResizeObserver(() => {
    const ids = ['fee-chart','mempool-chart','hashrate-chart','pool-chart','mempool-heatmap'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.dispatchEvent(new Event('resize')); });
  });
  const appEl = document.getElementById('app');
  if (appEl) _chartObs.observe(appEl);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    updateThemeBtn();
  }
});

// ── Global Error Handlers ──
window.addEventListener('unhandledrejection', e => {
  console.warn('Unhandled promise rejection:', e.reason);
  if (e.reason?.message && !e.reason.message.includes('API')) {
    showToast('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', (state.lang==='ko'?'오류가 발생했습니다: ':'Error: ') + String(e.reason.message).slice(0, 60), null, 3000);
  }
});
window.onerror = (msg, src, line) => {
  console.error('Global error:', msg, src, line);
};

// ── Settings Panel ──
window.toggleSettings = function() {
  const panel = document.getElementById('settings-panel');
  const btn = document.getElementById('settings-btn');
  if (!panel) return;
  const open = panel.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  btn.style.borderColor = open ? 'var(--accent)' : '';
  btn.style.color = open ? 'var(--accent)' : '';
};
window.closeSettings = function() {
  const panel = document.getElementById('settings-panel');
  const btn = document.getElementById('settings-btn');
  if (panel) panel.classList.remove('open');
  if (btn) { btn.setAttribute('aria-expanded','false'); btn.style.borderColor=''; btn.style.color=''; }
};
document.addEventListener('click', e => {
  const dd = document.getElementById('settings-dropdown');
  if (dd && !dd.contains(e.target)) closeSettings();
});

// ── 인라인 onclick 대체 이벤트 리스너 ──
document.getElementById('settings-btn')?.addEventListener('click', toggleSettings);
document.getElementById('si-fee-calc')?.addEventListener('click', () => { App.openFeeCalc(); closeSettings(); });
document.getElementById('si-converter')?.addEventListener('click', () => { openConverter(); closeSettings(); });
document.getElementById('si-btc-calc')?.addEventListener('click', () => { openBtcCalculator(); closeSettings(); });
document.getElementById('si-fav-dash')?.addEventListener('click', () => { openFavDashboard(); closeSettings(); });
document.getElementById('si-lightning')?.addEventListener('click', () => { openLightningMap(); closeSettings(); });
document.getElementById('si-shortcuts')?.addEventListener('click', () => { showShortcuts(); closeSettings(); });
document.getElementById('slang-ko')?.addEventListener('click', () => App.setLang('ko'));
document.getElementById('slang-en')?.addEventListener('click', () => App.setLang('en'));
document.getElementById('slang-ja')?.addEventListener('click', () => App.setLang('ja'));
document.getElementById('theme-btn')?.addEventListener('click', () => App.toggleTheme());
document.getElementById('search-btn')?.addEventListener('click', () => App.doSearch(false));
document.getElementById('mnav-search')?.addEventListener('click', () => App.openMobileSearch());
document.getElementById('mnav-tools')?.addEventListener('click', () => App.openToolsSheet());
document.getElementById('close-mobile-search')?.addEventListener('click', () => App.closeMobileSearch());
document.getElementById('close-tools-sheet')?.addEventListener('click', () => App.closeToolsSheet());
