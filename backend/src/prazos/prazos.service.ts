import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AccessService, type Actor } from '../access/access.service.js';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePrazoDto } from './dto/create-prazo.dto.js';
import { UpdatePrazoDto } from './dto/update-prazo.dto.js';

@Injectable()
export class PrazosService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService) {}

  private async resolveResponsavel(id: number, processoId: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!usuario?.ativo) throw new BadRequestException('Selecione um responsável ativo da equipe.');
    await this.access.process(usuario, processoId);
    return usuario;
  }

  async create(createPrazoDto: CreatePrazoDto, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO');
    await this.access.process(user, createPrazoDto.id_processo);
    const responsavel = createPrazoDto.id_responsavel == null ? null : await this.resolveResponsavel(createPrazoDto.id_responsavel, createPrazoDto.id_processo);
    if ((createPrazoDto.tipoCompromisso || 'Prazo Fatal').toLowerCase().includes('fatal') && !responsavel && !createPrazoDto.responsavel?.trim()) {
      throw new BadRequestException('Defina um responsável pelo cumprimento do prazo fatal.');
    }
    try {
      return await this.prisma.prazo.create({
        data: {
          descricao: createPrazoDto.descricao,
          data_vencimento: new Date(createPrazoDto.data_vencimento),
          hora: createPrazoDto.hora || '09:00',
          tipoCompromisso: createPrazoDto.tipoCompromisso || 'Prazo Fatal',
          responsavel: responsavel?.nome || createPrazoDto.responsavel || null,
          id_responsavel: responsavel?.id_usuario,
          status: createPrazoDto.status,
          id_processo: createPrazoDto.id_processo,
        },
        include: {
          processo: {
            include: {
              cliente: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException(
          `Processo com ID ${createPrazoDto.id_processo} não encontrado.`,
        );
      }
      throw new InternalServerErrorException(
        'Erro inesperado ao cadastrar o prazo.',
      );
    }
  }

  async findAll(user: Actor) {
    const rows = await this.prisma.prazo.findMany({
      where: { processo: this.access.processScope(user) },
      orderBy: {
        data_vencimento: 'asc',
      },
      include: {
        usuario_responsavel: { select: { nome: true } },
        processo: {
          include: {
            cliente: true,
          },
        },
      },
    });
    return rows.map(row => ({ ...row, responsavel: row.usuario_responsavel?.nome ?? row.responsavel }));
  }

  async findOne(id: number, user: Actor) {
    const prazo = await this.prisma.prazo.findFirst({
      where: { id_prazo: id, processo: this.access.processScope(user) },
      include: {
        usuario_responsavel: { select: { nome: true } },
        processo: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (!prazo) {
      throw new NotFoundException(`Prazo com ID ${id} não encontrado.`);
    }

    return { ...prazo, responsavel: prazo.usuario_responsavel?.nome ?? prazo.responsavel };
  }

  async update(id: number, updatePrazoDto: UpdatePrazoDto, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO');
    if (updatePrazoDto.id_processo !== undefined) await this.access.process(user, updatePrazoDto.id_processo);
    // Garante que o prazo existe antes de atualizar
    const existing = await this.findOne(id, user);
    const responsavel = updatePrazoDto.id_responsavel == null ? null : await this.resolveResponsavel(updatePrazoDto.id_responsavel, updatePrazoDto.id_processo ?? existing.id_processo);
    if (updatePrazoDto.id_processo !== undefined && updatePrazoDto.id_processo !== existing.id_processo && existing.id_responsavel && updatePrazoDto.id_responsavel === undefined) await this.resolveResponsavel(existing.id_responsavel, updatePrazoDto.id_processo);
    const nomeFinal = updatePrazoDto.id_responsavel === null ? null : responsavel?.nome ?? updatePrazoDto.responsavel ?? existing.responsavel;
    if ((updatePrazoDto.tipoCompromisso ?? existing.tipoCompromisso).toLowerCase().includes('fatal') && !nomeFinal?.trim()) {
      throw new BadRequestException('Defina um responsável pelo cumprimento do prazo fatal.');
    }

    try {
      const dataToUpdate: Prisma.PrazoUpdateInput = {};

      if (updatePrazoDto.descricao !== undefined) {
        dataToUpdate.descricao = updatePrazoDto.descricao;
      }
      if (updatePrazoDto.data_vencimento !== undefined) {
        dataToUpdate.data_vencimento = new Date(updatePrazoDto.data_vencimento);
      }
      if (updatePrazoDto.status !== undefined) {
        dataToUpdate.status = updatePrazoDto.status;
      }
      if (updatePrazoDto.hora !== undefined) {
        dataToUpdate.hora = updatePrazoDto.hora;
      }
      if (updatePrazoDto.tipoCompromisso !== undefined) {
        dataToUpdate.tipoCompromisso = updatePrazoDto.tipoCompromisso;
      }
      if (updatePrazoDto.responsavel !== undefined) {
        dataToUpdate.responsavel = updatePrazoDto.responsavel;
      }
      if (responsavel) {
        dataToUpdate.usuario_responsavel = { connect: { id_usuario: responsavel.id_usuario } };
        dataToUpdate.responsavel = responsavel.nome;
      } else if (updatePrazoDto.id_responsavel === null) {
        dataToUpdate.usuario_responsavel = { disconnect: true };
        dataToUpdate.responsavel = null;
      } else if (updatePrazoDto.responsavel !== undefined && updatePrazoDto.responsavel !== existing.responsavel) {
        dataToUpdate.usuario_responsavel = { disconnect: true };
      }
      if (updatePrazoDto.id_processo !== undefined) {
        dataToUpdate.processo = {
          connect: { id_processo: updatePrazoDto.id_processo },
        };
      }

      return await this.prisma.prazo.update({
        where: { id_prazo: id },
        data: dataToUpdate,
        include: {
          processo: {
            include: {
              cliente: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2003' || error.code === 'P2025')
      ) {
        throw new NotFoundException('Processo informado não encontrado.');
      }
      throw new InternalServerErrorException(
        'Erro inesperado ao atualizar o prazo.',
      );
    }
  }

  async remove(id: number, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    // Garante que o prazo existe antes de remover
    await this.findOne(id, user);

    try {
      return await this.prisma.prazo.delete({
        where: { id_prazo: id },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro inesperado ao remover o prazo.',
      );
    }
  }
}
