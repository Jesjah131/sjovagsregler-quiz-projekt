// Navigationsräkning: uppgiftsgenerering, rättning, resultat.

const CALC_TYPES = {
  speed:   {name:'Fart, distans & tid',              color:'#4a90a4'},
  course:  {name:'Kompasskurskorrigering',           color:'#7a5c9e'},
  bearing: {name:'Fyrpejling (dubbla vinkeln vid bogen)', color:'#d9822b'},
};

let calcQuestions = [];
let calcCurrent = 0;
let calcAnswers = [];
let calcChecked = false;

function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function randChoice(arr){ return arr[randInt(0,arr.length-1)]; }
function roundTo(x,d){ const f=Math.pow(10,d); return Math.round(x*f)/f; }
function mod360(x){ return ((x%360)+360)%360; }
function pad3(n){ return String(Math.round(n)).padStart(3,'0'); }
function formatHours(h){
  const totalMin = Math.round(h*60);
  const hh = Math.floor(totalMin/60);
  const mm = totalMin%60;
  if(hh>0 && mm>0) return hh+' h '+mm+' min';
  if(hh>0) return hh+' h';
  return mm+' min';
}
function signLabel(v){
  if(v===0) return '0° (ingen missvisning/deviation)';
  return v>0 ? (v+'° Ost') : (Math.abs(v)+'° Väst');
}

function mod1440(x){ return ((x%1440)+1440)%1440; }
function formatClock(totalMin){
  const m = mod1440(Math.round(totalMin));
  const hh = Math.floor(m/60), mm = m%60;
  return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
}
function randClockMinutes(){
  const hh = randInt(0,23);
  const mm = randChoice([0,15,30,45]);
  return hh*60+mm;
}
function parseClockInput(str){
  const s = str.trim();
  let hh, mm;
  if(s.includes(':')){
    const parts = s.split(':');
    hh = parseInt(parts[0],10); mm = parseInt(parts[1],10);
  } else {
    const digits = s.replace(/\D/g,'');
    if(digits.length===3){ hh = parseInt(digits.slice(0,1),10); mm = parseInt(digits.slice(1),10); }
    else if(digits.length===4){ hh = parseInt(digits.slice(0,2),10); mm = parseInt(digits.slice(2),10); }
    else return NaN;
  }
  if(isNaN(hh)||isNaN(mm)||mm>59||mm<0||hh<0||hh>23) return NaN;
  return hh*60+mm;
}

