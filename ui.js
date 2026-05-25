/* ============================================================
   ui.js — Logique d'affichage des écrans et Menu Hamburger
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const overlay = document.getElementById("menuOverlay");
  const sideMenu = document.getElementById("sideMenu");

  function toggleMenu() {
    const isNowOpen = sideMenu.classList.toggle("open");
    if (overlay) {
      overlay.style.display = isNowOpen ? "block" : "none";
    }
  }

  if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
  if (overlay) overlay.addEventListener("click", toggleMenu);

  // Rendre la fermeture disponible globalement
  window.toggleMenu = toggleMenu;
});

// Système unifié de routage des vues applicatives
window.switchView = function(viewId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("visible");
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add("visible");
  }

  // Si le menu hamburger est ouvert, on le referme proprement
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("menuOverlay");
  if (sideMenu && sideMenu.classList.contains("open")) {
    sideMenu.classList.remove("open");
    if (overlay) overlay.style.display = "none";
  }

  // Met à jour la surbrillance de l'onglet actif dans le bandeau inférieur
  if (typeof setActiveTab === "function") {
    setActiveTab(viewId);
  }

  // Rappels de chargement dynamique de données selon la vue ciblée
  if (viewId === "view-list" && typeof renderWineList === "function") renderWineList();
  if (viewId === "view-inventory" && typeof loadInventory === "function") loadInventory();
  if (viewId === "view-alerts" && typeof loadAlerts === "function") loadAlerts();
  if (viewId === "view-shop" && typeof loadShopList === "function") loadShopList();
  if (viewId === "view-stats" && typeof loadStats === "function") loadStats();
};