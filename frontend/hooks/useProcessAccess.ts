'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/services/api';
import { processoService, type Processo } from '@/services/processoService';
import { usePermissions } from './usePermissions';
interface Member {
  id_usuario: number;
  nome: string;
  role: string;
  ativo: boolean;
}
export function useProcessAccess(
  process: Processo,
  onUpdated: (process: Processo) => void,
) {
  const { admin } = usePermissions();
  const [members, setMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState(
    process.id_responsavel ? String(process.id_responsavel) : '',
  );
  const [participants, setParticipants] = useState(
    process.participantes?.map((p) => p.id_usuario) ?? [],
  );
  const [loading, setLoading] = useState(admin);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!admin) return;
    let active = true;
    api
      .get<Member[]>('/usuarios')
      .then(({ data }) => {
        if (active) setMembers(data.filter((m) => m.ativo));
      })
      .catch(() => {
        if (active)
          setError(
            'Não foi possível carregar a equipe. Feche os detalhes e tente novamente.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [admin]);
  async function save() {
    setSaving(true);
    try {
      onUpdated(
        await processoService.setAccess(process.id_processo, {
          id_responsavel: owner ? Number(owner) : null,
          participantes: participants,
        }),
      );
      toast.success('Acessos atualizados');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Falha ao salvar acessos',
      );
    } finally {
      setSaving(false);
    }
  }
  async function changeStatus(restore: boolean) {
    setSaving(true);
    try {
      onUpdated(
        await (restore
          ? processoService.restore(process.id_processo)
          : processoService.archive(process.id_processo)),
      );
      toast.success(restore ? 'Processo restaurado' : 'Processo arquivado');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Falha ao atualizar processo',
      );
    } finally {
      setSaving(false);
    }
  }
  return {
    members,
    owner,
    setOwner,
    participants,
    setParticipants,
    loading,
    error,
    saving,
    save,
    changeStatus,
  };
}
