// ─────────────────────────────────────────────
// TATTED HALF-SQUARE TRIANGLE — be-stitched.com, ≈ 2⅜ in, size 40 thread.
//
// A non-knitting pattern: each ring (R) or chain (Ch) is one step/checkbox.
// Has no chart, which is why chart handling everywhere must tolerate an
// empty CHART_B (CHART_TOTAL === 0).
//
// Pattern data only. Registers itself into PATTERNS (declared in state.js).
// ─────────────────────────────────────────────
const TATTING_PHASES = [
  {
    id:'tat-mat', name:'Materials', desc:'Before you start',
    steps:[
      {id:'tm1', text:'Tatting thread — Lizbeth size 40 (e.g. 679 Lime Green + 183 Orange Crush)'},
      {id:'tm2', text:'2 tatting shuttles (or tatting needles)'},
      {id:'tm3', text:'Crochet hook for joins'},
    ]
  },
  {
    id:'tat-t1', name:'Triangle 1', desc:'15 rings + 10 chains', countable:true,
    steps:[
      {id:'t1r1',  text:'R1: (3ds p) 5 times, 3ds, close, turn'},
      {id:'t1c1',  text:'Ch1: 3ds p (2ds p) 4 times, 3ds, turn'},
      {id:'t1r2',  text:'R2: (3ds p) 2 times, 3ds j to last p of previous R, (3ds p) 4 times, 3ds, close, do not turn'},
      {id:'t1r3',  text:'R3: (3ds p) 9 times, 3ds, close, turn'},
      {id:'t1c2',  text:'Ch2: 3ds j to last p of previous Ch, (2ds p) 9 times, 3ds, do not turn'},
      {id:'t1r4',  text:'R4: (3ds p) 5 times, 3ds, close, do not turn'},
      {id:'t1r5',  text:'R5: (3ds p) 7 times, 3ds, close, turn'},
      {id:'t1c3',  text:'Ch3: 3ds p (2ds p) 3 times, 3ds, j to 7th p of R3, 2ds p 2ds p 3ds, turn'},
      {id:'t1r6',  text:'R6: (3ds p) 2 times, 3ds j to 5th p of previous R, (3ds p) 4 times, 3ds, close, turn'},
      {id:'t1c4',  text:'Ch4: 3ds p (2ds p) 6 times, 3ds, turn'},
      {id:'t1r7',  text:'R7: (3ds p) 2 times, 3ds j to 5th p of previous R, (3ds p) 4 times, 3ds, close, turn'},
      {id:'t1c5',  text:'Ch5: 3ds p (2ds p) 2 times, 2ds, do not turn'},
      {id:'t1r8',  text:'R8: (2ds p) 5 times, 2ds, close, do not turn'},
      {id:'t1c6',  text:'Ch6: (2ds p) 3 times, 3ds, turn'},
      {id:'t1r9',  text:'R9: (3ds p) 2 times, 3ds j to 5th p of R7, (3ds p) 4 times, 3ds, close, turn'},
      {id:'t1c7',  text:'Ch7: 3ds p (2ds p) 6 times, 3ds, turn'},
      {id:'t1r10', text:'R10: (3ds p) 2 times, 3ds j to 5th p of previous R, (3ds p) 4 times, 3ds, close, turn'},
      {id:'t1c8',  text:'Ch8: 3ds p (2ds p) 6 times, 3ds, turn'},
      {id:'t1r11', text:'R11: (3ds p) 2 times, 3ds j to 5th p of previous R, 3ds p 3ds j to 3rd p of R5, (3ds p) 2 times, 3ds, close, do not turn'},
      {id:'t1r12', text:'R12: 3ds p 3ds j to 4th p of R4, (3ds p) 3 times, 3ds, close, do not turn'},
      {id:'t1c9',  text:'Ch9: 3ds p (2ds p) 9 times, 3ds, turn'},
      {id:'t1r13', text:'R13: (3ds p) 2 times, 3ds j to 3rd p of Ch8, (3ds p) 6 times, 3ds, close, do not turn'},
      {id:'t1r14', text:'R14: (3ds p) 7 times, 3ds, close, turn'},
      {id:'t1c10', text:'Ch10: 3ds j to last p of previous Ch, (2ds p) 4 times, 3ds, turn'},
      {id:'t1r15', text:'R15: 3ds j to 5th p of previous R, (3ds p) 4 times, 3ds, close'},
    ]
  },
  {
    id:'tat-t2', name:'Triangle 2', desc:'Mirrors Triangle 1, joined to it', countable:true,
    steps:[
      {id:'t2r1',  text:'R1: 3ds j to last p of corresponding R on Triangle1, (3ds p) 4 times, 3ds, close, turn'},
      {id:'t2c1',  text:'Ch1: 3ds j to first p of corresponding Ch on Triangle1, (2ds p) 4 times, 3ds, turn'},
      {id:'t2r2',  text:'R2: (3ds p) 2 times, 3ds j to last p of previous R, (3ds p) 4 times, 3ds, close, do not turn'},
      {id:'t2r3',  text:'R3: (3ds p) 9 times, 3ds, close, turn'},
      {id:'t2c2',  text:'Ch2: 3ds j to last p of previous Ch, (2ds p) 4 times, 2ds j to 6th p of corresponding Ch on Triangle1, (2ds p) 4 times, 3ds, do not turn'},
      {id:'t2r4',  text:'R4: 3ds p 3ds j to 4th p of corresponding R on Triangle1, (3ds p) 3 times, 3ds, close, do not turn'},
      {id:'t2r5',  text:'R5: (3ds p) 7 times, 3ds, close, turn'},
      {id:'t2c3',  text:'Ch3: 3ds p (2ds p) 3 times, 3ds, j to 7th p of R3, 2ds p 2ds p 3ds, turn'},
      {id:'t2r6',  text:'R6: (3ds p) 2 times, 3ds j to 5th p of previous R, (3ds p) 4 times, 3ds, close, turn'},
      {id:'t2c4',  text:'Ch4: 3ds p (2ds p) 6 times, 3ds, turn'},
      {id:'t2r7',  text:'R7: (3ds p) 2 times, 3ds j to 5th p of previous R, (3ds p) 4 times, 3ds, close, turn'},
      {id:'t2c5',  text:'Ch5: 3ds p (2ds p) 2 times, 2ds, do not turn'},
      {id:'t2r8',  text:'R8: (2ds p) 5 times, 2ds, close, do not turn'},
      {id:'t2c6',  text:'Ch6: (2ds p) 3 times, 3ds, turn'},
      {id:'t2r9',  text:'R9: (3ds p) 2 times, 3ds j to 5th p of R7, (3ds p) 4 times, 3ds, close, turn'},
      {id:'t2c7',  text:'Ch7: 3ds p (2ds p) 6 times, 3ds, turn'},
      {id:'t2r10', text:'R10: (3ds p) 2 times, 3ds j to 5th p of previous R, (3ds p) 4 times, 3ds, close, turn'},
      {id:'t2c8',  text:'Ch8: 3ds p (2ds p) 6 times, 3ds, turn'},
      {id:'t2r11', text:'R11: (3ds p) 2 times, 3ds j to 5th p of previous R, 3ds p 3ds j to 3rd p of R5, (3ds p) 2 times, 3ds, close, do not turn'},
      {id:'t2r12', text:'R12: 3ds p 3ds j to 4th p of R4, 3ds p 3ds j to 2nd p of corresponding R on Triangle1, 3ds p 3ds, close, do not turn'},
      {id:'t2c9',  text:'Ch9: 3ds p (2ds p) 3 times, 2ds j to 6th p of corresponding Ch on Triangle1, (2ds p) 5 times, 3ds, turn'},
      {id:'t2r13', text:'R13: (3ds p) 2 times, 3ds j to 3rd p of Ch8, (3ds p) 6 times, 3ds, close, do not turn'},
      {id:'t2r14', text:'R14: (3ds p) 7 times, 3ds, close, turn'},
      {id:'t2c10', text:'Ch10: 3ds j to last p of previous Ch, (2ds p) 3 times, 2ds j to adjacent p of corresponding Ch on Triangle1, 3ds, turn'},
      {id:'t2r15', text:'R15: 3ds j to 5th p of previous R, (3ds p) 3 times, 3ds j to first p of corresponding R on Triangle1, 3ds, close'},
    ]
  },
  {
    id:'tat-fin', name:'Finishing', desc:'Complete the motif',
    steps:[
      {id:'tf1', text:'Cut and tie the thread ends'},
      {id:'tf2', text:'Hide / weave in ends; block if desired'},
    ]
  },
];

PATTERNS.push(
  { id:'tatted-triangle', name:'Tatted Half-Square Triangle', badge:'≈ 2⅜ in · size 40', desc:'Tatting · two interlocking triangles', phases: TATTING_PHASES,
    notes: [
      { term:'R', def:'Ring' },
      { term:'Ch', def:'Chain' },
      { term:'ds', def:'Double stitch' },
      { term:'p', def:'Picot' },
      { term:'j', def:'Join' },
      { term:'', def:'Each ring or chain in the step list is one step.' },
    ] }
);
