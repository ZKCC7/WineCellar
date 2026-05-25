// ============================================================
// ai.js — Reconnaissance de vin via Gemini Flash (gratuit)
// Clé API : https://aistudio.google.com
// ============================================================

function getGeminiApiKey() {
  const key = localStorage.getItem('gemini_api_key');
  if (!key || !key.trim()) {
    alert('Veuillez configurer votre clé API Gemini dans le menu (☰).\n\nClé gratuite sur : aistudio.google.com');
    return null;
  }
  return key.trim();
}

// Convertir un File en base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Appel Gemini Flash avec vision
async function analyserEtiquetteAvecClaude(imageFile) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const base64 = await fileToBase64(imageFile);
  const mediaType = imageFile.type || 'image/jpeg';

  const prompt = `Tu es un expert en vins. Analyse cette photo d'étiquette de vin et extrais toutes les informations visibles.

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas d'explication), avec ces champs :
{
  "cuvee": "nom de la cuvée ou du vin",
  "domain": "nom du domaine ou producteur",
  "vintage": "millésime (année uniquement, ex: 2018)",
  "type": "Rouge | Blanc | Rosé | Champagne | Mousseux | Doux",
  "appellation": "appellation (ex: Pauillac, Meursault...)",
  "region": "région viticole (ex: Bordeaux, Bourgogne...)",
  "country": "pays (ex: France, Italie...)",
  "rating": null,
  "ratingSource": null,
  "drinkFrom": "année début apogée estimée selon le type et millésime, sinon null",
  "drinkTo": "année fin apogée estimée selon le type et millésime, sinon null",
  "notes": "informations complémentaires intéressantes visibles sur l'étiquette"
}

Si une information n'est pas visible ou lisible, mets null pour ce champ.
Estime le type de vin d'après la couleur de la bouteille ou les indices visuels si non précisé.
Estime drinkFrom et drinkTo d'après le millésime et le type de vin si tu les connais.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: mediaType,
                data: base64
              }
            },
            { text: prompt }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Nettoyer et parser le JSON
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);

  } catch (e) {
    console.error('Erreur Gemini API:', e);
    throw e;
  }
}

window.analyserEtiquetteAvecClaude = analyserEtiquetteAvecClaude;
window.getGeminiApiKey = getGeminiApiKey;
