/* ============================================================
   ui.js — Gestion de l’interface et de la navigation
   ============================================================ */

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

  if (sideMenu) sideMenu.style.left = "-260px";
  if (menuOverlay) menuOverlay.style.display = "none";

  if (screenId === "view-list" && typeof loadInventory === "function") loadInventory();
  if (screenId === "view-alerts" && typeof loadAlerts === "function") loadAlerts();
  if (screenId === "view-stats" && typeof loadStats === "function") loadStats();
  if (screenId === "view-shop" && typeof loadShopList === "function") loadShopList();
}

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
        <p style="font-size:2.5rem; margin-bottom:10px;">🍷</p>
        <p>Votre cave est vide ou aucun vin ne correspond à votre recherche.</p>
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
          <button class="btn-secondary" onclick="showWineDetail('${wine.id}')">🔍 Détails & IA</button>
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
    if (confirm("Voulez-vous supprimer cette bouteille de votre cave ?")) {
      await dbDeleteWine(id);
    } else {
      return;
    }
  } else {
    wine.quantity = newQty;
    await dbUpdateWine(id, wine);
  }

  if (typeof filterAndDisplayInventory === "function") filterAndDisplayInventory();
  renderWineList();
}

/* ------------------------------------------------------------
   AFFICHAGE DU DÉTAIL D'UNE BOUTEILLE (AVEC INTÉGRATION IA)
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
      <tr><td><b>Apogée :</b></td><td>Entre ${wine.aging?.drinkFrom || '?'} et ${wine.aging?.drinkTo || '?'}</td></tr>
    </table>

    <div style="margin-top: 20px; padding: 12px; background: #1e1e2f; border-radius: 8px; border: 1px solid #333;">
      <h4 style="margin: 0 0 10px 0; color: #60a5fa; display: flex; align-items: center; gap: 6px;">🤖 Assistant Sommelier</h4>
      <button class="btn" style="width:100%; background: #2563eb; font-size: 0.9rem;" id="btnMetsIa" onclick="typeof associerMetsIA === 'function' ? associerMetsIA('${wine.id}') : alert('Module IA non chargé')">
        🔍 Trouver des idées d'accords
      </button>
      <div id="accordMetsIaResult" style="margin-top: 10px; color: #e5e7eb; font-size: 0.9rem;"></div>
    </div>
    
    <div style="display:flex; gap: 10px; margin-top: 20px;">
      <button class="btn" style="flex:1; background: #4b5563;" onclick="closeWineDetail(); editWine('${wine.id}');">✏️ Modifier</button>
      <button class="btn" style="flex:1; background:#ef4444;" onclick="closeWineDetail(); deleteWineFromInv('${wine.id}');">🗑️ Supprimer</button>
    </div>
  `;

  modal.style.display = "block";
}

function closeWineDetail() {
  const modal = $("wineDetailModal");
  if (modal) modal.style.display = "none";
}

function createDetailModal() {
  const modal = document.createElement("div");
  modal.id = "wineDetailModal";
  modal.className = "modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.7)";
  modal.style.zIndex = "1000";

  modal.innerHTML = `
    <div class="modal-content" style="background: #1a1a1a; color: #fff; max-width: 450px; margin: 40px auto; padding: 20px; border-radius: 12px; position: relative; border: 1px solid #333;">
      <span class="close-modal" onclick="closeWineDetail()" style="position: absolute; top: 15px; right: 20px; font-size: 1.6rem; cursor: pointer; color: #aaa;">&times;</span>
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
  const texte = prompt("Entrez la description brute ou l'étiquette (ex: 'Château Margaux 2015 rouge') :");
  if (!texte || !texte.trim()) return;

  const btn = document.getElementById("btnAiFill");
  const originalText = btn ? btn.innerHTML : "🪄 Sainte-IA";
  if (btn) {
    btn.innerHTML = "⚡ Analyse en cours...";
    btn.disabled = true;
  }

  const promptConstruct = `Analyse ce texte et retourne UNIQUEMENT un objet JSON valide sans enrobage markdown :
  {"cuvee": string, "domain": string, "vintage": number, "type": "Rouge"|"Blanc"|"Rosé"|"Effervescent", "appellation": string, "region": string, "country": string}.
  Texte : "${texte}"`;

  if (typeof appelerGemini === "function") {
    appelerGemini(promptConstruct).then(reponse => {
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
      try {
        const cleanJson = reponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);

        openScreen("view-add");
        if (data.cuvee) document.getElementById("wineCuvee").value = data.cuvee;
        if (data.domain) document.getElementById("wineDomain").value = data.domain;
        if (data.vintage) document.getElementById("wineVintage").value = data.vintage;
        if (data.type) document.getElementById("wineType").value = data.type;
        
        alert("✨ Formulaire pré-rempli !");
      } catch (e) {
        alert("L'IA n'a pas pu structurer les données.");
      }
    }).catch(() => {
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
  }
}

/* ------------------------------------------------------------
   INITIALISATION
------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  renderWineList();
  const mainSearch = $("mainSearch");
  if (mainSearch) {
    mainSearch.addEventListener("input", async (e) => {
      if (typeof dbSearch === "function") {
        const results = await dbSearch(e.target.value);
        renderWineList(results);
      }
    });
  }
});