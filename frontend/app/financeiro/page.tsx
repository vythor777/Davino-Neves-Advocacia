'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { EmptyState } from '@/components/EmptyState';
import {
  financeiroService,
  LancamentoFinanceiro,
  CreateLancamentoInput,
  ResumoFinanceiroResponse,
  TipoLancamento,
  StatusLancamento,
  CATEGORIAS_LABELS,
} from '@/services/financeiroService';
import { clienteService, Cliente } from '@/services/clienteService';
import { processoService, Processo } from '@/services/processoService';
import { FinancialMetricsCards } from '@/components/financeiro/FinancialMetricsCards';
import { FinancialChartsView } from '@/components/financeiro/FinancialChartsView';
import { LancamentoModal } from '@/components/financeiro/LancamentoModal';
import { LancamentoDetailModal } from '@/components/financeiro/LancamentoDetailModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  DollarSign,
  Plus,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Trash2,
  Edit,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  User,
  Scale,
} from 'lucide-react';
import { toast } from 'sonner';

type TabType = 'EXTRATO' | 'RECEBER' | 'PAGAR' | 'DRE';

export default function FinanceiroPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          </div>
        }
      >
        <FinanceiroContent />
      </Suspense>
    </AuthGuard>
  );
}

function FinanceiroContent() {
  const searchParams = useSearchParams();

  // Estados principais
  const [activeTab, setActiveTab] = useState<TabType>('EXTRATO');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [resumoData, setResumoData] = useState<ResumoFinanceiroResponse | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);

  // Filtros
  const [mesFiltro, setMesFiltro] = useState<string>('2026-09');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('TODOS');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<LancamentoFinanceiro | null>(null);
  const [selectedLancamento, setSelectedLancamento] = useState<LancamentoFinanceiro | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalDefaultTipo, setModalDefaultTipo] = useState<TipoLancamento>('RECEITA');

  // Abrir modal automaticamente se ?novo=true
  useEffect(() => {
    if (searchParams.get('novo') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Carregar dados
  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const [lancRes, resRes, cliRes, procRes] = await Promise.allSettled([
        financeiroService.getAll({
          mes: mesFiltro !== 'TODOS' ? mesFiltro : undefined,
        }),
        financeiroService.getResumo(
          mesFiltro !== 'TODOS' ? mesFiltro : undefined,
        ),
        clienteService.getAll(),
        processoService.getAll(),
      ]);

      if (lancRes.status === 'fulfilled') {
        setLancamentos(lancRes.value || []);
      }
      if (resRes.status === 'fulfilled') {
        setResumoData(resRes.value);
      }
      if (cliRes.status === 'fulfilled') {
        setClientes(cliRes.value || []);
      }
      if (procRes.status === 'fulfilled') {
        setProcessos(procRes.value || []);
      }
    } catch (err) {
      console.error('Erro ao carregar módulo financeiro:', err);
      toast.error('Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mesFiltro]);

  // Handlers de Ações
  const handleCreateOrUpdate = async (data: CreateLancamentoInput) => {
    try {
      if (editingLancamento) {
        const updated = await financeiroService.update(editingLancamento.id, data);
        setLancamentos((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        toast.success('Lançamento financeiro atualizado com sucesso!');
      } else {
        const created = await financeiroService.create(data);
        setLancamentos((prev) => [created, ...prev]);
        toast.success('Lançamento financeiro cadastrado com sucesso!');
      }
      await loadData(false);
    } catch (err: unknown) {
      console.error('Erro ao salvar lançamento:', err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Falha ao salvar lançamento.');
      }
      throw err;
    }
  };

  const handleToggleStatus = async (id: string, newStatus: StatusLancamento) => {
    try {
      const updated = await financeiroService.update(id, {
        status: newStatus,
        dataPagamento: newStatus === 'PAGO' ? new Date().toISOString().split('T')[0] : null,
      });

      setLancamentos((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );

      if (selectedLancamento && selectedLancamento.id === id) {
        setSelectedLancamento(updated);
      }

      toast.success(
        newStatus === 'PAGO'
          ? 'Lançamento liquidado com sucesso!'
          : 'Lançamento revertido para pendente.',
      );
      await loadData(false);
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      toast.error('Erro ao atualizar status do lançamento.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await financeiroService.delete(deleteTargetId);
      setLancamentos((prev) => prev.filter((item) => item.id !== deleteTargetId));
      if (selectedLancamento?.id === deleteTargetId) {
        setIsDetailOpen(false);
        setSelectedLancamento(null);
      }
      toast.success('Lançamento excluído com sucesso.');
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      await loadData(false);
    } catch (err) {
      console.error('Erro ao excluir lançamento:', err);
      toast.error('Erro ao excluir lançamento.');
    }
  };

  const handleExportCSV = () => {
    if (filteredLancamentos.length === 0) {
      toast.warning('Nenhum lançamento para exportar.');
      return;
    }

    const headers = 'ID,Data Vencimento,Descrição,Tipo,Categoria,Valor (R$),Status,Forma Pagamento,Cliente,Processo\n';
    const rows = filteredLancamentos
      .map((l) => {
        const desc = `"${l.descricao.replace(/"/g, '""')}"`;
        const cli = l.cliente ? `"${l.cliente.nome}"` : '""';
        const proc = l.processo ? `"${l.processo.numero_processo}"` : '""';
        const val = Number(l.valor).toFixed(2);
        return `${l.id},${l.dataVencimento.split('T')[0]},${desc},${l.tipo},${l.categoria},${val},${l.status},"${l.formaPagamento || ''}",${cli},${proc}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro_davino_neves_${mesFiltro}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Demonstrativo financeiro exportado em CSV!');
  };

  // Filtragem dinâmica de registros na aba atual
  const filteredLancamentos = useMemo(() => {
    return lancamentos.filter((item) => {
      // Filtro por Aba
      if (activeTab === 'RECEBER' && item.tipo !== 'RECEITA') return false;
      if (activeTab === 'PAGAR' && item.tipo !== 'DESPESA') return false;

      // Filtro por Status
      if (statusFiltro !== 'TODOS' && item.status !== statusFiltro) return false;

      // Filtro por Categoria
      if (categoriaFiltro !== 'TODAS' && item.categoria !== categoriaFiltro) return false;

      // Busca textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDesc = item.descricao.toLowerCase().includes(q);
        const matchObs = item.observacoes?.toLowerCase().includes(q) || false;
        const matchCli = item.cliente?.nome.toLowerCase().includes(q) || false;
        const matchProc = item.processo?.numero_processo.toLowerCase().includes(q) || false;
        if (!matchDesc && !matchObs && !matchCli && !matchProc) return false;
      }

      return true;
    });
  }, [lancamentos, activeTab, statusFiltro, categoriaFiltro, searchQuery]);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const formatData = (dataStr?: string | null) => {
    if (!dataStr) return '-';
    const [ano, mes, dia] = dataStr.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/' },
          { label: 'Gestão Financeira' },
        ]}
      />

      {/* Header Principal da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gestão Financeira & DRE
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Controle de honorários, conciliação bancária, contas a pagar/receber e auditoria contábil
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação do Topo */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Período / Mês */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3 py-2 text-xs shadow-2xs">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="2026-09">Setembro / 2026 (Mês Atual)</option>
              <option value="2026-08">Agosto / 2026</option>
              <option value="2026-07">Julho / 2026</option>
              <option value="2026">Ano 2026 Completo</option>
              <option value="TODOS">Todo o Histórico</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => loadData(false)}
            disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
            title="Atualizar dados financeiros"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingLancamento(null);
              setModalDefaultTipo(activeTab === 'PAGAR' ? 'DESPESA' : 'RECEITA');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Grid de Métricas em Cards */}
      <FinancialMetricsCards data={resumoData} loading={loading} />

      {/* Navegação por Abas Segmentadas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('EXTRATO')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'EXTRATO'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Extrato Geral</span>
            <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-bold">
              {lancamentos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RECEBER')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'RECEBER'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            <span>Contas a Receber</span>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 text-[10px] font-bold">
              {lancamentos.filter((l) => l.tipo === 'RECEITA').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PAGAR')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'PAGAR'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
            <span>Contas a Pagar</span>
            <span className="rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 px-1.5 py-0.2 text-[10px] font-bold">
              {lancamentos.filter((l) => l.tipo === 'DESPESA').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DRE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'DRE'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Demonstrativo & DRE</span>
          </button>
        </div>

        {/* Indicador de Resumo Rápido da Aba */}
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Exibindo{' '}
          <strong className="text-slate-900 dark:text-white">
            {filteredLancamentos.length}
          </strong>{' '}
          lançamentos no período
        </div>
      </div>

      {/* Conteúdo da Aba: DRE vs Tabelas */}
      {activeTab === 'DRE' ? (
        <FinancialChartsView data={resumoData} />
      ) : (
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="astrea-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por descrição, cliente, número de processo ou nota..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filtros Auxiliares */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro Status */}
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-hidden transition cursor-pointer shadow-2xs"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="PENDENTE">Apenas Pendentes</option>
                <option value="PAGO">Apenas Pagos</option>
                <option value="ATRASADO">Apenas em Atraso</option>
              </select>

              {/* Filtro Categoria */}
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-hidden transition cursor-pointer shadow-2xs"
              >
                <option value="TODAS">Todas as Categorias</option>
                <option value="HONORARIO_CONTRATUAL">Honorário Contratual</option>
                <option value="HONORARIO_EXITO">Honorário de Êxito</option>
                <option value="CONSULTIVO">Consultivo & Pareceres</option>
                <option value="CUSTAS_PROCESSUAIS">Custas & Diligências</option>
                <option value="OPERACIONAL">Operacional & Software</option>
                <option value="IMPOSTOS">Impostos & Tributos</option>
              </select>
            </div>
          </div>

          {/* Tabela de Lançamentos */}
          <div className="astrea-card overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredLancamentos.length === 0 ? (
              <div className="py-12 px-4">
                <EmptyState
                  icon={DollarSign}
                  title="Nenhum lançamento financeiro encontrado"
                  description={
                    searchQuery || statusFiltro !== 'TODOS' || categoriaFiltro !== 'TODAS'
                      ? 'Nenhum resultado corresponde aos filtros selecionados. Tente ajustar os termos de busca.'
                      : 'Não há movimentações financeiras registradas neste período.'
                  }
                  action={{
                    label: '+ Novo Lançamento',
                    onClick: () => {
                      setEditingLancamento(null);
                      setModalDefaultTipo(activeTab === 'PAGAR' ? 'DESPESA' : 'RECEITA');
                      setIsModalOpen(true);
                    },
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3 px-4">Vencimento</th>
                      <th className="py-3 px-4">Descrição & Detalhes</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Vínculo Jurídico</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {filteredLancamentos.map((item) => {
                      const isReceita = item.tipo === 'RECEITA';
                      const categoriaInfo = CATEGORIAS_LABELS[item.categoria] || {
                        label: item.categoria,
                        badgeClass: 'bg-slate-100 text-slate-800',
                      };

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition group"
                        >
                          {/* Data de Vencimento */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {formatData(item.dataVencimento)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              #{item.id.slice(-5)}
                            </div>
                          </td>

                          {/* Descrição */}
                          <td className="py-3.5 px-4">
                            <div
                              onClick={() => {
                                setSelectedLancamento(item);
                                setIsDetailOpen(true);
                              }}
                              className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-1 transition-colors"
                            >
                              {item.descricao}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{item.formaPagamento || 'Não informado'}</span>
                              {item.observacoes && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[220px] text-slate-400">
                                    {item.observacoes}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Categoria */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${categoriaInfo.badgeClass}`}
                            >
                              {categoriaInfo.label}
                            </span>
                          </td>

                          {/* Vínculo Jurídico (Cliente / Processo) */}
                          <td className="py-3.5 px-4">
                            {item.cliente ? (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">
                                <User className="h-3 w-3 text-blue-500 shrink-0" />
                                <span className="truncate">{item.cliente.nome}</span>
                              </div>
                            ) : item.processo ? (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-mono truncate max-w-[180px]">
                                <Scale className="h-3 w-3 text-indigo-500 shrink-0" />
                                <span className="truncate">{item.processo.numero_processo}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Geral / Sem vínculo</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {item.status === 'PAGO' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.id, 'PENDENTE')}
                                title="Clique para reverter para pendente"
                                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-200 transition cursor-pointer"
                              >
                                <CheckCircle2 className="h-3 w-3" /> Liquidado
                              </button>
                            ) : item.status === 'ATRASADO' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.id, 'PAGO')}
                                title="Clique para liquidar / marcar como pago"
                                className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 px-2.5 py-1 text-[10px] font-bold border border-rose-300 dark:border-rose-800/60 hover:bg-rose-200 transition cursor-pointer"
                              >
                                <AlertTriangle className="h-3 w-3" /> Atrasado
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.id, 'PAGO')}
                                title="Clique para liquidar / marcar como pago"
                                className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2.5 py-1 text-[10px] font-bold border border-amber-300 dark:border-amber-800/60 hover:bg-amber-200 transition cursor-pointer"
                              >
                                <Clock className="h-3 w-3" /> Pendente
                              </button>
                            )}
                          </td>

                          {/* Valor */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <span
                              className={`font-extrabold text-sm ${
                                isReceita
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isReceita ? '+ ' : '- '}
                              {formatBRL(Number(item.valor))}
                            </span>
                          </td>

                          {/* Ações */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLancamento(item);
                                  setIsDetailOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                                title="Ver comprovante detalhado"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLancamento(item);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                                title="Editar lançamento"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTargetId(item.id);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                title="Excluir lançamento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      <LancamentoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLancamento(null);
        }}
        onSave={handleCreateOrUpdate}
        initialData={editingLancamento}
        clientes={clientes}
        processos={processos}
        defaultTipo={modalDefaultTipo}
      />

      {/* Modal de Detalhes / Comprovante */}
      <LancamentoDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedLancamento(null);
        }}
        lancamento={selectedLancamento}
        onEdit={(lanc) => {
          setIsDetailOpen(false);
          setEditingLancamento(lanc);
          setIsModalOpen(true);
        }}
        onDelete={(id) => {
          setIsDetailOpen(false);
          setDeleteTargetId(id);
          setIsDeleteModalOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Lançamento Financeiro"
        description="Tem certeza que deseja remover este lançamento? Esta ação recalculará o fluxo de caixa e relatórios contábeis."
        confirmLabel="Sim, Excluir Lançamento"
        cancelLabel="Cancelar"
      />

      {/* Rodapé Institucional */}
      <InstitutionalFooter />
    </div>
  );
}
