/* ============================================================
   pdf.js — Export PDF (fiche + cave + stats)
   ============================================================ */

const { jsPDF } = window.jspdf;

/* ------------------------------------------------------------
   Export d’une fiche vin
------------------------------------------------------------ */
function exportWinePDF(wine) {
  if (!wine) {
    console.error("❌ exportWinePDF : vin manquant");
    return;
  }

  const doc = new jsPDF();
  let y = 20;

  // Titre
  doc.setFontSize(18);
  doc.text(wine.identity?.cuvee || "Vin sans nom", 10, y);
  y += 15;

  // Infos principales
  doc.setFontSize(12);
  doc.text(`Millésime : ${wine.identity?.vintage || "?"}`, 10, y); y += 10;
  doc.text(`Producteur : ${wine.identity?.producer || "Inconnu"}`, 10, y); y += 10;
  doc.text(`Région : ${wine.identity?.region || "?"}`, 10, y); y += 10;

  const grapes = wine.identity?.grapes?.length
    ? wine.identity.grapes.join(", ")
    : "Non renseigné";

  doc.text(`Cépages : ${grapes}`, 10, y);
  y += 15;

  // Description
  doc.setFontSize(14);
  doc.text("Description :", 10, y);
  y += 10;

  doc.setFontSize(12);
  const description = wine.tastingProfile?.description || "Aucune description.";
  const lines = doc.splitTextToSize(description, 180);
  doc.text(lines, 10, y);

  doc.save(`${wine.identity?.cuvee || "vin"}.pdf`);
}

/* ------------------------------------------------------------
   Export de toute la cave
------------------------------------------------------------ */
async function exportCellarPDF() {
  const wines = await dbGetAllWines();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Ma cave à vin", 10, 20);

  if (!wines || wines.length === 0) {
    doc.setFontSize(12);
    doc.text("Aucune bouteille dans la cave.", 10, 40);
    doc.save("ma_cave.pdf");
    return;
  }

  let y = 40;

  wines.forEach(w => {
    const cuvee = w.identity?.cuvee || "Sans nom";
    const vintage = w.identity?.vintage || "?";

    doc.setFontSize(12);
    doc.text(`${cuvee} (${vintage})`, 10, y);
    y += 10;

    // Saut de page automatique
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("ma_cave.pdf");
}
