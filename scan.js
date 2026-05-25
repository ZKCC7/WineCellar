// ============================================================
// scan.js — Capture photo + reconnaissance + modal confirmation
// ============================================================

let pendingScanResult = null; // Résultat en attente de confirmation

document.addEventListener('DOMContentLoaded', () => {
  const scanInput = document.getElementById('scanInput');
  if (!scanInput) return;

  scanInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Afficher la prévisualisation
    const preview = document.getElementById('scanPreview');
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = 'Étiquette scannée';
    preview.innerHTML = '';
    preview.appendChild(img);
    preview.classList.add('has-image');

    // Lancer l'analyse
    setScanStatus('loading', '⏳ Analyse de l\'étiquette en cours...');

    try {
      const result = await analyserEtiquetteAvecClaude(file);
      if (!result) {
        setScanStatus('error', '✗ Analyse annulée. Vérifiez votre clé API.');
        return;
      }

      pendingScanResult = result;
      setScanStatus('success', '✓ Vin reconnu ! Confirmez les informations.');
      showScanModal(result, file);

    } catch (err) {
      setScanStatus('error', `✗ Erreur : ${err.message}`);
    }

    // Reset input pour permettre re-scan du même fichier
    scanInput.value = '';
  });
});

function setScanStatus(type, msg) {
  const el = document.getElementById('scanStatus');
  if (!el) return;
  el.className = type;
  if (type === 'loading') {
    el.innerHTML = `<span class="spinner"></span>${msg}`;
  } else {
    el.textContent = msg;
  }
}

// ── MODAL DE CONFIRMATION ──

function showScanModal(result, file) {
  const modal = document.getElementById('scanModal');
  const preview = document.getElementById('scanModalPreview');
  const fields = document.getElementById('scanModalFields');
  if (!modal) return;

  // Miniature
  if (file) {
    preview.innerHTML = `<img src="${URL.createObjectURL(file)}" style="max-height:120px; border-radius:8px; margin-bottom:12px;">`;
  }

  // Champs détectés
  const displayFields = [
    { key: 'cuvee',        label: 'Cuvée' },
    { key: 'domain',       label: 'Domaine' },
    { key: 'vintage',      label: 'Millésime' },
    { key: 'type',         label: 'Type' },
    { key: 'appellation',  label: 'Appellation' },
    { key: 'region',       label: 'Région' },
    { key: 'country',      label: 'Pays' },
    { key: 'rating',       label: 'Note' },
    { key: 'drinkFrom',    label: 'À partir de' },
    { key: 'drinkTo',      label: 'Apogée jusqu\'à' },
  ];

  fields.innerHTML = displayFields
    .filter(f => result[f.key] !== null && result[f.key] !== undefined && result[f.key] !== '')
    .map(f => `
      <div class="modal-field">
        <span class="modal-field-key">${f.label}</span>
        <span class="modal-field-val">${result[f.key]}</span>
      </div>
    `).join('');

  if (!fields.innerHTML) {
    fields.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Aucune information détectée avec certitude.</p>';
  }

  modal.style.display = 'flex';
}

function closeScanModal() {
  const modal = document.getElementById('scanModal');
  if (modal) modal.style.display = 'none';
  pendingScanResult = null;
  setScanStatus('', '');
}

function acceptScanResult() {
  if (!pendingScanResult) return;
  closeScanModal();
  remplirFormulaire(pendingScanResult);
  pendingScanResult = null;
  // Aller sur le formulaire
  if (typeof switchView === 'function') switchView('view-add');
}

// Remplir le formulaire avec les données de l'IA
function remplirFormulaire(data) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== null && val !== undefined && val !== '') el.value = val;
  };
  set('wineCuvee', data.cuvee);
  set('wineDomain', data.domain);
  set('wineVintage', data.vintage);
  set('wineType', data.type);
  set('wineAppellation', data.appellation);
  set('wineRegion', data.region);
  set('wineCountry', data.country);
  set('wineRating', data.rating);
  set('wineRatingSource', data.ratingSource);
  set('wineDrinkFrom', data.drinkFrom);
  set('wineDrinkTo', data.drinkTo);
  set('wineNotes', data.notes);
}

window.closeScanModal = closeScanModal;
window.acceptScanResult = acceptScanResult;
window.remplirFormulaire = remplirFormulaire;
