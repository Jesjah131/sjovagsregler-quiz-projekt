// Fyrkaraktärer — ljus/mörker-mönster för den interaktiva tidsaxel-övningen
// (läget "Fyrkaraktärer"). Varje karaktär anges med sin period (sekunder)
// och en lista av segment [{on, dur}] som tillsammans summerar till period.
// Mönstret upprepas sedan för att fylla hela tidsaxeln (0–25 s), precis som
// på en riktig fyrlista-tidsaxel.
//
// Konventioner som använts (standardförenkling vid undervisning, kan skilja
// sig någon decimal mot specifik kurslitteratur — det är mönstrets FORM och
// gruppering som är det pedagogiska målet):
//   - Kort blänk (Fl)        = 1,0 s tänt
//   - Långblänk (LFl)        = 2,0 s tänt
//   - Ocklusion, eklips (Oc) = 1,0 s släckt
//   - Snabbblink (Q)         = 0,5 s tänt / 0,5 s släckt per blänk
//   - Mycket snabb blink(VQ) = 0,25 s tänt / 0,25 s släckt per blänk
//   - Morse: punkt = 1 s tänt, streck = 3 s tänt, mellanrum = 1 s släckt
//   - Kort mellanrum mellan blänk i en grupp = 1,0 s släckt
//   - Kort "mellanljus" mellan eklipser i en Oc-grupp = 1,0 s tänt
const FYRKARAKTARER = [
  {
    id: "lfl2-10",
    label: "LFl(2) 10s",
    desc: "Grupplångblänk om 2 — två 2-sekunders blänk per period, period 10 s.",
    period: 10,
    segments: [
      { on: true, dur: 2 },
      { on: false, dur: 1 },
      { on: true, dur: 2 },
      { on: false, dur: 5 },
    ],
  },
  {
    id: "oc-6",
    label: "Oc 6s",
    desc: "Ocklusion — i huvudsak tänt med en kort, regelbunden eklips. Period 6 s.",
    period: 6,
    segments: [
      { on: true, dur: 5 },
      { on: false, dur: 1 },
    ],
  },
  {
    id: "iso-4",
    label: "Iso 4s",
    desc: "Isofas — lika lång tänd som släckt tid. Period 4 s.",
    period: 4,
    segments: [
      { on: true, dur: 2 },
      { on: false, dur: 2 },
    ],
  },
  {
    id: "iq-9",
    label: "IQ 9s",
    desc: "Avbruten snabbblink — en kort serie snabbblänk följd av ett längre mörkt uppehåll. Period 9 s.",
    period: 9,
    segments: [
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: false, dur: 5 },
    ],
  },
  {
    id: "vq",
    label: "VQ",
    desc: "Mycket snabb blink, kontinuerlig — omkring 120 blänk/minut utan uppehåll. Ingen period anges; mönstret upprepas obrutet.",
    period: 0.5,
    segments: [
      { on: true, dur: 0.25 },
      { on: false, dur: 0.25 },
    ],
  },
  {
    id: "mo-a-15",
    label: "Mo(•−) 15s",
    desc: 'Morse-karaktär "A" (punkt-streck). Period 15 s.',
    period: 15,
    segments: [
      { on: true, dur: 1 },
      { on: false, dur: 1 },
      { on: true, dur: 3 },
      { on: false, dur: 10 },
    ],
  },
  {
    id: "oc3-12",
    label: "Oc(3) 12s",
    desc: "Gruppocklusion om 3 — tre korta eklipser per period. Period 12 s.",
    period: 12,
    segments: [
      { on: true, dur: 1 },
      { on: false, dur: 1 },
      { on: true, dur: 1 },
      { on: false, dur: 1 },
      { on: true, dur: 1 },
      { on: false, dur: 1 },
      { on: true, dur: 6 },
    ],
  },
  {
    id: "fl2-10",
    label: "Fl(2) 10s",
    desc: "Gruppblänk om 2. Period 10 s.",
    period: 10,
    segments: [
      { on: true, dur: 1 },
      { on: false, dur: 1 },
      { on: true, dur: 1 },
      { on: false, dur: 7 },
    ],
  },
  {
    id: "f",
    label: "F",
    desc: "Fast sken — kontinuerligt tänt, ingen period.",
    period: null,
    segments: [{ on: true, dur: 25 }],
  },
  {
    id: "q6lfl-15",
    label: "Q(6)+LFl 15s",
    desc: "Sex snabbblänk följt av ett långblänk (klassisk kardinalkaraktär för sydlig kardinal — \"S = 6\"). Period 15 s.",
    period: 15,
    segments: [
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 2 },
      { on: false, dur: 7 },
    ],
  },
  {
    id: "vq3-5",
    label: "VQ(3) 5s",
    desc: "Gruppmycket-snabb-blink om 3. Period 5 s.",
    period: 5,
    segments: [
      { on: true, dur: 0.25 },
      { on: false, dur: 0.25 },
      { on: true, dur: 0.25 },
      { on: false, dur: 0.25 },
      { on: true, dur: 0.25 },
      { on: false, dur: 3.75 },
    ],
  },
  {
    id: "fl2g-6",
    label: "Fl(2) G 6s",
    desc: "Gruppblänk om 2, grönt sken. Period 6 s.",
    period: 6,
    color: "G",
    segments: [
      { on: true, dur: 1 },
      { on: false, dur: 1 },
      { on: true, dur: 1 },
      { on: false, dur: 3 },
    ],
  },
  {
    id: "fl2-5",
    label: "Fl(2) 5s",
    desc: "Gruppblänk om 2. Period 5 s.",
    period: 5,
    segments: [
      { on: true, dur: 1 },
      { on: false, dur: 1 },
      { on: true, dur: 1 },
      { on: false, dur: 2 },
    ],
  },
  {
    id: "q9-15",
    label: "Q(9) 15s",
    desc: "Nio snabbblänk i grupp (klassisk kardinalkaraktär för västlig kardinal — \"V = 9\"). Period 15 s.",
    period: 15,
    segments: [
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 0.5 },
      { on: true, dur: 0.5 },
      { on: false, dur: 6.5 },
    ],
  },
  {
    id: "flr-3",
    label: "Fl R 3s",
    desc: "Blänk, rött sken. Period 3 s.",
    period: 3,
    color: "R",
    segments: [
      { on: true, dur: 1 },
      { on: false, dur: 2 },
    ],
  },
  {
    id: "iso-12",
    label: "Iso 12s",
    desc: "Isofas — lika lång tänd som släckt tid. Period 12 s.",
    period: 12,
    segments: [
      { on: true, dur: 6 },
      { on: false, dur: 6 },
    ],
  },
];

// Expanderar ett karaktärs segment-mönster (en period) till en flödeslista
// av {on, start, end} som fyller hela axeln (default 25 s), genom att
// upprepa mönstret om det behövs.
function expandFyrPattern(char, totalSeconds = 25) {
  const out = [];
  let t = 0;
  while (t < totalSeconds) {
    for (const seg of char.segments) {
      if (t >= totalSeconds) break;
      const end = Math.min(t + seg.dur, totalSeconds);
      out.push({ on: seg.on, start: t, end });
      t = end;
    }
  }
  return out;
}
