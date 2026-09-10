import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EncontrarJurisprudenciaDto {
  @IsNotEmpty({ message: 'O tema ou controvérsia jurídica é obrigatório.' })
  @IsString({ message: 'O tema deve ser uma string.' })
  tema: string;

  @IsOptional()
  @IsString()
  ramo_direito?: string;

  @IsOptional()
  @IsString()
  tribunal_alvo?: string;

  @IsOptional()
  @IsString()
  tese_pretendida?: string;
}
