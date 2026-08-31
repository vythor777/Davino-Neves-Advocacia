import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto.js';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsString({ message: 'A senha deve ser um texto' })
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres' })
  @IsOptional()
  senha?: string;
}