function genSpeedProblem(){
  const variant = randChoice(['V','D','T','ETA','DEP','AVG']);

  if(variant==='V'){
    const V = randInt(4,24);
    const T = randChoice([0.5,0.75,1,1.25,1.5,1.75,2,2.5,3,3.5,4]);
    const D = roundTo(V*T,1);
    return {
      calcType:'speed',
      prompt:`Ett fartyg tillryggalägger ${D} nautiska mil på ${formatHours(T)}. Vilken fart, i knop, håller fartyget?`,
      given:[['Distans', D+' nm'],['Tid', formatHours(T)]],
      unit:'knop', correct:V, tolerance:0.15,
      solution:['Fart = Distans ÷ Tid', `Fart = ${D} nm ÷ ${T} h = ${V} knop`]
    };
  }
  if(variant==='D'){
    const V = randInt(4,24);
    const T = randChoice([0.5,0.75,1,1.25,1.5,1.75,2,2.5,3,3.5,4]);
    const D = roundTo(V*T,1);
    return {
      calcType:'speed',
      prompt:`Ett fartyg håller farten ${V} knop under ${formatHours(T)}. Hur många nautiska mil tillryggaläggs?`,
      given:[['Fart', V+' knop'],['Tid', formatHours(T)]],
      unit:'nm', correct:D, tolerance:0.2,
      solution:['Distans = Fart × Tid', `Distans = ${V} knop × ${T} h = ${D} nm`]
    };
  }
  if(variant==='T'){
    const V = randInt(4,24);
    const T = randChoice([0.5,0.75,1,1.25,1.5,1.75,2,2.5,3,3.5,4]);
    const D = roundTo(V*T,1);
    return {
      calcType:'speed',
      prompt:`Ett fartyg går ${D} nautiska mil med farten ${V} knop. Hur lång tid tar det, i decimaltimmar (t.ex. 1.5 för 1 h 30 min)?`,
      given:[['Distans', D+' nm'],['Fart', V+' knop']],
      unit:'timmar (decimalt)', correct:T, tolerance:0.06,
      solution:['Tid = Distans ÷ Fart', `Tid = ${D} nm ÷ ${V} knop = ${T} h (${formatHours(T)})`]
    };
  }
  if(variant==='ETA'){
    const V = randInt(5,20);
    const D = randInt(6,60);
    const durMin = D/V*60;
    const depMin = randClockMinutes();
    const etaMin = depMin + durMin;
    return {
      calcType:'speed',
      answerFormat:'clock',
      prompt:`Du avgår kl ${formatClock(depMin)} och ska tillryggalägga ${D} nautiska mil med farten ${V} knop. Vid vilken klockslag (HH:MM) beräknas fartyget anlända, om fart och kurs hålls konstant?`,
      given:[['Avgångstid', formatClock(depMin)],['Distans', D+' nm'],['Fart', V+' knop']],
      unit:'ankomsttid (HH:MM)', correct:etaMin, tolerance:3,
      solution:[
        'Tid som krävs = Distans ÷ Fart',
        `Tid = ${D} nm ÷ ${V} knop = ${roundTo(durMin/60,2)} h ≈ ${Math.round(durMin)} min`,
        `Ankomsttid = Avgångstid + Tid = ${formatClock(depMin)} + ${Math.round(durMin)} min = ${formatClock(etaMin)}`
      ]
    };
  }
  if(variant==='DEP'){
    const V = randInt(5,20);
    const D = randInt(6,60);
    const durMin = D/V*60;
    const etaMin = randClockMinutes();
    const depMin = mod1440(etaMin - durMin);
    return {
      calcType:'speed',
      answerFormat:'clock',
      prompt:`Du ska anlända kl ${formatClock(etaMin)} efter att ha tillryggalagt ${D} nautiska mil med farten ${V} knop. Vid vilken klockslag (HH:MM) måste fartyget senast avgå?`,
      given:[['Önskad ankomsttid', formatClock(etaMin)],['Distans', D+' nm'],['Fart', V+' knop']],
      unit:'avgångstid (HH:MM)', correct:depMin, tolerance:3,
      solution:[
        'Tid som krävs = Distans ÷ Fart',
        `Tid = ${D} nm ÷ ${V} knop = ${roundTo(durMin/60,2)} h ≈ ${Math.round(durMin)} min`,
        `Avgångstid = Ankomsttid − Tid = ${formatClock(etaMin)} − ${Math.round(durMin)} min = ${formatClock(depMin)}`
      ]
    };
  }
  // AVG — genomsnittsfart över två sträckor med olika fart (klassisk fälla: man kan INTE bara medelvärdesbilda farterna)
  const D1 = randInt(6,40), V1 = randInt(5,20);
  const D2 = randInt(6,40), V2 = randInt(5,20);
  const T1 = D1/V1, T2 = D2/V2;
  const totalD = D1+D2, totalT = T1+T2;
  const avgV = roundTo(totalD/totalT,1);
  return {
    calcType:'speed',
    prompt:`Ett fartyg går första sträckan, ${D1} nautiska mil, med farten ${V1} knop, och den andra sträckan, ${D2} nautiska mil, med farten ${V2} knop. Vilken är fartygets genomsnittsfart (i knop) för HELA resan? (Obs: det är inte bara medelvärdet av de två farterna.)`,
    given:[['Sträcka 1', D1+' nm vid '+V1+' knop'],['Sträcka 2', D2+' nm vid '+V2+' knop']],
    unit:'knop', correct:avgV, tolerance:0.2,
    solution:[
      'Genomsnittsfart = Total distans ÷ Total tid (INTE medelvärdet av farterna)',
      `Tid för sträcka 1 = ${D1} ÷ ${V1} = ${roundTo(T1,2)} h`,
      `Tid för sträcka 2 = ${D2} ÷ ${V2} = ${roundTo(T2,2)} h`,
      `Total distans = ${D1} + ${D2} = ${totalD} nm`,
      `Total tid = ${roundTo(T1,2)} + ${roundTo(T2,2)} = ${roundTo(totalT,2)} h`,
      `Genomsnittsfart = ${totalD} ÷ ${roundTo(totalT,2)} ≈ ${avgV} knop`
    ]
  };
}

