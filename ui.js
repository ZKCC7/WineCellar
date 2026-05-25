// ============================================================
// ui.js — Navigation, thème, utilitaires UI
// ============================================================

function switchView(viewId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('visible'));
  document.querySelectorAll('.navItem').forEach(n => n.classList.remove('active'));

  const target = document.getElementById(viewId);
  if (target) target.classList.add('visible');

  const navBtn = document.querySelector(`.navItem[data-screen="${viewId}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Charger les données de la vue
  if (viewId === 'view-list'      && typeof loadWineList      === 'function') loadWineList();
  if (viewId === 'view-inventory' && typeof loadInventory     === 'function') loadInventory();
  if (viewId === 'view-alerts'    && typeof loadAlerts        === 'function') loadAlerts();
  if (viewId === 'view-stats'     && typeof loadStats         === 'function') loadStats();
}

function openAddForm() {
  resetForm();
  switchView('view-add');
}

// Badge emoji selon le type
function wineEmoji(type) {
  const map = { 'Rouge': '🍷', 'Blanc': '🥂', 'Rosé': '🌸', 'Champagne': '🍾', 'Mousseux': '🫧', 'Doux': '🍯' };
  return map[type] || '🍶';
}

function wineBadgeClass(type) {
  const map = { 'Rouge': 'badge-rouge', 'Blanc': 'badge-blanc', 'Rosé': 'badge-rose', 'Champagne': 'badge-champagne' };
  return map[type] || 'badge-autre';
}

function winePillClass(type) {
  const map = { 'Rouge': 'badge-rouge-pill', 'Blanc': 'badge-blanc-pill', 'Rosé': 'badge-rose-pill', 'Champagne': 'badge-champagne-pill' };
  return map[type] || 'badge-autre-pill';
}

// Tag apogée
function apogeeTag(drinkTo) {
  if (!drinkTo) return '';
  const year = parseInt(drinkTo);
  const now = new Date().getFullYear();
  if (year < now)       return `<span class="apogee-tag apogee-late">Dépassé ${year}</span>`;
  if (year - now <= 2)  return `<span class="apogee-tag apogee-ok">Apogée ~${year}</span>`;
  return `<span class="apogee-tag apogee-wait">Apogée ~${year}</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
  // Navigation basse
  document.querySelectorAll('#bottomNav .navItem').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.getAttribute('data-screen')));
  });

  // Menu latéral
  const menuBtn     = document.getElementById('menuBtn');
  const sideMenu    = document.getElementById('sideMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  const openMenu  = () => { sideMenu.classList.add('open'); menuOverlay.style.display = 'block'; };
  const closeMenu = () => { sideMenu.classList.remove('open'); menuOverlay.style.display = 'none'; };

  menuBtn?.addEventListener('click', openMenu);
  menuOverlay?.addEventListener('click', closeMenu);

  // Thème
  const themeBtn = document.getElementById('themeToggleBtn');
  themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });
  if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');

  // Sauvegarder clé API
  document.getElementById('btnSaveAiKey')?.addEventListener('click', () => {
    const val = document.getElementById('aiApiKey').value.trim();
    if (!val) { alert('Clé vide.'); return; }
    localStorage.setItem('claude_api_key', val);
    document.getElementById('aiApiKey').value = '';
    closeMenu();
    alert('✓ Clé API enregistrée !');
  });

  // Pré-remplir clé masquée si existante
  const existingKey = localStorage.getItem('claude_api_key');
  if (existingKey) {
    document.getElementById('aiApiKey').placeholder = '✓ Clé enregistrée (modifiable)';
  }

  // Vue initiale
  switchView('view-list');
});

window.switchView = switchView;
window.openAddForm = openAddForm;
window.wineEmoji = wineEmoji;
window.wineBadgeClass = wineBadgeClass;
window.winePillClass = winePillClass;
window.apogeeTag = apogeeTag;
