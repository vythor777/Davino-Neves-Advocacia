'use client';
import { useEffect, useState } from 'react';
import { AuditTrail, type AuditLogItem } from './AuditTrail';
import { Skeleton } from './Skeleton';
import api from '@/services/api';
import { usePermissions } from '@/hooks/usePermissions';
export function RemoteAuditTrail({
  entity,
  record,
}: {
  entity?: string;
  record?: number;
}) {
  const { admin } = usePermissions();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!admin) return;
    let active = true;
    api
      .get<AuditLogItem[]>('/auditoria', {
        params: { entidade: entity, registro: record },
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
  }, [admin, entity, record]);
  if (!admin) return null;
  if (loading) return <Skeleton className="h-24 w-full" />;
  if (error)
    return (
      <p role="alert" className="text-sm text-rose-600">
        {error}
      </p>
    );
  return (
    <AuditTrail
      logs={logs}
      emptyMessage="Nenhuma ação registrada após a ativação da auditoria."
    />
  );
}
