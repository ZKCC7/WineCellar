/* ============================================================
   ui.js — Gestion de l’interface et de la navigation
   ============================================================ */

/* ------------------------------------------------------------
   Raccourcis DOM
------------------------------------------------------------ */
function $(id) {
  return document.getElementById(id);
}

/* ------------------------------------------------------------
   MENU HAMBURGER
------------------------------------------------------------ */
const menuBtn = $("menuBtn");
const menuOverlay = $("menuOverlay");
const sideMenu = $("sideMenu");

if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (menuOverlay) menuOverlay.addEventListener("click", toggleMenu);

function toggleMenu() {
  const isOpen = sideMenu.style.left === "0px";

  if (isOpen) {
    sideMenu.style.left = "-260px";
    menuOverlay.style.display = "none";
  } else {
    sideMenu.style.left = "0px";
    sideMenu.style.left = "0px";
    menuOverlay.style.display = "block";
  }
}

/* ------------------------------------------------------------
   NAVIGATION ENTRE LES ÉCRANS
------------------------------------------------------------ */
function openScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("visible"));
  const targetScreen = $(screenId);
  if (targetScreen) {
    targetScreen.classList.add("visible");
  }

  // Fermer le menu si ouvert
  if (sideMenu) sideMenu.style.left = "-260px";
  if (menuOverlay) menuOverlay.style.display = "none";

  // Actions de rafraîchissement au changement de vue
  if (screenId === "view-list" && typeof loadInventory === "function") {
    loadInventory();
  }
  if (screenId === "view-alerts" && typeof loadAlerts === "function") {
    loadAlerts();
  }
  if (screenId === "view-stats" && typeof loadStats === "function") {
    loadStats();
  }
  if (screenId === "view-shop" && typeof loadShopList === "function") {
    loadShopList();
  }
}

// Rendre la fonction accessible globalement pour app.js
window.switchView = openScreen;

