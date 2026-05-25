// Variable globale pour l'image scannée
let scannedImageFile = null;

// Fonction pour démarrer le scan
function startScan() {
  const scanInput = document.getElementById('scanInput');
  if (scanInput) {
    scanInput.click();
  }
}

// Gestion du scan
document.addEventListener('DOMContentLoaded', () => {
  const scanInput = document.getElementById('scanInput');
  if (scanInput) {
    scanInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        scannedImageFile = e.target.files[0];
        const scanResult = document.getElementById('scanResult');
        if (scanResult) {
          scanResult.innerHTML = '<p>Image chargée. Analyse en cours...</p>';
        }

        try {
          // Charger les langues nécessaires pour Tesseract
          await Tesseract.loadLanguage('eng');
          await Tesseract.loadLanguage('fra');

          // Reconnaître le texte
          const { data: { text } } = await Tesseract.recognize(
            scannedImageFile,
            'eng+fra'
          );

          console.log("Texte extrait :", text);
          if (scanResult) {
            scanResult.innerHTML = `<p>Texte extrait : ${text.substring(0, 200)}...</p>`;
          }

          // Stocker le texte pour l'IA
          localStorage.setItem('lastScannedText', text);
          window.scannedImageFile = scannedImageFile;

        } catch (error) {
          console.error("Erreur lors du scan :", error);
          if (scanResult) {
            scanResult.innerHTML = '<p style="color:red;">Erreur lors du scan. Réessayez.</p>';
          }
        }
      }
    });
  }
});

// Exposition globale
window.scannedImageFile = scannedImageFile;
window.startScan = startScan;