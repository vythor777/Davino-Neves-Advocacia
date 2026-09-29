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
import { PrazosService } from './prazos.service.js';
import { CreatePrazoDto } from './dto/create-prazo.dto.js';
import { UpdatePrazoDto } from './dto/update-prazo.dto.js';

@Controller('prazos')
export class PrazosController {
  constructor(private readonly prazosService: PrazosService) {}

  @Roles('ADMINISTRADOR', 'ADVOGADO')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: Actor, @Body() createPrazoDto: CreatePrazoDto) {
    return this.prazosService.create(createPrazoDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: Actor) {
    return this.prazosService.findAll(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: Actor, @Param('id', ParseIntPipe) id: number) {
    return this.prazosService.findOne(id, user);
  }

  @Roles('ADMINISTRADOR', 'ADVOGADO')
  @Patch(':id')
  update(
    @CurrentUser() user: Actor,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrazoDto: UpdatePrazoDto,
  ) {
    return this.prazosService.update(id, updatePrazoDto, user);
  }

  @Roles('ADMINISTRADOR')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: Actor, @Param('id', ParseIntPipe) id: number) {
    return this.prazosService.remove(id, user);
  }
}
