import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

function auditDay(date: string | undefined, nextDay = false) {
  if (date === undefined) return undefined;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestException('Informe uma data válida no formato AAAA-MM-DD.');
  }
  const midnight = new Date(`${date}T00:00:00-03:00`);
  if (!Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== date) {
    throw new BadRequestException('Informe uma data válida no formato AAAA-MM-DD.');
  }
  if (nextDay) midnight.setUTCDate(midnight.getUTCDate() + 1);
  return midnight;
}

@Controller('auditoria')
@Roles('ADMINISTRADOR')
export class AuditoriaController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  list(
    @Query('entidade') entidade?: string,
    @Query('registro') registro?: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
    @Query('pagina') page?: string,
  ) {
    const gte = auditDay(de);
    const lt = auditDay(ate, true);
    if (gte && lt && gte >= lt) throw new BadRequestException('A data final deve ser igual ou posterior à inicial.');
    const pageNumber = page === undefined ? 1 : Number(page);
    if (!Number.isSafeInteger(pageNumber) || pageNumber < 1 || pageNumber > 21_474_837) {
      throw new BadRequestException('Informe uma página válida.');
    }
    return this.prisma.auditLog.findMany({
      where: { entidade, registro, timestamp: gte || lt ? { gte, lt } : undefined },
      orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
      skip: (pageNumber - 1) * 100,
      take: 100,
    });
  }
}
