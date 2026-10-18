import { jsPDF, GState } from 'jspdf';

/** Institutional origin, not a certified digital signature. No HTML from the model is executed. */
export function formatPdfDates(text: string) {
  return text.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (date, year, month, day) => {
    const parsed = new Date(`${date}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
      ? `${day}/${month}/${year}` : date;
  });
}

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
    doc.text(`Emitido em ${issued}`, 68, 26);
    doc.line(18, 32, 192, 32);
    doc.setFontSize(8);
    doc.text('Identificação institucional: Davino Neves Advocacia', 18, 283);
    doc.setFontSize(11); doc.setTextColor(35);
  };
  decorate();
  let y = 41;
  doc.setFont('helvetica', 'bold');
  for (const line of doc.splitTextToSize(clean(title), 174) as string[]) { doc.text(line, 18, y); y += 6; }
  y += 4; doc.setFont('helvetica', 'normal');
  // Render Markdown as PDF text operations; never execute model-generated HTML.
  const ensureSpace = (height: number) => {
    if (y + height > 272) { doc.addPage(); decorate(); y = 41; }
  };
  const renderLine = (text: string, size = 11, bold = false, indent = 0, prefix = '') => {
    doc.setFontSize(size);
    const lineHeight = size * 0.46;
    let x = 18 + indent;
    ensureSpace(lineHeight);
    if (prefix) { doc.setFont('helvetica', 'normal'); doc.text(prefix, 18, y); }
    // Keep whitespace and wrap styled runs using the width of their actual font.
    const runs = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g);
    for (const run of runs) {
      const strong = /^(\*\*|__)/.test(run);
      const emphasis = !strong && /^(\*|_)/.test(run);
      const code = run.startsWith('`') && run.endsWith('`');
      const value = strong ? run.slice(2, -2) : emphasis || code ? run.slice(1, -1) : run;
      doc.setFont(code ? 'courier' : 'helvetica', bold || strong ? 'bold' : emphasis ? 'italic' : 'normal');
      for (const token of value.split(/(\s+)/)) {
        if (!token) continue;
        const width = doc.getTextWidth(token);
        if (x + width > 192 && x > 18 + indent) {
          y += lineHeight; ensureSpace(lineHeight);
          doc.setFontSize(size);
          doc.setFont(code ? 'courier' : 'helvetica', bold || strong ? 'bold' : emphasis ? 'italic' : 'normal');
          x = 18 + indent;
        }
        if (/^\s+$/.test(token) && x === 18 + indent) continue;
        // Split unusually long URLs/words instead of drawing past the margin.
        for (const part of doc.splitTextToSize(token, 174 - indent) as string[]) {
          if (x + doc.getTextWidth(part) > 192) { y += lineHeight; ensureSpace(lineHeight); doc.setFontSize(size); doc.setFont(code ? 'courier' : 'helvetica', bold || strong ? 'bold' : emphasis ? 'italic' : 'normal'); x = 18 + indent; }
          doc.text(part, x, y); x += doc.getTextWidth(part);
        }
      }
    }
    y += lineHeight + 2;
  };
  let fenced = false;
  for (const paragraph of clean(formatPdfDates(content)).replace(/\r\n?/g, '\n').split('\n')) {
    if (/^\s*```/.test(paragraph)) { fenced = !fenced; continue; }
    if (!paragraph.trim()) { y += 3; continue; }
    if (!fenced && /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(paragraph)) { y += 3; continue; }
    const heading = !fenced && paragraph.match(/^\s{0,3}(#{1,6})\s+(.+?)(?:\s+#+)?$/);
    const list = !fenced && paragraph.match(/^\s*(?:[-+*]|(\d+)[.)])\s+(.+)$/);
    const text = paragraph.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
    if (heading) { ensureSpace(18); y += 2; renderLine(heading[2], heading[1].length === 1 ? 15 : 12, true); }
    else if (list) renderLine(list[2], 11, false, 7, list[1] ? `${list[1]}.` : '•');
    else renderLine(text.replace(/^>\s?/, ''), 11);
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
