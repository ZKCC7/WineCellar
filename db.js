// ============================================================
// db.js — Couche base de données (LocalBase / IndexedDB)
// ============================================================

if (typeof LocalBase === 'undefined') {
  console.error('LocalBase non chargé — vérifiez votre connexion internet.');
}
const db = new LocalBase('wineCellar_v2');

// Générer un ID unique
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── WINES CRUD ──

async function dbGetAllWines() {
  try {
    return await db.collection('wines').get() || [];
  } catch (e) {
    console.error('dbGetAllWines:', e);
    return [];
  }
}

async function dbGetWine(id) {
  try {
    const wines = await db.collection('wines').get();
    return wines.find(w => w.id === id) || null;
  } catch (e) {
    console.error('dbGetWine:', e);
    return null;
  }
}

async function dbSaveWine(wine) {
  try {
    if (!wine.id) {
      wine.id = generateId();
      wine.createdAt = new Date().toISOString();
    }
    wine.updatedAt = new Date().toISOString();
    await db.collection('wines').doc({ id: wine.id }).set(wine);
    return wine;
  } catch (e) {
    console.error('dbSaveWine:', e);
    throw e;
  }
}

async function dbDeleteWine(id) {
  try {
    await db.collection('wines').doc({ id }).delete();
  } catch (e) {
    console.error('dbDeleteWine:', e);
    throw e;
  }
}

// ── DEMO DATA ──

async function injectDemoData() {
  const demos = [
    {
      identity: { cuvee: 'Château Margaux', domain: 'Château Margaux', vintage: '2018', type: 'Rouge', appellation: 'Margaux', region: 'Bordeaux', country: 'France' },
      rating: { score: 98, source: 'Wine Spectator' },
      aging: { drinkFrom: '2026', drinkTo: '2048' },
      quantity: 3, size: '75cl', location: 'A1', price: 650, notes: 'Grand cru exceptionnel'
    },
    {
      identity: { cuvee: 'Dom Pérignon', domain: 'Moët & Chandon', vintage: '2013', type: 'Champagne', appellation: 'Champagne', region: 'Champagne', country: 'France' },
      rating: { score: 95, source: 'Vinous' },
      aging: { drinkFrom: '2024', drinkTo: '2033' },
      quantity: 2, size: '75cl', location: 'B2', price: 220, notes: ''
    },
    {
      identity: { cuvee: 'Barolo Riserva', domain: 'Gaja', vintage: '2016', type: 'Rouge', appellation: 'Barolo DOCG', region: 'Piémont', country: 'Italie' },
      rating: { score: 97, source: 'Robert Parker' },
      aging: { drinkFrom: '2027', drinkTo: '2042' },
      quantity: 1, size: '75cl', location: 'A3', price: 280, notes: ''
    },
    {
      identity: { cuvee: 'Meursault Les Charmes', domain: 'Domaine Michelot', vintage: '2020', type: 'Blanc', appellation: 'Meursault 1er Cru', region: 'Bourgogne', country: 'France' },
      rating: { score: 91, source: 'Decanter' },
      aging: { drinkFrom: '2023', drinkTo: '2030' },
      quantity: 4, size: '75cl', location: 'C1', price: 85, notes: 'Belle minéralité'
    }
  ];
  for (const w of demos) await dbSaveWine(w);
  alert('Données de test injectées !');
  if (typeof loadWineList === 'function') loadWineList();
}

window.dbGetAllWines = dbGetAllWines;
window.dbGetWine = dbGetWine;
window.dbSaveWine = dbSaveWine;
window.dbDeleteWine = dbDeleteWine;
window.injectDemoData = injectDemoData;
