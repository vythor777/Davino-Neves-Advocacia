import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrazosService } from './prazos.service.js';
import { CreatePrazoDto } from './dto/create-prazo.dto.js';
import { UpdatePrazoDto } from './dto/update-prazo.dto.js';

@Controller('prazos')
export class PrazosController {
  constructor(private readonly prazosService: PrazosService) {}

  @Post()
  create(@Body() createPrazoDto: CreatePrazoDto) {
    return this.prazosService.create(createPrazoDto);
  }

  @Get()
  findAll() {
    return this.prazosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prazosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrazoDto: UpdatePrazoDto) {
    return this.prazosService.update(+id, updatePrazoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prazosService.remove(+id);
  }
}
