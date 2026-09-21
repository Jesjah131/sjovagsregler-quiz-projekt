// Frågevisning, svarshantering, Fundera-läge, resultatsida.
//
// Modell: `current` är index för frågan som visas och `answers[i]` är det
// sparade svaret på fråga i. Finns ett svar för den visade frågan är den
// "besvarad" — i träning/mängdträning låses den och facit visas, i prov kan
// svaret ändras tills man lämnat frågan.

let selectedIdx = null;
let currentOptions = [];   // shuffled [{text, isCorrect}] for the question being shown
const LETTERS = ['A','B','C','D','E','F'];

function isLocked(){
  return mode !== 'exam' && !!answers[current];
}

function renderQuestion(){
  const q = quizQuestions[current];
  const total = quizQuestions.length;
  const saved = answers[current];

  document.getElementById('progress-txt').textContent = `Fråga ${current+1} av ${total}`;
  document.getElementById('progress-fill').style.width = `${((current)/total)*100}%`;
  document.getElementById('progress-boat').style.left = `${((current)/total)*100}%`;
  document.getElementById('q-cat-tag').textContent = catMap[q.cat].name;
  document.getElementById('q-rule-tag').textContent = q.rule;
  document.getElementById('q-text').textContent = q.q;

  const soundBox = document.getElementById('sound-box');
  if(q.sound){
    soundBox.classList.remove('hidden');
    document.getElementById('sound-pattern-label').textContent = patternLabel(q.sound.pattern);
  } else {
    soundBox.classList.add('hidden');
  }

  const symbolBox = document.getElementById('symbol-box');
  if(q.svg){
    symbolBox.innerHTML = q.svg;
    symbolBox.classList.remove('hidden');
  } else {
    symbolBox.innerHTML = '';
    symbolBox.classList.add('hidden');
  }

  // Ny fråga: slumpa alternativens ordning så rätt bokstav varierar.
  // Redan besvarad fråga: visa exakt samma ordning som förra gången.
  if(saved){
    currentOptions = saved.options;
    selectedIdx = saved.sel;
  } else {
    currentOptions = shuffle(q.opts.map((o,i)=>({text:o, isCorrect:i===q.correct})));
    selectedIdx = null;
  }

  const optsEl = document.getElementById('options');
  optsEl.innerHTML = currentOptions.map((o,i)=>`
    <button type="button" class="opt" data-idx="${i}" onclick="selectOption(${i})">
      <span class="letter">${LETTERS[i]}</span>
      <span class="opt-text">${o.text}</span>
    </button>
  `).join('');

  const thinkBox = document.getElementById('think-box');
  const useRecall = (mode === 'train' && recallMode && !saved);
  optsEl.classList.remove('reveal-in');
  thinkBox.classList.toggle('hidden', !useRecall);
  optsEl.classList.toggle('hidden', useRecall);

  const fb = document.getElementById('feedback');
  fb.classList.add('hidden');
  fb.classList.remove('ok','bad');
  fb.innerHTML = '';
  document.getElementById('self-assess').classList.add('hidden');
  document.querySelectorAll('#self-assess .btn').forEach(b=>b.classList.remove('selected'));

  paintOptions();
  if(isLocked()) showFeedback(saved, q);
  updateNav();
  window.scrollTo(0,0);
}

// Färglägger alternativen efter läge: låst = rätt/fel, annars bara valt.
function paintOptions(){
  const locked = isLocked();
  const correctIdx = currentOptions.findIndex(o=>o.isCorrect);
  document.querySelectorAll('.opt').forEach(el=>{
    const idx = parseInt(el.dataset.idx,10);
    el.classList.remove('selected','correct','incorrect');
    if(locked){
      el.disabled = true;
      if(idx === correctIdx) el.classList.add('correct');
      else if(idx === selectedIdx) el.classList.add('incorrect');
    } else {
      el.disabled = false;
      if(idx === selectedIdx) el.classList.add('selected');
    }
  });
}

