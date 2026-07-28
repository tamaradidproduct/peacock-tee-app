// ─────────────────────────────────────────────
// NAV & APP — navigation, SW, and bootstrap
// ─────────────────────────────────────────────
function openProject(id) {
  if (!activateProject(id)) return;
  view = 'project';
  window.scrollTo(0, 0);
  render();
}

function goHome() {
  save();
  view = 'home';
  phaseNavOpen = false;
  window.scrollTo(0, 0);
  render();
}

function startNewProject() {
  view = 'picker';
  window.scrollTo(0, 0);
  render();
}

function choosePattern(patternId) {
  const proj = createProject(patternId);
  if (proj) openProject(proj.id);
}

// Header/content/dock are plain flex items on the chart page (see
// body.chart-page CSS), so the content area's size is handled entirely by
// flexbox — no measuring or manual positioning needed. This just re-centres
// the current row, kept as its own function since layout-affecting events
// (header show/hide, resize) need to re-run the recenter after the browser
// has settled the new flex sizes.
function syncChartLayout() {
  if (!document.body.classList.contains('chart-page')) return;
  scrollChartToCurrent('auto');
}

function go(i) {
  cur = i; phaseNavOpen = false; save(); render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleStep(id) {
  const nowDone = !state[id];
  state[id] = nowDone;
  // On "countable" phases (e.g. tatting rings/chains) each completed step is one
  // unit of work — advance the Rows tally by the real change.
  const ph = PHASES.find(p => p.steps.some(s => s.id === id));
  if (ph && ph.countable) globalRows = Math.max(0, globalRows + (nowDone ? 1 : -1));
  save(); render();
}

function changeCount(id, delta) {
  const step = PHASES.flatMap(p => p.steps).find(s => s.id === id);
  const max  = step ? step.target : 999;
  const prev = ctrs[id] || 0;
  ctrs[id]   = Math.max(0, Math.min(max, prev + delta));
  globalRows = Math.max(0, globalRows + (ctrs[id] - prev)); // auto-advance global by the real change
  save(); render(); renderGlobalRows();
}

// Total row-equivalent units in the active pattern: row-counter targets,
// the chart's row count, and one unit per step on "countable" phases (e.g.
// tatting rings/chains) — matches how toggleStep/changeCount/changeChartRow
// advance globalRows, so the two numbers stay comparable.
function patternTotalRows() {
  return PHASES.reduce((sum, p) => {
    if (p.hasChart) return sum + CHART_TOTAL;
    if (p.countable) return sum + p.steps.length;
    return sum + p.steps.reduce((s, st) => s + (st.rows ? st.target : 0), 0);
  }, 0);
}

// Global, project-wide row tally — read-only display that auto-advances with
// the section row counters and the chart row.
function renderGlobalRows() {
  const el = document.getElementById('prog-rows');
  if (el) el.textContent = globalRows + ' / ' + patternTotalRows();
}

// ── Service worker + update prompt ──
function showUpdateBanner(worker) {
  if (document.getElementById('update-banner')) return; // already shown
  const b = document.createElement('div');
  b.id = 'update-banner';
  b.innerHTML = '<span>Update available</span><button onclick="applyUpdate()">Update now</button>';
  bannerStack().appendChild(b);
  window._waitingSW = worker;
}

function applyUpdate() {
  const b = document.getElementById('update-banner');
  if (b) b.querySelector('button').textContent = 'Installing…';
  if (window._waitingSW) window._waitingSW.postMessage({ type: 'SKIP_WAITING' });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    // A new SW may already be waiting (e.g. user had tab open when update deployed)
    if (reg.waiting && navigator.serviceWorker.controller) {
      showUpdateBanner(reg.waiting);
    }
    // Or it installs fresh now
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateBanner(sw);
        }
      });
    });
  }).catch(() => {});

  // Once skipWaiting fires, the controller changes — reload to get fresh files
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
// Re-fit the chart between the fixed bars when the viewport changes (rotation,
// toolbar show/hide, etc.).
function onViewportChange() {
  if (PHASES[cur] && PHASES[cur].hasChart) {
    requestAnimationFrame(() => requestAnimationFrame(syncChartLayout));
  }
}
window.addEventListener('resize', onViewportChange);
window.addEventListener('orientationchange', onViewportChange);
if (window.visualViewport) window.visualViewport.addEventListener('resize', onViewportChange);

// Header auto-hide by scroll direction: hide on scroll down, reveal on scroll
// up. Applies to both normal (window) scrolling and, on the chart page, the
// internal .chart-vp scroll (see the listener wired up in renderPhase()).
//
// `scrollAnchor` is the scroll position where the header last changed state,
// not just the previous frame's position — toggling only once net movement
// since that anchor clears the threshold. Diffing frame-to-frame instead
// would flip-flop on the small alternating deltas that momentum/inertial
// scroll settling produces (a real device effect, easily seen when driving
// scrollTop programmatically in tests).
let lastScrollY = window.scrollY;
let scrollAnchor = window.scrollY;
let scrollTicking = false;
const SCROLL_HIDE_THRESHOLD = 24; // net movement required before toggling
const SCROLL_HIDE_MIN_Y = 40;     // always show header near the top

function updatePhaseHeaderOffset() {
  const h = document.getElementById('header');
  if (!h) return;
  const hidden = h.classList.contains('header-hidden');
  document.documentElement.style.setProperty('--header-h', hidden ? '0px' : h.offsetHeight + 'px');
  // scrollHeight reports the header's natural content height regardless of
  // any max-height clipping, so this stays accurate whichever state it's in.
  document.documentElement.style.setProperty('--chart-header-h', h.scrollHeight + 'px');
  const nav = document.getElementById('chart-nav-btns');
  if (nav) {
    // Unlike the header, .nav-btns is a flex row: if scrollHeight is read
    // while max-height is still constraining the box, the flex buttons
    // themselves get compressed to fit (align-items: stretch + min-height:
    // auto) instead of overflowing — so the "natural" reading comes out
    // artificially small, poisoning this var on the very next transition.
    // Bypassing the CSS var with an inline override for the read avoids it.
    const prevMaxH = nav.style.maxHeight;
    nav.style.maxHeight = 'none';
    const navH = nav.scrollHeight;
    nav.style.maxHeight = prevMaxH;
    document.documentElement.style.setProperty('--chart-navbtns-h', navH + 'px');
  }
}

function updateHeaderScrollState(scrollPos = null) {
  scrollTicking = false;
  const h = document.getElementById('header');
  if (!h) return;
  const nav = document.getElementById('chart-nav-btns');
  const y = scrollPos !== null ? scrollPos : window.scrollY;
  const delta = y - scrollAnchor;
  if (y <= SCROLL_HIDE_MIN_Y) {
    h.classList.remove('header-hidden');
    if (nav) nav.classList.remove('nav-btns-hidden');
    scrollAnchor = y;
  } else if (delta > SCROLL_HIDE_THRESHOLD) {
    h.classList.add('header-hidden');
    if (nav) nav.classList.add('nav-btns-hidden');
    scrollAnchor = y;
  } else if (delta < -SCROLL_HIDE_THRESHOLD) {
    h.classList.remove('header-hidden');
    if (nav) nav.classList.remove('nav-btns-hidden');
    scrollAnchor = y;
  }
  lastScrollY = y;
  updatePhaseHeaderOffset();
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(() => updateHeaderScrollState());
  }
}, { passive: true });
window.addEventListener('resize', updatePhaseHeaderOffset);

// ─────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────
migrateLegacy();
migrateToProjects();
loadGlobal();
loadProjects();
view = 'home';
render();
