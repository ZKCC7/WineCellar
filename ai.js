// ============================================================
// ai.js — Reconnaissance de vin via Claude (vision native)
// ============================================================

function getClaudeApiKey() {
  const key = localStorage.getItem('claude_api_key');
  if (!key || !key.trim().startsWith('sk-ant-')) {
    alert('Veuillez configurer votre clé API Claude dans le menu (☰).\n\nCréez une clé sur console.anthropic.com');
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

// Appel Claude avec vision
async function analyserEtiquetteAvecClaude(imageFile) {
  const apiKey = getClaudeApiKey();
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
  "rating": "note sur 100 si visible sur l'étiquette, sinon null",
  "ratingSource": "source de la note si visible, sinon null",
  "drinkFrom": "année début apogée estimée si connue, sinon null",
  "drinkTo": "année fin apogée estimée si connue, sinon null",
  "notes": "informations complémentaires intéressantes visibles sur l'étiquette"
}

Si une information n'est pas visible ou lisible, mets null pour ce champ.
Estime le type de vin d'après la couleur de la bouteille ou les indices visuels si non précisé.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64
              }
            },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Nettoyer et parser le JSON
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);

  } catch (e) {
    console.error('Erreur Claude API:', e);
    throw e;
  }
}

window.analyserEtiquetteAvecClaude = analyserEtiquetteAvecClaude;
window.getClaudeApiKey = getClaudeApiKey;
