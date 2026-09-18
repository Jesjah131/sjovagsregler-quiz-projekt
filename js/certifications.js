// Certifikatsspår, gemensamma ämnespooler samt state-variabler.
// Kräver att data/categories.js och alla data/questions-*.js redan laddats.

let mode = null; // 'train' | 'exam'
let selectedCats = [];
let quizQuestions = [];
let current = 0;
let answers = []; // {qId, chosen, correct}
let recallMode = false; // "Fundera-läge" — dölj alternativen tills begärt
let audioCtx = null;

/* =====================================================================
   CERTIFIKATSPÅR — grupperar befintliga ämneskategorier efter
   examensdelarna för tre certifikat. Maskinteknik ingår avsiktligt
   inte i något av spåren.
===================================================================== */
/* =====================================================================
   GEMENSAMMA DELAR — definierar varje unik uppsättning kategorier EN
   gång. Flera certifikat/delar kan peka på samma pool (ref), vilket
   gör överlapp synligt och gör att en framtida uppdatering av en pool
   slår igenom överallt den används, istället för att underhållas på
   flera ställen.
===================================================================== */
const COMMON_PARTS = {
  navigering_sjokort: { cats: ["sjokort"] },
  planering_vader: { cats: ["sjokort", "meteorologi"] },
  sjovagsregler_grund: {
    cats: [
      "def",
      "fart-risk",
      "farled",
      "kurs",
      "ansvar",
      "sikt",
      "lanternor",
      "ljud",
    ],
  },
  sjovagsregler_full: {
    cats: [
      "def",
      "fart-risk",
      "farled",
      "kurs",
      "ansvar",
      "sikt",
      "lanternor",
      "dag",
      "ljud",
      "lots-fiske",
      "segelregler",
    ],
  },
  sakerhet_ombord: { cats: ["livraddning", "brand", "sjukvard"] },
  tranga_passager: { cats: ["farled", "kurs"] },
  sjomanskap_grund: { cats: ["tsfs", "segelregler"] },
  elektroniska_hjalp: { cats: ["sjokort"] },
  morkernavigering: {
    cats: ["lanternor", "fyrar", "dag", "ljud", "lots-fiske"],
  },
  sakerhet_beslut: { cats: ["livraddning", "meteorologi"] },
  navigation_klass8: { cats: ["sjokort", "fyrar"] },
  befalhavaransvar: { cats: ["tsfs", "sjoratt"] },
  anpassning_forhall: { cats: ["meteorologi", "sikt"] },
  radio_vhf: { cats: ["radio"] },
  dag_morker_klass8: { cats: ["sjokort", "fyrar", "lanternor", "dag"] },
  radar_teori: { cats: ["radar"] },
  stabilitet: { cats: ["skeppsteknik"] },
  meteorologi_egen: { cats: ["meteorologi"] },
  brandskydd: { cats: ["brand"] },
  halsosjukvard: { cats: ["sjukvard"] },
  nodsituationer: { cats: ["livraddning", "radio", "flaggsignaler"] },
  passagerarsakerhet: { cats: ["livraddning", "sjoratt", "tsfs"] },
};

