/* ============================================================
   shop.js — Gestion de la liste de courses / réapprovisionnement
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const shopForm = document.getElementById("shopForm");
  if (shopForm) {
    shopForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("shopItemText");
      if (!input || !input.value.trim()) return;

      const itemText = input.value.trim();
      await addShopItem(itemText);
      input.value = ""; // Vider le champ de saisie
      await loadShopList(); // Rafraîchir l'UI
    });
  }
});

/* ------------------------------------------------------------
   Charger et dessiner la liste d'achats
------------------------------------------------------------ */
async function loadShopList() {
  const container = document.getElementById("shopListContainer");
  if (!container) return;

  const items = await dbGetShopItems();

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.9rem;">
        🛒 Votre liste d'achats est vide.
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <li style="display:flex; justify-content:between; align-items:center; padding:12px; border-bottom:1px solid var(--border-color); gap:12px;">
      <span style="flex:1; font-size:0.95rem; color:var(--text-main); font-weight:500;">
        💡 ${escapeHTML(item.text)}
      </span>
      <button class="btn btn-danger" style="padding:6px 10px; font-size:0.8rem;" onclick="deleteShopItemFromUI('${item.id}')">
        🗑️ Retirer
      </button>
    </li>
  `).join("");
}

/* ------------------------------------------------------------
   Contrôleurs d'actions
------------------------------------------------------------ */
async function addShopItem(text) {
  const newItem = {
    id: "shop-" + Date.now(),
    text: text
  };
  await dbSaveShopItem(newItem);
}

async function deleteShopItemFromUI(id) {
  await dbDeleteShopItem(id);
  await loadShopList();
}

/* Utilitaire de sécurité anti-XSS simple pour l'injection HTML */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}