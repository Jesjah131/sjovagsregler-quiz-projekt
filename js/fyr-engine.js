// Fyrkaraktärer: interaktiv tidsaxel-övning. Användaren ritar (klickar/drar)
// sin egen ljus/mörker-sekvens på en 0–25 s-axel och rättas sedan mot den
// riktiga fyrkaraktärens mönster (js/data/fyrkaraktarer.js).
// Kräver att data/fyrkaraktarer.js redan laddats.

const FYR_TOTAL_SECONDS = 25;
const FYR_RESOLUTION = 0.5; // sekunder per ruta
const FYR_CELLS = Math.round(FYR_TOTAL_SECONDS / FYR_RESOLUTION); // 50

let fyrQueue = [];
let fyrCurrent = 0;
let fyrAnswers = [];
let fyrUserCells = [];
let fyrChecked = false;
let fyrPainting = false;
let fyrPaintValue = true;

// Varje ruta får sitt på/av-värde från hur stor andel av rutans tidsintervall
// som är tänt (inte en enda mittpunktssampling) — annars skulle mycket snabba
// mönster (VQ, 0,25 s segment) kunna råka hamna exakt på rutgränserna och
// alltid tolkas som släckta.
function fyrCorrectCells(char) {
  const flow = expandFyrPattern(char, FYR_TOTAL_SECONDS);
  const cells = new Array(FYR_CELLS).fill(false);
  for (let i = 0; i < FYR_CELLS; i++) {
    const cellStart = i * FYR_RESOLUTION;
    const cellEnd = cellStart + FYR_RESOLUTION;
    let onTime = 0;
    for (const s of flow) {
      const overlap = Math.min(cellEnd, s.end) - Math.max(cellStart, s.start);
      if (overlap > 0 && s.on) onTime += overlap;
    }
    cells[i] = onTime >= FYR_RESOLUTION / 2;
  }
  return cells;
}

function fyrRulerHtml() {
  const marks = [0, 5, 10, 15, 20, 25];
  return marks
    .map(
      (s) =>
        `<span class="fyr-ruler-label" style="left:${
          (s / FYR_TOTAL_SECONDS) * 100
        }%">${s}s</span>`
    )
    .join("");
}

function fyrRowHtml(cells, mode) {
  // mode: 'user' (interactive, amber when on) | 'correct' (white-light when on)
  // | 'diff' (green=match, red=mismatch) painted over the user row after rättning.
  return cells
    .map((on, i) => {
      let cls = "fyr-cell";
      if (mode === "user") cls += on ? " on" : " off";
      else if (mode === "correct") cls += on ? " on-correct" : " off";
      return `<span class="${cls}" data-i="${i}"></span>`;
    })
    .join("");
}

function renderFyrUserTrack() {
  document.getElementById("fyr-user-track").innerHTML = fyrRowHtml(
    fyrUserCells,
    "user"
  );
}

function cellIndexFromEvent(trackEl, clientX) {
  const rect = trackEl.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  return Math.min(FYR_CELLS - 1, Math.floor(ratio * FYR_CELLS));
}

function fyrPointerDown(e) {
  if (fyrChecked) return;
  const track = document.getElementById("fyr-user-track");
  track.setPointerCapture(e.pointerId);
  const i = cellIndexFromEvent(track, e.clientX);
  fyrPaintValue = !fyrUserCells[i];
  fyrUserCells[i] = fyrPaintValue;
  fyrPainting = true;
  renderFyrUserTrack();
}
function fyrPointerMove(e) {
  if (!fyrPainting || fyrChecked) return;
  const track = document.getElementById("fyr-user-track");
  const i = cellIndexFromEvent(track, e.clientX);
  if (fyrUserCells[i] !== fyrPaintValue) {
    fyrUserCells[i] = fyrPaintValue;
    renderFyrUserTrack();
  }
}
function fyrPointerUp() {
  fyrPainting = false;
}

function fyrClearTrack() {
  if (fyrChecked) return;
  fyrUserCells = new Array(FYR_CELLS).fill(false);
  renderFyrUserTrack();
}

function renderFyrQuestion() {
  const char = fyrQueue[fyrCurrent];
  const total = fyrQueue.length;
  fyrChecked = false;
  fyrUserCells = new Array(FYR_CELLS).fill(false);

  document.getElementById(
    "fyr-progress-txt"
  ).textContent = `Karaktär ${fyrCurrent + 1} av ${total}`;
  document.getElementById("fyr-progress-fill").style.width = `${Math.max(
    5,
    (fyrCurrent / total) * 100
  )}%`;
  document.getElementById("fyr-progress-boat").style.left = `${Math.max(
    5,
    (fyrCurrent / total) * 100
  )}%`;

  document.getElementById("fyr-label-tag").textContent = char.label;
  document.getElementById("fyr-desc").textContent =
    "Rita fyrkaraktärens ljus/mörker-mönster på tidsaxeln nedan.";

  document.getElementById("fyr-ruler").innerHTML = fyrRulerHtml();
  renderFyrUserTrack();
  document.getElementById("fyr-correct-wrap").classList.add("hidden");
  document.getElementById("fyr-correct-track").innerHTML = "";
  document.getElementById("fyr-verdict").classList.add("hidden");
  document.getElementById("fyr-verdict").innerHTML = "";

  document.getElementById("fyr-check-btn").classList.remove("hidden");
  document.getElementById("fyr-next-btn").classList.add("hidden");
  document.getElementById("fyr-next-btn").textContent =
    fyrCurrent === total - 1 ? "Se resultat →" : "Nästa →";

  const track = document.getElementById("fyr-user-track");
  track.onpointerdown = fyrPointerDown;
  track.onpointermove = fyrPointerMove;
  track.onpointerup = fyrPointerUp;
  track.onpointerleave = fyrPointerUp;

  window.scrollTo(0, 0);
}

