/* ============================================================
   stats.js — Statistiques de la cave
   ============================================================ */

/* ------------------------------------------------------------
   Charger et afficher les statistiques
------------------------------------------------------------ */
async function loadStats() {
  const wines = await dbGetAllWines();
  const statsDiv = document.getElementById("statsContent");

  if (!statsDiv) {
    console.warn("⚠️ Élément #statsContent introuvable.");
    return;
  }

  if (!wines || wines.length === 0) {
    statsDiv.innerHTML = `
      <div class="card">
        Aucune bouteille pour l’instant.
      </div>
    `;
    return;
  }

  /* -------------------------
     Total bouteilles
  ------------------------- */
  const total = wines.reduce(
    (sum, w) => sum + (w.purchase?.quantity ?? 1),
    0
  );

  /* -------------------------
     Répartition par couleur
  ------------------------- */
  const byColor = {};
  wines.forEach(w => {
    const c = w.identity?.color || "Inconnue";
    byColor[c] = (byColor[c] || 0) + (w.purchase?.quantity ?? 1);
  });

  /* -------------------------
     Répartition par région
  ------------------------- */
  const byRegion = {};
  wines.forEach(w => {
    const r = w.identity?.region || "Inconnue";
    byRegion[r] = (byRegion[r] || 0) + (w.purchase?.quantity ?? 1);
  });

  /* -------------------------
     Construction HTML
  ------------------------- */
  statsDiv.innerHTML = `
    <div class="card">
      <h3>Total de bouteilles</h3>
      <p><b>${total}</b> bouteilles dans ta cave</p>
    </div>

    <div class="card">
      <h3>Répartition par couleur</h3>
      ${Object.entries(byColor)
        .map(([color, count]) => `<p>${color} : <b>${count}</b></p>`)
        .join("")}
    </div>

    <div class="card">
      <h3>Répartition par région</h3>
      ${Object.entries(byRegion)
        .map(([region, count]) => `<p>${region} : <b>${count}</b></p>`)
        .join("")}
    </div>
  `;
}
