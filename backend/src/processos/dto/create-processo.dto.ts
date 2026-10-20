import { IsCnj } from '../../common/validation/identifier.decorators.js';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export const PROCESS_CATEGORIES = ['Cível', 'Penal', 'Trabalhista', 'Previdenciário', 'Família', 'Sucessões', 'Consumidor', 'Tributário', 'Administrativo', 'Empresarial', 'Imobiliário', 'Ambiental', 'Eleitoral', 'Outros'] as const;

export class CreateProcessoDto {
  @IsString({ message: 'O número do processo deve ser um texto.' })
  @IsNotEmpty({ message: 'O número do processo é obrigatório.' })
  @MaxLength(50, { message: 'O número do processo não pode exceder 50 caracteres.' })
  @IsCnj({ message: 'Número CNJ inválido. Confira o formato e os dígitos verificadores.' })
  numero_processo: string;

  @IsString({ message: 'O título deve ser um texto.' })
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @MaxLength(100, { message: 'O título não pode exceder 100 caracteres.' })
  titulo: string;

  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  descricao: string;

  @IsDateString({}, { message: 'A data de abertura deve ser uma data válida (formato ISO 8601: YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'A data de abertura é obrigatória.' })
  data_abertura: string;

  @IsString({ message: 'O status deve ser um texto.' })
  @IsNotEmpty({ message: 'O status é obrigatório.' })
  @MaxLength(50, { message: 'O status não pode exceder 50 caracteres.' })
  status: string;

  @IsInt({ message: 'O ID do cliente deve ser um número inteiro.' })
  @IsPositive({ message: 'O ID do cliente deve ser positivo.' })
  @IsNotEmpty({ message: 'O ID do cliente é obrigatório.' })
  id_cliente: number;

  @IsOptional()
  @IsString()
  @IsIn(PROCESS_CATEGORIES, { message: 'Selecione uma categoria de processo válida.' })
  categoria?: string | null;

  @IsOptional()
  @IsString({ message: 'A subcategoria deve ser um texto.' })
  @MaxLength(100, { message: 'A subcategoria não pode exceder 100 caracteres.' })
  subcategoria?: string | null;
}
