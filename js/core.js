// ══════════════════════════════════════════════
// core.js — txid.uk shared core module
// ══════════════════════════════════════════════

// ── AbortSignal.timeout() 폴리필 ──────────────────
if (!AbortSignal.timeout) {
  AbortSignal.timeout = (ms) => {
    const c = new AbortController();
    setTimeout(() => c.abort(new DOMException('TimeoutError', 'TimeoutError')), ms);
    return c.signal;
  };
}

// ── 상단 진행 바 ──────────────────
export const NProgress = (() => {
  let bar, timer, val = 0, running = false;
  function getBar() {
    if (!bar) {
      const el = document.createElement('div');
      el.id = 'nprogress';
      el.innerHTML = '<div class="bar"><div class="peg"></div></div>';
      document.body.appendChild(el);
      bar = el.querySelector('.bar');
    }
    return bar;
  }
  function set(n) {
    val = Math.min(n, 0.994);
    getBar().style.cssText = `width:${val*100}%;opacity:1;transition:width 200ms linear`;
  }
  function start() {
    if (running) return;
    running = true; val = 0.1; set(val);
    timer = setInterval(() => { set(val + (0.9 - val) * 0.12); }, 200);
  }
  function done() {
    clearInterval(timer); running = false;
    getBar().style.cssText = 'width:100%;opacity:1;transition:width 100ms linear';
    setTimeout(() => { if (bar) bar.style.cssText = 'width:100%;opacity:0;transition:opacity 300ms'; }, 150);
    setTimeout(() => { if (bar) bar.style.cssText = 'width:0;opacity:0'; }, 500);
  }
  return { start, done };
})();

// ── 외부 라이브러리 동적 로더 ──────────────────
const _loadedScripts = {};
export const CDN_SRI = {
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js': 'sha384-mZT2gIty7ZDdOGkxfP6joZcYdMW1Jvj9dRlfpTmaJAKKXTqzygtB22k7FLe+KZC1',
  'https://unpkg.com/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js': 'sha384-OK7vELvjHdhUFi31JYioPIcRHTROLdcDa6ZsNWgvgLaKj+9JqhU0Ad8g4wz3CXjA',
  'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js': 'sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i',
};
export function loadScript(url) {
  if (_loadedScripts[url]) return _loadedScripts[url];
  _loadedScripts[url] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url; s.async = true;
    if (CDN_SRI[url]) {
      s.integrity = CDN_SRI[url];
      s.crossOrigin = 'anonymous';
    }
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
  return _loadedScripts[url];
}
export const CDN_QRCODE = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
export const CDN_CHARTS = 'https://unpkg.com/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js';
export const CDN_D3 = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';

// ── SVG 아이콘 인라인 헬퍼 ──────────────────
export const ICONS = {
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
export function icon(name, cls='') {
  const d = ICONS[name];
  if (!d) return '';
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
}

// ── API 상수 ──
export const API = 'https://mempool.space/api';

// ── 다국어 ──
export const i18n = {
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
    learnMore: '더 알아보기',
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
    learnMore: 'もっと学ぶ',
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
    learnMore: 'Learn More',
  }
};

// ── 공유 상태 (mutable) ──
export const state = { lang: localStorage.getItem('lang') || 'ko' };

export function t(key) { return (i18n[state.lang] && i18n[state.lang][key]) || key; }

// ── learn.txid.uk 교육 링크 ──
export const LEARN_LINKS = {
  home: [
    { slug: 'what-is-mempool', ko: '멤풀이란 무엇인가', en: 'What is the Mempool?', ja: 'メンプールとは' },
    { slug: 'bitcoin-fee-guide', ko: '수수료 가이드', en: 'Fee Guide', ja: '手数料ガイド' },
  ],
  tx: [
    { slug: 'what-is-txid', ko: 'TXID란 무엇인가', en: 'What is a TXID?', ja: 'TXIDとは' },
    { slug: 'how-to-read-bitcoin-transaction', ko: '트랜잭션 읽는 법', en: 'Reading Transactions', ja: 'トランザクションの読み方' },
  ],
  block: [
    { slug: 'proof-of-work', ko: '작업증명이란', en: 'Proof of Work', ja: 'プルーフ・オブ・ワーク' },
    { slug: 'bitcoin-mining', ko: '비트코인 채굴', en: 'Bitcoin Mining', ja: 'マイニング' },
  ],
  address: [
    { slug: 'bitcoin-wallet-address', ko: '지갑 주소란', en: 'Wallet Addresses', ja: 'ウォレットアドレス' },
    { slug: 'utxo-model', ko: 'UTXO 모델', en: 'UTXO Model', ja: 'UTXOモデル' },
  ],
};
export function learnLinksHtml(context) {
  const links = LEARN_LINKS[context];
  if (!links || !links.length) return '';
  const chips = links.map(l =>
    `<a href="https://learn.txid.uk/${state.lang}/blog/${l.slug}/" class="learn-chip" target="_blank" rel="noopener">${l[state.lang] || l.en}</a>`
  ).join('');
  return `<div class="learn-links"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><span class="learn-label">${t('learnMore')}</span>${chips}</div>`;
}

