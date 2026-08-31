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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPrazoDto: CreatePrazoDto) {
    return this.prazosService.create(createPrazoDto);
  }

  @Get()
  findAll() {
    return this.prazosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prazosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrazoDto: UpdatePrazoDto,
  ) {
    return this.prazosService.update(id, updatePrazoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prazosService.remove(id);
  }
}
