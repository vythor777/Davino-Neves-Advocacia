import { Injectable, UnauthorizedException, OnModuleInit, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedInitialAdmin();
  }

  /**
   * Garante a existência de um usuário administrador inicial caso o banco esteja vazio
   */
  async seedInitialAdmin() {
    try {
      const count = await this.prisma.usuario.count();
      if (count === 0) {
        const defaultEmail = 'admin@davinoeneves.adv.br';
        const defaultPassword = 'admin';
        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(defaultPassword, salt);

        await this.prisma.usuario.create({
          data: {
            nome: 'Administrador Davino & Neves',
            email: defaultEmail,
            senha_hash,
            role: 'ADMINISTRADOR',
            ativo: true,
          },
        });
        this.logger.log(`Usuário administrador padrão criado com sucesso: ${defaultEmail}`);
      }
    } catch (err) {
      this.logger.warn(`Nota na inicialização do seed de admin: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas: e-mail ou senha incorretos.');
    }

    if (user.ativo === false) {
      throw new UnauthorizedException('Este usuário está inativo. Contate o administrador do escritório.');
    }

    const isMatch = await bcrypt.compare(pass, user.senha_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas: e-mail ou senha incorretos.');
    }

    const { senha_hash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.senha);

    const payload = {
      sub: user.id_usuario,
      email: user.email,
      role: user.role,
      nome: user.nome,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id_usuario,
        id_usuario: user.id_usuario,
        nome: user.nome,
        email: user.email,
        role: user.role,
        ativo: user.ativo,
      },
    };
  }
}
