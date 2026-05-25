/* ============================================================
   voice.js — Recherche vocale
   ============================================================ */

function startVoiceSearch() {
  const resultDiv = document.getElementById("wineList");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("La recherche vocale n’est pas supportée sur ce navigateur.");
    return;
  }

  const rec = new SpeechRecognition();
  rec.lang = "fr-FR";

  rec.onresult = async event => {
    const text = event.results[0][0].transcript.toLowerCase();

    const wines = await dbSearch(text);

    if (!wines.length) {
      resultDiv.innerHTML = `<div class="card">Aucun résultat pour "${text}".</div>`;
      return;
    }

    resultDiv.innerHTML = wines
      .map(
        w => `
        <div class="card">
          <h3>${w.identity.cuvee} (${w.identity.vintage})</h3>
          <p>${w.identity.producer}</p>
          <span class="link" onclick="showDetail('${w.id}')">Voir détail</span>
        </div>
      `
      )
      .join("");
  };

  rec.start();
}
