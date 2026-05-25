/* ===========================================================
   app.js — Gestion unifiée de la navigation par onglets
   =========================================================== */

// Affiche un écran et cache les autres
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("visible"));
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add("visible");
  } else {
    console.error(`❌ Écran #${screenId} introuvable dans le DOM.`);
  }
}

// Gère la mise en surbrillance de l'onglet actif en bas
function setActiveTab(screenId) {
  document.querySelectorAll(".navItem").forEach(item => {
    if (item.dataset.screen === screenId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

// Initialisation de la navigation au chargement
document.addEventListener("DOMContentLoaded", () => {
  
  // Écouteur sur chaque onglet de la barre inférieure
  document.querySelectorAll(".navItem").forEach(item => {
    item.addEventListener("click", () => {
      const targetScreen = item.dataset.screen;
      if (!targetScreen) return;

      // 1. Changer d'écran
      showScreen(targetScreen);
      
      // 2. Mettre à jour l'onglet actif
      setActiveTab(targetScreen);

      // 3. Déclencher le chargement des scripts associés d'origine
      if (targetScreen === "inventoryView" && typeof loadInventory === "function") {
        loadInventory();
      }
      if (targetScreen === "alertsView" && typeof loadAlerts === "function") {
        loadAlerts();
      }
      if (targetScreen === "statsView" && typeof loadStats === "function") {
        loadStats();
      }
    });
  });

  // Bouton "➕ Ajouter" situé dans l'en-tête (Header)
  const addBtn = document.getElementById("addBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      showScreen("formView");
      setActiveTab("formView"); // Décoche les onglets du bas pour la clarté
    });
  }
});