import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { email, senha, nome, role, ativo, data_nascimento } = createUsuarioDto;

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail');
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const senha_hash = await bcrypt.hash(senha, salt);

      const novoUsuario = await this.prisma.usuario.create({
        data: {
          nome: nome.trim(),
          email: email.toLowerCase().trim(),
          senha_hash,
          role: role || 'ADVOGADO',
          ativo: ativo !== undefined ? ativo : true,
          data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
        },
        select: {
          id_usuario: true,
          nome: true,
          email: true,
          role: true,
          ativo: true,
          data_nascimento: true,
          data_criacao: true,
          data_atualizacao: true,
        },
      });

      return novoUsuario;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Erro ao cadastrar novo usuário');
    }
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        data_nascimento: true,
        data_criacao: true,
        data_atualizacao: true,
      },
      orderBy: {
        data_criacao: 'desc',
      },
    });
  }

  async findResponsaveis() {
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        role: {
          in: ['ADVOGADO', 'ESTAGIARIO'],
        },
        ativo: true,
      },
      select: {
        id_usuario: true,
        nome: true,
        role: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return usuarios.map((u) => ({
      id: u.id_usuario,
      id_usuario: u.id_usuario,
      nome: u.nome,
      cargo: u.role === 'ADVOGADO' ? 'Advogado' : 'Estagiário',
      role: u.role,
    }));
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        data_nascimento: true,
        data_criacao: true,
        data_atualizacao: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID #${id} não encontrado`);
    }

    return usuario;
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id);

    const { email, senha, nome, role, ativo, data_nascimento } = updateUsuarioDto;
    const dataToUpdate: Record<string, any> = {};

    if (nome) dataToUpdate.nome = nome.trim();
    if (role) dataToUpdate.role = role;
    if (ativo !== undefined) dataToUpdate.ativo = ativo;
    if (data_nascimento !== undefined) {
      dataToUpdate.data_nascimento = data_nascimento ? new Date(data_nascimento) : null;
    }

    if (email) {
      const emailFormatado = email.toLowerCase().trim();
      const existente = await this.prisma.usuario.findUnique({
        where: { email: emailFormatado },
      });

      if (existente && existente.id_usuario !== id) {
        throw new ConflictException('Este e-mail já está sendo utilizado por outro usuário');
      }
      dataToUpdate.email = emailFormatado;
    }

    if (senha) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.senha_hash = await bcrypt.hash(senha, salt);
    }

    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data: dataToUpdate,
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        data_nascimento: true,
        data_criacao: true,
        data_atualizacao: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.usuario.delete({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
      },
    });
  }
}
