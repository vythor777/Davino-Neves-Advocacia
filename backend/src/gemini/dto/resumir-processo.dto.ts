import { Transform } from 'class-transformer';
import { MaxLength } from 'class-validator';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResumirProcessoDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'O título ou identificação do processo deve ser um texto.' })
  @IsOptional()
  titulo?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'O número do processo deve ser um texto.' })
  @IsOptional()
  numero_processo?: string;

  @IsArray({ message: 'A lista de movimentações deve ser um array.' })
  @IsNotEmpty({ message: 'As movimentações ou histórico são obrigatórios.' })
  movimentacoes: Array<string | Record<string, any>>;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'O público-alvo do resumo deve ser um texto (ex: advogado, cliente).' })
  @IsOptional()
  publico_alvo?: 'advogado' | 'cliente';
}
