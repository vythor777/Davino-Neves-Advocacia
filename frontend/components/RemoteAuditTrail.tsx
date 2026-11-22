'use client';
import { useEffect, useState } from 'react';
import { AuditTrail, type AuditLogItem } from './AuditTrail';
import { Skeleton } from './Skeleton';
import api from '@/services/api';
import { usePermissions } from '@/hooks/usePermissions';
export function RemoteAuditTrail({
  entity,
  record,
  from,
  to,
  includeDocuments,
  pagination,
}: {
  entity?: string;
  record?: number;
  from?: string;
  to?: string;
  includeDocuments?: boolean;
  pagination?: { page: number; onChange: (page: number) => void };
}) {
  const { admin } = usePermissions();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const page = pagination?.page;
  useEffect(() => {
    if (!admin) return;
    let active = true;
    api
      .get<AuditLogItem[]>('/auditoria', {
        params: { entidade: entity, registro: record, de: from || undefined, ate: to || undefined, pagina: page, incluir_documentos: includeDocuments },
      })
      .then(({ data }) => {
        if (active) setLogs(data);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar a auditoria.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [admin, entity, record, from, to, page, includeDocuments]);
  if (!admin) return null;
  if (loading) return <Skeleton className="h-24 w-full" />;
  if (error)
    return (
      <p role="alert" className="text-sm text-rose-600">
        {error}
      </p>
    );
  return (
    <>
      <AuditTrail logs={logs} emptyMessage={from || to ? 'Nenhuma ação encontrada no período.' : 'Nenhuma ação registrada nesta página.'} />
      {pagination && (pagination.page > 1 || logs.length === 100) && (
        <nav aria-label="Paginação da auditoria" className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <button className="ui-button ui-button-secondary" type="button" disabled={pagination.page === 1} onClick={() => pagination.onChange(pagination.page - 1)}>Anterior</button>
          <span>Página {pagination.page}</span>
          <button className="ui-button ui-button-secondary" type="button" disabled={logs.length < 100} onClick={() => pagination.onChange(pagination.page + 1)}>Próxima</button>
        </nav>
      )}
    </>
  );
}
