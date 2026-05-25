// ============================================================
// alerts.js — Gestion des alertes (Version Complète Corrigée)
// ============================================================

async function loadAlerts() {
    const alertsContent = document.getElementById('alertsContent');
    if (!alertsContent) {
        console.warn("⚠️ Élément #alertsContent introuvable.");
        return;
    }

    try {
        const db = new LocalBase('wineCellar');
        const wines = await db.collection('wines').get();
        const today = new Date();
        const delayDays = parseInt(localStorage.getItem('settingDelay')) || 30; // Délai par défaut : 30 jours

        if (!wines || wines.length === 0) {
            alertsContent.innerHTML = "<p style='text-align:center; color:var(--text-muted);'>Aucune bouteille dans votre cave.</p>";
            return;
        }

        // Filtrer les vins à consommer bientôt
        const alerts = wines.filter(wine => {
            if (!wine.drinkTo) return false;
            const drinkToDate = new Date(wine.drinkTo);
            const diffDays = (drinkToDate - today) / (1000 * 60 * 60 * 24);
            return diffDays <= delayDays && diffDays >= 0;
        });

        if (alerts.length === 0) {
            alertsContent.innerHTML = "<p style='text-align:center; color:var(--text-muted);'>Aucune alerte de consommation.</p>";
            return;
        }

        // Afficher les alertes
        alertsContent.innerHTML = `
            <div style="background:var(--background-cards); padding:15px; border-radius:8px;">
                <h3 style="margin:0 0 10px 0;">🔔 Alertes de consommation</h3>
                <p style="margin-bottom:15px;">Bouteilles à consommer sous ${delayDays} jours :</p>
                <ul style="list-style:none; padding:0;">
                    ${alerts.map(wine => `
                        <li style="padding:10px; margin-bottom:8px; background:var(--background-app); border-radius:6px; border-left:4px solid #ef4444;">
                            <strong>${wine.cuvee || 'Inconnu'}</strong> (${wine.domain || 'Inconnu'})<br>
                            <small>À consommer avant le : ${new Date(wine.drinkTo).toLocaleDateString('fr-FR')}</small>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        console.error("❌ Erreur lors du chargement des alertes :", error);
        alertsContent.innerHTML = "<p style='color:red;'>Erreur lors du chargement des alertes.</p>";
    }
}

// Exposition globale
window.loadAlerts = loadAlerts;