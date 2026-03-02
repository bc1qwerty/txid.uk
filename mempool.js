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

  const COLS = 7;
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

  function makeBlock(index, confirmed, txCount, feeRange) {
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
    return { index, x, y, w: BLOCK_W, h: BLOCK_H, txs, maxTx, confirmed };
  }

  function initBlocks() {
    blocks = [];
    for (let i = 0; i < COLS - 1; i++) {
      blocks.push(makeBlock(i, true, 2000, null));
    }
    blocks.push(makeBlock(COLS - 1, false, 800, mempoolFeeRange));
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
        ctx.globalAlpha = b.confirmed ? 0.55 : 0.85;
        ctx.fillRect(b.x + c * PX, b.y + r * PX, PX - 1, PX - 1);
      }
    }
    ctx.globalAlpha = 1;

    // 테두리
    ctx.strokeStyle = b.confirmed ? '#1e2530' : '#f7931a';
    ctx.lineWidth = b.confirmed ? 1 : 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    // 멤풀 블록 glow effect
    if (!b.confirmed) {
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
    if (!b.confirmed) {
      ctx.fillStyle = '#f7931a';
      ctx.fillText('MEMPOOL', b.x + b.w / 2, b.y - 8);
      const pct = Math.round((b.txs.length / b.maxTx) * 100);
      ctx.fillStyle = '#6e7681';
      ctx.fillText(pct + '%', b.x + b.w / 2, b.y + b.h + 14);
    } else {
      ctx.fillStyle = '#2a3040';
      const ago = COLS - 1 - b.index;
      ctx.fillText(`~${ago}`, b.x + b.w / 2, b.y - 8);
    }
  }

  // TX 파티클 with glow
  class Tx {
    constructor() {
      const mb = blocks[COLS - 1];
      if (!mb) { this.alive = false; return; }
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.width / dpr;
      this.x = cssW + Math.random() * 200 + 30;
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
    for (let i = 0; i < COLS - 2; i++) {
      blocks[i].txs = [...blocks[i + 1].txs];
    }
    if (blocks[COLS - 2] && blocks[COLS - 1]) {
      blocks[COLS - 2].txs = blocks[COLS - 1].txs.slice(0, Math.floor(blocks[COLS - 1].txs.length * 0.6));
    }
    const mb = blocks[COLS - 1];
    if (mb) mb.txs = mb.txs.slice(Math.floor(mb.txs.length * 0.4));
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
        const mb = blocks[COLS - 1];
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
        for (let i = 0; i < Math.min(confirmedBlocks.length, COLS - 1); i++) {
          const bi = COLS - 2 - i;
          if (blocks[bi]) {
            const cb = confirmedBlocks[i];
            blocks[bi].txs = [];
            const maxTx = blocks[bi].maxTx;
            const count = Math.min(cb.tx_count || 2000, maxTx);
            // 실제 블록 수수료 분포 사용 (extras.feeRange)
            const feeRange = cb.extras && cb.extras.feeRange ? cb.extras.feeRange : null;
            for (let j = 0; j < count; j++) {
              if (feeRange && feeRange.length >= 2) {
                // feeRange 배열의 분포를 반영해서 픽셀 색상 결정
                const bucketCount = feeRange.length - 1;
                const bucketIdx = Math.floor(Math.random() * bucketCount);
                const fee = feeRange[bucketIdx] + Math.random() * (feeRange[bucketIdx + 1] - feeRange[bucketIdx]);
                blocks[bi].txs.push(feeColor(fee));
              } else {
                blocks[bi].txs.push(feeColor(randomFee(null)));
              }
            }
          }
        }
      }

      if (mempoolBlocks && mempoolBlocks[0]) {
        mempoolFeeRange = mempoolBlocks[0].feeRange;
        const mb = blocks[COLS - 1];
        if (mb) {
          mb.txs = [];
          const nTx = Math.min(mempoolBlocks[0].nTx || 800, mb.maxTx);
          for (let i = 0; i < nTx; i++) {
            mb.txs.push(feeColor(randomFee(mempoolBlocks[0].feeRange)));
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