function checkFyrAnswer() {
  if (fyrChecked) return;
  fyrChecked = true;
  const char = fyrQueue[fyrCurrent];
  const correct = fyrCorrectCells(char);
  let matches = 0;
  const cellsEl = document.querySelectorAll("#fyr-user-track .fyr-cell");
  cellsEl.forEach((el, i) => {
    const ok = fyrUserCells[i] === correct[i];
    if (ok) matches++;
    el.classList.remove("on", "off");
    el.classList.add(ok ? "match" : "mismatch");
    el.classList.add(fyrUserCells[i] ? "was-on" : "was-off");
  });
  const pct = Math.round((matches / FYR_CELLS) * 100);
  const isCorrect = pct >= 90;
  fyrAnswers.push({ id: char.id, label: char.label, pct, correct: isCorrect });

  document.getElementById("fyr-correct-wrap").classList.remove("hidden");
  document.getElementById("fyr-correct-track").innerHTML = fyrRowHtml(
    correct,
    "correct"
  );

  const verdict = document.getElementById("fyr-verdict");
  verdict.classList.remove("hidden", "ok", "bad");
  verdict.classList.add(isCorrect ? "ok" : "bad");
  verdict.innerHTML = `<div class="cs-verdict">${
    isCorrect ? "Rätt mönster" : "Inte riktigt rätt"
  } — ${pct}% av rutorna matchade facit.</div><div class="cs-step">${
    char.desc
  }</div>`;

  document.getElementById("fyr-check-btn").classList.add("hidden");
  document.getElementById("fyr-next-btn").classList.remove("hidden");
  verdict.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function nextFyrQuestion() {
  fyrCurrent++;
  if (fyrCurrent >= fyrQueue.length) {
    showFyrResults();
  } else {
    renderFyrQuestion();
  }
}

function showFyrResults() {
  showOnly("screen-fyr-results");

  const total = fyrAnswers.length;
  const avgPct = Math.round(
    fyrAnswers.reduce((s, a) => s + a.pct, 0) / total
  );
  const correctN = fyrAnswers.filter((a) => a.correct).length;
  document.getElementById("fyr-score-num").textContent = `${correctN}/${total}`;
  let note;
  if (avgPct >= 90) {
    note = "Utmärkt — du ritar fyrkaraktärerna med hög precision.";
    document
      .getElementById("fyr-score-badge")
      .style.setProperty("--badge-color", "var(--stbd-green)");
  } else if (avgPct >= 70) {
    note = "Bra resultat. Öva extra på de karaktärer som sticker ut nedan.";
    document
      .getElementById("fyr-score-badge")
      .style.setProperty("--badge-color", "var(--amber)");
  } else {
    note = "Öva vidare — rita om karaktärerna med lägst träffsäkerhet nedan.";
    document
      .getElementById("fyr-score-badge")
      .style.setProperty("--badge-color", "var(--port-red)");
  }
  document.getElementById(
    "fyr-score-note"
  ).textContent = `Snitt ${avgPct}% träffsäkerhet. ${note}`;

  const byChar = {};
  fyrAnswers.forEach((a) => {
    if (!byChar[a.id]) byChar[a.id] = { label: a.label, total: 0, sum: 0 };
    byChar[a.id].total++;
    byChar[a.id].sum += a.pct;
  });
  const rows = Object.values(byChar)
    .map((d) => ({ ...d, p: Math.round(d.sum / d.total) }))
    .sort((a, b) => a.p - b.p);

  document.getElementById("fyr-rule-review").innerHTML = rows
    .map((r) => {
      const barColor =
        r.p < 50
          ? "var(--port-red)"
          : r.p < 80
          ? "var(--amber)"
          : "var(--stbd-green)";
      return `
      <div class="rule-row">
        <div>
          <span class="rr-name">${r.label}</span>
          <span class="rr-rule">${r.total} försök</span>
        </div>
        <div class="rr-bar-wrap"><div class="rr-bar" style="width:${r.p}%;background:${barColor}"></div></div>
        <span class="rr-pct">${r.p}%</span>
      </div>`;
    })
    .join("");
}
