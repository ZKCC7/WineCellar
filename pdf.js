/* ============================================================
   pdf.js — Export PDF (fiche + cave + stats)
   ============================================================ */

const { jsPDF } = window.jspdf;

/* ------------------------------------------------------------
   Export d’une fiche vin
------------------------------------------------------------ */
function exportWinePDF(wine) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(wine.identity.cuvee, 10, 20);

  doc.setFontSize(12);
  doc.text(`Millésime : ${wine.identity.vintage}`, 10, 35);
  doc.text(`Producteur : ${wine.identity.producer}`, 10, 45);
  doc.text(`Région : ${wine.identity.region}`, 10, 55);
  doc.text(`Cépages : ${wine.identity.grapes.join(", ")}`, 10, 65);

  doc.text("Description :", 10, 85);
  doc.text(wine.tastingProfile.description, 10, 95);

  doc.save(`${wine.identity.cuvee}.pdf`);
}

/* ------------------------------------------------------------
   Export de toute la cave
------------------------------------------------------------ */
async function exportCellarPDF() {
  const wines = await dbGetAllWines();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Ma cave à vin", 10, 20);

  let y = 40;

  wines.forEach(w => {
    doc.setFontSize(12);
    doc.text(`${w.identity.cuvee} (${w.identity.vintage})`, 10, y);
    y += 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("ma_cave.pdf");
}