'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { TableSkeleton, MetricCardSkeleton, CardGridSkeleton } from '@/components/Skeleton';
import { SecurityBadge } from '@/components/SecurityBadge';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from 'sonner';
import { prazoService, Prazo, CreatePrazoInput } from '@/services/prazoService';
import { processoService, Processo } from '@/services/processoService';
import {
  CalendarClock,
  PlusCircle,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Check,
  X,
  Copy,
  RefreshCw,
  LayoutGrid,
  ListFilter,
  Scale,
  Building2,
  User,
  ArrowUpDown,
  FileText,
} from 'lucide-react';

function calcularStatusPrazo(dataVencimentoStr: string, statusAtual: string) {
  if (statusAtual.toLowerCase() === 'cumprido') {
    return {
      urgencia: 'cumprido' as const,
      label: 'Cumprido',
      dias: 0,
      badgeText: 'Cumprido',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900/60 dark:text-emerald-300',
      icon: CheckCircle2,
    };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(dataVencimentoStr);
  vencimento.setHours(0, 0, 0, 0);

  const diffMs = vencimento.getTime() - hoje.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    const diasVencido = Math.abs(diffDias);
    return {
      urgencia: 'vencido' as const,
      label: 'Vencido',
      dias: diffDias,
      badgeText: diasVencido === 1 ? 'Vencido há 1 dia' : `Vencido há ${diasVencido} dias`,
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:border-rose-900/60 dark:text-rose-300',
      icon: XCircle,
    };
  }

  if (diffDias === 0) {
    return {
      urgencia: 'hoje' as const,
      label: 'Vence Hoje',
      dias: 0,
      badgeText: '⚠️ Vence Hoje!',
      badgeClass: 'bg-red-100 text-red-900 border-red-300 font-bold dark:bg-red-950/70 dark:border-red-900 dark:text-red-300 animate-pulse',
      icon: Flame,
    };
  }

  if (diffDias <= 3) {
    return {
      urgencia: 'urgente' as const,
      label: 'Urgente',
      dias: diffDias,
      badgeText: diffDias === 1 ? 'Vence amanhã' : `Vence em ${diffDias} dias`,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:border-amber-900/60 dark:text-amber-300',
      icon: AlertTriangle,
    };
  }

  return {
    urgencia: 'no_prazo' as const,
    label: 'No Prazo',
    dias: diffDias,
    badgeText: `Vence em ${diffDias} dias`,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
    icon: Clock,
  };
}

export default function PrazosPage() {
  return (
    <AuthGuard>
      <PrazosContent />
    </AuthGuard>
  );
}

