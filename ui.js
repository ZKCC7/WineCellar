/* ============================================================
   ui.js — Gestion de l’interface, Navigation et Fiches Vins
   ============================================================ */

function $(id) {
  return document.getElementById(id);
}

/* ------------------------------------------------------------
   MENU HAMBURGER (CORRIGÉ SANS BANDE RESTANTE)
------------------------------------------------------------ */
const menuBtn = $("menuBtn");
const menuOverlay = $("menuOverlay");
const sideMenu = $("sideMenu");

if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
if (menuOverlay) menuOverlay.addEventListener("click", toggleMenu);

function toggleMenu() {
  if (!sideMenu) return;
  
  const isOpen = sideMenu.classList.contains("open");
  if (isOpen) {
    sideMenu.classList.remove("open");
    if (menuOverlay) menuOverlay.style.display = "none";
  } else {
    sideMenu.classList.add("open");
    if (menuOverlay) menuOverlay.style.display = "block";
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

  // Fermeture automatique du menu hamburger après clic
  if (sideMenu) sideMenu.classList.remove("open");
  if (menuOverlay) menuOverlay.style.display = "none";

  // Rechargements à la volée selon l'écran demandé
  if (screenId === "view-list" && typeof renderWineList === "function") renderWineList();
  if (screenId === "view-inventory" && typeof loadInventory === "function") loadInventory();
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
      <div class="card" style="text-align:center; color:#aaa; padding:30px;">
        <p style="font-size:2.5rem; margin-bottom:10px;">🍷</p>
        <p>Votre cave est vide ou aucun vin ne correspond.</p>
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
            <h3 class="wine-title" style="margin: 5px 0;">${wine.identity?.cuvee || 'Sans nom'}</h3>
            <p class="wine-subtitle" style="margin: 0; color:#aaa;">${wine.identity?.domain || 'Domaine inconnu'} - ${wine.identity?.vintage || 'N.V.'}</p>
          </div>
          <div class="wine-qty-badge" style="background: #6b1d2f; padding: 5px 10px; border-radius: 6px;">
            <span class="qty-val" style="font-weight: bold;">${wine.quantity || 0}</span>
          </div>
        </div>
        
        <div class="wine-meta" style="margin-top: 10px; font-size: 0.85rem; color: #bbb;">
          <span>📍 ${wine.location || 'Non localisé'}</span> | <span>🍼 ${wine.size || '75cl'}</span>
        </div>

        <div class="card-actions-inline" style="margin-top: 12px; display: flex; gap: 8px;">
          <button class="btn" style="flex: 2; font-size: 0.85rem; padding: 6px; background:#4b5563;" onclick="showWineDetail('${wine.id}')">🔍 Fiche & IA</button>
          <button class="btn" style="flex: 1; padding: 6px; background:#10b981;" onclick="quickIncrement('${wine.id}', 1)">➕</button>
          <button class="btn" style="flex: 1; padding: 6px; background:#ef4444;" onclick="quickIncrement('${wine.id}', -1)">➖</button>
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
   AFFICHAGE DE LA FICHE DÉTAILLÉE (AVEC PHOTO INTEGRÉE)
------------------------------------------------------------ */
async function showWineDetail(id) {
  const wine = await dbGetWine(id);
  if (!wine) return;

  const modal = $("wineDetailModal") || createDetailModal();
  const content = $("wineDetailContent");
  if (!content) return;

  const wineTypeColor = (wine.identity?.type || 'Rouge').toLowerCase();
  
  // URL d'illustration par défaut de haute qualité (Unsplash) si aucune photo personnalisée n'est stockée
  const photoVin = wine.imageUrl || `https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=500&q=80`;

  content.innerHTML = `
    <div style="width:100%; height:180px; overflow:hidden; border-radius:8px; margin-bottom:15px; position:relative; background:#222;">
      <img src="${photoVin}" alt="Photo de la bouteille" style="width:100%; height:100%; object-fit:cover; opacity:0.85;" />
      <span class="badge badge-${wineTypeColor}" style="position:absolute; bottom:10px; left:10px; font-size:0.85rem; padding:4px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.6);">
        ${wine.identity?.type || 'Rouge'}
      </span>
    </div>

    <div style="text-align: center; margin-bottom: 15px;">
      <h2 style="margin: 5px 0; color: #ffb347; font-size: 1.5rem;">${wine.identity?.cuvee || 'Sans nom'}</h2>
      <p style="margin: 0; font-weight: 600; color: #fff;">${wine.identity?.domain || 'Domaine inconnu'}</p>
    </div>

    <table class="detail-table" style="width:100%; border-collapse: collapse; margin-bottom: 15px; color: #eee; font-size:0.9rem;">
      <tr style="border-bottom: 1px solid #333;"><td style="padding:6px 0;"><b>Appellation :</b></td><td>${wine.identity?.appellation || 'Non renseignée'}</td></tr>
      <tr style="border-bottom: 1px solid #333;"><td style="padding:6px 0;"><b>Région :</b></td><td>${wine.identity?.region || 'Non renseignée'}</td></tr>
      <tr style="border-bottom: 1px solid #333;"><td style="padding:6px 0;"><b>Pays :</b></td><td>${wine.identity?.country || 'France'}</td></tr>
      <tr style="border-bottom: 1px solid #333;"><td style="padding:6px 0;"><b>Millésime :</b></td><td>${wine.identity?.vintage || 'N.V.'}</td></tr>
      <tr style="border-bottom: 1px solid #333;"><td style="padding:6px 0;"><b>Emplacement :</b></td><td>${wine.location || 'Non spécifié'}</td></tr>
      <tr style="border-bottom: 1px solid #333;"><td style="padding:6px 0;"><b>Contenance :</b></td><td>${wine.size || '75cl'}</td></tr>
      <tr style="border-bottom: 1px solid #333;"><td style="padding:6px 0;"><b>Apogée :</b></td><td>Entre ${wine.aging?.drinkFrom || '?'} et ${wine.aging?.drinkTo || '?'}</td></tr>
    </table>

    <div style="margin-top: 15px; padding: 12px; background: #222; border-radius: 8px; border: 1px solid #444;">
      <h4 style="margin: 0 0 8px 0; color: #60a5fa; display: flex; align-items: center; gap: 6px; font-size:0.95rem;">🤖 Accords Mets-Vins</h4>
      <button class="btn" style="width:100%; background: #2563eb; font-size: 0.85rem; padding:8px;" id="btnMetsIa" onclick="typeof associerMetsIA === 'function' ? associerMetsIA('${wine.id}') : alert('Module IA indisponible')">
        🔍 Suggérer des plats complémentaires
      </button>
      <div id="accordMetsIaResult" style="margin-top: 10px; color: #ddd; font-size: 0.85rem; line-height:1.4;"></div>
    </div>
    
    <div style="display:flex; gap: 10px; margin-top: 15px;">
      <button class="btn" style="flex:1; background: #4b5563; padding:8px;" onclick="closeWineDetail(); editWine('${wine.id}');">✏️ Modifier</button>
      <button class="btn" style="flex:1; background:#ef4444; padding:8px;" onclick="closeWineDetail(); deleteWineFromInv('${wine.id}');">🗑️ Supprimer</button>
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
  modal.style.backgroundColor = "rgba(0,0,0,0.85)";
  modal.style.zIndex = "10000";

  modal.innerHTML = `
    <div class="modal-content" style="background: #111; color: #fff; max-width: 420px; margin: 30px auto; padding: 20px; border-radius: 12px; position: relative; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
      <span class="close-modal" onclick="closeWineDetail()" style="position: absolute; top: 10px; right: 15px; font-size: 1.8rem; cursor: pointer; color: #999; z-index:10;">&times;</span>
      <div id="wineDetailContent"></div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

/* ------------------------------------------------------------
   ASSISTANT CONVERSATIONNEL RAPIDE
------------------------------------------------------------ */
function assistantRemplirFormulaire() {
  const texte = prompt("Entrez les informations brutes (Ex: 'Château Margaux 2018 rouge Bordeaux') :");
  if (!texte || !texte.trim()) return;

  const btn = document.getElementById("btnAiFill");
  if (btn) {
    btn.innerHTML = "⚡ Analyse en cours...";
    btn.disabled = true;
  }

  const promptConstruct = `Retourne un JSON brut sans markdown : {"cuvee":"","domain":"","vintage":2018,"type":"Rouge","appellation":"","region":"","country":"France"} basé sur : "${texte}"`;

  if (typeof appelerGemini === "function") {
    appelerGemini(promptConstruct).then(reponse => {
      if (btn) { btn.innerHTML = "🪄 Ajouter via l'assistant IA"; btn.disabled = false; }
      try {
        const cleanJson = reponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);

        openScreen("view-add");
        if (data.cuvee) $("wineCuvee").value = data.cuvee;
        if (data.domain) $("wineDomain").value = data.domain;
        if (data.vintage) $("wineVintage").value = data.vintage;
        if (data.type) $("wineType").value = data.type;
      } catch (e) {
        alert("Impossible de structurer le texte envoyé.");
      }
    }).catch(() => {
      if (btn) { btn.innerHTML = "🪄 Ajouter via l'assistant IA"; btn.disabled = false; }
    });
  }
}

/* ------------------------------------------------------------
   INITIALISATION DES RECHERCHES
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