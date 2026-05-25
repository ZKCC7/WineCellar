// Variable globale pour l'image scannée
let scannedImageFile = window.scannedImageFile || null;

// Récupérer la clé API
function getGeminiApiKey() {
  const key = localStorage.getItem("gemini_api_key");
  if (!key || key.trim() === "") {
    alert("Veuillez configurer votre clé API Gemini dans les réglages.");
    return null;
  }
  return key.trim();
}

// Appeler l'API Gemini
async function appelerGemini(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error("Erreur API Gemini :", data.error);
      return null;
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error("Erreur de connexion API :", err);
    return null;
  }
}

// Remplir le formulaire avec l'IA
async function assistantRemplirFormulaire() {
  const btn = document.getElementById('btnAiFill');
  if (!btn) return;

  const originalText = btn.innerHTML;
  btn.innerHTML = "Analyse en cours...";
  btn.disabled = true;

  try {
    if (!window.scannedImageFile) {
      throw new Error("Veuillez d'abord scanner une étiquette.");
    }

    const { data: { text } } = await Tesseract.recognize(
      window.scannedImageFile,
      'eng+fra'
    );

    const prompt = `
      Analyse ce texte d'étiquette de vin et extrais en JSON :
      - cuvee
      - domain
      - vintage
      - type
      - appellation
      - region
      Texte : ${text}
    `;

    const reponseJson = await appelerGemini(prompt);
    if (!reponseJson) throw new Error("Impossible d'analyser l'étiquette.");

    const data = JSON.parse(reponseJson);
    const fields = {
      wineCuvee: data.cuvee || "",
      wineDomain: data.domain || "",
      wineVintage: data.vintage || "",
    };

    for (const [fieldId, value] of Object.entries(fields)) {
      const field = document.getElementById(fieldId);
      if (field) field.value = value;
    }

    alert("Formulaire rempli avec succès !");
  } catch (error) {
    console.error("Erreur IA :", error);
    alert(`Erreur : ${error.message}`);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Exposition globale
window.assistantRemplirFormulaire = assistantRemplirFormulaire;
window.scannedImageFile = scannedImageFile;