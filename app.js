// ============================================================
// app.js — Formulaire, liste des vins, édition, suppression
// ============================================================

// ── LISTE DES VINS ──

async function loadWineList() {
  const container = document.getElementById('wineList');
  if (!container) return;
  const wines = await dbGetAllWines();
  renderWineList(wines, container);
}

function renderWineList(wines, container) {
  if (!wines.length) {
    container.innerHTML = '<p class="empty-msg">🍷 Votre cave est vide.<br>Appuyez sur ＋ pour ajouter votre premier vin.</p>';
    return;
  }
  container.innerHTML = wines.map(w => wineCardHTML(w)).join('');
}

function wineCardHTML(w) {
  const id = w.identity || {};
  const rating = w.rating || {};
  const aging = w.aging || {};

  const name = id.cuvee || 'Inconnu';
  const meta = [id.domain, id.vintage, id.appellation].filter(Boolean).join(' · ');
  const type = id.type || 'Rouge';
  const emoji = wineEmoji(type);
  const badgeClass = wineBadgeClass(type);
  const pillClass = winePillClass(type);
  const tagApogee = apogeeTag(aging.drinkTo);

  const ratingHTML = rating.score
    ? `<span class="wine-rating">★ ${rating.score}/100</span>`
    : '';

  return `
    <div class="wine-card" onclick="openEditForm('${w.id}')">
      <div class="wine-card-badge ${badgeClass}">${emoji}</div>
      <div class="wine-card-body">
        <div class="wine-card-name">${name}</div>
        <div class="wine-card-meta">
          <span class="badge ${pillClass}">${type}</span>
          ${meta ? `<span style="margin-left:6px;">${meta}</span>` : ''}
        </div>
        <div style="margin-top:4px; font-size:0.8rem; color:var(--text-muted);">
          ${ratingHTML}${tagApogee}
          ${w.quantity ? `<span style="margin-left:6px;">🗃 ${w.quantity} btl</span>` : ''}
        </div>
      </div>
      <div class="wine-card-actions">
        <button class="btn-ghost" onclick="event.stopPropagation(); openEditForm('${w.id}')" title="Modifier">✏️</button>
        <button class="btn-ghost" onclick="event.stopPropagation(); confirmDelete('${w.id}')" title="Supprimer">🗑</button>
      </div>
    </div>
  `;
}

// ── FILTRE LISTE ──

async function filterWineList() {
  const query  = (document.getElementById('listSearch')?.value || '').toLowerCase();
  const type   = document.getElementById('listFilter')?.value || '';
  const wines  = await dbGetAllWines();

  const filtered = wines.filter(w => {
    const id = w.identity || {};
    const textOk = !query ||
      (id.cuvee || '').toLowerCase().includes(query) ||
      (id.domain || '').toLowerCase().includes(query) ||
      (id.appellation || '').toLowerCase().includes(query) ||
      (id.region || '').toLowerCase().includes(query);
    const typeOk = !type || id.type === type;
    return textOk && typeOk;
  });

  const container = document.getElementById('wineList');
  if (container) renderWineList(filtered, container);
}

// ── FORMULAIRE ──

function resetForm() {
  const form = document.getElementById('wineForm');
  if (!form) return;
  form.reset();
  document.getElementById('wineId').value = '';
  document.getElementById('formTitle').textContent = 'Ajouter une bouteille';
  document.getElementById('wineCountry').value = 'France';
  document.getElementById('wineQty').value = 1;
  document.getElementById('wineSize').value = '75cl';
  document.getElementById('wineType').value = 'Rouge';

  // Reset scan zone
  const preview = document.getElementById('scanPreview');
  if (preview) {
    preview.innerHTML = '<span class="scan-icon">📷</span><p>Photographier l\'étiquette</p>';
    preview.classList.remove('has-image');
  }
  const scanStatus = document.getElementById('scanStatus');
  if (scanStatus) { scanStatus.textContent = ''; scanStatus.className = ''; }
}

async function openEditForm(id) {
  const wine = await dbGetWine(id);
  if (!wine) return;
  resetForm();

  const id2 = wine.identity || {};
  const rating = wine.rating || {};
  const aging = wine.aging || {};

  const set = (fieldId, val) => {
    const el = document.getElementById(fieldId);
    if (el && val !== undefined && val !== null && val !== '') el.value = val;
  };

  document.getElementById('wineId').value = wine.id;
  set('wineCuvee',       id2.cuvee);
  set('wineDomain',      id2.domain);
  set('wineVintage',     id2.vintage);
  set('wineType',        id2.type);
  set('wineAppellation', id2.appellation);
  set('wineRegion',      id2.region);
  set('wineCountry',     id2.country);
  set('wineRating',      rating.score);
  set('wineRatingSource',rating.source);
  set('wineDrinkFrom',   aging.drinkFrom);
  set('wineDrinkTo',     aging.drinkTo);
  set('wineNotes',       wine.notes);
  set('wineQty',         wine.quantity);
  set('wineSize',        wine.size);
  set('wineLocation',    wine.location);
  set('winePrice',       wine.price);

  document.getElementById('formTitle').textContent = 'Modifier la bouteille';
  switchView('view-add');
}

async function submitWineForm(e) {
  e.preventDefault();
  const existingId = document.getElementById('wineId').value;

  const wine = {
    id: existingId || undefined,
    identity: {
      cuvee:       document.getElementById('wineCuvee').value.trim(),
      domain:      document.getElementById('wineDomain').value.trim(),
      vintage:     document.getElementById('wineVintage').value.trim(),
      type:        document.getElementById('wineType').value,
      appellation: document.getElementById('wineAppellation').value.trim(),
      region:      document.getElementById('wineRegion').value.trim(),
      country:     document.getElementById('wineCountry').value.trim() || 'France',
    },
    rating: {
      score:  document.getElementById('wineRating').value ? parseInt(document.getElementById('wineRating').value) : null,
      source: document.getElementById('wineRatingSource').value.trim() || null,
    },
    aging: {
      drinkFrom: document.getElementById('wineDrinkFrom').value.trim() || null,
      drinkTo:   document.getElementById('wineDrinkTo').value.trim() || null,
    },
    notes:    document.getElementById('wineNotes').value.trim(),
    quantity: parseInt(document.getElementById('wineQty').value) || 1,
    size:     document.getElementById('wineSize').value,
    location: document.getElementById('wineLocation').value.trim(),
    price:    document.getElementById('winePrice').value ? parseFloat(document.getElementById('winePrice').value) : null,
  };

  await dbSaveWine(wine);
  resetForm();
  switchView('view-list');
}

async function confirmDelete(id) {
  const wine = await dbGetWine(id);
  const name = wine?.identity?.cuvee || 'ce vin';
  if (confirm(`Supprimer "${name}" de la cave ?`)) {
    await dbDeleteWine(id);
    loadWineList();
    if (typeof loadInventory === 'function') loadInventory();
  }
}

window.loadWineList   = loadWineList;
window.filterWineList = filterWineList;
window.resetForm      = resetForm;
window.openEditForm   = openEditForm;
window.submitWineForm = submitWineForm;
window.confirmDelete  = confirmDelete;
