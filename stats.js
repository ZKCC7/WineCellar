// ============================================================
// stats.js — Gestion des statistiques (Version Finale Corrigée)
// ============================================================

async function loadStats() {
    const statsContent = document.getElementById('statsContent');
    if (!statsContent) {
        console.warn("⚠️ Élément #statsContent introuvable.");
        return;
    }

    try {
        // Remplacement de dbGetAllWines() par un appel direct à LocalBase
        const db = new LocalBase('wineCellar');
        const wines = await db.collection('wines').get();

        if (!wines || wines.length === 0) {
            statsContent.innerHTML = `
                <div class="card">
                    <p style="text-align:center; color:var(--text-muted);">
                        Aucune bouteille dans votre cave.
                    </p>
                </div>
            `;
            return;
        }

        // Calcul des stats
        const totalBottles = wines.reduce((sum, wine) => sum + (wine.qty || 1), 0);
        const byType = {};
        wines.forEach(wine => {
            const type = wine.type || 'Inconnu';
            byType[type] = (byType[type] || 0) + (wine.qty || 1);
        });

        const byRegion = {};
        wines.forEach(wine => {
            const region = wine.region || 'Inconnue';
            byRegion[region] = (byRegion[region] || 0) + (wine.qty || 1);
        });

        // Affichage
        statsContent.innerHTML = `
            <div class="card">
                <h3>📊 Total de bouteilles</h3>
                <p><strong>${totalBottles}</strong> bouteilles dans ta cave</p>
            </div>

            <div class="card">
                <h3>🍷 Répartition par type</h3>
                ${Object.entries(byType)
                    .map(([type, count]) => `<p>${type} : <strong>${count}</strong></p>`)
                    .join('')}
            </div>

            <div class="card">
                <h3>🗺️ Répartition par région</h3>
                ${Object.entries(byRegion)
                    .map(([region, count]) => `<p>${region} : <strong>${count}</strong></p>`)
                    .join('')}
            </div>
        `;
    } catch (error) {
        console.error("❌ Erreur lors du chargement des stats :", error);
        statsContent.innerHTML = `
            <div class="card">
                <p style="color:red;">Erreur lors du chargement des statistiques.</p>
            </div>
        `;
    }
}

// Exposition globale
window.loadStats = loadStats;