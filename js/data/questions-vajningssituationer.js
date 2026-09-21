// Väjningssituationer: skisser av två fartyg (ovanifrån) som visar möte,
// skärande kurs, upphinnande och segel-/motorbåtssituationer. Segelbåtar
// markeras med ett svart streck (bom/segel sett ovanifrån). Hör till kategorin
// 'ansvar' (Stand-on / give-way, Regel 13–18) och ingår i mängdträning som en
// egen bildbaserad grupp, se drill-groups.js.

const VS_W = 260,
  VS_H = 190;
const VS_BLUE = "#3f6f9c";

function vsFrame() {
  return `<rect x="1" y="1" width="${VS_W - 2}" height="${VS_H - 2}" rx="10" fill="#ffffff" stroke="#9fb8c4" stroke-width="1.5"/>`;
}

// Fartygssymbol: pekar "upp" (mot skärmens topp) vid heading 0, medurs därefter
// — samma konvention som en kompassbäring. sail:true ritar ett svart streck
// (bom sett ovanifrån) som markerar segelbåt.
function vsBoat(x, y, heading, { sail = false, fill = VS_BLUE, scale = 1 } = {}) {
  return `<g transform="translate(${x},${y}) rotate(${heading}) scale(${scale})">
    <path d="M0,-17 C6,-10 8,-2 7,13 L-7,13 C-8,-2 -6,-10 0,-17 Z" fill="${fill}" stroke="#1f3a52" stroke-width="1"/>
    ${sail ? '<line x1="-5" y1="6" x2="6" y2="-9" stroke="#111111" stroke-width="3" stroke-linecap="round"/>' : ""}
  </g>`;
}

// Bogsertåg: bogserbåt med ett mindre släp bakom, förbundna med en streckad
// bogserlina. Ritas som en enhet men rör sig efter samma heading.
function vsTow(x, y, heading, { fill = VS_BLUE } = {}) {
  const [tx, ty] = vsPoint(x, y, heading + 180, 34);
  return `${vsBoat(x, y, heading, { fill })}
    <line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="#5c7a8c" stroke-width="1.5" stroke-dasharray="2 3"/>
    ${vsBoat(tx, ty, heading, { fill, scale: 0.55 })}`;
}

// Liten färgad "pillow"-tagg (t.ex. "RAM") ovanför ett fartyg — oberoende av
// fartygets rotation.
function vsTag(x, y, text, color = "#c8272c") {
  const w = 11 + text.length * 6.3;
  return `<rect x="${(x - w / 2).toFixed(1)}" y="${y - 9}" width="${w.toFixed(1)}" height="18" rx="9" fill="${color}"/><text x="${x}" y="${y + 4}" font-size="10" font-family="Arial, sans-serif" font-weight="700" fill="#ffffff" text-anchor="middle">${text}</text>`;
}

// Trång farled: vågiga strandlinjer längs över- och underkant av bilden.
function vsChannel() {
  return `<path d="M-10,30 Q30,14 70,30 T150,30 T230,30 T310,30" fill="none" stroke="#6a93a8" stroke-width="2"/>
    <path d="M-10,165 Q30,149 70,165 T150,165 T230,165 T310,165" fill="none" stroke="#6a93a8" stroke-width="2"/>`;
}

function vsLabel(x, y, text) {
  return `<circle cx="${x}" cy="${y}" r="10.5" fill="#ffffff" stroke="#0d2b3e" stroke-width="1.6"/><text x="${x}" y="${y + 4}" font-size="12" font-family="Arial, sans-serif" font-weight="700" fill="#0d2b3e" text-anchor="middle">${text}</text>`;
}

function vsPoint(x, y, bearingDeg, len) {
  const r = (bearingDeg * Math.PI) / 180;
  return [x + len * Math.sin(r), y - len * Math.cos(r)];
}

// Streckad sektor bakåt från ett fartygs akter (±67.5° kring rakt akterut,
// dvs gränsen "mer än 22,5° akter om tvärs") — illustrerar upphinnandesektorn.
function vsSector(x, y, heading, len = 105, color = "#c8272c") {
  const [x1, y1] = vsPoint(x, y, heading + 180 - 67.5, len);
  const [x2, y2] = vsPoint(x, y, heading + 180 + 67.5, len);
  return `<line x1="${x}" y1="${y}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${color}" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.55"/>
    <line x1="${x}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.55"/>`;
}

