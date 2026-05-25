/* ============================================================
   app.js — Gestion de la navigation entre les écrans
   ============================================================ */

// Fonction pour afficher un écran
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("visible"));
  document.getElementById(screenId).classList.add("visible");
}

// Ouvrir / fermer le menu
const menuBtn = document.getElementById("menuBtn");
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");

menuBtn.addEventListener("click", () => {
  sideMenu.classList.add("open");
  menuOverlay.classList.add("visible");
});

menuOverlay.addEventListener("click", () => {
  sideMenu.classList.remove("open");
  menuOverlay.classList.remove("visible");
});

// Navigation via le menu latéral
document.querySelectorAll(".menuItem").forEach(item => {
  item.addEventListener("click", () => {
    const target = item.dataset.screen;
    if (target) showScreen(target);

    sideMenu.classList.remove("open");
    menuOverlay.classList.remove("visible");

    if (target === "listView") loadWineList();
    if (target === "alertsView") loadAlerts();
    if (target === "statsView") loadStats();
  });
});

// Bouton + Ajouter
document.getElementById("addBtn").addEventListener("click", () => {
  showScreen("formView");
  loadWineForm();
});

// Mode sombre
const darkToggle = document.getElementById("darkToggle");
if (darkToggle) {
  darkToggle.addEventListener("change", () => {
    document.body.classList.toggle("light");
  });
}

// Chargement initial
window.addEventListener("load", () => {
  loadWineList();
});
