import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    try {
      const data: any = {
        ...createClienteDto,
        data_nascimento: createClienteDto.data_nascimento
          ? new Date(createClienteDto.data_nascimento)
          : null,
      };

      return await this.prisma.cliente.create({
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Já existe um cliente cadastrado com este CPF/CNPJ.',
        );
      }
      throw new InternalServerErrorException(
        'Erro inesperado ao cadastrar o cliente.',
      );
    }
  }

  async findAll() {
    return this.prisma.cliente.findMany({
      orderBy: {
        nome: 'asc',
      },
      include: {
        _count: {
          select: {
            processos: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id_cliente: id },
      include: {
        processos: true,
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }

    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    // Garante que o cliente existe antes de atualizar
    await this.findOne(id);

    try {
      const dataToUpdate: any = { ...updateClienteDto };
      if (updateClienteDto.data_nascimento !== undefined) {
        dataToUpdate.data_nascimento = updateClienteDto.data_nascimento
          ? new Date(updateClienteDto.data_nascimento)
          : null;
      }

      return await this.prisma.cliente.update({
        where: { id_cliente: id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Já existe um cliente cadastrado com este CPF/CNPJ.',
        );
      }
      throw new InternalServerErrorException(
        'Erro inesperado ao atualizar o cliente.',
      );
    }
  }

  async remove(id: number) {
    // Garante que o cliente existe antes de remover
    await this.findOne(id);

    try {
      return await this.prisma.cliente.delete({
        where: { id_cliente: id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível remover o cliente pois ele possui processos vinculados.',
        );
      }
      throw new InternalServerErrorException(
        'Erro inesperado ao remover o cliente.',
      );
    }
  }
}