/* =====================================================================
   CERTIFIKATSPÅR — varje del refererar (ref) till en gemensam pool i
   COMMON_PARTS ovan. Namnet på delen kan skilja sig mellan certifikat
   även när de delar samma underliggande kategoripool.
===================================================================== */
const CERT_TRACKS = {
  forarintyg: {
    name: "Förarintyg",
    note: "Grundnivå. Vissa delar (t.ex. ruttplanering och elektroniska hjälpmedel) har ännu tunnare täckning än övriga.",
    parts: [
      { name: "Navigation med sjökort", ref: "navigering_sjokort" },
      { name: "Planering av färd", ref: "planering_vader" },
      { name: "Sjövägsregler", ref: "sjovagsregler_grund" },
      { name: "Säkerhet till sjöss", ref: "sakerhet_ombord" },
      { name: "Manövrering i trånga passager", ref: "tranga_passager" },
      { name: "Grundläggande sjömanskap", ref: "sjomanskap_grund" },
      { name: "Elektroniska hjälpmedel", ref: "elektroniska_hjalp" },
    ],
  },
  kustskeppare: {
    name: "Kustskepparintyg",
    note: 'Påbyggnad på förarintyget. "Vind, ström och avdrift", "Missvisning och deviation" och "Död räkning" tränas extra bra i kombination med Navigationsräkning-läget på startsidan.',
    parts: [
      { name: "Navigation i öppnare vatten", ref: "planering_vader" },
      { name: "Planering av längre färder", ref: "planering_vader" },
      { name: "Mörkernavigering", ref: "morkernavigering" },
      { name: "Vind, ström och avdrift", ref: "navigering_sjokort" },
      { name: "Missvisning och deviation", ref: "navigering_sjokort" },
      { name: "Död räkning", ref: "navigering_sjokort" },
      { name: "Säkerhet och beslutsfattande", ref: "sakerhet_beslut" },
    ],
  },
  klass8: {
    name: "Fartygsbefäl kl. VIII",
    note: "Högre teoretisk nivå för yrkessjöfart — bygger på hela kunskapsbanken.",
    parts: [
      { name: "Planering och genomförande av färd", ref: "planering_vader" },
      { name: "Navigation", ref: "navigation_klass8" },
      { name: "Sjövägsregler", ref: "sjovagsregler_full" },
      { name: "Säkerhet ombord", ref: "sakerhet_ombord" },
      { name: "Befälhavarens ansvar", ref: "befalhavaransvar" },
      { name: "Anpassning till förhållanden", ref: "anpassning_forhall" },
      { name: "Kommunikation i yrkesmässig trafik", ref: "radio_vhf" },
      {
        name: "Dag- och mörkernavigering, bäringar, deviation/missvisning, land-/sjömärken",
        ref: "dag_morker_klass8",
      },
      { name: "Teori och praktik på radar", ref: "radar_teori" },
      { name: "VHF", ref: "radio_vhf" },
      { name: "Stabilitet", ref: "stabilitet" },
      { name: "Meteorologi", ref: "meteorologi_egen" },
      { name: "Brandskydd", ref: "brandskydd" },
      { name: "Hälso- och sjukvård", ref: "halsosjukvard" },
      {
        name: "Nödsituationer och kommunikationsmetoder",
        ref: "nodsituationer",
      },
      {
        name: "Passagerar- & personlig säkerhet, säkerhetsorganisation, lagar",
        ref: "passagerarsakerhet",
      },
    ],
  },
};

// Färger enbart för certifikatmärken (badges), skilda från ämnesfärgerna.
const CERT_ORDER = ["forarintyg", "kustskeppare", "klass8"];

// Slår upp, för varje kategori-id, vilka certifikat som använder den
// och under vilket/vilka officiella delnamn — härlett direkt ur
// CERT_TRACKS/COMMON_PARTS så det aldrig kan hamna i otakt med dem.
function buildCategoryCertIndex() {
  const index = {};
  CERT_ORDER.forEach((certId) => {
    const track = CERT_TRACKS[certId];
    track.parts.forEach((part) => {
      COMMON_PARTS[part.ref].cats.forEach((catId) => {
        if (!index[catId]) index[catId] = {};
        if (!index[catId][certId]) index[catId][certId] = [];
        if (!index[catId][certId].includes(part.name))
          index[catId][certId].push(part.name);
      });
    });
  });
  return index;
}
const CATEGORY_CERT_INDEX = buildCategoryCertIndex();

const CERT_OPTIONS = [
  { id: "fritt", label: "Alla ämnen" },
  { id: "forarintyg", label: "Förarintyg" },
  { id: "kustskeppare", label: "Kustskepparintyg" },
  { id: "klass8", label: "Fartygsbefäl kl. VIII" },
];

/* =====================================================================
   SETUP SCREEN
===================================================================== */
let trainCert = "fritt";
let examCert = "fritt";

// Bygger raden av kryssrutor för en given lista av kategorier. Samma
// funktion och samma kategorinamn används överallt i appen — ett ämne
// heter alltid samma sak, oavsett om man tittar i "Alla ämnen" eller
// inne i ett specifikt certifikat. subtitleFor(catId) kan ge en extra
// rad under namnet (t.ex. vilken officiell del ämnet motsvarar).
