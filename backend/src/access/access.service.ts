import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export interface Actor {
  id_usuario: number;
  role: Role;
  nome: string;
  acesso_financeiro?: boolean;
}
export const isClosed = (status: string) =>
  /arquivado|encerrado|finalizado|julgado/i.test(status);
export const BASIC_CLIENT_FIELDS = ['email', 'telefone', 'endereco'];

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  requireRole(user: Actor, ...roles: Role[]) {
    if (!roles.includes(user.role))
      throw new ForbiddenException('Seu cargo não permite esta operação.');
  }

  processScope(user: Actor): Prisma.ProcessoWhereInput {
    if (user.role === 'ADMINISTRADOR') return {};
    const linked = { participantes: { some: { id_usuario: user.id_usuario } } };
    return user.role === 'ADVOGADO'
      ? { OR: [{ id_responsavel: user.id_usuario }, linked] }
      : linked;
  }

  async process(
    user: Actor,
    id: number,
    action: 'read' | 'edit' | 'archive' = 'read',
  ) {
    const processo = await this.prisma.processo.findFirst({
      where: { id_processo: id, ...this.processScope(user) },
    });
    // A mesma resposta para inexistente e não liberado evita revelar outros processos.
    if (!processo)
      throw new NotFoundException(
        'Processo não encontrado ou não liberado para seu acesso.',
      );
    if (action !== 'read') {
      this.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO');
      if (
        action === 'edit' &&
        user.role !== 'ADMINISTRADOR' &&
        processo.id_responsavel !== user.id_usuario
      ) {
        throw new ForbiddenException(
          'Somente o advogado responsável pode editar este processo.',
        );
      }
    }
    return processo;
  }

  async processNumber(user: Actor, number: string) {
    if (user.role === 'ADMINISTRADOR') return;
    const digits = number.replace(/\D/g, '');
    const allowed = await this.prisma.processo.findMany({
      where: this.processScope(user),
      select: { numero_processo: true },
    });
    if (!allowed.some((p) => p.numero_processo.replace(/\D/g, '') === digits)) {
      throw new NotFoundException(
        'Processo não encontrado ou não liberado para seu acesso.',
      );
    }
  }

  clientUpdate(user: Actor, data: object) {
    if (
      user.role === 'ESTAGIARIO' &&
      Object.keys(data).some((key) => !BASIC_CLIENT_FIELDS.includes(key))
    ) {
      throw new ForbiddenException(
        'Estagiários podem editar apenas e-mail, telefone e endereço.',
      );
    }
  }
}
