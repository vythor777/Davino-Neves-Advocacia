import { jsPDF, GState } from 'jspdf';

/** Institutional origin, not a certified digital signature. No HTML from the model is executed. */
export function createInstitutionalPdf(title: string, content: string, now = new Date(), logo?: string) {
  const doc = new jsPDF({ format: 'a4', compress: true });
  const clean = (text: string) => text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[–—]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  const issued = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const decorate = () => {
    if (logo) {
      doc.saveGraphicsState();
      doc.setGState(new GState({ opacity: 0.06 }));
      doc.addImage(logo, 'PNG', 40, 112, 130, 65.58, 'davino-logo', 'FAST');
      doc.restoreGraphicsState();
      doc.addImage(logo, 'PNG', 18, 9, 42, 21.19, 'davino-logo', 'FAST');
    }
    doc.setDrawColor(183, 154, 97);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(23, 37, 54);
    doc.text('DAVINO NEVES ADVOCACIA', 68, 19);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80);
    doc.text(`Assistente de IA | Emitido em ${issued}`, 68, 26);
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
  const logo = await loadInstitutionalLogo();
  createInstitutionalPdf(title, content, new Date(), logo).save('Davino-Neves-Assistente-IA.pdf');
}

let logoPromise: Promise<string> | undefined;
function loadInstitutionalLogo(): Promise<string> {
  if (!logoPromise) {
    logoPromise = new Promise<string>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Não foi possível preparar a logo do escritório.');
          context.drawImage(image, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) { reject(error); }
      };
      image.onerror = () => reject(new Error('Não foi possível carregar a logo. Tente gerar o PDF novamente.'));
      image.src = '/brand/davino-neves-logo.png';
    }).catch(error => { logoPromise = undefined; throw error; });
  }
  return logoPromise;
}
