
// ── SVG 아이콘 인라인 헬퍼 ──────────────────
const ICONS = {
  'pickaxe': 'M14 10-8.5 8.5c-.83.83-.83 2.17 0 3 .83.83 2.17.83 3 0L17 13M15 11 9 5m1-3-4 4m11 2-4-4m1 0 1.5-1.5M11 13l-1.5 1.5',
  'bar-chart': 'M18 20V10M12 20V4M6 20v-6',
  'blocks': 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  'trending-up': 'M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6',
  'target': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  'trophy': 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z',
  'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'zap': 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  'calculator': 'M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01',
  'list': 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  'bell': 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  'package': 'M16.5 9.4 7.5 4.2M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7l8.7 5 8.7-5M12 22V12',
  'sun': 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z',
  'moon': 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  'search': 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
};
function icon(name, cls='') {
  const d = ICONS[name];
  if (!d) return '';
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
}
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
    search: '검색',
    coinbaseReward: '코인베이스 - 블록 보상',
    block: '블록',
    favorites: '즐겨찾기',
    monitoring: '모니터링',
    feeCalc: '수수료 계산기',
    speed: '속도', estFee: '예상 수수료', estTime: '예상 시간',
    fast: '빠름', normal: '보통', slow: '느림',
    qrView: 'QR 보기', copy: '복사', copied: '복사됨!',
    btcPrice: 'BTC 가격', days30: '30일',
    lightning: '라이트닝 네트워크',
    channels: '채널 수', capacity: '총 용량', nodes: '노드 수', avgChannelSize: '평균 채널 크기',
    newBlock: '새 블록 발견!',
    newTx: '새 트랜잭션 발견!',
    mempoolSizeHistory: '멤풀 크기 추이',
    clickBlockHint: '블록을 클릭해 상세 정보를 확인하세요',
  },
  ja: {
    home: 'ホーム', mining: 'マイニング', search_ph: 'TXID / ブロック高 / アドレス検索...',
    blockHeight: 'ブロック高', unconfirmedTx: '未確認TX', mempoolSize: 'メンプールサイズ',
    fastFee: '速い手数料', tagline: 'ビットコイン、オーストリア経済学、そして自由。',
    learn: '学習', loading: '読み込み中...', error: 'データを取得できません。',
    recentBlocks: '最近のブロック', feeDistribution: '手数料分布',
    blockExplorer: 'ブロックエクスプローラー', transaction: 'トランザクション', address: 'アドレス',
    miningStats: 'マイニング統計', confirmed: '確認済み', unconfirmed: '未確認',
    height: '高さ', hash: 'ハッシュ', timestamp: '時刻', size: 'サイズ',
    weight: '重さ', version: 'バージョン', merkleRoot: 'マークルルート',
    bits: 'ビット', nonce: 'ノンス', difficulty: '難易度',
    totalFees: '合計手数料', subsidy: '補助金', totalOutput: '合計出力',
    miner: 'マイナー', txCount: 'TX数', transactions: 'トランザクション一覧',
    inputs: '入力', outputs: '出力', fee: '手数料', feeRate: '手数料率',
    vsize: '仮想サイズ', locktime: 'ロックタイム', rbf: 'RBF',
    balance: '残高', totalReceived: '受取合計', totalSent: '送付合計',
    txHistory: '取引履歴', type: 'タイプ', value: '金額',
    hashrate: 'ハッシュレート', diffAdj: '難易度調整',
    topMiners: 'トップマイナー', avgBlockTime: '平均ブロック時間',
    blockReward: 'ブロック報酬', prev: '前', next: '次',
    page: 'ページ', of: '/',
    ago_sec: '秒前', ago_min: '分前', ago_hour: '時間前', ago_day: '日前',
    coinbaseTx: 'コインベースTX', estimatedConf: '推定確認時間',
    notFound: '検索結果が見つかりません。',
    blocks144: '最近144ブロック (~1日)',
    progress: '進捗', estimatedAdj: '推定調整',
    last2016: '最近2016ブロック',
    search: '検索', coinbaseReward: 'コインベース - ブロック報酬',
    block: 'ブロック', favorites: 'お気に入り',
    monitoring: 'モニタリング', newTx: '新しいTX',
    newBlock: '新しいブロック！',
    fast: '速い', normal: '普通', slow: '遅い',
    feeCalc: '手数料計算機', txType: 'TXタイプ', estFee: '推定手数料',
    estTime: '推定時間', vbytes: 'vBytes',
    btcPrice: 'BTC価格', days30: '30日',
    mempoolSizeHistory: 'メンプール推移',
    lightning: 'ライトニング統計',
    clickBlockHint: 'ブロックをクリックして詳細を確認',
    krwPrice: 'BTC価格', monitoring_active: 'モニタリング中',
    copy: 'コピー', copied: 'コピー完了',
    btcKrw: 'BTC/KRW', btcUsd: 'BTC/USD',
    qrView: 'QRコード',
    speed: '速度',
    channels: 'チャンネル数',
    capacity: '総容量',
    nodes: 'ノード数',
    avgChannelSize: '平均チャンネルサイズ',
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
    search: 'Search',
    coinbaseReward: 'Coinbase - Block Reward',
    block: 'Block',
    favorites: 'Favorites',
    monitoring: 'Monitor',
    feeCalc: 'Fee Calculator',
    speed: 'Speed', estFee: 'Est. Fee', estTime: 'Est. Time',
    fast: 'Fast', normal: 'Normal', slow: 'Slow',
    qrView: 'QR Code', copy: 'Copy', copied: 'Copied!',
    btcPrice: 'BTC Price', days30: '30 days',
    lightning: 'Lightning Network',
    channels: 'Channels', capacity: 'Total Capacity', nodes: 'Nodes', avgChannelSize: 'Avg Channel Size',
    newBlock: 'New block found!',
    newTx: 'New transaction found!',
    mempoolSizeHistory: 'Mempool Size Trend',
    clickBlockHint: 'Click a block for details',
  }
};

