/* ============================================================
   ai.js — Assistant Sommelier IA & Gestion Clé API (Version Complète)
   ============================================================ */

/**
 * Récupère la clé API de manière centralisée.
 * Si elle manque, redirige vers l'écran de réglages.
 */
function getGeminiApiKey() {
  const key = localStorage.getItem("gemini_api_key");
  if (!key || key.trim() === "") {
    console.warn("⚠️ Clé API Gemini manquante.");
    // Si la fonction switchView existe, on renvoie vers les réglages
    if (typeof switchView === "function") {
      switchView("settingsView");
    } else {
      alert("⚠️ Clé API Gemini manquante. Veuillez la configurer dans les réglages.");
    }
    return null;
  }
  return key.trim();
}

/**
 * Appelle l'API Gemini avec gestion d'erreur et compatibilité
 */
async function appelerGemini(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    // Utilisation du modèle gemini-1.5-flash (plus rapide et stable)
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ Erreur API Gemini :", data.error);
      return null;
    }

    // Extraction sécurisée de la réponse
    return data.candidates[0].content.parts[0].text;
    
  } catch (err) {
    console.error("❌ Erreur de connexion API :", err);
    return null;
  }
}

/**
 * Fiche sommelier avec extraction sécurisée des données
 */
async function proposerAccordsMetsVins(wine, btnElement) {
  if (!wine) return;

  const originalText = btnElement.innerHTML;
  btnElement.innerHTML = "🤖 Consultation...";
  btnElement.disabled = true;

  // Extraction sécurisée des données (évite les ?. pour la compatibilité)
  const id = wine.identity || {};
  const cuvee = id.cuvee || "Inconnue";
  const domain = id.domain || id.producer || "Inconnu";
  const vintage = id.vintage || "Inconnu";
  const type = id.type || id.color || "Rouge";
  const appellation = id.appellation || "Inconnue";
  const region = id.region || "Inconnue";
  const grapes = (id.grapes && Array.isArray(id.grapes)) ? id.grapes.join(", ") : "Non spécifiés";

  const prompt = `Sommelier expert, analyse ce vin : ${cuvee}, ${domain}, ${vintage}, ${type}, ${appellation}, ${region}, Cépages: ${grapes}. Génère une fiche conseils en HTML (p, ul, li, strong, emojis) avec 4 sections : 1. Température de service, 2. Apogée, 3. Note estimée (x/5), 4. 3 Accords mets-vins. Pas de markdown.`;

  const reponse = await appelerGemini(prompt);
  
  btnElement.innerHTML = originalText;
  btnElement.disabled = false;

  if (!reponse) return;

  // Injection du résultat
  let containerFiche = btnElement.closest(".card") || document.getElementById("wineDetailContent"); 
  let containerAccord = containerFiche.querySelector(".accord-mets-ia-result");
  
  if (!containerAccord) {
    containerAccord = document.createElement("div");
    containerAccord.className = "accord-mets-ia-result";
    containerAccord.style.marginTop = "15px";
    btnElement.parentNode.insertBefore(containerAccord, btnElement.nextSibling);
  }

  containerAccord.innerHTML = `<div class="ai-sommelier-content">${reponse}</div>`;
}