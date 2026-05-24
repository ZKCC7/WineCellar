/* ============================================================
   alerts.js — Gestion des alertes de garde
   ============================================================ */

/* ------------------------------------------------------------
   Charger et afficher les alertes
------------------------------------------------------------ */
async function loadAlerts() {
  const wines = await dbGetAllWines();
  const alertsDiv = document.getElementById("alertsContent");

  if (!wines.length) {
    alertsDiv.innerHTML = `
      <div class="card">
        Aucune bouteille dans la cave.
      </div>
    `;
    return;
  }

  const delay = parseInt(localStorage.getItem("notifDelay") || "30");
  const today = new Date();

  const alerts = [];

  wines.forEach(w => {
    if (!w.aging || !w.aging.drinkTo) return;

    const endDate = new Date(w.aging.drinkTo);
    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= delay && diffDays >= 0) {
      alerts.push({
        wine: w,
        daysLeft: diffDays
      });
    }
  });

  if (!alerts.length) {
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
        <h3>${a.wine.identity.cuvee} (${a.wine.identity.vintage})</h3>
        <p><b>Fin de garde :</b> ${a.wine.aging.drinkTo}</p>
        <p><b>Dans :</b> ${a.daysLeft} jours</p>
      </div>
    `)
    .join("");
}