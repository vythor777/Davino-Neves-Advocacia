import { BadRequestException, Controller, Get, ParseBoolPipe, Query } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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
  async list(
    @Query('entidade') entidade?: string,
    @Query('registro') registro?: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
    @Query('pagina') page?: string,
    @Query('incluir_documentos', new ParseBoolPipe({ optional: true })) includeDocuments?: boolean,
  ) {
    const gte = auditDay(de);
    const lt = auditDay(ate, true);
    if (gte && lt && gte >= lt) throw new BadRequestException('A data final deve ser igual ou posterior à inicial.');
    const pageNumber = page === undefined ? 1 : Number(page);
    if (!Number.isSafeInteger(pageNumber) || pageNumber < 1 || pageNumber > 21_474_837) {
      throw new BadRequestException('Informe uma página válida.');
    }
    let scope: Prisma.AuditLogWhereInput = { entidade, registro };
    const documentNames = new Map<string, string>();
    if (includeDocuments && (entidade === 'clientes' || entidade === 'processos')) {
      const id = Number(registro);
      if (!registro || !/^\d+$/.test(registro) || id < 1 || id > 2_147_483_647) {
        throw new BadRequestException('Informe um registro válido para consultar os documentos vinculados.');
      }
      const documents = await this.prisma.documento.findMany({
        where: entidade === 'clientes' ? { OR: [{ id_cliente: id }, { processo: { id_cliente: id } }] } : { id_processo: id },
        select: { id_documento: true, nome_arquivo: true },
      });
      for (const document of documents) documentNames.set(String(document.id_documento), document.nome_arquivo);
      if (documentNames.size) {
        scope = { OR: [scope, { entidade: 'documentos', registro: { in: [...documentNames.keys()] } }] };
      }
    }
    const logs = await this.prisma.auditLog.findMany({
      where: { ...scope, timestamp: gte || lt ? { gte, lt } : undefined },
      orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
      skip: (pageNumber - 1) * 100,
      take: 100,
    });
    if (!documentNames.size) return logs;
    return logs.map(log => {
      const name = log.entidade === 'documentos' && log.registro ? documentNames.get(log.registro) : undefined;
      if (!name) return log;
      if (log.acao === 'CRIACAO' && log.descricao.startsWith('Criação em documentos #')) {
        return { ...log, acao: 'DOCUMENTO', descricao: `Anexou o documento “${name}”.` };
      }
      if (log.acao === 'STATUS' && log.descricao.startsWith('arquivar em documentos #')) {
        return { ...log, descricao: `Arquivou o documento “${name}”.` };
      }
      return log;
    });
  }
}
