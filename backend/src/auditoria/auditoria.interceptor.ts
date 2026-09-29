import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { concatMap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Actor } from '../access/access.service.js';

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const user: Actor | undefined = req.user;
    const entity = req.path.replace(/^\/api\//, '').split('/')[0];
    const entities = [
      'clientes',
      'processos',
      'prazos',
      'usuarios',
      'documentos',
      'agenda',
      'configuracoes',
    ];
    if (
      !user ||
      !entities.includes(entity) ||
      !['POST', 'PATCH', 'DELETE'].includes(req.method)
    )
      return next.handle();
    return next.handle().pipe(
      concatMap(async (result) => {
        const action =
          req.method === 'DELETE'
            ? 'EXCLUSAO'
            : req.method === 'PATCH'
              ? 'EDICAO'
              : 'CRIACAO';
        const operation = /\/(arquivar|restaurar|acessos)$/.exec(req.path)?.[1];
        const resultId =
          result && typeof result === 'object'
            ? result['id_' + entity.replace(/s$/, '')]
            : undefined;
        await this.prisma.auditLog.create({
          data: {
            id_usuario: user.id_usuario,
            usuario: user.nome,
            cargo: user.role,
            acao: operation ? 'STATUS' : action,
            entidade: entity,
            registro: String(req.params.id ?? resultId ?? ''),
            descricao: operation
              ? `${operation} em ${entity}`
              : `${action} em ${entity}`,
          },
        });
        return result;
      }),
    );
  }
}
