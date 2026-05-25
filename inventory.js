/* ============================================================
   inventory.js — Version corrigée et compatible (ES5/ES6)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("invSearch");
  const filterType = document.getElementById("invFilterType");

  if (searchInput) searchInput.addEventListener("input", filterAndDisplayInventory);
  if (filterType) filterType.addEventListener("change", filterAndDisplayInventory);
});

async function loadInventory() {
  await filterAndDisplayInventory();
}

async function filterAndDisplayInventory() {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  const wines = await dbGetAllWines();
  
  // Remplacement de ?. par une vérification de sécurité classique
  const searchInput = document.getElementById("invSearch");
  const query = (searchInput && searchInput.value) ? searchInput.value.toLowerCase() : "";
  
  const filterType = document.getElementById("invFilterType");
  const selectedType = (filterType && filterType.value) ? filterType.value : "";

  const filtered = wines.filter(w => {
    const cuvee = (w.identity && w.identity.cuvee) ? w.identity.cuvee : "";
    const domain = (w.identity && w.identity.domain) ? w.identity.domain : "";
    
    const textMatch = cuvee.toLowerCase().includes(query) || domain.toLowerCase().includes(query);
    const typeMatch = selectedType === "" || (w.identity && w.identity.type === selectedType);
    
    return textMatch && typeMatch;
  });

  // Injection dans le tableau...
  tbody.innerHTML = filtered.map(w => `
    <tr>
      <td>${(w.identity && w.identity.cuvee) ? w.identity.cuvee : "Inconnu"}</td>
      <td>${(w.identity && w.identity.type) ? w.identity.type : "-"}</td>
      <td>${w.quantity || 0}</td>
      <td style="text-align:right;">
        <button onclick="editWine('${w.id}')">✏️</button>
      </td>
    </tr>
  `).join("");
}

// Correction similaire pour l'édition d'une bouteille
function editWine(id) {
    // ... votre logique existante ...
    // Assurez-vous d'utiliser (wine.identity && wine.identity.cuvee) 
    // au lieu de wine.identity?.cuvee
}