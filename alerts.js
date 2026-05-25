// ============================================================
// alerts.js — Alertes d'apogée
// ============================================================

async function loadAlerts() {
  const container = document.getElementById('alertsContent');
  if (!container) return;

  const wines = await dbGetAllWines();
  const year  = new Date().getFullYear();

  const late    = [];
  const nowWin  = [];
  const soon    = [];

  wines.forEach(w => {
    const ag = w.aging || {};
    const id = w.identity || {};
    if (!ag.drinkTo) return;
    const to   = parseInt(ag.drinkTo);
    const from = ag.drinkFrom ? parseInt(ag.drinkFrom) : null;
    const name = id.cuvee || 'Vin inconnu';

    if (to < year) {
      late.push({ wine: w, name, to, from });
    } else if (to <= year + 2) {
      nowWin.push({ wine: w, name, to, from });
    } else if (to <= year + 5) {
      soon.push({ wine: w, name, to, from });
    }
  });

  if (!late.length && !nowWin.length && !soon.length) {
    container.innerHTML = '<p class="empty-msg">🎉 Aucune alerte.<br>Tous vos vins sont dans leur fenêtre optimale.</p>';
    return;
  }

  let html = '';

  if (late.length) {
    html += `<h3 style="color:#ef4444; font-family:'Playfair Display',serif; margin:0 0 10px;">⚠️ Apogée dépassée</h3>`;
    html += late.map(a => alertCard(a, 'late')).join('');
  }

  if (nowWin.length) {
    html += `<h3 style="color:#6fcf97; font-family:'Playfair Display',serif; margin:16px 0 10px;">✅ À boire maintenant</h3>`;
    html += nowWin.map(a => alertCard(a, '')).join('');
  }

  if (soon.length) {
    html += `<h3 style="color:#f2994a; font-family:'Playfair Display',serif; margin:16px 0 10px;">⏳ Approche de l'apogée</h3>`;
    html += soon.map(a => alertCard(a, 'warning')).join('');
  }

  container.innerHTML = html;
}

function alertCard({ wine, name, to, from }, cssClass) {
  const id = wine.identity || {};
  const qty = wine.quantity || 0;
  return `
    <div class="alert-card ${cssClass}" onclick="openEditForm('${wine.id}')" style="cursor:pointer;">
      <h4>${name}</h4>
      <p>
        ${id.domain ? id.domain + ' · ' : ''}
        ${id.vintage ? 'Millésime ' + id.vintage + ' · ' : ''}
        Apogée ${from ? from + '–' : ''}${to}
        · ${qty} bouteille${qty > 1 ? 's' : ''}
      </p>
    </div>
  `;
}

window.loadAlerts = loadAlerts;
