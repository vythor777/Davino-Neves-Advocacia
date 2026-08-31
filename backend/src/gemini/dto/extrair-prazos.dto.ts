import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExtrairPrazosDto {
  @IsString({ message: 'O texto da publicação/intimação deve ser uma string.' })
  @IsNotEmpty({ message: 'O texto da publicação/intimação é obrigatório.' })
  texto_publicacao: string;

  @IsString({ message: 'A data da publicação (formato YYYY-MM-DD) é opcional.' })
  @IsOptional()
  data_publicacao?: string;
}
