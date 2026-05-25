/* ============================================================
   ai.js — Assistant Sommelier IA Complet & Remplissage Automatique
   ============================================================ */

// Récupération sécurisée de la clé depuis le LocalStorage
function getGeminiApiKey() {
  const key = localStorage.getItem("gemini_api_key");
  if (!key) {
    alert("⚠️ Clé API Gemini manquante. Rends-toi dans l'onglet 'Réglages' pour la configurer.");
    if (typeof showScreen === "function") {
      showScreen("settingsView");
      if (typeof setActiveTab === "function") setActiveTab("settingsView");
    }
    return null;
  }
  return key;
}

/**
 * Appelle l'API Gemini Pro avec le prompt fourni
 * @param {string} prompt 
 * @returns {Promise<string>} Réponse textuelle de l'IA
 */
async function appelerGemini(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return "";

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    if (data && data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error("❌ Format de réponse de l'API inattendu :", data);
      return "Une erreur est survenue lors de l'analyse par l'IA.";
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'appel à l'API Gemini :", err);
    return "Impossible de contacter le sommelier virtuel. Vérifie ta connexion ou ta clé API.";
  }
}

/**
 * Génère une fiche conseil sommelier complète via l'API Gemini
 * (Accords, Température de service, Note estimée, Fenêtre de consommation)
 * @param {Object} wine - Objet vin complet provenant d'IndexedDB
 * @param {HTMLElement} btnElement - Le bouton cliqué dans l'UI
 */
async function proposerAccordsMetsVins(wine, btnElement) {
  if (!wine) {
    console.error("❌ proposerAccordsMetsVins : vin manquant");
    return;
  }

  const originalText = btnElement.innerHTML;
  btnElement.innerHTML = "🤖 Consultation du sommelier...";
  btnElement.disabled = true;

  // Construction d'un prompt ultra-précis pour obtenir des données structurées
  const prompt = `
    En tant que sommelier expert et critique gastronomique, analyse le vin suivant :
    - Cuvée: ${wine.identity?.cuvee || "Inconnue"}
    - Domaine/Producteur: ${wine.identity?.domain || wine.identity?.producer || "Inconnu"}
    - Millésime (Année): ${wine.identity?.vintage || "Inconnu"}
    - Couleur/Type: ${wine.identity?.type || wine.identity?.color || "Rouge"}
    - Appellation: ${wine.identity?.appellation || "Inconnu"}
    - Région: ${wine.identity?.region || "Inconnue"}
    - Cépages: ${wine.identity?.grapes?.length ? wine.identity.grapes.join(", ") : "Non spécifiés"}

    Génère une fiche de conseils personnalisée en français. Ta réponse doit être structurée en HTML léger (uniquement des balises <p>, <ul>, <li>, <strong>, et des émojis). Ne mets pas de balises globales comme <html> ou <body>, ni de blocs de code markdown (\`\`\`html).

    Remplis impérativement les 4 sections suivantes :
    1. 🌡️ **Température de service idéale** : Donne la température exacte en degrés Celsius adaptée à ce profil de vin et un court conseil (ex: "À carafer 1h avant").
    2. ⏳ **Date de consommation (Apogée)** : En te basant sur le millésime et la région, estime si ce vin est prêt à boire, s'il doit attendre, ou s'il est à son apogée (indique une fourchette d'années indicatives).
    3. ⭐ **Note moyenne estimée des internautes** : Donne une note réaliste sur 5 étoiles (ex: 4.2/5 ⭐) basée sur la réputation générale de ce type de vin/domaine, accompagnée d'un court commentaire sur le ressenti global de la communauté.
    4. 🍽️ **Accords mets-vins parfaits** : Propose 3 idées d'accords culinaires précis, gourmands et rapides (sous forme de liste à puces <ul>/<li>).
  `;

  const reponse = await appelerGemini(prompt);
  btnElement.innerHTML = originalText;
  btnElement.disabled = false;

  if (!reponse) return;

  // Trouver ou créer la zone d'affichage dans la carte du vin (Fiche vin)
  let containerFiche = btnElement.closest(".card") || document.getElementById("wineDetailContent"); 
  if (!containerFiche) {
    console.error("❌ Impossible de trouver le conteneur de la fiche du vin.");
    return;
  }

  let containerAccord = containerFiche.querySelector(".accord-mets-ia-result");
  
  if (!containerAccord) {
    containerAccord = document.createElement("div");
    containerAccord.className = "accord-mets-ia-result";
    // Style harmonisé avec votre CSS applicatif
    containerAccord.style = "margin-top: 15px; padding: 15px; background: var(--primary-light); border-left: 4px solid var(--primary); border-radius: 8px; font-size: 0.9rem; color: var(--text-main); line-height: 1.5;";
    // Insérer le conteneur juste en dessous du bouton de l'IA
    btnElement.parentNode.insertBefore(containerAccord, btnElement.nextSibling);
  }

  // Injection propre du code HTML généré par l'IA
  containerAccord.innerHTML = `
    <h4 style="margin-top:0; color: var(--primary); font-weight:600; display:flex; align-items:center; gap:6px; margin-bottom:10px;">
      ✨ Conseils de l'Assistant Sommelier
    </h4>
    <div class="ai-sommelier-content">
      ${reponse}
    </div>
  `;
}

