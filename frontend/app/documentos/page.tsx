'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { documentLink } from '@/utils/document-link';
import AuthGuard from '@/components/AuthGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePermissions } from '@/hooks/usePermissions';
import { useDocuments } from '@/hooks/useDocuments';
import { documentoService, saveDocumentBlob, type Documento } from '@/services/documentoService';
import { processoService, type Processo } from '@/services/processoService';
import { clienteService, type Cliente } from '@/services/clienteService';
import { toast } from 'sonner';
const button = 'rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-700 active:scale-95 disabled:opacity-50';
export default function DocumentosPage() {
  return <AuthGuard><DocumentosContent /></AuthGuard>;
}

function DocumentosContent() {
  const { admin, canManageDeadline } = usePermissions();
  const { documents, usage, loading, error, reload, run } = useDocuments();
  const [file, setFile] = useState<File | null>(null);
  const [processes, setProcesses] = useState<Processo[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [processId, setProcessId] = useState(''); const [clientId, setClientId] = useState('');
  const [selected, setSelected] = useState<number[]>([]); const [busy, setBusy] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Documento | null>(null); const [confirmed, setConfirmed] = useState(false);
  useEffect(() => { void Promise.all([processoService.getAll(), clienteService.getAll()]).then(([p, c]) => { setProcesses(p); setClients(c); }).catch(() => toast.error('Não foi possível carregar os vínculos.')); }, []);
  const action = (fn: () => Promise<void>) => { setBusy(true); void run(fn).finally(() => setBusy(false)); };
  return <main className="min-w-0 w-full max-w-full space-y-6 p-4 sm:p-6 text-slate-800 dark:text-slate-200">
    <PageHeader title="Documentos" description="Documentos do escritório, clientes e processos. PDFs de até 5 MB." />
    {usage && <section className="min-w-0 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 p-4" aria-label="Uso do armazenamento">
      <p>{(usage.usado / 1e6).toFixed(1)} MB de {(usage.limite / 1e6).toFixed(0)} MB reservados ({usage.percentual}%)</p>
      <div role="progressbar" aria-label="Espaço utilizado" aria-valuenow={usage.usado} aria-valuemin={0} aria-valuemax={usage.limite} className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${Math.min(100, Math.max(0, usage.usado / usage.limite * 100))}%` }} /></div>
      {usage.alerta !== 'NORMAL' && <p role="status">Espaço próximo do limite. O administrador pode baixar e conferir backups antes de arquivar.</p>}
    </section>}
    {(admin || canManageDeadline) && <section className="space-y-3 min-w-0 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 p-4">
      <h2 className="font-semibold">Enviar documento</h2>
      <label className="block space-y-2 text-sm font-medium">Processo <select aria-label="Processo" value={processId} onChange={e => { setProcessId(e.target.value); setClientId(''); }} className="block w-full min-w-0 rounded-lg border border-slate-200 p-2.5 bg-white dark:bg-slate-900 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-blue-700"><option value="">Sem processo</option>{processes.map(p => <option key={p.id_processo} value={p.id_processo}>{p.titulo}</option>)}</select></label>
      {!processId && <label className="block space-y-2 text-sm font-medium">Cliente <select aria-label="Cliente" value={clientId} onChange={e => setClientId(e.target.value)} className="block w-full min-w-0 rounded-lg border border-slate-200 p-2.5 bg-white dark:bg-slate-900 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-blue-700"><option value="">Documento geral do escritório (administrador)</option>{clients.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nome}</option>)}</select></label>}
      <label className="block">PDF <input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={e => { const next = e.target.files?.[0] || null; if (next && next.size > 20e6) { toast.warning('Para otimização, o arquivo deve ter até 20 MB.'); setFile(null); return; } setFile(next); }} className="block mt-2 w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-800 dark:file:bg-slate-800 dark:file:text-slate-200" /></label>
      {file && <p className="break-all text-sm">{file.name} - {(file.size / 1e6).toFixed(2)} MB {file.size > 5e6 && '(Acima do limite: otimize antes de enviar)'}</p>}
      <div className="flex flex-wrap gap-2"><button className={button} disabled={busy || !file || file.size > 5e6 || (!admin && !processId && !clientId)} onClick={() => action(async () => { if (!file) return; await documentoService.upload(file, Number(processId) || undefined, Number(clientId) || undefined); setFile(null); toast.success('Documento armazenado.'); await reload(); })}>Enviar PDF</button>
        <button className={button} disabled={busy || !file} onClick={() => action(async () => { if (!file) return; const blob = await documentoService.compress(file); setFile(new File([blob], file.name, { type: 'application/pdf' })); toast.success('PDF otimizado. Confira o arquivo antes de enviar.'); saveDocumentBlob(blob, 'otimizado-' + file.name); })}>Otimizar PDF sem perda</button></div>
      <p className="text-sm text-slate-500">A otimização não garante redução a 5 MB. PDFs assinados não são alterados. Se continuar grande, divida o arquivo ou reduza as imagens.</p>
    </section>}
    {error && <div role="alert">{error} <button className={button} onClick={() => void reload()}>Tentar novamente</button></div>}
    {admin && <button className={button} disabled={busy || !selected.length} onClick={() => action(async () => { saveDocumentBlob(await documentoService.backup(selected), 'Davino-Neves-backup-documentos.zip'); toast.success('Backup baixado. Abra o ZIP e confira os PDFs e o manifesto antes de arquivar.'); })}>Baixar backup selecionado ({selected.length}/8)</button>}
    {loading ? <div aria-label="Carregando documentos" className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded bg-slate-200 dark:bg-slate-800" />)}</div> : <ul className="space-y-3">{documents.map(d => <li key={d.id_documento} className="flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 p-4">
      <div className="flex w-full min-w-0 items-start gap-3">{admin && d.situacao === 'DISPONIVEL' && <input type="checkbox" aria-label={'Selecionar ' + d.nome_arquivo} checked={selected.includes(d.id_documento)} onChange={e => { if (e.target.checked && selected.length >= 8) { toast.warning('Selecione até 8 PDFs por lote de backup.'); return; } setSelected(e.target.checked ? [...selected, d.id_documento] : selected.filter(id => id !== d.id_documento)); }} />}
      <div className="min-w-0 flex-1"><p className="break-all font-medium">{d.nome_arquivo}</p><p className="text-sm">{(d.tamanho_bytes / 1e6).toFixed(2)} MB · {d.situacao} · {new Date(d.data_upload).toLocaleDateString('pt-BR')}</p><p className="text-sm">{documentLink(d, processes, clients).href ? <Link className="text-blue-700 underline hover:text-blue-900 focus-visible:ring-2 active:opacity-80 dark:text-blue-300" href={documentLink(d, processes, clients).href!}>{documentLink(d, processes, clients).label}</Link> : documentLink(d, processes, clients).label}</p></div></div>
      {d.situacao === 'DISPONIVEL' && <div className="flex flex-wrap gap-2"><button className={button} disabled={busy} onClick={() => action(async () => saveDocumentBlob(await documentoService.download(d.id_documento), d.nome_arquivo))}>Baixar PDF</button>{admin && <button className={button} disabled={busy} onClick={() => { setArchiveTarget(d); setConfirmed(false); }}>Arquivar após backup</button>}</div>}
    </li>)}{!documents.length && <li>Nenhum documento cadastrado.</li>}</ul>}
    {archiveTarget && <section role="dialog" aria-modal="true" aria-label="Conferir backup antes de arquivar" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="max-w-lg rounded-xl bg-white dark:bg-slate-900 p-6 space-y-4">
      <h2 className="font-semibold">Arquivar {archiveTarget.nome_arquivo}</h2><p>O PDF será removido da nuvem. O histórico e a identificação serão preservados. Abra o backup local e confira a integridade pelo SHA-256 do manifesto.</p><p className="break-all text-xs">SHA-256: {archiveTarget.sha256}</p>
      <label className="flex gap-2"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Baixei, abri e conferi o backup local deste documento.</label>
      <button className={button} onClick={() => setArchiveTarget(null)}>Cancelar</button> <button className={button} disabled={busy || !confirmed || !archiveTarget.sha256} onClick={() => action(async () => { await documentoService.archive(archiveTarget.id_documento, archiveTarget.sha256!); setArchiveTarget(null); setSelected([]); toast.success('Documento arquivado; histórico preservado.'); await reload(); })}>Confirmar arquivamento</button>
    </div></section>}
  </main>;
}
