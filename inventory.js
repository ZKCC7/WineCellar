/* ============================================================
   inventory.js — Inventaire rapide
   ============================================================ */

async function loadInventory() {
  const wines = await dbGetAllWines();
  const div = document.getElementById("inventoryContent");

  if (!wines.length) {
    div.innerHTML = `<div class="card">Aucune bouteille.</div>`;
    return;
  }

  div.innerHTML = wines
    .map(
      w => `
      <div class="card">
        <h3>${w.identity.cuvee} (${w.identity.vintage})</h3>
        <p>${w.identity.producer}</p>

        <div style="display:flex;align-items:center;gap:1rem;">
          <button class="btn" onclick="invMinus('${w.id}')">−</button>
          <span><b>${w.purchase.quantity}</b> bouteilles</span>
          <button class="btn" onclick="invPlus('${w.id}')">+</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function invPlus(id) {
  const wine = await dbGetWine(id);
  wine.purchase.quantity++;
  await dbUpdateWine(id, wine);
  loadInventory();
}

async function invMinus(id) {
  const wine = await dbGetWine(id);
  if (wine.purchase.quantity > 0) wine.purchase.quantity--;
  await dbUpdateWine(id, wine);
  loadInventory();
}