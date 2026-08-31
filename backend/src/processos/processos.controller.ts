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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProcessoDto: CreateProcessoDto) {
    return this.processosService.create(createProcessoDto);
  }

  @Get()
  findAll() {
    return this.processosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.processosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcessoDto: UpdateProcessoDto,
  ) {
    return this.processosService.update(id, updateProcessoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.processosService.remove(id);
  }
}
