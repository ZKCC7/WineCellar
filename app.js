// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  // Sauvegarder la clé API
  const btnSaveAiKey = document.getElementById('btnSaveAiKey');
  if (btnSaveAiKey) {
    btnSaveAiKey.addEventListener('click', () => {
      const apiKey = document.getElementById('aiApiKey').value;
      if (apiKey.trim()) {
        localStorage.setItem('gemini_api_key', apiKey);
        alert('Clé API enregistrée avec succès !');
      } else {
        alert('Veuillez entrer une clé API valide.');
      }
    });
  }

  // Sauvegarder le délai d'alerte
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      const delay = document.getElementById('settingDelay').value;
      if (delay) {
        localStorage.setItem('settingDelay', delay);
        alert('Délai enregistré avec succès !');
      }
    });
  }

  // Charger les vins (exemple)
  async function loadWineList() {
    const db = new LocalBase('wineCellar');
    const wines = await db.collection('wines').get();
    const wineList = document.getElementById('wineList');
    if (wineList) {
      wineList.innerHTML = wines.length === 0
        ? '<p>Aucune bouteille enregistrée.</p>'
        : `<ul>${wines.map(wine => `<li>${wine.cuvee} (${wine.domain})</li>`).join('')}</ul>`;
    }
  }

  loadWineList();
});