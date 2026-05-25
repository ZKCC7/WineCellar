/* ============================================================
   inventory.js — Inventaire rapide
   ============================================================ */

async function loadInventory() {
  const wines = await dbGetAllWines();
  const div = document.getElementById("inventoryContent");

  if (!div) {
    console.warn("⚠️ Élément #inventoryContent introuvable.");
    return;
  }

  if (!wines || wines.length === 0) {
    div.innerHTML = `<div class="card">Aucune bouteille.</div>`;
    return;
  }

  div.innerHTML = wines
    .map(w => `
      <div class="card">
        <h3>${w.identity?.cuvee || "Sans nom"} (${w.identity?.vintage || "?"})</h3>
        <p>${w.identity?.producer || "Producteur inconnu"}</p>

        <div style="display:flex;align-items:center;gap:1rem;">
          <button class="btn" onclick="invMinus('${w.id}')">−</button>
          <span><b>${w.purchase?.quantity ?? 0}</b> bouteilles</span>
          <button class="btn" onclick="invPlus('${w.id}')">+</button>
        </div>
      </div>
    `)
    .join("");
}

/* ------------------------------------------------------------
   Ajouter une bouteille
------------------------------------------------------------ */
async function invPlus(id) {
  const wine = await dbGetWine(id);

  if (!wine) {
    console.error("❌ invPlus : vin introuvable", id);
    return;
  }

  if (!wine.purchase) wine.purchase = { quantity: 0 };

  wine.purchase.quantity++;
  await dbUpdateWine(id, wine);
  loadInventory();
}

/* ------------------------------------------------------------
   Retirer une bouteille
------------------------------------------------------------ */
async function invMinus(id) {
  const wine = await dbGetWine(id);

  if (!wine) {
    console.error("❌ invMinus : vin introuvable", id);
    return;
  }

  if (!wine.purchase) wine.purchase = { quantity: 0 };

  if (wine.purchase.quantity > 0) {
    wine.purchase.quantity--;
    await dbUpdateWine(id, wine);
  }

  loadInventory();
}
