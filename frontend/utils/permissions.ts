import type { Usuario } from '@/services/authService';
export const isClosedProcess = (status: string) =>
  /arquivado|encerrado|finalizado|julgado/i.test(status);
export function permissionsFor(user: Usuario | null) {
  const admin = user?.role === 'ADMINISTRADOR';
  const lawyer = user?.role === 'ADVOGADO';
  const intern = user?.role === 'ESTAGIARIO';
  return {
    admin,
    intern,
    canCreateProcess: admin || lawyer,
    canManageDeadline: admin || lawyer,
    canDelete: admin,
    canDownloadDocument: admin || lawyer,
    canEditProcess: (process: { id_responsavel?: number | null }) =>
      admin ||
      (lawyer && process.id_responsavel === (user?.id_usuario ?? user?.id)),
  };
}