function showFeedback(a, q){
  if(mode === 'exam') return;
  const fb = document.getElementById('feedback');
  fb.classList.remove('hidden','ok','bad');
  fb.classList.add(a.correct ? 'ok' : 'bad');
  fb.innerHTML = `<b>${a.correct ? 'Rätt.' : 'Fel.'}</b> ${q.exp}`;
  if(mode === 'train' && recallMode){
    document.getElementById('self-assess').classList.remove('hidden');
    document.querySelectorAll('#self-assess .btn').forEach(b=>{
      b.classList.toggle('selected', b.dataset.value === a.selfAssessment);
    });
  }
}

// Primärknappen växlar: Kontrollera (träning) → Nästa. I prov och
// mängdträning är det alltid "Nästa". Bakåtknappen är av på första frågan.
function updateNav(){
  const btn = document.getElementById('primary-btn');
  const last = current === quizQuestions.length - 1;
  const nextLabel = last ? 'Se resultat →' : 'Nästa →';
  const locked = isLocked();
  document.getElementById('back-btn').disabled = current === 0;
  if(locked || mode === 'exam' || mode === 'drill') btn.textContent = nextLabel;
  else btn.textContent = 'Kontrollera';
  btn.disabled = !locked && selectedIdx === null;
}

function revealOptions(){
  document.getElementById('think-box').classList.add('hidden');
  const optsEl = document.getElementById('options');
  optsEl.classList.remove('hidden');
  optsEl.classList.add('reveal-in');
}

function selectOption(i){
  if(isLocked()) return;
  selectedIdx = i;
  paintOptions();
  // Mängdträning: rätta direkt vid tryck, ingen separat "Kontrollera".
  if(mode === 'drill') checkAnswer();
  else updateNav();
}

// Sparar svaret på den visade frågan (behåller ev. självskattning).
function recordAnswer(){
  const q = quizQuestions[current];
  const correctIdx = currentOptions.findIndex(o=>o.isCorrect);
  const prev = answers[current];
  answers[current] = {
    qId:q.id, cat:q.cat, rule:q.rule,
    chosenText: currentOptions[selectedIdx].text,
    correctText: currentOptions[correctIdx].text,
    correct: currentOptions[selectedIdx].isCorrect,
    options: currentOptions, sel: selectedIdx,
    selfAssessment: prev && prev.selfAssessment
  };
}

