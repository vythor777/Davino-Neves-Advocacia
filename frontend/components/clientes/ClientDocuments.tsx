'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PdfUpload } from '@/components/PdfUpload';
import { usePermissions } from '@/hooks/usePermissions';
import { documentoService, saveDocumentBlob, type Documento } from '@/services/documentoService';

export function ClientDocuments({ clientId, onUploaded }: { clientId: number; onUploaded?: () => void }) {
  const { admin, canManageDeadline } = usePermissions();
  const [documents, setDocuments] = useState<Documento[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setDocuments(await documentoService.list(undefined, clientId));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível carregar os documentos.');
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function download(document: Documento) {
    try {
      saveDocumentBlob(await documentoService.download(document.id_documento), document.nome_arquivo);
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : 'Não foi possível baixar o PDF.');
    }
  }

  return (
    <section aria-label="Documentos do cliente" className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
      <h4 className="font-semibold text-slate-900 dark:text-slate-100">Documentos do cliente</h4>
      {error ? <div role="alert" className="text-rose-700 dark:text-rose-400">
        {error} <button type="button" onClick={() => void load()} className="font-medium underline focus-visible:outline-2">Tentar novamente</button>
      </div> : documents === null ? <p role="status">Carregando documentos…</p> : documents.length === 0 ? <p>Nenhum documento encontrado.</p> : (
        <ul className="space-y-2">
          {documents.map(document => (
            <li key={document.id_documento} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
              <span className="min-w-0 wrap-break-word">
                <span className="block font-medium">{document.nome_arquivo}</span>
                <span className="block text-slate-500 dark:text-slate-400">{new Date(document.data_upload).toLocaleDateString('pt-BR')}{document.id_processo ? ` · Processo #${document.id_processo}` : ''}</span>
              </span>
              {document.situacao === 'DISPONIVEL' ? (
                <button type="button" className="rounded-lg px-2 py-1.5 font-semibold text-brand hover:bg-slate-100 focus-visible:outline-2 active:bg-slate-200 dark:hover:bg-slate-800" onClick={() => void download(document)} aria-label={`Baixar ${document.nome_arquivo}`}>Baixar PDF</button>
              ) : <span className="text-slate-500 dark:text-slate-400">{document.situacao === 'ARQUIVADO' ? 'Arquivado' : 'Indisponível para download'}</span>}
            </li>
          ))}
        </ul>
      )}
      {(admin || canManageDeadline) && <PdfUpload clientId={clientId} onUploaded={async () => {
        onUploaded?.();
        await load();
      }} />}
    </section>
  );
}