let lang = 'ko';
function t(key) { return (i18n[lang] && i18n[lang][key]) || key; }

// ── 유틸 ──
function satToBtc(sat) { return (sat / 1e8).toFixed(8); }
function btcWithKrw(sat) {
  if (!sat || !window._btcKrw) return formatBtc(sat) + ' BTC';
  const btc = sat / 1e8;
  const krw = btc * window._btcKrw;
  const krwStr = krw >= 1e8 ? (krw/1e8).toFixed(2)+'억' : krw >= 1e4 ? Math.round(krw/1e4)+'만' : Math.round(krw).toLocaleString();
  return formatBtc(sat) + ` BTC <small style="color:var(--text3);font-size:.72em">≈ ₩${krwStr}</small>`;
}

function formatBtc(sat) { return satToBtc(sat) + ' BTC'; }
function formatNum(n) { return n == null ? '—' : Number(n).toLocaleString(); }
function formatBytes(bytes) {
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
  return bytes + ' B';
}
function timeAgo(ts) {
  const sec = Math.floor(Date.now() / 1000 - ts);
  const sfx = lang === 'ko' ? ['초 전','분 전','시간 전','일 전'] :
               lang === 'ja' ? ['秒前','分前','時間前','日前'] :
                               ['s ago','m ago','h ago','d ago'];
  if (sec < 60) return sec + sfx[0];
  if (sec < 3600) return Math.floor(sec / 60) + sfx[1];
  if (sec < 86400) return Math.floor(sec / 3600) + sfx[2];
  return Math.floor(sec / 86400) + sfx[3];
}
function fullDate(ts) { return new Date(ts * 1000).toLocaleString(); }
function shortHash(h) { return h ? h.slice(0, 8) + '...' + h.slice(-8) : '—'; }
function shortAddr(a) { return a ? a.slice(0, 10) + '...' + a.slice(-6) : '—'; }
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// 수수료 → 색상 레벨
function feeLevel(sat) {
  if (sat >= 100) return 'extreme';
  if (sat >= 20) return 'high';
  if (sat >= 5) return 'medium';
  if (sat >= 2) return 'low';
  if (sat >= 1) return 'economy';
  if (sat >= 0.5) return 'minimal';
  return 'negligible';
}
function feeColorHex(sat) {
  if (sat >= 100) return '#ff4444';
  if (sat >= 20) return '#ff8800';
  if (sat >= 5) return '#f7931a';
  if (sat >= 2) return '#ffcc00';
  if (sat >= 1) return '#44bb44';
  if (sat >= 0.5) return '#4488ff';
  return '#445566';
}
function coloredFeeRate(sat) {
  const level = feeLevel(sat);
  return `<span class="fee-color" data-level="${level}">${Number(sat).toFixed(1)} sat/vB</span>`;
}

// 스켈레톤 생성
function skeletonCards(n) {
  let html = '<div class="skeleton-grid">';
  for (let i = 0; i < n; i++) {
    html += `<div class="skeleton-card" style="--i:${i}">
      <div class="skeleton-line w60 h20"></div>
      <div class="skeleton-line w80"></div>
      <div class="skeleton-line w40"></div>
      <div class="skeleton-line w100 mb0"></div>
    </div>`;
  }
  html += '</div>';
  return html;
}

function skeletonTable(rows) {
  let html = '<div class="tx-table-wrap"><div class="skeleton-table">';
  for (let i = 0; i < rows; i++) {
    html += `<div class="skeleton-table-row">
      <div class="skeleton" style="flex:3;height:14px"></div>
      <div class="skeleton" style="flex:1;height:14px"></div>
      <div class="skeleton" style="flex:1;height:14px"></div>
      <div class="skeleton" style="flex:1;height:14px"></div>
    </div>`;
  }
  html += '</div></div>';
  return html;
}

function skeletonAddrStats(n) {
  let html = '<div class="addr-summary">';
  for (let i = 0; i < n; i++) {
    html += `<div class="skeleton-addr-stat"><div class="skeleton"></div><div class="skeleton"></div></div>`;
  }
  html += '</div>';
  return html;
}

// ── API 호출 ──
async function api(path, _retry = 1) {
  try {
    const res = await fetch(API + path);
    if (!res.ok) throw new Error('API ' + res.status);
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('json')) return res.json();
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  } catch(e) {
    if (_retry > 0) { await new Promise(r => setTimeout(r, 3000)); return api(path, _retry - 1); }
    throw e;
  }
}