function genCourseProblem(){
  const trueCourse = randInt(0,71)*5;
  const compassCourse0 = randInt(0,71)*5;
  const varDeg = randInt(-8,8);
  const devDeg = randInt(-6,6);
  const toCompass = Math.random() < 0.5;
  if(toCompass){
    const magCourse = mod360(trueCourse - varDeg);
    const compassCourse = mod360(magCourse - devDeg);
    return {
      calcType:'course',
      prompt:`Du har stuckit ut en rättvisande kurs på ${pad3(trueCourse)}° i sjökortet. Missvisningen i området är ${signLabel(varDeg)} och kompassens deviation på ungefärlig kurs är ${signLabel(devDeg)}. Vilken kompasskurs ska du styra (0–359°)?`,
      given:[['Rättvisande kurs', pad3(trueCourse)+'°'],['Missvisning', signLabel(varDeg)],['Deviation', signLabel(devDeg)]],
      unit:'° kompasskurs', correct:compassCourse, tolerance:0.6,
      solution:[
        `Rättvisande kurs: ${pad3(trueCourse)}°`,
        `− Missvisning (${signLabel(varDeg)}): ${varDeg>=0?'−':'+'}${Math.abs(varDeg)}°`,
        `= Missvisande (magnetisk) kurs: ${pad3(magCourse)}°`,
        `− Deviation (${signLabel(devDeg)}): ${devDeg>=0?'−':'+'}${Math.abs(devDeg)}°`,
        `= Kompasskurs att styra: ${pad3(compassCourse)}°`
      ]
    };
  }
  const magCourse = mod360(compassCourse0 + devDeg);
  const trueCourseCalc = mod360(magCourse + varDeg);
  return {
    calcType:'course',
    prompt:`Du styr kompasskurs ${pad3(compassCourse0)}°. Deviation på denna kurs är ${signLabel(devDeg)} och missvisningen i området är ${signLabel(varDeg)}. Vilken rättvisande kurs går fartyget (bortsett från ström och avdrift), 0–359°?`,
    given:[['Kompasskurs', pad3(compassCourse0)+'°'],['Deviation', signLabel(devDeg)],['Missvisning', signLabel(varDeg)]],
    unit:'° rättvisande kurs', correct:trueCourseCalc, tolerance:0.6,
    solution:[
      `Kompasskurs: ${pad3(compassCourse0)}°`,
      `+ Deviation (${signLabel(devDeg)}): ${devDeg>=0?'+':'−'}${Math.abs(devDeg)}°`,
      `= Missvisande (magnetisk) kurs: ${pad3(magCourse)}°`,
      `+ Missvisning (${signLabel(varDeg)}): ${varDeg>=0?'+':'−'}${Math.abs(varDeg)}°`,
      `= Rättvisande kurs: ${pad3(trueCourseCalc)}°`
    ]
  };
}

