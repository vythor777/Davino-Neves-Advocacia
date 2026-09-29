import { AccessProcessoDto } from './dto/access-processo.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { Actor } from '../access/access.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProcessosService } from './processos.service.js';
import { CreateProcessoDto } from './dto/create-processo.dto.js';
import { UpdateProcessoDto } from './dto/update-processo.dto.js';

@Controller('processos')
export class ProcessosController {
  constructor(private readonly processosService: ProcessosService) {}

  @Roles('ADMINISTRADOR', 'ADVOGADO')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: Actor, @Body() createProcessoDto: CreateProcessoDto) {
    return this.processosService.create(createProcessoDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: Actor) {
    return this.processosService.findAll(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: Actor, @Param('id', ParseIntPipe) id: number) {
    return this.processosService.findOne(id, user);
  }

  @Roles('ADMINISTRADOR', 'ADVOGADO')
  @Patch(':id')
  update(
    @CurrentUser() user: Actor,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcessoDto: UpdateProcessoDto,
  ) {
    return this.processosService.update(id, updateProcessoDto, user);
  }

  @Roles('ADMINISTRADOR')
  @Patch(':id/acessos')
  setAccess(@CurrentUser() user: Actor, @Param('id', ParseIntPipe) id: number, @Body() dto: AccessProcessoDto) {
    return this.processosService.setAccess(id, dto, user);
  }

  @Roles('ADMINISTRADOR', 'ADVOGADO')
  @Post(':id/arquivar')
  archive(@CurrentUser() user: Actor, @Param('id', ParseIntPipe) id: number) {
    return this.processosService.archive(id, user);
  }

  @Roles('ADMINISTRADOR')
  @Post(':id/restaurar')
  restore(@CurrentUser() user: Actor, @Param('id', ParseIntPipe) id: number) {
    return this.processosService.restore(id, user);
  }

  @Roles('ADMINISTRADOR')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: Actor, @Param('id', ParseIntPipe) id: number) {
    return this.processosService.remove(id, user);
  }
}