function checkAnswer(){
  if(selectedIdx === null || isLocked()) return;
  recordAnswer();
  paintOptions();
  showFeedback(answers[current], quizQuestions[current]);
  updateNav();
  const fb = document.getElementById('feedback');
  if(!fb.classList.contains('hidden')) fb.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function recordSelfAssessment(value, btn){
  const a = answers[current];
  if(a) a.selfAssessment = value;
  document.querySelectorAll('#self-assess .btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}

// Höger knapp: Kontrollera eller Nästa beroende på läge/tillstånd.
function primaryAction(){
  if(isLocked()) return nextQuestion();
  if(selectedIdx === null) return;
  if(mode === 'exam'){ recordAnswer(); return nextQuestion(); }
  checkAnswer();
}

function prevQuestion(){
  if(current === 0) return;
  // Provläge: spara ev. valt svar på frågan man lämnar.
  if(mode === 'exam' && selectedIdx !== null) recordAnswer();
  current--;
  renderQuestion();
}

function nextQuestion(){
  current++;
  if(current >= quizQuestions.length){
    showResults();
  } else {
    renderQuestion();
  }
}

/* =====================================================================
   RESULTS
===================================================================== */
function showResults(){
  showOnly('screen-results');

  recordQuizSession({
    mode,
    cert: {train: trainCert, exam: examCert}[mode] || null,
    topic: quizTopic,
    answers
  });

  const totalQ = quizQuestions.length;
  const correctN = answers.filter(a=>a.correct).length;
  document.getElementById('score-num').textContent = `${correctN}/${totalQ}`;
  const pct = Math.round((correctN/totalQ)*100);

  let note;
  if(pct >= 90){ note = 'Utmärkt sjömanskap — du behärskar reglerna väl.'; document.getElementById('score-badge').style.setProperty('--badge-color','var(--stbd-green)'); }
  else if(pct >= 70){ note = 'Bra resultat. Repetera regelavsnitten nedan för att bli helt säker.'; document.getElementById('score-badge').style.setProperty('--badge-color','var(--amber)'); }
  else if(pct >= 50){ note = 'Godkänt underlag, men flera regelområden behöver mer träning.'; document.getElementById('score-badge').style.setProperty('--badge-color','var(--amber)'); }
  else { note = 'Dags att gå igenom reglerna igen från grunden — se förslagen nedan.'; document.getElementById('score-badge').style.setProperty('--badge-color','var(--port-red)'); }
  document.getElementById('score-note').textContent = `${pct}% rätt. ${note}`;

  const assessed = answers.filter(a=>a.selfAssessment);
  const recallStat = document.getElementById('recall-stat');
  if(assessed.length > 0){
    const jaCount = assessed.filter(a=>a.selfAssessment==='ja').length;
    const recallPct = Math.round((jaCount/assessed.length)*100);
    recallStat.textContent = `💡 Fundera-läge: du hade rätt tanke innan du såg alternativen på ${recallPct}% av frågorna (${jaCount}/${assessed.length}).`;
    recallStat.classList.remove('hidden');
  } else {
    recallStat.classList.add('hidden');
  }

  // group by category
  const byCat = {};
  answers.forEach(a=>{
    if(!byCat[a.cat]) byCat[a.cat] = {total:0, correct:0};
    byCat[a.cat].total++;
    if(a.correct) byCat[a.cat].correct++;
  });

  const rows = Object.keys(byCat).map(catId=>{
    const d = byCat[catId];
    const p = Math.round((d.correct/d.total)*100);
    return {catId, p, total:d.total, correct:d.correct};
  }).sort((a,b)=>a.p-b.p);

  const reviewEl = document.getElementById('rule-review');
  const weak = rows.filter(r=>r.p < 100);
  if(weak.length === 0){
    reviewEl.innerHTML = '<p class="empty-note">Inga felaktiga svar registrerade — starkt jobbat!</p>';
  } else {
    reviewEl.innerHTML = weak.map(r=>{
      const c = catMap[r.catId];
      const barColor = r.p < 50 ? 'var(--port-red)' : (r.p < 80 ? 'var(--amber)' : 'var(--stbd-green)');
      return `
        <div class="rule-row">
          <div class="rr-main">
            <span class="rr-name">${c.name}</span>
            <span class="rr-rule">${r.correct}/${r.total} rätt i quizet</span>
          </div>
          <div class="rr-bar-wrap"><div class="rr-bar" style="width:${r.p}%;background:${barColor}"></div></div>
          <span class="rr-pct">${r.p}%</span>
        </div>`;
    }).join('');
  }

  // wrong answers detail (both modes, helpful review)
  const wrongEl = document.getElementById('wrong-review');
  const wrongAnswers = answers.filter(a=>!a.correct);
  if(wrongAnswers.length === 0){
    wrongEl.innerHTML = '';
  } else {
    wrongEl.innerHTML = `<h2 class="section-title">Genomgång av felsvar</h2><p class="lede">Frågor du svarade fel på, med korrekt svar och förklaring.</p>` +
      wrongAnswers.map(a=>{
        const q = QUESTIONS.find(x=>x.id===a.qId);
        return `
          <div class="review-item">
            <p class="review-q">${q.q}</p>
            <div class="feedback bad" style="margin-top:0;">
              <b>Ditt svar:</b> ${a.chosenText}<br>
              <b>Rätt svar:</b> ${a.correctText}<br>
              ${q.exp}
            </div>
          </div>`;
      }).join('');
  }
}

/* =====================================================================
   NAVIGATIONSRÄKNING — beräkningsläge
===================================================================== */