// ═══════════════════════════════════════════
// TOAST SYSTEM
// ═══════════════════════════════════════════
function showToast(title, body, onClick, duration = 8000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-close" onclick="event.stopPropagation();this.parentElement.remove()">✕</span><div class="toast-title">${title}</div><div class="toast-body">${body}</div>`;
  if (onClick) toast.addEventListener('click', onClick);
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ═══════════════════════════════════════════
// FAVORITES SYSTEM
// ═══════════════════════════════════════════
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
}
function saveFavorites(favs) { localStorage.setItem('favorites', JSON.stringify(favs)); }
function isFavorite(type, value) { return getFavorites().some(f => f.type === type && f.value === value); }
function toggleFavorite(type, value, label) {
  let favs = getFavorites();
  const idx = favs.findIndex(f => f.type === type && f.value === value);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push({ type, value, label, addedAt: Date.now() });
  }
  saveFavorites(favs);
  // Update button state
  document.querySelectorAll('.fav-btn').forEach(btn => {
    if (btn.dataset.type === type && btn.dataset.value === value) {
      btn.classList.toggle('active', isFavorite(type, value));
      btn.textContent = isFavorite(type, value) ? '★' : '☆';
    }
  });
}
function removeFavorite(type, value) {
  let favs = getFavorites();
  saveFavorites(favs.filter(f => !(f.type === type && f.value === value)));
}
function favButton(type, value, label) {
  const active = isFavorite(type, value);
  return `<button class="fav-btn ${active ? 'active' : ''}" data-type="${type}" data-value="${escHtml(value)}" onclick="event.stopPropagation();toggleFavorite('${type}','${escHtml(value)}','${escHtml(label)}')">${active ? '★' : '☆'}</button>`;
}
function renderFavoritesSection() {
  const favs = getFavorites();
  if (!favs.length) return '';
  const chips = favs.slice(0, 10).map(f => {
    const href = f.type === 'block' ? `#/block/${f.value}` : f.type === 'tx' ? `#/tx/${f.value}` : `#/address/${f.value}`;
    return `<a href="${href}" class="fav-chip">
      <span>${f.type === 'block' ? '▣' : f.type === 'tx' ? '↔' : '◎'} ${escHtml(f.label)}</span>
      <span class="fav-remove" onclick="event.preventDefault();event.stopPropagation();removeFavorite('${f.type}','${escHtml(f.value)}');document.getElementById('fav-section')?.remove();route();">✕</span>
    </a>`;
  }).join('');
  const countBadge = favs.length > 10 ? `<span class="fav-count">+${favs.length - 10}개 더</span>` : '';
  return `<div class="fav-section" id="fav-section">
    <div class="section-title">${icon('star')} ${t('favorites')}</div>
    <div class="fav-chips">${chips}${countBadge}</div>
  </div>`;
}

// ═══════════════════════════════════════════
// ADDRESS MONITORING
// ═══════════════════════════════════════════
function getMonitoredAddrs() {
  try { return JSON.parse(localStorage.getItem('monitored_addrs') || '{}'); } catch { return {}; }
}
function saveMonitoredAddrs(m) {
  localStorage.setItem('monitored_addrs', JSON.stringify(m));
  updateMonitorBadge();
}
function toggleMonitor(address) {
  const m = getMonitoredAddrs();
  if (m[address]) {
    delete m[address];
  } else {
    m[address] = { txCount: null, lastCheck: Date.now() };
  }
  saveMonitoredAddrs(m);
  // Update button
  document.querySelectorAll('.monitor-btn').forEach(btn => {
    if (btn.dataset.addr === address) {
      const isMonitored = !!getMonitoredAddrs()[address];
      btn.classList.toggle('active', isMonitored);
      btn.innerHTML = isMonitored ? icon('bell') + ' ' + t('monitoring') + ' ✓' : icon('bell') + ' ' + t('monitoring');
    }
  });
}
function updateMonitorBadge() {
  const badge = document.getElementById('monitor-badge');
  if (!badge) return;
  const count = Object.keys(getMonitoredAddrs()).length;
  badge.textContent = count;
  badge.style.display = count > 0 ? '' : 'none';
}

async function checkMonitoredAddresses() {
  const m = getMonitoredAddrs();
  const addrs = Object.keys(m);
  if (!addrs.length) return;
  for (const addr of addrs) {
    try {
      const info = await api('/address/' + addr);
      const chain = info.chain_stats || {};
      const mempool = info.mempool_stats || {};
      const totalTx = chain.tx_count + mempool.tx_count;
      if (m[addr].txCount !== null && totalTx > m[addr].txCount) {
        showToast(
          '📬 ' + t('newTx'),
          shortAddr(addr),
          () => { location.hash = '#/address/' + addr; }
        );
      }
      m[addr].txCount = totalTx;
      m[addr].lastCheck = Date.now();
    } catch {}
  }
  saveMonitoredAddrs(m);
}

// ── 새 블록 이벤트 처리 ──────────────────────
let _lastNotifiedHeight = null;

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
      lang === 'ko' ? `새 블록 #${formatNum(nb.height)}` : `New Block #${formatNum(nb.height)}`,
      `${pool} | ${formatNum(nb.tx_count)} TX | ${(fees / 1e8).toFixed(4)} BTC ${lang==='ko'?'수수료':'fees'}`,
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
        renderRecentBlocks(newBlocks.slice(0, 8));
        if (typeof MempoolViz !== 'undefined') {
          MempoolViz.updateData(newBlocks.slice(0, 6), mempoolBlocks);
        }
      } catch {}
    }
  } catch(e) { console.warn('onNewBlock error:', e); }
}

// WS에서 새 블록 이벤트 수신
window.addEventListener('mempool:newblock', (e) => {
  onNewBlock(e.detail);
});