/* ------------------------------------------------------------
   AFFICHAGE DES BOUTEILLES (LISTE PRINCIPALE)
------------------------------------------------------------ */
async function renderWineList(winesToRender) {
  const container = $("wineList");
  if (!container) return;

  const wines = winesToRender || await dbGetAllWines();

  if (wines.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; color:var(--text-muted); padding:30px;">
        <p style="font-size:2.5rem; margin-bottom:10px;">🍷</p>\n        <p>Votre cave est vide ou aucun vin ne correspond à votre recherche.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = wines.map(wine => {
    const isAlert = wine.aging && wine.aging.drinkTo && new Date(wine.aging.drinkTo) <= new Date();
    
    return `
      <div class="card wine-card ${isAlert ? 'border-alert' : ''}" data-id="${wine.id}">
        <div class="wine-header">
          <div>
            <span class="badge badge-${(wine.identity?.type || 'Rouge').toLowerCase()}">${wine.identity?.type || 'Rouge'}</span>
            <h3 class="wine-title">${wine.identity?.cuvee || 'Sans nom'}</h3>
            <p class="wine-subtitle">${wine.identity?.domain || 'Domaine inconnu'} - ${wine.identity?.vintage || 'N.V.'}</p>
          </div>
          <div class="wine-qty-badge">
            <span class="qty-val">${wine.quantity || 0}</span>
          </div>
        </div>
        
        <div class="wine-meta">
          <span>📍 ${wine.location || 'Non localisé'}</span>
          <span>🍼 ${wine.size || '75cl'}</span>
        </div>

        <div class="card-actions-inline" style="margin-top: 12px;">
          <button class="btn-secondary" onclick="showWineDetail('${wine.id}')">🔍 Détails</button>
          <button class="btn-secondary" onclick="quickIncrement('${wine.id}', 1)">➕</button>
          <button class="btn-secondary" onclick="quickIncrement('${wine.id}', -1)">➖</button>
        </div>
      </div>
    `;
  }).join("");
}

/* ------------------------------------------------------------
   AJUSTEMENT RAPIDE DES QUANTITÉS
------------------------------------------------------------ */
async function quickIncrement(id, amount) {
  const wine = await dbGetWine(id);
  if (!wine) return;

  const currentQty = parseInt(wine.quantity || 0, 10);
  const newQty = currentQty + amount;

  if (newQty < 0) {
    if (confirm("Voulez-vous supprimer complètement cette bouteille de votre cave ?")) {
      await dbDeleteWine(id);
    } else {
      return;
    }
  } else {
    wine.quantity = newQty;
    await dbUpdateWine(id, wine);
  }

  // Actualiser la vue courante
  if (typeof filterAndDisplayInventory === "function") {
    filterAndDisplayInventory();
  }
  renderWineList();
}

/* ------------------------------------------------------------
   AFFICHAGE DU DÉTAIL D'UNE BOUTEILLE
------------------------------------------------------------ */
async function showWineDetail(id) {
  const wine = await dbGetWine(id);
  if (!wine) return;

  const modal = $("wineDetailModal") || createDetailModal();
  const content = $("wineDetailContent");

  if (!content) return;

  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="badge badge-${(wine.identity?.type || 'Rouge').toLowerCase()}" style="font-size:1rem; padding:6px 14px;">
        ${wine.identity?.type || 'Rouge'}
      </span>
      <h2 style="margin: 10px 0 5px 0; color: var(--primary); font-size: 1.6rem;">${wine.identity?.cuvee || 'Sans nom'}</h2>
      <p style="margin: 0; font-weight: 600; color: var(--text-main);">${wine.identity?.domain || 'Domaine inconnu'}</p>
    </div>

    <table class="detail-table" style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr><td><b>Appellation :</b></td><td>${wine.identity?.appellation || 'Non renseignée'}</td></tr>
      <tr><td><b>Région :</b></td><td>${wine.identity?.region || 'Non renseignée'}</td></tr>
      <tr><td><b>Pays :</b></td><td>${wine.identity?.country || 'France'}</td></tr>
      <tr><td><b>Millésime :</b></td><td>${wine.identity?.vintage || 'N.V.'}</td></tr>
      <tr><td><b>Stock actuel :</b></td><td><b>${wine.quantity || 0}</b> bouteille(s) (${wine.size || '75cl'})</td></tr>
      <tr><td><b>Emplacement :</b></td><td>${wine.location || 'Non spécifié'}</td></tr>
      <tr><td><b>Code-barres :</b></td><td>${wine.barcode || 'Aucun'}</td></tr>
      <tr><td><b>Apogée :</b></td><td>Entre ${wine.aging?.drinkFrom || '?'} et ${wine.aging?.drinkTo || '?'}</td></tr>
    </table>

    <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
      <button class="btn" style="width:100%; background: #10b981;" id="btnMetsIa" onclick="typeof associerMetsIA === 'function' ? associerMetsIA('${wine.id}') : alert('Module IA non chargé')">
        🤖 Idées d'accords mets-vins (IA)
      </button>
      <div id="accordMetsIaResult"></div>
      
      <div style="display:flex; gap: 10px; margin-top: 10px;">
        <button class="btn" style="flex:1;" onclick="closeWineDetail(); editWine('${wine.id}');">✏️ Modifier</button>
        <button class="btn" style="flex:1; background:#ef4444;" onclick="closeWineDetail(); deleteWineFromInv('${wine.id}');">🗑️ Supprimer</button>
      </div>
    </div>
  `;

  modal.style.display = "block";
}

function closeWineDetail() {
  const modal = $("wineDetailModal");
  if (modal) modal.style.display = "none";
  const containerAccord = $("accordMetsIaResult");
  if (containerAccord) containerAccord.innerHTML = "";
}

function createDetailModal() {
  const modal = document.createElement("div");
  modal.id = "wineDetailModal";
  modal.className = "modal";
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.5)";
  modal.style.zIndex = "1000";

  modal.innerHTML = `
    <div class="modal-content" style="background: var(--card-bg); max-width: 500px; margin: 50px auto; padding: 20px; border-radius: 12px; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.25);">
      <span class="close-modal" onclick="closeWineDetail()" style="position: absolute; top: 15px; right: 20px; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</span>
      <div id="wineDetailContent"></div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

/* ------------------------------------------------------------
   ASSISTANT FORMULAIRE PAR CONVERSATION (IA RAPIDE)
------------------------------------------------------------ */
function assistantRemplirFormulaire() {
  const texte = prompt("Entrez la description ou l'étiquette brute du vin (ex: 'Château Margaux 2015 rouge en caisse centrale') :");
  if (!texte || !texte.trim()) return;

  const btn = document.getElementById("btnAiFill");
  const originalText = btn ? btn.innerHTML : "🪄 Remplir par IA";
  if (btn) {
    btn.innerHTML = "⚡ Analyse IA en cours...";
    btn.disabled = true;
  }

  const promptConstruct = `Analyse ce texte concernant un vin et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans enrobage \`\`\`json) contenant ces champs précis :
  {"cuvee": string, "domain": string, "vintage": number, "type": "Rouge"|"Blanc"|"Rosé"|"Effervescent", "appellation": string, "region": string, "country": string}.
  Texte à analyser : "${texte}"`;

  if (typeof appelerGemini === "function") {
    appelerGemini(promptConstruct).then(reponse => {
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
      try {
        const cleanJson = reponse.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
        const data = JSON.parse(cleanJson);

        openScreen("view-add");
        document.getElementById("formTitle").innerText = "Ajouter une bouteille";

        if (data.cuvee) document.getElementById("wineCuvee").value = data.cuvee;
        if (data.domain) document.getElementById("wineDomain").value = data.domain;
        if (data.vintage) document.getElementById("wineVintage").value = data.vintage;
        if (data.type) document.getElementById("wineType").value = data.type;
        if (data.appellation) document.getElementById("wineAppellation").value = data.appellation;
        if (data.region) document.getElementById("wineRegion").value = data.region;
        if (data.country) document.getElementById("wineCountry").value = data.country;

        alert("✨ Formulaire pré-rempli avec succès par l'IA ! Vérifiez les informations avant de sauvegarder.");
      } catch (e) {
        console.error("Échec du parsing JSON de l'assistant :", e);
        alert("L'IA n'a pas pu structurer correctement les données. Réessayez avec une description plus claire.");
      }
    }).catch(err => {
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
      console.error(err);
    });
  } else {
    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
    alert("Le module de communication avec l'IA (ai.js) n'est pas chargé.");
  }
}

/* ------------------------------------------------------------
   INITIALISATION DE L'INTERFACE AU CHARGEMENT
------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  // Chargement de la liste initiale des bouteilles
  renderWineList();

  // Écouteur pour la recherche en temps réel sur l'écran d'accueil
  const mainSearch = $("mainSearch");
  if (mainSearch) {
    mainSearch.addEventListener("input", async (e) => {
      const q = e.target.value;
      if (typeof dbSearch === "function") {
        const results = await dbSearch(q);
        renderWineList(results);
      }
    });
  }
});