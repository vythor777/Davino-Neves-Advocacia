import { Transform } from 'class-transformer';
import { MaxLength } from 'class-validator';
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExtrairPrazosDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(120000, { message: 'O campo excede 120 mil caracteres. Divida o documento.' })
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
