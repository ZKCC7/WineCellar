// ============================================================
// ui.js — Gestion de l'interface utilisateur (Version Complète Corrigée)
// ============================================================

// Fonction pour basculer entre les vues
function switchView(viewId) {
    // Masquer toutes les vues
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('visible');
    });

    // Afficher la vue demandée
    const targetView = document.getElementById(viewId);
    if (!targetView) {
        console.error(`❌ Vue ${viewId} introuvable !`);
        return;
    }

    targetView.classList.add('visible');

    // Charger les données spécifiques à la vue
    if (viewId === 'view-stats' && typeof loadStats === 'function') {
        loadStats();
    } else if (viewId === 'view-alerts' && typeof loadAlerts === 'function') {
        loadAlerts();
    } else if (viewId === 'view-scan') {
        // Réinitialiser le scan
        const scanText = document.getElementById('scanText');
        if (scanText) scanText.textContent = "";
        const scanResult = document.getElementById('scanResult');
        if (scanResult) scanResult.style.display = 'none';
    } else if (viewId === 'view-add') {
        // Réinitialiser le formulaire si nécessaire
        const wineForm = document.getElementById('wineForm');
        if (wineForm) wineForm.reset();
    }
}

// Gestion du menu latéral
function initMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');

    if (menuBtn && sideMenu && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            sideMenu.style.display = sideMenu.style.display === 'block' ? 'none' : 'block';
            menuOverlay.style.display = menuOverlay.style.display === 'block' ? 'none' : 'block';
        });

        menuOverlay.addEventListener('click', () => {
            sideMenu.style.display = 'none';
            menuOverlay.style.display = 'none';
        });
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    // Afficher la vue par défaut (ex: view-list)
    switchView('view-list');
});

// Exposition globale
window.switchView = switchView;