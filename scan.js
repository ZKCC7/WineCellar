/* ============================================================
   scan.js — Scan IA avec Tesseract.js
   ============================================================ */

/* ------------------------------------------------------------
   Nettoyage du texte OCR
------------------------------------------------------------ */
function nettoyerOCR(texte) {
  return texte
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(m => m.length > 2);
}

/* ------------------------------------------------------------
   Matching intelligent avec ta base locale winesDB
------------------------------------------------------------ */
function trouverVin(motsOCR) {
  let meilleurVin = null;
  let meilleurScore = 0;

  if (!Array.isArray(winesDB)) {
    console.error("❌ winesDB introuvable ou invalide");
    return null;
  }

  winesDB.forEach(vin => {
    let score = 0;
    motsOCR.forEach(mot => {
      if (vin.motsCles.includes(mot)) score++;
    });

    if (score > meilleurScore) {
      meilleurScore = score;
      meilleurVin = vin;
    }
  });

  return meilleurScore >= 2 ? meilleurVin : null;
}

/* ------------------------------------------------------------
   Affichage du résultat
------------------------------------------------------------ */
function afficherVin(vin) {
  document.getElementById("scanResult").innerHTML = `
    <p><strong>${vin.nom}</strong></p>
    <p>Producteur : ${vin.producteur}</p>
    <p>Région : ${vin.region} (${vin.pays})</p>
    <p>Millésime : ${vin.annee}</p>
  `;
}

function afficherMessage(msg) {
  document.getElementById("scanResult").innerHTML = `<p>${msg}</p>`;
}

/* ------------------------------------------------------------
   OCR réel avec Tesseract.js
------------------------------------------------------------ */
async function faireOCR(imageFile) {
  try {
    const { data } = await Tesseract.recognize(imageFile, "fra+eng", {
      logger: m => console.log(m)
    });
    return data.text;
  } catch (err) {
    console.error("❌ Erreur OCR :", err);
    return "";
  }
}

/* ------------------------------------------------------------
   Pipeline complet
------------------------------------------------------------ */
async function analyserPhoto() {
  const input = document.getElementById("scanInput");
  const status = document.getElementById("scanText");

  if (!input.files || input.files.length === 0) {
    status.textContent = "Sélectionne une photo.";
    return;
  }

  status.textContent = "Analyse en cours...";
  const file = input.files[0];

  try {
    const texteOCR = await faireOCR(file);
    status.textContent = texteOCR || "Aucun texte détecté.";

    const mots = nettoyerOCR(texteOCR);
    const vin = trouverVin(mots);

    if (vin) {
      afficherVin(vin);
    } else {
      afficherMessage("❌ Aucun vin correspondant trouvé.");
    }
  } catch (e) {
    console.error(e);
    status.textContent = "Erreur lors de l'analyse.";
  }
}

/* ------------------------------------------------------------
   Gestion des boutons
------------------------------------------------------------ */
document.getElementById("scanBtn").addEventListener("click", () => {
  document.getElementById("scanInput").click();
});

document.getElementById("scanInput").addEventListener("change", analyserPhoto);
