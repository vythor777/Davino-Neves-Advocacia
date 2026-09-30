import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExtrairPrazosDto {
  @IsString({ message: 'O texto da publicação/intimação deve ser uma string.' })
  @IsNotEmpty({ message: 'O texto da publicação/intimação é obrigatório.' })
  texto_publicacao: string;

  @IsDateString({}, { message: 'Informe uma data válida em YYYY-MM-DD.' })
  @IsOptional()
  data_publicacao?: string;

  @IsOptional()
  @IsIn(['uteis', 'corridos'])
  tipo_contagem?: 'uteis' | 'corridos';
}
