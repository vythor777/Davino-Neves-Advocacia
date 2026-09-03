import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export enum TipoLancamentoDto {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA',
}

export enum CategoriaLancamentoDto {
  HONORARIO_CONTRATUAL = 'HONORARIO_CONTRATUAL',
  HONORARIO_EXITO = 'HONORARIO_EXITO',
  CONSULTIVO = 'CONSULTIVO',
  CUSTAS_PROCESSUAIS = 'CUSTAS_PROCESSUAIS',
  OPERACIONAL = 'OPERACIONAL',
  IMPOSTOS = 'IMPOSTOS',
  OUTROS = 'OUTROS',
}

export enum StatusLancamentoDto {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  ATRASADO = 'ATRASADO',
  CANCELADO = 'CANCELADO',
}

export class CreateLancamentoDto {
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @MaxLength(255, { message: 'A descrição não pode exceder 255 caracteres.' })
  descricao: string;

  @IsEnum(TipoLancamentoDto, {
    message: 'O tipo deve ser RECEITA ou DESPESA.',
  })
  @IsNotEmpty({ message: 'O tipo do lançamento é obrigatório.' })
  tipo: TipoLancamentoDto;

  @IsEnum(CategoriaLancamentoDto, {
    message: 'Categoria financeira inválida.',
  })
  @IsNotEmpty({ message: 'A categoria do lançamento é obrigatória.' })
  categoria: CategoriaLancamentoDto;

  @IsNumber({}, { message: 'O valor deve ser numérico.' })
  @IsPositive({ message: 'O valor deve ser maior que zero.' })
  @IsNotEmpty({ message: 'O valor é obrigatório.' })
  valor: number;

  @IsDateString({}, { message: 'A data de vencimento deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A data de vencimento é obrigatória.' })
  dataVencimento: string;

  @IsDateString({}, { message: 'A data de pagamento deve ser uma data válida.' })
  @IsOptional()
  dataPagamento?: string;

  @IsEnum(StatusLancamentoDto, {
    message: 'O status deve ser PENDENTE, PAGO, ATRASADO ou CANCELADO.',
  })
  @IsOptional()
  status?: StatusLancamentoDto;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  formaPagamento?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsNumber()
  @IsOptional()
  processoId?: number;

  @IsNumber()
  @IsOptional()
  clienteId?: number;
}
