/* ============================================================
   ui.js — Navigation logicielle et Contrôles du Menu Hamburger
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const overlay = document.getElementById("menuOverlay");
  const sideMenu = document.getElementById("sideMenu");

  function toggleMenu() {
    const isNowOpen = sideMenu.classList.toggle("open");
    overlay.style.display = isNowOpen ? "block" : "none";
  }

  if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
  if (overlay) overlay.addEventListener("click", toggleMenu);

  // Rendre accessible globalement pour fermer le menu après sauvegarde des réglages
  window.toggleMenu = toggleMenu;
});

// Système unifié de navigation inter-écrans (Views)
window.switchView = function(viewId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("visible");
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add("visible");
  }

  // Fermeture automatique du menu hamburger si ouvert au changement de vue
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("menuOverlay");
  if (sideMenu && sideMenu.classList.contains("open")) {
    sideMenu.classList.remove("open");
    if (overlay) overlay.style.display = "none";
  }

  // Mise à jour de la surbrillance des onglets du bas
  if (typeof setActiveTab === "function") {
    setActiveTab(viewId);
  }

  // Déclencheurs de chargement dynamiques selon l'écran actif
  if (viewId === "view-list" && typeof renderWineList === "function") renderWineList();
  if (viewId === "view-inventory" && typeof loadInventory === "function") loadInventory();
  if (viewId === "view-alerts" && typeof loadAlerts === "function") loadAlerts();
  if (viewId === "view-shop" && typeof loadShopList === "function") loadShopList();
  if (viewId === "view-stats" && typeof loadStats === "function") loadStats();
};