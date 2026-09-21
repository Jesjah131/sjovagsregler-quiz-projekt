// Nivåindelning av frågebanken utifrån NFB:s kunskapsfordringar (2025-02-01).
// 'F' = ingår i Förarintyget (och därmed även i Kustskepparintyget).
// 'K' = ingår endast i Kustskepparintyget.
// Frågor som varken har lvl eller finns i listorna nedan är inte krav enligt
// de två PDF:erna (t.ex. signalflaggor, radarpraktik, stabilitetsberäkningar)
// och hör bara till "Alla ämnen" och Fartygsbefäl kl. VIII.
// Nya frågor (questions-nfb-tillagg.js) bär lvl direkt på frågan.
const idRange2 = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const LEVEL_F_IDS = [
  // Del A/B – Regel 1, 2, 3 (a–d, i–l), 4–19 (de delar som PDF:en anger)
  4, 5, 6, ...idRange2(7, 15), 17, 18, 19, ...idRange2(21, 33), 37, 113, 114,
  118, 119, 120,
  // Del C – Regel 20–25, 30 (lanternor och signalfigurer)
  38, 39, 40, 41, 42, 43, 44, 121, 122, 124, 408, 409, 410, 411, 420, 421,
  50, 52, 400, 405,
  // Del D – Regel 32 (a–c), 33b, 34, 35 (a, b, c-segel)
  ...idRange2(55, 62), 129, 130, 132,
  // Sjökort, symboler, sjömärken (System A)
  ...idRange2(77, 94), ...idRange2(178, 200),
  // Säkerhet, sjömanskap, sjukvård
  ...idRange2(201, 208), 210, 211, 219, 222, 228, 231, 232, 233, 234, 236,
  143, 144, 147,
  // Väder
  241, 242, ...idRange2(244, 251), 253, 254,
  // Sjölag – befälhavarens ansvar
  265,
];

const LEVEL_K_IDS = [
  // Regler som Förarintyget inte listar (Regel 3 e–h, 9c/e–g, 10 övrigt, 18 e–f, 19 b–d …)
  1, 2, 3, 16, 20, 34, 35, 36, 115, 116, 117, 136, 137, 138, 139,
  // Regel 22, 26–29 samt övriga lanternor/dagsignaler/ljudsignaler
  45, 46, 47, 48, 140, 141, 123, 125, 126, 127, 128, ...idRange2(412, 419),
  49, 51, 53, 54, 142, 401, 402, 403, 404, 406, 407,
  63, 64, 65, 66, 131, 133, 134, 135,
  // TSFS 2009:44
  ...idRange2(71, 76),
  // Fyrar och mörkernavigering (Kustskepparintyget: "Kunskap om fyrbelysningssystemet")
  ...idRange2(95, 112),
  // Radar (kännedom) – praktik/tolkning (269–278, 422–433, 448) ingår inte
  ...idRange2(67, 70), 434, ...idRange2(436, 446), 449,
  // Fri vätskeyta / stabilitet (kännedom)
  170,
  // Brand, sjukvård, livräddning, väder, sjörätt, radio
  209, 215, 216, 217, 218, 220, 221, 224, 225, 226,
  229, 237, 238, 240, 243, 252, 256, 257, 258, 264, 266, 267, 268,
  145, 146, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
];

const QUESTION_LEVEL = {};
LEVEL_F_IDS.forEach((id) => (QUESTION_LEVEL[id] = 'F'));
LEVEL_K_IDS.forEach((id) => (QUESTION_LEVEL[id] = 'K'));

function questionLevel(q) {
  return q.lvl || QUESTION_LEVEL[q.id] || null;
}

// Alla frågor som hör till ett certifikat. Förarintyg = nivå F,
// Kustskepparintyg = nivå F + K (bygger vidare). Klass VIII och "fritt"
// använder den gamla kategorimodellen.
function certPool(certId) {
  if (certId === 'forarintyg')
    return QUESTIONS.filter((q) => questionLevel(q) === 'F');
  if (certId === 'kustskeppare')
    return QUESTIONS.filter((q) => ['F', 'K'].includes(questionLevel(q)));
  if (certId === 'klass8') {
    const cats = new Set(
      CERT_TRACKS.klass8.parts.flatMap((p) => COMMON_PARTS[p.ref].cats)
    );
    return QUESTIONS.filter((q) => cats.has(q.cat));
  }
  return QUESTIONS.slice();
}
