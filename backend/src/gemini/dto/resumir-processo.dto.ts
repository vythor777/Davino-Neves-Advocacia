import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResumirProcessoDto {
  @IsString({ message: 'O título ou identificação do processo deve ser um texto.' })
  @IsOptional()
  titulo?: string;

  @IsString({ message: 'O número do processo deve ser um texto.' })
  @IsOptional()
  numero_processo?: string;

  @IsArray({ message: 'A lista de movimentações deve ser um array.' })
  @IsNotEmpty({ message: 'As movimentações ou histórico são obrigatórios.' })
  movimentacoes: Array<string | Record<string, any>>;

  @IsString({ message: 'O público-alvo do resumo deve ser um texto (ex: advogado, cliente).' })
  @IsOptional()
  publico_alvo?: 'advogado' | 'cliente';
}
