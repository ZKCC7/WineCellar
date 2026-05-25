// ============================================================
// ai.js — Assistant Sommelier IA & Gestion Clé API (Version Complète Corrigée)
// ============================================================

// Variable globale pour l'image scannée (définie dans scan.js)
let scannedImageFile = window.scannedImageFile || null;

/**
 * Récupère la clé API de manière centralisée.
 */
function getGeminiApiKey() {
    const key = localStorage.getItem("gemini_api_key");
    if (!key || key.trim() === "") {
        console.warn("⚠️ Clé API Gemini manquante.");
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
 * Appelle l'API Gemini avec gestion d'erreur.
 */
async function appelerGemini(prompt) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) return null;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        if (data.error) {
            console.error("❌ Erreur API Gemini :", data.error);
            return null;
        }
        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        console.error("❌ Erreur de connexion API :", err);
        return null;
    }
}

/**
 * Fiche sommelier avec extraction sécurisée des données.
 */
async function proposerAccordsMetsVins(wine, btnElement) {
    if (!wine) return;

    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = "🤖 Consultation...";
    btnElement.disabled = true;

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

/**
 * Remplit le formulaire automatiquement via IA.
 */
async function assistantRemplirFormulaire() {
    const btn = document.getElementById('btnAiFill');
    if (!btn) {
        console.error("❌ Bouton #btnAiFill introuvable !");
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = "🔍 Analyse en cours...";
    btn.disabled = true;

    try {
        // 1. Vérifie si une image est disponible
        if (!window.scannedImageFile) {
            throw new Error("Veuillez d'abord scanner une étiquette depuis l'onglet 'Scanner'.");
        }

        // 2. OCR avec Tesseract (multilingue)
        const { data: { text } } = await Tesseract.recognize(
            window.scannedImageFile,
            'eng+fra+ita+spa'
        );
        console.log("Texte extrait :", text);

        // 3. Prompt optimisé pour extraire les données du vin (même en italien/espagnol)
        const prompt = `
            Analyse le texte suivant d'une étiquette de vin (peut être en français, italien, espagnol ou anglais) et extrais les informations en JSON :
            - cuvee (nom du vin)
            - domain (domaine/producteur)
            - vintage (millésime/année)
            - type (rouge, blanc, rosé, etc.)
            - appellation (AOC, DOC, etc.)
            - region (région/pays)
            - grapes (cépages, si disponibles)

            Texte de l'étiquette :
            ${text}

            Réponds UNIQUEMENT avec un JSON valide, sans explication.
        `;

        // 4. Appel à l'API Gemini
        const reponseJson = await appelerGemini(prompt);
        if (!reponseJson) {
            throw new Error("Impossible d'analyser l'étiquette. Vérifiez votre clé API ou la qualité de l'image.");
        }

        // 5. Remplit le formulaire
        let data;
        try {
            data = JSON.parse(reponseJson);
        } catch (e) {
            throw new Error("Réponse invalide de l'IA. Veuillez réessayer.");
        }

        // Remplissage des champs (avec valeurs par défaut si vide)
        const fields = {
            wineCuvee: data.cuvee || "",
            wineDomain: data.domain || data.producer || "",
            wineVintage: data.vintage || "",
            wineType: data.type || "",
            wineAppellation: data.appellation || "",
            wineRegion: data.region || "",
            wineCountry: data.country || "France"  // Valeur par défaut
        };

        for (const [fieldId, value] of Object.entries(fields)) {
            const field = document.getElementById(fieldId);
            if (field) field.value = value;
        }

        alert("✅ Formulaire rempli avec succès !");
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