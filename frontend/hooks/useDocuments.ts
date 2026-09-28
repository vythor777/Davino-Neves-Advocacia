'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { documentoService, type Documento } from '@/services/documentoService';
export function useDocuments(processId: number) {
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDocuments(await documentoService.list(processId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao carregar documentos.',
      );
    } finally {
      setLoading(false);
    }
  }, [processId]);
  useEffect(() => {
    void load();
  }, [load]);
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || file.size === 0) {
      toast.error('Selecione um arquivo de até 5 MB.');
      return;
    }
    setBusy(true);
    try {
      await documentoService.upload(processId, file);
      toast.success('Documento enviado');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha no envio');
    } finally {
      setBusy(false);
    }
  }
  async function download(doc: Documento) {
    setBusy(true);
    try {
      await documentoService.download(doc);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha no download');
    } finally {
      setBusy(false);
    }
  }
  return { documents, loading, busy, error, load, upload, download };
}
