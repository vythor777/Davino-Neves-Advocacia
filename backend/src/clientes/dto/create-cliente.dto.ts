import { Transform } from 'class-transformer';
import { PROCESS_CATEGORIES } from '../../processos/dto/create-processo.dto.js';
import { IsCpfCnpj } from '../../common/validation/identifier.decorators.js';
import {
  IsEmail,
  IsInt,
  Min,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  ValidateIf,
} from 'class-validator';

export class CreateClienteDto {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MaxLength(100, { message: 'O nome não pode exceder 100 caracteres.' })
  nome: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() || null : value)
  @IsOptional()
  @IsString({ message: 'O CPF/CNPJ deve ser um texto.' })
  @MaxLength(20, { message: 'O CPF/CNPJ não pode exceder 20 caracteres.' })
  @IsCpfCnpj({ message: 'CPF/CNPJ inválido. Confira os dígitos verificadores.' })
  cpf_cnpj?: string | null;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() || null : value)
  @IsOptional()
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @MaxLength(100, { message: 'O e-mail não pode exceder 100 caracteres.' })
  email?: string | null;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() || null : value)
  @IsOptional()
  @IsString({ message: 'O telefone deve ser um texto.' })
  @MaxLength(20, { message: 'O telefone não pode exceder 20 caracteres.' })
  telefone?: string | null;

  @IsString({ message: 'O endereço deve ser um texto.' })
  @IsNotEmpty({ message: 'O endereço é obrigatório.' })
  endereco: string;

  @IsDateString({}, { message: 'Data de nascimento deve estar em formato válido (AAAA-MM-DD).' })
  @IsOptional()
  data_nascimento?: string;

  @IsOptional()
  @IsString({ message: 'Tratamento deve ser um texto.' })
  @MaxLength(50, { message: 'Tratamento não pode exceder 50 caracteres.' })
  tratamento?: string | null;

  @IsOptional()
  @IsString({ message: 'Gênero deve ser um texto.' })
  @MaxLength(30, { message: 'Gênero não pode exceder 30 caracteres.' })
  @IsIn(['FEMININO', 'MASCULINO', 'NAO_BINARIO', 'OUTRO'], { message: 'Gênero inválido.' })
  genero?: string | null;

  @IsOptional()
  @IsString({ message: 'Estado civil deve ser um texto.' })
  @MaxLength(50, { message: 'Estado civil não pode exceder 50 caracteres.' })
  estado_civil?: string | null;

  @IsOptional()
  @IsString({ message: 'Naturalidade deve ser um texto.' })
  @MaxLength(100, { message: 'Naturalidade não pode exceder 100 caracteres.' })
  naturalidade?: string | null;

  @IsOptional()
  @IsString({ message: 'Nacionalidade deve ser um texto.' })
  @MaxLength(100, { message: 'Nacionalidade não pode exceder 100 caracteres.' })
  nacionalidade?: string | null;

  @IsOptional()
  @IsString({ message: 'Empresa deve ser um texto.' })
  @MaxLength(150, { message: 'Empresa não pode exceder 150 caracteres.' })
  empresa?: string | null;

  @IsOptional()
  @IsString({ message: 'Profissão deve ser um texto.' })
  @MaxLength(100, { message: 'Profissão não pode exceder 100 caracteres.' })
  profissao?: string | null;

  @IsOptional()
  @IsString({ message: 'Nome da mãe deve ser um texto.' })
  @MaxLength(100, { message: 'Nome da mãe não pode exceder 100 caracteres.' })
  nome_mae?: string | null;

  @IsOptional()
  @IsString({ message: 'Nome do pai deve ser um texto.' })
  @MaxLength(100, { message: 'Nome do pai não pode exceder 100 caracteres.' })
  nome_pai?: string | null;

  @IsOptional()
  @IsString({ message: 'Qualificação deve ser um texto.' })
  @MaxLength(5000, { message: 'Qualificação não pode exceder 5000 caracteres.' })
  qualificacao?: string | null;

  @IsOptional()
  @IsInt({ message: 'Selecione um representante legal válido.' })
  @Min(1)
  id_representante_legal?: number | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['pf', 'pj'])
  tipo_pessoa?: string;

  @IsOptional()
  @IsString()
  @IsIn(PROCESS_CATEGORIES, { message: 'Selecione uma categoria válida.' })
  categoria?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategoria?: string | null;
}
