// Gestion de l'interface utilisateur
function switchView(viewId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('visible');
  });
  document.querySelectorAll('.navItem').forEach(item => {
    item.classList.remove('active');
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('visible');
  }

  const activeNavItem = document.querySelector(`.navItem[data-screen="${viewId}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }

  // Charger les données spécifiques à la vue
  if (viewId === 'view-stats' && typeof loadStats === 'function') {
    loadStats();
  } else if (viewId === 'view-alerts' && typeof loadAlerts === 'function') {
    loadAlerts();
  } else if (viewId === 'view-inventory' && typeof loadInventory === 'function') {
    loadInventory();
  } else if (viewId === 'view-shop' && typeof loadShop === 'function') {
    loadShop();
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Lier les boutons de navigation basse
  document.querySelectorAll('#bottomNav .navItem').forEach(item => {
    item.addEventListener('click', () => {
      const screen = item.getAttribute('data-screen');
      switchView(screen);
    });
  });

  // Lier le menu latéral
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  if (menuBtn && sideMenu && menuOverlay) {
    menuBtn.addEventListener('click', () => {
      sideMenu.style.display = 'block';
      menuOverlay.style.display = 'block';
    });

    menuOverlay.addEventListener('click', () => {
      sideMenu.style.display = 'none';
      menuOverlay.style.display = 'none';
    });
  }

  // Vue par défaut
  switchView('view-list');
});

// Exposition globale
window.switchView = switchView;