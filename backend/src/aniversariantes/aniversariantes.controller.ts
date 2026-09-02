import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AniversariantesService } from './aniversariantes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('aniversariantes')
@UseGuards(JwtAuthGuard)
export class AniversariantesController {
  constructor(private readonly aniversariantesService: AniversariantesService) {}

  @Get()
  async getAniversariantesDoMes(@Query('mes') mesParam?: string) {
    const mes = mesParam ? parseInt(mesParam, 10) : undefined;
    return this.aniversariantesService.getAniversariantesDoMes(mes);
  }
}
