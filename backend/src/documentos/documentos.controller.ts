import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { Actor } from '../access/access.service.js';
import { DocumentosService } from './documentos.service.js';

// Upload/download serão implementados com Storage privado em etapa posterior.
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly service: DocumentosService) {}
  @Get()
  list(@CurrentUser() user: Actor, @Query('id_processo', new ParseIntPipe({ optional: true })) id?: number) {
    return this.service.findAll(user, id);
  }
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Actor) {
    return this.service.findOne(id, user);
  }
}
