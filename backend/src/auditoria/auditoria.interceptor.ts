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
  async intercept(context: ExecutionContext, next: CallHandler) {
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
      'financeiro',
    ];
    if (
      !user ||
      !entities.includes(entity) ||
      !['POST', 'PATCH', 'DELETE'].includes(req.method)
    )
      return next.handle();
    const models: Record<string, { name: string; id: string }> = {
      clientes: { name: 'cliente', id: 'id_cliente' }, processos: { name: 'processo', id: 'id_processo' },
      prazos: { name: 'prazo', id: 'id_prazo' }, usuarios: { name: 'usuario', id: 'id_usuario' },
      documentos: { name: 'documento', id: 'id_documento' }, agenda: { name: 'agenda', id: 'id_agenda' },
      financeiro: { name: 'lancamentoFinanceiro', id: 'id' },
    };
    const model = models[entity];
    const allowed = ['nome', 'titulo', 'numero_processo', 'descricao', 'status', 'data_vencimento', 'hora', 'tipoCompromisso', 'responsavel', 'id_responsavel', 'id_processo', 'id_cliente', 'role', 'ativo', 'valor', 'dataVencimento', 'dataPagamento', 'tipo', 'categoria'];
    let previous: Record<string, unknown> | null = null;
    if (model && req.params.id && ['PATCH', 'DELETE'].includes(req.method)) {
      const id = model.id === 'id' ? req.params.id : Number(req.params.id);
      if (model.id === 'id' || Number.isInteger(id)) {
        previous = await (this.prisma as any)[model.name].findUnique({
          where: { [model.id]: id }, select: Object.fromEntries(allowed.filter(key => {
            const fields: Record<string, string[]> = {
              cliente: ['nome'], processo: ['titulo', 'numero_processo', 'descricao', 'status', 'id_responsavel', 'id_cliente'],
              prazo: ['descricao', 'status', 'data_vencimento', 'hora', 'tipoCompromisso', 'responsavel', 'id_processo'],
              usuario: ['nome', 'role', 'ativo'], documento: ['id_processo'], agenda: ['titulo'],
              lancamentoFinanceiro: ['descricao', 'status', 'valor', 'dataVencimento', 'dataPagamento', 'tipo', 'categoria'],
            };
            return fields[model.name]?.includes(key);
          }).map(key => [key, true])),
        });
      }
    }
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
            ? (entity === 'financeiro' ? result.id : result['id_' + entity.replace(/s$/, '')])
            : undefined;
        const record = String(req.params.id ?? resultId ?? '');
        // Explicit whitelist: never record passwords, tokens, or document contents.
        const changes = Object.entries(req.body ?? {}).filter(([key]) => allowed.includes(key)).map(([key, value]) => `${key}: ${previous && key in previous ? JSON.stringify(previous[key]) + " → " : ""}${JSON.stringify(value)}`).join('; ');
        await this.prisma.auditLog.create({
          data: {
            id_usuario: user.id_usuario,
            usuario: user.nome,
            cargo: user.role,
            acao: operation ? 'STATUS' : action,
            entidade: entity,
            registro: record,
            descricao: operation
              ? `${operation} em ${entity} #${record}${changes ? ": " + changes : ""}`
              : `${action} em ${entity} #${record}${changes ? ": " + changes : ""}`,
          },
        });
        return result;
      }),
    );
  }
}
