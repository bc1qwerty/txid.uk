// ═══════════════════════════════════════════
// stats.js — 상단 통계 바 + 새 블록 이벤트
// ═══════════════════════════════════════════

import { state, t, api, formatNum, formatBytes, showToast, checkMonitoredAddresses, NProgress } from './core.js';

function navigate(hash) { location.hash = hash; }

// ── 변수 ──
let statsData = {};
let lastKnownHeight = null;
let _statsLastRun = 0;
let _lastNotifiedHeight = null;

// ── 새 블록 이벤트 처리 ──────────────────────
async function onNewBlock(block) {
  try {
    // 블록 상세 정보 가져오기 (WS 데이터가 extras 없을 수 있음)
    const blocks = await api('/v1/blocks');
    const nb = blocks[0];
    if (!nb) return;

    // 중복 알림 방지
    if (_lastNotifiedHeight === nb.height) return;
    _lastNotifiedHeight = nb.height;

    const pool = nb.extras?.pool?.name || 'Unknown';
    const fees = nb.extras?.totalFees || 0;
    const reward = nb.extras?.reward || 0;

    // 토스트 알림
    showToast(
      state.lang === 'ko' ? `새 블록 #${formatNum(nb.height)}` : `New Block #${formatNum(nb.height)}`,
      `${pool} | ${formatNum(nb.tx_count)} TX | ${(fees / 1e8).toFixed(4)} BTC ${state.lang==='ko'?'수수료':'fees'}`,
      () => navigate('#/block/' + nb.id)
    );

    // Stats bar 즉시 업데이트
    flashStat('s-block', formatNum(nb.height));
    lastKnownHeight = nb.height;

    // 홈 화면이면 블록 목록 갱신
    const hash = location.hash || '#/';
    if (hash === '#/' || hash === '') {
      try {
        const [newBlocks, mempoolBlocks] = await Promise.all([
          api('/v1/blocks'),
          api('/v1/fees/mempool-blocks')
        ]);
        try {
          const { renderRecentBlocks } = await import('./pages/home.js');
          renderRecentBlocks(newBlocks.slice(0, 8));
        } catch(e) { console.warn(e); }

        if (typeof MempoolViz !== 'undefined') {
          MempoolViz.updateData(newBlocks.slice(0, 6), mempoolBlocks);
        }
      } catch(e) { console.warn(e); }
    }
  } catch(e) { console.warn('onNewBlock error:', e); }
}

// WS에서 새 블록 이벤트 수신
window.addEventListener('mempool:newblock', (e) => {
  onNewBlock(e.detail);
});

// ── 상단 통계 업데이트 ──
async function updateStats(force = false) {
  const now = Date.now();
  if (!force && now - _statsLastRun < 8000) return;
  _statsLastRun = now;
  try {
    const [mem, fees, height] = await Promise.all([
      api('/mempool'), api('/v1/fees/recommended'), api('/blocks/tip/height')
    ]);
    statsData = { mem, fees, height };

    // 새 블록 감지 (WS 미연결 시 polling fallback)
    const h = Number(height);
    const wsConnected = typeof MempoolViz !== 'undefined' && MempoolViz.isWsConnected?.();
    if (lastKnownHeight !== null && h > lastKnownHeight && !wsConnected) {
      onNewBlock(null);
    }
    lastKnownHeight = h;

    flashStat('s-block', formatNum(height));
    flashStat('s-tx', formatNum(mem.count));
    flashStat('s-size', (mem.vsize / 1e6).toFixed(1) + ' MB');
    flashStat('s-fee', fees.fastestFee + ' sat/vB');

    // BTC/USD + 도미 + TPS — 초기 로드 시 지연 호출, 이후 매 업데이트마다
    if (!force) updateSecondaryStats();

    // 반감기 카운트다운
    const currentHeight = Number(height);
    const nextHalving = Math.ceil((currentHeight + 1) / 210000) * 210000;
    const blocksLeft = nextHalving - currentHeight;
    const daysLeft = Math.round(blocksLeft * 10 / 60 / 24);
    flashStat('s-halving', formatNum(blocksLeft) + ' blk');
    const halvEl = document.getElementById('s-halving-sub');
    if (halvEl) { halvEl.textContent = '~' + daysLeft + (state.lang==='ko'?'일':state.lang==='ja'?'日':' days'); }

    // Footer live stats
    const fh = document.getElementById('footer-height');
    const ft = document.getElementById('footer-mempool');
    if (fh) fh.textContent = '#' + formatNum(height);
    if (ft) ft.textContent = formatNum(mem.count) + ' TX';
  } catch (e) { console.warn('Stats fetch error:', e); }
}

