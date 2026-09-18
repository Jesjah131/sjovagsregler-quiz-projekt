// Ämneskategorier, ikoner och hjälp-lookup (catMap).
const CATEGORIES = [
  {id:'def',      name:'Definitioner (Regel 3)',            color:'#8aa6b8'},
  {id:'fart-risk', name:'Säker fart & kollisionsrisk (6–8)', color:'#e0a437'},
  {id:'farled',    name:'Trånga farleder & TSS (9–10)',      color:'#c8272c'},
  {id:'kurs',      name:'Upphinnande / stäv mot stäv / skärande (13–15)', color:'#1c8a54'},
  {id:'ansvar',    name:'Stand-on / give-way (16–18)',       color:'#e0a437'},
  {id:'sikt',      name:'Nedsatt sikt (19 & 35)',            color:'#8aa6b8'},
  {id:'lanternor', name:'Lanternor (20–25)',                 color:'#c8272c'},
  {id:'lots-fiske',name:'Lots- & fiskefartyg (26, 29)',      color:'#1c8a54'},
  {id:'dag',       name:'Dagersignaler (form-signaler)',     color:'#e0a437'},
  {id:'ljud',      name:'Ljudsignaler (32–37)',              color:'#c8272c'},
  {id:'radar',     name:'Radarsituationer',                  color:'#8aa6b8'},
  {id:'tsfs',      name:'TSFS 2009:44',                      color:'#1c8a54'},
  {id:'sjokort',   name:'Sjökort & kurssättning',             color:'#4a90a4'},
  {id:'fyrar',     name:'Fyrar & mörkernavigering',           color:'#d9822b'},
  {id:'segelregler', name:'Segelfartygsregler (Regel 12)',    color:'#7a5c9e'},
  {id:'radio',     name:'Radiokommunikation',                 color:'#3f7d8c'},
  {id:'skeppsteknik', name:'Skeppsteknik & stabilitet',        color:'#8c6a3f'},
  {id:'brand',     name:'Brandsäkerhet',                       color:'#b03a2e'},
  {id:'sjukvard',  name:'Sjukvård & första hjälpen',           color:'#2e7d5b'},
  {id:'livraddning', name:'Livräddning & säkerhetsutrustning', color:'#c8860d'},
  {id:'meteorologi', name:'Meteorologi',                       color:'#4a6d9c'},
  {id:'sjoratt',   name:'Sjörätt & miljöregler',                color:'#5c4a7d'},
  {id:'flaggsignaler', name:'Flaggsignaler & semafor',           color:'#8a3ffc'},
  {id:'mask-motorprincip', name:'Motorprinciper & motortyper (Del 1)',        color:'#5c7a8c', group:'maskin'},
  {id:'mask-verkgrad',     name:'Verkningsgrad, luft & gasväxling (Del 1)',   color:'#8c7a3f', group:'maskin'},
  {id:'mask-bransle',      name:'Bränsle & förbränningsegenskaper (Del 1)',   color:'#6e3f3f', group:'maskin'},
];
const catMap = Object.fromEntries(CATEGORIES.map(c=>[c.id,c]));

