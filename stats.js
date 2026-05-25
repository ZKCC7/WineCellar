// ============================================================
// stats.js — Statistiques de la cave
// ============================================================

async function loadStats() {
  const container = document.getElementById('statsContent');
  if (!container) return;

  const wines = await dbGetAllWines();

  if (!wines.length) {
    container.innerHTML = '<p class="empty-msg">Ajoutez des vins pour voir les statistiques.</p>';
    return;
  }

  // Totaux
  const totalBottles  = wines.reduce((s, w) => s + (w.quantity || 0), 0);
  const totalValue    = wines.reduce((s, w) => s + ((w.price || 0) * (w.quantity || 1)), 0);
  const avgRating     = (() => {
    const rated = wines.filter(w => w.rating?.score);
    if (!rated.length) return null;
    return Math.round(rated.reduce((s, w) => s + w.rating.score, 0) / rated.length);
  })();

  // Par type
  const byType = {};
  wines.forEach(w => {
    const t = w.identity?.type || 'Autre';
    if (!byType[t]) byType[t] = { count: 0, bottles: 0 };
    byType[t].count++;
    byType[t].bottles += w.quantity || 0;
  });

  const maxBottles = Math.max(...Object.values(byType).map(v => v.bottles));

  const typeBars = Object.entries(byType)
    .sort((a, b) => b[1].bottles - a[1].bottles)
    .map(([type, data]) => `
      <div class="type-bar">
        <div class="type-bar-label">
          <span>${wineEmoji(type)} ${type}</span>
          <span style="color:var(--text-muted)">${data.bottles} btl</span>
        </div>
        <div class="type-bar-track">
          <div class="type-bar-fill" style="width:${Math.round(data.bottles / maxBottles * 100)}%"></div>
        </div>
      </div>
    `).join('');

  // Meilleurs vins
  const topWines = [...wines]
    .filter(w => w.rating?.score)
    .sort((a, b) => b.rating.score - a.rating.score)
    .slice(0, 5);

  const topHTML = topWines.length ? `
    <div class="form-section" style="margin-top:16px;">
      <h3 class="form-section-title">🏆 Top notes</h3>
      ${topWines.map(w => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
          <div>
            <div style="font-weight:600; font-size:0.9rem;">${w.identity?.cuvee || '—'}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">${w.identity?.vintage || ''} ${w.identity?.appellation || ''}</div>
          </div>
          <span class="wine-rating">★ ${w.rating.score}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-number">${wines.length}</span>
        <span class="stat-label">Références</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${totalBottles}</span>
        <span class="stat-label">Bouteilles</span>
      </div>
      ${totalValue > 0 ? `
      <div class="stat-card">
        <span class="stat-number">${Math.round(totalValue).toLocaleString('fr-FR')} €</span>
        <span class="stat-label">Valeur estimée</span>
      </div>` : ''}
      ${avgRating ? `
      <div class="stat-card">
        <span class="stat-number">★ ${avgRating}</span>
        <span class="stat-label">Note moyenne</span>
      </div>` : ''}
    </div>

    <div class="form-section">
      <h3 class="form-section-title">🍷 Répartition par type</h3>
      ${typeBars}
    </div>

    ${topHTML}
  `;
}

window.loadStats = loadStats;
