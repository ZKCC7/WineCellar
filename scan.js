/* ============================================================
   scan.js — Traitement OCR (Tesseract) & Requête Internet Gemini
   ============================================================ */

async function analyserPhoto() {
  const fileInput = document.getElementById("scanInput");
  const textStatus = document.getElementById("scanText");
  const scanResultView = document.getElementById("scanResult");

  if (!fileInput.files || fileInput.files.length === 0) {
    textStatus.textContent = "Aucune photo sélectionnée.";
    return;
  }

  textStatus.innerHTML = "⏳ Analyse de l'image (OCR en cours)...";
  if (scanResultView) scanResultView.style.display = "none";

  const imageFile = fileInput.files[0];

  try {
    // 1. Numérisation textuelle locale via Tesseract.js
    const { data } = await Tesseract.recognize(imageFile, "fra+eng");
    const extractedRawText = data.text;

    if (!extractedRawText || extractedRawText.trim().length === 0) {
      textStatus.textContent = "❌ Lecture de l'étiquette impossible. Assurez-vous que le texte soit lisible.";
      return;
    }

    textStatus.innerHTML = "🌍 Recherche des spécificités du vin sur Internet (IA)...";

    // 2. Préparation du prompt d'analyse et de recherche globale pour Gemini
    const systemQueryPrompt = `
      Tu es un sommelier professionnel connecté à Internet. Analyse les informations issues de ce scan d'étiquette de vin : "${extractedRawText}".
      Recherche sur internet les données correspondantes exactes pour ce vin (identifie le domaine, la cuvée exacte, l'appellation, le millésime, le type/couleur du vin).
      Génère et retourne UNIQUEMENT un objet JSON standardisé brut, sans enrobage markdown (sans \`\`\`json et sans \`\`\`), respectant cette structure exacte :
      {
        "cuvee": "Nom précis de la cuvée",
        "domain": "Nom du domaine ou château",
        "vintage": "Année trouvée (ex: 2020) ou N.V.",
        "type": "Rouge ou Blanc ou Rosé",
        "appellation": "Appellation AOC/AOP",
        "region": "Région de production",
        "country": "Pays"
      }
    `;

    if (typeof appelerGemini !== "function") {
      textStatus.textContent = "❌ Liaison technique manquante avec l'intégration de l'IA (ai.js).";
      return;
    }

    // 3. Soumission à l'API Gemini connectée
    const responseTextIA = await appelerGemini(systemQueryPrompt);

    if (!responseTextIA || responseTextIA.trim().length === 0) {
      textStatus.textContent = "❌ Aucune donnée renvoyée par l'IA. Configurez votre clé API Gemini.";
      return;
    }

    try {
      // Nettoyage au cas où l'IA renverrait du texte ou des blocs markdown
      const sanitizedJsonStr = responseTextIA.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedWineObject = JSON.parse(sanitizedJsonStr);

      textStatus.innerHTML = "✅ Recherche Internet terminée !";

      if (scanResultView) {
        scanResultView.style.display = "block";
        scanResultView.innerHTML = `
          <h3 style="margin-top:0; color:#60a5fa; font-size:1.1rem;">🌍 Résultats Internet</h3>
          <p style="margin:6px 0;"><strong>Domaine :</strong> ${parsedWineObject.domain || 'Inconnu'}</p>
          <p style="margin:6px 0;"><strong>Cuvée :</strong> ${parsedWineObject.cuvee || 'Non trouvée'}</p>
          <p style="margin:6px 0;"><strong>Millésime :</strong> ${parsedWineObject.vintage || 'Inconnu'}</p>
          <p style="margin:6px 0;"><strong>Type :</strong> ${parsedWineObject.type || 'Rouge'}</p>
          <p style="margin:6px 0;"><strong>Région :</strong> ${parsedWineObject.region || 'Inconnue'} (${parsedWineObject.country || 'France'})</p>
          <p style="margin:6px 0;"><strong>Appellation :</strong> ${parsedWineObject.appellation || 'Non spécifiée'}</p>
          
          <button class="btn" style="width:100%; margin-top:15px; background:#10b981; padding:12px; font-weight:600;"
            onclick="preRemplirDepuisScan(${JSON.stringify(parsedWineObject).replace(/"/g, '&quot;')})">
            📥 Pré-remplir le formulaire d'ajout
          </button>
        `;
      }
    } catch (parseError) {
      console.error(parseError);
      textStatus.textContent = "❌ Structure de réponse IA incorrecte. Échec de la structuration.";
    }

  } catch (technicalError) {
    console.error(technicalError);
    textStatus.textContent = "❌ Une erreur est survenue pendant le scan de la photo.";
  }
}

// Remplissage automatique des champs et basculement vers l'écran d'ajout
window.preRemplirSinceScan = function(wineData) {
  if (!wineData) return;

  if (typeof switchView === "function") {
    switchView("view-add");
  }

  if (wineData.cuvee && document.getElementById("wineCuvee")) document.getElementById("wineCuvee").value = wineData.cuvee;
  if (wineData.domain && document.getElementById("wineDomain")) document.getElementById("wineDomain").value = wineData.domain;
  if (wineData.vintage && document.getElementById("wineVintage")) document.getElementById("wineVintage").value = wineData.vintage;
  if (wineData.type && document.getElementById("wineType")) document.getElementById("wineType").value = wineData.type;
  if (wineData.appellation && document.getElementById("wineAppellation")) document.getElementById("wineAppellation").value = wineData.appellation;
  if (wineData.region && document.getElementById("wineRegion")) document.getElementById("wineRegion").value = wineData.region;
  if (wineData.country && document.getElementById("wineCountry")) document.getElementById("wineCountry").value = wineData.country;
};

// Alias global robuste pour l'UI
window.preRemplirDepuisScan = window.preRemplirSinceScan;

document.addEventListener("DOMContentLoaded", () => {
  const captureElement = document.getElementById("scanInput");
  if (captureElement) {
    captureElement.addEventListener("change", analyserPhoto);
  }
});