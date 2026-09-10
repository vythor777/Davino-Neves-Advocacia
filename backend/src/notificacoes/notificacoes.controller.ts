import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificacoesService, ResumoNotificacoes } from './notificacoes.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  async getNotificacoes(): Promise<ResumoNotificacoes> {
    return this.notificacoesService.getNotificacoes();
  }
}
