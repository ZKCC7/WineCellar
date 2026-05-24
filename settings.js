/* ============================================================
   settings.js — Mode sombre + paramètres utilisateur
   ============================================================ */

/* ------------------------------------------------------------
   MODE SOMBRE
------------------------------------------------------------ */
const darkToggle = document.getElementById("darkToggle");

// Charger l'état au démarrage
(function initDarkMode() {
  const saved = localStorage.getItem("darkMode");

  if (saved === "1") {
    document.body.classList.remove("light");
    darkToggle.checked = true;
  } else {
    document.body.classList.add("light");
    darkToggle.checked = false;
  }
})();

// Changer le mode sombre
darkToggle.addEventListener("change", () => {
  const enabled = darkToggle.checked;

  if (enabled) {
    document.body.classList.remove("light");
    localStorage.setItem("darkMode", "1");
  } else {
    document.body.classList.add("light");
    localStorage.setItem("darkMode", "0");
  }
});

/* ------------------------------------------------------------
   DÉLAI DES NOTIFICATIONS
------------------------------------------------------------ */
const notifDelaySelect = document.getElementById("notifDelay");

// Charger la valeur sauvegardée
(function initNotifDelay() {
  const saved = localStorage.getItem("notifDelay");
  notifDelaySelect.value = saved || "30";
})();

// Sauvegarder quand l’utilisateur change
notifDelaySelect.addEventListener("change", () => {
  localStorage.setItem("notifDelay", notifDelaySelect.value);
});