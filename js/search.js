// ═══════════════════════════════════════════
// search.js — 검색 히스토리 + 멤풀 수수료 예측
// ═══════════════════════════════════════════

import { state, api, escHtml } from './core.js';

// ── 검색 히스토리 ──
function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem('search_history') || '[]'); } catch { return []; }
}

function addSearchHistory(query, type) {
  let h = getSearchHistory().filter(x => x.query !== query);
  h.unshift({ query, type });
  localStorage.setItem('search_history', JSON.stringify(h.slice(0, 5)));
}

function showSearchHistory() {
  const hist = getSearchHistory();
  document.getElementById('search-history-drop')?.remove();
  if (!hist.length) return;
  const drop = document.createElement('div');
  drop.id = 'search-history-drop';
  drop.className = 'search-history-drop';
  drop.innerHTML = hist.map(h => {
    const ic = h.type==='block'?'▣':h.type==='tx'?'↔':'◎';
    const q = escHtml(h.query.slice(0,28)) + (h.query.length>28?'…':'');
    return `<div class="sh-item" onclick="document.getElementById('search-input').value='${escHtml(h.query)}';document.getElementById('search-history-drop')?.remove();App.doSearch(false)">${ic} <span class="sh-q">${q}</span><span class="sh-t">${h.type}</span></div>`;
  }).join('');
  document.getElementById('search-wrap')?.appendChild(drop);
}

// ── 멤풀 확인 시간 예측 ──
async function estimateConfirmTime(feeRate) {
  try {
    const blocks = await api('/v1/fees/mempool-blocks');
    if (!blocks?.length) return null;
    // 각 블록의 최저 수수료(feeRange[0]) 이상이면 해당 블록에서 처리 가능
    for (let i = 0; i < blocks.length; i++) {
      const minFee = blocks[i].feeRange?.[0] ?? 0;
      if (feeRate >= minFee) {
        return { blocks: i + 1, mins: (i + 1) * 10 };
      }
    }
    // 마지막 블록보다도 낮은 수수료 → 다음 블록 이후
    return { blocks: blocks.length + 1, mins: (blocks.length + 1) * 10 };
  } catch { return null; }
}

// 멤풀 예측 표시용 - 추천 수수료와 함께 반환
async function getMempoolFeeEstimates() {
  try {
    const [blocks, fees] = await Promise.all([
      api('/v1/fees/mempool-blocks'),
      api('/v1/fees/recommended')
    ]);
    if (!blocks?.length) return null;
    return {
      fastest: { fee: fees.fastestFee, blocks: 1, mins: 10 },
      halfHour: { fee: fees.halfHourFee, blocks: 3, mins: 30 },
      hour: { fee: fees.hourFee, blocks: 6, mins: 60 },
      economy: { fee: fees.economyFee, blocks: blocks.length, mins: blocks.length * 10 },
    };
  } catch { return null; }
}

export { getSearchHistory, addSearchHistory, showSearchHistory, estimateConfirmTime, getMempoolFeeEstimates };
