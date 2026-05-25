/* ============================================================
   ui.js — Gestion de l’interface et de la navigation
   ============================================================ */

/* ------------------------------------------------------------
   Raccourcis DOM
------------------------------------------------------------ */
function $(id) {
  return document.getElementById(id);
}

/* ------------------------------------------------------------
   MENU HAMBURGER
------------------------------------------------------------ */
const menuBtn = $("menuBtn");
const menuOverlay = $("menuOverlay");
const sideMenu = $("sideMenu");

if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (menuOverlay) menuOverlay.addEventListener("click", toggleMenu);

function toggleMenu() {
  const isOpen = sideMenu.style.left === "0px";

  if (isOpen) {
    sideMenu.style.left = "-260px";
    menuOverlay.style.display = "none";
  } else {
    sideMenu.style.left = "0px";
    menuOverlay.style.display = "block";
  }
}

/* ------------------------------------------------------------
   NAVIGATION ENTRE LES ÉCRANS
------------------------------------------------------------ */
function openScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("visible"));
  $(screenId).classList.add("visible");

  // Fermer le menu si ouvert
  sideMenu.style.left = "-260px";
  menuOverlay.style.display = "none";

  // Actions automatiques selon l’écran
  if (screenId === "listView") loadWines();
  if (screenId === "statsView") loadStats();
  if (screenId === "alertsView") loadAlerts();
}

/* ------------------------------------------------------------
   LIENS DU MENU
------------------------------------------------------------ */
document.querySelectorAll(".menuItem").forEach(item => {
  const screen = item.getAttribute("data-screen");
  if (screen) {
    item.addEventListener("click", () => openScreen(screen));
  }
});

/* ------------------------------------------------------------
   BOUTON "Ajouter"
------------------------------------------------------------ */
$("addBtn")?.addEventListener("click", () => {
  showAddForm();
});

/* ------------------------------------------------------------
   BOUTON "Ajouter" dans le menu
------------------------------------------------------------ */
$("menuAddWine")?.addEventListener("click", () => {
  toggleMenu();
  showAddForm();
});

/* ------------------------------------------------------------
   AFFICHER LE FORMULAIRE D’AJOUT
------------------------------------------------------------ */
function showAddForm() {
  editingId = null;
  renderForm();
  openScreen("formView");
}

/* ------------------------------------------------------------
   AFFICHER LE DÉTAIL D’UN VIN
------------------------------------------------------------ */
async function showDetail(id) {
  const wine = await dbGetWine(id);
  renderDetail(wine);
  openScreen("detailView");
}

/* ------------------------------------------------------------
   AFFICHER LE FORMULAIRE DE MODIFICATION
------------------------------------------------------------ */
async function editWine(id) {
  const wine = await dbGetWine(id);
  editingId = id;
  renderForm(wine);
  openScreen("formView");
}
