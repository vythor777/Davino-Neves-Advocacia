import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ConsultarProcessoDto {
  @IsString({ message: 'O número do processo deve ser um texto.' })
  @IsNotEmpty({ message: 'O número do processo é obrigatório.' })
  @MaxLength(50, { message: 'O número do processo não pode exceder 50 caracteres.' })
  numero_processo: string;

  @IsString({ message: 'A sigla do tribunal deve ser um texto (ex: tjsp, tjrj, trf1).' })
  @IsOptional()
  tribunal?: string;
}
