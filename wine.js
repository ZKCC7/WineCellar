// ============================================================
// wines.js — Base de données locale des vins
// Optimisée pour le scan OCR (Tesseract)
// ============================================================

const winesDB = [

  // --- ITALIE ---
  {
    id: 1,
    nom: "Chianti Classico Don Giovanni",
    producteur: "Terre Natuzzi",
    annee: 2019,
    pays: "Italie",
    region: "Toscane",
    motsCles: [
      "chianti", "classico", "don giovanni", "giovanni",
      "terre natuzzi", "natuzzi", "toscane", "italie", "2019"
    ]
  },

  {
    id: 2,
    nom: "Barolo Riserva",
    producteur: "Marchesi di Barolo",
    annee: 2017,
    pays: "Italie",
    region: "Piémont",
    motsCles: [
      "barolo", "riserva", "marchesi", "piedmont", "piémont", "2017"
    ]
  },

  // --- FRANCE : BORDEAUX ---
  {
    id: 3,
    nom: "Château Margaux",
    producteur: "Château Margaux",
    annee: 2018,
    pays: "France",
    region: "Bordeaux",
    motsCles: [
      "margaux", "chateau margaux", "bordeaux", "grand cru", "2018"
    ]
  },

  {
    id: 4,
    nom: "Château Haut-Brion",
    producteur: "Domaine Clarence Dillon",
    annee: 2016,
    pays: "France",
    region: "Bordeaux",
    motsCles: [
      "haut brion", "chateau haut brion", "clarence dillon",
      "pessac", "bordeaux", "2016"
    ]
  },

  // --- FRANCE : RHÔNE ---
  {
    id: 5,
    nom: "Côtes-du-Rhône Réserve",
    producteur: "Domaine de la Vallée",
    annee: 2020,
    pays: "France",
    region: "Rhône",
    motsCles: [
      "cotes du rhone", "côtes du rhône", "reserve",
      "domaine de la vallee", "2020"
    ]
  },

  {
    id: 6,
    nom: "Châteauneuf-du-Pape Tradition",
    producteur: "Domaine du Vieux Télégraphe",
    annee: 2019,
    pays: "France",
    region: "Rhône",
    motsCles: [
      "chateauneuf du pape", "châteauneuf-du-pape", "vieux telegraphe",
      "tradition", "2019"
    ]
  },

  // --- FRANCE : BOURGOGNE ---
  {
    id: 7,
    nom: "Bourgogne Pinot Noir",
    producteur: "Louis Jadot",
    annee: 2021,
    pays: "France",
    region: "Bourgogne",
    motsCles: [
      "bourgogne", "pinot noir", "jadot", "louis jadot", "2021"
    ]
  },

  {
    id: 8,
    nom: "Meursault Les Charmes",
    producteur: "Domaine Michelot",
    annee: 2020,
    pays: "France",
    region: "Bourgogne",
    motsCles: [
      "meursault", "les charmes", "michelot", "bourgogne", "2020"
    ]
  },

  // --- ESPAGNE ---
  {
    id: 9,
    nom: "Rioja Reserva",
    producteur: "Marqués de Riscal",
    annee: 2018,
    pays: "Espagne",
    region: "Rioja",
    motsCles: [
      "rioja", "reserva", "riscal", "marques de riscal", "2018"
    ]
  },

  {
    id: 10,
    nom: "Ribera del Duero Crianza",
    producteur: "Pago de los Capellanes",
    annee: 2019,
    pays: "Espagne",
    region: "Ribera del Duero",
    motsCles: [
      "ribera del duero", "crianza", "capellanes", "pago de los capellanes",
      "2019"
    ]
  }
];
