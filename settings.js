/* ============================================================
   settings.js — Mode sombre + paramètres utilisateur
   ============================================================ */

/* ------------------------------------------------------------
   MODE SOMBRE
------------------------------------------------------------ */
const darkToggle = document.getElementById("darkToggle");

(function initDarkMode() {
  if (!darkToggle) {
    console.warn("⚠️ Élément #darkToggle introuvable.");
    return;
  }

  const saved = localStorage.getItem("darkMode");

  if (saved === "1") {
    document.body.classList.remove("light");
    darkToggle.checked = true;
  } else {
    document.body.classList.add("light");
    darkToggle.checked = false;
  }
})();

if (darkToggle) {
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
}

/* ------------------------------------------------------------
   DÉLAI DES NOTIFICATIONS
------------------------------------------------------------ */
const notifDelaySelect = document.getElementById("notifDelay");

(function initNotifDelay() {
  if (!notifDelaySelect) {
    console.warn("⚠️ Élément #notifDelay introuvable.");
    return;
  }

  const saved = localStorage.getItem("notifDelay");
  notifDelaySelect.value = saved || "30";
})();

if (notifDelaySelect) {
  notifDelaySelect.addEventListener("change", () => {
    localStorage.setItem("notifDelay", notifDelaySelect.value);
  });
}
