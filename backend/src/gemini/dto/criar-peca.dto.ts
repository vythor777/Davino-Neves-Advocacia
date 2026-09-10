import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CriarPecaDto {
  @IsNotEmpty({ message: 'O tipo de peça jurídica é obrigatório.' })
  @IsString({ message: 'O tipo da peça deve ser uma string.' })
  tipo_peca: string;

  @IsNotEmpty({ message: 'Os fatos e contexto do caso são obrigatórios.' })
  @IsString({ message: 'Os fatos devem ser uma string.' })
  fatos_contexto: string;

  @IsOptional()
  @IsString()
  polos_partes?: string;

  @IsOptional()
  @IsString()
  pedidos_especificos?: string;

  @IsOptional()
  @IsString()
  jurisprudencia_referencia?: string;

  @IsOptional()
  @IsString()
  tribunal_foro?: string;
}
