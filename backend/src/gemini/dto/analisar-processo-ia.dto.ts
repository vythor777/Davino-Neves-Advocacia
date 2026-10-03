import { Transform } from 'class-transformer';
import { MaxLength } from 'class-validator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnalisarProcessoIaDto {
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  numero_processo?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  titulo?: string;

  @IsNotEmpty({ message: 'Os autos, petição ou síntese do processo são obrigatórios.' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'O conteúdo deve ser uma string.' })
  conteudo_processual: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  polo_cliente?: 'Autor' | 'Réu' | 'Terceiro Interessado' | string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  foco_estrategico?: string;
}
