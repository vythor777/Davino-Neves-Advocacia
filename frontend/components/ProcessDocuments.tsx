'use client';
import { useDocuments } from '@/hooks/useDocuments';
import { usePermissions } from '@/hooks/usePermissions';
import { Skeleton } from './Skeleton';
export function ProcessDocuments({ processId }: { processId: number }) {
  const state = useDocuments(processId);
  const { canDownloadDocument } = usePermissions();
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-semibold">Documentos</h3>
      <label className="block text-sm">
        Anexar arquivo (até 5 MB)
        <input
          className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:p-2"
          type="file"
          disabled={state.busy}
          onChange={(e) => {
            void state.upload(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </label>
      {state.busy && (
        <p role="status" className="text-sm">
          Processando documento…
        </p>
      )}
      {state.loading ? (
        <Skeleton className="h-16 w-full" />
      ) : state.error ? (
        <div role="alert">
          <p>{state.error}</p>
          <button
            type="button"
            className="ui-button ui-button-secondary"
            onClick={state.load}
          >
            Tentar novamente
          </button>
        </div>
      ) : state.documents.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhum documento anexado. Envie o primeiro arquivo deste processo.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {state.documents.map((doc) => (
            <li
              key={doc.id_documento}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="break-words text-sm">{doc.nome_arquivo}</p>
                <p className="text-xs text-slate-500">
                  {(doc.tamanho / 1024).toFixed(0)} KB
                </p>
              </div>
              {canDownloadDocument && (
                <button
                  type="button"
                  className="ui-button ui-button-secondary"
                  disabled={state.busy}
                  onClick={() => state.download(doc)}
                >
                  Baixar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
