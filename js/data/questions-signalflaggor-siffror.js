// Signalflaggor: siffervimplar 0–9, substitut (likhetsstandare) och kod-/
// svarsvimpel. Bilderna ritas som SVG efter NFB-/lärobokens referensbild.
// Rätt svar skrivs först; motorn slumpar alternativens ordning.
// Ingår inte i Förarintygets/Kustskepparintygets kunskapsfordringar (ingen lvl).
const flg = (id, rule, text, right, wrongs, exp, svg) => {
  const q = { id, cat: 'flaggsignaler', rule, q: text, opts: [right, ...wrongs], correct: 0, exp };
  if (svg) q.svg = svg;
  return q;
};

const FLAG_RED = '#C8102E', FLAG_BLUE = '#0033A0', FLAG_YELLOW = '#FFD100',
      FLAG_BLACK = '#111111', FLAG_WHITE = '#FFFFFF';
const flagFrame = '<rect x="2" y="2" width="166" height="126" rx="10" fill="#ede6d3" stroke="#b9ac86" stroke-width="2"/>';
const flagSvg = (inner) =>
  `<svg viewBox="0 0 170 130" style="width:100%;max-width:200px;display:block;">${flagFrame}${inner}</svg>`;
const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;

// Siffervimpel: avsmalnande fyrkant (bred vid stången, smalare mot fri kant).
function numeralSvg(n) {
  const id = 'np' + n;
  const shape = '20,25 150,37 150,93 20,105';
  const art = {
    0: rect(20, 20, 43, 90, FLAG_YELLOW) + rect(63, 20, 44, 90, FLAG_RED) + rect(107, 20, 43, 90, FLAG_YELLOW),
    1: rect(20, 20, 130, 90, FLAG_WHITE) + `<circle cx="62" cy="65" r="15" fill="${FLAG_RED}"/>`,
    2: rect(20, 20, 130, 90, FLAG_BLUE) + `<circle cx="62" cy="65" r="15" fill="${FLAG_WHITE}"/>`,
    3: rect(20, 20, 43, 90, FLAG_RED) + rect(63, 20, 44, 90, FLAG_WHITE) + rect(107, 20, 43, 90, FLAG_BLUE),
    4: rect(20, 20, 130, 90, FLAG_RED) + rect(60, 20, 12, 90, FLAG_WHITE) + rect(20, 59, 130, 12, FLAG_WHITE),
    5: rect(20, 20, 65, 90, FLAG_YELLOW) + rect(85, 20, 65, 90, FLAG_BLUE),
    6: rect(20, 20, 130, 45, FLAG_BLACK) + rect(20, 65, 130, 45, FLAG_WHITE),
    7: rect(20, 20, 130, 45, FLAG_YELLOW) + rect(20, 65, 130, 45, FLAG_RED),
    8: rect(20, 20, 130, 90, FLAG_WHITE) + rect(62, 20, 12, 90, FLAG_RED) + rect(20, 59, 130, 12, FLAG_RED),
    9: rect(20, 20, 65, 45, FLAG_WHITE) + rect(85, 20, 65, 45, FLAG_BLACK) +
       rect(20, 65, 65, 45, FLAG_RED) + rect(85, 65, 65, 45, FLAG_YELLOW),
  }[n];
  return flagSvg(
    `<defs><clipPath id="${id}"><polygon points="${shape}"/></clipPath></defs>` +
    `<g clip-path="url(#${id})">${art}</g>` +
    `<polygon points="${shape}" fill="none" stroke="#777" stroke-width="1"/>`
  );
}

// Substitut: trekantiga likhetsstandare.
function substituteSvg(k) {
  const id = 'sp' + k;
  const shape = '20,25 150,65 20,105';
  const art = {
    1: rect(20, 20, 130, 90, FLAG_BLUE) + `<polygon points="34,44 34,86 112,65" fill="${FLAG_YELLOW}"/>`,
    2: rect(20, 20, 52, 90, FLAG_BLUE) + rect(72, 20, 78, 90, FLAG_WHITE),
    3: rect(20, 20, 130, 90, FLAG_WHITE) + rect(20, 52, 130, 26, FLAG_BLACK),
  }[k];
  return flagSvg(
    `<defs><clipPath id="${id}"><polygon points="${shape}"/></clipPath></defs>` +
    `<g clip-path="url(#${id})">${art}</g>` +
    `<polygon points="${shape}" fill="none" stroke="#777" stroke-width="1"/>`
  );
}

// Kod- och svarsvimpel: långsmal vimpel med lodräta röda/vita ränder.
function codePennantSvg() {
  const shape = '14,42 158,50 158,80 14,88';
  const w = 144 / 5;
  let stripes = '';
  for (let i = 0; i < 5; i++) stripes += rect(14 + i * w, 30, w + 0.5, 70, i % 2 === 0 ? FLAG_RED : FLAG_WHITE);
  return flagSvg(
    `<defs><clipPath id="cp"><polygon points="${shape}"/></clipPath></defs>` +
    `<g clip-path="url(#cp)">${stripes}</g>` +
    `<polygon points="${shape}" fill="none" stroke="#777" stroke-width="1"/>`
  );
}

const NUM_NAMES = ['Nadazero (0)', 'Unaone (1)', 'Bissotwo (2)', 'Terrathree (3)', 'Kartefour (4)',
  'Pantafive (5)', 'Soxisix (6)', 'Setteseven (7)', 'Oktoeight (8)', 'Novenine (9)'];
