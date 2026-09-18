# Sjövägsregler — quiz-app

Ett fristående quiz för sjökunskap (COLREG, TSFS 2009:44, kustskepparintyg,
fartygsbefäl klass VIII m.m.) uppdelat i tre lägen: Träning, Prov och
Navigationsräkning.

## Så öppnar du appen

Öppna bara `index.html` i en webbläsare (dubbelklicka på filen, eller
högerklicka → "Öppna med" → valfri webbläsare). Ingen server eller
installation krävs — allt körs lokalt i webbläsaren.

**Viktigt:** hela mappstrukturen måste hänga ihop som den är. Om du bara
kopierar `index.html` för sig fungerar inget, eftersom den länkar till
`css/` och `js/`-filerna med relativa sökvägar.

## Mappstruktur

```
index.html                          Sidans skelett, länkar till allt annat
css/
  style.css                         All styling (färger, layout, animationer)
js/
  data/
    categories.js                   Ämneskategorier, ikoner, catMap
    questions-sjovagsregler.js      Regel 3-19, segelfartygsregler
    questions-lanternor-signaler.js Lanternor, dagersignaler, ljudsignaler, lots/fiske
    questions-navigation.js         Sjökort, fyrar, radar, skeppsteknik
    questions-sakerhet-lag.js       TSFS, sjörätt, brand, sjukvård, livräddning, väder
    questions-kommunikation.js      Radio, flaggsignaler & semafor
    questions-maskinteknik.js       Maskinteknisk grundkurs (separat kursdel)
    questions-index.js              Slår ihop alla frågefiler till QUESTIONS
  certifications.js                 Förarintyg/Kustskeppare/Klass VIII-spår + state
  setup-ui.js                       Startskärmens UI (lägesval, ämneslista)
  audio.js                          Ljudsignaler (Web Audio API)
  quiz-engine.js                    Frågevisning, rättning, Fundera-läge, resultat
  calc-engine.js                    Navigationsräkning (uppgiftsgenerator + rättning)
```

Filerna i `index.html` laddas i en bestämd ordning (se `<script>`-taggarna
längst ner i `<body>`) eftersom senare filer använder variabler och
funktioner som definieras i tidigare filer. Ändrar du ordningen kan appen
sluta fungera.

## Vanliga ändringar

**Lägga till en fråga:** öppna rätt `questions-*.js`-fil för ämnet, kopiera
ett befintligt frågeobjekt och ändra `id` (måste vara unikt över alla
filer — högsta använda id just nu är runt 428), `cat`, `q`, `opts` (exakt
6 alternativ) och `exp`. Sätt `correct` till indexet (0-5) för rätt
alternativ i just den ordning du skrev dem i — appen blandar om ordningen
själv när frågan visas.

**Lägga till en helt ny ämneskategori:** lägg till den i `categories.js`
(`CATEGORIES`-arrayen + eventuellt en ny ikon i `ICON_PATHS`/`CATEGORY_ICONS`),
skapa gärna en ny `questions-dittämne.js`-fil, och lägg till den i
`questions-index.js` samt som en ny `<script src="...">`-rad i `index.html`
(måste laddas FÖRE `questions-index.js`).

**Ändra vilka ämnen som ingår i ett certifikat:** görs i `certifications.js`,
i `COMMON_PARTS` (vilka kategorier en "pool" innehåller) och `CERT_TRACKS`
(vilka pooler varje certifikats delar pekar på).

**Ändra utseende/färger:** allt ligger i `css/style.css`.

## Testa dina ändringar

Det enklaste sättet att upptäcka fel (t.ex. saknat kommatecken i en fråga)
är att öppna webbläsarens utvecklarkonsol (F12 → "Console") efter att du
laddat om sidan. Om något är trasigt syns oftast ett rött felmeddelande
där, med filnamn och radnummer.
