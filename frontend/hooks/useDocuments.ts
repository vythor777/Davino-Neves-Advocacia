'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { documentoService, type Documento, type StorageUsage } from '@/services/documentoService';
export function useDocuments(processId?: number) {
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try { const [rows, capacity] = await Promise.all([documentoService.list(processId), documentoService.usage()]); setDocuments(rows); setUsage(capacity); }
    catch { setError('Não foi possível carregar os documentos. Tente novamente.'); }
    finally { setLoading(false); }
  }, [processId]);
  useEffect(() => { void reload(); }, [reload]);
  const run = async (action: () => Promise<void>) => {
    try { await action(); }
    catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } | Blob } };
      let message = 'Não foi possível concluir a operação. Tente novamente.';
      const data = e.response?.data;
      if (data instanceof Blob) { try { message = JSON.parse(await data.text()).message || message; } catch {} }
      else if (data?.message) message = data.message;
      toast.error(message);
    }
  };
  return { documents, usage, loading, error, reload, run };
}
