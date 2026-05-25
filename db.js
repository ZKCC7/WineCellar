// Initialisation de la base de données
const db = new LocalBase('wineCellar');

// Fonction pour injecter des données de test
async function injectDemoData() {
  const demoWines = [
    { cuvee: "Château Margaux", domain: "Château Margaux", vintage: "2018", type: "Rouge", qty: 3, drinkTo: "2028-12-31" },
    { cuvee: "Dom Pérignon", domain: "Moët & Chandon", vintage: "2012", type: "Champagne", qty: 2, drinkTo: "2025-12-31" },
    { cuvee: "Barolo", domain: "Gaja", vintage: "2015", type: "Rouge", qty: 1, drinkTo: "2026-12-31" }
  ];

  for (const wine of demoWines) {
    await db.collection('wines').add(wine);
  }
  alert("Données de test injectées avec succès !");
}

// Exposition globale
window.injectDemoData = injectDemoData;