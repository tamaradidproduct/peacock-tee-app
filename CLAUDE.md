# Peacock Tee Tracker — Project Handoff

## What this is
A single-page PWA knitting **pattern library**, built for mobile use while knitting. It opens on a home/library screen listing patterns; tapping one opens the step-by-step tracker for that pattern. The Peacock Tee (Size S, 97 cm) is the first built-in pattern. Deployed at: **https://tamaradidproduct.github.io/stitch_ease/**

## File structure
```
peacock-tee-deploy/
  index.html      ← entire app (HTML + CSS + JS, single file)
  sw.js           ← service worker (network-first HTML + update prompt)
  manifest.json   ← PWA manifest
  icon-192.png    ← app icon
  icon-512.png    ← app icon
  CLAUDE.md       ← this file
```

## Deployment
- Hosted on **GitHub Pages** at https://tamaradidproduct.github.io/stitch_ease/, deploying from the `main` branch.
- **Auto-deploys on every push to `main`** — GitHub Pages rebuilds the site instantly when the branch updates. **Merging a PR into `main` is the deploy action** — nothing further to run.
- **Only merge when the user explicitly asks** — make and verify changes locally, commit, push, and open a PR; hold the merge until requested.
- Service worker cache is named `stitch-ease-vN` — bump N in `sw.js` when deploying a change so clients refresh. HTML is served **network-first** (see SW section), so page updates land on next load without a manual cache bump; bump N mainly for the cached static assets.

## How the app works

### Patterns vs. projects
- **Pattern** = a reusable template (registry entry). **Project** = an instance of a pattern with its own progress. You can have several projects from the same pattern (e.g. two Peacock Tees).
- `PATTERNS` is the template registry; `projects` (persisted as `pt3_projects`) is the user's list of `{ id, patternId, name, created }`.

### Views & routing
Global `view` is `'home'`, `'picker'`, or `'project'`. `render()` dispatches:
- `renderHome()` — the home screen: one card per **project** (name, pattern meta, progress via `projectProgress(proj)`), plus a **＋ New project** button and an empty state.
- `renderPicker()` — pick a pattern to start a new project from.
- `renderProject()` — the tracker for the active project.

Navigation: `openProject(id)` → `'project'`; `goHome()` → `'home'` (back chevron); `startNewProject()` → `'picker'`; `choosePattern(patternId)` creates a project and opens it. `createProject` auto-names ("Peacock Tee", then "Peacock Tee 2"…); `renameProject` (prompt; also tap the project title in the header) and `deleteProject` (confirm; removes its `pt3_proj_<id>_*` keys) manage the list. `renderHeader()` builds the header per view and only rebuilds when the view/project changes (call `resetHeaderKey()` to force a rebuild, e.g. after a rename).

### Pattern registry
`PATTERNS` is an array of pattern objects: `{ id, name, badge, desc, phases, chart }`. The Peacock Tee is `PATTERNS[0]`. To add a pattern, append another entry with its own `phases` (and `chart` array if it has a chart).

`activateProject(id)` looks up the project, then `applyPattern(pattern)` swaps the **active-pattern pointers** — `PHASES`, `CHART_B`, `CHART_TOTAL`, `TOTAL_STEPS` are `let` globals reassigned to the project's pattern, so the rest of the rendering code is pattern-agnostic. It then loads that project's saved progress.

### Phases & steps
Each pattern's `phases` array holds phases in order (Peacock Tee: Materials → Collar → Short rows → Yoke chart → Raglan → Body → Sleeves). A step is `{ id, text, ... }` with optional fields:
- `rows: true` + `target` + `lbl` — shows a row counter.
- `cadence: N` + `cadenceOn` / `cadenceOff` — for "every Nth round" steps: counts the round you're on (1-based, no round 0) and shows a highlighted reminder on rounds where `round % N === 0`, muted otherwise (see `cadenceHintHtml`).
- `bullets: [...]` — renders a bulleted list under the step text.
- `postChart: true` — on a `hasChart` phase, folds the step into the chart card (the "Count to confirm 253 sts" confirm step).

### State & persistence (per project)
Progress is **namespaced per project**. Keys:
- `pt3_projects` — the projects registry: `[{ id, patternId, name, created }]`
- `pt3_proj_<projectId>_state` — `{stepId: boolean}` completed steps
- `pt3_proj_<projectId>_ctrs` — `{stepId: number}` row counters
- `pt3_proj_<projectId>_cur` — current phase index
- `pt3_proj_<projectId>_chartRow` — active yoke-chart row (1–44)
- `pt3_proj_<projectId>_grows` — global row tally (see below)
- `pt3_cellSz` — chart cell-size pref (10–32px, default 16) — **global**, shared across projects
- `pt3_lastProject` — id of the last-opened project

`save()` writes the active project's keys (via `pkey(suffix)` → `pt3_proj_<id>_*`); `loadProjectState()` reads them; `loadGlobal()` loads shared prefs. Two one-time migrations run on startup: `migrateLegacy()` folds the original single-pattern keys (`pt3_state`, …) into `pt3_peacock-tee_*`, then `migrateToProjects()` turns any pattern-namespaced progress into a first project (`pt3_proj_<id>_*`) and writes `pt3_projects`. **Keep the `pt3_` prefix and both migrations** — removing them breaks saved progress.

### Global row tally
A read-only **Rows** display in the header. `globalRows` auto-advances by the real change whenever a section row counter (`changeCount`) or the yoke-chart row (`changeChartRow`) moves; clamped taps (counter already at min/max) don't move it. It's a project-wide total (persisted as `pt3_proj_<id>_grows`), updated in place by `renderGlobalRows()`.

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
- `render()` — dispatcher: home / picker / project view
- `renderHome()` / `renderPicker()` / `renderHeader()` — projects list / pattern chooser / per-view header
- `openProject(id)` / `goHome()` / `startNewProject()` / `choosePattern(id)` — view navigation
- `createProject` / `renameProject` / `deleteProject` — manage the projects list
- `activateProject(id)` / `applyPattern(p)` — open a project: swap active-pattern pointers + load its progress
- `projectProgress(proj)` — done/total/pct for a project's home card (no activation)
- `renderProject()` — header + phase content + tabs + progress + chart wiring
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
