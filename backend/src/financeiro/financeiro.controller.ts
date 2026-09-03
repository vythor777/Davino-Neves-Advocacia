import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FinanceiroService } from './financeiro.service.js';
import { CreateLancamentoDto } from './dto/create-lancamento.dto.js';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto.js';
import { FilterLancamentoDto } from './dto/filter-lancamento.dto.js';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post('lancamentos')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLancamentoDto: CreateLancamentoDto) {
    return this.financeiroService.create(createLancamentoDto);
  }

  @Get('lancamentos')
  findAll(@Query() filter: FilterLancamentoDto) {
    return this.financeiroService.findAll(filter);
  }

  @Get('resumo')
  getResumo(@Query('mes') mes?: string, @Query('ano') ano?: string) {
    return this.financeiroService.getResumo(mes, ano);
  }

  @Get('lancamentos/:id')
  findOne(@Param('id') id: string) {
    return this.financeiroService.findOne(id);
  }

  @Patch('lancamentos/:id')
  update(
    @Param('id') id: string,
    @Body() updateLancamentoDto: UpdateLancamentoDto,
  ) {
    return this.financeiroService.update(id, updateLancamentoDto);
  }

  @Delete('lancamentos/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.financeiroService.remove(id);
  }
}