/**
 * Optionnel : Fonction d'assistance pour pré-remplir le formulaire d'ajout (liée à ton bouton bouton Remplir par IA)
 */
async function assistantRemplirFormulaire() {
  const promptUser = prompt("Entrez le nom du vin ou collez le texte brut issu d'une étiquette :");
  if (!promptUser || !promptUser.trim()) return;

  const btnAiFill = document.getElementById("btnAiFill");
  const originalText = btnAiFill ? btnAiFill.innerHTML : "";
  if (btnAiFill) btnAiFill.innerHTML = "🪄 Analyse en cours...";

  const promptAnalyse = `
    Analyse ce texte concernant un vin : "${promptUser}"
    Extrais les informations suivantes sous la forme d'un objet JSON strict (sans texte autour, sans bloc de code markdown \`\`\`json).
    Si une information est inconnue, laisse une chaîne vide.
    Champs requis :
    {
      "cuvee": "nom du vin ou de la cuvée",
      "domain": "nom du domaine ou producteur",
      "vintage": année (nombre ou vide),
      "type": "Rouge" ou "Blanc" ou "Rosé" ou "Effervescent",
      "appellation": "AOC/IGP/etc",
      "region": "Bordeaux, Bourgogne, Rhône, etc",
      "country": "France"
    }
  `;

  const reponseJson = await appelerGemini(promptAnalyse);
  if (btnAiFill) btnAiFill.innerHTML = originalText;

  try {
    // Nettoyer d'éventuels résidus de markdown si l'IA en a mis malgré tout
    const cleanJson = reponseJson.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanJson);

    if (document.getElementById("wineCuvee")) document.getElementById("wineCuvee").value = data.cuvee || "";
    if (document.getElementById("wineDomain")) document.getElementById("wineDomain").value = data.domain || "";
    if (document.getElementById("wineVintage")) document.getElementById("wineVintage").value = data.vintage || "";
    if (document.getElementById("wineType")) document.getElementById("wineType").value = data.type || "Rouge";
    if (document.getElementById("wineAppellation")) document.getElementById("wineAppellation").value = data.appellation || "";
    if (document.getElementById("wineRegion")) document.getElementById("wineRegion").value = data.region || "";
    if (document.getElementById("wineCountry")) document.getElementById("wineCountry").value = data.country || "France";

    alert("✨ Formulaire pré-rempli avec succès ! Vérifie les informations avant de sauvegarder.");
  } catch (e) {
    console.error("Erreur de parsing JSON de l'IA :", e, reponseJson);
    alert("L'IA n'a pas pu structurer la réponse correctement. Texte reçu :\n" + reponseJson);
  }
}