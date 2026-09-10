import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnalisarProcessoIaDto {
  @IsOptional()
  @IsString()
  numero_processo?: string;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsNotEmpty({ message: 'Os autos, petição ou síntese do processo são obrigatórios.' })
  @IsString({ message: 'O conteúdo deve ser uma string.' })
  conteudo_processual: string;

  @IsOptional()
  @IsString()
  polo_cliente?: 'Autor' | 'Réu' | 'Terceiro Interessado' | string;

  @IsOptional()
  @IsString()
  foco_estrategico?: string;
}
