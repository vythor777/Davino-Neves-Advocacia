import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePrazoDto {
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @MaxLength(255, { message: 'A descrição não pode exceder 255 caracteres.' })
  descricao: string;

  @IsDateString(
    {},
    {
      message:
        'A data de vencimento deve ser uma data válida (formato ISO 8601: YYYY-MM-DD).',
    },
  )
  @IsNotEmpty({ message: 'A data de vencimento é obrigatória.' })
  data_vencimento: string;

  @IsString({ message: 'O status deve ser um texto.' })
  @IsNotEmpty({ message: 'O status é obrigatório.' })
  @MaxLength(50, { message: 'O status não pode exceder 50 caracteres.' })
  status: string;

  @IsInt({ message: 'O ID do processo deve ser um número inteiro.' })
  @IsPositive({ message: 'O ID do processo deve ser positivo.' })
  @IsNotEmpty({ message: 'O ID do processo é obrigatório.' })
  id_processo: number;
}
