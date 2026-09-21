// Mängdträning: handplockade frågor där svaret är entydigt rätt eller fel
// (inga regeltolkningar). Grupperna pekar ut frågor via id i QUESTIONS.
// Kräver att data/questions-index.js redan laddats.
const idRange = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const DRILL_GROUPS = [
  {
    id: 'flaggor-bild',
    name: 'Signalflaggor — bild till bokstav, siffra & vimpel',
    color: '#8a3ffc',
    ids: [...idRange(374, 399), ...idRange(600, 613)],
  },
  {
    id: 'fonetiskt',
    name: 'Fonetiska alfabetet & sifferord',
    color: '#8a3ffc',
    ids: [...idRange(350, 358), ...idRange(614, 621)],
  },
  {
    id: 'flaggor-betydelse',
    name: 'Enskilda flaggors betydelse & substitut',
    color: '#8a3ffc',
    ids: [...idRange(363, 373), ...idRange(622, 625)],
  },
  {
    id: 'dagsignaler',
    name: 'Dagsignaler (formfigurer)',
    color: '#e0a437',
    ids: [49, 50, 51, 52, 53, 54, 142, ...idRange(400, 407)],
  },
  {
    id: 'lanternor',
    name: 'Lanternor (bild till fartygstyp)',
    color: '#c8272c',
    ids: idRange(408, 421),
  },
  {
    id: 'ljudsignaler',
    name: 'Ljudsignaler (Regel 34 & 35)',
    color: '#1c8a54',
    ids: idRange(55, 64),
  },
];

function drillQuestionsFor(groupIds) {
  const wanted = new Set(
    DRILL_GROUPS.filter((g) => groupIds.includes(g.id)).flatMap((g) => g.ids)
  );
  return QUESTIONS.filter((q) => wanted.has(q.id));
}
