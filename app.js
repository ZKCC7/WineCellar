// Nettoyage du texte OCR
function nettoyerOCR(texte) {
  return texte
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(m => m.length > 2);
}

// Matching intelligent
function trouverVin(motsOCR) {
  let meilleurVin = null;
  let meilleurScore = 0;

  winesDB.forEach(vin => {
    let score = 0;
    motsOCR.forEach(mot => {
      if (vin.motsCles.includes(mot)) {
        score++;
      }
    });
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleurVin = vin;
    }
  });

  return meilleurScore >= 2 ? meilleurVin : null;
}

// Affichage
function afficherVin(vin) {
  const div = document.getElementById("resultatVin");
  div.innerHTML = `
    <p><strong>${vin.nom}</strong></p>
    <p>Producteur : ${vin.producteur}</p>
    <p>Région : ${vin.region} (${vin.pays})</p>
    <p>Millésime : ${vin.annee}</p>
  `;
}

function afficherMessage(msg) {
  const div = document.getElementById("resultatVin");
  div.innerHTML = `<p>${msg}</p>`;
}

// ⚠️ Stub OCR : à remplacer par un vrai OCR / API Vision
async function faireOCR(imageFile) {
  // Ici tu peux brancher :
  // - Tesseract.js
  // - Google Vision API
  // - Microsoft Vision
  //
  // Pour l'instant, on simule un OCR qui lit bien ton Chianti :
  return "Chianti Classico Don Giovanni Terre Natuzzi 2019 Italia";
}

// Pipeline complet
async function analyserPhoto() {
  const input = document.getElementById("photoInput");
  const status = document.getElementById("status");

  if (!input.files || input.files.length === 0) {
    status.textContent = "Sélectionne d'abord une photo.";
    return;
  }

  status.textContent = "Analyse de la photo...";
  const file = input.files[0];

  try {
    const texteOCR = await faireOCR(file);
    const mots = nettoyerOCR(texteOCR);
    const vin = trouverVin(mots);

    if (vin) {
      afficherVin(vin);
      status.textContent = "Vin reconnu ✅";
    } else {
      afficherMessage("❌ Aucun vin correspondant trouvé.");
      status.textContent = "Aucun vin trouvé.";
    }
  } catch (e) {
    console.error(e);
    status.textContent = "Erreur lors de l'analyse.";
  }
}

// Thème clair/sombre
document.getElementById("toggleThemeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

// Bouton analyser
document.getElementById("analyserBtn").addEventListener("click", analyserPhoto);
