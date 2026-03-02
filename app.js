/* ═══════════════════════════════════════════
   txid.uk — Bitcoin Block Explorer
   SPA Router + API + Page Rendering
   ═══════════════════════════════════════════ */

const API = 'https://mempool.space/api';

// ── 다국어 ──
const i18n = {
  ko: {
    home: '홈', mining: '채굴', search_ph: 'TXID / 블록 높이 / 주소 검색...',
    blockHeight: '블록 높이', unconfirmedTx: '미확인 TX', mempoolSize: '멤풀 크기',
    fastFee: '빠른 수수료', tagline: '비트코인, 오스트리아 경제학, 그리고 자유.',
    learn: '공부방', loading: '로딩 중...', error: '데이터를 불러올 수 없습니다.',
    recentBlocks: '최근 블록', feeDistribution: '수수료 분포',
    blockExplorer: '블록 탐색기', transaction: '트랜잭션', address: '주소',
    miningStats: '채굴 통계', confirmed: '확인됨', unconfirmed: '미확인',
    height: '높이', hash: '해시', timestamp: '시간', size: '크기',
    weight: '무게', version: '버전', merkleRoot: '머클 루트',
    bits: '비트', nonce: '논스', difficulty: '난이도',
    totalFees: '총 수수료', subsidy: '보조금', totalOutput: '총 출력',
    miner: '채굴자', txCount: 'TX 수', transactions: '트랜잭션 목록',
    inputs: '입력', outputs: '출력', fee: '수수료', feeRate: '수수료율',
    vsize: '가상 크기', locktime: '잠금시간', rbf: 'RBF',
    balance: '잔액', totalReceived: '총 수신', totalSent: '총 송신',
    txHistory: '거래 내역', type: '유형', value: '금액',
    hashrate: '해시레이트', diffAdj: '난이도 조정',
    topMiners: '상위 채굴자', avgBlockTime: '평균 블록 시간',
    blockReward: '블록 보상', prev: '이전', next: '다음',
    page: '페이지', of: '/',
    ago_sec: '초 전', ago_min: '분 전', ago_hour: '시간 전', ago_day: '일 전',
    coinbaseTx: '코인베이스 TX', estimatedConf: '예상 확인 시간',
    notFound: '검색 결과를 찾을 수 없습니다.',
    blocks144: '최근 144 블록 (~1일)',
    progress: '진행률', estimatedAdj: '예상 조정',
    last2016: '최근 2016 블록',
  },
  en: {
    home: 'Home', mining: 'Mining', search_ph: 'Search TXID / Block Height / Address...',
    blockHeight: 'Block Height', unconfirmedTx: 'Unconfirmed TX', mempoolSize: 'Mempool Size',
    fastFee: 'Fast Fee', tagline: 'Bitcoin, Austrian Economics, and Liberty.',
    learn: 'Learn', loading: 'Loading...', error: 'Failed to load data.',
    recentBlocks: 'Recent Blocks', feeDistribution: 'Fee Distribution',
    blockExplorer: 'Block Explorer', transaction: 'Transaction', address: 'Address',
    miningStats: 'Mining Stats', confirmed: 'Confirmed', unconfirmed: 'Unconfirmed',
    height: 'Height', hash: 'Hash', timestamp: 'Timestamp', size: 'Size',
    weight: 'Weight', version: 'Version', merkleRoot: 'Merkle Root',
    bits: 'Bits', nonce: 'Nonce', difficulty: 'Difficulty',
    totalFees: 'Total Fees', subsidy: 'Subsidy', totalOutput: 'Total Output',
    miner: 'Miner', txCount: 'TX Count', transactions: 'Transactions',
    inputs: 'Inputs', outputs: 'Outputs', fee: 'Fee', feeRate: 'Fee Rate',
    vsize: 'Virtual Size', locktime: 'Locktime', rbf: 'RBF',
    balance: 'Balance', totalReceived: 'Total Received', totalSent: 'Total Sent',
    txHistory: 'TX History', type: 'Type', value: 'Value',
    hashrate: 'Hashrate', diffAdj: 'Difficulty Adjustment',
    topMiners: 'Top Miners', avgBlockTime: 'Avg Block Time',
    blockReward: 'Block Reward', prev: 'Prev', next: 'Next',
    page: 'Page', of: '/',
    ago_sec: 's ago', ago_min: 'm ago', ago_hour: 'h ago', ago_day: 'd ago',
    coinbaseTx: 'Coinbase TX', estimatedConf: 'Estimated Confirmation',
    notFound: 'No results found.',
    blocks144: 'Last 144 blocks (~1 day)',
    progress: 'Progress', estimatedAdj: 'Est. Adjustment',
    last2016: 'Last 2016 blocks',
  }
};

