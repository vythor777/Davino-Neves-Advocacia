import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DataJudService } from './datajud.service.js';
import { ConsultarProcessoDto } from './dto/consultar-processo.dto.js';

@Controller('datajud')
export class DataJudController {
  constructor(private readonly dataJudService: DataJudService) {}

  @Post('consultar')
  @HttpCode(HttpStatus.OK)
  consultar(@Body() dto: ConsultarProcessoDto) {
    return this.dataJudService.consultarProcesso(dto);
  }

  @Get(':numeroProcesso')
  consultarPorParametro(@Param('numeroProcesso') numeroProcesso: string) {
    return this.dataJudService.consultarProcesso({
      numero_processo: numeroProcesso,
    });
  }
}
