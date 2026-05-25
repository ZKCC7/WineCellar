async function loadStats() {
  const statsContent = document.getElementById('statsContent');
  if (!statsContent) return;

  try {
    const db = new LocalBase('wineCellar');
    const wines = await db.collection('wines').get();

    if (!wines || wines.length === 0) {
      statsContent.innerHTML = '<p>Aucune bouteille dans votre cave.</p>';
      return;
    }

    const totalBottles = wines.reduce((sum, wine) => sum + (wine.qty || 1), 0);
    const byType = {};
    wines.forEach(wine => {
      const type = wine.type || 'Inconnu';
      byType[type] = (byType[type] || 0) + (wine.qty || 1);
    });

    statsContent.innerHTML = `
      <div class="card">
        <h3>Total : ${totalBottles} bouteilles</h3>
        <h4>Répartition par type :</h4>
        <ul>
          ${Object.entries(byType).map(([type, count]) => `<li>${type} : ${count}</li>`).join('')}
        </ul>
      </div>
    `;
  } catch (error) {
    console.error("Erreur lors du chargement des stats :", error);
    statsContent.innerHTML = '<p>Erreur lors du chargement des statistiques.</p>';
  }
}

window.loadStats = loadStats;