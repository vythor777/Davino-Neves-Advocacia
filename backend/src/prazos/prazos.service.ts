import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePrazoDto } from './dto/create-prazo.dto.js';
import { UpdatePrazoDto } from './dto/update-prazo.dto.js';

@Injectable()
export class PrazosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPrazoDto: CreatePrazoDto) {
    try {
      return await this.prisma.prazo.create({
        data: {
          descricao: createPrazoDto.descricao,
          data_vencimento: new Date(createPrazoDto.data_vencimento),
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

  async findAll() {
    return this.prisma.prazo.findMany({
      orderBy: {
        data_vencimento: 'asc',
      },
      include: {
        processo: {
          include: {
            cliente: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const prazo = await this.prisma.prazo.findUnique({
      where: { id_prazo: id },
      include: {
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

    return prazo;
  }

  async update(id: number, updatePrazoDto: UpdatePrazoDto) {
    // Garante que o prazo existe antes de atualizar
    await this.findOne(id);

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

  async remove(id: number) {
    // Garante que o prazo existe antes de remover
    await this.findOne(id);

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
