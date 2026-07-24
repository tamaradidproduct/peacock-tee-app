# Peacock Tee Tracker — Project Handoff

## What this is
A single-page PWA knitting **pattern library**, built for mobile use while knitting. It opens on a home/library screen listing patterns; tapping one opens the step-by-step tracker for that pattern. The Peacock Tee (Size S, 97 cm) is the first built-in pattern. Deployed at: **https://peacock-tee-small.netlify.app**

## File structure
```
peacock-tee-deploy/
  index.html      ← entire app (HTML + CSS + JS, single file)
  sw.js           ← service worker (network-first HTML + update prompt)
  manifest.json   ← PWA manifest
  netlify.toml    ← static-site build config (no build command)
  icon-192.png    ← app icon
  icon-512.png    ← app icon
  CLAUDE.md       ← this file
```

## Deployment
- Hosted on Netlify (project `peacock-tee-small`), connected to GitHub repo **tamaradidproduct/peacock-tee-app**.
- **Netlify Git auto-builds are blocked** by the free-plan build-minute limit, so pushes to `main` do NOT auto-deploy. Ship with a direct CLI deploy (no build minutes used):
  ```bash
  netlify deploy --prod --dir=.
  ```
- **Only deploy/push when the user explicitly asks** — make and verify changes locally, commit locally, and hold pushes/deploys until requested.
- Service worker cache is named `peacock-tee-vN` — bump N in `sw.js` when deploying a change so clients refresh. HTML is served **network-first** (see SW section), so page updates land on next load without a manual cache bump; bump N mainly for the cached static assets.

## How the app works

### Views & routing
Global `view` is either `'library'` or `'pattern'`. `render()` dispatches:
- `renderLibrary()` — the home screen: one card per registered pattern with its progress (%, steps done), read from saved state via `patternProgress(p)` without activating the pattern.
- `renderPattern()` — the tracker for the active pattern.

`openPattern(id)` activates a pattern and switches to `'pattern'`; `goToLibrary()` returns to `'library'` (back chevron in the header). `renderHeader()` builds the header per view (library title vs. pattern name + back button + progress + rows) and only rebuilds when the view/pattern changes.

### Pattern registry
`PATTERNS` is an array of pattern objects: `{ id, name, badge, desc, phases, chart }`. The Peacock Tee is `PATTERNS[0]`. To add a pattern, append another entry with its own `phases` (and `chart` array if it has a chart).

`activatePattern(id)` swaps the **active-pattern pointers** — `PHASES`, `CHART_B`, `CHART_TOTAL`, `TOTAL_STEPS` are `let` globals reassigned to the chosen pattern, so the rest of the rendering code is pattern-agnostic. It then resets defaults and loads that pattern's saved progress.

### Phases & steps
Each pattern's `phases` array holds phases in order (Peacock Tee: Materials → Collar → Short rows → Yoke chart → Raglan → Body → Sleeves). A step is `{ id, text, ... }` with optional fields:
- `rows: true` + `target` + `lbl` — shows a row counter.
- `cadence: N` + `cadenceOn` / `cadenceOff` — for "every Nth round" steps: counts the round you're on (1-based, no round 0) and shows a highlighted reminder on rounds where `round % N === 0`, muted otherwise (see `cadenceHintHtml`).
- `bullets: [...]` — renders a bulleted list under the step text.
- `postChart: true` — on a `hasChart` phase, folds the step into the chart card (the "Count to confirm 253 sts" confirm step).

### State & persistence (per pattern)
Progress is **namespaced per pattern**. Keys:
- `pt3_<patternId>_state` — `{stepId: boolean}` completed steps
- `pt3_<patternId>_ctrs` — `{stepId: number}` row counters
- `pt3_<patternId>_cur` — current phase index
- `pt3_<patternId>_chartRow` — active yoke-chart row (1–44)
- `pt3_<patternId>_grows` — global row tally (see below)
- `pt3_cellSz` — chart cell-size pref (10–32px, default 16) — **global**, shared across patterns
- `pt3_lastPattern` — id of the last-opened pattern

`save()` writes the active pattern's keys (via `pkey(suffix)`); `loadPatternState()` reads them; `loadGlobal()` loads shared prefs. `migrateLegacy()` runs once on startup to fold the original single-pattern keys (`pt3_state`, `pt3_cur`, …) into the `pt3_peacock-tee_*` namespace so existing progress is preserved. **Keep the `pt3_` prefix and the migration** — removing them breaks saved progress.

### Global row tally
A read-only **Rows** display in the header. `globalRows` auto-advances by the real change whenever a section row counter (`changeCount`) or the yoke-chart row (`changeChartRow`) moves; clamped taps (counter already at min/max) don't move it. It's a project-wide total per pattern (persisted as `pt3_<id>_grows`), updated in place by `renderGlobalRows()`.