const NUM_LOOK = [
  'tre lodräta fält: gult, rött, gult',
  'vit botten med en röd cirkel',
  'blå botten med en vit cirkel',
  'tre lodräta fält: rött, vitt, blått',
  'röd botten med ett vitt kryss',
  'lodrätt delad i gult (vid stången) och blått',
  'delad vågrätt: svart över vitt',
  'delad vågrätt: gult över rött',
  'vit botten med ett rött kryss',
  'fyra rutor: vitt och svart överst, rött och gult underst',
];
const NUM_WORD = ['Nadazero', 'Unaone', 'Bissotwo', 'Terrathree', 'Kartefour',
  'Pantafive', 'Soxisix', 'Setteseven', 'Oktoeight', 'Novenine'];

const QUESTIONS_SIGNALFLAGGOR_SIFFROR = [
  // ---- Siffervimplar: bild → namn och siffra (id 600–609) ----
  ...NUM_NAMES.map((name, i) =>
    flg(600 + i, 'Signalflaggor - utseende',
      'Vilken sifferflagga (fonetiskt namn och siffra) visas på bilden?',
      name, [1, 3, 5, 7, 9].map((d) => NUM_NAMES[(i + d) % 10]),
      `Siffervimpel ${name} kännetecknas av: ${NUM_LOOK[i]}.`,
      numeralSvg(i))),

  // ---- Substitut och kod-/svarsvimpel: bild (id 610–613) ----
  flg(610, 'Signalflaggor - utseende', 'Vilken flagga visas på bilden?',
    '1:a substitutet', ['2:a substitutet', '3:a substitutet', 'Kod- och svarsvimpel', 'Unaone (1)', 'Pantafive (5)'],
    '1:a substitutet (likhetsstandaret) är en trekantig vimpel: blå med en gul trekant i mitten.', substituteSvg(1)),
  flg(611, 'Signalflaggor - utseende', 'Vilken flagga visas på bilden?',
    '2:a substitutet', ['1:a substitutet', '3:a substitutet', 'Kod- och svarsvimpel', 'Bissotwo (2)', 'Kartefour (4)'],
    '2:a substitutet är en trekantig vimpel: blå vid stången och vit mot spetsen.', substituteSvg(2)),
  flg(612, 'Signalflaggor - utseende', 'Vilken flagga visas på bilden?',
    '3:e substitutet', ['1:a substitutet', '2:a substitutet', 'Kod- och svarsvimpel', 'Soxisix (6)', 'Nadazero (0)'],
    '3:e substitutet är en trekantig vit vimpel med ett svart band längs mitten.', substituteSvg(3)),
  flg(613, 'Signalflaggor - utseende', 'Vilken flagga visas på bilden?',
    'Kod- och svarsvimpel', ['1:a substitutet', '2:a substitutet', '3:e substitutet', 'Terrathree (3)', 'Nadazero (0)'],
    'Kod- och svarsvimpeln har lodräta röda och vita ränder och används både som kodflagga och som svarsvimpel.',
    codePennantSvg()),

  // ---- Sifferorden 1–4 och 6–9 (0 och 5 finns sedan tidigare) (id 614–621) ----
  ...[1, 2, 3, 4, 6, 7, 8, 9].map((n, k) =>
    flg(614 + k, 'Numeriska vimplar',
      `Vilket fonetiskt ord representerar siffran ${n} i signalflaggsystemets numeriska vimplar?`,
      NUM_WORD[n], [1, 2, 3, 4, 5].map((d) => NUM_WORD[(n + d) % 10 === n ? (n + 6) % 10 : (n + d) % 10]),
      `Siffran ${n} representeras av det fonetiska ordet "${NUM_WORD[n]}".`)),

  // ---- Betydelse och användning (id 622–625) ----
  flg(622, 'Hjälpflaggor', 'Har en siffervimpel någon egen betydelse när den hissas ensam?',
    'Nej — den betyder bara sin siffra, inte någon enskild signal',
    ['Ja, alla siffror har varsin fast nödbetydelse', 'Ja, den betyder alltid "jag behöver lots"', 'Ja, den anger fartygets nationalitet', 'Ja, den betyder "jag har fara ombord"'],
    'Siffervimplarna ingår i flerställiga signaler som siffror. Utöver siffran betyder de ingenting som enskild signal.'),
  flg(623, 'Hjälpflaggor', 'Hur många substitut (likhetsstandare) finns det i signalflaggsystemet?',
    'Tre', ['Ett', 'Två', 'Fem', 'Tio'],
    'Det finns tre substitut, 1:a, 2:a och 3:e. De behövs eftersom ett fartyg normalt bara har ett set signalflaggor.'),
  flg(624, 'Hjälpflaggor', 'Vilken flagga ersätter 1:a substitutet i en flerställig signal?',
    'Den översta signalflaggan', ['Den understa flaggan', 'Alltid siffran 1', 'Kod- och svarsvimpeln', 'Ingen flagga — det används bara som nödsignal'],
    '1:a substitutet upprepar den översta signalflaggan, 2:a substitutet den näst översta och så vidare.'),
  flg(625, 'Hjälpflaggor', 'Vad ersätter 2:a substitutet i en flerställig signal?',
    'Den näst översta signalflaggan', ['Den översta signalflaggan', 'Den understa flaggan', 'Bokstaven B', 'Alla siffror'],
    '2:a substitutet upprepar den näst översta flaggan (3:e den tredje från toppen).'),
];