let lang = 'ko';
function t(key) { return (i18n[lang] && i18n[lang][key]) || key; }

// ── 유틸 ──
function satToBtc(sat) { return (sat / 1e8).toFixed(8); }
function formatBtc(sat) { return satToBtc(sat) + ' BTC'; }
function formatNum(n) { return n == null ? '—' : Number(n).toLocaleString(); }
function formatBytes(bytes) {
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
  return bytes + ' B';
}
function timeAgo(ts) {
  const sec = Math.floor(Date.now() / 1000 - ts);
  if (sec < 60) return sec + (lang === 'ko' ? '초 전' : 's ago');
  if (sec < 3600) return Math.floor(sec / 60) + (lang === 'ko' ? '분 전' : 'm ago');
  if (sec < 86400) return Math.floor(sec / 3600) + (lang === 'ko' ? '시간 전' : 'h ago');
  return Math.floor(sec / 86400) + (lang === 'ko' ? '일 전' : 'd ago');
}
function fullDate(ts) { return new Date(ts * 1000).toLocaleString(); }
function shortHash(h) { return h ? h.slice(0, 8) + '...' + h.slice(-8) : '—'; }
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ── API 호출 ──
async function api(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('json')) return res.json();
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return txt; }
}

// ── 상단 통계 업데이트 ──
let statsData = {};
async function updateStats() {
  try {
    const [mem, fees, height] = await Promise.all([
      api('/mempool'), api('/v1/fees/recommended'), api('/blocks/tip/height')
    ]);
    statsData = { mem, fees, height };
    document.getElementById('s-block').textContent = formatNum(height);
    document.getElementById('s-tx').textContent = formatNum(mem.count);
    document.getElementById('s-size').textContent = (mem.vsize / 1e6).toFixed(1) + ' MB';
    document.getElementById('s-fee').textContent = fees.fastestFee + ' sat/vB';
  } catch (e) { console.warn('Stats fetch error:', e); }
}
updateStats();
setInterval(updateStats, 30000);

// ── 라우터 ──
function getRoute() {
  const hash = location.hash || '#/';
  const parts = hash.slice(2).split('/');
  return { path: parts[0] || '', param: parts.slice(1).join('/') };
}

function navigate(hash) {
  location.hash = hash;
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);

function route() {
  const { path, param } = getRoute();
  const app = document.getElementById('app');
  app.innerHTML = `<div class="loading">${t('loading')}</div>`;

  // 멤풀 캔버스 숨기기/보이기
  const mempoolSection = document.getElementById('mempool-section');
  if (mempoolSection) mempoolSection.style.display = path === '' ? '' : 'none';

  switch (path) {
    case '': renderHome(app); break;
    case 'block': renderBlock(app, param); break;
    case 'tx': renderTx(app, param); break;
    case 'address': renderAddress(app, param); break;
    case 'mining': renderMining(app); break;
    default: app.innerHTML = `<div class="error-box">${t('notFound')}</div>`;
  }
}

// ── 검색 ──
function detectSearchType(q) {
  q = q.trim();
  if (!q) return null;
  if (/^\d+$/.test(q)) return { type: 'height', val: q };
  if (/^[0-9a-fA-F]{64}$/.test(q)) return { type: 'hex64', val: q };
  if (/^(1|3|bc1|tb1|2|m|n)/.test(q)) return { type: 'address', val: q };
  return null;
}

async function resolveHex64(hex) {
  // 블록 해시인지 TXID인지 확인
  try {
    const block = await api('/block/' + hex);
    if (block && block.id) return 'block';
  } catch {}
  try {
    const tx = await api('/tx/' + hex);
    if (tx && tx.txid) return 'tx';
  } catch {}
  return null;
}

