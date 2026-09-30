import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { inspectPdf, PDF_LIMIT } from './pdf-validation.js';
describe('document uploads', () => {
  it('rejects a non PDF and an oversized PDF', async () => {
    await expect(inspectPdf(Buffer.from('not a pdf'))).rejects.toThrow();
    await expect(inspectPdf(Buffer.alloc(PDF_LIMIT + 1))).rejects.toThrow();
  });
  it('accepts an intact PDF and preserves the original bytes', async () => {
    const pdf = await PDFDocument.create(); pdf.addPage();
    const bytes = Buffer.from(await pdf.save()); const original = Buffer.from(bytes);
    const result = await inspectPdf(bytes);
    expect(result.pdf.getPageCount()).toBe(1); expect(result.signed).toBe(false); expect(bytes.equals(original)).toBe(true);
  });
  it('detects a signature marker for compression refusal', async () => {
    const pdf = await PDFDocument.create(); pdf.addPage();
    const bytes = Buffer.concat([Buffer.from(await pdf.save()), Buffer.from('\n% /ByteRange [0 1 2 3]\n')]);
    expect((await inspectPdf(bytes)).signed).toBe(true);
  });
});
