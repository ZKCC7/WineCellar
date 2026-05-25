// ============================================================
// inventory.js — Vue inventaire (tableau)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('invSearch')?.addEventListener('input', loadInventory);
  document.getElementById('invFilterType')?.addEventListener('change', loadInventory);
});

async function loadInventory() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;

  const wines = await dbGetAllWines();
  const query = (document.getElementById('invSearch')?.value || '').toLowerCase();
  const type  = document.getElementById('invFilterType')?.value || '';

  const filtered = wines.filter(w => {
    const id = w.identity || {};
    const textOk = !query ||
      (id.cuvee || '').toLowerCase().includes(query) ||
      (id.domain || '').toLowerCase().includes(query);
    const typeOk = !type || id.type === type;
    return textOk && typeOk;
  });

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-msg">Aucun vin trouvé.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(w => {
    const id   = w.identity || {};
    const ag   = w.aging || {};
    const rat  = w.rating || {};
    const year = new Date().getFullYear();
    const drinkTo = ag.drinkTo ? parseInt(ag.drinkTo) : null;

    let apogeeStyle = '';
    if (drinkTo) {
      if (drinkTo < year)       apogeeStyle = 'color:#ef4444;';
      else if (drinkTo - year <= 2) apogeeStyle = 'color:#6fcf97;';
    }

    return `<tr>
      <td><strong>${id.cuvee || '—'}</strong><br><small style="color:var(--text-muted)">${id.domain || ''}</small></td>
      <td><span class="badge ${winePillClass(id.type)}">${id.type || '—'}</span></td>
      <td>${id.vintage || '—'}</td>
      <td style="${apogeeStyle}">${ag.drinkTo ? `~${ag.drinkTo}` : '—'}</td>
      <td><strong>${w.quantity || 0}</strong></td>
      <td>
        <button class="btn-ghost" onclick="openEditForm('${w.id}')" title="Modifier">✏️</button>
        <button class="btn-ghost" onclick="confirmDelete('${w.id}')" title="Supprimer">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

window.loadInventory = loadInventory;
