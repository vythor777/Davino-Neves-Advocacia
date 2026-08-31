import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AnalisarDocumentoDto {
  @IsString({ message: 'O texto do documento deve ser uma string.' })
  @IsNotEmpty({ message: 'O texto do documento é obrigatório.' })
  texto: string;

  @IsString({ message: 'O tipo de documento deve ser uma string.' })
  @IsOptional()
  @MaxLength(100, { message: 'O tipo não pode exceder 100 caracteres.' })
  tipo_documento?: string; // ex: 'Petição Inicial', 'Contestação', 'Sentença', 'Contrato', 'Notificação'

  @IsString({ message: 'As instruções adicionais devem ser um texto.' })
  @IsOptional()
  instrucoes?: string;
}
