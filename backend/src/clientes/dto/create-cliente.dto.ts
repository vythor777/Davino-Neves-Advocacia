import {
  IsEmail,
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
}
