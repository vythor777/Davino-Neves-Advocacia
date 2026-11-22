import { AccessService, type Actor } from '../access/access.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DataJudProcessNotFoundException, DataJudService } from './datajud.service.js';
import { ConsultarProcessoDto } from './dto/consultar-processo.dto.js';

@Controller('datajud')
export class DataJudController {
  constructor(private readonly dataJudService: DataJudService, private readonly access: AccessService) {}

  @Post('consultar')
  @HttpCode(HttpStatus.OK)
  async consultar(@CurrentUser() user: Actor, @Body() dto: ConsultarProcessoDto) {
    await this.access.processNumber(user, dto.numero_processo);
    return this.dataJudService.consultarProcesso(dto);
  }

  @Get(':numeroProcesso')
  async consultarPorParametro(@CurrentUser() user: Actor, @Param('numeroProcesso') numeroProcesso: string) {
    await this.access.processNumber(user, numeroProcesso);
    return this.dataJudService.consultarProcesso({
      numero_processo: numeroProcesso,
    });
  }

  @Get(':numeroProcesso/movimentacoes')
  async movimentacoes(@CurrentUser() user: Actor, @Param('numeroProcesso') numeroProcesso: string) {
    await this.access.processNumber(user, numeroProcesso);
    try {
      const { movimentos } = await this.dataJudService.consultarProcesso({ numero_processo: numeroProcesso });
      return { encontrado: true, movimentos };
    } catch (error) {
      if (error instanceof DataJudProcessNotFoundException) return { encontrado: false, movimentos: [] };
      throw error;
    }
  }
}