// ═══════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════
async function renderHome(app) {
  app.innerHTML = '';

  // 멤풀 섹션 (캔버스는 별도 영역)
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
    `;
    app.before(mempoolSection);
  }
  mempoolSection.style.display = '';

  // 멤풀 캔버스 초기화
  if (typeof MempoolViz !== 'undefined') {
    MempoolViz.init(document.getElementById('mempool-canvas'));
  }

  // 수수료 히스토그램
  const feeSection = document.createElement('div');
  feeSection.id = 'fee-histogram';
  feeSection.innerHTML = `<h3>${t('feeDistribution')}</h3><canvas id="fee-chart"></canvas>`;
  app.appendChild(feeSection);

  // 최근 블록
  const blocksSection = document.createElement('div');
  blocksSection.innerHTML = `<div class="section-title">${t('recentBlocks')}</div><div class="blocks-grid" id="recent-blocks"><div class="loading">${t('loading')}</div></div>`;
  app.appendChild(blocksSection);

  // 데이터 로드
  try {
    const [blocks, mempoolBlocks] = await Promise.all([
      api('/v1/blocks'),
      api('/v1/fees/mempool-blocks')
    ]);

    // 최근 블록 렌더
    renderRecentBlocks(blocks.slice(0, 8));

    // 수수료 히스토그램
    renderFeeHistogram(mempoolBlocks);

    // 멤풀 비주얼 업데이트
    if (typeof MempoolViz !== 'undefined') {
      MempoolViz.updateData(blocks.slice(0, 6), mempoolBlocks);
    }
  } catch (e) {
    document.getElementById('recent-blocks').innerHTML = `<div class="error-box">${t('error')}</div>`;
  }
}

function renderRecentBlocks(blocks) {
  const grid = document.getElementById('recent-blocks');
  if (!grid) return;
  grid.innerHTML = blocks.map(b => {
    const pool = b.extras && b.extras.pool ? b.extras.pool.name : 'Unknown';
    const totalFees = b.extras ? b.extras.totalFees : 0;
    return `
      <div class="block-card" onclick="location.hash='#/block/${b.id}'">
        <div class="bc-top">
          <span class="bc-height">#${formatNum(b.height)}</span>
          <span class="bc-time" title="${fullDate(b.timestamp)}">${timeAgo(b.timestamp)}</span>
        </div>
        <div class="bc-row"><span>TX</span><span>${formatNum(b.tx_count)}</span></div>
        <div class="bc-row"><span>${t('size')}</span><span>${formatBytes(b.size)}</span></div>
        <div class="bc-row"><span>${t('fee')}</span><span>${formatBtc(totalFees)}</span></div>
        <div class="bc-miner">${escHtml(pool)}</div>
      </div>
    `;
  }).join('');
}

function renderFeeHistogram(mempoolBlocks) {
  const canvas = document.getElementById('fee-chart');
  if (!canvas || !mempoolBlocks || !mempoolBlocks.length) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;

  // 수수료 범위별 TX 수 집계
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

    // 카운트
    if (r.count > 0) {
      ctx.fillStyle = '#8b949e';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(formatNum(r.count), x + bw / 2, y - 4);
    }

    // 라벨
    ctx.fillStyle = '#555';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(r.label, x + bw / 2, H - 4);
  });

  // 단위 라벨
  ctx.fillStyle = '#555';
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('sat/vB', W - 4, H - 4);
}

// ═══════════════════════════════════════════
// BLOCK PAGE
// ═══════════════════════════════════════════
async function renderBlock(app, param) {
  app.innerHTML = `<div class="loading">${t('loading')}</div>`;

  try {
    let block;
    if (/^\d+$/.test(param)) {
      const hash = await api('/block-height/' + param);
      block = await api('/block/' + hash);
    } else {
      block = await api('/block/' + param);
    }

    const pool = block.extras && block.extras.pool ? block.extras.pool.name : 'Unknown';
    const totalFees = block.extras ? block.extras.totalFees || 0 : 0;
    const reward = block.extras ? block.extras.reward || 0 : 0;
    const totalOutput = block.extras ? block.extras.totalOutputAmt || 0 : 0;

    app.innerHTML = `
      <div class="page-title">${t('blockExplorer')} #${formatNum(block.height)}</div>
      <div class="page-hash">${block.id}</div>

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
        <div class="info-item"><div class="info-label">${t('miner')}</div><div class="info-value accent">${escHtml(pool)}</div></div>
        <div class="info-item"><div class="info-label">${t('txCount')}</div><div class="info-value">${formatNum(block.tx_count)}</div></div>
      </div>

      <div class="section-title">${t('transactions')}</div>
      <div id="block-txs"><div class="loading">${t('loading')}</div></div>
      <div id="block-txs-pagination"></div>
    `;

    loadBlockTxs(block.id, block.tx_count, 0);
  } catch (e) {
    app.innerHTML = `<div class="error-box">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

let blockTxCache = {};
async function loadBlockTxs(blockHash, totalCount, startIdx) {
  const container = document.getElementById('block-txs');
  const pagination = document.getElementById('block-txs-pagination');
  if (!container) return;

  container.innerHTML = `<div class="loading">${t('loading')}</div>`;

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
            <th>${t('size')}</th>
          </tr></thead>
          <tbody>
            ${txs.map((tx, i) => {
              const isCoinbase = tx.vin && tx.vin[0] && tx.vin[0].is_coinbase;
              const totalOut = tx.vout ? tx.vout.reduce((s, o) => s + (o.value || 0), 0) : 0;
              return `<tr>
                <td class="txid-col"><a href="#/tx/${tx.txid}">${isCoinbase ? '<span class="coinbase">[CB]</span> ' : ''}${tx.txid.slice(0, 16)}...</a></td>
                <td>${tx.vin ? tx.vin.length : 0}</td>
                <td>${tx.vout ? tx.vout.length : 0}</td>
                <td>${satToBtc(totalOut)}</td>
                <td>${isCoinbase ? '—' : formatNum(tx.fee)}</td>
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

// ═══════════════════════════════════════════
// TRANSACTION PAGE
// ═══════════════════════════════════════════
async function renderTx(app, txid) {
  app.innerHTML = `<div class="loading">${t('loading')}</div>`;

  try {
    const tx = await api('/tx/' + txid);
    const isConfirmed = tx.status && tx.status.confirmed;
    const totalIn = tx.vin ? tx.vin.reduce((s, v) => s + (v.prevout ? v.prevout.value || 0 : 0), 0) : 0;
    const totalOut = tx.vout ? tx.vout.reduce((s, o) => s + (o.value || 0), 0) : 0;
    const isCoinbase = tx.vin && tx.vin[0] && tx.vin[0].is_coinbase;

    function getAddrType(scriptpubkey_type) {
      const types = {
        'p2pkh': 'P2PKH', 'p2sh': 'P2SH', 'v0_p2wpkh': 'P2WPKH',
        'v0_p2wsh': 'P2WSH', 'v1_p2tr': 'P2TR', 'op_return': 'OP_RETURN',
        'multisig': 'Multisig', 'p2pk': 'P2PK'
      };
      return types[scriptpubkey_type] || scriptpubkey_type || '?';
    }

    app.innerHTML = `
      <div class="page-title">
        ${t('transaction')}
        <span class="badge ${isConfirmed ? 'badge-confirmed' : 'badge-unconfirmed'}">${isConfirmed ? t('confirmed') : t('unconfirmed')}</span>
      </div>
      <div class="page-hash">${tx.txid}</div>

      <div class="info-grid">
        <div class="info-item"><div class="info-label">TXID</div><div class="info-value small">${tx.txid}</div></div>
        <div class="info-item"><div class="info-label">${t('height')}</div><div class="info-value">${isConfirmed ? `<a href="#/block/${tx.status.block_hash}">${formatNum(tx.status.block_height)}</a>` : '—'}</div></div>
        <div class="info-item"><div class="info-label">${t('timestamp')}</div><div class="info-value">${isConfirmed ? fullDate(tx.status.block_time) + '<br><small style="color:var(--text3)">' + timeAgo(tx.status.block_time) + '</small>' : '—'}</div></div>
        <div class="info-item"><div class="info-label">${t('fee')}</div><div class="info-value">${isCoinbase ? '—' : formatNum(tx.fee) + ' sat (' + formatBtc(tx.fee) + ')'}</div></div>
        <div class="info-item"><div class="info-label">${t('feeRate')}</div><div class="info-value">${isCoinbase ? '—' : (tx.fee / (tx.weight / 4)).toFixed(2) + ' sat/vB'}</div></div>
        <div class="info-item"><div class="info-label">${t('size')}</div><div class="info-value">${formatNum(tx.size)} bytes</div></div>
        <div class="info-item"><div class="info-label">${t('vsize')}</div><div class="info-value">${formatNum(Math.ceil(tx.weight / 4))} vBytes</div></div>
        <div class="info-item"><div class="info-label">${t('weight')}</div><div class="info-value">${formatNum(tx.weight)} WU</div></div>
        <div class="info-item"><div class="info-label">${t('version')}</div><div class="info-value">${tx.version}</div></div>
        <div class="info-item"><div class="info-label">${t('locktime')}</div><div class="info-value">${formatNum(tx.locktime)}</div></div>
        <div class="info-item"><div class="info-label">${t('rbf')}</div><div class="info-value">${tx.vin && tx.vin.some(v => v.sequence < 0xfffffffe) ? 'Yes' : 'No'}</div></div>
      </div>

      ${!isConfirmed ? `<div class="info-grid" style="margin-bottom:20px"><div class="info-item"><div class="info-label">${t('estimatedConf')}</div><div class="info-value accent">${t('unconfirmed')}</div></div></div>` : ''}

      <div class="tx-flow-summary">
        <div class="fs-item"><div class="fs-label">${t('inputs')}</div><div class="fs-val">${isCoinbase ? t('coinbaseTx') : formatBtc(totalIn)}</div></div>
        <div class="fs-item"><div class="fs-label">→</div><div class="fs-val"></div></div>
        <div class="fs-item"><div class="fs-label">${t('outputs')}</div><div class="fs-val green">${formatBtc(totalOut)}</div></div>
        ${!isCoinbase ? `<div class="fs-item"><div class="fs-label">${t('fee')}</div><div class="fs-val red">${formatBtc(tx.fee)}</div></div>` : ''}
      </div>

      <div class="tx-flow">
        <div class="tx-flow-col">
          <h4>${t('inputs')} (${tx.vin ? tx.vin.length : 0})</h4>
          ${(tx.vin || []).map(v => {
            if (v.is_coinbase) return `<div class="tx-io-item"><div class="io-addr" style="color:var(--accent)">${t('coinbaseTx')}</div><div class="io-val">${formatBtc(totalOut)}</div></div>`;
            const addr = v.prevout ? (v.prevout.scriptpubkey_address || 'Unknown') : 'Unknown';
            const val = v.prevout ? v.prevout.value || 0 : 0;
            const addrType = v.prevout ? getAddrType(v.prevout.scriptpubkey_type) : '?';
            return `<div class="tx-io-item">
              <div class="io-addr" onclick="location.hash='#/address/${addr}'">${addr}</div>
              <div class="io-val">${formatBtc(val)}</div>
              <div class="io-type">${addrType}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="tx-flow-arrow">→</div>
        <div class="tx-flow-col">
          <h4>${t('outputs')} (${tx.vout ? tx.vout.length : 0})</h4>
          ${(tx.vout || []).map(o => {
            const addr = o.scriptpubkey_address || (o.scriptpubkey_type === 'op_return' ? 'OP_RETURN' : 'Unknown');
            const addrType = getAddrType(o.scriptpubkey_type);
            return `<div class="tx-io-item">
              <div class="io-addr" ${addr !== 'OP_RETURN' && addr !== 'Unknown' ? `onclick="location.hash='#/address/${addr}'"` : ''} ${addr === 'OP_RETURN' ? 'style="color:var(--text3)"' : ''}>${addr}</div>
              <div class="io-val">${formatBtc(o.value)}</div>
              <div class="io-type">${addrType}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    app.innerHTML = `<div class="error-box">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

// ═══════════════════════════════════════════
// ADDRESS PAGE
// ═══════════════════════════════════════════
async function renderAddress(app, address) {
  app.innerHTML = `<div class="loading">${t('loading')}</div>`;

  try {
    const info = await api('/address/' + address);
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

    app.innerHTML = `
      <div class="page-title">${t('address')}</div>
      <div class="page-hash">${address}</div>

      <div class="addr-summary">
        <div class="addr-stat"><div class="as-val">${getAddrTypeFromAddr(address)}</div><div class="as-lbl">${t('type')}</div></div>
        <div class="addr-stat"><div class="as-val">${formatBtc(balance)}</div><div class="as-lbl">${t('balance')}</div></div>
        <div class="addr-stat"><div class="as-val">${formatBtc(totalReceived)}</div><div class="as-lbl">${t('totalReceived')}</div></div>
        <div class="addr-stat"><div class="as-val">${formatBtc(totalSent)}</div><div class="as-lbl">${t('totalSent')}</div></div>
        <div class="addr-stat"><div class="as-val">${formatNum(txCount)}</div><div class="as-lbl">${t('txCount')}</div></div>
      </div>

      <div class="section-title">${t('txHistory')}</div>
      <div id="addr-txs"><div class="loading">${t('loading')}</div></div>
      <div id="addr-txs-more"></div>
    `;

    loadAddrTxs(address, null);
  } catch (e) {
    app.innerHTML = `<div class="error-box">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

async function loadAddrTxs(address, lastTxid) {
  const container = document.getElementById('addr-txs');
  const moreBtn = document.getElementById('addr-txs-more');
  if (!container) return;

  if (!lastTxid) container.innerHTML = `<div class="loading">${t('loading')}</div>`;

  try {
    const url = lastTxid ? `/address/${address}/txs/chain/${lastTxid}` : `/address/${address}/txs`;
    const txs = await api(url);

    const html = txs.map(tx => {
      const totalOut = tx.vout ? tx.vout.reduce((s, o) => s + (o.value || 0), 0) : 0;
      const isConfirmed = tx.status && tx.status.confirmed;
      return `<tr>
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
      moreBtn.innerHTML = `<div class="pagination"><button onclick="loadAddrTxs('${address}', '${lastId}')">${t('next')} →</button></div>`;
    } else {
      moreBtn.innerHTML = '';
    }
  } catch (e) {
    container.innerHTML = `<div class="error-box">${t('error')}</div>`;
  }
}

// ═══════════════════════════════════════════
// MINING PAGE
// ═══════════════════════════════════════════
async function renderMining(app) {
  app.innerHTML = `<div class="loading">${t('loading')}</div>`;

  try {
    const [hashrate, diffAdj, blocks] = await Promise.all([
      api('/v1/mining/hashrate/1m'),
      api('/v1/difficulty-adjustment'),
      api('/v1/blocks')
    ]);

    // 마이너 통계 계산 (최근 144블록)
    const recentBlocks = blocks.slice(0, 144);
    const minerMap = {};
    let totalFees = 0, totalReward = 0;
    recentBlocks.forEach(b => {
      const pool = b.extras && b.extras.pool ? b.extras.pool.name : 'Unknown';
      minerMap[pool] = (minerMap[pool] || 0) + 1;
      totalFees += b.extras ? b.extras.totalFees || 0 : 0;
      totalReward += b.extras ? b.extras.reward || 0 : 0;
    });
    const topMiners = Object.entries(minerMap).sort((a, b) => b[1] - a[1]);

    // 평균 블록 시간
    let avgBlockTime = 600;
    if (recentBlocks.length > 1) {
      const first = recentBlocks[recentBlocks.length - 1].timestamp;
      const last = recentBlocks[0].timestamp;
      avgBlockTime = (last - first) / (recentBlocks.length - 1);
    }

    const diffProgress = diffAdj.progressPercent || 0;
    const estChange = diffAdj.difficultyChange || 0;

    app.innerHTML = `
      <div class="page-title">${t('miningStats')}</div>

      <div class="mining-stats-row">
        <div class="ms-card"><div class="ms-val">${formatNum(recentBlocks[0]?.height)}</div><div class="ms-lbl">${t('blockHeight')}</div></div>
        <div class="ms-card"><div class="ms-val">${Math.round(avgBlockTime / 60 * 10) / 10} min</div><div class="ms-lbl">${t('avgBlockTime')} (${t('blocks144')})</div></div>
        <div class="ms-card"><div class="ms-val">${formatBtc(Math.round(totalReward / recentBlocks.length))}</div><div class="ms-lbl">${t('blockReward')} (avg)</div></div>
        <div class="ms-card"><div class="ms-val">${formatBtc(Math.round(totalFees / recentBlocks.length))}</div><div class="ms-lbl">${t('fee')} (avg/block)</div></div>
      </div>

      <div class="mining-grid">
        <div class="mining-card">
          <h3>${t('hashrate')} (30${lang === 'ko' ? '일' : ' days'})</h3>
          <canvas id="hashrate-chart"></canvas>
        </div>
        <div class="mining-card">
          <h3>${t('diffAdj')}</h3>
          <div style="margin-bottom:8px;font-size:.75rem;color:var(--text2)">
            ${t('progress')}: ${diffProgress.toFixed(1)}% (${diffAdj.remainingBlocks || '?'} ${lang === 'ko' ? '블록 남음' : 'blocks left'})
          </div>
          <div class="diff-bar-wrap">
            <div class="diff-bar" style="width:${diffProgress}%"></div>
            <div class="diff-bar-text">${diffProgress.toFixed(1)}%</div>
          </div>
          <div style="margin-top:8px;font-size:.75rem;color:var(--text2)">
            ${t('estimatedAdj')}: <span style="color:${estChange >= 0 ? 'var(--green)' : 'var(--red)'}">${estChange >= 0 ? '+' : ''}${estChange.toFixed(2)}%</span>
          </div>
          <div style="margin-top:4px;font-size:.68rem;color:var(--text3)">
            ${lang === 'ko' ? '예상 시간' : 'Estimated'}: ${diffAdj.estimatedRetargetDate ? new Date(diffAdj.estimatedRetargetDate).toLocaleDateString() : '?'}
          </div>
        </div>
      </div>

      <div class="mining-card" style="margin-bottom:20px">
        <h3>${t('topMiners')} (${t('blocks144')})</h3>
        <table class="miners-table">
          <thead><tr><th>${t('miner')}</th><th>${lang === 'ko' ? '블록' : 'Blocks'}</th><th>%</th><th></th></tr></thead>
          <tbody>
            ${topMiners.slice(0, 15).map(([name, count]) => {
              const pct = (count / recentBlocks.length * 100).toFixed(1);
              return `<tr>
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

    // 해시레이트 차트
    renderHashrateChart(hashrate);
  } catch (e) {
    app.innerHTML = `<div class="error-box">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

function renderHashrateChart(data) {
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

  const values = hashrates.map(h => h.avgHashrate / 1e18); // EH/s
  const maxVal = Math.max(...values) * 1.1;
  const minVal = Math.min(...values) * 0.9;
  const range = maxVal - minVal || 1;
  const padL = 50, padR = 10, padT = 10, padB = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  ctx.clearRect(0, 0, W, H);

  // 그리드
  ctx.strokeStyle = '#21262d';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    const val = maxVal - (range / 4) * i;
    ctx.fillStyle = '#555';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(0) + ' EH/s', padL - 4, y + 3);
  }

  // 라인
  ctx.beginPath();
  ctx.strokeStyle = '#f7931a';
  ctx.lineWidth = 1.5;
  values.forEach((v, i) => {
    const x = padL + (i / (values.length - 1)) * chartW;
    const y = padT + chartH - ((v - minVal) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // 그라데이션 채우기
  const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
  grad.addColorStop(0, 'rgba(247,147,26,0.15)');
  grad.addColorStop(1, 'rgba(247,147,26,0)');
  ctx.lineTo(padL + chartW, H - padB);
  ctx.lineTo(padL, H - padB);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
}

// ═══════════════════════════════════════════
// APP (글로벌)
// ═══════════════════════════════════════════
window.App = {
  toggleLang() {
    lang = lang === 'ko' ? 'en' : 'ko';
    document.getElementById('lang-btn').textContent = lang === 'ko' ? 'EN' : 'KO';
    document.getElementById('search-input').placeholder = t('search_ph');
    document.getElementById('tagline').textContent = t('tagline');
    document.querySelectorAll('[data-ko]').forEach(el => {
      el.textContent = lang === 'ko' ? el.dataset.ko : el.dataset.en;
    });
    // 현재 페이지 다시 렌더
    route();
  },

  async doSearch() {
    const input = document.getElementById('search-input');
    const q = input.value.trim();
    if (!q) return;

    const detected = detectSearchType(q);
    if (!detected) {
      alert(t('notFound'));
      return;
    }

    switch (detected.type) {
      case 'height':
        navigate('#/block/' + detected.val);
        break;
      case 'address':
        navigate('#/address/' + detected.val);
        break;
      case 'hex64':
        // 블록 해시 또는 TXID 확인
        const app = document.getElementById('app');
        app.innerHTML = `<div class="loading">${t('loading')}</div>`;
        const resolved = await resolveHex64(detected.val);
        if (resolved === 'block') navigate('#/block/' + detected.val);
        else if (resolved === 'tx') navigate('#/tx/' + detected.val);
        else { app.innerHTML = `<div class="error-box">${t('notFound')}</div>`; }
        break;
    }
    input.value = '';
  }
};

// Enter 키 검색
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') App.doSearch();
});

// loadBlockTxs, loadAddrTxs 글로벌
window.loadBlockTxs = loadBlockTxs;
window.loadAddrTxs = loadAddrTxs;
