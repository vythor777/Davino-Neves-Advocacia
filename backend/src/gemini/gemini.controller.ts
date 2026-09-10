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
import { EncontrarJurisprudenciaDto } from './dto/encontrar-jurisprudencia.dto.js';
import { CriarPecaDto } from './dto/criar-peca.dto.js';
import { AnalisarProcessoIaDto } from './dto/analisar-processo-ia.dto.js';
import { ResumirDocumentoDto } from './dto/resumir-documento.dto.js';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('analisar-processo')
  @HttpCode(HttpStatus.OK)
  analisarProcesso(@Body() dto: AnalisarProcessoIaDto) {
    return this.geminiService.analisarProcessoIa(dto);
  }

  @Post('resumir-documento')
  @HttpCode(HttpStatus.OK)
  resumirDocumento(@Body() dto: ResumirDocumentoDto) {
    return this.geminiService.resumirDocumento(dto);
  }

  @Post('encontrar-jurisprudencia')
  @HttpCode(HttpStatus.OK)
  encontrarJurisprudencia(@Body() dto: EncontrarJurisprudenciaDto) {
    return this.geminiService.encontrarJurisprudencia(dto);
  }

  @Post('criar-peca')
  @HttpCode(HttpStatus.OK)
  criarPeca(@Body() dto: CriarPecaDto) {
    return this.geminiService.criarPeca(dto);
  }

  @Post('identificar-prazos')
  @HttpCode(HttpStatus.OK)
  identificarPrazos(@Body() dto: ExtrairPrazosDto) {
    return this.geminiService.extrairPrazos(dto);
  }

  // Rotas legadas para compatibilidade
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
