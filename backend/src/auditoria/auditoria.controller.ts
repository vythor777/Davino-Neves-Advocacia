import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
@Controller('auditoria')
@Roles('ADMINISTRADOR')
export class AuditoriaController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  list(
    @Query('entidade') entidade?: string,
    @Query('registro') registro?: string,
  ) {
    return this.prisma.auditLog.findMany({
      where: { entidade, registro },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }
}
