/* ============================================================
   settings.js — Thème global, Configuration et Injection Démo
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // --- COMMUTATION ET PERSISTANCE DU MODE SOMBRE ---
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

  // --- INITIALISATION DES DONNÉES EN MÉMOIRE ---
  const delayInput = document.getElementById("settingDelay");
  if (delayInput) {
    delayInput.value = localStorage.getItem("notifDelay") || "30";
  }

  const apiKeyInput = document.getElementById("aiApiKey");
  if (apiKeyInput) {
    apiKeyInput.value = localStorage.getItem("gemini_api_key") || "";
  }

  // --- SAUVEGARDES ---
  document.getElementById("btnSaveSettings")?.addEventListener("click", () => {
    const delayVal = document.getElementById("settingDelay").value || "30";
    localStorage.setItem("notifDelay", delayVal);
    alert(`⚙️ Seuil d'alerte mis à jour : ${delayVal} jours.`);
    if (typeof loadAlerts === "function") loadAlerts();
    if (typeof window.toggleMenu === "function") window.toggleMenu();
  });

  document.getElementById("btnSaveAiKey")?.addEventListener("click", () => {
    const keyVal = document.getElementById("aiApiKey").value.trim();
    localStorage.setItem("gemini_api_key", keyVal);
    alert("🔑 Clé API Gemini configurée avec succès !");
    if (typeof window.toggleMenu === "function") window.toggleMenu();
  });

  // --- ACTIONS EN BASE DE DONNÉES ---
  document.getElementById("btnClearDb")?.addEventListener("click", async () => {
    if (confirm("⚠️ Souhaitez-vous effacer TOUTES les bouteilles enregistrées en local ?")) {
      await dbClearAll();
      location.reload();
    }
  });

  document.getElementById("btnInjectDemo")?.addEventListener("click", async () => {
    if (confirm("Charger les bouteilles d'essai dans votre cave ?")) {
      const today = new Date();
      const dateProche = new Date(); dateProche.setDate(today.getDate() + 12);
      const dateFutur = new Date(); dateFutur.setDate(today.getDate() + 500);

      const itemsDemo = [
        {
          id: "demo-1",
          identity: { cuvee: "Château Talbot", domain: "Château Talbot", vintage: "2018", type: "Rouge", appellation: "Saint-Julien", region: "Bordeaux", country: "France" },
          quantity: 3, size: "75cl", location: "Clayette 1 - Fond", barcode: "3123456789012",
          aging: { drinkFrom: "2023", drinkTo: dateFutur.toISOString().split('T')[0] }
        },
        {
          id: "demo-2",
          identity: { cuvee: "Meursault Cru", domain: "Domaine des Comtes Lafon", vintage: "2020", type: "Blanc", appellation: "Meursault", region: "Bourgogne", country: "France" },
          quantity: 1, size: "75cl", location: "Bac du bas", barcode: "3234567890123",
          aging: { drinkFrom: "2022", drinkTo: dateProche.toISOString().split('T')[0] }
        }
      ];

      for (const item of itemsDemo) {
        if (typeof dbUpdateWine === "function") {
          await dbUpdateWine(item.id, item);
        }
      }
      alert("🎉 Bouteilles d'essai injectées avec succès !");
      location.reload();
    }
  });
});