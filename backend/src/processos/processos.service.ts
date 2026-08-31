import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProcessoDto } from './dto/create-processo.dto.js';
import { UpdateProcessoDto } from './dto/update-processo.dto.js';

@Injectable()
export class ProcessosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProcessoDto: CreateProcessoDto) {
    try {
      return await this.prisma.processo.create({
        data: {
          numero_processo: createProcessoDto.numero_processo,
          titulo: createProcessoDto.titulo,
          descricao: createProcessoDto.descricao,
          data_abertura: new Date(createProcessoDto.data_abertura),
          status: createProcessoDto.status,
          id_cliente: createProcessoDto.id_cliente,
        },
        include: {
          cliente: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Já existe um processo com este número.');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(
            `Cliente com ID ${createProcessoDto.id_cliente} não encontrado.`,
          );
        }
      }
      throw new InternalServerErrorException(
        'Erro inesperado ao cadastrar o processo.',
      );
    }
  }

  async findAll() {
    return this.prisma.processo.findMany({
      orderBy: {
        data_criacao: 'desc',
      },
      include: {
        cliente: true,
        _count: {
          select: {
            prazos: true,
            documentos: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const processo = await this.prisma.processo.findUnique({
      where: { id_processo: id },
      include: {
        cliente: true,
        prazos: true,
        documentos: true,
      },
    });

    if (!processo) {
      throw new NotFoundException(`Processo com ID ${id} não encontrado.`);
    }

    return processo;
  }

  async update(id: number, updateProcessoDto: UpdateProcessoDto) {
    // Garante que o processo existe antes de atualizar
    await this.findOne(id);

    try {
      const dataToUpdate: Prisma.ProcessoUpdateInput = {};

      if (updateProcessoDto.numero_processo !== undefined) {
        dataToUpdate.numero_processo = updateProcessoDto.numero_processo;
      }
      if (updateProcessoDto.titulo !== undefined) {
        dataToUpdate.titulo = updateProcessoDto.titulo;
      }
      if (updateProcessoDto.descricao !== undefined) {
        dataToUpdate.descricao = updateProcessoDto.descricao;
      }
      if (updateProcessoDto.data_abertura !== undefined) {
        dataToUpdate.data_abertura = new Date(updateProcessoDto.data_abertura);
      }
      if (updateProcessoDto.status !== undefined) {
        dataToUpdate.status = updateProcessoDto.status;
      }
      if (updateProcessoDto.id_cliente !== undefined) {
        dataToUpdate.cliente = {
          connect: { id_cliente: updateProcessoDto.id_cliente },
        };
      }

      return await this.prisma.processo.update({
        where: { id_processo: id },
        data: dataToUpdate,
        include: {
          cliente: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Já existe um processo com este número.');
        }
        if (error.code === 'P2003' || error.code === 'P2025') {
          throw new NotFoundException('Cliente informado não encontrado.');
        }
      }
      throw new InternalServerErrorException(
        'Erro inesperado ao atualizar o processo.',
      );
    }
  }

  async remove(id: number) {
    // Garante que o processo existe antes de remover
    await this.findOne(id);

    try {
      return await this.prisma.processo.delete({
        where: { id_processo: id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível remover o processo pois ele possui prazos ou documentos vinculados.',
        );
      }
      throw new InternalServerErrorException(
        'Erro inesperado ao remover o processo.',
      );
    }
  }
}
