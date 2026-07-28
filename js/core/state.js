// ─────────────────────────────────────────────
// APP STATE + ACTIVE-PATTERN POINTERS
//
// Loaded first. Classic script, not a module — everything here is a global,
// which is what lets the inline onclick handlers in the generated HTML keep
// working without any window.* plumbing.
//
// Nothing in this file runs at load beyond the declarations below, so it is
// safe to load ahead of the pattern data and the render code it refers to;
// function bodies resolve their identifiers when called, not when defined.
// ─────────────────────────────────────────────

// Progress + view state for the currently open project.
let TOTAL_STEPS = 0;
let cur = 0;
let phaseNavOpen = false;
let state = {}, ctrs = {}, chartCurrentRow = 1, cellSz = 16, globalRows = 0;
let activePatternId = null;
let activeProjectId = null;
let projects = [];                 // [{ id, patternId, name, created }]
let view = 'home';                 // 'home' | 'picker' | 'project'

function patternById(id) { return PATTERNS.find(p => p.id === id) || null; }
function activePattern() { return patternById(activePatternId); }
function activeProject() { return projects.find(p => p.id === activeProjectId) || null; }

// Swap the active-pattern data pointers (PHASES / CHART_B / …) + reset step
// defaults. No load — the caller loads the project's progress.
function applyPattern(p) {
  PHASES = p.phases;
  CHART_B = p.chart || [];
  CHART_TOTAL = CHART_B.length;
  TOTAL_STEPS = PHASES.reduce((a, ph) => a + ph.steps.length, 0);
  cur = 0; chartCurrentRow = 1; globalRows = 0;
  state = {}; ctrs = {};
  PHASES.forEach(ph => ph.steps.forEach(s => { state[s.id] = false; if (s.rows) ctrs[s.id] = 0; }));
}

// Open a project: apply its pattern's data, then load that project's progress.
function activateProject(projectId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return false;
  // No fallback pattern on purpose. Opening a project under the *wrong*
  // pattern is worse than not opening it: loadProjectState() would
  // Object.assign this project's saved step-ids onto a different pattern's
  // step set, silently corrupting both.
  const pat = patternById(proj.patternId);
  if (!pat) { console.warn('No pattern "' + proj.patternId + '" for project "' + proj.name + '"'); return false; }
  activeProjectId = proj.id;
  activePatternId = pat.id;
  applyPattern(pat);
  loadProjectState();
  return true;
}
