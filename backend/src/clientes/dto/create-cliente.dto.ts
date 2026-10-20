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
} from 'class-validator';

export class CreateClienteDto {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MaxLength(100, { message: 'O nome não pode exceder 100 caracteres.' })
  nome: string;

  @IsString({ message: 'O CPF/CNPJ deve ser um texto.' })
  @IsNotEmpty({ message: 'O CPF/CNPJ é obrigatório.' })
  @MaxLength(20, { message: 'O CPF/CNPJ não pode exceder 20 caracteres.' })
  @IsCpfCnpj({ message: 'CPF/CNPJ inválido. Confira os dígitos verificadores.' })
  cpf_cnpj: string;

  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @MaxLength(100, { message: 'O e-mail não pode exceder 100 caracteres.' })
  email: string;

  @IsString({ message: 'O telefone deve ser um texto.' })
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  @MaxLength(20, { message: 'O telefone não pode exceder 20 caracteres.' })
  telefone: string;

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
}
