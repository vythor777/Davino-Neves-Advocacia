import { jsPDF } from 'jspdf';

/** Institutional origin, not a certified digital signature. No HTML from the model is executed. */
export function createInstitutionalPdf(title: string, content: string, now = new Date()) {
  const doc = new jsPDF({ format: 'a4', compress: true });
  const clean = (text: string) => text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[–—]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  const issued = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const decorate = () => {
    doc.setTextColor(238, 241, 246);
    doc.setFontSize(38);
    doc.text('DAVINO NEVES', 105, 156, { align: 'center', angle: 30 });
    doc.setDrawColor(0, 71, 171);
    // Balance symbol used by the application's visual identity.
    doc.setLineWidth(0.5);
    doc.line(23, 14, 23, 27); doc.line(17, 18, 29, 18); doc.line(19, 27, 27, 27);
    for (const x of [17, 29]) { doc.line(x, 18, x - 3, 23); doc.line(x, 18, x + 3, 23); doc.line(x - 3, 23, x + 3, 23); }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(0, 71, 171);
    doc.text('DAVINO NEVES ADVOCACIA', 35, 20);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80);
    doc.text(`Assistente de IA | Emitido em ${issued}`, 35, 26);
    doc.line(18, 32, 192, 32);
    doc.setFontSize(8); doc.text('Elaborado com apoio de IA. Sujeito à revisão do advogado.', 18, 278);
    doc.text('Identificação institucional: Davino Neves Advocacia', 18, 283);
    doc.setFontSize(11); doc.setTextColor(35);
  };
  decorate();
  let y = 41;
  doc.setFont('helvetica', 'bold');
  for (const line of doc.splitTextToSize(clean(title), 174) as string[]) { doc.text(line, 18, y); y += 6; }
  y += 4; doc.setFont('helvetica', 'normal');
  for (const paragraph of clean(content).split('\n')) {
    for (const line of doc.splitTextToSize(paragraph || ' ', 174) as string[]) {
      if (y > 267) { doc.addPage(); decorate(); y = 41; }
      doc.text(line, 18, y); y += 5;
    }
    y += 1;
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) { doc.setPage(page); doc.setFontSize(8); doc.setTextColor(80); doc.text(`${page} / ${pages}`, 192, 283, { align: 'right' }); }
  return doc;
}

export async function downloadInstitutionalPdf(title: string, content: string) {
  createInstitutionalPdf(title, content).save('Davino-Neves-Assistente-IA.pdf');
}