// ── 유틸 ──
export function satToBtc(sat) { return (sat / 1e8).toFixed(8); }
export function btcWithKrw(sat) {
  if (!sat || !window._btcKrw) return formatBtc(sat) + ' BTC';
  const btc = sat / 1e8;
  const krw = btc * window._btcKrw;
  const krwStr = krw >= 1e8 ? (krw/1e8).toFixed(2)+'억' : krw >= 1e4 ? Math.round(krw/1e4)+'만' : Math.round(krw).toLocaleString();
  return formatBtc(sat) + ` BTC <small style="color:var(--text3);font-size:.72em;font-family:var(--font-ko)">≈ ${krwStr}원</small>`;
}

export function formatBtc(sat) { return satToBtc(sat) + ' BTC'; }
export function formatNum(n) { return n == null ? '—' : Number(n).toLocaleString(); }
export function formatBytes(bytes) {
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
  return bytes + ' B';
}
export function timeAgo(ts) {
  const sec = Math.floor(Date.now() / 1000 - ts);
  const sfx = state.lang === 'ko' ? ['초 전','분 전','시간 전','일 전'] :
               state.lang === 'ja' ? ['秒前','分前','時間前','日前'] :
                               ['s ago','m ago','h ago','d ago'];
  if (sec < 60) return sec + sfx[0];
  if (sec < 3600) return Math.floor(sec / 60) + sfx[1];
  if (sec < 86400) return Math.floor(sec / 3600) + sfx[2];
  return Math.floor(sec / 86400) + sfx[3];
}
export function fullDate(ts) { return new Date(ts * 1000).toLocaleString(); }
export function shortHash(h) { return h ? h.slice(0, 8) + '...' + h.slice(-8) : '—'; }
export function shortAddr(a) { return a ? a.slice(0, 10) + '...' + a.slice(-6) : '—'; }
export function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// 수수료 → 색상 레벨
export function feeLevel(sat) {
  if (sat >= 100) return 'extreme';
  if (sat >= 20) return 'high';
  if (sat >= 5) return 'medium';
  if (sat >= 2) return 'low';
  if (sat >= 1) return 'economy';
  if (sat >= 0.5) return 'minimal';
  return 'negligible';
}
export function feeColorHex(sat) {
  if (sat >= 100) return '#ff4444';
  if (sat >= 20) return '#ff8800';
  if (sat >= 5) return '#f7931a';
  if (sat >= 2) return '#ffcc00';
  if (sat >= 1) return '#44bb44';
  if (sat >= 0.5) return '#4488ff';
  return '#445566';
}
export function coloredFeeRate(sat) {
  const level = feeLevel(sat);
  return `<span class="fee-color" data-level="${level}">${Number(sat).toFixed(1)} sat/vB</span>`;
}

