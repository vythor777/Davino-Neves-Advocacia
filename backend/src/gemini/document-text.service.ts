import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export const MAX_AI_FILE_BYTES = 5_000_000;
export const MAX_AI_TEXT_LENGTH = 120_000;
@Injectable()
export class DocumentTextService {
  async extract(file?: { originalname: string; buffer: Buffer }) {
    if (!file?.buffer.length) throw new BadRequestException('Selecione um arquivo com conteúdo.');
    if (file.buffer.length > MAX_AI_FILE_BYTES) throw new BadRequestException('O arquivo deve ter até 5 MB.');
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    let text: string;
    try {
      if (extension === 'pdf') {
        if (!file.buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('invalid PDF');
        const parser = new PDFParse({ data: file.buffer });
        try {
          if ((await parser.getInfo()).total > 100) throw new BadRequestException('Use um PDF de até 100 páginas ou divida o documento.');
          text = (await parser.getText({ pageJoiner: '\n' })).text;
        } finally { await parser.destroy(); }
      } else if (extension === 'docx') {
        if (!file.buffer.subarray(0, 2).equals(Buffer.from('PK'))) throw new Error('invalid DOCX');
        text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
      } else if (['txt', 'md', 'text'].includes(extension || '')) {
        text = new TextDecoder('utf-8', { fatal: true }).decode(file.buffer);
        if ([...text].some(character => { const code = character.charCodeAt(0); return code < 9 || (code > 13 && code < 32); })) throw new Error('binary text');
      } else {
        throw new BadRequestException('Formato não suportado. Use PDF, Word (.docx) ou TXT. Para .doc, salve como .docx no Word.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Não foi possível ler o arquivo. Confira se está íntegro, sem senha e no formato indicado. Para TXT, use UTF-8.');
    }
    text = text.trim();
    if (!text) throw new BadRequestException('Não foi encontrado texto legível. Se o PDF for digitalizado ou contiver apenas imagens, faça reconhecimento de texto (OCR) antes de enviar.');
    if (text.length > MAX_AI_TEXT_LENGTH) throw new BadRequestException('O texto excede 120 mil caracteres. Divida o documento antes de analisar; nenhum trecho foi descartado.');
    return { texto: text, nome: file.originalname, caracteres: text.length };
  }
}
