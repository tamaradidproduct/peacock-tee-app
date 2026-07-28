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

