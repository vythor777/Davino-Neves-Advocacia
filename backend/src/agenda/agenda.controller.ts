import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { Actor } from '../access/access.service.js';
import { AgendaService } from './agenda.service.js';
import { CreateAgendaDto } from './dto/create-agenda.dto.js';
import { UpdateAgendaDto } from './dto/update-agenda.dto.js';
@Controller('agenda')
export class AgendaController {
 constructor(private readonly service: AgendaService) {}
 @Get() list(@CurrentUser() user: Actor) { return this.service.findAll(user); }
 @Get(':id') get(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Actor) { return this.service.findOne(id, user); }
 @Roles('ADMINISTRADOR', 'ADVOGADO') @Post()
 create(@Body() dto: CreateAgendaDto, @CurrentUser() user: Actor) { return this.service.create(dto, user); }
 @Roles('ADMINISTRADOR', 'ADVOGADO') @Patch(':id')
 update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAgendaDto, @CurrentUser() user: Actor) { return this.service.update(id, dto, user); }
 @Roles('ADMINISTRADOR', 'ADVOGADO') @Delete(':id')
 remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Actor) { return this.service.remove(id, user); }
}
