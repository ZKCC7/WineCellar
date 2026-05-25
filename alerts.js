/* ============================================================
   alerts.js — Gestion des alertes de garde
   ============================================================ */

/* ------------------------------------------------------------
   Charger et afficher les alertes
------------------------------------------------------------ */
async function loadAlerts() {
  const wines = await dbGetAllWines();
  const alertsDiv = document.getElementById("alertsContent");

  if (!alertsDiv) {
    console.warn("⚠️ Élément #alertsContent introuvable dans le DOM.");
    return;
  }

  if (!wines || wines.length === 0) {
    alertsDiv.innerHTML = `
      <div class="card">
        Aucune bouteille dans la cave.
      </div>
    `;
    return;
  }

  const delay = parseInt(localStorage.getItem("notifDelay") || "30", 10);
  const today = new Date();

  const alerts = wines
    .filter(w => w.aging && w.aging.drinkTo)
    .map(w => {
      const endDate = new Date(w.aging.drinkTo);
      const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      return { wine: w, daysLeft: diffDays };
    })
    .filter(a => a.daysLeft <= delay && a.daysLeft >= 0);

  if (alerts.length === 0) {
    alertsDiv.innerHTML = `
      <div class="card">
        🎉 Aucune alerte pour le moment.<br>
        Toutes tes bouteilles sont dans leur période de garde.
      </div>
    `;
    return;
  }

  alertsDiv.innerHTML = alerts
    .map(a => `
      <div class="card">
        <h3>${a.wine.identity?.cuvee || "Sans nom"} (${a.wine.identity?.vintage || "?"})</h3>
        <p><b>Fin de garde :</b> ${a.wine.aging.drinkTo}</p>
        <p><b>Dans :</b> ${a.daysLeft} jours</p>
      </div>
    `)
    .join("");
}
