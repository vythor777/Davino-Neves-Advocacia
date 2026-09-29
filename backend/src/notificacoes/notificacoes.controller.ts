import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { Actor } from '../access/access.service.js';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificacoesService, ResumoNotificacoes } from './notificacoes.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  async getNotificacoes(@CurrentUser() user: Actor): Promise<ResumoNotificacoes> {
    return this.notificacoesService.getNotificacoes(user);
  }
}
