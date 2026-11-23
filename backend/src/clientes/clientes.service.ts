import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AccessService, type Actor } from '../access/access.service.js';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';
import { isValidCpfCnpj } from '../common/validation/identifiers.js';

function validateCompanyRegistration(cnpj?: string | null, email?: string | null, telefone?: string | null) {
  if (!cnpj?.trim() || !email?.trim() || !telefone?.trim()) {
    throw new BadRequestException('Informe o CNPJ, o e-mail e o telefone da pessoa jurídica.');
  }
  if (cnpj.replace(/\D/g, '').length !== 14 || !isValidCpfCnpj(cnpj)) {
    throw new BadRequestException('Informe um CNPJ válido para a pessoa jurídica.');
  }
}

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService) {}

  private async validateRepresentative(representativeId?: number | null, clientId?: number) {
    if (representativeId == null) return;
    if (representativeId === clientId) {
      throw new BadRequestException('O cliente não pode ser seu próprio representante legal.');
    }
    const representative = await this.prisma.cliente.findUnique({
      where: { id_cliente: representativeId },
      select: { id_cliente: true, cpf_cnpj: true, tipo_pessoa: true },
    });
    if (!representative || representative.tipo_pessoa !== 'pf') {
      throw new BadRequestException('Selecione uma pessoa física cadastrada como representante legal.');
    }
  }

  private classification(
    dto: { categoria?: string | null; subcategoria?: string | null },
    current?: { categoria?: string | null; subcategoria?: string | null },
  ) {
    if (current && dto.categoria === undefined && dto.subcategoria === undefined) return {};
    const categoria = dto.categoria !== undefined ? dto.categoria : current?.categoria ?? null;
    const changed = dto.categoria !== undefined && dto.categoria !== current?.categoria;
    const subcategoria = dto.subcategoria !== undefined
      ? dto.subcategoria?.trim() || null
      : changed ? null : current?.subcategoria ?? null;
    if (subcategoria && !categoria) {
      throw new BadRequestException('Selecione a categoria antes de informar a subcategoria.');
    }
    return { categoria, subcategoria };
  }

  async create(createClienteDto: CreateClienteDto, user: Actor) {
    const classification = this.classification(createClienteDto);
    const tipoPessoa = createClienteDto.tipo_pessoa
      ?? ((createClienteDto.cpf_cnpj ?? '').replace(/\D/g, '').length === 14 ? 'pj' : 'pf');
    if (tipoPessoa === 'pj') {
      validateCompanyRegistration(createClienteDto.cpf_cnpj, createClienteDto.email, createClienteDto.telefone);
    }
    await this.validateRepresentative(createClienteDto.id_representante_legal);
    if (createClienteDto.data_nascimento) {
      const birthDate = new Date(createClienteDto.data_nascimento);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      if (birthDate > hoje) {
        throw new BadRequestException('A data de nascimento não pode ser uma data futura.');
      }
    }

    try {
      const data: any = {
        ...createClienteDto,
        ...classification,
        tipo_pessoa: tipoPessoa,
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

  async findAll(user: Actor) {
    return this.prisma.cliente.findMany({
      orderBy: {
        nome: 'asc',
      },
      include: {
        _count: {
          select: {
            processos: { where: this.access.processScope(user) },
          },
        },
      },
    });
  }

  async findOne(id: number, user: Actor) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id_cliente: id },
      include: {
        processos: { where: this.access.processScope(user) },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }

    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto, user: Actor) {
    this.access.clientUpdate(user, updateClienteDto);
    await this.validateRepresentative(updateClienteDto.id_representante_legal, id);
    // Garante que o cliente existe antes de atualizar
    const current = await this.findOne(id, user);
    const { tipo_pessoa, ...changes } = updateClienteDto;
    const currentDocument = current.cpf_cnpj?.replace(/\D/g, '');
    const currentType = current.tipo_pessoa ?? (currentDocument?.length === 14 ? 'pj' : 'pf');
    if (tipo_pessoa !== undefined && tipo_pessoa !== currentType) {
      throw new BadRequestException('O tipo de pessoa não pode ser alterado após o cadastro.');
    }
    const newDocument = changes.cpf_cnpj?.replace(/\D/g, '');
    if (newDocument && newDocument !== currentDocument && newDocument.length !== (currentType === 'pj' ? 14 : 11)) {
      throw new BadRequestException(currentType === 'pj' ? 'Informe um CNPJ válido.' : 'Informe um CPF válido.');
    }
    const classification = this.classification(updateClienteDto, current);

    if (updateClienteDto.data_nascimento) {
      const birthDate = new Date(updateClienteDto.data_nascimento);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      if (birthDate > hoje) {
        throw new BadRequestException('A data de nascimento não pode ser uma data futura.');
      }
    }

    try {
      const dataToUpdate: any = { ...changes, ...classification };
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

  async remove(id: number, user: Actor, confirmed = false) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    try {
      return await this.prisma.$transaction(async tx => {
        const processes = { id_cliente: id };
        const documents = { OR: [{ id_cliente: id }, { processo: processes }] };
        if (!confirmed) {
          const [processCount, documentCount] = await Promise.all([
            tx.processo.count({ where: processes }),
            tx.documento.count({ where: documents }),
          ]);
          if (processCount || documentCount) {
            throw new ConflictException('Confirme a exclusão do cliente e de seus vínculos.');
          }
        }
        await tx.documento.updateMany({ where: documents, data: { id_cliente: null, id_processo: null, acesso_restrito: true } });
        await tx.prazo.deleteMany({ where: { processo: processes } });
        await tx.processo.deleteMany({ where: processes });
        return tx.cliente.delete({ where: { id_cliente: id } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new NotFoundException('Cliente não encontrado.');
        if (error.code === 'P2003' || error.code === 'P2034') {
          throw new ConflictException('Os vínculos do cliente mudaram. Atualize a lista e tente novamente.');
        }
      }
      throw error;
    }
  }
}
