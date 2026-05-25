/* ============================================================
   scan.js — Pipeline OCR local + Recherche Web par Gemini Pro
   ============================================================ */

async function analyserPhoto() {
  const fileInput = document.getElementById("scanInput");
  const textStatus = document.getElementById("scanText");
  const scanResultView = document.getElementById("scanResult");

  if (!fileInput.files || fileInput.files.length === 0) {
    textStatus.textContent = "Aucune image sélectionnée.";
    return;
  }

  textStatus.innerHTML = "⚡ Étape 1 : Lecture de l'étiquette par OCR...";
  if (scanResultView) scanResultView.style.display = "none";

  const imageFile = fileInput.files[0];

  try {
    // 1. Exécution locale de Tesseract.js pour extraire le texte brut visible
    const { data } = await Tesseract.recognize(imageFile, "fra+eng");
    const textOCR = data.text;

    if (!textOCR || textOCR.trim().length === 0) {
      textStatus.textContent = "❌ Impossible d'extraire des caractères nets. Améliorez la lumière et reprenez la photo.";
      return;
    }

    textStatus.innerHTML = "🔍 Étape 2 : Recherche de l'identité du vin sur Internet (IA)...";

    // 2. Construction du prompt forçant Gemini à utiliser sa connexion Internet
    const promptInternetSearch = `
      Tu es un expert sommelier connecté au Web. Analyse le texte brut suivant extrait d'une étiquette de vin : "${textOCR}".
      Recherche sur Internet de quel vin exact il s'agit pour trouver son Domaine, sa Cuvée précise, son Millésime, sa Couleur, son Appellation et sa Région de production.
      Fournis impérativement et UNIQUEMENT un code JSON brut (sans balise ni enrobage markdown, pas de \`\`\`json ou \`\`\`), calqué exactement sur ce format :
      {
        "cuvee": "Nom de la cuvée ou grand vin",
        "domain": "Nom du Domaine ou Château",
        "vintage": "Année (ex: 2019) ou N.V. si non millésimé",
        "type": "Rouge ou Blanc ou Rosé",
        "appellation": "Appellation d'Origine",
        "region": "Région viticole",
        "country": "Pays d'origine"
      }
    `;

    if (typeof appelerGemini !== "function") {
      textStatus.textContent = "❌ Erreur de liaison : le module de communication IA (ai.js) est indisponible.";
      return;
    }

    // 3. Appel de l'API Gemini
    const reponseIA = await appelerGemini(promptInternetSearch);

    if (!reponseIA || reponseIA.trim().length === 0) {
      textStatus.textContent = "❌ L'IA n'a pas répondu. Vérifiez votre clé API dans les Options.";
      return;
    }

    try {
      // Nettoyage de sécurité si l'IA inclut des blocs markdown de code
      const cleanJsonStr = reponseIA.replace(/```json/g, "").replace(/```/g, "").trim();
      const vinDataInternet = JSON.parse(cleanJsonStr);

      textStatus.innerHTML = "✅ Spécifications trouvées sur Internet !";

      if (scanResultView) {
        scanResultView.style.display = "block";
        scanResultView.innerHTML = `
          <h3 style="margin-top:0; color:#60a5fa; font-size:1.05rem; display:flex; align-items:center; gap:6px;">🌍 Données d'Internet</h3>
          <p style="margin:4px 0;"><strong>Domaine :</strong> ${vinDataInternet.domain || 'Non trouvé'}</p>
          <p style="margin:4px 0;"><strong>Cuvée :</strong> ${vinDataInternet.cuvee || 'Non trouvée'}</p>
          <p style="margin:4px 0;"><strong>Millésime :</strong> ${vinDataInternet.vintage || 'Inconnu'}</p>
          <p style="margin:4px 0;"><strong>Couleur :</strong> ${vinDataInternet.type || 'Rouge'}</p>
          <p style="margin:4px 0;"><strong>Appellation :</strong> ${vinDataInternet.appellation || 'Non spécifiée'}</p>
          <p style="margin:4px 0;"><strong>Origine :</strong> ${vinDataInternet.region || 'Inconnue'} (${vinDataInternet.country || 'France'})</p>
          
          <button class="btn" style="width:100%; margin-top:12px; background:#10b981; padding:10px; font-weight:600;"
            onclick="preRemplirFormulaireDepuisScan(${JSON.stringify(vinDataInternet).replace(/"/g, '&quot;')})">
            📥 Importer et pré-remplir la fiche
          </button>
        `;
      }

    } catch (errParsing) {
      console.error("Erreur parsing JSON IA :", errParsing);
      textStatus.textContent = "❌ Données récupérées sur Internet mais impossibles à structurer.";
    }

  } catch (errGlobal) {
    console.error(errGlobal);
    textStatus.textContent = "❌ Échec technique lors du traitement de l'image.";
  }
}

// Transfert automatique vers le formulaire d'ajout
window.preRemplirFormulaireDepuisScan = function(data) {
  if (!data) return;

  if (typeof switchView === "function") {
    switchView("view-add");
  }

  // Remplissage des champs de la vue HTML
  if (data.cuvee && document.getElementById("wineCuvee")) document.getElementById("wineCuvee").value = data.cuvee;
  if (data.domain && document.getElementById("wineDomain")) document.getElementById("wineDomain").value = data.domain;
  if (data.vintage && document.getElementById("wineVintage")) document.getElementById("wineVintage").value = data.vintage;
  if (data.type && document.getElementById("wineType")) document.getElementById("wineType").value = data.type;
  if (data.appellation && document.getElementById("wineAppellation")) document.getElementById("wineAppellation").value = data.appellation;
  if (data.region && document.getElementById("wineRegion")) document.getElementById("wineRegion").value = data.region;
  if (data.country && document.getElementById("wineCountry")) document.getElementById("wineCountry").value = data.country;
};

document.addEventListener("DOMContentLoaded", () => {
  const fileInputEl = document.getElementById("scanInput");
  if (fileInputEl) {
    fileInputEl.addEventListener("change", analyserPhoto);
  }
});