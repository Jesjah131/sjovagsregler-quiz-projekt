// Startskärmens UI: lägesval, certifikatväljare, ämneslista.

function catIconSvg(catId, color) {
  const type = CATEGORY_ICONS[catId] || "compass";
  const path = ICON_PATHS[type] || ICON_PATHS.compass;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

function renderCategoryCheckboxes(cats, subtitleFor) {
  return cats
    .map((c) => {
      const sub = subtitleFor ? subtitleFor(c.id) : "";
      return `
      <label class="cat-item${sub ? " wide" : ""}">
        <input type="checkbox" value="${c.id}">
        <span class="cat-icon" style="background:${c.color}22;border-color:${
        c.color
      }55;">${catIconSvg(c.id, c.color)}</span>
        <span class="cat-item-body">
          <span class="cat-item-name">${c.name}</span>
          ${sub ? `<span class="cat-item-sub">${sub}</span>` : ""}
        </span>
      </label>`;
    })
    .join("");
}

function renderTrainArea() {
  const container = document.getElementById("cat-grid");
  if (trainCert === "fritt") {
    const sjoCats = CATEGORIES.filter((c) => c.group !== "maskin");
    const maskinCats = CATEGORIES.filter((c) => c.group === "maskin");
    container.innerHTML = `
      <p class="cert-note">Ett ämne kan höra till flera certifikat samtidigt — det är helt normalt, examina bygger på samma sjökunskap.</p>
      <div class="cat-group-label">⚓ SJÖKUNSKAP</div>
      <div class="cat-grid">${renderCategoryCheckboxes(sjoCats)}</div>
      <div class="cat-group-label" style="margin-top:18px;">⚙ MASKINTEKNIK</div>
      <p class="lede" style="margin:2px 0 10px;">Separat kursdel — Maskinteknisk grundkurs. Hör inte till något av certifikaten ovan och blandas inte in i Provläge.</p>
      <div class="cat-grid">${renderCategoryCheckboxes(maskinCats)}</div>
    `;
  } else {
    const track = CERT_TRACKS[trainCert];
    // En kategori kan höra till flera delar inom samma certifikat —
    // den listas ändå bara en gång, med alla dess delnamn i undertexten.
    const seen = [];
    track.parts.forEach((part) => {
      COMMON_PARTS[part.ref].cats.forEach((catId) => {
        if (!seen.includes(catId)) seen.push(catId);
      });
    });
    const cats = seen.map((id) => CATEGORIES.find((c) => c.id === id));
    const subtitleFor = (catId) =>
      "Del: " + CATEGORY_CERT_INDEX[catId][trainCert].join(" · ");
    container.innerHTML = `
      <p class="cert-note">${track.note}</p>
      <div class="cat-grid">${renderCategoryCheckboxes(cats, subtitleFor)}</div>
    `;
  }
}

function buildCertRow(rowId, current, onSelect) {
  const row = document.getElementById(rowId);
  row.innerHTML = CERT_OPTIONS.map(
    (o) => `
    <button type="button" class="cert-chip${
      o.id === current ? " active" : ""
    }" onclick="${onSelect}('${o.id}')">${o.label}</button>
  `
  ).join("");
}

function selectTrainCert(id) {
  trainCert = id;
  buildCertRow("train-cert-row", trainCert, "selectTrainCert");
  renderTrainArea();
}
function selectExamCert(id) {
  examCert = id;
  buildCertRow("exam-cert-row", examCert, "selectExamCert");
}

function collectCheckedCategories(containerId) {
  const boxes = Array.from(
    document.querySelectorAll("#" + containerId + " input:checked")
  );
  return Array.from(new Set(boxes.map((b) => b.value)));
}

buildCertRow("train-cert-row", trainCert, "selectTrainCert");
buildCertRow("exam-cert-row", examCert, "selectExamCert");
renderTrainArea();

function selectMode(m) {
  mode = m;
  document
    .getElementById("card-train")
    .classList.toggle("active", m === "train");
  document.getElementById("card-exam").classList.toggle("active", m === "exam");
  document.getElementById("card-calc").classList.toggle("active", m === "calc");
  document
    .getElementById("train-options")
    .classList.toggle("hidden", m !== "train");
  document
    .getElementById("exam-options")
    .classList.toggle("hidden", m !== "exam");
  document
    .getElementById("calc-options")
    .classList.toggle("hidden", m !== "calc");
  document.getElementById("start-btn").disabled = false;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  if (mode === "calc") {
    startCalcSession();
    return;
  }
  if (mode === "train") {
    const checked = collectCheckedCategories("cat-grid");
    selectedCats = checked;
    recallMode = document.getElementById("recall-mode-toggle").checked;
    let pool = checked.length
      ? QUESTIONS.filter((q) => checked.includes(q.cat))
      : QUESTIONS.slice();
    quizQuestions = shuffle(pool);
  } else {
    const maskinIds = CATEGORIES.filter((c) => c.group === "maskin").map(
      (c) => c.id
    );
    let examPool;
    if (examCert === "fritt") {
      examPool = QUESTIONS.filter((q) => !maskinIds.includes(q.cat));
    } else {
      const track = CERT_TRACKS[examCert];
      const certCats = Array.from(
        new Set(track.parts.flatMap((p) => COMMON_PARTS[p.ref].cats))
      );
      examPool = QUESTIONS.filter((q) => certCats.includes(q.cat));
    }
    const n = parseInt(document.getElementById("exam-count").value, 10);
    quizQuestions = shuffle(examPool).slice(0, Math.min(n, examPool.length));
  }
  current = 0;
  answers = [];
  document.getElementById("screen-start").classList.add("hidden");
  document.getElementById("screen-results").classList.add("hidden");
  document.getElementById("screen-quiz").classList.remove("hidden");
  document.getElementById("mode-txt").textContent =
    mode === "train" ? "TRÄNINGSLÄGE" : "PROVLÄGE";
  renderQuestion();
}

function restartSameSettings() {
  document.getElementById("screen-results").classList.add("hidden");
  document.getElementById("screen-calc-results").classList.add("hidden");
  document.getElementById("screen-start").classList.remove("hidden");
}

function quitToStart() {
  document.getElementById("screen-quiz").classList.add("hidden");
  document.getElementById("screen-start").classList.remove("hidden");
}

function quitCalcToStart() {
  document.getElementById("screen-calc").classList.add("hidden");
  document.getElementById("screen-start").classList.remove("hidden");
}

/* =====================================================================
   AUDIO SYNTH — ship whistle & bell
===================================================================== */
