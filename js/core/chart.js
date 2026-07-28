// ─────────────────────────────────────────────
// CHART RENDERER — SYMS, stitchCell, buildChartTracker
//
// Renders the knitting chart viewport, row tracker, zoom, and legend.
// ─────────────────────────────────────────────
const SYMS = {
  P:  '<svg width="8" height="8" viewBox="0 0 8 8" style="display:block"><circle cx="4" cy="4" r="3.5" fill="currentColor"/></svg>',
  YO: '<svg width="9" height="9" viewBox="0 0 9 9" style="display:block"><circle cx="4.5" cy="4.5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  K2: '<svg width="9" height="9" viewBox="0 0 9 9" style="display:block"><polygon points="0,9 9,9 9,0" fill="currentColor"/></svg>',
  SK: '<svg width="9" height="9" viewBox="0 0 9 9" style="display:block"><polygon points="0,0 0,9 9,9" fill="currentColor"/></svg>',
  M1: '<svg width="10" height="10" viewBox="0 0 10 10" style="display:block"><circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="1.5" y1="5" x2="8.5" y2="5" stroke="currentColor" stroke-width="1.5"/></svg>',
};

function stitchCell(type) {
  if (type === 'E') return '<div class="cc cc-e"></div>';
  const sym = SYMS[type] || '';
  return `<div class="cc">${sym ? `<span class="cc-sym">${sym}</span>` : ''}</div>`;
}

function buildChartTracker(phaseHeaderHtml) {
  let html = '<div class="chart-tracker">';

  // Top panel: just the phase header (minimized grab bar when idle) — the
  // general instructions now live in the row recap dock, and the zoom
  // controls sit next to the recenter FAB (see chart-stage below).
  html += `<div class="chart-overlay-top" id="chart-overlay-top">`;
  html += phaseHeaderHtml;
  html += '</div>';

  // Stage: the scrolling chart viewport + floating recenter/zoom buttons
  html += '<div class="chart-stage">';
  html += '<div class="chart-vp" id="chart-vp"><div class="chart-inner" id="chart-inner">';

  // Render rows top-to-bottom visually (row 44 at top, row 1 at bottom).
  // The last-worked row (44) carries the post-chart confirm step directly
  // underneath it, rather than as a separate block below the whole chart.
  for (let r = CHART_TOTAL; r >= 1; r--) {
    const rowData = CHART_B[r - 1];
    const isActive = (r === chartCurrentRow);
    const isDone   = (r < chartCurrentRow);

    let numCls = 'crow-num';
    if (isActive) numCls += ' crow-num-active';
    else if (isDone) numCls += ' crow-num-done';

    html += `<div class="crow${isActive ? ' crow-active' : ''}" data-row="${r}">`;
    html += '<div class="crow-cells">';
    for (const t of rowData) html += stitchCell(t);
    html += '</div>';
    html += `<div class="${numCls}">${r}</div>`;
    html += '</div>';
  }

  html += '</div></div>'; // chart-inner + chart-vp
  html += `<div class="chart-fabs">
    <button class="chart-fab-btn" onclick="resizeChart(2)" aria-label="Zoom in">A+</button>
    <button class="chart-fab-btn" onclick="resizeChart(-2)" aria-label="Zoom out">A−</button>
    <button class="chart-fab-btn chart-recenter" onclick="centerOnCurrentRow()" aria-label="Center on current row">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="3" fill="currentColor"/>
        <circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M9 0.5V3M9 15v2.5M17.5 9H15M3 9H0.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>`;
  html += '</div>'; // chart-stage

  // Bottom panel: legend (kept for the pattern-notes sheet, hidden here)
  html += `<div class="chart-overlay-bottom" id="chart-overlay-bottom">`;
  html += `<div class="chart-legend">
    <div class="leg"><div class="leg-cc"></div>knit</div>
    <div class="leg"><div class="leg-cc" style="color:var(--ch-def-symbol)">${SYMS.P}</div>purl</div>
    <div class="leg"><div class="leg-cc" style="color:var(--ch-def-symbol)">${SYMS.YO}</div>yarn over</div>
    <div class="leg"><div class="leg-cc" style="color:var(--ch-def-symbol)">${SYMS.K2}</div>k2tog</div>
    <div class="leg"><div class="leg-cc" style="color:var(--ch-def-symbol)">${SYMS.SK}</div>SKPO</div>
    <div class="leg"><div class="leg-cc" style="color:var(--ch-def-symbol)">${SYMS.M1}</div>M1</div>
    <div class="leg"><div class="leg-cc leg-cc-e"></div>no stitch</div>
  </div>`;
  html += '</div>';

  html += '</div>'; // chart-tracker
  return html;
}