function PrazosContent() {
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProcessos, setLoadingProcessos] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modo de exibição: Lista Tabela vs Cards
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'urgentes' | 'pendentes' | 'vencidos' | 'cumpridos'>('todos');
  const [selectedProcessoFilter, setSelectedProcessoFilter] = useState<string>('todos');

  // Modal de Criação / Edição
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingPrazo, setEditingPrazo] = useState<Prazo | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form Fields
  const [descricao, setDescricao] = useState<string>('');
  const [dataVencimento, setDataVencimento] = useState<string>('');
  const [status, setStatus] = useState<string>('Pendente');
  const [idProcesso, setIdProcesso] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [prazoToDelete, setPrazoToDelete] = useState<Prazo | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Cópia
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Carregar Processos para o Select Dinâmico
  const fetchProcessosList = useCallback(async () => {
    setLoadingProcessos(true);
    try {
      const data = await processoService.getAll();
      setProcessos(Array.isArray(data) ? data : []);
    } catch {
      setProcessos([]);
    } finally {
      setLoadingProcessos(false);
    }
  }, []);

  // Carregar Prazos e Processos
  const fetchPrazos = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [prazosData, processosData] = await Promise.all([
        prazoService.getAll(),
        processoService.getAll(),
      ]);
      setPrazos(Array.isArray(prazosData) ? prazosData : []);
      setProcessos(Array.isArray(processosData) ? processosData : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com a API de Prazos.';
      setErrorMsg(msg);
      setPrazos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrazos();
  }, [fetchPrazos]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateModal = () => {
    setEditingPrazo(null);
    setDescricao('');
    const target = new Date();
    target.setDate(target.getDate() + 5);
    const suggestedDate = target.toISOString().split('T')[0];
    setDataVencimento(suggestedDate);
    setStatus('Pendente');
    setIdProcesso(processos.length > 0 ? String(processos[0].id_processo) : '');
    setFormErrors({});
    setModalOpen(true);
    if (processos.length === 0) {
      fetchProcessosList();
    }
  };

  const openEditModal = (prazo: Prazo) => {
    setEditingPrazo(prazo);
    setDescricao(prazo.descricao);
    const dateFormatted = prazo.data_vencimento
      ? new Date(prazo.data_vencimento).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    setDataVencimento(dateFormatted);
    setStatus(prazo.status);
    setIdProcesso(String(prazo.id_processo));
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!descricao.trim()) {
      errors.descricao = 'A descrição do ato processual/prazo é obrigatória.';
    } else if (descricao.length > 255) {
      errors.descricao = 'A descrição não pode exceder 255 caracteres.';
    }
    if (!dataVencimento) {
      errors.dataVencimento = 'A data de vencimento é obrigatória.';
    }
    if (!status.trim()) {
      errors.status = 'O status do prazo é obrigatório.';
    }
    if (!idProcesso || Number(idProcesso) <= 0) {
      errors.idProcesso = 'Selecione o processo judicial vinculado.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePrazo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setErrorMsg(null);

    const payload: CreatePrazoInput = {
      descricao: descricao.trim(),
      data_vencimento: dataVencimento,
      status: status.trim(),
      id_processo: Number(idProcesso),
    };

    try {
      if (editingPrazo) {
        await prazoService.update(editingPrazo.id_prazo, payload);
        setSuccessMsg(`Prazo atualizado com sucesso no banco de dados!`);
      } else {
        await prazoService.create(payload);
        setSuccessMsg(`Prazo cadastrado com sucesso na agenda processual!`);
      }
      setModalOpen(false);
      await fetchPrazos();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar prazo.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (prazo: Prazo) => {
    const isCurrentlyCumprido = prazo.status.toLowerCase() === 'cumprido';
    const newStatus = isCurrentlyCumprido ? 'Pendente' : 'Cumprido';

    try {
      await prazoService.update(prazo.id_prazo, {
        status: newStatus,
      });
      await fetchPrazos();
      setSuccessMsg(
        isCurrentlyCumprido
          ? `Prazo #${prazo.id_prazo} reaberto como pendente.`
          : `Prazo #${prazo.id_prazo} marcado como cumprido!`
      );
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar status do prazo.';
      setErrorMsg(msg);
    }
  };

  const handleDeletePrazo = async () => {
    if (!prazoToDelete) return;
    setDeleting(true);
    setErrorMsg(null);
    try {
      await prazoService.delete(prazoToDelete.id_prazo);
      setSuccessMsg(`Prazo "${prazoToDelete.descricao}" removido com sucesso.`);
      setDeleteModalOpen(false);
      setPrazoToDelete(null);
      await fetchPrazos();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao remover prazo.';
      setErrorMsg(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Ordenação crescente por data de vencimento
  const sortedPrazos = useMemo(() => {
    return [...prazos].sort((a, b) => {
      const dateA = new Date(a.data_vencimento).getTime();
      const dateB = new Date(b.data_vencimento).getTime();
      return dateA - dateB;
    });
  }, [prazos]);

  // Filtragem
  const filteredPrazos = useMemo(() => {
    return sortedPrazos.filter((prazo) => {
      const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status);

      if (selectedFilter === 'cumpridos' && calc.urgencia !== 'cumprido') return false;
      if (selectedFilter === 'vencidos' && calc.urgencia !== 'vencido') return false;
      if (selectedFilter === 'pendentes' && calc.urgencia === 'cumprido') return false;
      if (
        selectedFilter === 'urgentes' &&
        calc.urgencia !== 'hoje' &&
        calc.urgencia !== 'urgente' &&
        calc.urgencia !== 'vencido'
      ) {
        return false;
      }

      if (selectedProcessoFilter !== 'todos') {
        if (String(prazo.id_processo) !== selectedProcessoFilter) return false;
      }

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const desc = prazo.descricao.toLowerCase();
      const procNum = prazo.processo?.numero_processo?.toLowerCase() || '';
      const procTitle = prazo.processo?.titulo?.toLowerCase() || '';
      const clientName = prazo.processo?.cliente?.nome?.toLowerCase() || '';

      return (
        desc.includes(term) ||
        procNum.includes(term) ||
        procTitle.includes(term) ||
        clientName.includes(term)
      );
    });
  }, [sortedPrazos, searchTerm, selectedFilter, selectedProcessoFilter]);

  // Métricas
  const totalPrazos = prazos.length;
  const totalCumpridos = prazos.filter((p) => p.status.toLowerCase() === 'cumprido').length;
  const totalVencidos = prazos.filter((p) => {
    const calc = calcularStatusPrazo(p.data_vencimento, p.status);
    return calc.urgencia === 'vencido';
  }).length;
  const totalUrgentes = prazos.filter((p) => {
    const calc = calcularStatusPrazo(p.data_vencimento, p.status);
    return calc.urgencia === 'hoje' || calc.urgencia === 'urgente';
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up space-y-6">
        {/* Breadcrumb de Navegação */}
        <div className="flex items-center justify-between">
          <Breadcrumbs items={[{ label: 'Prazos & Agenda', icon: CalendarClock }]} />
          <SecurityBadge variant="compact" className="hidden sm:inline-flex" />
        </div>

        {/* Banner de Feedback / Alertas */}
        {successMsg && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300 text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button
              onClick={fetchPrazos}
              className="underline font-semibold cursor-pointer ml-3"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Cabeçalho da Página */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-100 p-1.5 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <CalendarClock className="h-5 w-5" />
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Prazos & Agenda Processual
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Cronograma de audiências, manifestações e intimações ordenadas por urgência de vencimento.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPrazos}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 transition active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Novo Prazo
            </button>
          </div>
        </div>

        {/* Métricas e Painéis de Urgência */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {loading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Prazos</span>
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  {totalPrazos}
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-900 dark:text-amber-300">Urgentes / Hoje</span>
                  <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-amber-900 dark:text-amber-200">
                  {totalUrgentes}
                </p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/20 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-rose-900 dark:text-rose-300">Prazos Vencidos</span>
                  <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-rose-900 dark:text-rose-200">
                  {totalVencidos}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-900 dark:text-emerald-300">Cumpridos</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-emerald-900 dark:text-emerald-200">
                  {totalCumpridos}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Barra de Filtros e Alternância de Visualização */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar prazo, processo ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-600 focus:outline-hidden focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="Visualização em Tabela"
              >
                <ListFilter className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="Visualização em Cards"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 focus:border-amber-500 focus:outline-hidden"
            >
              <option value="todos" className="bg-slate-900 text-slate-100">Todos os Prazos</option>
              <option value="urgentes" className="bg-slate-900 text-slate-100">Urgentes / Vencidos</option>
              <option value="pendentes" className="bg-slate-900 text-slate-100">Pendentes (Em Aberto)</option>
              <option value="vencidos" className="bg-slate-900 text-slate-100">Apenas Vencidos</option>
              <option value="cumpridos" className="bg-slate-900 text-slate-100">Apenas Cumpridos</option>
            </select>

            {processos.length > 0 && (
              <select
                value={selectedProcessoFilter}
                onChange={(e) => setSelectedProcessoFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 focus:border-amber-500 focus:outline-hidden max-w-[200px] truncate"
              >
                <option value="todos" className="bg-slate-900 text-slate-100">Todos os Processos</option>
                {processos.map((p) => (
                  <option key={p.id_processo} value={String(p.id_processo)} className="bg-slate-900 text-slate-100">
                    {p.numero_processo} - {p.titulo}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Conteúdo: Tabela ou Cards */}
        {loading ? (
          viewMode === 'table' ? (
            <TableSkeleton rows={6} columns={6} />
          ) : (
            <CardGridSkeleton count={6} />
          )
        ) : filteredPrazos.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={
              searchTerm || selectedFilter !== 'todos' || selectedProcessoFilter !== 'todos'
                ? "Nenhum prazo localizado"
                : "Nenhum prazo judicial pendente"
            }
            description={
              searchTerm || selectedFilter !== 'todos' || selectedProcessoFilter !== 'todos'
                ? "Tente ajustar os filtros selecionados ou o termo pesquisado."
                : "Cadastre prazos e intimações para manter a agenda do escritório sob controle rigoroso."
            }
            action={
              !searchTerm && selectedFilter === 'todos' && selectedProcessoFilter === 'todos'
                ? {
                    label: "Cadastrar Prazo",
                    onClick: openCreateModal,
                    icon: PlusCircle,
                  }
                : undefined
            }
          />
        ) : viewMode === 'table' ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <tr>
                    <th className="py-3.5 pl-6 pr-3 w-12 text-center">Status</th>
                    <th className="px-3 py-3.5">Descrição do Ato / Prazo</th>
                    <th className="px-3 py-3.5">Processo / Cliente</th>
                    <th className="px-3 py-3.5">Vencimento</th>
                    <th className="px-3 py-3.5">Situação</th>
                    <th className="py-3.5 pl-3 pr-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredPrazos.map((prazo) => {
                    const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status);
                    const Icon = calc.icon;
                    const isCumprido = prazo.status.toLowerCase() === 'cumprido';

                    return (
                      <tr
                        key={prazo.id_prazo}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${
                          calc.urgencia === 'hoje'
                            ? 'bg-red-50/40 dark:bg-red-950/20'
                            : calc.urgencia === 'vencido'
                            ? 'bg-rose-50/30 dark:bg-rose-950/10'
                            : ''
                        }`}
                      >
                        <td className="py-4 pl-6 pr-3 text-center">
                          <button
                            onClick={() => handleToggleStatus(prazo)}
                            className={`flex min-h-[36px] min-w-[36px] mx-auto items-center justify-center rounded-xl border transition ${
                              isCumprido
                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                                : 'border-slate-300 bg-white text-transparent hover:border-amber-600 dark:border-slate-600 dark:bg-slate-800'
                            }`}
                            title={isCumprido ? 'Reabrir prazo' : 'Marcar como cumprido'}
                            aria-label={isCumprido ? 'Reabrir prazo' : 'Marcar como cumprido'}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`font-semibold block text-slate-900 dark:text-slate-100 ${
                              isCumprido ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                          >
                            {prazo.descricao}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          {prazo.processo ? (
                            <div>
                              <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 block">
                                {prazo.processo.numero_processo}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                                {prazo.processo.cliente?.nome || prazo.processo.titulo}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Processo #{prazo.id_processo}</span>
                          )}
                        </td>

                        <td className="px-3 py-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                          {new Date(prazo.data_vencimento).toLocaleDateString('pt-BR')}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold ${calc.badgeClass}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {calc.badgeText}
                          </span>
                        </td>

                        <td className="py-4 pl-3 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(prazo)}
                              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-amber-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                              title="Editar prazo"
                              aria-label="Editar prazo"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => {
                                setPrazoToDelete(prazo);
                                setDeleteModalOpen(true);
                              }}
                              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                              title="Excluir prazo"
                              aria-label="Excluir prazo"
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
          </div>
        ) : (
          /* Visualização em Cards / Agenda */
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrazos.map((prazo) => {
              const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status);
              const Icon = calc.icon;
              const isCumprido = prazo.status.toLowerCase() === 'cumprido';

              return (
                <div
                  key={prazo.id_prazo}
                  className={`rounded-2xl border p-5 shadow-2xs transition flex flex-col justify-between ${
                    isCumprido
                      ? 'border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 opacity-80'
                      : calc.urgencia === 'hoje'
                      ? 'border-red-300 bg-red-50/40 dark:border-red-900/60 dark:bg-red-950/20 ring-1 ring-red-400'
                      : calc.urgencia === 'vencido'
                      ? 'border-rose-300 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold ${calc.badgeClass}`}>
                        <Icon className="h-3 w-3" />
                        {calc.badgeText}
                      </span>

                      <button
                        onClick={() => handleToggleStatus(prazo)}
                        className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border transition ${
                          isCumprido
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 bg-white text-transparent hover:border-amber-600 dark:border-slate-600 dark:bg-slate-800'
                        }`}
                        title={isCumprido ? 'Reabrir prazo' : 'Marcar como cumprido'}
                        aria-label={isCumprido ? 'Reabrir prazo' : 'Marcar como cumprido'}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h4 className={`mt-3 font-semibold text-xs text-slate-900 dark:text-slate-100 ${isCumprido ? 'line-through text-slate-400' : ''}`}>
                      {prazo.descricao}
                    </h4>

                    {prazo.processo && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[11px] dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {prazo.processo.numero_processo}
                        </span>
                        <span className="text-slate-500 block truncate mt-0.5">
                          {prazo.processo.cliente?.nome || prazo.processo.titulo}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80 text-xs">
                    <span className="font-mono font-medium text-slate-600 dark:text-slate-400">
                      Vence: {new Date(prazo.data_vencimento).toLocaleDateString('pt-BR')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(prazo)}
                        className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-amber-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                        title="Editar"
                        aria-label="Editar prazo"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setPrazoToDelete(prazo);
                          setDeleteModalOpen(true);
                        }}
                        className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                        title="Excluir"
                        aria-label="Excluir prazo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Criação / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  {editingPrazo ? <Edit2 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  {editingPrazo ? 'Editar Prazo Processual' : 'Cadastrar Novo Prazo'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrazo} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Processo Judicial Vinculado *
                </label>
                <select
                  value={idProcesso}
                  onChange={(e) => setIdProcesso(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="" className="bg-slate-900 text-slate-100">Selecione o Processo</option>
                  {processos.map((p) => (
                    <option key={p.id_processo} value={String(p.id_processo)} className="bg-slate-900 text-slate-100">
                      {p.numero_processo} — {p.titulo}
                    </option>
                  ))}
                </select>
                {formErrors.idProcesso && (
                  <p className="text-red-500 mt-1">{formErrors.idProcesso}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Ato Processual / Intimação *
                </label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Apresentar Réplica à Contestação com documentos"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
                />
                {formErrors.descricao && (
                  <p className="text-red-500 mt-1">{formErrors.descricao}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data Fatal de Vencimento *
                  </label>
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-hidden"
                  />
                  {formErrors.dataVencimento && (
                    <p className="text-red-500 mt-1">{formErrors.dataVencimento}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status do Prazo *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="Pendente" className="bg-slate-900 text-slate-100">Pendente</option>
                    <option value="Cumprido" className="bg-slate-900 text-slate-100">Cumprido</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingPrazo ? 'Atualizar Prazo' : 'Salvar no Banco'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão Reutilizável & Acessível */}
      <ConfirmModal
        isOpen={deleteModalOpen && !!prazoToDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setPrazoToDelete(null);
        }}
        onConfirm={handleDeletePrazo}
        title="Confirmar Exclusão de Prazo"
        description={`Tem certeza que deseja excluir o prazo judicial "${prazoToDelete?.descricao}"? Esta ação removerá o alerta do calendário e não poderá ser desfeita.`}
        confirmLabel="Sim, Excluir Prazo"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={deleting}
      />

      {/* Rodapé Institucional */}
      <InstitutionalFooter />
    </div>
  );
}
