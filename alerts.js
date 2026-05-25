async function loadAlerts() {
  const alertsContent = document.getElementById('alertsContent');
  if (!alertsContent) return;

  try {
    const db = new LocalBase('wineCellar');
    const wines = await db.collection('wines').get();
    const today = new Date();
    const delayDays = parseInt(localStorage.getItem('settingDelay')) || 30;

    if (!wines || wines.length === 0) {
      alertsContent.innerHTML = '<p>Aucune bouteille dans votre cave.</p>';
      return;
    }

    const alerts = wines.filter(wine => {
      if (!wine.drinkTo) return false;
      const drinkToDate = new Date(wine.drinkTo);
      const diffDays = (drinkToDate - today) / (1000 * 60 * 60 * 24);
      return diffDays <= delayDays && diffDays >= 0;
    });

    if (alerts.length === 0) {
      alertsContent.innerHTML = '<p>Aucune alerte de consommation.</p>';
      return;
    }

    alertsContent.innerHTML = `
      <div class="card">
        <h3>Alertes (${alerts.length})</h3>
        <ul>
          ${alerts.map(wine => `
            <li>
              <strong>${wine.cuvee || 'Inconnu'}</strong> (${wine.domain || 'Inconnu'}) -
              À consommer avant le ${new Date(wine.drinkTo).toLocaleDateString('fr-FR')}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  } catch (error) {
    console.error("Erreur lors du chargement des alertes :", error);
    alertsContent.innerHTML = '<p>Erreur lors du chargement des alertes.</p>';
  }
}

window.loadAlerts = loadAlerts;