/* ============================================================
   shop.js — Mode magasin (vérifier si tu as déjà un vin)
   ============================================================ */

/* ------------------------------------------------------------
   Initialisation de l’écran
------------------------------------------------------------ */
(function initShop() {
  const shopView = document.getElementById("shopView");

  if (!shopView) {
    console.warn("⚠️ Élément #shopView introuvable.");
    return;
  }

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

  const btn = document.getElementById("shopSearchBtn");
  if (btn) btn.addEventListener("click", shopSearch);
})();

/* ------------------------------------------------------------
   Recherche dans la cave
------------------------------------------------------------ */
async function shopSearch() {
  const inputEl = document.getElementById("shopSearchInput");
  const resultDiv = document.getElementById("shopResult");

  if (!inputEl || !resultDiv) {
    console.error("❌ shopSearch : éléments introuvables");
    return;
  }

  const input = inputEl.value.trim();

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
      <p><b>${match.identity?.cuvee || "Sans nom"}</b> (${match.identity?.vintage || "?"})</p>
      <p>${match.identity?.producer || "Producteur inconnu"}</p>

      <button class="btn secondary" onclick="showDetail('${match.id}')">
        Voir la fiche
      </button>
    </div>
  `;
}
