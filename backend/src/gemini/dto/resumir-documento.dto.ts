import { Transform } from 'class-transformer';
import { MaxLength } from 'class-validator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResumirDocumentoDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'O texto do documento deve ser uma string.' })
  @IsNotEmpty({ message: 'O texto do documento é obrigatório.' })
  texto: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  @IsOptional()
  tipo_documento?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  formato_resumo?: 'executivo' | 'cliente_simples' | 'topicos_estrategicos' | string;
}