function genBearingProblem(){
  const alpha = randChoice([20,25,30,35,40,45,50,55,60]);
  const extra = randChoice([10,15,20,25,30,35,40]);
  let beta = Math.min(90, alpha+extra);
  if(beta<=alpha) beta = Math.min(90, alpha+10);
  const run = randChoice([2,3,4,5,6,8,10,12,15]);
  const rad = Math.PI/180;
  const sinA = Math.sin(alpha*rad), sinDiff = Math.sin((beta-alpha)*rad);
  const distOff = run * sinA / sinDiff;
  const correct = roundTo(distOff,1);
  const solution = [
    'Avstånd vid andra pejlingen = Gången distans × sin(första bäringen) ÷ sin(andra bäringen − första bäringen)',
    `= ${run} × sin(${alpha}°) ÷ sin(${beta-alpha}°)`,
    `= ${run} × ${roundTo(sinA,3)} ÷ ${roundTo(sinDiff,3)}`,
    `≈ ${correct} nautiska mil`
  ];
  if(beta === alpha*2){
    solution.push(`Eftersom den andra bäringen (${beta}°) är exakt dubbelt så stor som den första (${alpha}°) — "dubbla vinkeln vid bogen" — gäller specialregeln att avståndet till fyren vid andra pejlingen alltid är lika med den gångna distansen: ${run} nm.`);
  }
  return {
    calcType:'bearing',
    prompt:`Du seglar med konstant kurs och fart förbi en fyr. Fyren pejlas första gången i ${alpha}° för om tvärs (relativ bäring från fören). Efter att fartyget gått ${run} nautiska mil på samma kurs pejlas fyren igen, nu i ${beta}° för om tvärs. Hur långt, i nautiska mil, är fartyget från fyren vid den andra pejlingen?`,
    given:[['Första bäring (för om tvärs)', alpha+'°'],['Andra bäring (för om tvärs)', beta+'°'],['Gången distans', run+' nm']],
    unit:'nm', correct:correct, tolerance:0.3,
    solution
  };
}

function generateCalcProblem(types){
  const t = randChoice(types);
  if(t==='speed') return genSpeedProblem();
  if(t==='course') return genCourseProblem();
  return genBearingProblem();
}

// typeId: en uppgiftstyp ('speed' | 'course' | 'bearing') eller 'all' för blandat.
function startCalcSession(typeId){
  const types = typeId === 'all' ? Object.keys(CALC_TYPES) : [typeId];
  mode = 'calc';
  quizTopic = typeId;
  lastRun = () => startCalcSession(typeId);
  calcQuestions = [];
  for(let i=0;i<calcCount;i++) calcQuestions.push(generateCalcProblem(types));
  calcCurrent = 0;
  calcAnswers = [];
  showOnly('screen-calc');
  renderCalcQuestion();
}

function renderCalcQuestion(){
  calcChecked = false;
  const q = calcQuestions[calcCurrent];
  const total = calcQuestions.length;
  document.getElementById('calc-progress-txt').textContent = `Uppgift ${calcCurrent+1} av ${total}`;
  document.getElementById('calc-progress-fill').style.width = `${(calcCurrent/total)*100}%`;
  document.getElementById('calc-progress-boat').style.left = `${(calcCurrent/total)*100}%`;
  document.getElementById('calc-type-tag').textContent = CALC_TYPES[q.calcType].name;
  document.getElementById('calc-q-text').textContent = q.prompt;
  document.getElementById('calc-given').innerHTML = q.given.map(([label,val])=>`
    <div class="calc-given-row"><span class="cg-label">${label}</span><span class="cg-value">${val}</span></div>
  `).join('');
  document.getElementById('calc-unit').textContent = q.unit;
  const input = document.getElementById('calc-input');
  if(q.answerFormat==='clock'){
    input.type = 'text';
    input.setAttribute('inputmode','numeric');
    input.placeholder = 'HH:MM';
  } else {
    input.type = 'number';
    input.removeAttribute('inputmode');
    input.placeholder = 'Ditt svar';
  }
  input.value = '';
  input.disabled = false;
  input.focus();
  const sol = document.getElementById('calc-solution');
  sol.classList.add('hidden');
  sol.classList.remove('ok','bad');
  sol.innerHTML = '';
  document.getElementById('calc-check-btn').classList.remove('hidden');
  document.getElementById('calc-next-btn').classList.add('hidden');
  document.getElementById('calc-next-btn').textContent = (calcCurrent===total-1) ? 'Se resultat →' : 'Nästa →';
  window.scrollTo(0,0);
}

