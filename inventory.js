/* ============================================================
   inventory.js — Gestion de l'affichage de la cave & filtres
   ============================================================ */

// Écouteurs globaux de la vue inventaire
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("invSearch");
  const filterType = document.getElementById("invFilterType");

  if (searchInput) searchInput.addEventListener("input", filterAndDisplayInventory);
  if (filterType) filterType.addEventListener("change", filterAndDisplayInventory);
});

/* ------------------------------------------------------------
   Charger et afficher l'inventaire global
------------------------------------------------------------ */
async function loadInventory() {
  await filterAndDisplayInventory();
}

/* ------------------------------------------------------------
   Filtrer et injecter les lignes du tableau
------------------------------------------------------------ */
async function filterAndDisplayInventory() {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  const wines = await dbGetAllWines();
  const query = document.getElementById("invSearch")?.value.toLowerCase() || "";
  const selectedType = document.getElementById("invFilterType")?.value || "";

  // Filtrage combiné recherche texte + filtre sélecteur type
  const filtered = wines.filter(w => {
    const textMatch = 
      (w.identity?.cuvee || "").toLowerCase().includes(query) ||
      (w.identity?.domain || "").toLowerCase().includes(query) ||
      (w.identity?.appellation || "").toLowerCase().includes(query);
    
    const typeMatch = selectedType === "" || w.identity?.type === selectedType;
    
    return textMatch && typeMatch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">
          Aucune bouteille ne correspond à vos critères de recherche.
        </td>
      </tr>
    `;
    return;
  }

  // Tri par défaut : alphabétique sur la cuvée
  filtered.sort((a, b) => (a.identity?.cuvee || "").localeCompare(b.identity?.cuvee || ""));

  tbody.innerHTML = filtered.map(w => {
    // Calcul de l'affichage de la garde courte
    const guardText = w.aging?.drinkTo 
      ? new Date(w.aging.drinkTo).getFullYear() 
      : "Non renseignée";

    return `
      <tr>
        <td>
          <div style="font-weight:600; color:var(--primary);">${w.identity?.cuvee || "Sans nom"}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${w.identity?.domain || "—"}</div>
        </td>
        <td><span style="font-size:0.85rem; padding:3px 8px; border-radius:4px; background:#f3f4f6;">${w.identity?.type || "Rouge"}</span></td>
        <td><b>${w.identity?.vintage || "—"}</b></td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <button onclick="updateQty('${w.id}', -1)" style="padding:2px 6px; cursor:pointer; background:#eee; border:none; border-radius:4px;">-</button>
            <span style="font-weight:bold; min-width:20px; text-align:center;">${w.quantity}</span>
            <button onclick="updateQty('${w.id}', 1)" style="padding:2px 6px; cursor:pointer; background:#eee; border:none; border-radius:4px;">+</button>
          </div>
        </td>
        <td><span style="font-size:0.85rem;">⏳ Max ${guardText}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary" style="padding:6px 10px; font-size:0.8rem;" onclick="editWine('${w.id}')">✏️</button>
            <button class="btn btn-danger" style="padding:6px 10px; font-size:0.8rem;" onclick="deleteWineFromInv('${w.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

/* ------------------------------------------------------------
   Modifier la quantité en direct (+ / -)
------------------------------------------------------------ */
async function updateQty(id, change) {
  const wine = await dbGetWine(id);
  if (!wine) return;

  wine.quantity = parseInt(wine.quantity || 0, 10) + change;
  if (wine.quantity < 0) wine.quantity = 0;

  await dbUpdateWine(wine);
  filterAndDisplayInventory();
  
  // Si la vue d'alerte tourne en arrière plan, on synchronise implicitement
  if(typeof loadAlerts === "function") loadAlerts();
}

/* ------------------------------------------------------------
   Bouton Modifier (Charge dans le formulaire global)
------------------------------------------------------------ */
async function editWine(id) {
  const wine = await dbGetWine(id);
  if (!wine) return;

  // Remplissage méticuleux du formulaire
  document.getElementById("wineId").value = wine.id;
  document.getElementById("wineCuvee").value = wine.identity?.cuvee || "";
  document.getElementById("wineDomain").value = wine.identity?.domain || "";
  document.getElementById("wineVintage").value = wine.identity?.vintage || "";
  document.getElementById("wineType").value = wine.identity?.type || "Rouge";
  document.getElementById("wineAppellation").value = wine.identity?.appellation || "";
  document.getElementById("wineRegion").value = wine.identity?.region || "";
  document.getElementById("wineCountry").value = wine.identity?.country || "France";
  document.getElementById("wineQty").value = wine.quantity || 1;
  document.getElementById("wineSize").value = wine.size || "75cl";
  document.getElementById("wineLocation").value = wine.location || "";
  document.getElementById("wineBarcode").value = wine.barcode || "";
  document.getElementById("wineDrinkFrom").value = wine.aging?.drinkFrom || "";
  document.getElementById("wineDrinkTo").value = wine.aging?.drinkTo || "";

  // Changement de titre de la section
  document.getElementById("formTitle").innerText = "Modifier la bouteille";

  // Navigation logicielle vers l'écran d'édition
  switchView("view-add");
}

/* ------------------------------------------------------------
   Supprimer définitivement l'entrée
------------------------------------------------------------ */
async function deleteWineFromInv(id) {
  if (confirm("Voulez-vous vraiment retirer cette référence de l'inventaire ?")) {
    await dbDeleteWine(id);
    filterAndDisplayInventory();
  }
}