/* =====================================================================
   ÄMNESIKONER — små linjeikoner per ämnestyp, används i ämneslistan
===================================================================== */
const ICON_PATHS = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="M12 12 15 7 12 12 9 17Z" fill="currentColor" stroke="none"/>',
  light:   '<circle cx="12" cy="10" r="5.5"/><path d="M9 18.5h6M10 21h4"/>',
  rule:    '<path d="M12 3.5 21.5 20 2.5 20Z" stroke-width="2.1"/><path d="M12 9.5v5" stroke-width="2.1"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/>',
  sound:   '<path d="M3 12c2 0 2-4 4-4s2 8 4 8 2-8 4-8 2 4 4 4"/>',
  anchor:  '<circle cx="12" cy="6" r="2"/><path d="M12 8v11M8 12H5a7 7 0 0 0 7 7 7 7 0 0 0 7-7h-3"/>',
  sail:    '<path d="M6 20h12M12 20V4l7 12z"/>',
  radar:   '<circle cx="12" cy="12" r="9"/><path d="M12 12 12 4.5A7.5 7.5 0 0 1 19.5 12Z" fill="currentColor" stroke="none" opacity="0.55"/><circle cx="15.2" cy="8.3" r="1" fill="currentColor" stroke="none"/>',
  radio:   '<path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M7.5 12.5a4.5 4.5 0 0 1 9 0M4.5 9.5a7.9 7.9 0 0 1 15 0"/>',
  scale:   '<path d="M12 3v18M5 8h14M5 8l-2.2 5.5h4.4ZM19 8l-2.2 5.5h4.4Z"/>',
  cloud:   '<path d="M7 18a4 4 0 1 1 .6-8 5 5 0 0 1 9.7 1.5A3.5 3.5 0 0 1 17 18Z"/>',
  flame:   '<path d="M12 3c2 3-3 5-1 9 .5 1 2 2 3 1 1-1 .5-2 .5-2 1 1 1.5 2.5 1 4-.5 1.5-2.5 3-4.5 3-3 0-6-2-6-5.5C5 8 9 6 12 3Z"/>',
  cross:   '<path d="M12 4v16M4 12h16" stroke-width="2.6"/>',
  ring:    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 4v4.6M12 15.4V20M4 12h4.6M15.4 12H20"/>',
  gear:    '<circle cx="12" cy="12" r="6.4" fill="none" stroke="currentColor" stroke-width="2.1"/><rect x="10.4" y="1.3" width="3.2" height="4.2" rx="0.6" transform="rotate(0 12 12)" fill="currentColor" stroke="none"/><rect x="10.4" y="1.3" width="3.2" height="4.2" rx="0.6" transform="rotate(45 12 12)" fill="currentColor" stroke="none"/><rect x="10.4" y="1.3" width="3.2" height="4.2" rx="0.6" transform="rotate(90 12 12)" fill="currentColor" stroke="none"/><rect x="10.4" y="1.3" width="3.2" height="4.2" rx="0.6" transform="rotate(135 12 12)" fill="currentColor" stroke="none"/><rect x="10.4" y="1.3" width="3.2" height="4.2" rx="0.6" transform="rotate(180 12 12)" fill="currentColor" stroke="none"/><rect x="10.4" y="1.3" width="3.2" height="4.2" rx="0.6" transform="rotate(225 12 12)" fill="currentColor" stroke="none"/><rect x="10.4" y="1.3" width="3.2" height="4.2" rx="0.6" transform="rotate(270 12 12)" fill="currentColor" stroke="none"/><rect x="10.4" y="1.3" width="3.2" height="4.2" rx="0.6" transform="rotate(315 12 12)" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  flag:    '<path d="M6 21V4M6 4h12l-4 4 4 4H6"/>',
};
const CATEGORY_ICONS = {
  sjokort:'compass', fyrar:'light', lanternor:'light', dag:'flag', flaggsignaler:'flag',
  def:'rule', 'fart-risk':'rule', farled:'rule', kurs:'rule', ansvar:'rule', sikt:'rule',
  ljud:'sound', 'lots-fiske':'anchor', segelregler:'sail',
  radar:'radar', radio:'radio', tsfs:'scale', sjoratt:'scale',
  meteorologi:'cloud', brand:'flame', sjukvard:'cross', livraddning:'ring',
  skeppsteknik:'gear', 'mask-motorprincip':'gear', 'mask-verkgrad':'gear', 'mask-bransle':'gear',
};


/* =====================================================================
   FRÅGEBANK
   sound: {pattern:['S'|'L',...]} ger en spelbar ljudsignal (S=kort ca 1s, L=lång ca 4-6s)
===================================================================== */