// 스켈레톤 생성
export function skeletonCards(n) {
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

export function skeletonTable(rows) {
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

export function skeletonAddrStats(n) {
  let html = '<div class="addr-summary">';
  for (let i = 0; i < n; i++) {
    html += `<div class="skeleton-addr-stat"><div class="skeleton"></div><div class="skeleton"></div></div>`;
  }
  html += '</div>';
  return html;
}

// ── API 호출 ──
export async function api(path, _retry = 1) {
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
export function showToast(title, body, onClick, duration = 8000) {
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
export function getFavorites() {
  try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
}
export function saveFavorites(favs) { localStorage.setItem('favorites', JSON.stringify(favs)); }
export function isFavorite(type, value) { return getFavorites().some(f => f.type === type && f.value === value); }
export function toggleFavorite(type, value, label) {
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
export function removeFavorite(type, value) {
  let favs = getFavorites();
  saveFavorites(favs.filter(f => !(f.type === type && f.value === value)));
}
export function favButton(type, value, label) {
  const active = isFavorite(type, value);
  return `<button class="fav-btn ${active ? 'active' : ''}" data-type="${type}" data-value="${escHtml(value)}" onclick="event.stopPropagation();toggleFavorite('${type}','${escHtml(value)}','${escHtml(label)}')">${active ? '★' : '☆'}</button>`;
}
export function renderFavoritesSection() {
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
export function getMonitoredAddrs() {
  try { return JSON.parse(localStorage.getItem('monitored_addrs') || '{}'); } catch { return {}; }
}
export function saveMonitoredAddrs(m) {
  localStorage.setItem('monitored_addrs', JSON.stringify(m));
  updateMonitorBadge();
}
export function toggleMonitor(address) {
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
export function updateMonitorBadge() {
  const badge = document.getElementById('monitor-badge');
  if (!badge) return;
  const count = Object.keys(getMonitoredAddrs()).length;
  badge.textContent = count;
  badge.style.display = count > 0 ? '' : 'none';
}

export async function checkMonitoredAddresses() {
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
          t('newTx'),
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

// ── 검색 ──
export function detectSearchType(q) {
  q = q.trim();
  if (!q) return null;
  if (/^\d+$/.test(q)) return { type: 'height', val: q };
  if (/^[0-9a-fA-F]{64}$/.test(q)) return { type: 'hex64', val: q };
  if (/^(1|3|bc1|tb1|2|m|n)/.test(q)) return { type: 'address', val: q };
  return null;
}

export async function resolveHex64(hex) {
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
export function breadcrumb(items) {
  return `<div class="breadcrumb">${items.map((item, i) => {
    if (i < items.length - 1) {
      return `<a href="${item.href}">${item.label}</a><span class="bc-sep">›</span>`;
    }
    return `<span>${item.label}</span>`;
  }).join('')}</div>`;
}

// ── 클립보드 복사 ──
export function copyToClip(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓';
      btn.style.color = 'var(--green)';
      setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1500);
    }
    showToast('📋', state.lang==='ko'?'복사됨!':state.lang==='ja'?'コピー済み':'Copied!', null, 1500);
  }).catch(() => {
    // 폴백
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    if (btn) { const o=btn.textContent; btn.textContent='✓'; setTimeout(()=>btn.textContent=o, 1500); }
  });
}

// ── 공유 ──
export function shareUrl(url) {
  if (navigator.share) {
    navigator.share({ title: 'txid.uk', url }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast('🔗', state.lang==='ko'?'링크 복사됨!':state.lang==='ja'?'リンクをコピー':'Link copied!', null, 2000);
    });
  }
}

// ── 주소 라벨 ──
export function getAddrLabel(addr) {
  try { return JSON.parse(localStorage.getItem('addr_labels')||'{}')[addr] || ''; } catch { return ''; }
}
export function setAddrLabel(addr, label) {
  try {
    const m = JSON.parse(localStorage.getItem('addr_labels')||'{}');
    if (label) m[addr] = label; else delete m[addr];
    localStorage.setItem('addr_labels', JSON.stringify(m));
  } catch {}
}
export function promptAddrLabel(addr) {
  const cur = getAddrLabel(addr);
  const v = prompt(state.lang==='ko'?`"${addr.slice(0,12)}…" 메모 (비우면 삭제)`:`Label for "${addr.slice(0,12)}…" (empty to remove)`, cur);
  if (v === null) return;
  setAddrLabel(addr, v.trim());
  showToast('📝', v.trim()?(state.lang==='ko'?'메모 저장됨':'Saved'):(state.lang==='ko'?'메모 삭제됨':'Removed'), null, 2000);
  const el = document.getElementById('addr-label-display');
  if (el) { el.textContent = v.trim(); el.style.display = v.trim() ? '' : 'none'; }
}

// ── 404 페이지 ──
export function renderNotFound(app, msg) {
  app.innerHTML = `
    <div class="not-found-page">
      <div class="nf-code">404</div>
      <div class="nf-msg">${msg || (state.lang==='ko'?'페이지를 찾을 수 없습니다':'Page not found')}</div>
      <a href="#/" class="btn-primary" style="margin-top:20px;display:inline-block">${state.lang==='ko'?'홈으로':state.lang==='ja'?'ホームへ':'Go Home'}</a>
    </div>`;
}

// ── 6. 고래 TX 감지 ──
export function highlightWhaleTx(tx) {
  const totalOut = (tx.vout||[]).reduce((s,o) => s+(o.value||0), 0);
  const btc = totalOut / 1e8;
  if (btc >= 10) return 'whale-tx-mega';
  if (btc >= 1) return 'whale-tx';
  return '';
}

// ── 검색 입력 검증 ──
export function validateSearchInput(q) {
  if (!q) return false;
  if (/^\d{1,7}$/.test(q)) return true;
  if (/^[0-9a-fA-F]{64}$/.test(q)) return true;
  if (/^(bc1|1|3)[a-zA-Z0-9]{25,62}$/.test(q)) return true;
  return false;
}

// ── 오프라인 감지 ──
export function checkOnline() {
  const offline = !navigator.onLine;
  let bar = document.getElementById('offline-bar');
  if (offline) {
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'offline-bar';
      bar.textContent = state.lang==='ko'?'오프라인 — 데이터가 최신이 아닐 수 있습니다':state.lang==='ja'?'オフライン':'Offline — data may be stale';
      document.body.appendChild(bar);
    }
  } else { bar?.remove(); }
}

// ── 서브사이트 딥링크 ──
export function openViz(type, id) {
  window.open(`https://viz.txid.uk/?${type}=${encodeURIComponent(id)}`, '_blank');
}
export function openPortfolioAdd(addr) {
  window.open(`https://portfolio.txid.uk/?add=${encodeURIComponent(addr)}`, '_blank');
}
export function openTxLookup(txid) {
  window.open(`https://tx.txid.uk/?lookup=${encodeURIComponent(txid)}`, '_blank');
}
