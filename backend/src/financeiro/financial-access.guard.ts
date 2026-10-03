import { Injectable, ForbiddenException, type CanActivate, type ExecutionContext } from '@nestjs/common';
export function canAccessFinance(user?: { role?: string; acesso_financeiro?: boolean }): boolean {
  return user?.role === 'ADMINISTRADOR' || user?.acesso_financeiro === true;
}
@Injectable()
export class FinancialAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (!canAccessFinance(context.switchToHttp().getRequest().user)) throw new ForbiddenException('O administrador precisa liberar seu acesso ao Financeiro.');
    return true;
  }
}