// ── 상단 통계 업데이트 ──
let statsData = {};
let lastKnownHeight = null;

async function updateStats() {
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

    // BTC/USD CoinGecko
    try {
      const cg = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd').then(r=>r.json());
      if (cg?.bitcoin?.usd) { flashStat('s-usd', '$' + formatNum(cg.bitcoin.usd)); window._btcUsd = cg.bitcoin.usd; }
    } catch {}

    // BTC/KRW 업비트
    try {
      const upbit = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC').then(r => r.json());
      if (upbit && upbit[0]) {
        const price = upbit[0].trade_price;
        window._btcKrw = price;
        const change = upbit[0].signed_change_rate * 100;
        const priceStr = price >= 1e8 ? (price/1e8).toFixed(2)+'억' : Math.round(price/1e4)+'만';
        flashStat('s-krw', '₩'+priceStr);
        const krwCh = document.getElementById('s-krw-change');
        if (krwCh) { krwCh.textContent = (change>=0?'+':'')+change.toFixed(2)+'%'; krwCh.className='stat-change '+(change>=0?'up':'down'); }
      }
    } catch {}

    // 멤풀 TPS
    try {
      const recent = await api('/mempool/recent');
      if (Array.isArray(recent) && recent.length) {
        const now = Math.floor(Date.now()/1000);
        const oneMin = recent.filter(tx => now - (tx.firstSeen||0) < 60).length;
        flashStat('s-tps', (oneMin/60).toFixed(1) + ' tx/s');
      }
    } catch {}

    // BTC 도미넌스
    try {
      const gdata = await fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json());
      const dom = gdata?.data?.market_cap_percentage?.btc;
      if (dom) flashStat('s-dom', dom.toFixed(1) + '%');
    } catch {}

    // 반감기 카운트다운
    const currentHeight = Number(height);
    const nextHalving = Math.ceil((currentHeight + 1) / 210000) * 210000;
    const blocksLeft = nextHalving - currentHeight;
    const daysLeft = Math.round(blocksLeft * 10 / 60 / 24);
    flashStat('s-halving', formatNum(blocksLeft) + ' blk');
    const halvEl = document.getElementById('s-halving-sub');
    if (halvEl) { halvEl.textContent = '~' + daysLeft + (lang==='ko'?'일':lang==='ja'?'日':' days'); }

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
  el.textContent = newVal;
  if (oldVal !== '—' && oldVal !== newVal) {
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }
}

updateStats();
updateMonitorBadge();
setInterval(updateStats, 30000);
setInterval(checkMonitoredAddresses, 60000);

// ── 네비게이션 활성 상태 ──
function updateActiveNav(path) {
  document.querySelectorAll('#nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === path);
  });
  document.querySelectorAll('#mobile-bottom-nav .mnav-item').forEach(a => {
    const page = a.dataset.page;
    const isActive = page !== undefined && page === path;
    a.classList.toggle('active', isActive);
  });
}



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

// 스크롤 위치 저장/복원
const _scrollPos = {};
function saveScroll() { _scrollPos[location.hash] = window.scrollY; }
window.addEventListener('scroll', () => { if (window._routeReady) saveScroll(); }, { passive: true });

function route() {
  if (window._txPollInterval) { clearInterval(window._txPollInterval); window._txPollInterval = null; }
  const { path, param } = getRoute();
  const app = document.getElementById('app');

  const mempoolSection = document.getElementById('mempool-section');
  if (mempoolSection) mempoolSection.style.display = path === '' ? '' : 'none';

  updateActiveNav(path);

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

// ── 브레드크럼 ──
function breadcrumb(items) {
  return `<div class="breadcrumb">${items.map((item, i) => {
    if (i < items.length - 1) {
      return `<a href="${item.href}">${item.label}</a><span class="bc-sep">›</span>`;
    }
    return `<span>${item.label}</span>`;
  }).join('')}</div>`;
}

// ═══════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════
async function renderHome(app) {
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

  // 최근 블록
  _lastBlockHeights = null;  // 라우팅 시 캐시 초기화
  const blocksSection = document.createElement('div');
  blocksSection.innerHTML = `<div class="section-title">${icon('pickaxe')} ${t('recentBlocks')}</div><div class="blocks-grid" id="recent-blocks">${skeletonCards(8)}</div>`;
  app.appendChild(blocksSection);

  // Charts placeholder
  const chartsDiv = document.createElement('div');
  chartsDiv.id = 'home-charts';
  chartsDiv.innerHTML = `<div class="charts-grid">
    <div class="chart-card"><h3>${icon('trending-up')} ${t('btcPrice')} (${t('days30')})</h3><div id="price-info" class="chart-subtitle">${t('loading')}</div><canvas id="price-chart"></canvas></div>
    <div class="chart-card"><h3>${icon('package')} ${t('mempoolSizeHistory')}</h3><div class="chart-subtitle">&nbsp;</div><canvas id="mempool-history-chart"></canvas></div>
  </div>`;
  app.appendChild(chartsDiv);

  // Lightning
  const lnDiv = document.createElement('div');
  lnDiv.id = 'lightning-section';
  lnDiv.className = 'lightning-section';
  lnDiv.innerHTML = `<div class="lightning-header" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
    <h3>${icon('zap')} ${t('lightning')}</h3>
    <span class="toggle-icon">▼</span>
  </div>
  <div class="lightning-body">
    <div class="lightning-stats-grid" id="ln-stats">${skeletonCards(4)}</div>
  </div>`;
  app.appendChild(lnDiv);

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
    if (el) el.innerHTML = `<div class="error-box">${t('error')}</div>`;
  }

  // Load charts & lightning in parallel
  loadBtcPriceChart();
  loadMempoolHistoryChart();
  loadLightningStats();
}

