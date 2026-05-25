/* ============================================================
   settings.js — Thème global, Configuration et Injection Démo
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // --- BASOULE DU MODE CLAIR / SOMBRE ---
  const themeToggle = document.getElementById("themeToggleBtn");
  if (themeToggle) {
    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light");
    }

    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light");
      const isLight = document.body.classList.contains("light");
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });
  }

  // --- CONFIGURATION DU DÉLAI D'ALERTE ---
  const delayInput = document.getElementById("settingDelay");
  if (delayInput) {
    delayInput.value = localStorage.getItem("notifDelay") || "30";
  }

  document.getElementById("btnSaveSettings")?.addEventListener("click", () => {
    const delayVal = document.getElementById("settingDelay").value || "30";
    localStorage.setItem("notifDelay", delayVal);
    alert(`⚙️ Configuration mise à jour : ${delayVal} jours.`);
    if (typeof loadAlerts === "function") loadAlerts();
    if (typeof toggleMenu === "function") toggleMenu(); // refermer le menu
  });

  // --- CONFIGURATION CLÉ API GEMINI ---
  const apiKeyInput = document.getElementById("aiApiKey");
  if (apiKeyInput) {
    apiKeyInput.value = localStorage.getItem("gemini_api_key") || "";
  }

  document.getElementById("btnSaveAiKey")?.addEventListener("click", () => {
    const keyVal = document.getElementById("aiApiKey").value.trim();
    localStorage.setItem("gemini_api_key", keyVal);
    alert("🔑 Clé API Gemini sauvegardée avec succès !");
    if (typeof toggleMenu === "function") toggleMenu();
  });

  // --- SUPPRESSION ENTIÈRE DE LA BASE ---
  document.getElementById("btnClearDb")?.addEventListener("click", async () => {
    if (confirm("⚠️ Souhaitez-vous effacer TOUTES les bouteilles enregistrées ?")) {
      await dbClearAll();
      location.reload();
    }
  });

  // --- INJECTION DES DONNÉES DÉMO DANS LA BASE ---
  document.getElementById("btnInjectDemo")?.addEventListener("click", async () => {
    if (confirm("Injecter les bouteilles d'essai dans votre cave ?")) {
      const today = new Date();
      const expirationBientot = new Date(); expirationBientot.setDate(today.getDate() + 10);
      const expirationFutur = new Date(); expirationFutur.setDate(today.getDate() + 400);

      const simulationWines = [
        {
          id: "demo-1",
          identity: { cuvee: "Château Talbot", domain: "Château Talbot", vintage: "2018", type: "Rouge", appellation: "Saint-Julien", region: "Bordeaux", country: "France" },
          quantity: 3, size: "75cl", location: "Clayette supérieure - Emplacement 1", barcode: "3123456789012",
          aging: { drinkFrom: "2023", drinkTo: expirationFutur.toISOString().split('T')[0] }
        },
        {
          id: "demo-2",
          identity: { cuvee: "Meursault Premier Cru", domain: "Domaine des Comtes Lafon", vintage: "2020", type: "Blanc", appellation: "Meursault", region: "Bourgogne", country: "France" },
          quantity: 1, size: "75cl", location: "Casier Central - B1", barcode: "3234567890123",
          aging: { drinkFrom: "2022", drinkTo: expirationBientot.toISOString().split('T')[0] }
        }
      ];

      for (const w of simulationWines) {
        await dbUpdateWine(w.id, w);
      }
      alert("🎉 Données de démonstration chargées !");
      location.reload();
    }
  });
});