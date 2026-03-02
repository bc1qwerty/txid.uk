/* ═══════════════════════════════════════════
   txid.uk — Mempool Canvas Visualization
   실시간 WebSocket (mempool.space/api/v1/ws)
   상단: 확인된 블록 6개 (실제 데이터)
   하단: 멤풀 대기 블록 + 실시간 TX 파티클
   ═══════════════════════════════════════════ */

const MempoolViz = (() => {
  let canvas, ctx;
  let animId = null;
  let ws = null;
  let wsReconnectTimer = null;

  // 실제 데이터
  let confirmedData = [];   // 확인된 블록
  let mempoolProjected = []; // 프로젝티드 멤풀 블록
  let mempoolBlocks = [];   // 하단 애니메이션 상태
  let particles = [];

  let initialized = false;
  let initRetries = 0;
  let resizeObserver = null;

  const CONFIRMED_COUNT = 6;
  const MEMPOOL_COLS = 3;
  const PX = 3;

  // ── 수수료 → 색상 (mempool.space 기준) ──
  function feeColor(sat) {
    if (sat >= 100) return '#ff4444';
    if (sat >= 20)  return '#ff8800';
    if (sat >= 5)   return '#f7931a';
    if (sat >= 2)   return '#ffcc00';
    if (sat >= 1)   return '#44bb44';
    if (sat >= 0.5) return '#4488ff';
    return '#445566';
  }

  function timeAgo(ts) {
    const sec = Math.floor(Date.now() / 1000 - ts);
    if (sec < 60) return sec + '초 전';
    if (sec < 3600) return Math.floor(sec / 60) + '분 전';
    return Math.floor(sec / 3600) + '시간 전';
  }

  // ── WebSocket 연결 ────────────────────────
  function connectWS() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    clearTimeout(wsReconnectTimer);

    try {
      ws = new WebSocket('wss://mempool.space/api/v1/ws');
    } catch(e) {
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      // 초기화 + 구독
      ws.send(JSON.stringify({ action: 'init' }));
      ws.send(JSON.stringify({
        action: 'want',
        data: ['blocks', 'mempool-blocks', 'stats', 'live-2h-chart']
      }));
    };

    ws.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      // 새 블록 확인
      if (msg.block) {
        handleNewBlock(msg.block);
      }

      // 멤풀 프로젝티드 블록 업데이트
      if (msg['mempool-blocks']) {
        handleMempoolBlocks(msg['mempool-blocks']);
      }

      // 새 unconfirmed TX (실시간 파티클)
      if (msg.transactions && Array.isArray(msg.transactions)) {
        msg.transactions.forEach(tx => {
          spawnTxParticle(tx);
        });
      }

      // 초기 블록 데이터
      if (msg.blocks && Array.isArray(msg.blocks)) {
        msg.blocks.slice(0, CONFIRMED_COUNT).forEach((b, i) => {
          if (!confirmedData[i]) updateConfirmedBlock(b, i);
        });
      }
    };

    ws.onclose = () => { scheduleReconnect(); };
    ws.onerror = () => { ws.close(); };
  }

  function scheduleReconnect() {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = setTimeout(connectWS, 5000);
  }

  // ── 새 블록 처리 ─────────────────────────
  function handleNewBlock(block) {
    // 확인된 블록 맨 앞에 삽입, 6개 유지
    const cd = blockToConfirmedData(block);
    confirmedData.unshift(cd);
    if (confirmedData.length > CONFIRMED_COUNT) confirmedData.pop();

    // 멤풀 첫 블록 → 확인됨으로 전환 시 파티클 플래시
    if (mempoolBlocks[0]) {
      mempoolBlocks[0].txs = [];
    }
  }

  // ── 멤풀 프로젝티드 블록 처리 ────────────
  function handleMempoolBlocks(projected) {
    mempoolProjected = projected;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas ? canvas.width / dpr : 0;
    const H = canvas ? canvas.height / dpr : 0;
    const dims = getMempoolDims(W, H);

    for (let i = 0; i < Math.min(projected.length, MEMPOOL_COLS); i++) {
      const pd = projected[i];
      if (!mempoolBlocks[i]) continue;
      mempoolBlocks[i].medianFee = pd.medianFee;
      mempoolBlocks[i].feeRange = pd.feeRange;
      // 채움률만 업데이트 (기존 파티클로 채운 TX는 유지)
      const fillRatio = Math.min((pd.blockVSize || 0) / 1_000_000, 1);
      const targetTx = Math.round(mempoolBlocks[i].maxTx * fillRatio);
      // 현재보다 적으면 자름, 많으면 채우기
      if (mempoolBlocks[i].txs.length > targetTx) {
        mempoolBlocks[i].txs = mempoolBlocks[i].txs.slice(0, targetTx);
      } else {
        while (mempoolBlocks[i].txs.length < targetTx) {
          mempoolBlocks[i].txs.push(feeColor(randomFeeFromRange(pd.feeRange)));
        }
      }
    }
  }

  function randomFeeFromRange(feeRange) {
    if (feeRange && feeRange.length >= 2) {
      const idx = Math.floor(Math.random() * (feeRange.length - 1));
      return feeRange[idx] + Math.random() * (feeRange[idx+1] - feeRange[idx]);
    }
    return 1 + Math.random() * 4;
  }

  // ── 실시간 TX 파티클 생성 ─────────────────
  function spawnTxParticle(tx) {
    if (!canvas || !mempoolBlocks[0]) return;
    // fee rate 계산
    const feeRate = tx.fee && tx.weight ? (tx.fee / (tx.weight / 4)) : null;
    const color = feeColor(feeRate || randomFeeFromRange(mempoolProjected[0] ? mempoolProjected[0].feeRange : null));

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const dims = getMempoolDims(W, H);

    const p = {
      // 왼쪽 바깥 또는 위에서 시작
      x: Math.random() < 0.7 ? -10 - Math.random() * 60 : dims.x0 + Math.random() * dims.bw,
      y: Math.random() < 0.7 ? dims.y + Math.random() * dims.bh : dims.topH + 2,
      // NEXT 블록 내 랜덤 위치로
      tx: dims.x0 + Math.random() * dims.bw,
      ty: dims.y + Math.random() * dims.bh,
      color,
      feeRate,
      speed: 1.5 + Math.random() * 2,
      alive: true,
      size: 2.5,
    };
    if (particles.length < 80) particles.push(p);
  }

  // ── 레이아웃 계산 헬퍼 ────────────────────
  function getTopH(H) { return Math.floor(H * 0.52); }

  function getMempoolDims(W, H) {
    const topH = getTopH(H);
    const PAD = 10, GAP = 12;
    const bw = Math.floor((W - PAD * 2 - GAP * (MEMPOOL_COLS - 1)) / MEMPOOL_COLS);
    const LABEL_TOP = topH + 16;
    const LABEL_BOT = 18;
    const bh = (H - topH) - (LABEL_TOP - topH) - LABEL_BOT - 4;
    return { topH, bw, bh, y: LABEL_TOP, x0: PAD, PAD, GAP };
  }

  // ── 블록 데이터 변환 ──────────────────────
  function blockToConfirmedData(block) {
    const extras = block.extras || {};
    const feeRange = extras.feeRange || null;
    const vsize = extras.virtualSize || block.size || 900000;
    const fillRatio = Math.min(vsize / 1_000_000, 1);

    // 픽셀 배열 계산
    const pixels = buildPixels(fillRatio, extras.feePercentiles || feeRange);

    return {
      height: block.height,
      txCount: block.tx_count || 0,
      miner: extras.pool ? extras.pool.name : null,
      medianFee: extras.medianFee || extras.avgFeeRate || null,
      timestamp: block.timestamp || null,
      fillRatio,
      pixels,
    };
  }

  function buildPixels(fillRatio, feeRange) {
    if (!canvas) return [];
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const topH = getTopH(H);
    const PAD = 10, GAP = 8;
    const bw = Math.floor((W - PAD * 2 - GAP * (CONFIRMED_COUNT - 1)) / CONFIRMED_COUNT);
    const bh = topH - 14 - 20 - 4;
    const maxPx = Math.floor(bw / PX) * Math.floor(bh / PX);
    const count = Math.round(maxPx * Math.min(fillRatio, 1));
    const pixels = [];
    for (let j = 0; j < count; j++) {
      pixels.push(feeColor(randomFeeFromRange(feeRange)));
    }
    return pixels;
  }

  function updateConfirmedBlock(block, idx) {
    confirmedData[idx] = blockToConfirmedData(block);
  }

  // ── 상단: 확인된 블록 렌더 ───────────────
  function drawConfirmedSection(W, topH) {
    const PAD = 10, GAP = 8;
    const bw = Math.floor((W - PAD * 2 - GAP * (CONFIRMED_COUNT - 1)) / CONFIRMED_COUNT);
    const LABEL_TOP = 14;
    const LABEL_BOT = 20;
    const bh = topH - LABEL_TOP - LABEL_BOT - 4;

    for (let i = 0; i < CONFIRMED_COUNT; i++) {
      const x = PAD + i * (bw + GAP);
      const y = LABEL_TOP;
      const d = confirmedData[i] || null;

      // 배경
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(x, y, bw, bh);

      // 픽셀
      if (d && d.pixels && d.pixels.length) {
        const cols = Math.floor(bw / PX);
        const rows = Math.floor(bh / PX);
        let pi = 0;
        for (let r = rows - 1; r >= 0 && pi < d.pixels.length; r--) {
          for (let c = 0; c < cols && pi < d.pixels.length; c++, pi++) {
            ctx.fillStyle = d.pixels[pi];
            ctx.globalAlpha = 0.65;
            ctx.fillRect(x + c * PX, y + r * PX, PX - 1, PX - 1);
          }
        }
        ctx.globalAlpha = 1;
      } else {
        // 로딩
        ctx.fillStyle = '#1a2030';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(x, y, bw, bh);
        ctx.globalAlpha = 1;
      }

      // 테두리
      ctx.strokeStyle = '#21262d';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, bw, bh);

      // 높이
      ctx.font = 'bold 9px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = d ? '#f7931a' : '#333';
      ctx.fillText(d ? '#' + d.height.toLocaleString() : '···', x + bw / 2, 10);

      // 하단: TX수, 채굴자, 경과시간
      if (d) {
        const botY = y + bh + 11;
        ctx.font = '7.5px "Space Mono", monospace';
        ctx.fillStyle = '#6e7681';
        ctx.fillText(d.txCount.toLocaleString() + ' TX', x + bw / 2, botY);
        if (d.miner) {
          ctx.fillStyle = '#3a4455';
          ctx.font = '7px "Space Mono", monospace';
          const mn = d.miner.length > 9 ? d.miner.slice(0, 9) + '…' : d.miner;
          ctx.fillText(mn, x + bw / 2, botY + 8);
        }
        if (d.timestamp) {
          ctx.fillStyle = '#2a3040';
          ctx.font = '6.5px "Space Mono", monospace';
          ctx.fillText(timeAgo(d.timestamp), x + bw / 2, botY + 16);
        }
      }
    }

    // 섹션 구분선 + 레이블
    ctx.strokeStyle = '#1e2530';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, topH); ctx.lineTo(W, topH); ctx.stroke();

    ctx.font = '7px "Space Mono", monospace';
    ctx.fillStyle = '#2a3545';
    ctx.textAlign = 'left';
    ctx.fillText('CONFIRMED BLOCKS', 10, topH - 3);

    // WS 연결 상태
    const wsOk = ws && ws.readyState === WebSocket.OPEN;
    ctx.textAlign = 'right';
    ctx.fillStyle = wsOk ? '#1a4a2a' : '#4a1a1a';
    ctx.fillText(wsOk ? '● LIVE' : '○ CONNECTING…', W - 10, topH - 3);
  }

  // ── 하단: 멤풀 애니메이션 ─────────────────
  function drawMempoolSection(W, topH, H) {
    const dims = getMempoolDims(W, H);
    const { bw, bh, y, x0, GAP } = dims;

    ctx.font = '7px "Space Mono", monospace';
    ctx.fillStyle = '#2a3545';
    ctx.textAlign = 'left';
    ctx.fillText('MEMPOOL (UNCONFIRMED)', 10, topH + 10);

    for (let i = 0; i < MEMPOOL_COLS; i++) {
      const x = x0 + i * (bw + GAP);
      const mb = mempoolBlocks[i];

      // 배경
      ctx.fillStyle = '#080c12';
      ctx.fillRect(x, y, bw, bh);

      // 픽셀
      if (mb && mb.txs.length) {
        const cols = Math.floor(bw / PX);
        const rows = Math.floor(bh / PX);
        let pi = 0;
        for (let r = rows - 1; r >= 0 && pi < mb.txs.length; r--) {
          for (let c = 0; c < cols && pi < mb.txs.length; c++, pi++) {
            ctx.fillStyle = mb.txs[pi];
            ctx.globalAlpha = i === 0 ? 0.85 : Math.max(0.25, 0.65 - i * 0.2);
            ctx.fillRect(x + c * PX, y + r * PX, PX - 1, PX - 1);
          }
        }
        ctx.globalAlpha = 1;
      }

      // 테두리
      if (i === 0) {
        ctx.save();
        ctx.shadowColor = '#f7931a';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#f7931a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, bw, bh);
        ctx.restore();
      } else {
        ctx.strokeStyle = `rgba(247,147,26,${0.35 - i * 0.08})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, bw, bh);
      }

      // 상단 라벨
      ctx.font = 'bold 9px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = i === 0 ? '#f7931a' : '#445';
      ctx.fillText(i === 0 ? 'NEXT' : '+' + (i + 1), x + bw / 2, y - 4);

      // 하단: 채움률 + 수수료
      if (mb) {
        const pct = Math.round((mb.txs.length / mb.maxTx) * 100);
        const botY = y + bh + 11;
        ctx.font = '8px "Space Mono", monospace';
        ctx.fillStyle = i === 0 ? (pct >= 99 ? '#ff8800' : '#f7931a') : '#334';
        ctx.fillText(pct >= 99 ? 'FULL' : pct + '%', x + bw / 2, botY);
        if (mb.medianFee) {
          ctx.font = '7px "Space Mono", monospace';
          ctx.fillStyle = '#2a3040';
          ctx.fillText('~' + Math.round(mb.medianFee) + ' sat/vB', x + bw / 2, botY + 9);
        }
      }
    }

    // 파티클
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x - 1, p.y - 1, p.size, p.size);
      ctx.restore();
    });
  }

  // ── 메인 루프 ────────────────────────────
  function animate() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const topH = getTopH(H);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    drawConfirmedSection(W, topH);
    drawMempoolSection(W, topH, H);

    // 파티클 업데이트
    const dims = getMempoolDims(W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 3) {
        // 도착 → NEXT 블록에 추가
        const mb = mempoolBlocks[0];
        if (mb && mb.txs.length < mb.maxTx) mb.txs.push(p.color);
        particles.splice(i, 1);
      } else {
        p.x += (dx / d) * p.speed;
        p.y += (dy / d) * p.speed;
      }
    }

    animId = requestAnimationFrame(animate);
  }

  // ── 캔버스 리사이즈 ──────────────────────
  function initMempoolBlocks() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const dims = getMempoolDims(W, H);
    const maxTx = Math.floor(dims.bw / PX) * Math.floor(dims.bh / PX);
    mempoolBlocks = [];
    for (let i = 0; i < MEMPOOL_COLS; i++) {
      mempoolBlocks.push({ txs: [], maxTx, medianFee: null, feeRange: null });
    }
    // 기존 projected 데이터 재적용
    if (mempoolProjected.length) handleMempoolBlocks(mempoolProjected);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      if (initRetries < 10) { initRetries++; requestAnimationFrame(resizeCanvas); }
      return;
    }
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initMempoolBlocks();
    // 픽셀 재빌드
    confirmedData = confirmedData.map(d => d ? {
      ...d,
      pixels: buildPixels(d.fillRatio, d.feeRange)
    } : null);
    initRetries = 0;
  }

  // ── PUBLIC ───────────────────────────────
  return {
    init(canvasEl) {
      if (!canvasEl) return;
      canvas = canvasEl;
      ctx = canvas.getContext('2d');
      initRetries = 0;
      resizeCanvas();

      if (!initialized) {
        window.addEventListener('resize', () => {
          if (canvas && canvas.isConnected) resizeCanvas();
        });
        initialized = true;
      }

      if (resizeObserver) resizeObserver.disconnect();
      resizeObserver = new ResizeObserver(() => {
        if (canvas && canvas.isConnected) resizeCanvas();
      });
      resizeObserver.observe(canvas);

      if (animId) cancelAnimationFrame(animId);
      animate();

      // WebSocket 연결
      connectWS();
    },

    // REST API로 초기 데이터 주입 (app.js에서 호출)
    updateData(confirmed, mempool) {
      if (!canvas) return;
      if (confirmed && confirmed.length) {
        confirmedData = confirmed.slice(0, CONFIRMED_COUNT).map(b => blockToConfirmedData(b));
      }
      if (mempool && mempool.length) {
        mempoolProjected = mempool;
        handleMempoolBlocks(mempool);
      }
      // WS 연결도 시작
      connectWS();
    },

    stop() {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
      if (ws) { ws.close(); ws = null; }
      clearTimeout(wsReconnectTimer);
    }
  };
})();
