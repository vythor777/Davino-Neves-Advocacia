import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AnalisarDocumentoDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'O texto do documento deve ser uma string.' })
  @IsNotEmpty({ message: 'O texto do documento é obrigatório.' })
  texto: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'O tipo de documento deve ser uma string.' })
  @IsOptional()
  @MaxLength(100, { message: 'O tipo não pode exceder 100 caracteres.' })
  tipo_documento?: string; // ex: 'Petição Inicial', 'Contestação', 'Sentença', 'Contrato', 'Notificação'

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
  @IsString({ message: 'As instruções adicionais devem ser um texto.' })
  @IsOptional()
  instrucoes?: string;
}
