// Charger la liste d'achats
async function loadShop() {
  const shopContent = document.getElementById('shopContent');
  if (!shopContent) return;

  try {
    const db = new LocalBase('wineCellar');
    const shopItems = await db.collection('shop').get();

    if (!shopItems || shopItems.length === 0) {
      shopContent.innerHTML = '<p>Aucun article dans votre liste d\'achats.</p>';
      return;
    }

    shopContent.innerHTML = `
      <ul>
        ${shopItems.map(item => `<li>${item.text}</li>`).join('')}
      </ul>
    `;
  } catch (error) {
    console.error("Erreur lors du chargement des achats :", error);
    shopContent.innerHTML = '<p>Erreur lors du chargement de la liste d\'achats.</p>';
  }
}

// Ajouter un article à la liste d'achats
document.addEventListener('DOMContentLoaded', () => {
  const shopForm = document.getElementById('shopForm');
  if (shopForm) {
    shopForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const shopItemText = document.getElementById('shopItemText').value;
      if (shopItemText.trim()) {
        const db = new LocalBase('wineCellar');
        await db.collection('shop').add({ text: shopItemText, date: new Date().toISOString() });
        shopForm.reset();
        loadShop();
      }
    });
  }
});

window.loadShop = loadShop;