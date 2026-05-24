/* ============================================================
   db.js — Gestion de la base de données Localbase
   ============================================================ */

let db = new Localbase('cave');

/* ------------------------------------------------------------
   Ajouter un vin
------------------------------------------------------------ */
async function dbAddWine(wine) {
  await db.collection('wines').add(wine);
}

/* ------------------------------------------------------------
   Mettre à jour un vin
------------------------------------------------------------ */
async function dbUpdateWine(id, wine) {
  await db.collection('wines').doc({ id }).set(wine);
}

/* ------------------------------------------------------------
   Supprimer un vin
------------------------------------------------------------ */
async function dbDeleteWine(id) {
  await db.collection('wines').doc({ id }).delete();
}

/* ------------------------------------------------------------
   Récupérer un vin par ID
------------------------------------------------------------ */
async function dbGetWine(id) {
  return await db.collection('wines').doc({ id }).get();
}

/* ------------------------------------------------------------
   Récupérer tous les vins
------------------------------------------------------------ */
async function dbGetAllWines() {
  return await db.collection('wines').get();
}

/* ------------------------------------------------------------
   Recherche simple (nom, région, cépage)
------------------------------------------------------------ */
async function dbSearch(query) {
  const wines = await dbGetAllWines();
  const q = query.toLowerCase();

  return wines.filter(w =>
    (w.identity.cuvee || "").toLowerCase().includes(q) ||
    (w.identity.region || "").toLowerCase().includes(q) ||
    (w.identity.grapes || []).join(" ").toLowerCase().includes(q)
  );
}

/* ------------------------------------------------------------
   Vérifier si une bouteille existe déjà (mode magasin)
------------------------------------------------------------ */
async function dbFindSimilarWine(name) {
  const wines = await dbGetAllWines();
  const q = name.toLowerCase();

  return wines.find(w =>
    (w.identity.cuvee || "").toLowerCase().includes(q) ||
    (w.identity.producer || "").toLowerCase().includes(q)
  );
}

/* ------------------------------------------------------------
   Générer un ID unique
------------------------------------------------------------ */
function dbGenerateId() {
  return Date.now().toString();
}