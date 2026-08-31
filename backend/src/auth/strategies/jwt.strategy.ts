import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  nome: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'davino-neves-advocacia-jwt-secret-key-2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: payload.sub },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (user.ativo === false) {
      throw new UnauthorizedException('Usuário desativado pelo administrador');
    }

    return {
      ...user,
      id: user.id_usuario,
    };
  }
}
