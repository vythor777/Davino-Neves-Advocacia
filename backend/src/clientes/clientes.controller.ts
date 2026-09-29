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
import { ClientesService } from './clientes.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: Actor, @Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: Actor) {
    return this.clientesService.findAll(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: Actor, @Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: Actor,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto, user);
  }

  @Roles('ADMINISTRADOR')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: Actor, @Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id, user);
  }
}
