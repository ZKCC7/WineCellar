/* ============================================================
   db.js — Gestion de la base de données Localbase
   ============================================================ */

let db = new Localbase('cave');

/* ------------------------------------------------------------
   Ajouter un vin
------------------------------------------------------------ */
async function dbAddWine(wine) {
  if (!wine || typeof wine !== "object") {
    console.error("❌ dbAddWine : vin invalide", wine);
    return;
  }
  await db.collection('wines').add(wine);
}

/* ------------------------------------------------------------
   Mettre à jour un vin
------------------------------------------------------------ */
async function dbUpdateWine(id, wine) {
  if (!id) {
    console.error("❌ dbUpdateWine : ID manquant");
    return;
  }
  await db.collection('wines').doc({ id }).set(wine);
}

/* ------------------------------------------------------------
   Supprimer un vin
------------------------------------------------------------ */
async function dbDeleteWine(id) {
  if (!id) {
    console.error("❌ dbDeleteWine : ID manquant");
    return;
  }
  await db.collection('wines').doc({ id }).delete();
}

/* ------------------------------------------------------------
   Récupérer un vin par ID
------------------------------------------------------------ */
async function dbGetWine(id) {
  if (!id) {
    console.error("❌ dbGetWine : ID manquant");
    return null;
  }
  return await db.collection('wines').doc({ id }).get();
}

/* ------------------------------------------------------------
   Récupérer tous les vins
------------------------------------------------------------ */
async function dbGetAllWines() {
  const wines = await db.collection('wines').get();
  return Array.isArray(wines) ? wines : [];
}

/* ------------------------------------------------------------
   Recherche simple (nom, région, cépage)
------------------------------------------------------------ */
async function dbSearch(query) {
  const wines = await dbGetAllWines();
  const q = (query || "").toLowerCase();

  return wines.filter(w =>
    (w.identity?.cuvee || "").toLowerCase().includes(q) ||
    (w.identity?.region || "").toLowerCase().includes(q) ||
    (w.identity?.grapes || []).join(" ").toLowerCase().includes(q)
  );
}

/* ------------------------------------------------------------
   Vérifier si une bouteille existe déjà (mode magasin)
------------------------------------------------------------ */
async function dbFindSimilarWine(name) {
  const wines = await dbGetAllWines();
  const q = (name || "").toLowerCase();

  return wines.find(w =>
    (w.identity?.cuvee || "").toLowerCase().includes(q) ||
    (w.identity?.producer || "").toLowerCase().includes(q)
  );
}

/* ------------------------------------------------------------
   Générer un ID unique
------------------------------------------------------------ */
function dbGenerateId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000);
}
