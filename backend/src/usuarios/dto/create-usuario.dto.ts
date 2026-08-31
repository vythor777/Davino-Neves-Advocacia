import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUsuarioDto {
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email: string;

  @IsString({ message: 'A senha deve ser um texto' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  senha: string;

  @IsEnum(Role, { message: 'Perfil inválido. Deve ser ADMINISTRADOR, ADVOGADO ou ESTAGIARIO' })
  @IsOptional()
  role?: Role;

  @IsBoolean({ message: 'O status ativo deve ser booleano' })
  @IsOptional()
  ativo?: boolean;
}
