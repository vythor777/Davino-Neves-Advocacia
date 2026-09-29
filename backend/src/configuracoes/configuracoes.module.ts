import { Body, Controller, Get, Module, Patch } from '@nestjs/common';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
class ConfiguracoesDto {
  @IsString() @IsNotEmpty() @MaxLength(100) nome_escritorio: string;
  @IsOptional() @IsEmail() @MaxLength(100) email_contato?: string | null;
}
@Controller('configuracoes')
class ConfiguracoesController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  async get() {
    return (
      (await this.prisma.configuracao.findUnique({ where: { id: 1 } })) ?? {
        id: 1,
        nome_escritorio: 'Davino Neves Advocacia',
        email_contato: null,
      }
    );
  }
  @Roles('ADMINISTRADOR')
  @Patch()
  update(@Body() dto: ConfiguracoesDto) {
    return this.prisma.configuracao.upsert({
      where: { id: 1 },
      create: { id: 1, ...dto },
      update: dto,
    });
  }
}
@Module({ controllers: [ConfiguracoesController] })
export class ConfiguracoesModule {}
