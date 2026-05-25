/* ============================================================
   settings.js — Préférences utilisateurs et injection démo
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Initialisation du délai affiché au chargement
  const settingDelayInput = document.getElementById("settingDelay");
  if (settingDelayInput) {
    const savedDelay = localStorage.getItem("notifDelay") || "30";
    settingDelayInput.value = savedDelay;
  }

  // Enregistrement des réglages
  document.getElementById("btnSaveSettings")?.addEventListener("click", () => {
    const delayValue = document.getElementById("settingDelay").value || "30";
    localStorage.setItem("notifDelay", delayValue);
    alert(`⚙️ Préférences enregistrées ! Le délai d'alerte est de ${delayValue} jours.`);
    
    if (typeof loadAlerts === "function") loadAlerts();
  });

  // Action : Vider la base de données
  document.getElementById("btnClearDb")?.addEventListener("click", async () => {
    if (confirm("⚠️ ATTENTION : Êtes-vous sûr de vouloir supprimer TOUTES vos bouteilles de la base de données locale ?")) {
      await dbClearAll();
      alert("Base de données vidée.");
      // Forcer le rechargement de l'état applicatif
      location.reload();
    }
  });

  // Action : Injecter le jeu d'essai
  document.getElementById("btnInjectDemo")?.addEventListener("click", async () => {
    if (confirm("Voulez-vous charger le jeu d'essai de démo ? (Écrase les ID identiques existants)")) {
      await injectDemoData();
      alert("⚡ Données de démonstration chargées avec succès !");
      location.reload();
    }
  });
});

/* ------------------------------------------------------------
   Jeu d'essai complet (Mock Data pour le test d'interface)
------------------------------------------------------------ */
async function injectDemoData() {
  const today = new Date();
  
  // Calcul de dates dynamiques pour forcer des comportements d'alertes à J+3, J+10 et J+45
  const dateUrgent = new Date(); dateUrgent.setDate(today.getDate() + 3);
  const dateMedium = new Date(); dateMedium.setDate(today.getDate() + 12);
  const dateFutur = new Date(); dateFutur.setDate(today.getDate() + 180);

  const demoWines = [
    {
      id: "demo-1",
      identity: { cuvee: "Châteauneuf-du-Pape", domain: "Domaine des Relictes", vintage: 2015, type: "Rouge", appellation: "AOC Châteauneuf", region: "Vallée du Rhône", country: "France" },
      quantity: 3, size: "75cl", location: "Étagère du bas - A1", barcode: "3123456789012",
      aging: { drinkFrom: 2020, drinkTo: dateUrgent.toISOString().split('T')[0] }
    },
    {
      id: "demo-2",
      identity: { cuvee: "Meursault Premier Cru", domain: "Bouchard Père & Fils", vintage: 2018, type: "Blanc", appellation: "Meursault", region: "Bourgogne", country: "France" },
      quantity: 1, size: "75cl", location: "Casier Central - B3", barcode: "3234567890123",
      aging: { drinkFrom: 2022, drinkTo: dateMedium.toISOString().split('T')[0] }
    },
    {
      id: "demo-3",
      identity: { cuvee: "Cuvée Sainte-Victoire", domain: "Château Coussin", vintage: 2023, type: "Rosé", appellation: "Côtes de Provence", region: "Provence", country: "France" },
      quantity: 6, size: "75cl", location: "Bac Fraîcheur Supérieur", barcode: "3345678901234",
      aging: { drinkFrom: 2024, drinkTo: dateFutur.toISOString().split('T')[0] }
    }
  ];

  for (const wine of demoWines) {
    await dbUpdateWine(wine); // Écrit ou écrase dans IndexedDB via db.js
  }
}