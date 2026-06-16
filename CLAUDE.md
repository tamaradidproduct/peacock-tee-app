# Peacock Tee Tracker — Project Handoff

## What this is
A single-page PWA knitting pattern tracker for the Peacock Tee (Size S, 97 cm). Built for mobile use while knitting. Deployed at: **https://peacock-tee-small.netlify.app**

## File structure
```
peacock-tee-deploy/
  index.html      ← entire app (HTML + CSS + JS, single file)
  sw.js           ← service worker (caching + update prompt)
  manifest.json   ← PWA manifest
  icon-192.png    ← app icon
  icon-512.png    ← app icon
  CLAUDE.md       ← this file
```

## Deployment
- Hosted on Netlify. Goal: connect this folder to a GitHub repo so Netlify auto-deploys on push.
- Current manual workflow: drag `peacock-tee-deploy` folder to Netlify drop zone.
- Service worker cache is named `peacock-tee-vN` — bump N in `sw.js` whenever deploying a breaking change to force cache refresh.

## How the app works

### Phases
7 knitting phases in order: Materials → Collar → Short rows → Yoke chart → Raglan → Body → Sleeves. Stored in the `PHASES` array in `index.html`.

### State
Persisted to `localStorage` with these keys:
- `pt3_state` — `{stepId: boolean}` map of completed steps
- `pt3_ctrs` — `{stepId: number}` row counters for steps with `rows: true`
- `pt3_cur` — current phase index
- `pt3_chartRow` — current active row in the yoke chart (1–44)
- `pt3_cellSz` — user's chart cell size preference (10–32px, default 16)

### Chart
`CHART_B` is a 44-row × 23-stitch array. Each cell is one of: `K` knit, `P` purl, `YO` yarn over, `K2` k2tog, `SK` SKPO, `M1` make one, `E` no-stitch. Rows are displayed top-to-bottom visually (row 44 at top = worked last), but knitted bottom-to-top (row 1 first).

Cell size is controlled by the CSS variable `--cell-sz` on `:root`. The `A−` / `A+` buttons in the chart header call `resizeChart(delta)` which updates the variable and re-scrolls.

### Service worker update flow
When a new version is deployed:
1. Browser fetches updated `sw.js` in the background
2. New SW installs but waits (no `skipWaiting` in install handler)
3. App detects `reg.waiting` → shows dark toast: "Update available · Update now"
4. User taps → app sends `{ type: 'SKIP_WAITING' }` to the waiting SW
5. SW calls `skipWaiting()` → `controllerchange` fires → `window.location.reload()`

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
- `render()` — full re-render of tabs + phase content + progress bar
- `renderPhase()` — builds current phase HTML including chart if `hasChart: true`
- `buildChartTracker()` — builds the chart viewport, zoom bar, legend, and row footer
- `changeChartRow(delta)` — moves current row ±1, targeted DOM update (no full re-render)
- `resizeChart(delta)` — changes `--cell-sz` by delta px, re-scrolls chart
- `scrollChartToCurrent()` — scrolls chart viewport to center the active row
- `smartScrollChart(rowEl, delta)` — smooth scroll that only kicks in at viewport midpoint
- `save()` / `load()` — read/write all state to localStorage
- `showUpdateBanner(worker)` / `applyUpdate()` — PWA update prompt

## Nav buttons
Fixed at bottom of screen (`position: fixed; bottom: 0`). First phase (Materials) shows only "Next →" at full width. All other phases show "← Back" + "Next →" side by side. Body has `padding-bottom: 82px` to clear the fixed nav.

## Typography
- Headings (`Peacock Tee`, phase names): Georgia serif
- Everything else: system sans-serif (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`)

## What NOT to do
- Don't suggest "Add to Home Screen" on Android Chrome — owner can't do this and doesn't want it mentioned
- Don't add the stats bar back (Steps Done / Phase / Complete) — removed intentionally per design update
- Don't change `pt3_` localStorage key prefix — would break saved progress for existing users

## Figma design reference
The layout follows a Figma design at:
`https://www.figma.com/design/mSct8t0TpsyYJad4teKfwl/Stitch-ease-knitting?node-id=3328-12548`

Key measurements from the design:
- Header: 44px, Progress bar: 4px, Tabs: 44px → content starts at y=92
- Chart viewport height: 380px
- Row tracker footer: centered large number, "Current row" label above, "Total rows 44" below, 48×48 circular ± buttons
- Nav: fixed bottom, full-width on first phase, 50/50 split on all others
