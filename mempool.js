/* ═══════════════════════════════════════════
   txid.uk — Mempool Canvas Visualization
   상단: 확인된 블록 6개
   하단: 멤풀 대기 블록 애니메이션
   ═══════════════════════════════════════════ */

const MempoolViz = (() => {
  let canvas, ctx;
  let animId = null;
  let confirmedData = [];   // 확인된 블록 실제 데이터
  let mempoolData = [];     // 멤풀 대기 블록 데이터
  let particles = [];
  let mempoolBlocks = [];   // 하단 애니메이션용 블록 상태
  let initialized = false;
  let initRetries = 0;
  let resizeObserver = null;

  const CONFIRMED_COUNT = 6;
  const MEMPOOL_ANIM_COUNT = 3;  // 하단 애니메이션 멤풀 블록 수
  const PX = 3;

  // 수수료 → 색상
  function feeColor(sat) {
    if (sat >= 100) return '#ff4444';
    if (sat >= 20)  return '#ff8800';
    if (sat >= 5)   return '#f7931a';
    if (sat >= 2)   return '#ffcc00';
    if (sat >= 1)   return '#44bb44';
    if (sat >= 0.5) return '#4488ff';
    return '#445566';
  }

  function randomFee(feeRange) {
    if (feeRange && feeRange.length >= 2) {
      const idx = Math.floor(Math.random() * (feeRange.length - 1));
      return feeRange[idx] + Math.random() * (feeRange[idx+1] - feeRange[idx]);
    }
    const r = Math.random();
    if (r < 0.5)  return 0.5 + Math.random() * 0.5;
    if (r < 0.75) return 1 + Math.random() * 3;
    if (r < 0.9)  return 5 + Math.random() * 15;
    return 20 + Math.random() * 80;
  }

  function timeAgo(ts) {
    const sec = Math.floor(Date.now() / 1000 - ts);
    if (sec < 60) return sec + '초 전';
    if (sec < 3600) return Math.floor(sec / 60) + '분 전';
    return Math.floor(sec / 3600) + '시간 전';
  }

  // ── 상단: 확인된 블록 렌더 ──────────────────
  function drawConfirmedSection(W, topH) {
    const count = CONFIRMED_COUNT;
    const PAD = 10;
    const GAP = 8;
    const bw = Math.floor((W - PAD * 2 - GAP * (count - 1)) / count);
    const LABEL_TOP = 14;
    const LABEL_BOT = 18;
    const bh = topH - LABEL_TOP - LABEL_BOT - 4;

    for (let i = 0; i < count; i++) {
      const x = PAD + i * (bw + GAP);
      const y = LABEL_TOP;
      const d = confirmedData[i] || null;

      // 블록 배경
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(x, y, bw, bh);

      // 픽셀 (수수료 분포)
      if (d && d.pixels && d.pixels.length) {
        const cols = Math.floor(bw / PX);
        const rows = Math.floor(bh / PX);
        const maxPx = cols * rows;
        const pixels = d.pixels.slice(0, maxPx);
        let pi = 0;
        for (let r = rows - 1; r >= 0 && pi < pixels.length; r--) {
          for (let c = 0; c < cols && pi < pixels.length; c++, pi++) {
            ctx.fillStyle = pixels[pi];
            ctx.globalAlpha = 0.6;
            ctx.fillRect(x + c * PX, y + r * PX, PX - 1, PX - 1);
          }
        }
        ctx.globalAlpha = 1;
      } else {
        // 로딩 중 shimmer
        ctx.fillStyle = '#1c2128';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x, y, bw, bh);
        ctx.globalAlpha = 1;
      }

      // 테두리
      ctx.strokeStyle = '#21262d';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, bw, bh);

      // 상단 라벨: 블록 높이
      ctx.font = 'bold 9px "Space Mono", monospace';
      ctx.textAlign = 'center';
      if (d) {
        ctx.fillStyle = '#f7931a';
        ctx.fillText('#' + d.height.toLocaleString(), x + bw / 2, 10);
      } else {
        ctx.fillStyle = '#333';
        ctx.fillText('···', x + bw / 2, 10);
      }

      // 하단 라벨
      const botY = y + bh + 11;
      if (d) {
        ctx.font = '8px "Space Mono", monospace';
        ctx.fillStyle = '#6e7681';
        ctx.fillText(d.txCount.toLocaleString() + ' TX', x + bw / 2, botY);

        ctx.fillStyle = '#3a4050';
        ctx.font = '7px "Space Mono", monospace';
        const miner = d.miner ? (d.miner.length > 9 ? d.miner.slice(0,9)+'…' : d.miner) : '';
        ctx.fillText(miner, x + bw / 2, botY + 8);
      }
    }

    // 구분선
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, topH);
    ctx.lineTo(W, topH);
    ctx.stroke();

    // 섹션 제목
    ctx.font = '8px "Space Mono", monospace';
    ctx.fillStyle = '#3a4050';
    ctx.textAlign = 'left';
    ctx.fillText('CONFIRMED BLOCKS', PAD, topH - 3);
  }

  // ── 하단: 멤풀 애니메이션 ───────────────────
  function drawMempoolSection(W, topH, H) {
    const botH = H - topH;
    const count = MEMPOOL_ANIM_COUNT;
    const PAD = 10;
    const GAP = 12;
    const ARROW_W = 30;
    const bw = Math.floor((W - PAD * 2 - GAP * (count - 1) - ARROW_W) / count);
    const LABEL_TOP = topH + 14;
    const LABEL_BOT = 16;
    const bh = botH - (LABEL_TOP - topH) - LABEL_BOT - 4;

    // "MEMPOOL" 제목
    ctx.font = '8px "Space Mono", monospace';
    ctx.fillStyle = '#3a4050';
    ctx.textAlign = 'left';
    ctx.fillText('MEMPOOL', PAD, topH + 10);

    // 경과시간 표시
    if (confirmedData[0] && confirmedData[0].timestamp) {
      ctx.font = '8px "Space Mono", monospace';
      ctx.fillStyle = '#2a3040';
      ctx.textAlign = 'right';
      ctx.fillText(timeAgo(confirmedData[0].timestamp), W - PAD, topH + 10);
    }

    // 블록들: 왼쪽이 NEXT (가장 높은 수수료), 오른쪽이 +2, +3
    for (let i = 0; i < count; i++) {
      const x = PAD + i * (bw + GAP);
      const y = LABEL_TOP;
      const mb = mempoolBlocks[i];

      // 배경
      ctx.fillStyle = '#0a0e15';
      ctx.fillRect(x, y, bw, bh);

      // 픽셀
      if (mb && mb.txs.length) {
        const cols = Math.floor(bw / PX);
        const rows = Math.floor(bh / PX);
        let pi = 0;
        for (let r = rows - 1; r >= 0 && pi < mb.txs.length; r--) {
          for (let c = 0; c < cols && pi < mb.txs.length; c++, pi++) {
            ctx.fillStyle = mb.txs[pi];
            ctx.globalAlpha = i === 0 ? 0.85 : Math.max(0.3, 0.7 - i * 0.2);
            ctx.fillRect(x + c * PX, y + r * PX, PX - 1, PX - 1);
          }
        }
        ctx.globalAlpha = 1;
      }

      // 테두리
      if (i === 0) {
        ctx.strokeStyle = '#f7931a';
        ctx.lineWidth = 1.5;
        // glow
        ctx.save();
        ctx.shadowColor = '#f7931a';
        ctx.shadowBlur = 6;
        ctx.strokeRect(x, y, bw, bh);
        ctx.restore();
      } else {
        ctx.strokeStyle = `rgba(247,147,26,${0.4 - i * 0.1})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, bw, bh);
      }

      // 상단 라벨
      ctx.font = 'bold 9px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = i === 0 ? '#f7931a' : '#555';
      ctx.fillText(i === 0 ? 'NEXT' : '+' + (i + 1), x + bw / 2, LABEL_TOP - 3);

      // 하단: 채움률 + 수수료
      const pct = mb ? Math.round((mb.txs.length / mb.maxTx) * 100) : 0;
      const botY = y + bh + 11;
      ctx.font = '8px "Space Mono", monospace';
      ctx.fillStyle = i === 0 ? (pct >= 99 ? '#ff8800' : '#f7931a') : '#445';
      ctx.fillText(pct >= 99 ? 'FULL' : pct + '%', x + bw / 2, botY);

      if (mb && mb.medianFee) {
        ctx.font = '7px "Space Mono", monospace';
        ctx.fillStyle = '#333';
        ctx.fillText('~' + Math.round(mb.medianFee) + ' s/vB', x + bw / 2, botY + 8);
      }
    }

    // 파티클 그리기
    particles.forEach(p => p.draw());
  }

  // ── 파티클 클래스 ───────────────────────────
  class Particle {
    constructor(topH, H, W) {
      this.topH = topH;
      const mb = mempoolBlocks[0];
      if (!mb) { this.alive = false; return; }

      const PAD = 10, GAP = 12;
      const bw = Math.floor((W - PAD * 2 - GAP * (MEMPOOL_ANIM_COUNT - 1) - 30) / MEMPOOL_ANIM_COUNT);
      const LABEL_TOP = topH + 14;
      const LABEL_BOT = 16;
      const bh = (H - topH) - (LABEL_TOP - topH) - LABEL_BOT - 4;

      this.tx = PAD + Math.random() * bw;
      this.ty = LABEL_TOP + Math.random() * bh;

      // 왼쪽 또는 위에서 날아옴
      if (Math.random() < 0.7) {
        this.x = -20 - Math.random() * 80;
        this.y = LABEL_TOP + Math.random() * bh;
      } else {
        this.x = Math.random() * (bw * 0.8);
        this.y = topH + 2;
      }

      this.fee = randomFee(mempoolData[0] ? mempoolData[0].feeRange : null);
      this.color = feeColor(this.fee);
      this.speed = 1.5 + Math.random() * 2;
      this.alive = true;
      this.size = 2.5;
    }

    update() {
      const dx = this.tx - this.x, dy = this.ty - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 3) { this.alive = false; return; }
      this.x += (dx / d) * this.speed;
      this.y += (dy / d) * this.speed;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(this.x - 1, this.y - 1, this.size, this.size);
      ctx.restore();
    }
  }

  // ── 메인 애니메이션 루프 ─────────────────────
  function animate() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const topH = Math.floor(H * 0.52);  // 상단 52% = 확인된 블록

    ctx.clearRect(0, 0, W, H);

    // 배경
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    drawConfirmedSection(W, topH);
    drawMempoolSection(W, topH, H);

    // 파티클 업데이트
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      if (!p.alive) {
        // NEXT 블록에 추가
        const mb = mempoolBlocks[0];
        if (mb && mb.txs.length < mb.maxTx) mb.txs.push(p.color);
        particles.splice(i, 1);
      }
    }

    // 새 파티클 생성
    if (Math.random() < 0.3 && particles.length < 40) {
      const p = new Particle(topH, H, W);
      if (p.alive) particles.push(p);
    }

    animId = requestAnimationFrame(animate);
  }

  // ── 멤풀 블록 초기화 ─────────────────────────
  function initMempoolBlocks() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const topH = Math.floor(H * 0.52);
    const PAD = 10, GAP = 12;
    const bw = Math.floor((W - PAD * 2 - GAP * (MEMPOOL_ANIM_COUNT - 1) - 30) / MEMPOOL_ANIM_COUNT);
    const LABEL_TOP = topH + 14;
    const LABEL_BOT = 16;
    const bh = (H - topH) - (LABEL_TOP - topH) - LABEL_BOT - 4;
    const maxTx = Math.floor(bw / PX) * Math.floor(bh / PX);

    mempoolBlocks = [];
    for (let i = 0; i < MEMPOOL_ANIM_COUNT; i++) {
      mempoolBlocks.push({ txs: [], maxTx, medianFee: null });
    }
  }

  // ── 캔버스 리사이즈 ──────────────────────────
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
    // 기존 데이터로 다시 채움
    if (mempoolData.length) applyMempoolData();
    initRetries = 0;
  }

  function applyMempoolData() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const topH = Math.floor(H * 0.52);
    const PAD = 10, GAP = 12;
    const bw = Math.floor((W - PAD * 2 - GAP * (MEMPOOL_ANIM_COUNT - 1) - 30) / MEMPOOL_ANIM_COUNT);
    const LABEL_TOP = topH + 14;
    const LABEL_BOT = 16;
    const bh = (H - topH) - (LABEL_TOP - topH) - LABEL_BOT - 4;
    const maxTx = Math.floor(bw / PX) * Math.floor(bh / PX);

    for (let i = 0; i < Math.min(mempoolData.length, MEMPOOL_ANIM_COUNT); i++) {
      const md = mempoolData[i];
      mempoolBlocks[i].maxTx = maxTx;
      mempoolBlocks[i].medianFee = md.medianFee;
      mempoolBlocks[i].txs = [];
      const fillRatio = Math.min((md.blockVSize || 0) / 1_000_000, 1);
      const nTx = Math.round(maxTx * fillRatio);
      for (let j = 0; j < nTx; j++) {
        mempoolBlocks[i].txs.push(feeColor(randomFee(md.feeRange)));
      }
    }
  }

  // ── PUBLIC API ───────────────────────────────
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
    },

    updateData(confirmed, mempool) {
      if (!canvas) return;

      // 확인된 블록 데이터 처리
      if (confirmed && confirmed.length) {
        confirmedData = confirmed.slice(0, CONFIRMED_COUNT).map(cb => {
          const feeRange = cb.extras && cb.extras.feeRange ? cb.extras.feeRange : null;
          const vsize = cb.extras && cb.extras.virtualSize ? cb.extras.virtualSize : 900000;
          const fillRatio = Math.min(vsize / 1_000_000, 1);

          // 픽셀 배열 미리 생성
          const dpr = window.devicePixelRatio || 1;
          const W = canvas.width / dpr;
          const H = canvas.height / dpr;
          const topH = Math.floor(H * 0.52);
          const PAD = 10, GAP = 8;
          const bw = Math.floor((W - PAD * 2 - GAP * (CONFIRMED_COUNT - 1)) / CONFIRMED_COUNT);
          const bh = topH - 14 - 18 - 4;
          const maxPx = Math.floor(bw / PX) * Math.floor(bh / PX);
          const count = Math.round(maxPx * fillRatio);
          const pixels = [];
          for (let j = 0; j < count; j++) {
            const percentiles = cb.extras && cb.extras.feePercentiles ? cb.extras.feePercentiles : feeRange;
            pixels.push(feeColor(randomFee(percentiles)));
          }

          return {
            height: cb.height,
            txCount: cb.tx_count,
            miner: cb.extras && cb.extras.pool ? cb.extras.pool.name : null,
            medianFee: cb.extras ? (cb.extras.medianFee || cb.extras.avgFeeRate) : null,
            timestamp: cb.timestamp || null,
            pixels,
          };
        });
      }

      // 멤풀 데이터 처리
      if (mempool && mempool.length) {
        mempoolData = mempool;
        applyMempoolData();
      }
    },

    stop() {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    }
  };
})();
