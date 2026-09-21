// Certifikatsspår, gemensamma ämnespooler samt state-variabler.
// Kräver att data/categories.js och alla data/questions-*.js redan laddats.

let mode = null; // 'train' | 'exam' | 'calc' | 'drill'
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

  // --- Delar hämtade ur NFB:s kunskapsfordringar (Förarintyg/Kustskepparintyg) ---
  nfb_sjokort: { cats: ["sjokort"] },
  nfb_navigation: { cats: ["kompass", "sjokort"] },
  nfb_sakerhet: { cats: ["livraddning", "brand", "sjukvard", "sjomanskap"] },
  nfb_miljo: { cats: ["miljo"] },
  nfb_vader: { cats: ["meteorologi"] },
  nfb_regler_grund: {
    cats: ["def", "fart-risk", "farled", "kurs", "ansvar", "sikt", "segelregler", "lanternor", "dag", "ljud", "tsfs"],
  },
  nfb_regler_full: {
    cats: ["def", "fart-risk", "farled", "kurs", "ansvar", "sikt", "segelregler", "lanternor", "dag", "ljud", "lots-fiske", "tsfs"],
  },
  nfb_lagar: { cats: ["lagar", "sjoratt"] },
  nfb_fyrar: { cats: ["fyrar"] },
  nfb_hjalpmedel: { cats: ["radar", "radio"] },
};

/* =====================================================================
   CERTIFIKATSPÅR — varje del refererar (ref) till en gemensam pool i
   COMMON_PARTS ovan. Namnet på delen kan skilja sig mellan certifikat
   även när de delar samma underliggande kategoripool.
===================================================================== */
const CERT_TRACKS = {
  forarintyg: {
    name: "Förarintyg",
    note: "Delarna följer NFB:s kunskapsfordringar (2025-02-01): dagsljus, god sikt, inom 3 sjömil från skyddad plats. Bara frågor på Förarintygsnivå visas.",
    parts: [
      { name: "Sjökort, sjömärken och instrument", ref: "nfb_sjokort" },
      { name: "Navigation", ref: "nfb_navigation" },
      { name: "Säkerhet, sjömanskap och sjukvård", ref: "nfb_sakerhet" },
      { name: "Miljö", ref: "nfb_miljo" },
      { name: "Väder och vattenstånd", ref: "nfb_vader" },
      { name: "Sjövägsregler", ref: "nfb_regler_grund" },
      { name: "Lagar och övriga regler", ref: "nfb_lagar" },
    ],
  },
  kustskeppare: {
    name: "Kustskepparintyg",
    note: "Bygger på Förarintyget och lägger till mörker, nedsatt sikt och oskyddade farvatten enligt NFB:s kunskapsfordringar (2025-02-01). Frågor på Förarintygsnivå ingår, plus de som bara gäller Kustskepparintyget. Kurs-/distansräkning tränas i läget Navigationsräkning.",
    parts: [
      { name: "Sjökort och utmärkning", ref: "nfb_sjokort" },
      { name: "Fyrbelysningssystemet", ref: "nfb_fyrar" },
      { name: "Kompass, kurser och praktiskt sjökortsarbete", ref: "nfb_navigation" },
      { name: "Radio, radar och övriga hjälpmedel", ref: "nfb_hjalpmedel" },
      { name: "Säkerhet, sjukvård och sjömanskap", ref: "nfb_sakerhet" },
      { name: "Miljö", ref: "nfb_miljo" },
      { name: "Väder och vind", ref: "nfb_vader" },
      { name: "Sjövägsregler (Del A–D, Annex 4, Bilaga 2)", ref: "nfb_regler_full" },
      { name: "Lagar och övriga regler", ref: "nfb_lagar" },
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
