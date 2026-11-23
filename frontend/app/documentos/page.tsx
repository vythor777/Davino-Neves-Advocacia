'use client';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { PdfUpload } from '@/components/PdfUpload';
import { ConfirmModal } from '@/components/ConfirmModal';
import { ClientPicker, ProcessPicker } from '@/components/ui/EntityPicker';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { documentLink } from '@/utils/document-link';
import AuthGuard from '@/components/AuthGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePermissions } from '@/hooks/usePermissions';
import { useDocuments } from '@/hooks/useDocuments';
import { documentoService, documentDeletionBatchSize, saveDocumentBlob, type Documento } from '@/services/documentoService';
import { processoService, type Processo } from '@/services/processoService';
import { clienteService, type Cliente } from '@/services/clienteService';
import { toast } from 'sonner';
const button = 'rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-700 active:scale-95 disabled:opacity-50';
const canDeleteDocument = (document: Documento) =>
  ['DISPONIVEL', 'ARQUIVADO', 'EXCLUINDO'].includes(document.situacao);

export default function DocumentosPage() {
  return <AuthGuard><DocumentosContent /></AuthGuard>;
}

function DocumentosContent() {
  const { admin, canManageDeadline } = usePermissions();
  const { documents, usage, loading, error, reload, run } = useDocuments();
  const [processes, setProcesses] = useState<Processo[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [processId, setProcessId] = useState(''); const [clientId, setClientId] = useState('');
  const [processFilter, setProcessFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [selected, setSelected] = useState<number[]>([]); const [busy, setBusy] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Documento | null>(null); const [confirmed, setConfirmed] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<Documento[]>([]);
  const [deletionProgress, setDeletionProgress] = useState(0);
  useEffect(() => { void Promise.all([processoService.getAll(), clienteService.getAll()]).then(([p, c]) => { setProcesses(p); setClients(c); }).catch(() => toast.error('Não foi possível carregar os vínculos.')); }, []);
  const processClients = useMemo(() => new Map(processes.map(process => [process.id_processo, process.id_cliente])), [processes]);
  const hasFilter = !!(processFilter || clientFilter);
  const visibleDocuments = documents.filter(document => {
    if (processFilter && document.id_processo !== Number(processFilter)) return false;
    if (!clientFilter) return true;
    const id = Number(clientFilter);
    return document.id_cliente === id || (document.id_processo !== null && processClients.get(document.id_processo) === id);
  });
  const action = (fn: () => Promise<void>) => { setBusy(true); void run(fn).finally(() => setBusy(false)); };
  const selectable = visibleDocuments.filter(canDeleteDocument);
  const selectedIds = new Set(selected);
  const selectedDocuments = selectable.filter(document => selectedIds.has(document.id_documento));
  const allSelected = selectable.length > 0 && selectedDocuments.length === selectable.length;
  const canBackup = selectedDocuments.length > 0 && selectedDocuments.length <= 8
    && selectedDocuments.every(document => document.situacao === 'DISPONIVEL');

  async function deleteDocuments() {
    const ids = deleteTargets.map(document => document.id_documento);
    const completed = new Set<number>();
    let deleted = 0;
    let failureMessage = '';
    setBusy(true);
    setDeletionProgress(0);
    try {
      for (let start = 0; start < ids.length; start += documentDeletionBatchSize) {
        const batch = ids.slice(start, start + documentDeletionBatchSize);
        if (ids.length === 1) {
          await documentoService.delete(batch[0]);
          completed.add(batch[0]);
          deleted++;
        } else {
          const result = await documentoService.deleteBatch(batch);
          result.excluidos.forEach(document => completed.add(document.id_documento));
          result.ausentes.forEach(id => completed.add(id));
          deleted += result.excluidos.length;
          failureMessage ||= result.falhas[0]?.mensagem || '';
        }
        setDeletionProgress(start + batch.length);
      }
    } catch (error) {
      if (ids.length === 1 && (error as { status?: number } | null)?.status === 404) {
        completed.add(ids[0]);
      } else {
        failureMessage = error instanceof Error ? error.message : 'Não foi possível concluir a exclusão.';
      }
    } finally {
      const pending = ids.filter(id => !completed.has(id));
      setDeleteTargets([]);
      setSelected(previous => [...new Set([
        ...previous.filter(id => !completed.has(id)),
        ...pending,
      ])]);
      if (deleted) toast.success(deleted === 1 ? '1 documento excluído.' : `${deleted} documentos excluídos.`);
      if (pending.length) {
        toast.error(pending.length === 1 ? '1 documento ficou pendente.' : `${pending.length} documentos ficaram pendentes.`, {
          description: failureMessage || 'Selecione os documentos pendentes para tentar novamente.',
        });
      } else if (!deleted) {
        toast.info('Os documentos selecionados já haviam sido removidos.');
      }
      await reload();
      setBusy(false);
      setDeletionProgress(0);
    }
  }

  return <main className="min-w-0 w-full max-w-full space-y-6 p-4 sm:p-6 text-slate-800 dark:text-slate-200">
    <PageHeader title="Documentos" description="Documentos do escritório, clientes e processos. PDFs de até 5 MB." />
    {usage && <section className="min-w-0 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 p-4" aria-label="Uso do armazenamento">
      <p>{(usage.usado / 1e6).toFixed(1)} MB de {(usage.limite / 1e6).toFixed(0)} MB reservados ({usage.percentual}%)</p>
      <div role="progressbar" aria-label="Espaço utilizado" aria-valuenow={usage.usado} aria-valuemin={0} aria-valuemax={usage.limite} className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${Math.min(100, Math.max(0, usage.usado / usage.limite * 100))}%` }} /></div>
      {usage.alerta !== 'NORMAL' && <p role="status">Espaço próximo do limite. O administrador pode baixar e conferir backups antes de arquivar.</p>}
    </section>}
    <section aria-labelledby="document-filter-title" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <h2 id="document-filter-title" className="font-semibold">Filtrar documentos</h2>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="space-y-2 text-sm">
          <label htmlFor="document-list-client" className="font-medium">Filtrar por cliente</label>
          <ClientPicker id="document-list-client" clients={clients} value={clientFilter} emptyLabel="Todos os clientes"
            onChange={id => { setClientFilter(id); setSelected([]); }} />
        </div>
        <div className="space-y-2 text-sm">
          <label htmlFor="document-list-process" className="font-medium">Filtrar por processo</label>
          <ProcessPicker id="document-list-process" processes={processes} value={processFilter} emptyLabel="Todos os processos"
            onChange={id => { setProcessFilter(id); setSelected([]); }} />
        </div>
      </div>
      {hasFilter && <button type="button" className={button} onClick={() => { setClientFilter(''); setProcessFilter(''); setSelected([]); }}>Limpar filtros</button>}
    </section>
    {(admin || canManageDeadline) && <section className="space-y-3 min-w-0 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 p-4">
      <h2 className="font-semibold">Enviar documento</h2>
      <div className="space-y-2 text-sm">
        <label htmlFor="documento-processo" className="font-medium">Processo</label>
        <ProcessPicker id="documento-processo" value={processId} processes={processes} emptyLabel="Sem processo"
          onChange={(id) => { setProcessId(id); setClientId(''); }} />
      </div>
      {!processId && <div className="space-y-2 text-sm">
        <label htmlFor="documento-cliente" className="font-medium">Cliente</label>
        <ClientPicker id="documento-cliente" value={clientId} clients={clients} onChange={setClientId}
          emptyLabel={admin ? 'Documento geral do escritório (administrador)' : undefined} />
      </div>}
      <PdfUpload
        processId={Number(processId) || undefined}
        clientId={Number(clientId) || undefined}
        disabled={!admin && !processId && !clientId}
        onUploaded={reload}
      />
    </section>}
    {error && <div role="alert">{error} <button className={button} onClick={() => void reload()}>Tentar novamente</button></div>}
    {admin && <div className="flex flex-wrap items-center gap-2" aria-label="Ações dos documentos">
      <button type="button" className={button} disabled={busy || loading || !selectable.length}
        onClick={() => setSelected(allSelected ? [] : selectable.map(document => document.id_documento))}>
        {allSelected ? 'Limpar seleção' : 'Selecionar todos os exibidos'}
      </button>
      <button type="button" className={button} disabled={busy || loading || !canBackup} onClick={() => action(async () => {
        saveDocumentBlob(await documentoService.backup(selectedDocuments.map(document => document.id_documento)), 'Davino-Neves-backup-documentos.zip');
        toast.success('Backup baixado. Abra o ZIP e confira os PDFs e o manifesto antes de arquivar.');
      })}>Baixar backup selecionado</button>
      <button type="button" className={`${button} text-rose-700 dark:text-rose-400`} disabled={busy || loading || !selectedDocuments.length}
        onClick={() => setDeleteTargets(selectedDocuments)}>
        Excluir selecionados ({selectedDocuments.length})
      </button>
      {selectedDocuments.length > 0 && !canBackup && (
        <p className="basis-full text-sm text-slate-500 dark:text-slate-400">Para baixar um backup, selecione até 8 documentos disponíveis.</p>
      )}
    </div>}
    {loading ? <div aria-label="Carregando documentos" className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded bg-slate-200 dark:bg-slate-800" />)}</div> : <ul className="space-y-3">{visibleDocuments.map(d => <li key={d.id_documento} className="flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 p-4">
      <div className="flex w-full min-w-0 items-start gap-3">
        {admin && canDeleteDocument(d) && (
          <input type="checkbox" aria-label={`Selecionar ${d.nome_arquivo}`} checked={selectedIds.has(d.id_documento)} disabled={busy}
            onChange={event => {
              const checked = event.target.checked;
              setSelected(previous => checked ? [...previous, d.id_documento] : previous.filter(id => id !== d.id_documento));
            }} />
        )}
      <div className="min-w-0 flex-1"><p className="break-all font-medium">{d.nome_arquivo}</p><p className="text-sm">{(d.tamanho_bytes / 1e6).toFixed(2)} MB · {d.situacao} · {new Date(d.data_upload).toLocaleDateString('pt-BR')}</p><p className="text-sm">{documentLink(d, processes, clients).href ? <Link className="text-blue-700 underline hover:text-blue-900 focus-visible:ring-2 active:opacity-80 dark:text-blue-300" href={documentLink(d, processes, clients).href!}>{documentLink(d, processes, clients).label}</Link> : documentLink(d, processes, clients).label}</p></div></div>
      <div className="flex flex-wrap gap-2">
        {d.situacao === 'DISPONIVEL' && <>
          <button type="button" className={button} disabled={busy} onClick={() => action(async () => saveDocumentBlob(await documentoService.download(d.id_documento), d.nome_arquivo))}>Baixar PDF</button>
          {admin && <button type="button" className={button} disabled={busy} onClick={() => { setArchiveTarget(d); setConfirmed(false); }}>Arquivar após backup</button>}
        </>}
        {admin && canDeleteDocument(d) && (
          <button type="button" className={`${button} text-rose-700 dark:text-rose-400`} disabled={busy}
            onClick={() => setDeleteTargets([d])} aria-label={`Excluir ${d.nome_arquivo}`}>Excluir</button>
        )}
      </div>
    </li>)}{!visibleDocuments.length && <li>{hasFilter ? 'Nenhum documento corresponde aos filtros.' : 'Nenhum documento cadastrado.'}</li>}</ul>}
    {archiveTarget && (
      <Dialog open onClose={() => setArchiveTarget(null)} className="fixed inset-0 z-50 grid grid-rows-[minmax(0,1fr)] place-items-center bg-slate-950/60 p-4">
        <DialogPanel className="max-h-full w-full max-w-lg space-y-4 overflow-y-auto overscroll-contain rounded-xl bg-white p-6 dark:bg-slate-900">
          <DialogTitle as="h2" className="break-words font-semibold">Arquivar {archiveTarget.nome_arquivo}</DialogTitle>
          <p>O PDF será removido da nuvem. O histórico e a identificação serão preservados. Abra o backup local e confira a integridade pelo SHA-256 do manifesto.</p>
          <p className="break-all text-xs">SHA-256: {archiveTarget.sha256}</p>
          <label className="flex gap-2">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
            Baixei, abri e conferi o backup local deste documento.
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" data-autofocus className={button} onClick={() => setArchiveTarget(null)}>Cancelar</button>
            <button
              type="button"
              className={button}
              disabled={busy || !confirmed || !archiveTarget.sha256}
              onClick={() => action(async () => {
                await documentoService.archive(archiveTarget.id_documento, archiveTarget.sha256!);
                setArchiveTarget(null);
                setSelected([]);
                toast.success('Documento arquivado; histórico preservado.');
                await reload();
              })}
            >
              Confirmar arquivamento
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    )}
    <ConfirmModal
      isOpen={deleteTargets.length > 0}
      isLoading={busy}
      onClose={() => setDeleteTargets([])}
      title={deleteTargets.length === 1 ? 'Excluir documento' : 'Excluir documentos selecionados'}
      description={deleteTargets.length === 1
        ? `“${deleteTargets[0].nome_arquivo}” será excluído definitivamente do sistema e do armazenamento.`
        : `${deleteTargets.length} documentos serão excluídos definitivamente do sistema e do armazenamento.`}
      confirmLabel="Excluir definitivamente"
      onConfirm={() => void deleteDocuments()}
    >
      {deleteTargets.length > 1 && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
          {deleteTargets.slice(0, 5).map(document => (
            <li key={document.id_documento} className="break-all">{document.nome_arquivo}</li>
          ))}
          {deleteTargets.length > 5 && <li>Mais {deleteTargets.length - 5} documentos.</li>}
        </ul>
      )}
      {busy && deleteTargets.length > 1 && (
        <p role="status" className="mt-4 text-sm">{deletionProgress} de {deleteTargets.length} processados.</p>
      )}
    </ConfirmModal>
  </main>;
}
