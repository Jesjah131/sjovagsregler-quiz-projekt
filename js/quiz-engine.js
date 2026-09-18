// Frågevisning, svarshantering, Fundera-läge, resultatsida.

let checked_ = false;
let selectedIdx = null;
let currentOptions = [];   // shuffled [{text, isCorrect}] for the question being shown
const LETTERS = ['A','B','C','D','E','F'];

function renderQuestion(){
  checked_ = false;
  selectedIdx = null;
  const q = quizQuestions[current];
  const total = quizQuestions.length;

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

  // Build a freshly-shuffled option order every time the question is shown,
  // so the correct answer's letter is randomized rather than clustering on one letter.
  currentOptions = shuffle(q.opts.map((o,i)=>({text:o, isCorrect:i===q.correct})));

  const optsEl = document.getElementById('options');
  optsEl.innerHTML = currentOptions.map((o,i)=>`
    <div class="opt" data-idx="${i}" onclick="selectOption(${i})">
      <span class="letter">${LETTERS[i]}</span>
      <span class="opt-text">${o.text}</span>
    </div>
  `).join('');

  const thinkBox = document.getElementById('think-box');
  const useRecall = (mode === 'train' && recallMode);
  optsEl.classList.remove('reveal-in');
  if(useRecall){
    thinkBox.classList.remove('hidden');
    optsEl.classList.add('hidden');
    document.getElementById('check-btn').classList.add('hidden');
  } else {
    thinkBox.classList.add('hidden');
    optsEl.classList.remove('hidden');
  }

  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('feedback').classList.remove('ok','bad');
  document.getElementById('feedback').innerHTML = '';
  document.getElementById('self-assess').classList.add('hidden');
  document.querySelectorAll('#self-assess .btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('check-btn').disabled = false;
  if(!useRecall) document.getElementById('check-btn').classList.remove('hidden');
  document.getElementById('next-btn').disabled = true;
  document.getElementById('next-btn').textContent = (current === total-1) ? 'Se resultat →' : 'Nästa →';
}

function revealOptions(){
  document.getElementById('think-box').classList.add('hidden');
  const optsEl = document.getElementById('options');
  optsEl.classList.remove('hidden');
  optsEl.classList.add('reveal-in');
  document.getElementById('check-btn').classList.remove('hidden');
}

function selectOption(i){
  if(checked_) return;
  selectedIdx = i;
  document.querySelectorAll('.opt').forEach(el=>{
    el.classList.toggle('selected', parseInt(el.dataset.idx,10)===i);
  });
}

function checkAnswer(){
  const q = quizQuestions[current];
  if(selectedIdx === null){
    // In exam mode allow skipping without selection isn't ideal; nudge user
    document.querySelectorAll('.opt').forEach(el=>el.style.outline='1px solid rgba(200,39,44,0.5)');
    setTimeout(()=>document.querySelectorAll('.opt').forEach(el=>el.style.outline=''),400);
    return;
  }
  checked_ = true;
  const isCorrect = currentOptions[selectedIdx].isCorrect;
  const correctDisplayIdx = currentOptions.findIndex(o=>o.isCorrect);
  answers.push({
    qId:q.id, cat:q.cat, rule:q.rule,
    chosenText: currentOptions[selectedIdx].text,
    correctText: currentOptions[correctDisplayIdx].text,
    correct:isCorrect
  });

  document.querySelectorAll('.opt').forEach(el=>{
    const idx = parseInt(el.dataset.idx,10);
    el.onclick = null;
    if(idx === correctDisplayIdx) el.classList.add('correct');
    else if(idx === selectedIdx) el.classList.add('incorrect');
  });

  if(mode === 'train'){
    const fb = document.getElementById('feedback');
    fb.classList.remove('hidden','ok','bad');
    fb.classList.add(isCorrect ? 'ok' : 'bad');
    fb.innerHTML = `<b>${isCorrect ? 'Rätt.' : 'Fel.'}</b> ${q.exp}`;
    if(recallMode){
      document.getElementById('self-assess').classList.remove('hidden');
    }
  }

  document.getElementById('check-btn').disabled = true;
  document.getElementById('next-btn').disabled = false;
}

function recordSelfAssessment(value, btn){
  const last = answers[answers.length-1];
  if(last) last.selfAssessment = value;
  document.querySelectorAll('#self-assess .btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
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
  document.getElementById('screen-quiz').classList.add('hidden');
  document.getElementById('screen-results').classList.remove('hidden');

  recordQuizSession({ mode, cert: mode === 'train' ? trainCert : examCert, answers });

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
          <div>
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
