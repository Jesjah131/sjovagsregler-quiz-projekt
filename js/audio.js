// Syntetiserar ljudsignaler med Web Audio API.

function getCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  return audioCtx;
}
function blast(ctx, startTime, duration, freq=220){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, startTime);
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 5.5;
  lfoGain.gain.value = 4;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.35, startTime+0.08);
  gain.gain.setValueAtTime(0.35, startTime+duration-0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime+duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime); lfo.start(startTime);
  osc.stop(startTime+duration+0.02); lfo.stop(startTime+duration+0.02);
}
function bellHit(ctx, startTime){
  [1600, 2350, 3100].forEach((f,i)=>{
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.22/(i+1), startTime+0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime+0.5);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(startTime); osc.stop(startTime+0.55);
  });
}
function playPattern(pattern){
  const ctx = getCtx();
  if(ctx.state === 'suspended') ctx.resume();
  let t = ctx.currentTime + 0.05;
  pattern.forEach(sym=>{
    if(sym==='S'){ blast(ctx,t,0.9); t+=0.9+0.45; }
    else if(sym==='L'){ blast(ctx,t,4.0); t+=4.0+0.6; }
    else if(sym==='BELL'){ for(let i=0;i<8;i++){ bellHit(ctx, t+i*0.18); } t+=8*0.18+0.8; }
    else if(sym==='BELL3'){
      bellHit(ctx,t); bellHit(ctx,t+0.35); bellHit(ctx,t+0.70); t+=0.70+0.5;
      for(let i=0;i<8;i++){ bellHit(ctx, t+i*0.18); } t+=8*0.18+0.5;
      bellHit(ctx,t); bellHit(ctx,t+0.35); bellHit(ctx,t+0.70); t+=0.70+0.5;
    }
  });
}
function patternLabel(pattern){
  const map = {S:'kort', L:'lång', BELL:'hastig klockringning (≈5 s)', BELL3:'3 slag + hastig ringning + 3 slag'};
  return pattern.map(p=>map[p]).join(' – ');
}
function playCurrentSound(){
  const q = quizQuestions[current];
  if(q && q.sound) playPattern(q.sound.pattern);
}

/* =====================================================================
   RENDER QUESTION
===================================================================== */
