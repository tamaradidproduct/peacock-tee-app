// ─────────────────────────────────────────────
// FROST FLOWER CARDIGAN — Ngo Quynh, top-down lace cardigan.
//
// Pattern data only. Registers itself into PATTERNS (declared in state.js);
// the active-pattern pointers PHASES / CHART_B / CHART_TOTAL are set from
// this entry by applyPattern() when a project is opened.
//
// This pattern is graded by NEEDLE size, not a fixed stitch count: knit the
// 36-st Frost Flower motif below, block it, and multiply its finished width
// by 8 (the body is 8 motifs around) to get finished chest circumference.
// Go up/down a needle size and re-swatch until that number fits.
//
// Worked FLAT (unlike the Peacock Tee's in-the-round yoke), so this chart
// alternates RS/WS rows — odd rows are RS (read right → left), even rows
// are WS (read left → right). Chart symbols keep one meaning per shape but
// a different instruction depending on which side you're on, exactly like
// the K2/SK tokens already used for Peacock Tee:
//   blank = RS: k   / WS: p        dot = RS: p   / WS: k
//   K2 (right-leaning) = RS: k2tog / WS: p2tog
//   SK (left-leaning)  = RS: ssk   / WS: ssp
// The chart grid itself (this data + its on-screen rendering) is therefore
// accurate as-is. The row-recap strip under the chart is NOT yet flat-aware
// — it always reads right→left and always calls K2/SK "k2tog"/"ssk" — so on
// WS rows its plain-language text will be wrong (mirrored + wrong verb)
// until chart.js gets a per-row RS/WS mode. Rely on the chart grid, not the
// recap text, until that lands.
//
// CHART_FF[0] = row 1 (cast-on row, worked first, displayed at the bottom).
// CHART_FF[35] = row 36 (worked last, displayed at the top).
// Rows 7-18 repeat rows 3-6 (×3); rows 23-34 repeat rows 19-22 (×3);
// rows 35-36 repeat rows 1-2 — all expanded out below to match how the
// chart is actually displayed, same as the Peacock Tee chart.
// ─────────────────────────────────────────────
const FF_MOTIF_CHART = [
  // Row 1
  ['K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K'],
  // Row 2
  ['K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K'],
  // Row 3
  ['K','K','K','K','SK','K','K','K','K','YO','P','P','SK','YO','K','K','SK','YO','K','K','SK','YO','K','K','P','P','YO','K','K','K','K','K2','K','K','K','K'],
  // Row 4
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','YO','K2','K','K','YO','K2','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 5 (= row 3)
  ['K','K','K','K','SK','K','K','K','K','YO','P','P','SK','YO','K','K','SK','YO','K','K','SK','YO','K','K','P','P','YO','K','K','K','K','K2','K','K','K','K'],
  // Row 6 (= row 4)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','YO','K2','K','K','YO','K2','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 7 (= row 3)
  ['K','K','K','K','SK','K','K','K','K','YO','P','P','SK','YO','K','K','SK','YO','K','K','SK','YO','K','K','P','P','YO','K','K','K','K','K2','K','K','K','K'],
  // Row 8 (= row 4)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','YO','K2','K','K','YO','K2','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 9 (= row 3)
  ['K','K','K','K','SK','K','K','K','K','YO','P','P','SK','YO','K','K','SK','YO','K','K','SK','YO','K','K','P','P','YO','K','K','K','K','K2','K','K','K','K'],
  // Row 10 (= row 4)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','YO','K2','K','K','YO','K2','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 11 (= row 3)
  ['K','K','K','K','SK','K','K','K','K','YO','P','P','SK','YO','K','K','SK','YO','K','K','SK','YO','K','K','P','P','YO','K','K','K','K','K2','K','K','K','K'],
  // Row 12 (= row 4)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','YO','K2','K','K','YO','K2','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 13 (= row 3)
  ['K','K','K','K','SK','K','K','K','K','YO','P','P','SK','YO','K','K','SK','YO','K','K','SK','YO','K','K','P','P','YO','K','K','K','K','K2','K','K','K','K'],
  // Row 14 (= row 4)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','YO','K2','K','K','YO','K2','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 15 (= row 3)
  ['K','K','K','K','SK','K','K','K','K','YO','P','P','SK','YO','K','K','SK','YO','K','K','SK','YO','K','K','P','P','YO','K','K','K','K','K2','K','K','K','K'],
  // Row 16 (= row 4)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','YO','K2','K','K','YO','K2','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 17 (= row 3)
  ['K','K','K','K','SK','K','K','K','K','YO','P','P','SK','YO','K','K','SK','YO','K','K','SK','YO','K','K','P','P','YO','K','K','K','K','K2','K','K','K','K'],
  // Row 18 (= row 4)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','YO','K2','K','K','YO','K2','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 19
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','SK','K','SK','K','YO','K'],
  // Row 20
  ['K','K','K','K2','YO','K2','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 21 (= row 19)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','SK','K','SK','K','YO','K'],
  // Row 22 (= row 20)
  ['K','K','K','K2','YO','K2','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 23 (= row 19)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','SK','K','SK','K','YO','K'],
  // Row 24 (= row 20)
  ['K','K','K','K2','YO','K2','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 25 (= row 19)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','SK','K','SK','K','YO','K'],
  // Row 26 (= row 20)
  ['K','K','K','K2','YO','K2','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 27 (= row 19)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','SK','K','SK','K','YO','K'],
  // Row 28 (= row 20)
  ['K','K','K','K2','YO','K2','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 29 (= row 19)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','SK','K','SK','K','YO','K'],
  // Row 30 (= row 20)
  ['K','K','K','K2','YO','K2','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 31 (= row 19)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','SK','K','SK','K','YO','K'],
  // Row 32 (= row 20)
  ['K','K','K','K2','YO','K2','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 33 (= row 19)
  ['K','K','K','SK','K','K','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','SK','K','SK','K','YO','K'],
  // Row 34 (= row 20)
  ['K','K','K','K2','YO','K2','K','K','YO','K','P','P','K','K','YO','K2','K','K','K','K','K','K','YO','SK','P','P','K','YO','K','K','K','K','K2','K','K','K'],
  // Row 35 (= row 1)
  ['K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K'],
  // Row 36 (= row 2)
  ['K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K','K'],
];

const FF_PHASES = [
  {
    id:'ff-mat', name:'Materials', desc:'Before you start',
    steps:[
      {id:'ffm1', text:'This pattern is graded by needle size rather than a fixed stitch count — pick a needle, swatch the motif below, and size up/down until the gauge fits'},
      {id:'ffm2', text:'2 sets of circular needles (sizes TBD from your swatch): one smaller for ribbing, one larger for the body'},
      {id:'ffm3', text:'Stitch markers, scrap yarn for holds'},
    ]
  },
  {
    id:'ff-gauge', name:'Gauge swatch', desc:'Cast on 36 sts · Frost Flower motif · 36 rows, worked flat',
    hasChart: true,
    steps:[
      {id:'ffg1', text:'Block the swatch, measure its finished width, then multiply ×8 for finished chest circumference (plus however much positive ease you want — this pattern runs 4–15 cm of ease over bust measurement)', postChart:true},
    ]
  },
];

PATTERNS.push(
  { id:'frost-flower-cardigan', name:'Frost Flower Cardigan', badge:'Ngo Quynh · lace · graded by needle', desc:'Top-down lace cardigan · 8-motif Frost Flower body', phases: FF_PHASES, chart: FF_MOTIF_CHART,
    notes: [
      { term:'Knit / Purl', def:'Blank square — RS rows: knit. WS rows: purl.' },
      { term:'Purl / Knit', def:'Dot — RS rows: purl. WS rows: knit.', symbol:'<svg width="8" height="8" viewBox="0 0 8 8" style="display:block"><circle cx="4" cy="4" r="3.5" fill="currentColor"/></svg>' },
      { term:'Yarn over', def:'YO — wrap the yarn to create a new stitch and an eyelet.', symbol:'<svg width="9" height="9" viewBox="0 0 9 9" style="display:block"><circle cx="4.5" cy="4.5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' },
      { term:'Right-leaning decrease', def:'RS rows: k2tog. WS rows: p2tog.', symbol:'<svg width="9" height="9" viewBox="0 0 9 9" style="display:block"><polygon points="0,9 9,9 9,0" fill="currentColor"/></svg>' },
      { term:'Left-leaning decrease', def:'RS rows: ssk. WS rows: ssp.', symbol:'<svg width="9" height="9" viewBox="0 0 9 9" style="display:block"><polygon points="0,0 0,9 9,9" fill="currentColor"/></svg>' },
      { term:'', def:'Chart is worked flat: odd (RS) rows read right → left, even (WS) rows read left → right.' },
    ] }
);
