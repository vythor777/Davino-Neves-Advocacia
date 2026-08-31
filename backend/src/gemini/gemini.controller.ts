import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GeminiService } from './gemini.service.js';
import { AnalisarDocumentoDto } from './dto/analisar-documento.dto.js';
import { ResumirProcessoDto } from './dto/resumir-processo.dto.js';
import { ExtrairPrazosDto } from './dto/extrair-prazos.dto.js';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('analisar-documento')
  @HttpCode(HttpStatus.OK)
  analisarDocumento(@Body() dto: AnalisarDocumentoDto) {
    return this.geminiService.analisarDocumento(dto);
  }

  @Post('resumir-processo')
  @HttpCode(HttpStatus.OK)
  resumirProcesso(@Body() dto: ResumirProcessoDto) {
    return this.geminiService.resumirProcesso(dto);
  }

  @Post('extrair-prazos')
  @HttpCode(HttpStatus.OK)
  extrairPrazos(@Body() dto: ExtrairPrazosDto) {
    return this.geminiService.extrairPrazos(dto);
  }
}
