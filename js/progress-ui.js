// Rendering av "Mina framsteg" — visar sparad statistik och historik.

function calcTypeName(catKey) {
  const t = catKey.slice('calc:'.length);
  return (CALC_TYPES[t] || { name: t }).name;
}

function categoryDisplayName(catKey) {
  if (catKey.startsWith('calc:')) return calcTypeName(catKey);
  const c = catMap[catKey];
  return c ? c.name : catKey;
}

function formatSessionDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('sv-SE') + ' ' + d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

function sessionLabel(s) {
  if (s.type === 'calc') return 'Navigationsräkning';
  if (s.mode === 'train') return 'Träningsläge';
  return 'Provläge';
}

function showProgressScreen() {
  renderProgressScreen();
  document.getElementById('screen-start').classList.add('hidden');
  document.getElementById('screen-progress').classList.remove('hidden');
}

function hideProgressScreen() {
  document.getElementById('screen-progress').classList.add('hidden');
  document.getElementById('screen-start').classList.remove('hidden');
}

function resetProgress() {
  if (!confirm('Vill du rensa all sparad framstegsstatistik? Detta går inte att ångra.')) return;
  clearProgress();
  renderProgressScreen();
}

function renderProgressScreen() {
  const data = loadProgress();
  const empty = document.getElementById('progress-empty');
  const content = document.getElementById('progress-content');

  if (data.sessions.length === 0) {
    empty.classList.remove('hidden');
    content.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  content.classList.remove('hidden');

  const totalAnswered = data.sessions.reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = data.sessions.reduce((sum, s) => sum + s.correct, 0);
  const overallPct = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  document.getElementById('progress-stats-grid').innerHTML = `
    <div class="progress-stat">
      <span class="progress-stat-num">${data.sessions.length}</span>
      <span class="progress-stat-label">GENOMFÖRDA QUIZ</span>
    </div>
    <div class="progress-stat">
      <span class="progress-stat-num">${totalAnswered}</span>
      <span class="progress-stat-label">BESVARADE FRÅGOR</span>
    </div>
    <div class="progress-stat">
      <span class="progress-stat-num">${overallPct}%</span>
      <span class="progress-stat-label">RÄTT TOTALT</span>
    </div>
  `;

  const rows = Object.keys(data.categoryStats)
    .map((key) => {
      const s = data.categoryStats[key];
      const p = Math.round((s.correct / s.total) * 100);
      return { key, p, total: s.total, correct: s.correct };
    })
    .sort((a, b) => a.p - b.p);

  document.getElementById('progress-cat-review').innerHTML = rows
    .map((r) => {
      const barColor = r.p < 50 ? 'var(--port-red)' : r.p < 80 ? 'var(--amber)' : 'var(--stbd-green)';
      return `
      <div class="rule-row">
        <div>
          <span class="rr-name">${categoryDisplayName(r.key)}</span>
          <span class="rr-rule">${r.correct}/${r.total} rätt totalt</span>
        </div>
        <div class="rr-bar-wrap"><div class="rr-bar" style="width:${r.p}%;background:${barColor}"></div></div>
        <span class="rr-pct">${r.p}%</span>
      </div>`;
    })
    .join('');

  const recent = data.sessions.slice().reverse().slice(0, 20);
  document.getElementById('progress-history').innerHTML = recent
    .map((s) => {
      const p = s.total ? Math.round((s.correct / s.total) * 100) : 0;
      return `
      <div class="progress-history-row">
        <span class="ph-date">${formatSessionDate(s.date)}</span>
        <span class="ph-mode">${sessionLabel(s)}</span>
        <span class="ph-score">${s.correct}/${s.total} (${p}%)</span>
      </div>`;
    })
    .join('');
}
