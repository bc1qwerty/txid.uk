/* ═══════════════════════════════════════════
   txid.uk — Mempool Canvas Visualization
   한 줄: [확인6개] | [NEXT][+2][+3]
   실시간 WebSocket (mempool.space/api/v1/ws)
   ═══════════════════════════════════════════ */

const MempoolViz = (() => {
  let canvas, ctx;
  let animId = null;
  let ws = null;
  let wsReconnectTimer = null;

  let confirmedData = [];
  let mempoolProjected = [];
  let mempoolBlocks = [];
  let mempoolBlockCount = 1;
  let particles = [];

  let initialized = false;
  let initRetries = 0;
  let resizeObserver = null;

  // 테마 감지
  function isLight() { return document.documentElement.getAttribute('data-theme') === 'light'; }
  function themeColor(dark, light) { return isLight() ? light : dark; }

  const CONFIRMED_COUNT = 6;
  const MEMPOOL_COLS = 1;
  const TOTAL_COLS = CONFIRMED_COUNT + MEMPOOL_COLS;
  const PX = 3;
  const GAP = 6;
  const PAD = 10;
  const DIVIDER_W = 2;

  function feeColor(sat) {
    if (sat >= 100) return '#ff4444';
    if (sat >= 20)  return '#ff8800';
    if (sat >= 5)   return '#f7931a';
    if (sat >= 2)   return '#ffcc00';
    if (sat >= 1)   return '#44bb44';
    if (sat >= 0.5) return '#4488ff';
    return '#445566';
  }

  function randomFeeFromRange(feeRange) {
    if (feeRange && feeRange.length >= 2) {
      const idx = Math.floor(Math.random() * (feeRange.length - 1));
      return feeRange[idx] + Math.random() * (feeRange[idx+1] - feeRange[idx]);
    }
    return 1 + Math.random() * 4;
  }

  function timeAgo(ts) {
    const lang = document.documentElement.lang || 'ko';
    const sfx = lang === 'ko' ? ['초 전','분 전','시간 전'] :
                lang === 'ja' ? ['秒前','分前','時間前'] : ['s ago','m ago','h ago'];
    const sec = Math.floor(Date.now() / 1000 - ts);
    if (sec < 60) return sec + sfx[0];
    if (sec < 3600) return Math.floor(sec / 60) + sfx[1];
    return Math.floor(sec / 3600) + sfx[2];
  }

  // ── 레이아웃 계산 ─────────────────────────
  function getLayout() {
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    const totalGap = GAP * (TOTAL_COLS - 1) + DIVIDER_W + PAD * 2;
    const bw = Math.floor((W - totalGap) / TOTAL_COLS);
    const LABEL_TOP = 18;   // 상단 라벨 높이
    const LABEL_BOT = 28;   // 하단 라벨 높이
    const bh = H - LABEL_TOP - LABEL_BOT;

    // 각 블록 x 좌표 계산
    const xs = [];
    for (let i = 0; i < TOTAL_COLS; i++) {
      let x = PAD + i * (bw + GAP);
      if (i >= CONFIRMED_COUNT) x += DIVIDER_W + GAP; // 구분선 이후
      xs.push(x);
    }

    return { W, H, bw, bh, LABEL_TOP, LABEL_BOT, xs, maxTx: Math.floor(bw / PX) * Math.floor(bh / PX) };
  }

  // ── WebSocket ─────────────────────────────
  function connectWS() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    clearTimeout(wsReconnectTimer);
    try { ws = new WebSocket('wss://mempool.space/api/v1/ws'); } catch { scheduleReconnect(); return; }

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: 'init' }));
      ws.send(JSON.stringify({ action: 'want', data: ['blocks', 'mempool-blocks', 'stats'] }));
    };
    ws.onmessage = (event) => {
      let msg; try { msg = JSON.parse(event.data); } catch { return; }
      if (msg.block) handleNewBlock(msg.block);
      if (msg['mempool-blocks']) handleMempoolBlocks(msg['mempool-blocks']);
      if (msg.transactions) msg.transactions.forEach(tx => spawnTxParticle(tx));
      if (msg.blocks) msg.blocks.slice(0, CONFIRMED_COUNT).forEach((b, i) => {
        if (!confirmedData[i]) confirmedData[i] = blockToConfirmedData(b);
      });
    };
    ws.onclose = () => scheduleReconnect();
    ws.onerror = () => ws.close();
  }
  function scheduleReconnect() {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = setTimeout(connectWS, 5000);
  }

  function handleNewBlock(block) {
    confirmedData.unshift(blockToConfirmedData(block));
    if (confirmedData.length > CONFIRMED_COUNT) confirmedData.pop();
    if (mempoolBlocks[0]) mempoolBlocks[0].txs = [];
    window.dispatchEvent(new CustomEvent('mempool:newblock', { detail: block }));
  }

  function handleMempoolBlocks(projected) {
    mempoolProjected = projected;
    mempoolBlockCount = projected.length;
    const layout = getLayout();
    if (!layout) return;
    for (let i = 0; i < Math.min(projected.length, MEMPOOL_COLS); i++) {
      const pd = projected[i];
      if (!mempoolBlocks[i]) continue;
      mempoolBlocks[i].medianFee = pd.medianFee;
      mempoolBlocks[i].feeRange = pd.feeRange;
      mempoolBlocks[i].nTx = pd.nTx || 0;
      mempoolBlocks[i].vsize = pd.blockVSize || 0;
      const fillRatio = Math.min((pd.blockVSize || 0) / 1_000_000, 1);
      const target = Math.round(layout.maxTx * fillRatio);
      if (mempoolBlocks[i].txs.length > target) {
        mempoolBlocks[i].txs = mempoolBlocks[i].txs.slice(0, target);
      } else {
        while (mempoolBlocks[i].txs.length < target)
          mempoolBlocks[i].txs.push(feeColor(randomFeeFromRange(pd.feeRange)));
      }
    }
  }

  function spawnTxParticle(tx) {
    const layout = getLayout();
    if (!layout || !mempoolBlocks[0]) return;
    const feeRate = tx.fee && tx.weight ? tx.fee / (tx.weight / 4) : randomFeeFromRange(mempoolProjected[0]?.feeRange);
    const color = feeColor(feeRate);
    // NEXT 블록 위치
    const nx = layout.xs[CONFIRMED_COUNT];
    const ny = layout.LABEL_TOP;
    // 오른쪽 바깥에서 날아옴
    const p = {
      x: layout.W + 20 + Math.random() * 60,
      y: ny + Math.random() * layout.bh,
      tx: nx + Math.random() * layout.bw,
      ty: ny + Math.random() * layout.bh,
      color, speed: 1.8 + Math.random() * 2, alive: true, size: 2.5,
    };
    if (particles.length < 80) particles.push(p);
  }

  function blockToConfirmedData(block) {
    const extras = block.extras || {};
    const feeRange = extras.feeRange || null;
    const vsize = extras.virtualSize || block.size || 900000;
    const fillRatio = Math.min(vsize / 1_000_000, 1);
    return {
      height: block.height,
      txCount: block.tx_count || 0,
      miner: extras.pool?.name || null,
      medianFee: extras.medianFee || extras.avgFeeRate || null,
      timestamp: block.timestamp || null,
      fillRatio,
      feeRange: extras.feePercentiles || feeRange,
      pixels: null, // 그릴 때 생성
    };
  }

  // ── 렌더 ──────────────────────────────────
  function drawBlock(x, y, bw, bh, pixels, maxPx, isMempool, mempoolIdx) {
    ctx.fillStyle = isMempool ? '#080c12' : '#0d1117';
    ctx.fillRect(x, y, bw, bh);

    if (pixels && pixels.length) {
      const cols = Math.floor(bw / PX);
      const rows = Math.floor(bh / PX);
      let pi = 0;
      for (let r = rows - 1; r >= 0 && pi < pixels.length; r--) {
        for (let c = 0; c < cols && pi < pixels.length; c++, pi++) {
          ctx.fillStyle = pixels[pi];
          ctx.globalAlpha = isMempool ? Math.max(0.3, 0.85 - (mempoolIdx||0) * 0.2) : 0.65;
          ctx.fillRect(x + c * PX, y + r * PX, PX - 1, PX - 1);
        }
      }
      ctx.globalAlpha = 1;
    } else if (!isMempool) {
      // 로딩
      ctx.fillStyle = '#1a2030'; ctx.globalAlpha = 0.3;
      ctx.fillRect(x, y, bw, bh); ctx.globalAlpha = 1;
    }

    // 테두리
    if (!isMempool) {
      ctx.strokeStyle = themeColor('#21262d','#d0d7de'); ctx.lineWidth = 1;
    } else if (mempoolIdx === 0) {
      ctx.save(); ctx.shadowColor = '#f7931a'; ctx.shadowBlur = 8;
      ctx.strokeStyle = '#f7931a'; ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, bw, bh); ctx.restore(); return;
    } else {
      ctx.strokeStyle = `rgba(247,147,26,${0.35 - (mempoolIdx||0) * 0.08})`; ctx.lineWidth = 1;
    }
    ctx.strokeRect(x, y, bw, bh);
  }

  function animate() {
    if (!canvas || !ctx) return;
    const layout = getLayout();
    if (!layout) { animId = requestAnimationFrame(animate); return; }
    const { W, H, bw, bh, LABEL_TOP, LABEL_BOT, xs, maxTx } = layout;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = themeColor('#0d1117', '#f6f8fa');
    ctx.fillRect(0, 0, W, H);

    // ── 확인된 블록 (오름차순: 왼쪽=오래된, 오른쪽=최신) ──
    for (let i = 0; i < CONFIRMED_COUNT; i++) {
      const x = xs[i], y = LABEL_TOP;
      const d = confirmedData[CONFIRMED_COUNT - 1 - i];  // 역순 렌더

      // 픽셀 배열 lazy 생성
      if (d && !d.pixels) {
        d.pixels = [];
        const count = Math.round(maxTx * d.fillRatio);
        for (let j = 0; j < count; j++) d.pixels.push(feeColor(randomFeeFromRange(d.feeRange)));
      }

      drawBlock(x, y, bw, bh, d?.pixels, maxTx, false);

      // 상단: 높이
      ctx.font = 'bold 10px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = d ? '#cf6b00' : themeColor('#333','#ccc');
      ctx.fillText(d ? '#' + d.height.toLocaleString() : '···', x + bw / 2, 13);

      // 하단: TX수 / 채굴자 / 경과시간
      if (d) {
        const by = y + bh;
        ctx.font = '8px "Space Mono", monospace';
        ctx.fillStyle = themeColor('#8b949e','#656d76');
        ctx.fillText(d.txCount.toLocaleString() + ' TX', x + bw / 2, by + 10);
        if (d.miner) {
          const mn = d.miner.length > 10 ? d.miner.slice(0,10)+'…' : d.miner;
          ctx.font = '7.5px "Space Mono", monospace'; ctx.fillStyle = themeColor('#4a5568','#8c959f');
          ctx.fillText(mn, x + bw / 2, by + 19);
        }
        if (d.timestamp) {
          ctx.font = '7px "Space Mono", monospace'; ctx.fillStyle = themeColor('#3a4555','#aab0b8');
          ctx.fillText(timeAgo(d.timestamp), x + bw / 2, by + 27);
        }
      }
    }

    // ── 구분선 ──
    const divX = xs[CONFIRMED_COUNT] - GAP - DIVIDER_W;
    ctx.fillStyle = themeColor('#30363d','#d0d7de');
    ctx.fillRect(divX, LABEL_TOP - 4, DIVIDER_W, bh + 8);

    // ── 멤풀 블록 (NEXT 1개) ──
    {
      const x = xs[CONFIRMED_COUNT], y = LABEL_TOP;
      const mb = mempoolBlocks[0];
      drawBlock(x, y, bw, bh, mb?.txs, maxTx, true, 0);

      // 상단: NEXT + 대기 블록 수
      ctx.font = 'bold 10px "Space Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#f7931a';
      ctx.fillText('NEXT', x + bw / 2, 13);

      // 대기 블록 수
      if (mempoolBlockCount > 1) {
        ctx.font = '7.5px "Space Mono", monospace'; ctx.textAlign = 'right';
        ctx.fillStyle = '#556';
        const _lang2 = document.documentElement.lang || 'ko';
        const _wait = _lang2==='ko'?' 대기':_lang2==='ja'?' 待機':' pending';
        ctx.fillText('+' + (mempoolBlockCount - 1) + _wait, x + bw - 2, 13);
      }

      // 하단: TX수 / vsize / 수수료
      if (mb) {
        const by = y + bh;
        // TX 수 (실제 API nTx)
        ctx.font = '8px "Space Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = '#f7931a';
        const txLabel = mb.nTx ? mb.nTx.toLocaleString() + ' TX' : (mb.txs.length > 0 ? mb.txs.length + ' TX' : '—');
        ctx.fillText(txLabel, x + bw / 2, by + 10);
        // vsize (블록 크기)
        if (mb.vsize) {
          ctx.font = '7px "Space Mono", monospace'; ctx.fillStyle = '#445';
          const vs = mb.vsize >= 1000 ? Math.round(mb.vsize / 1000) + ' kvB' : mb.vsize + ' vB';
          ctx.fillText(vs, x + bw / 2, by + 19);
        }
        // 수수료율 (중간값)
        if (mb.medianFee) {
          ctx.font = '7px "Space Mono", monospace'; ctx.fillStyle = '#2a3545';
          ctx.fillText('~' + mb.medianFee.toFixed(1) + ' sat/vB', x + bw / 2, by + 27);
        }
      }
    }

    // ── 파티클 ──
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < 3) {
        if (mempoolBlocks[0] && mempoolBlocks[0].txs.length < mempoolBlocks[0].maxTx)
          mempoolBlocks[0].txs.push(p.color);
        particles.splice(i, 1);
      } else {
        p.x += (dx/d)*p.speed; p.y += (dy/d)*p.speed;
        ctx.save(); ctx.globalAlpha = 0.9;
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.fillRect(p.x-1, p.y-1, p.size, p.size); ctx.restore();
      }
    }

    // WS 상태
    const wsOk = ws && ws.readyState === WebSocket.OPEN;
    ctx.font = '7px "Space Mono", monospace'; ctx.textAlign = 'right';
    ctx.fillStyle = wsOk ? '#238636' : themeColor('#6e3030','#cc4444');
    const _lang3 = document.documentElement.lang || 'ko';
    const _conn = _lang3==='ko'?'○ 연결 중…':_lang3==='ja'?'○ 接続中…':'○ connecting…';
    ctx.fillText(wsOk ? '● LIVE' : _conn, W - PAD, 13);

    animId = requestAnimationFrame(animate);
  }

  function initMempoolBlocks() {
    const layout = getLayout();
    if (!layout) return;
    mempoolBlocks = Array.from({length: MEMPOOL_COLS}, () => ({
      txs: [], maxTx: layout.maxTx, medianFee: null, feeRange: null
    }));
    if (mempoolProjected.length) handleMempoolBlocks(mempoolProjected);
    // 픽셀 재빌드
    confirmedData.forEach(d => { if (d) d.pixels = null; });
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
    initRetries = 0;
  }

  function showNextBlockInfo() {
    const _modalLang = document.documentElement.lang || 'ko';
    const isKo = _modalLang === 'ko';
    const isJa = _modalLang === 'ja';
    const mb = mempoolBlocks[0];
    const nTx = mb && mb.nTx ? mb.nTx.toLocaleString() : '—';
    const vsize = mb && mb.vsize ? Math.round(mb.vsize / 1000) + ' kvB' : '—';
    const fee = mb && mb.medianFee ? mb.medianFee.toFixed(2) + ' sat/vB' : '—';
    const waiting = (mempoolBlockCount || 1) - 1;

    // 기존 모달 제거
    document.getElementById('next-block-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'next-block-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width:420px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h2 style="margin:0;font-size:.95rem;color:var(--accent)">NEXT ${isKo ? '블록 (예측)' : 'Block (Projected)'}</h2>
          <button onclick="document.getElementById('next-block-modal').remove()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:1.1rem">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
          <div class="ms-card"><div class="ms-val">${nTx}</div><div class="ms-lbl">${isKo ? '대기 TX' : isJa ? '待機TX' : 'Pending TX'}</div></div>
          <div class="ms-card"><div class="ms-val">${vsize}</div><div class="ms-lbl">${isKo ? '블록 크기' : isJa ? 'ブロックサイズ' : 'Block Size'}</div></div>
          <div class="ms-card"><div class="ms-val">${fee}</div><div class="ms-lbl">${isKo ? '중간 수수료' : isJa ? '中央手数料' : 'Median Fee'}</div></div>
          <div class="ms-card"><div class="ms-val">+${waiting}</div><div class="ms-lbl">${isKo ? '대기 블록' : isJa ? '待機ブロック' : 'Waiting Blocks'}</div></div>
        </div>
        <div style="font-size:.75rem;color:var(--text2);line-height:1.7;font-family:var(--font-ko)">
          <p style="margin:0 0 8px"><strong style="color:var(--text1)">${isKo ? 'NEXT 블록이란?' : 'What is the NEXT block?'}</strong></p>
          <p style="margin:0 0 10px">${isKo
            ? '채굴자가 <strong>수수료 높은 순</strong>으로 TX를 선택해 ~1MB 블록을 채웁니다. 이 예측은 실제 채굴 결과와 다를 수 있습니다.'
            : 'Miners select TXs by <strong>highest fee rate</strong> to fill ~1MB. This projection may differ from the actual mined block.'}</p>
          <ul style="margin:0;padding-left:16px">
            <li>${isKo ? '수수료가 낮으면 다음 블록으로 밀릴 수 있음' : 'Low-fee TXs may be deferred to a later block'}</li>
            <li>${isKo ? '채굴자마다 TX 선택 기준이 다름 (Foundry, MARA 등)' : 'Each miner has its own policy (Foundry, MARA, etc.)'}</li>
            <li>${isKo ? 'RBF로 수수료를 올리면 우선순위 상승' : 'Use RBF to boost your TX priority'}</li>
            <li>${isKo ? '예측 일치율: 약 85~95%' : 'Prediction accuracy: ~85–95%'}</li>
          </ul>
        </div>
        <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px">
          <div style="font-size:.75rem;color:var(--text2);margin-bottom:6px;font-family:var(--font-ko)">${isKo ? '수수료 분포 (현재 멤풀)' : 'Fee Distribution (Mempool)'}</div>
          <canvas id="modal-fee-chart" style="width:100%;height:100px;display:block"></canvas>
        </div>
      </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);

    // 히스토그램 렌더 (DOM에 추가된 후)
    requestAnimationFrame(() => {
      const feeCanvas = document.getElementById('modal-fee-chart');
      if (feeCanvas && window.renderFeeHistogram && mempoolProjected.length) {
        window.renderFeeHistogram(mempoolProjected, feeCanvas);
      }
    });
  }

  return {
    init(canvasEl) {
      if (!canvasEl) return;
      canvas = canvasEl; ctx = canvas.getContext('2d');
      initRetries = 0; resizeCanvas();
      if (!initialized) {
        window.addEventListener('resize', () => { if (canvas?.isConnected) resizeCanvas(); });
        initialized = true;
      }
      if (resizeObserver) resizeObserver.disconnect();
      resizeObserver = new ResizeObserver(() => { if (canvas?.isConnected) resizeCanvas(); });
      resizeObserver.observe(canvas);
      if (animId) cancelAnimationFrame(animId);
      animate();
      connectWS();

      // 캔버스 클릭 → 블록 이동
      canvas.style.cursor = 'default';
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const layout = getLayout();
        if (!layout) return;
        let hit = false;
        for (let i = 0; i < CONFIRMED_COUNT; i++) {
          const x = layout.xs[i];
          if (mx >= x && mx <= x + layout.bw && confirmedData[CONFIRMED_COUNT - 1 - i]) {
            hit = true; break;
          }
        }
        // NEXT 블록도 클릭 가능
        const nx = layout.xs[CONFIRMED_COUNT];
        if (mx >= nx && mx <= nx + layout.bw) hit = true;
        canvas.style.cursor = hit ? 'pointer' : 'default';
      });

      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const layout = getLayout();
        if (!layout) return;

        // 확인된 블록 클릭 → 블록 페이지
        for (let i = 0; i < CONFIRMED_COUNT; i++) {
          const x = layout.xs[i];
          if (mx >= x && mx <= x + layout.bw) {
            const d = confirmedData[CONFIRMED_COUNT - 1 - i];
            if (d) { location.hash = '#/block/' + d.height; return; }
          }
        }

        // NEXT 블록 클릭 → 설명 모달
        const nx = layout.xs[CONFIRMED_COUNT];
        if (mx >= nx && mx <= nx + layout.bw) {
          showNextBlockInfo();
        }
      });
    },

    updateData(confirmed, mempool) {
      if (!canvas) return;
      if (confirmed?.length) confirmedData = confirmed.slice(0, CONFIRMED_COUNT).map(blockToConfirmedData);
      if (mempool?.length) {
        mempoolBlockCount = mempool.length;
        mempoolProjected = mempool;
        handleMempoolBlocks(mempool);
      }
      connectWS();
    },

    isWsConnected() {
      return ws && ws.readyState === WebSocket.OPEN;
    },

    stop() {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
      if (ws) { ws.close(); ws = null; }
      clearTimeout(wsReconnectTimer);
    }
  };
})();
