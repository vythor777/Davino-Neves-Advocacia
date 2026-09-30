import { BadRequestException } from '@nestjs/common';
import { PDFDocument, PDFSignature } from 'pdf-lib';
export const PDF_LIMIT = 5_000_000;
export const OFFICE_STORAGE_LIMIT = 800_000_000;
export async function inspectPdf(bytes: Buffer, limit = PDF_LIMIT) {
  if (!bytes.length || bytes.length > limit) throw new BadRequestException(`O PDF deve ter no máximo ${limit / 1_000_000} MB.`);
  if (!bytes.subarray(0, 1024).includes(Buffer.from('%PDF-'))) throw new BadRequestException('Envie um arquivo PDF válido.');
  try {
    const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
    if (!pdf.getPageCount()) throw new Error('empty');
    const signed = /\/ByteRange\s*\[/.test(bytes.toString('latin1')) || pdf.getForm().getFields().some(field => field instanceof PDFSignature);
    return { pdf, signed };
  } catch { throw new BadRequestException('PDF inválido, protegido por senha ou não compatível.'); }
}
