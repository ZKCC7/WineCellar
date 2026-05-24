/* ============================================================
   shop.js — Mode magasin (vérifier si tu as déjà un vin)
   ============================================================ */

/* ------------------------------------------------------------
   Initialisation de l’écran
------------------------------------------------------------ */
(function initShop() {
  const shopView = document.getElementById("shopView");

  shopView.innerHTML = `
    <h2>Mode magasin</h2>

    <div class="card">
      <p>Entre un nom de vin pour vérifier si tu l’as déjà dans ta cave.</p>

      <label>Nom du vin
        <input id="shopSearchInput" placeholder="Ex : Don Giovanni, Sangiovese..." />
      </label>

      <button class="btn" id="shopSearchBtn">Rechercher</button>
    </div>

    <div id="shopResult"></div>
  `;

  document.getElementById("shopSearchBtn").addEventListener("click", shopSearch);
})();

/* ------------------------------------------------------------
   Recherche dans la cave
------------------------------------------------------------ */
async function shopSearch() {
  const input = document.getElementById("shopSearchInput").value.trim();
  const resultDiv = document.getElementById("shopResult");

  if (!input) {
    resultDiv.innerHTML = `
      <div class="card">
        Merci d’entrer un nom de vin.
      </div>
    `;
    return;
  }

  const match = await dbFindSimilarWine(input);

  if (!match) {
    resultDiv.innerHTML = `
      <div class="card">
        ❌ Tu n’as pas ce vin dans ta cave.
      </div>
    `;
    return;
  }

  resultDiv.innerHTML = `
    <div class="card">
      <h3>✔️ Tu as déjà ce vin</h3>
      <p><b>${match.identity.cuvee}</b> (${match.identity.vintage})</p>
      <p>${match.identity.producer}</p>

      <button class="btn secondary" onclick="showDetail('${match.id}')">
        Voir la fiche
      </button>
    </div>
  `;
}