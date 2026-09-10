import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResumirDocumentoDto {
  @IsString({ message: 'O texto do documento deve ser uma string.' })
  @IsNotEmpty({ message: 'O texto do documento é obrigatório.' })
  texto: string;

  @IsString()
  @IsOptional()
  tipo_documento?: string;

  @IsOptional()
  @IsString()
  formato_resumo?: 'executivo' | 'cliente_simples' | 'topicos_estrategicos' | string;
}