function centerOnCurrentRow() {
  scrollChartToCurrent('smooth');
}

// ─────────────────────────────────────────────
// ROW RECAP — plain-language summary of the stitches in a row.
// The chart is read right → left, so we reverse the stored (left → right)
// cells, drop the no-stitch padding, run-length encode, then collapse any
// consecutive repeating block into "*…* rep N times".
// ─────────────────────────────────────────────
const STITCH_ABBR = { K: 'k', P: 'p', YO: 'yo', K2: 'k2tog', SK: 'ssk', M1: 'm1' };

function rleStitches(types) {
  const out = [];
  for (let i = 0; i < types.length; ) {
    let j = i;
    while (j < types.length && types[j] === types[i]) j++;
    const n = j - i, t = types[i];
    if (t === 'K' || t === 'P') out.push(STITCH_ABBR[t] + n);
    else out.push(n > 1 ? STITCH_ABBR[t] + ' ×' + n : STITCH_ABBR[t]);
    i = j;
  }
  return out;
}

function collapseRepeats(tokens) {
  const out = [];
  for (let i = 0; i < tokens.length; ) {
    let best = null;
    const maxLen = Math.floor((tokens.length - i) / 2);
    for (let L = 2; L <= maxLen; L++) {
      let reps = 1;
      while (i + (reps + 1) * L <= tokens.length) {
        let match = true;
        for (let k = 0; k < L; k++) {
          if (tokens[i + k] !== tokens[i + reps * L + k]) { match = false; break; }
        }
        if (!match) break;
        reps++;
      }
      if (reps >= 2 && (!best || reps * L > best.reps * best.len)) best = { len: L, reps };
    }
    if (best) {
      out.push(`*${tokens.slice(i, i + best.len).join(', ')}* rep ${best.reps} times`);
      i += best.len * best.reps;
    } else {
      out.push(tokens[i]);
      i++;
    }
  }
  return out;
}

function rowRecap(row) {
  const types = CHART_B[row - 1].filter(t => t !== 'E').reverse();
  if (!types.length) return '';
  return collapseRepeats(rleStitches(types)).join(', ');
}

function recapHtml(row) {
  let html = `<div class="recap-head">Work Chart B in the round · read right → left, bottom to top</div>
    <div class="recap-body"><strong>Row ${row}:</strong> ${rowRecap(row)}</div>`;

  // Post-chart confirm step — the last step of the chart phase, surfaced
  // alongside the row instructions (same "what do I do now" panel) rather
  // than as a separate block further down. Only relevant once the last row
  // is reached — it's the count you take after finishing the chart.
  const confirmStep = PHASES[cur].steps.find(s => s.postChart);
  if (confirmStep && row === CHART_TOTAL) {
    const done = state[confirmStep.id];
    html += `<div class="chart-confirm-step ${done ? 'done' : ''}" onclick="toggleStep('${confirmStep.id}')">
      <div class="step-circle">${CHECK_SVG}</div>
      <div class="step-text">${confirmStep.text}</div>
    </div>`;
  }
  return html;
}

function renderChartDock() {
  const dock = document.getElementById('chart-dock');
  let html = `<div class="chart-recap" id="chart-recap">${recapHtml(chartCurrentRow)}</div>`;
  html += `<div class="chart-footer">
    <button class="cc-ctrl cc-minus" onclick="changeChartRow(-1)">−</button>
    <div class="cc-stats">
      <span class="cc-stat-lbl">Current row</span>
      <span class="cc-cur-val" id="cc-cur">${chartCurrentRow}</span>
      <span class="cc-total-lbl">Total rows ${CHART_TOTAL}</span>
    </div>
    <button class="cc-ctrl cc-plus" onclick="changeChartRow(1)">+</button>
  </div>`;

  html += '<div class="nav-btns" id="chart-nav-btns">';
  if (cur > 0) html += `<button class="nav-btn" onclick="go(${cur - 1})">← Back</button>`;
  if (cur < PHASES.length - 1) html += `<button class="nav-btn primary" onclick="go(${cur + 1})">Next →</button>`;
  else html += `<button class="nav-btn primary" onclick="showFinishedScreen()">Finished! 🎉</button>`;
  html += '</div>';

  dock.innerHTML = html;
}