let _lastBlockHeights = null;
function renderRecentBlocks(blocks) {
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
      <div class="block-card stagger-item" style="--i:${idx}" onclick="location.hash='#/block/${b.id}'" title="${b.id}">
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

function renderFeeHistogram(mempoolBlocks, canvasEl) {
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
  try {
    const data = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30').then(r => r.json());
    const prices = data.prices || [];
    if (!prices.length) return;

    const current = prices[prices.length - 1][1];
    const dayAgo = prices.find(p => p[0] >= prices[prices.length - 1][0] - 86400000);
    const change24h = dayAgo ? ((current - dayAgo[1]) / dayAgo[1] * 100) : 0;

    const infoEl = document.getElementById('price-info');
    if (infoEl) {
      const changeClass = change24h >= 0 ? 'up' : 'down';
      infoEl.innerHTML = `<span class="price-current">$${formatNum(Math.round(current))}</span><span class="price-change ${changeClass}">${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}% (24h)</span>`;
    }

    const canvas = document.getElementById('price-chart');
    if (!canvas) return;
    const priceColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#f7931a";
    drawLineChart(canvas, prices.map(p => p[1]), priceColor);
  } catch {}
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
    } catch {}

    if (!chartData.length && data.hashrates) {
      chartData = data.hashrates.map(h => h.avgHashrate / 1e18);
    }

    const canvas = document.getElementById('mempool-history-chart');
    if (!canvas || !chartData.length) return;
    drawAreaChart(canvas, chartData, '#4488ff');
  } catch {}
}

function drawLineChart(canvas, values, color) {
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
async function loadLightningStats() {
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

// ═══════════════════════════════════════════
// BLOCK PAGE
// ═══════════════════════════════════════════
async function renderBlock(app, param) {
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
        <div class="info-item"><div class="info-label">${t('miner')}</div><div class="info-value accent">⛏ ${escHtml(pool)}</div></div>
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
    app.innerHTML = `<div class="error-box">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

async function loadBlockTxs(blockHash, totalCount, startIdx) {
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
              return `<tr class="stagger-item" style="--i:${i}">
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

// ═══════════════════════════════════════════
// TRANSACTION PAGE
// ═══════════════════════════════════════════
async function renderTx(app, txid) {
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
            const addr = v.prevout ? (v.prevout.scriptpubkey_address || 'Unknown') : 'Unknown';
            const val = v.prevout ? v.prevout.value || 0 : 0;
            const addrType = v.prevout ? getAddrType(v.prevout.scriptpubkey_type) : '?';
            return `<div class="tx-io-item stagger-item" style="--i:${i}">
              <div class="io-addr" onclick="location.hash='#/address/${addr}'">${addr}</div>
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
            const addr = o.scriptpubkey_address || (isOpReturn ? 'OP_RETURN' : 'Unknown');
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
                  ? `<div class="op-return-decoded">💬 "${escHtml(text)}"</div>`
                  : `<div class="op-return-decoded">0x${hexData.slice(0, 40)}${hexData.length > 40 ? "…" : ""}</div>`;
              } catch {}
            }
            return `<div class="${itemClass} stagger-item" style="--i:${i}">
              <div class="io-addr" ${!isOpReturn && addr !== 'Unknown' ? `onclick="location.hash='#/address/${addr}'"` : ''}>${isOpReturn ? '📝 OP_RETURN' : addr}</div>
              <div class="io-val">${formatBtc(o.value)}</div>
              <div class="io-type">${addrType}</div>
              ${opReturnText}
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
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
            statusBar.textContent = '✓ ' + t('confirmed') + ' — Block #' + formatNum(updated.status.block_height);
          }
        }
      } catch {}
    }, 20000);
  }
  } catch (e) {
    app.innerHTML = `<div class="error-box">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

// ═══════════════════════════════════════════
// ADDRESS PAGE
// ═══════════════════════════════════════════
async function renderAddress(app, address) {
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

    app.innerHTML = `
      ${breadcrumb([
        { href: '#/', label: t('home') },
        { href: '#/address/' + address, label: t('address') },
        { href: '#/address/' + address, label: shortHash(address) }
      ])}

      <div class="page-actions">
        <div class="page-title">${t('address')}</div>
        ${favButton('address', address, favLabel)}
        <button class="icon-btn" id="addr-label-btn" onclick="promptAddrLabel('${address}')" title="${getAddrLabel(address)||'메모 추가'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
        <button class="share-btn" onclick="shareUrl(location.href)" title="Share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
        <button class="monitor-btn ${isMonitored ? 'active' : ''}" data-addr="${address}" onclick="toggleMonitor('${address}')">${icon('bell')} ${t('monitoring')}</button>
        <button class="monitor-btn" onclick="App.showQR('${address}')">📱 ${t('qrView')}</button>
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
    app.innerHTML = `<div class="error-box">${t('error')}<br><small>${escHtml(e.message)}</small></div>`;
  }
}