function vsArrow(x, y, dirDeg, len, color) {
  const [x2, y2] = vsPoint(x, y, dirDeg, len);
  const back = vsPoint(x2, y2, dirDeg + 180, 7);
  const [lx, ly] = vsPoint(back[0], back[1], dirDeg + 90, 5);
  const [rx, ry] = vsPoint(back[0], back[1], dirDeg - 90, 5);
  return `<line x1="${x}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="2"/>
    <polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${lx.toFixed(1)},${ly.toFixed(1)} ${rx.toFixed(1)},${ry.toFixed(1)}" fill="${color}"/>`;
}

function vsScene(...parts) {
  return `<svg viewBox="0 0 ${VS_W} ${VS_H}" style="width:100%;max-width:240px;display:block;">${vsFrame()}${parts.join("")}</svg>`;
}

// ---- scener ----

const SCENE_HEAD_ON = vsScene(
  vsBoat(100, 155, 0),
  vsBoat(140, 45, 180),
  vsLabel(118, 169, "A"),
  vsLabel(158, 31, "B"),
);

const SCENE_CROSS_GIVEWAY = vsScene(
  vsBoat(70, 155, 0),
  vsBoat(195, 95, 250, { fill: "#4a7ba6" }),
  vsLabel(88, 169, "A"),
  vsLabel(213, 81, "B"),
);

const SCENE_CROSS_STANDON = vsScene(
  vsBoat(190, 155, 0),
  vsBoat(65, 95, 110, { fill: "#4a7ba6" }),
  vsLabel(208, 169, "A"),
  vsLabel(47, 81, "B"),
);

const SCENE_OVERTAKE = vsScene(
  vsSector(140, 55, 0),
  vsBoat(140, 55, 0),
  vsBoat(140, 150, 0, { fill: "#4a7ba6" }),
  vsLabel(158, 41, "B"),
  vsLabel(158, 136, "A"),
);

const SCENE_SAIL_CROSSING = vsScene(
  vsBoat(80, 155, 0),
  vsBoat(195, 85, 245, { sail: true, fill: "#4a7ba6" }),
  vsLabel(98, 169, "A"),
  vsLabel(213, 71, "B"),
);

const SCENE_SAIL_OVERTAKES = vsScene(
  vsSector(140, 55, 0),
  vsBoat(140, 55, 0),
  vsBoat(140, 150, 0, { sail: true, fill: "#4a7ba6" }),
  vsLabel(158, 41, "B"),
  vsLabel(158, 136, "A"),
);

const SCENE_SAIL_TACKS = vsScene(
  vsArrow(130, 16, 170, 26, "#7a8c96"),
  '<text x="130" y="14" font-size="9" font-family="Arial, sans-serif" fill="#5c7a8c" text-anchor="middle">VIND</text>',
  vsBoat(75, 145, 35, { sail: true }),
  vsBoat(195, 100, 235, { sail: true, fill: "#4a7ba6" }),
  vsLabel(93, 159, "A"),
  vsLabel(213, 86, "B"),
);

const SCENE_CHANNEL_STARBOARD = vsScene(
  vsChannel(),
  vsBoat(70, 135, 90),
  vsLabel(70, 116, "A")
);

const SCENE_CHANNEL_IMPEDE = vsScene(
  vsChannel(),
  vsBoat(90, 120, 90, { scale: 1.6 }),
  vsBoat(195, 148, 0, { sail: true, fill: "#4a7ba6" }),
  vsLabel(90, 98, "A"),
  vsLabel(213, 162, "B")
);

const SCENE_RAM = vsScene(
  vsBoat(70, 155, 0),
  vsBoat(195, 95, 250, { fill: "#4a7ba6" }),
  vsTag(70, 118, "RAM"),
  vsLabel(88, 169, "A"),
  vsLabel(213, 81, "B")
);

const SCENE_TOW = vsScene(
  vsTag(70, 108, "BOGSERING"),
  vsTow(70, 145, 0),
  vsBoat(195, 95, 250, { fill: "#4a7ba6" }),
  vsLabel(88, 159, "A"),
  vsLabel(213, 81, "B")
);

