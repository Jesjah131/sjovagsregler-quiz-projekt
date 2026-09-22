// Startskärmens UI: lägesval, certifikatväljare och tryckbara ämneskort.
// Ett tryck på ett ämne startar övningen direkt — inget flerval, ingen
// separat "Starta"-knapp (utom i Provläget, som saknar ämnesval).

let examCount = 20;
let drillCount = 20;
let calcCount = 10;
let quizTopic = null; // ämnes-/områdes-id för pågående körning (för statistik)
let lastRun = null; // startar om samma körning ("Kör igen")

function catIconSvg(catId, color) {
  const type = CATEGORY_ICONS[catId] || "compass";
  const path = ICON_PATHS[type] || ICON_PATHS.compass;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

function iconBadge(catId, color) {
  return `<span class="cat-icon" style="background:${color}22;border-color:${color}55;">${catIconSvg(
    catId,
    color
  )}</span>`;
}

// Ett tryckbart ämneskort. Hela kortet är en knapp.
function topicCard({ icon, name, sub, onclick, disabled }) {
  return `
    <button type="button" class="topic-card"${
      disabled ? " disabled" : ""
    } onclick="${onclick}">
      ${icon}
      <span class="topic-body">
        <span class="topic-name">${name}</span>
        ${sub ? `<span class="topic-sub">${sub}</span>` : ""}
      </span>
      <span class="topic-chev" aria-hidden="true">›</span>
    </button>`;
}

const questionsIn = (pool, catId) => pool.filter((q) => q.cat === catId).length;

function renderTrainArea() {
  const container = document.getElementById("cat-grid");
  const note = document.getElementById("train-cert-note");
  const pool = certPool(trainCert);
  const allCard = topicCard({
    icon: iconBadge("sjokort", "#e0a437"),
    name: "Alla ämnen — blandat",
    sub: `${pool.length} frågor`,
    onclick: "startTrain('all')",
  });
  const cardFor = (c, subtitle) =>
    topicCard({
      icon: iconBadge(c.id, c.color),
      name: c.name,
      sub: subtitle,
      onclick: `startTrain('${c.id}')`,
      disabled: questionsIn(pool, c.id) === 0,
    });

  if (trainCert === "fritt") {
    note.textContent =
      "Ett ämne kan höra till flera certifikat — examina bygger på samma sjökunskap.";
    const sjoCats = CATEGORIES.filter((c) => c.group !== "maskin");
    const maskinCats = CATEGORIES.filter((c) => c.group === "maskin");
    const sub = (c) => `${questionsIn(pool, c.id)} frågor`;
    container.innerHTML = `
      ${allCard}
      <div class="cat-group-label">⚓ SJÖKUNSKAP</div>
      ${sjoCats.map((c) => cardFor(c, sub(c))).join("")}
      <div class="cat-group-label">⚙ MASKINTEKNIK</div>
      <p class="lede">Separat kursdel — hör inte till något certifikat och blandas inte in i Provläge.</p>
      ${maskinCats.map((c) => cardFor(c, sub(c))).join("")}
    `;
    return;
  }

  const track = CERT_TRACKS[trainCert];
  note.textContent = track.note;
  // Bara ämnen som har frågor på certifikatets nivå visas, i den ordning
  // certifikatets delar anger. Ämnen utanför delarna hamnar sist.
  const present = new Set(pool.map((q) => q.cat));
  const seen = [];
  track.parts.forEach((part) => {
    COMMON_PARTS[part.ref].cats.forEach((catId) => {
      if (present.has(catId) && !seen.includes(catId)) seen.push(catId);
    });
  });
  present.forEach((catId) => {
    if (!seen.includes(catId)) seen.push(catId);
  });
  const subtitleFor = (catId) => {
    const parts = (CATEGORY_CERT_INDEX[catId] || {})[trainCert];
    return (
      (parts ? parts.join(" · ") + " · " : "") +
      questionsIn(pool, catId) +
      " frågor"
    );
  };
  container.innerHTML =
    allCard +
    seen
      .map((id) => cardFor(CATEGORIES.find((c) => c.id === id), subtitleFor(id)))
      .join("");
}

function renderDrillGroups() {
  const all = topicCard({
    icon: iconBadge("flaggsignaler", "#e0a437"),
    name: "Blanda allt",
    sub: `${DRILL_GROUPS.reduce((n, g) => n + g.ids.length, 0)} frågor`,
    onclick: "startDrill('all')",
  });
  document.getElementById("drill-grid").innerHTML =
    all +
    DRILL_GROUPS.map((g) =>
      topicCard({
        icon: `<span class="swatch" style="background:${g.color}"></span>`,
        name: g.name,
        sub: `${g.ids.length} frågor`,
        onclick: `startDrill('${g.id}')`,
      })
    ).join("");
}

// Anropas först när läget öppnas — CALC_TYPES laddas efter denna fil.
function renderCalcTypes() {
  const types = Object.entries(CALC_TYPES);
  document.getElementById("calc-type-grid").innerHTML =
    topicCard({
      icon: `<span class="swatch" style="background:#e0a437"></span>`,
      name: "Blandat",
      sub: "Alla uppgiftstyper",
      onclick: "startCalcSession('all')",
    }) +
    types
      .map(([id, t]) =>
        topicCard({
          icon: `<span class="swatch" style="background:${t.color}"></span>`,
          name: t.name,
          onclick: `startCalcSession('${id}')`,
        })
      )
      .join("");
}

/* ---------- chip-rader (certifikat, antal) ---------- */
function buildChips(rowId, options, current, handler) {
  document.getElementById(rowId).innerHTML = options
    .map(
      (o) => `
    <button type="button" class="cert-chip${
      String(o.id) === String(current) ? " active" : ""
    }" onclick="${handler}('${o.id}')">${o.label}</button>`
    )
    .join("");
}
const countOptions = (values) => values.map((v) => ({ id: v, label: v }));

function selectTrainCert(id) {
  trainCert = id;
  buildChips("train-cert-row", CERT_OPTIONS, trainCert, "selectTrainCert");
  renderTrainArea();
}
function selectExamCert(id) {
  examCert = id;
  buildChips("exam-cert-row", CERT_OPTIONS, examCert, "selectExamCert");
}
function setExamCount(v) {
  examCount = parseInt(v, 10);
  buildChips("exam-count-row", countOptions([10, 20, 30, 40]), examCount, "setExamCount");
}
function setDrillCount(v) {
  drillCount = parseInt(v, 10);
  buildChips("drill-count-row", countOptions([10, 20, 40, 60]), drillCount, "setDrillCount");
}
function setCalcCount(v) {
  calcCount = parseInt(v, 10);
  buildChips("calc-count-row", countOptions([5, 10, 20, 30]), calcCount, "setCalcCount");
}

buildChips("train-cert-row", CERT_OPTIONS, trainCert, "selectTrainCert");
buildChips("exam-cert-row", CERT_OPTIONS, examCert, "selectExamCert");
setExamCount(examCount);
setDrillCount(drillCount);
setCalcCount(calcCount);
renderTrainArea();
renderDrillGroups();

/* ---------- lägesval ---------- */
function selectMode(m) {
  mode = m;
  ["train", "exam", "calc", "drill"].forEach((id) => {
    document.getElementById("card-" + id).classList.toggle("active", m === id);
    document.getElementById(id + "-options").classList.toggle("hidden", m !== id);
  });
  if (m === "calc") renderCalcTypes();
  // Visa alternativen direkt under lägeskorten (viktigt på små skärmar).
  requestAnimationFrame(() =>
    document
      .getElementById(m + "-options")
      .scrollIntoView({ behavior: "smooth", block: "start" })
  );
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- start av övningar ---------- */
const MODE_LABELS = {
  train: "TRÄNINGSLÄGE",
  exam: "PROVLÄGE",
  drill: "MÄNGDTRÄNING",
};

function showOnly(screenId) {
  [
    "screen-start",
    "screen-quiz",
    "screen-results",
    "screen-calc",
    "screen-calc-results",
    "screen-progress",
  ].forEach((id) =>
    document.getElementById(id).classList.toggle("hidden", id !== screenId)
  );
  window.scrollTo(0, 0);
}

function beginQuiz(questions) {
  quizQuestions = questions;
  current = 0;
  answers = [];
  showOnly("screen-quiz");
  document.getElementById("mode-txt").textContent = MODE_LABELS[mode];
  renderQuestion();
}

function startTrain(topicId) {
  const pool = certPool(trainCert);
  const qs = topicId === "all" ? pool : pool.filter((q) => q.cat === topicId);
  if (!qs.length) return;
  mode = "train";
  quizTopic = topicId;
  recallMode = document.getElementById("recall-mode-toggle").checked;
  lastRun = () => startTrain(topicId);
  beginQuiz(shuffle(qs));
}

function startExam() {
  const maskinIds = CATEGORIES.filter((c) => c.group === "maskin").map(
    (c) => c.id
  );
  const examPool =
    examCert === "fritt"
      ? QUESTIONS.filter((q) => !maskinIds.includes(q.cat))
      : certPool(examCert);
  mode = "exam";
  quizTopic = null;
  lastRun = startExam;
  beginQuiz(shuffle(examPool).slice(0, Math.min(examCount, examPool.length)));
}

function startDrill(groupId) {
  const groupIds =
    groupId === "all" ? DRILL_GROUPS.map((g) => g.id) : [groupId];
  const pool = drillQuestionsFor(groupIds);
  if (!pool.length) return;
  mode = "drill";
  quizTopic = groupId;
  lastRun = () => startDrill(groupId);
  beginQuiz(shuffle(pool).slice(0, Math.min(drillCount, pool.length)));
}

/* ---------- navigation mellan skärmar ---------- */
function rerunLast() {
  if (lastRun) lastRun();
}

function backToStart() {
  showOnly("screen-start");
}

function confirmQuit(hasProgress) {
  return (
    !hasProgress ||
    window.confirm("Avsluta övningen? Dina svar hittills sparas inte.")
  );
}

function quitToStart() {
  if (confirmQuit(answers.length > 0)) backToStart();
}

function quitCalcToStart() {
  if (confirmQuit(calcAnswers.length > 0)) backToStart();
}