async function loadAddrTxs(address, lastTxid) {
  const container = document.getElementById('addr-txs');
  const moreBtn = document.getElementById('addr-txs-more');
  if (!container) return;

  if (!lastTxid) container.innerHTML = skeletonTable(6);

  try {
    const url = lastTxid ? `/address/${address}/txs/chain/${lastTxid}` : `/address/${address}/txs`;
    const txs = await api(url);

    const html = txs.map((tx, i) => {
      const totalOut = tx.vout ? tx.vout.reduce((s, o) => s + (o.value || 0), 0) : 0;
      document.title = `TX ${txid.slice(0,8)}… | txid.uk`;
    const isConfirmed = tx.status && tx.status.confirmed;
      return `<tr class="stagger-item" style="--i:${i}">
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
        moreBtn.innerHTML = `<div class="pagination"><button onclick="loadAddrTxs('${address}', '${lastId}')">${t('next')} →</button></div>`;
      }
    } else {
      moreBtn.innerHTML = '';
    }
  } catch (e) {
    container.innerHTML = `<div class="error-box">${t('error')}</div>`;
  }
}

// ═══════════════════════════════════════════
// UTXO LOADER
// ═══════════════════════════════════════════
async function loadAddrUtxo(address) {
  const container = document.getElementById('tab-utxo');
  if (!container) return;
  container.dataset.loaded = '1';
  container.innerHTML = `<div class="loading">${t('loading')}</div>`;
  try {
    const utxos = await api('/address/' + address + '/utxo');
    const totalBtc = utxos.reduce((s, u) => s + (u.value || 0), 0);
    container.innerHTML = `
      <div class="utxo-sum">${lang==='ko'?'UTXO':lang==='ja'?'UTXO':'UTXO'}: <strong>${formatNum(utxos.length)}</strong> ${lang==='ko'?'개':''} · ${lang==='ko'?'합계':lang==='ja'?'合計':'Total'}: <strong>${satToBtc(totalBtc)} BTC</strong></div>
      <div class="tx-table-wrap">
        <table class="utxo-table">
          <thead><tr><th>TXID</th><th>${lang==='ko'?'블록높이':lang==='ja'?'ブロック高':'Block'}</th><th>BTC</th></tr></thead>
          <tbody>${utxos.map(u => `<tr>
            <td><a href="#/tx/${u.txid}" style="color:var(--blue)">${u.txid.slice(0,12)}…:${u.vout}</a></td>
            <td>${u.status && u.status.confirmed ? formatNum(u.status.block_height) : t('unconfirmed')}</td>
            <td>${satToBtc(u.value)}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>`;
  } catch (e) {
    container.innerHTML = `<div class="error-box">${t('error')}</div>`;
  }
}
window.loadAddrUtxo = loadAddrUtxo;

// ═══════════════════════════════════════════
// MINING PAGE
// ═══════════════════════════════════════════
async function renderMining(app) {
  app.innerHTML = skeletonCards(6);

  try {
    document.title = (lang==='ko'?'채굴 통계':lang==='ja'?'マイニング統計':'Mining Stats') + ' | txid.uk';
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
          <h3>${icon('trending-up')} ${t('hashrate')} (30${lang === 'ko' ? '일' : lang === 'ja' ? '日' : ' days'})</h3>
          <canvas id="hashrate-chart"></canvas>
        </div>
        <div class="mining-card stagger-item" style="--i:5">
          <h3>${icon('target')} ${t('diffAdj')}</h3>
          <div style="margin-bottom:8px;font-size:.75rem;color:var(--text2)">
            ${t('progress')}: ${diffProgress.toFixed(1)}% (${diffAdj.remainingBlocks || '?'} ${lang === 'ko' ? '블록 남음' : lang === 'ja' ? 'ブロック残り' : 'blocks left'})
          </div>
          <div class="diff-bar-wrap">
            <div class="diff-bar" style="width:${diffProgress}%"></div>
            <div class="diff-bar-text">${diffProgress.toFixed(1)}%</div>
          </div>
          <div style="margin-top:8px;font-size:.75rem;color:var(--text2)">
            ${t('estimatedAdj')}: <span style="color:${estChange >= 0 ? 'var(--green)' : 'var(--red)'}">${estChange >= 0 ? '+' : ''}${estChange.toFixed(2)}%</span>
          </div>
          <div style="margin-top:4px;font-size:.68rem;color:var(--text3)">
            ${lang === 'ko' ? '예상 시간' : lang === 'ja' ? '推定時間' : 'Estimated'}: ${diffAdj.estimatedRetargetDate ? new Date(diffAdj.estimatedRetargetDate).toLocaleDateString() : '?'}
          </div>
        </div>
      </div>

      <div class="mining-card stagger-item" style="--i:6;margin-bottom:20px">
        <h3>${icon('trophy')} ${t('topMiners')} (${t('blocks144')})</h3>
        <table class="miners-table">
          <thead><tr><th>${t('miner')}</th><th>${lang === 'ko' ? '블록' : lang === 'ja' ? 'ブロック' : 'Blocks'}</th><th>%</th><th></th></tr></thead>
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
    poolCard.innerHTML = `<h3>${icon('bar-chart')} ${lang==='ko'?'풀 점유율':lang==='ja'?'プールシェア':'Pool Share'} (${t('blocks144')})</h3><canvas id="pool-chart" style="width:100%;height:220px;display:block"></canvas>`;
    app.appendChild(poolCard);
    setTimeout(() => renderPoolChart(topMiners, recentBlocks.length), 200);
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

function renderPoolChart(miners, total) {
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
window.renderPoolChart = renderPoolChart;

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
    { label: lang === 'ko' ? '직접 입력' : lang === 'ja' ? 'カスタム' : 'Custom', vb: 0 },
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
  const timeUnit = lang === "ko" ? "분" : lang === "ja" ? "分" : "min";
  const hourUnit = lang === "ko" ? "시간+" : lang === "ja" ? "時間+" : "h+";
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

// ═══════════════════════════════════════════
// QR CODE
// ═══════════════════════════════════════════
function showQRModal(address) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'qr-modal';
  modal.onclick = function(e) { if (e.target === this) this.remove(); };
  modal.innerHTML = `<div class="modal">
    <button class="modal-close" onclick="document.getElementById('qr-modal').remove()">✕</button>
    <div class="qr-modal-content">
      <h2>📱 ${t('qrView')}</h2>
      <div id="qr-code"></div>
      <div class="qr-addr-text">${escHtml(address)}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText('${escHtml(address)}').then(()=>{this.textContent='${t('copied')}'});setTimeout(()=>{this.textContent='${t('copy')}'},1500)">${t('copy')}</button>
    </div>
  </div>`;
  document.body.appendChild(modal);

  // Generate QR using qrcode-generator
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
        <span>${lang==='ko'?'단위 변환기':lang==='ja'?'単位換算':'Unit Converter'}</span>
        <button class="modal-close" onclick="document.getElementById('converter-modal')?.remove()">✕</button>
      </div>
      <div class="converter-rows" id="conv-rows">
        ${['BTC','Sat','KRW','USD'].map(u => `
        <div class="conv-row">
          <label class="conv-label">${u}</label>
          <input class="conv-input" id="conv-${u.toLowerCase()}" type="number" min="0" placeholder="0" />
        </div>`).join('')}
      </div>
      ${!krw && !usd ? '<p style="font-size:.7rem;color:var(--text3);margin-top:8px">※ ' + (lang==='ko'?'가격 데이터 로딩 중...':'Loading price data...') + '</p>' : ''}
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
window.openConverter = openConverter;

// ═══════════════════════════════════════════
// APP (글로벌)
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
    lang = newLang;
    const btn = document.getElementById("lang-btn");
    if (btn) btn.textContent = { ko: "KO", en: "EN", ja: "日" }[lang] || "KO";
    document.documentElement.lang = lang;
    document.getElementById('search-input').placeholder = t('search_ph');
    document.getElementById('tagline').textContent = t('tagline');
    document.querySelectorAll('[data-ko]').forEach(el => {
      const val = el.dataset[lang] || el.dataset.en || el.dataset.ko;
      el.textContent = val;
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
      showToast("🔍 " + t("search"), t("notFound"), null, 3000);
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
      case 'hex64':
        const app = document.getElementById('app');
        app.innerHTML = `<div class="loading">${t('loading')}</div>`;
        const resolved = await resolveHex64(detected.val);
        if (resolved === 'block') { addSearchHistory(q, 'block'); navigate('#/block/' + detected.val); }
        else if (resolved === 'tx') { addSearchHistory(q, 'tx'); navigate('#/tx/' + detected.val); }
        else { app.innerHTML = `<div class="error-box">${t('notFound')}</div>`; }
        break;
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

// 테마 초기화
function updateThemeBtn() {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  btn.innerHTML = isDark
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2" x2="12" y2="5"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
        <line x1="2" y1="12" x2="5" y2="12"/>
        <line x1="19" y1="12" x2="22" y2="12"/>
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
      </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>`;
  const themeLabels = {
    ko: isDark ? '라이트 모드로 전환' : '다크 모드로 전환',
    en: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
    ja: isDark ? 'ライトモードへ' : 'ダークモードへ',
  };
  btn.title = themeLabels[lang] || themeLabels.en;
}
(function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn();
  // 언어 버튼 초기값 동기화
  const lbtn = document.getElementById('lang-btn');
  if (lbtn) lbtn.textContent = { ko: 'KO', en: 'EN', ja: '日' }[lang] || 'KO';
})();

// Enter 키 검색
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') App.doSearch(false);
});
document.getElementById('search-input').addEventListener('focus', () => {
  if (!document.getElementById('search-input').value) showSearchHistory();
});
document.getElementById('search-input').addEventListener('input', e => {
  if (!e.target.value) showSearchHistory();
  else document.getElementById('search-history-drop')?.remove();
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

// "/" 키로 검색 포커스
document.addEventListener('keydown', e => {
  if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    document.getElementById('search-input').focus();
  }
  if (e.key === 'Escape') {
    document.getElementById('search-input').blur();
    App.closeMobileSearch();
    const feeModal = document.getElementById('fee-calc-modal');
    if (feeModal) feeModal.remove();
    const qrModal = document.getElementById('qr-modal');
    if (qrModal) qrModal.remove();
    const convModal = document.getElementById('converter-modal');
    if (convModal) convModal.remove();
  }
});

// 글로벌 함수
window.loadBlockTxs = loadBlockTxs;
window.loadAddrTxs = loadAddrTxs;
window.renderFeeHistogram = renderFeeHistogram;
window.toggleFavorite = toggleFavorite;
window.removeFavorite = removeFavorite;
window.toggleMonitor = toggleMonitor;
window.updateFeeCalc = updateFeeCalc;





// ── 주소 잔액 히스토리 ──
async function loadAddressBalanceChart(address) {
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
  } catch {}
}
window.loadAddressBalanceChart = loadAddressBalanceChart;

// ── 멤풀 수수료 히트맵 ──
async function loadMempoolHeatmap() {
  const canvas = document.getElementById('mempool-heatmap');
  if (!canvas) return;
  try {
    // mempool-blocks 데이터 활용
    const blocks = await api('/v1/fees/mempool-blocks');
    if (!blocks?.length) return;
    drawFeeHeatmap(canvas, blocks);
  } catch {}
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
window.loadMempoolHeatmap = loadMempoolHeatmap;

// ── 블록 Treemap ──
async function openBlockTreemap(blockId, height) {
  document.getElementById('treemap-modal')?.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'treemap-modal';
  modal.innerHTML = `<div class="modal-box" style="max-width:620px;width:95vw">
    <div class="modal-header">
      <span>Block #${height} Treemap</span>
      <button class="modal-close" onclick="document.getElementById('treemap-modal')?.remove()">✕</button>
    </div>
    <div style="font-size:.68rem;color:var(--text3);margin-bottom:8px">${lang==='ko'?'크기 = 가상 크기 (vsize), 색 = 수수료율':'Size = vsize, Color = fee rate'}</div>
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
window.openBlockTreemap = openBlockTreemap;

// ── TX 플로우 다이어그램 ──
function renderTxFlowDiagram(tx) {
  const container = document.getElementById('tx-flow-diagram');
  if (!container) return;
  const ins = (tx.vin || []).slice(0, 5);
  const outs = (tx.vout || []).slice(0, 5);
  const moreIn = (tx.vin||[]).length > 5 ? `<div class="tfd-more">+${tx.vin.length-5}개 더</div>` : '';
  const moreOut = (tx.vout||[]).length > 5 ? `<div class="tfd-more">+${tx.vout.length-5}개 더</div>` : '';

  const inItems = ins.map((v,i) => {
    const val = v.prevout?.value != null ? formatBtc(v.prevout.value)+' BTC' : 'coinbase';
    const addr = v.prevout?.scriptpubkey_address ? v.prevout.scriptpubkey_address.slice(0,14)+'…' : '—';
    return `<div class="tfd-node tfd-in" style="--i:${i}">${escHtml(addr)}<span>${val}</span></div>`;
  }).join('') + moreIn;

  const outItems = outs.map((v,i) => {
    const val = formatBtc(v.value)+' BTC';
    const addr = v.scriptpubkey_address ? v.scriptpubkey_address.slice(0,14)+'…' : (v.scriptpubkey_type||'—');
    return `<div class="tfd-node tfd-out" style="--i:${i}">${escHtml(addr)}<span>${val}</span></div>`;
  }).join('') + moreOut;

  container.innerHTML = `<div class="tfd-col">${inItems}</div><div class="tfd-arrow">→</div><div class="tfd-col">${outItems}</div>`;
}
window.renderTxFlowDiagram = renderTxFlowDiagram;

// ── 키보드 단축키 도움말 ──
function showShortcuts() {
  document.getElementById('shortcuts-modal')?.remove();
  const kbShortcuts = [
    ['/', lang==='ko'?'검색 포커스':'Focus search'],
    ['Esc', lang==='ko'?'모달 닫기':'Close modal'],
    ['?', lang==='ko'?'이 도움말':lang==='ja'?'ショートカット':'This help'],
  ];
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'shortcuts-modal';
  modal.innerHTML = `<div class="modal-box" style="max-width:340px">
    <div class="modal-header">
      <span>${lang==='ko'?'키보드 단축키':lang==='ja'?'キーボードショートカット':'Keyboard Shortcuts'}</span>
      <button class="modal-close" onclick="document.getElementById('shortcuts-modal')?.remove()">✕</button>
    </div>
    <div class="shortcuts-list">
      ${kbShortcuts.map(([k,d]) => `<div class="shortcut-row"><kbd class="shortcut-key">${k}</kbd><span class="shortcut-desc">${d}</span></div>`).join('')}
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}
window.showShortcuts = showShortcuts;

// ── 404 페이지 ──
function renderNotFound(app, msg) {
  app.innerHTML = `
    <div class="not-found-page">
      <div class="nf-code">404</div>
      <div class="nf-msg">${msg || (lang==='ko'?'페이지를 찾을 수 없습니다':'Page not found')}</div>
      <a href="#/" class="btn-primary" style="margin-top:20px;display:inline-block">${lang==='ko'?'홈으로':lang==='ja'?'ホームへ':'Go Home'}</a>
    </div>`;
}
window.renderNotFound = renderNotFound;

// ── 오프라인 감지 ──
function checkOnline() {
  const offline = !navigator.onLine;
  let bar = document.getElementById('offline-bar');
  if (offline) {
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'offline-bar';
      bar.textContent = lang==='ko'?'오프라인 — 데이터가 최신이 아닐 수 있습니다':lang==='ja'?'オフライン':'Offline — data may be stale';
      document.body.appendChild(bar);
    }
  } else { bar?.remove(); }
}
window.addEventListener('online', checkOnline);
window.addEventListener('offline', checkOnline);

// 시스템 다크모드 변경 감지
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('theme')) {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    if (typeof updateThemeBtn === 'function') updateThemeBtn();
  }
});
