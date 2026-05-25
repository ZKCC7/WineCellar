/* ===========================================================
   app.js — Routage et Initialisation Globale des Événements
   =========================================================== */

function setActiveTab(viewId) {
  const viewToTabMap = {
    "view-list": "listView",
    "view-inventory": "inventoryView",
    "view-alerts": "alertsView",
    "view-shop": "shopView",
    "view-scan": "scanView",
    "view-stats": "statsView",
    "view-add": "" 
  };

  const activeTabName = viewToTabMap[viewId];

  document.querySelectorAll(".navItem").forEach(tabBtn => {
    if (tabBtn.dataset.screen === activeTabName) {
      tabBtn.classList.add("active");
    } else {
      tabBtn.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Liaison des clics des onglets inférieurs
  document.querySelectorAll(".navItem").forEach(item => {
    item.addEventListener("click", () => {
      const targetScreen = item.dataset.screen;
      if (!targetScreen) return;

      const screenMapping = {
        "listView": "view-list",
        "inventoryView": "view-inventory",
        "alertsView": "view-alerts",
        "shopView": "view-shop",
        "scanView": "view-scan",
        "statsView": "view-stats"
      };

      const viewId = screenMapping[targetScreen];
      if (viewId && typeof switchView === "function") {
        window.switchView(viewId);
      }
    });
  });

  // Premier chargement : Affichage de la cave par défaut
  if (typeof renderWineList === "function") renderWineList();
});