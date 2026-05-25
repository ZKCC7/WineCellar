/* ============================================================
   alerts.js — Gestion des alertes de garde
   ============================================================ */

/* ------------------------------------------------------------
   Charger et afficher les alertes
------------------------------------------------------------ */
async function loadAlerts() {
  const wines = await dbGetAllWines();
  const alertsDiv = document.getElementById("alertsContent");

  if (!alertsDiv) {
    console.warn("⚠️ Élément #alertsContent introuvable dans le DOM.");
    return;
  }

  if (!wines || wines.length === 0) {
    alertsDiv.innerHTML = `
      <div class="card" style="text-align:center; color:var(--text-muted); padding:30px;">
        <p style="font-size:2rem; margin-bottom:10px;">🍷</p>
        <p>Aucune bouteille enregistrée dans votre cave pour le moment.</p>
      </div>
    `;
    return;
  }

  const delay = parseInt(localStorage.getItem("notifDelay") || "30", 10);
  const today = new Date();

  // Filtrage et calcul des écarts de jours
  const alerts = wines
    .filter(w => w.aging && w.aging.drinkTo && w.quantity > 0)
    .map(w => {
      const endDate = new Date(w.aging.drinkTo);
      const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      return { wine: w, daysLeft: diffDays };
    })
    .filter(a => a.daysLeft <= delay && a.daysLeft >= 0);

  if (alerts.length === 0) {
    alertsDiv.innerHTML = `
      <div class="card" style="text-align:center; color:var(--text-muted); padding:40px 20px; border: 2px dashed var(--border-color);">
        <p style="font-size:2.5rem; margin-bottom:10px;">✨</p>
        <h3 style="color:var(--primary); margin-bottom:6px;">Tout est sous contrôle !</h3>
        <p>Aucune bouteille n'arrive à expiration dans la période de garde configurée (${delay} jours).</p>
      </div>
    `;
    return;
  }

  // Tri de la plus urgente à la moins urgente
  alerts.sort((a, b) => a.daysLeft - b.daysLeft);

  alertsDiv.innerHTML = `
    <div class="grid-auto">
      ${alerts.map(a => {
        let urgencyClass = "urgency-low";
        let urgencyText = "À boire";
        
        if (a.daysLeft <= 7) {
          urgencyClass = "urgency-high";
          urgencyText = "Très Urgent";
        } else if (a.daysLeft <= 15) {
          urgencyClass = "urgency-med";
          urgencyText = "Échéance proche";
        }

        const formattedDate = new Date(a.wine.aging.drinkTo).toLocaleDateString('fr-FR', {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        return `
          <div class="wine-alert-card ${urgencyClass}">
            <div class="card-badge">${urgencyText}</div>
            <div class="card-body">
              <h3 style="font-size:1.15rem; margin-bottom:8px; padding-right:70px; color:var(--text-main);">
                ${a.wine.identity?.cuvee || "Sans nom"}
                <span style="font-weight:normal; font-size:0.95rem; color:var(--text-muted);">(${a.wine.identity?.vintage || "?"})</span>
              </h3>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">
                🏰 <b>${a.wine.identity?.domain || "Domaine inconnu"}</b> — ${a.wine.identity?.type || "Rouge"}
              </p>
              <div style="background:#fafafa; border-radius:8px; padding:8px 12px; font-size:0.85rem;">
                <p><b>Date max :</b> ${formattedDate}</p>
                <p><b>Emplacement :</b> ${a.wine.location || "Non défini"}</p>
              </div>
              <p style="margin-top:12px; font-weight:700; font-size:1.05rem;">
                ⏳ Reste : <span style="font-size:1.15rem;">${a.daysLeft === 0 ? "Aujourd'hui !" : `${a.daysLeft} jours`}</span>
              </p>
            </div>
            <div class="card-actions-inline">
              <button onclick="alertActionEdit('${a.wine.id}')">🔍 Inspecter</button>
              <button onclick="alertActionDrink('${a.wine.id}')" style="color:#dc2626;">🍷 Boire une</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

/* ------------------------------------------------------------
   Actions rapides depuis les cartes d'alerte
------------------------------------------------------------ */
function alertActionEdit(id) {
  // Redirige vers l'inventaire et prépare l'édition via la méthode d'inventory.js
  if (typeof editWine === "function") {
    editWine(id);
  } else {
    console.error("La fonction editWine n'est pas accessible globalement.");
  }
}

async function alertActionDrink(id) {
  const wine = await dbGetWine(id);
  if (wine && wine.quantity > 0) {
    if (confirm(`Consommer une bouteille de "${wine.identity?.cuvee}" ? Stock actuel : ${wine.quantity}`)) {
      wine.quantity -= 1;
      await dbUpdateWine(wine);
      alert("Votre cave a été mise à jour. Santé !");
      loadAlerts(); // Recharger le composant
    }
  } else {
    alert("Cette bouteille n'est déjà plus en stock.");
  }
}