function checkCalcAnswer(){
  if(calcChecked) return;
  const q = calcQuestions[calcCurrent];
  const input = document.getElementById('calc-input');
  const isClock = q.answerFormat === 'clock';
  const val = isClock ? parseClockInput(input.value) : parseFloat(input.value.replace(',','.'));
  if(isNaN(val)){
    input.style.outline = '1px solid rgba(200,39,44,0.6)';
    setTimeout(()=>input.style.outline='',400);
    return;
  }
  calcChecked = true;
  input.disabled = true;
  const diff = isClock ? Math.min(Math.abs(val-q.correct), 1440-Math.abs(val-q.correct)) : Math.abs(val - q.correct);
  const isCorrect = diff <= q.tolerance;
  calcAnswers.push({calcType:q.calcType, correct:isCorrect});

  const displayCorrect = isClock ? formatClock(q.correct) : `${q.correct} ${q.unit}`;
  const displayGiven = isClock ? formatClock(val) : `${val}`;

  const sol = document.getElementById('calc-solution');
  sol.classList.remove('hidden','ok','bad');
  sol.classList.add(isCorrect ? 'ok' : 'bad');
  const verdict = isCorrect
    ? `<div class="cs-verdict">Rätt. Rätt svar: ${displayCorrect}</div>`
    : `<div class="cs-verdict">Fel. Ditt svar: ${displayGiven} — Rätt svar: ${displayCorrect}</div>`;
  sol.innerHTML = verdict + q.solution.map(s=>`<div class="cs-step">${s}</div>`).join('');

  document.getElementById('calc-check-btn').classList.add('hidden');
  document.getElementById('calc-next-btn').classList.remove('hidden');
  input.blur(); // fäll ihop tangentbordet så facit syns
  sol.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function nextCalcQuestion(){
  calcCurrent++;
  if(calcCurrent >= calcQuestions.length){
    showCalcResults();
  } else {
    renderCalcQuestion();
  }
}

function showCalcResults(){
  showOnly('screen-calc-results');

  recordCalcSession({ answers: calcAnswers });

  const total = calcAnswers.length;
  const correctN = calcAnswers.filter(a=>a.correct).length;
  document.getElementById('calc-score-num').textContent = `${correctN}/${total}`;
  const pct = Math.round((correctN/total)*100);
  let note;
  if(pct>=90){ note = 'Utmärkt — du behärskar dessa uträkningar väl.'; document.getElementById('calc-score-badge').style.setProperty('--badge-color','var(--stbd-green)'); }
  else if(pct>=70){ note = 'Bra resultat. Repetera uppgiftstyperna nedan med lägst andel rätt.'; document.getElementById('calc-score-badge').style.setProperty('--badge-color','var(--amber)'); }
  else { note = 'Öva vidare — särskilt på de uppgiftstyper som sticker ut nedan.'; document.getElementById('calc-score-badge').style.setProperty('--badge-color','var(--port-red)'); }
  document.getElementById('calc-score-note').textContent = `${pct}% rätt. ${note}`;

  const byType = {};
  calcAnswers.forEach(a=>{
    if(!byType[a.calcType]) byType[a.calcType] = {total:0, correct:0};
    byType[a.calcType].total++;
    if(a.correct) byType[a.calcType].correct++;
  });
  const rows = Object.keys(byType).map(t=>{
    const d = byType[t];
    const p = Math.round((d.correct/d.total)*100);
    return {t, p, total:d.total, correct:d.correct};
  }).sort((a,b)=>a.p-b.p);

  document.getElementById('calc-rule-review').innerHTML = rows.map(r=>{
    const barColor = r.p<50 ? 'var(--port-red)' : (r.p<80 ? 'var(--amber)' : 'var(--stbd-green)');
    return `
      <div class="rule-row">
        <div>
          <span class="rr-name">${CALC_TYPES[r.t].name}</span>
          <span class="rr-rule">${r.correct}/${r.total} rätt</span>
        </div>
        <div class="rr-bar-wrap"><div class="rr-bar" style="width:${r.p}%;background:${barColor}"></div></div>
        <span class="rr-pct">${r.p}%</span>
      </div>`;
  }).join('');
}
