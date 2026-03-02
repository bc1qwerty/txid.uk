/* ═══════════════════════════════════════════
   txid.uk — Mempool Canvas Visualization
   7 blocks: 6 confirmed + 1 mempool
   Colored pixels per TX, particles flying in
   ═══════════════════════════════════════════ */

const MempoolViz = (() => {
  let canvas, ctx;
  let animId = null;
  let blocks = [];
  let particles = [];
  let mempoolFeeRange = null;
  let lastConfirm = Date.now();
  let initialized = false;
  let initRetries = 0;

  const CONFIRMED_COLS = 4;  // 확인된 블록 수
  const MEMPOOL_COLS = 3;    // 멤풀 대기 블록 수
  const COLS = CONFIRMED_COLS + MEMPOOL_COLS;
  const PX = 4;

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

  // 랜덤 수수료 (현실 분포 반영)
  function randomFee(range) {
    if (range && range.length >= 2) {
      const min = range[0], max = range[range.length - 1];
      return min + Math.random() * (max - min);
    }
    const r = Math.random();
    if (r < 0.5)  return 0.1 + Math.random() * 0.9;
    if (r < 0.75) return 1 + Math.random() * 4;
    if (r < 0.9)  return 5 + Math.random() * 15;
    return 20 + Math.random() * 80;
  }

  function makeBlock(index, confirmed, txCount, feeRange, mempoolIdx = 0) {
    const W = canvas.width;
    const H = canvas.height;
    const dpr = window.devicePixelRatio || 1;
    const cssW = W / dpr;
    const cssH = H / dpr;
    const BLOCK_W = Math.min(110, Math.floor((cssW - 80) / COLS - 12));
    const BLOCK_H = Math.min(160, cssH - 60);
    const totalW = COLS * (BLOCK_W + 12);
    const startX = (cssW - totalW) / 2 + 6;
    const x = startX + index * (BLOCK_W + 12);
    const y = (cssH - BLOCK_H) / 2;
    const maxTx = Math.floor(BLOCK_W / PX) * Math.floor(BLOCK_H / PX);
    const count = Math.min(txCount, maxTx);
    const txs = [];
    for (let i = 0; i < count; i++) txs.push(feeColor(randomFee(feeRange)));
    return { index, x, y, w: BLOCK_W, h: BLOCK_H, txs, maxTx, confirmed, mempoolIdx, meta: null };
  }

  function initBlocks() {
    blocks = [];
    for (let i = 0; i < CONFIRMED_COLS; i++) {
      blocks.push(makeBlock(i, true, 0, null));
    }
    for (let i = 0; i < MEMPOOL_COLS; i++) {
      blocks.push(makeBlock(CONFIRMED_COLS + i, false, 0, null, i));
    }
  }

  function drawBlock(b) {
    // 배경
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(b.x, b.y, b.w, b.h);

    // TX 픽셀 (아래에서 위로)
    const cols = Math.floor(b.w / PX);
    const rows = Math.floor(b.h / PX);
    let i = 0;
    for (let r = rows - 1; r >= 0 && i < b.txs.length; r--) {
      for (let c = 0; c < cols && i < b.txs.length; c++, i++) {
        ctx.fillStyle = b.txs[i];
        ctx.globalAlpha = b.confirmed ? 0.55 : Math.max(0.3, 0.85 - b.mempoolIdx * 0.2);
        ctx.fillRect(b.x + c * PX, b.y + r * PX, PX - 1, PX - 1);
      }
    }
    ctx.globalAlpha = 1;

    // 테두리
    if (b.confirmed) {
      ctx.strokeStyle = '#1e2530';
      ctx.lineWidth = 1;
    } else if (b.mempoolIdx === 0) {
      ctx.strokeStyle = '#f7931a';
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = `rgba(247,147,26,${Math.max(0.2, 0.6 - b.mempoolIdx * 0.15)})`;
      ctx.lineWidth = 1;
    }
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    // NEXT 블록 glow
    if (!b.confirmed && b.mempoolIdx === 0) {
      ctx.save();
      ctx.shadowColor = '#f7931a';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = 'rgba(247,147,26,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.restore();
    }

    // 라벨
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    // 확인된 블록 상세 라벨
    if (b.confirmed && b.meta) {
      const m = b.meta;
      // 블록 높이
      ctx.font = 'bold 11px "Space Mono", monospace';
      ctx.fillStyle = '#f7931a';
      ctx.textAlign = 'center';
      ctx.fillText('#' + m.height, b.x + b.w / 2, b.y - 22);
      // 채굴자
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillStyle = '#8b949e';
      const minerLabel = m.miner ? (m.miner.length > 11 ? m.miner.slice(0,11)+'…' : m.miner) : '';
      ctx.fillText(minerLabel, b.x + b.w / 2, b.y - 12);
      // 경과 시간
      if (m.timestamp) {
        const sec = Math.floor(Date.now() / 1000 - m.timestamp);
        let ago;
        if (sec < 60) ago = sec + '초 전';
        else if (sec < 3600) ago = Math.floor(sec/60) + '분 전';
        else ago = Math.floor(sec/3600) + '시간 전';
        ctx.font = '9px "Space Mono", monospace';
        ctx.fillStyle = '#555';
        ctx.fillText(ago, b.x + b.w / 2, b.y - 2);
      }
      // TX 수 (하단)
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillStyle = '#6e7681';
      ctx.fillText(m.txCount.toLocaleString() + ' TX', b.x + b.w / 2, b.y + b.h + 12);
      // 수수료율
      if (m.medianFee) {
        ctx.fillStyle = '#445566';
        ctx.fillText('~' + Math.round(m.medianFee) + ' sat/vB', b.x + b.w / 2, b.y + b.h + 23);
      }
    } else if (b.confirmed) {
      // 메타 없을 때 fallback
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillStyle = '#2a3040';
      ctx.textAlign = 'center';
      const ago = CONFIRMED_COLS - 1 - b.index;
      ctx.fillText('~' + ago + '블록 전', b.x + b.w / 2, b.y - 8);
    }

    if (!b.confirmed) {
      ctx.fillStyle = '#f7931a';
      ctx.fillText('MEMPOOL', b.x + b.w / 2, b.y - 8);
      const pct = Math.round((b.txs.length / b.maxTx) * 100);
      ctx.fillStyle = '#6e7681';
      ctx.fillText(pct + '%', b.x + b.w / 2, b.y + b.h + 14);
    }
  }

  // TX 파티클 with glow
  class Tx {
    constructor() {
      const mb = blocks[CONFIRMED_COLS];  // NEXT 블록으로 날아옴
      if (!mb) { this.alive = false; return; }
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.width / dpr;
      this.x = cssW + Math.random() * 150 + 20;
      this.y = mb.y + Math.random() * mb.h;
      this.tx = mb.x + Math.random() * mb.w;
      this.ty = mb.y + Math.random() * mb.h;
      this.fee = randomFee(mempoolFeeRange);
      this.color = feeColor(this.fee);
      this.speed = 2 + Math.random() * 2.5;
      this.alive = true;
      this.size = 3;
    }
    update() {
      const dx = this.tx - this.x, dy = this.ty - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 4) { this.alive = false; return; }
      this.x += (dx / d) * this.speed;
      this.y += (dy / d) * this.speed;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(this.x - 1, this.y - 1, this.size, this.size);
      // Second pass for brighter glow
      ctx.globalAlpha = 0.5;
      ctx.shadowBlur = 20;
      ctx.fillRect(this.x, this.y, this.size - 1, this.size - 1);
      ctx.restore();
    }
  }

  function confirmBlock() {
    // 확인된 블록 shift
    for (let i = 0; i < CONFIRMED_COLS - 1; i++) {
      blocks[i].txs = [...blocks[i + 1].txs];
    }
    // 첫 멤풀 블록 → 마지막 확인 블록으로
    if (blocks[CONFIRMED_COLS - 1] && blocks[CONFIRMED_COLS]) {
      blocks[CONFIRMED_COLS - 1].txs = [...blocks[CONFIRMED_COLS].txs];
    }
    // 멤풀 블록 shift
    for (let i = 0; i < MEMPOOL_COLS - 1; i++) {
      const cur = blocks[CONFIRMED_COLS + i];
      const next = blocks[CONFIRMED_COLS + i + 1];
      if (cur && next) cur.txs = [...next.txs];
    }
    const lastMb = blocks[CONFIRMED_COLS + MEMPOOL_COLS - 1];
    if (lastMb) lastMb.txs = lastMb.txs.slice(Math.floor(lastMb.txs.length * 0.4));
    lastConfirm = Date.now();
  }

  function animate() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;

    ctx.clearRect(0, 0, cssW, cssH);

    // 연결선
    for (let i = 0; i < blocks.length - 1; i++) {
      const a = blocks[i], b = blocks[i + 1];
      ctx.strokeStyle = '#1a2030';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x + a.w, a.y + a.h / 2);
      ctx.lineTo(b.x, b.y + b.h / 2);
      ctx.stroke();
    }

    blocks.forEach(drawBlock);

    // 파티클
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      if (p.alive) {
        p.draw();
      } else {
        const mb = blocks[CONFIRMED_COLS];
        if (mb && mb.txs.length < mb.maxTx) mb.txs.push(p.color);
        particles.splice(i, 1);
      }
    }
    if (Math.random() < 0.35 && particles.length < 50) {
      const p = new Tx();
      if (p.alive) particles.push(p);
    }

    // 블록 확인 시뮬레이션 (15초)
    if (Date.now() - lastConfirm > 15000) confirmBlock();

    animId = requestAnimationFrame(animate);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // canvas가 아직 레이아웃되지 않은 경우 재시도
    if (rect.width === 0 || rect.height === 0) {
      if (initRetries < 10) {
        initRetries++;
        requestAnimationFrame(resizeCanvas);
      }
      return;
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initBlocks();
    initRetries = 0;
  }

  let resizeObserver = null;

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

      // ResizeObserver for dynamic resizing
      if (resizeObserver) resizeObserver.disconnect();
      resizeObserver = new ResizeObserver(() => {
        if (canvas && canvas.isConnected) resizeCanvas();
      });
      resizeObserver.observe(canvas);

      // 애니메이션 시작
      if (animId) cancelAnimationFrame(animId);
      animate();
    },

    updateData(confirmedBlocks, mempoolBlocks) {
      if (!canvas) return;

      if (confirmedBlocks && confirmedBlocks.length) {
        // confirmedBlocks[0] = 최신 블록 → 멤풀 바로 왼쪽(COLS-2)에 배치
        for (let i = 0; i < Math.min(confirmedBlocks.length, COLS - 1); i++) {
          const bi = CONFIRMED_COLS - 1 - i;
          if (!blocks[bi]) continue;
          const cb = confirmedBlocks[i];
          // 블록 메타 저장
          blocks[bi].meta = {
            height: cb.height,
            txCount: cb.tx_count,
            miner: cb.extras && cb.extras.pool ? cb.extras.pool.name : null,
            medianFee: cb.extras ? (cb.extras.medianFee || cb.extras.avgFeeRate) : null,
            totalFees: cb.extras ? cb.extras.totalFees : null,
            timestamp: cb.timestamp || null,
          };
          blocks[bi].txs = [];
          const maxTx = blocks[bi].maxTx;
          const feeRange = cb.extras && cb.extras.feeRange ? cb.extras.feeRange : null;
          // 실제 블록 vsize 비율로 채움 (보통 ~95~100%)
          const vsize = cb.extras && cb.extras.virtualSize ? cb.extras.virtualSize : 900000;
          const fillRatio = Math.min(vsize / 1_000_000, 1);
          const count = Math.round(maxTx * fillRatio);

          if (feeRange && feeRange.length >= 2) {
            // feePercentiles 있으면 더 정확한 분포 사용
            const percentiles = cb.extras && cb.extras.feePercentiles ? cb.extras.feePercentiles : null;
            const dist = percentiles || feeRange;
            for (let j = 0; j < count; j++) {
              // 분포 배열에서 균등 샘플링
              const idx = Math.floor(Math.random() * (dist.length - 1));
              const fee = dist[idx] + Math.random() * (dist[idx + 1] - dist[idx]);
              blocks[bi].txs.push(feeColor(Math.max(0, fee)));
            }
          } else {
            // fallback: medianFee 기반
            const median = cb.extras && cb.extras.medianFee ? cb.extras.medianFee : 5;
            for (let j = 0; j < count; j++) {
              const fee = median * (0.5 + Math.random());
              blocks[bi].txs.push(feeColor(fee));
            }
          }
        }
      }

      if (mempoolBlocks && mempoolBlocks.length) {
        mempoolFeeRange = mempoolBlocks[0].feeRange;
        for (let mi = 0; mi < Math.min(mempoolBlocks.length, MEMPOOL_COLS); mi++) {
          const mb = blocks[CONFIRMED_COLS + mi];
          if (!mb) continue;
          const mblock = mempoolBlocks[mi];
          mb.mempoolIdx = mi;
          mb.txs = [];
          const fillRatio = Math.min((mblock.blockVSize || 0) / 1_000_000, 1);
          const nTx = Math.round(mb.maxTx * fillRatio);
          for (let j = 0; j < nTx; j++) {
            mb.txs.push(feeColor(randomFee(mblock.feeRange)));
          }
        }
      }
    },

    stop() {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }
  };
})();
