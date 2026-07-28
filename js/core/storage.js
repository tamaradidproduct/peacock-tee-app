// ─────────────────────────────────────────────
// PERSISTENCE — everything that touches localStorage.
//
// Keys, all under the pt3_ prefix (see CLAUDE.md; do not rename — the
// migrations below depend on the exact strings):
//   pt3_projects                  the registry: [{ id, patternId, name, created }]
//   pt3_proj_<id>_state           {stepId: bool}   completed steps
//   pt3_proj_<id>_ctrs            {stepId: int}    row counters
//   pt3_proj_<id>_cur             current phase index
//   pt3_proj_<id>_chartRow        active yoke-chart row
//   pt3_proj_<id>_grows           project-wide row tally
//   pt3_cellSz                    chart cell size — GLOBAL, shared across projects
// ─────────────────────────────────────────────

// ── Projects registry (pt3_projects) ──
function loadProjects() {
  try { projects = JSON.parse(localStorage.getItem('pt3_projects') || '[]') || []; } catch(e) { projects = []; }
}
function saveProjects() {
  try { localStorage.setItem('pt3_projects', JSON.stringify(projects)); } catch(e) {}
}
function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// Auto-name: pattern name, then "<name> 2", "<name> 3"… for repeats.
function autoProjectName(pattern) {
  const n = projects.filter(p => p.patternId === pattern.id).length;
  return n === 0 ? pattern.name : pattern.name + ' ' + (n + 1);
}

function createProject(patternId) {
  const pat = patternById(patternId);
  if (!pat) { console.warn('No pattern "' + patternId + '"'); return null; }
  const proj = { id: newId(), patternId: pat.id, name: autoProjectName(pat), created: Date.now() };
  projects.push(proj);
  saveProjects();
  return proj;
}

function renameProject(projectId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;
  const name = prompt('Rename project', proj.name);
  if (name === null) return;
  const trimmed = name.trim();
  if (trimmed) { proj.name = trimmed; saveProjects(); resetHeaderKey(); render(); }
}

function deleteProject(projectId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;
  if (!confirm('Delete "' + proj.name + '"? This removes its progress.')) return;
  ['state','ctrs','cur','chartRow','grows'].forEach(k => { try { localStorage.removeItem('pt3_proj_' + projectId + '_' + k); } catch(e){} });
  projects = projects.filter(p => p.id !== projectId);
  saveProjects();
  if (activeProjectId === projectId) { activeProjectId = null; view = 'home'; }
  render();
}
