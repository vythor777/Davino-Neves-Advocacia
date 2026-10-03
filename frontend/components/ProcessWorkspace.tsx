'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { prazoService, type Prazo } from '@/services/prazoService';
import { documentoService, saveDocumentBlob, type Documento } from '@/services/documentoService';
import api from '@/services/api';
import { datajudService, type MovimentoDataJud } from '@/services/datajudService';
import type { LancamentoFinanceiro } from '@/services/financeiroService';
import type { Processo } from '@/services/processoService';
import { ProcessTimeline } from '@/components/ProcessTimeline';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
export function ProcessWorkspace({ process }: { process: Processo }) {
  const { canAccessFinance } = usePermissions();
  const [tab, setTab] = useState('Prazos');
  const [deadlines, setDeadlines] = useState<Prazo[]>([]); const [documents, setDocuments] = useState<Documento[]>([]);
  const [finance, setFinance] = useState<LancamentoFinanceiro[]>([]); const [moves, setMoves] = useState<MovimentoDataJud[]>([]);
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    const load = async () => {
      try {
        if (tab === 'Prazos') { const rows = await prazoService.getAll(); if (active) setDeadlines(rows.filter(r => r.id_processo === process.id_processo)); }
        if (tab === 'Documentos') { const rows = await documentoService.list(process.id_processo); if (active) setDocuments(rows); }
        if (tab === 'Honorários' && canAccessFinance) { const { data } = await api.get<LancamentoFinanceiro[]>('/financeiro/lancamentos'); if (active) setFinance(data.filter(r => r.processoId === process.id_processo)); }
        if (tab === 'Movimentações') { const data = await datajudService.consultarPorNumero(process.numero_processo); if (active) setMoves(data.movimentos); }
      } catch { if (active) setError('Não foi possível carregar esta seção. Tente novamente selecionando a aba.'); }
      finally { if (active) setLoading(false); }
    }; void load(); return () => { active = false; };
  }, [tab, process.id_processo, process.numero_processo, canAccessFinance]);
  const tabs = ['Prazos', 'Movimentações', 'Documentos', ...(canAccessFinance ? ['Honorários'] : [])];
  return <section className="space-y-3">
    <div role="tablist" aria-label="Informações vinculadas ao processo" className="flex flex-wrap gap-2">{tabs.map(name => <button key={name} role="tab" id={'process-tab-' + name} aria-selected={tab === name} aria-controls="process-panel" onClick={() => setTab(name)} className={'rounded-lg border px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-700 active:scale-95 ' + (tab === name ? 'border-blue-700 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700')}>{name}</button>)}</div>
    <div role="tabpanel" id="process-panel" aria-labelledby={'process-tab-' + tab}>
      {loading ? <div aria-label="Carregando seção" className="h-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /> : error ? <p role="alert">{error}</p> : <>
        {tab === 'Prazos' && <ul className="space-y-2">{deadlines.map(d => <li key={d.id_prazo}>{d.descricao} · {d.data_vencimento.slice(0,10).split('-').reverse().join('/')} · {d.status}<br />Responsável: {d.responsavel || 'Não definido'}<br />{!process.id_responsavel && <span className="text-amber-700">O processo está sem advogado responsável.</span>}</li>)}{!deadlines.length && <li>Nenhum prazo vinculado.</li>}<li><Link href="/prazos" className="underline hover:text-blue-700 focus-visible:ring-2 active:opacity-80">Gerenciar prazos</Link></li></ul>}
        {tab === 'Movimentações' && <ProcessTimeline movimentacoes={moves} />}
        {tab === 'Documentos' && <ul className="space-y-2">{documents.map(d => <li key={d.id_documento}>{d.nome_arquivo} · {d.situacao} {d.situacao === 'DISPONIVEL' && <button className="underline hover:text-blue-700 focus-visible:ring-2 active:opacity-80" onClick={() => void documentoService.download(d.id_documento).then(blob => saveDocumentBlob(blob, d.nome_arquivo)).catch(() => toast.error('Não foi possível baixar o documento.'))}>Baixar</button>}</li>)}{!documents.length && <li>Nenhum documento vinculado.</li>}<li><Link href="/documentos" className="underline hover:text-blue-700 focus-visible:ring-2 active:opacity-80">Gerenciar documentos</Link></li></ul>}
        {tab === 'Honorários' && canAccessFinance && <ul>{finance.map(f => <li key={f.id}>{f.descricao} · {Number(f.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · {f.status}</li>)}{!finance.length && <li>Nenhum lançamento vinculado.</li>}</ul>}
      </>}
    </div>
  </section>;
}
