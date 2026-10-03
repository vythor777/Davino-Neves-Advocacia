import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { DocumentTextService } from './document-text.service.js';
const service = new DocumentTextService();
const file = (originalname: string, buffer: Buffer) => ({originalname,buffer});
describe('extração de arquivos para IA', () => {
  it('preserva texto e acentos UTF-8', async () => {
    expect((await service.extract(file('Teste.TXT',Buffer.from('Decisão: restituição de R$ 500,00.')))).texto).toContain('Decisão');
  });
  it('extrai PDF com texto e orienta OCR para página sem texto', async () => {
    const pdf=await PDFDocument.create();const page=pdf.addPage();
    page.drawText('Caso ficticio: valor de R$ 500,00.', {font:await pdf.embedFont(StandardFonts.Helvetica)});
    expect((await service.extract(file('teste.pdf',Buffer.from(await pdf.save())))).texto).toContain('R$ 500,00');
    const blank=await PDFDocument.create();blank.addPage();
    await expect(service.extract(file('scan.pdf',Buffer.from(await blank.save())))).rejects.toThrow('OCR');
  });
  it('extrai parágrafos de Word DOCX sem converter HTML', async () => {
    const zip=new JSZip();
    zip.file('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
    zip.file('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Documento fictício &amp; prova.</w:t></w:r></w:p></w:body></w:document>');
    expect((await service.extract(file('teste.docx',await zip.generateAsync({type:'nodebuffer'})))).texto).toBe('Documento fictício & prova.');
  });
  it('rejeita ausente, extensão falsa, binário, corrompido, formato legado e excessos', async () => {
    await expect(service.extract()).rejects.toThrow('Selecione');
    await expect(service.extract(file('x.pdf',Buffer.from('not PDF')))).rejects.toThrow('íntegro');
    await expect(service.extract(file('x.docx',Buffer.from('PK broken')))).rejects.toThrow('íntegro');
    await expect(service.extract(file('x.txt',Buffer.from([0,1,2])))).rejects.toThrow('íntegro');
    await expect(service.extract(file('x.doc',Buffer.from('legado')))).rejects.toThrow('.docx');
    await expect(service.extract(file('x.txt',Buffer.alloc(5_000_001)))).rejects.toThrow('5 MB');
    await expect(service.extract(file('x.txt',Buffer.from('a'.repeat(120_001))))).rejects.toThrow('nenhum trecho foi descartado');
  });
});
