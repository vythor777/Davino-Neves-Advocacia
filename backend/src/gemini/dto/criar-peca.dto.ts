import { Transform } from 'class-transformer';
import { MaxLength } from 'class-validator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CriarPecaDto {
  @IsNotEmpty({ message: 'O tipo de peça jurídica é obrigatório.' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'O tipo da peça deve ser uma string.' })
  tipo_peca: string;

  @IsNotEmpty({ message: 'Os fatos e contexto do caso são obrigatórios.' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'Os fatos devem ser uma string.' })
  fatos_contexto: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  polos_partes?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  pedidos_especificos?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  jurisprudencia_referencia?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString()
  tribunal_foro?: string;
}
