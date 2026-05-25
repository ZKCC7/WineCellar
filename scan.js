/* ============================================================
   scan.js — Scan IA avec OCR Tesseract.js (CDN)
   ============================================================ */

(function initScan() {
  const scanView = document.getElementById("scanView");

  scanView.innerHTML = `
    <h2>Scan IA</h2>

    <div class="card">
      <p>Importe une photo d’étiquette pour analyser le vin.</p>

      <input type="file" id="scanInput" accept="image/*" />

      <div id="scanPreview" style="margin-top:1rem;"></div>

      <button class="btn" id="scanAnalyzeBtn" style="margin-top:1rem;">
        Analyser l’image
      </button>
    </div>

    <div id="scanResult"></div>
  `;

  document.getElementById("scanInput").addEventListener("change", scanPreviewImage);
  document.getElementById("scanAnalyzeBtn").addEventListener("click", scanAnalyze);
})();

function scanPreviewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("scanPreview");

  if (!file) {
    preview.innerHTML = "";
    return;
  }

  const url = URL.createObjectURL(file);

  preview.innerHTML = `
    <img src="${url}" style="max-width:100%; border-radius:8px;" />
  `;
}

async function scanAnalyze() {
  const resultDiv = document.getElementById("scanResult");
  const fileInput = document.getElementById("scanInput");

  if (!fileInput.files.length) {
    resultDiv.innerHTML = `<div class="card">Merci d’importer une image.</div>`;
    return;
  }

  const file = fileInput.files[0];
  const imageURL = URL.createObjectURL(file);

  resultDiv.innerHTML = `<div class="card">Analyse OCR en cours…</div>`;

  // OCR en FRANÇAIS
  const { data } = await Tesseract.recognize(imageURL, "fra", {
    logger: m => console.log(m)
  });

  const text = data.text.toLowerCase();
  console.log("OCR:", text);

  // Matching simple dans winesDB
  const match = winesDB.find(w =>
    text.includes(w.nom.toLowerCase()) ||
    w.motsCles?.some(k => text.includes(k.toLowerCase()))
  );

  if (!match) {
    resultDiv.innerHTML = `
      <div class="card">
        ❌ Aucun vin correspondant trouvé.<br>
        (Texte détecté : "${text}")
      </div>
    `;
    return;
  }

  resultDiv.innerHTML = `
    <div class="card">
      <h3>✔️ Vin reconnu</h3>
      <p><b>${match.nom}</b> (${match.annee})</p>
      <p>${match.producteur}</p>
    </div>
  `;
}
