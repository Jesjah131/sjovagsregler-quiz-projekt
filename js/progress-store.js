// Sparar quiz-resultat i localStorage så att framsteg finns kvar mellan sessioner.

const PROGRESS_KEY = 'sjovagsregler.progress.v1';

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { sessions: [], categoryStats: {} };
    const data = JSON.parse(raw);
    return {
      sessions: Array.isArray(data.sessions) ? data.sessions : [],
      categoryStats: data.categoryStats || {},
    };
  } catch (e) {
    return { sessions: [], categoryStats: {} };
  }
}

function saveProgress(data) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    // Privat läge / full lagring — misslyckas tyst, quizet funkar ändå.
  }
}

// Sparar en avslutad quiz-session (träning eller prov) samt uppdaterar
// ackumulerad statistik per ämneskategori.
function recordQuizSession({ mode, cert, answers }) {
  const data = loadProgress();
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;

  data.sessions.push({
    type: 'quiz',
    mode,
    cert: cert || null,
    total,
    correct,
    date: new Date().toISOString(),
  });

  answers.forEach((a) => {
    const s = (data.categoryStats[a.cat] ||= { total: 0, correct: 0 });
    s.total++;
    if (a.correct) s.correct++;
  });

  trimSessions(data);
  saveProgress(data);
}

function recordCalcSession({ answers }) {
  const data = loadProgress();
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;

  data.sessions.push({
    type: 'calc',
    total,
    correct,
    date: new Date().toISOString(),
  });

  answers.forEach((a) => {
    const key = 'calc:' + a.calcType;
    const s = (data.categoryStats[key] ||= { total: 0, correct: 0 });
    s.total++;
    if (a.correct) s.correct++;
  });

  trimSessions(data);
  saveProgress(data);
}

function trimSessions(data) {
  const MAX_SESSIONS = 200;
  if (data.sessions.length > MAX_SESSIONS) {
    data.sessions = data.sessions.slice(data.sessions.length - MAX_SESSIONS);
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (e) {}
}
