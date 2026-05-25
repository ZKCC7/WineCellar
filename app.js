/* ===========================================================
   app.js — Gestion unifiée de la navigation par onglets
   =========================================================== */

// Met à jour la surbrillance visuelle de l'onglet actif dans la barre basse
function setActiveTab(viewId) {
  // Convertit l'ID de la vue en ID de l'onglet correspondant
  const screenMapping = {
    "view-list": "listView",
    "view-inventory": "inventoryView",
    "view-alerts": "alertsView",
    "view-shop": "shopView",
    "view-scan": "scanView",
    "view-stats": "statsView",
    "view-settings": "settingsView",
    "view-add": "" // Pas d'onglet actif pour le formulaire d'ajout direct
  };

  const activeTabId = screenMapping[viewId];

  document.querySelectorAll(".navItem").forEach(item => {
    if (item.dataset.screen === activeTabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

// Intercepte et enrobe la fonction globale existante switchView pour gérer les onglets
const originalSwitchView = window.switchView;
window.switchView = function(viewId) {
  if (typeof originalSwitchView === "function") {
    originalSwitchView(viewId);
  } else {
    // Mode de secours si initialisation précoce
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("visible"));
    const target = document.getElementById(viewId);
    if (target) target.classList.add("visible");
  }
  
  // Met à jour les styles des onglets
  setActiveTab(viewId);
};

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  
  // Écouteur sur chaque onglet de la barre inférieure
  document.querySelectorAll(".navItem").forEach(item => {
    item.addEventListener("click", () => {
      const targetTab = item.dataset.screen;
      if (!targetTab) return;

      // Correspondance vers tes véritables IDs de sections HTML (<section id="view-...">)
      const viewMapping = {
        "listView": "view-list",
        "inventoryView": "view-inventory",
        "alertsView": "view-alerts",
        "shopView": "view-shop",
        "scanView": "view-scan",
        "statsView": "view-stats",
        "settingsView": "view-settings"
      };

      const targetView = viewMapping[targetTab];
      
      if (targetView) {
        window.switchView(targetView);
      }
    });
  });

  // Bouton "➕ Ajouter" situé dans l'en-tête (Header)
  const addBtn = document.getElementById("addBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      window.switchView("view-add");
    });
  }
  
  // Lance la vue par défaut sans planter
  window.switchView("view-list");
});