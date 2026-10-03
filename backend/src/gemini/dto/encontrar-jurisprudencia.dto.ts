import { Transform } from 'class-transformer';
import { MaxLength } from 'class-validator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EncontrarJurisprudenciaDto {
  @IsNotEmpty({ message: 'O tema ou controvérsia jurídica é obrigatório.' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'O tema deve ser uma string.' })
  tema: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  ramo_direito?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  tribunal_alvo?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  tese_pretendida?: string;
}