### Chart
`CHART_B` (the active pattern's `chart`) is a 44-row × 23-stitch array. Each cell: `K` knit, `P` purl, `YO` yarn over, `K2` k2tog, `SK` SKPO, `M1` make one, `E` no-stitch. Displayed top-to-bottom (row 44 at top = worked last) but knitted bottom-to-top (row 1 first). Cell size is the CSS var `--cell-sz`; `A−` / `A+` call `resizeChart(delta)`.

### Chart screen layout (fixed bars)
On a `hasChart` phase, `body.chart-page` is set. The header and the row-counter/nav dock are `position: fixed` (top and bottom), and the scrolling middle (`.content`) is sized between them by measuring their heights in JS (`syncChartLayout()`). This avoids relying on viewport-height units (`vh`/`dvh`/`svh`/`innerHeight` all mis-report inside Chrome Custom Tabs on Pixel). Only `.chart-vp` scrolls.

**Auto-hide (idle):** after `UI_IDLE_DELAY` (2.5s) of no interaction outside the chart, `body.chart-idle` collapses the surrounding panels so the chart fills the screen; a minimized top bar (pattern/section name) stays as the affordance to bring them back. Tapping anywhere outside `.chart-vp` / the row counter / the recenter FAB wakes them. **This auto-hide is confined to `body.chart-page` only** (the collapse transitions are scoped to `body.chart-page`); other sections never animate show/hide.

> Gotcha: `body.classList.toggle('chart-page', isChart)` must get a **real boolean**. `PHASES[cur].hasChart` is `undefined` (not `false`) on non-chart phases, and `toggle(cls, undefined)` *flips* the class — which made panels jump on every step toggle. It's coerced with `!!` in `renderPattern()`.

### Service worker update flow
HTML is fetched **network-first** (fresh page on each load when online; cache fallback offline); other assets are cache-first. On a new SW version:
1. Browser fetches updated `sw.js` in the background
2. New SW installs but waits (no `skipWaiting` in install)
3. App detects `reg.waiting` → shows dark toast: "Update available · Update now"
4. User taps → app posts `{ type: 'SKIP_WAITING' }` → SW `skipWaiting()` → `controllerchange` → reload

## Key CSS variables (in `:root`)
```css
--bg: #f5f2ed        /* page background */
--card: #fffefb      /* card/header background */
--border: #e0dbd2    /* borders */
--text: #2a2520      /* primary text */
--muted: #8a8178     /* secondary text */
--accent: #4a6b5a    /* green accent */
--ch-blue: #2563eb   /* chart active row / current row number */
--cell-sz: 16px      /* chart cell size, user-adjustable */
```

## Key JS functions
- `render()` — dispatcher: library vs. pattern view
- `renderLibrary()` / `renderHeader()` — home screen / per-view header
- `openPattern(id)` / `goToLibrary()` — view navigation
- `activatePattern(id)` — swap active-pattern pointers + load its progress
- `patternProgress(p)` — done/total/pct for a pattern's library card (no activation)
- `renderPattern()` — header + phase content + tabs + progress + chart wiring
- `renderPhase()` — builds current phase HTML (chart if `hasChart`)
- `buildChartTracker()` — chart viewport, zoom bar, legend, recap, confirm step
- `changeChartRow(delta)` — moves chart row ±1 (targeted DOM update); auto-advances `globalRows`
- `changeCount(id, delta)` — section row counter; auto-advances `globalRows`
- `resizeChart` / `scrollChartToCurrent` / `smartScrollChart` / `syncChartLayout` — chart layout & scroll
- `save()` / `loadPatternState()` / `loadGlobal()` / `migrateLegacy()` — persistence
- `renderGlobalRows()` — updates the header Rows tally in place
- `showUpdateBanner(worker)` / `applyUpdate()` — PWA update prompt

## Nav buttons
Within a pattern, phase nav is at the bottom. On non-chart phases it's the fixed `.nav-btns` (first phase shows only "Next →" full-width; others "← Back" + "Next →"). On the chart phase it lives in the fixed `.chart-dock` alongside the row counter.

## Typography
- Headings (pattern names, phase names, library card names): Georgia serif
- Everything else: system sans-serif (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`)

## What NOT to do
- Don't suggest "Add to Home Screen" on Android Chrome — owner can't do this and doesn't want it mentioned
- Don't add the stats bar back (Steps Done / Phase / Complete) — removed intentionally
- Don't change the `pt3_` localStorage prefix or drop `migrateLegacy()` — would break saved progress
- Don't run the panel auto-hide/collapse animation off the chart screen — keep it scoped to `body.chart-page`
- Don't deploy or push unless the user asks

## Figma design reference
The layout follows a Figma design at:
`https://www.figma.com/design/mSct8t0TpsyYJad4teKfwl/Stitch-ease-knitting?node-id=3328-12548`

Key measurements from the design:
- Header: 44px, Progress bar: 4px, Tabs: 44px → content starts at y=92
- Chart viewport: fills between the fixed header and dock
- Row tracker footer: centered large number, "Current row" label above, "Total rows 44" below, 48×48 circular ± buttons
- Nav: bottom, full-width on first phase, 50/50 split on others