const QUESTIONS_VAJNINGSSITUATIONER = [
  {
    id: 626,
    cat: "ansvar",
    rule: "Regel 14",
    q: "Båt A och båt B närmar sig varandra enligt bilden, båda maskindrivna. Vilket fartyg har väjningsplikt?",
    svg: SCENE_HEAD_ON,
    opts: [
      "Båda fartygen — vardera ska ändra kurs åt styrbord",
      "Endast båt A",
      "Endast båt B",
      "Inget av fartygen, situationen är fri kurs",
    ],
    correct: 0,
    exp: "Regel 14 (mötande situation): när två maskindrivna fartyg möter varandra på rakt motsatta eller nästan rakt motsatta kurser med risk för kollision, ska båda ändra kurs åt styrbord så att de passerar varandra på babords sida.",
  },
  {
    id: 627,
    cat: "ansvar",
    rule: "Regel 15",
    q: "Båt B korsar båt A:s kurs och närmar sig från A:s styrbordssida enligt bilden. Vilket fartyg har väjningsplikt?",
    svg: SCENE_CROSS_GIVEWAY,
    opts: ["Båt A", "Båt B", "Båda fartygen lika mycket", "Inget av fartygen"],
    correct: 0,
    exp: "Regel 15 (skärande kurser): av två maskindrivna fartyg ska det fartyg som har det andra på sin egen styrbordssida hålla undan. Här har A fartyg B på sin styrbordssida, så A ska väja — normalt genom att gira åt styrbord och gå akter om B.",
  },
  {
    id: 628,
    cat: "ansvar",
    rule: "Regel 15",
    q: "Båt B korsar båt A:s kurs och närmar sig från A:s babordssida enligt bilden. Vilket fartyg ska hålla sin kurs och fart (stand-on)?",
    svg: SCENE_CROSS_STANDON,
    opts: [
      "Båt A",
      "Båt B",
      "Båda fartygen väjer samtidigt",
      "Ingen behöver hålla kurs",
    ],
    correct: 0,
    exp: "Här har B fartyg A på sin egen styrbordssida, så det är B som har väjningsplikt enligt Regel 15. A är då stand-on-fartyg och ska enligt Regel 17 i första hand hålla sin kurs och fart, men vara redo att agera om B inte väjer i tid.",
  },
  {
    id: 629,
    cat: "ansvar",
    rule: "Regel 13",
    q: "Båt A hinner ikapp båt B bakifrån inom den streckade sektorn på bilden, båda maskindrivna. Vilket fartyg har väjningsplikt?",
    svg: SCENE_OVERTAKE,
    opts: [
      "Båt A (det upphinnande fartyget)",
      "Båt B (det upphunna fartyget)",
      "Båda fartygen",
      "Inget av fartygen",
    ],
    correct: 0,
    exp: "Regel 13 (upphinnande): ett fartyg som närmar sig ett annat från mer än 22,5° akter om tvärs — den streckade sektorn på bilden — räknas som upphinnande och har alltid väjningsplikt, oavsett fartygstyp. Det upphunna fartyget ska hålla sin kurs och fart.",
  },
  {
    id: 630,
    cat: "ansvar",
    rule: "Regel 18",
    q: "Båt A och båt B närmar sig varandra enligt bilden. Vilket fartyg har väjningsplikt?",
    svg: SCENE_SAIL_CROSSING,
    opts: [
      "Båt A, det motordrivna fartyget",
      "Båt B, segelfartyget",
      "Båda fartygen",
      "Inget av fartygen",
    ],
    correct: 0,
    exp: "Regel 18: ett maskindrivet fartyg ska normalt hålla undan för ett segelfartyg. Eftersom det inte är fråga om upphinnande gäller huvudregeln oavsett från vilket håll segelbåten närmar sig — A (motorbåten) har väjningsplikt.",
  },
  {
    id: 631,
    cat: "ansvar",
    rule: "Regel 13",
    q: "Segelbåten A hinner ikapp motorbåten B bakifrån inom den streckade sektorn. Vilket fartyg har väjningsplikt?",
    svg: SCENE_SAIL_OVERTAKES,
    opts: [
      "Båt A, segelbåten",
      "Båt B, motorbåten",
      "Båda fartygen",
      "Inget av fartygen",
    ],
    correct: 0,
    exp: 'Regel 13 gäller "oavsett fartygstyp" och går före den vanliga hierarkin i Regel 18 — ett upphinnande fartyg har alltid väjningsplikt, även om det är ett segelfartyg som hinner ikapp en motorbåt.',
  },
  {
    id: 632,
    cat: "ansvar",
    rule: "Regel 12",
    q: "Två segelbåtar närmar sig varandra enligt bilden. Båt A seglar för babords halsar (vinden kommer in på babords sida) och båt B för styrbords halsar. Vilken båt har väjningsplikt?",
    svg: SCENE_SAIL_TACKS,
    opts: [
      "Båt A, den som seglar för babords halsar",
      "Båt B, den som seglar för styrbords halsar",
      "Båda fartygen",
      "Inget av fartygen",
    ],
    correct: 0,
    exp: "Regel 12 (segelfartyg emellan): när segelfartyg seglar för olika halsar ska det fartyg som ligger för babords halsar hålla undan för det andra. Ligger de för samma halsar väjer istället det fartyg som ligger till vinderns (till lovart).",
  },
  {
    id: 633,
    cat: "ansvar",
    rule: "Regel 14",
    q: "Vilken typ av situation visar bilden?",
    svg: SCENE_HEAD_ON,
    opts: [
      "Mötande situation (Regel 14)",
      "Skärande kurser (Regel 15)",
      "Upphinnande (Regel 13)",
      "Ingen risk för kollision",
    ],
    correct: 0,
    exp: "Fartygen närmar sig varandra på rakt motsatta kurser, stäv mot stäv - det är en mötande situation enligt Regel 14, där båda fartygen ska gira åt styrbord.",
  },
  {
    id: 634,
    cat: "ansvar",
    rule: "Regel 13",
    q: "Vilken typ av situation visar bilden?",
    svg: SCENE_OVERTAKE,
    opts: [
      "Upphinnande (Regel 13)",
      "Mötande situation (Regel 14)",
      "Skärande kurser (Regel 15)",
      "Ingen risk för kollision",
    ],
    correct: 0,
    exp: "Båt A kommer bakifrån inom sektorn mer än 22,5° akter om tvärs på båt B - det definierar en upphinnande situation enligt Regel 13, oavsett vilka fartygstyper det gäller.",
  },
  {
    id: 635,
    cat: "ansvar",
    rule: "Regel 9",
    q: "Fartyg A färdas genom en trång farled enligt bilden. Vilken sida av farleden ska A hålla sig till, sett i färdriktningen?",
    svg: SCENE_CHANNEL_STARBOARD,
    opts: [
      "Styrbords sida, så nära ytterkanten som säkert kan ske",
      "Babords sida",
      "Mitten av farleden, för bästa sikt åt båda hållen",
      "Valfri sida, det spelar ingen roll i en farled",
    ],
    correct: 0,
    exp: "Regel 9(a): ett fartyg som går genom en trång farled eller inseglingsränna ska hålla sig så nära den yttre gränsen av farleden på sin styrbords sida som är säkert genomförbart.",
  },
  {
    id: 636,
    cat: "ansvar",
    rule: "Regel 9",
    q: "Fartyg A är ett större fartyg som bara kan navigera säkert inom den trånga farleden. Segelbåten B korsar farleden. Vilket fartyg får inte hindra det andra?",
    svg: SCENE_CHANNEL_IMPEDE,
    opts: [
      "Båt B får inte hindra fartyg A:s säkra passage genom farleden",
      "Båt A får inte hindra båt B",
      "Båda måste väja för varandra samtidigt",
      "Ingen av dem behöver ta hänsyn till den andra",
    ],
    correct: 0,
    exp: "Regel 9(b) och 9(d): fartyg under 20 m, segelfartyg och fartyg som korsar farleden får inte hindra passagen för ett fartyg som på grund av sitt djupgående eller sin storlek bara kan navigera säkert inom den trånga farleden.",
  },
  {
    id: 637,
    cat: "ansvar",
    rule: "Regel 18",
    q: "Fartyg A har begränsad manöverförmåga (t.ex. lägger en sjökabel) och visar dagsignalen boll-diamant-boll. Fartyg B är ett vanligt maskindrivet fartyg. Vilket fartyg har väjningsplikt?",
    svg: SCENE_RAM,
    opts: [
      "Båt B, det vanliga maskindrivna fartyget",
      "Båt A, fartyget med begränsad manöverförmåga",
      "Båda fartygen",
      "Inget av fartygen",
    ],
    correct: 0,
    exp: "Regel 18(a): ett maskindrivet fartyg under gång ska hålla undan för bland annat fartyg med begränsad manöverförmåga (och fartyg som ej kan manövrera, fiskande fartyg samt segelfartyg). B ska alltså väja för A, oavsett hur de närmar sig varandra.",
  },
  {
    id: 638,
    cat: "ansvar",
    rule: "Regel 18",
    q: "Fartyg A bogserar en pråm, och bogserlinans längd gör att A har mycket begränsad förmåga att avvika från sin kurs — det räknas därför som ett fartyg med begränsad manöverförmåga. Fartyg B är ett vanligt maskindrivet fartyg. Vilket fartyg har väjningsplikt?",
    svg: SCENE_TOW,
    opts: [
      "Båt B, det vanliga maskindrivna fartyget",
      "Båt A, bogserfartyget",
      "Båda fartygen",
      "Inget av fartygen",
    ],
    correct: 0,
    exp: "Ett bogserfartyg räknas normalt som ett vanligt maskindrivet fartyg, men om bogseringen kraftigt begränsar dess förmåga att avvika från kursen klassas ekipaget som begränsat i sin manöverförmåga (Regel 3g). Enligt Regel 18(a) ska då det vanliga maskindrivna fartyget B hålla undan.",
  },
];
