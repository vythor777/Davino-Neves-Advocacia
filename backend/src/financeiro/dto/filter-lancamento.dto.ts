import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  CategoriaLancamentoDto,
  StatusLancamentoDto,
  TipoLancamentoDto,
} from './create-lancamento.dto.js';

export class FilterLancamentoDto {
  @IsOptional()
  @IsString()
  mes?: string; // Formato YYYY-MM ou número 1-12

  @IsOptional()
  @IsString()
  ano?: string; // Formato YYYY

  @IsOptional()
  @IsEnum(TipoLancamentoDto)
  tipo?: TipoLancamentoDto;

  @IsOptional()
  @IsEnum(CategoriaLancamentoDto)
  categoria?: CategoriaLancamentoDto;

  @IsOptional()
  @IsEnum(StatusLancamentoDto)
  status?: StatusLancamentoDto;

  @IsOptional()
  @IsString()
  q?: string; // Busca textual na descrição, cliente ou processo
}