function flashStat(id, newVal) {
  const el = document.getElementById(id);
  if (!el) return;
  const oldVal = el.textContent;
  // 숫자+기호는 Space Mono, 한글 단위는 Pretendard로 분리
  const formatted = String(newVal).replace(
    /([0-9$.+\-,]+(?:\.[0-9]+)?(?:K|M|B)?)(.*)/,
    (_, num, unit) => unit
      ? `<span style="font-family:var(--font)">${num}</span><span style="font-family:var(--font-ko);font-size:.85em">${unit}</span>`
      : `<span style="font-family:var(--font)">${num}</span>`
  );
  el.innerHTML = formatted.includes('<span') ? formatted : newVal;
  if (oldVal !== '—' && oldVal !== newVal) {
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }
}

// ── 보조 통계 (USD, 도미넌스, TPS) — 초기 로드 후 지연 호출 ──
async function updateSecondaryStats() {
  try {
    const [cgRes, globalRes] = await Promise.allSettled([
      fetch('https://mempool.space/api/v1/prices', {signal: AbortSignal.timeout(8000)}).then(r=>r.json()),
      fetch('https://api.coingecko.com/api/v3/global', {signal: AbortSignal.timeout(10000)}).then(r=>r.json()).catch(()=>fetch('https://api.coinpaprika.com/v1/global', {signal: AbortSignal.timeout(10000)}).then(r=>r.json()))
    ]);
    if (cgRes.status === 'fulfilled' && cgRes.value?.USD) {
      window._btcUsd = cgRes.value.USD;
      flashStat('s-usd', '$' + formatNum(cgRes.value.USD));
    }
    if (globalRes.status === 'fulfilled') {
      const v = globalRes.value;
      const dom = v?.data?.market_cap_percentage?.btc ?? v?.bitcoin_dominance_percentage;
      if (dom) flashStat('s-dom', parseFloat(dom).toFixed(1) + '%');
    }
  } catch(e) { console.warn(e); }
  try {
    const stats = await fetch('https://mempool.space/api/v1/statistics/2h', {signal: AbortSignal.timeout(8000)}).then(r=>r.json());
    if (Array.isArray(stats) && stats.length) {
      const latest = stats[stats.length - 1];
      const tps = (latest.vbytes_per_second || 0) / 250;
      flashStat('s-tps', tps.toFixed(1) + ' tx/s');
    }
  } catch(e) { console.warn(e); }
}

// ── Page Visibility API: 비활성 탭에서 폴링 중단 ──
let _statsInterval = setInterval(() => { if (navigator.onLine) updateStats(); }, 30000);
let _monitorInterval = setInterval(checkMonitoredAddresses, 60000);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(_statsInterval);
    clearInterval(_monitorInterval);
    _statsInterval = null;
    _monitorInterval = null;
  } else {
    if (!_statsInterval) {
      updateStats();
      updateSecondaryStats();
      _statsInterval = setInterval(() => { if (navigator.onLine) updateStats(); }, 30000);
      _monitorInterval = setInterval(checkMonitoredAddresses, 60000);
    }
  }
});

export { statsData, lastKnownHeight, updateStats, updateSecondaryStats, flashStat, onNewBlock };
