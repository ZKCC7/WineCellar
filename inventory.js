/* ============================================================
   inventory.js — Version complète, corrigée et compatible
   ============================================================ */

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
   Filtrage et injection des données dans le tableau
------------------------------------------------------------ */
async function filterAndDisplayInventory() {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  const wines = await dbGetAllWines();
  
  // Récupération sécurisée des valeurs des inputs
  const searchInput = document.getElementById("invSearch");
  const query = (searchInput && searchInput.value) ? searchInput.value.toLowerCase() : "";
  
  const filterType = document.getElementById("invFilterType");
  const selectedType = (filterType && filterType.value) ? filterType.value : "";

  // Filtrage combiné (sans ?. pour éviter les erreurs)
  const filtered = wines.filter(w => {
    const id = w.identity || {};
    const cuvee = (id.cuvee || "").toLowerCase();
    const domain = (id.domain || "").toLowerCase();
    const type = id.type || "";
    
    const textMatch = cuvee.includes(query) || domain.includes(query);
    const typeMatch = (selectedType === "" || type === selectedType);
    
    return textMatch && typeMatch;
  });

  // Construction du HTML du tableau
  tbody.innerHTML = filtered.map(w => {
    const id = w.identity || {};
    return `
    <tr>
      <td>${id.cuvee || "Inconnu"}</td>
      <td>${id.type || "-"}</td>
      <td>${w.quantity || 0}</td>
      <td style="text-align:right;">
        <button onclick="editWine('${w.id}')">✏️</button>
      </td>
    </tr>`;
  }).join("");
}

/* ------------------------------------------------------------
   Édition d'une bouteille (Remplissage formulaire)
------------------------------------------------------------ */
async function editWine(id) {
  const wine = await dbGetWine(id);
  if (!wine) return;

  const idData = wine.identity || {};
  const agingData = wine.aging || {};

  // Remplissage des champs (sécurisé)
  if (document.getElementById("wineCuvee")) document.getElementById("wineCuvee").value = idData.cuvee || "";
  if (document.getElementById("wineDomain")) document.getElementById("wineDomain").value = idData.domain || "";
  if (document.getElementById("wineVintage")) document.getElementById("wineVintage").value = idData.vintage || "";
  if (document.getElementById("wineType")) document.getElementById("wineType").value = idData.type || "Rouge";
  if (document.getElementById("wineAppellation")) document.getElementById("wineAppellation").value = idData.appellation || "";
  if (document.getElementById("wineRegion")) document.getElementById("wineRegion").value = idData.region || "";
  if (document.getElementById("wineCountry")) document.getElementById("wineCountry").value = idData.country || "France";
  if (document.getElementById("wineQty")) document.getElementById("wineQty").value = wine.quantity || 1;
  if (document.getElementById("wineSize")) document.getElementById("wineSize").value = wine.size || "75cl";
  if (document.getElementById("wineLocation")) document.getElementById("wineLocation").value = wine.location || "";
  if (document.getElementById("wineBarcode")) document.getElementById("wineBarcode").value = wine.barcode || "";
  if (document.getElementById("wineDrinkFrom")) document.getElementById("wineDrinkFrom").value = agingData.drinkFrom || "";
  if (document.getElementById("wineDrinkTo")) document.getElementById("wineDrinkTo").value = agingData.drinkTo || "";

  // Navigation
  if (document.getElementById("formTitle")) document.getElementById("formTitle").innerText = "Modifier la bouteille";
  if (typeof switchView === "function") switchView("view-add");
}

/* ------------------------------------------------------------
   Suppression
------------------------------------------------------------ */
async function deleteWineFromInv(id) {
  if (confirm("Voulez-vous vraiment retirer cette référence de l'inventaire ?")) {
    await dbDeleteWine(id);
    filterAndDisplayInventory();
  }
}