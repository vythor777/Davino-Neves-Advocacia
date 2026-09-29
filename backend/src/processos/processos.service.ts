import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AccessService, isClosed, type Actor } from '../access/access.service.js';
import { CreateProcessoDto } from './dto/create-processo.dto.js';
import { UpdateProcessoDto } from './dto/update-processo.dto.js';
import { AccessProcessoDto } from './dto/access-processo.dto.js';

const include = {
  cliente: true,
  responsavel: { select: { id_usuario: true, nome: true } },
  participantes: { select: { id_usuario: true, usuario: { select: { nome: true, role: true } } } },
  _count: { select: { prazos: true, documentos: true } },
} satisfies Prisma.ProcessoInclude;

@Injectable()
export class ProcessosService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService) {}

  async create(dto: CreateProcessoDto, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO');
    try {
      return await this.prisma.processo.create({
        data: { ...dto, data_abertura: new Date(dto.data_abertura),
          id_responsavel: user.role === 'ADVOGADO' ? user.id_usuario : null }, include,
      });
    } catch (error) { this.rethrow(error); }
  }

  findAll(user: Actor) {
    return this.prisma.processo.findMany({ where: this.access.processScope(user), include, orderBy: { data_criacao: 'desc' } });
  }

  async findOne(id: number, user: Actor) {
    const result = await this.prisma.processo.findFirst({
      where: { id_processo: id, ...this.access.processScope(user) },
      include: { ...include, prazos: true, documentos: { select: {
        id_documento: true, nome_arquivo: true, tipo: true, data_upload: true,
      } } },
    });
    if (!result) throw new NotFoundException('Processo não encontrado ou não liberado para seu acesso.');
    return result;
  }

  async update(id: number, dto: UpdateProcessoDto, user: Actor) {
    const current = await this.access.process(user, id, 'edit');
    if (dto.status && isClosed(current.status) && !isClosed(dto.status) && user.role !== 'ADMINISTRADOR') {
      throw new ForbiddenException('Somente o administrador pode restaurar processos encerrados.');
    }
    try {
      return await this.prisma.processo.update({ where: { id_processo: id },
        data: { ...dto, ...(dto.data_abertura !== undefined ? { data_abertura: new Date(dto.data_abertura) } : {}) }, include });
    } catch (error) { this.rethrow(error); }
  }

  async archive(id: number, user: Actor) {
    await this.access.process(user, id, 'archive');
    return this.prisma.processo.update({ where: { id_processo: id }, data: { status: 'Arquivado' }, include });
  }

  async restore(id: number, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    await this.access.process(user, id);
    return this.prisma.processo.update({ where: { id_processo: id }, data: { status: 'Em Andamento' }, include });
  }

  async setAccess(id: number, dto: AccessProcessoDto, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    await this.access.process(user, id);
    const ids = [...new Set([...(dto.id_responsavel ? [dto.id_responsavel] : []), ...dto.participantes])];
    const users = await this.prisma.usuario.findMany({ where: { id_usuario: { in: ids }, ativo: true }, select: { id_usuario: true, role: true } });
    if (users.length !== ids.length) throw new BadRequestException('Selecione somente usuários ativos.');
    if (dto.id_responsavel && !users.some(u => u.id_usuario === dto.id_responsavel && u.role === 'ADVOGADO')) {
      throw new BadRequestException('O responsável deve possuir cargo de advogado.');
    }
    return this.prisma.processo.update({ where: { id_processo: id }, data: {
      id_responsavel: dto.id_responsavel,
      participantes: { deleteMany: {}, create: dto.participantes.map(id_usuario => ({ id_usuario })) },
    }, include });
  }

  async remove(id: number, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    await this.access.process(user, id);
    try { return await this.prisma.processo.delete({ where: { id_processo: id } }); }
    catch (error) { this.rethrow(error); }
  }

  private rethrow(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw new ConflictException('Já existe um processo com este número.');
      if (error.code === 'P2003') throw new ConflictException('Verifique o cliente informado e os registros vinculados ao processo.');
      if (error.code === 'P2025') throw new NotFoundException('Processo não encontrado.');
    }
    throw error;
  }
}