// ─────────────────────────────────────────────
// CHART SCROLL — centre current row in viewport
// ─────────────────────────────────────────────
function getRowH() { return cellSz + 4; } // must match .crow height in CSS (var(--cell-sz) + 4px)

function scrollChartToCurrent(behavior) {
  // Centre the current row in the chart viewport. The viewport itself grows
  // and shrinks as the panels collapse/expand, so a plain centre is enough —
  // the visible area is always exactly the space left by the panels.
  const vp = document.getElementById('chart-vp');
  const inner = document.getElementById('chart-inner');
  if (!vp || !inner) return;

  const vpH = vp.clientHeight;
  const ROW_H = getRowH();
  const visIdx = CHART_TOTAL - chartCurrentRow; // row 44 = index 0 (top), row 1 = index 43 (bottom)
  const padTop = parseFloat(getComputedStyle(inner).paddingTop) || 8;
  const rowCenter = padTop + visIdx * ROW_H + ROW_H / 2;
  const target = rowCenter - vpH / 2;
  const maxScroll = inner.scrollHeight - vpH;

  vp.scrollTo({ top: Math.max(0, Math.min(maxScroll, target)), behavior: behavior || 'instant' });
}

function smartScrollChart(rowEl, delta) {
  // Keep the active row centered in the viewport once it reaches the midpoint
  // in the direction of travel.
  // Going up (+): track once row hits the upper half.
  // Going down (−): track once row hits the lower half.
  if (!rowEl) return;
  const vp = document.getElementById('chart-vp');
  if (!vp) return;

  const vpRect = vp.getBoundingClientRect();
  const rowRect = rowEl.getBoundingClientRect();
  const centerY = vpRect.top + vpRect.height / 2;
  const rowCenterY = rowRect.top + rowRect.height / 2;

  const shouldScroll = delta > 0 ? rowCenterY <= centerY : rowCenterY >= centerY;
  if (shouldScroll) {
    const target = vp.scrollTop + (rowCenterY - centerY);
    const maxScroll = vp.scrollHeight - vpRect.height;
    vp.scrollTo({ top: Math.max(0, Math.min(maxScroll, target)), behavior: 'smooth' });
  }
}

function resizeChart(delta) {
  cellSz = Math.max(10, Math.min(32, cellSz + delta));
  document.documentElement.style.setProperty('--cell-sz', cellSz + 'px');
  save();
  requestAnimationFrame(scrollChartToCurrent);
}

function changeChartRow(delta) {
  const prevRow = chartCurrentRow;
  chartCurrentRow = Math.max(1, Math.min(CHART_TOTAL, chartCurrentRow + delta));
  if (chartCurrentRow === prevRow) return;
  globalRows = Math.max(0, globalRows + (chartCurrentRow - prevRow)); // auto-advance global
  renderGlobalRows();
  save();

  // Targeted DOM update — no full re-render
  const prevEl = document.querySelector('.crow[data-row="' + prevRow + '"]');
  if (prevEl) {
    prevEl.classList.remove('crow-active');
    const num = prevEl.querySelector('.crow-num');
    if (num) {
      num.classList.remove('crow-num-active');
      if (prevRow < chartCurrentRow) num.classList.add('crow-num-done');
      else num.classList.remove('crow-num-done');
    }
  }
  const newEl = document.querySelector('.crow[data-row="' + chartCurrentRow + '"]');
  if (newEl) {
    newEl.classList.add('crow-active');
    const num = newEl.querySelector('.crow-num');
    if (num) { num.classList.remove('crow-num-done'); num.classList.add('crow-num-active'); }
  }

  const ccur = document.getElementById('cc-cur');
  if (ccur) ccur.textContent = chartCurrentRow;
  const recap = document.getElementById('chart-recap');
  if (recap) recap.innerHTML = recapHtml(chartCurrentRow);

  // Smart scroll: keep active row centered once it reaches the viewport midpoint
  smartScrollChart(newEl, delta);
}

