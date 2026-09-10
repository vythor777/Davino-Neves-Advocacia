'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { TableSkeleton, MetricCardSkeleton, CardGridSkeleton } from '@/components/Skeleton';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { ConfirmModal } from '@/components/ConfirmModal';
import { ProcessCalendar } from '@/components/ProcessCalendar';
import { PrazoDetailModal } from '@/components/PrazoDetailModal';
import { toast } from 'sonner';
import { prazoService, Prazo, CreatePrazoInput } from '@/services/prazoService';
import { processoService, Processo } from '@/services/processoService';
import { usuarioService, ResponsavelItem } from '@/services/usuarioService';
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
import {
  calcularStatusPrazo,
  formatPrazoDateBR,
  formatDateForInput,
  parsePrazoDateTime,
  type PrazoStatusCategory,
} from '@/utils/dateUtils';

type FilterType = 'todos' | 'urgentes' | 'vencidos' | 'cumpridos' | 'pendentes' | 'aberto';

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

  // Modo de exibição: Calendário (Padrão no estilo Google Calendar) vs Tabela vs Cards
  const [viewMode, setViewMode] = useState<'calendar' | 'table' | 'cards'>('calendar');

  // Modal de Detalhes do Prazo (ao clicar no calendário)
  const [selectedPrazoDetails, setSelectedPrazoDetails] = useState<Prazo | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('todos');
  const [selectedProcessoFilter, setSelectedProcessoFilter] = useState<string>('todos');

  // Modal de Criação / Edição
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingPrazo, setEditingPrazo] = useState<Prazo | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form Fields
  const [descricao, setDescricao] = useState<string>('');
  const [dataVencimento, setDataVencimento] = useState<string>('');
  const [hora, setHora] = useState<string>('09:00');
  const [tipoCompromisso, setTipoCompromisso] = useState<string>('Prazo Fatal');
  const [responsavel, setResponsavel] = useState<string>('');
  const [responsaveis, setResponsaveis] = useState<ResponsavelItem[]>([]);
  const [loadingResponsaveis, setLoadingResponsaveis] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Pendente');
  const [idProcesso, setIdProcesso] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [prazoToDelete, setPrazoToDelete] = useState<Prazo | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Cópia
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Carregar Responsáveis (Advogados e Estagiários)
  const fetchResponsaveis = useCallback(async () => {
    setLoadingResponsaveis(true);
    try {
      const data = await usuarioService.getResponsaveis();
      setResponsaveis(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Falha ao buscar equipe de responsáveis:', err);
      setResponsaveis([]);
    } finally {
      setLoadingResponsaveis(false);
    }
  }, []);

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
    fetchResponsaveis();
  }, [fetchPrazos, fetchResponsaveis]);

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
    setHora('09:00');
    setTipoCompromisso('Prazo Fatal');
    setResponsavel('');
    setStatus('Pendente');
    setIdProcesso(processos.length > 0 ? String(processos[0].id_processo) : '');
    setFormErrors({});
    setModalOpen(true);
    if (processos.length === 0) {
      fetchProcessosList();
    }
    if (responsaveis.length === 0) {
      fetchResponsaveis();
    }
  };

  const handleSelectPrazoFromCalendar = (prazo: Prazo) => {
    setSelectedPrazoDetails(prazo);
    setDetailsModalOpen(true);
  };

  const handleDateClickFromCalendar = (dateStr: string) => {
    setEditingPrazo(null);
    setDescricao('');
    setDataVencimento(dateStr);
    setHora('09:00');
    setTipoCompromisso('Prazo Fatal');
    setResponsavel('');
    setStatus('Pendente');
    setIdProcesso(processos.length > 0 ? String(processos[0].id_processo) : '');
    setFormErrors({});
    setModalOpen(true);
    if (processos.length === 0) {
      fetchProcessosList();
    }
    if (responsaveis.length === 0) {
      fetchResponsaveis();
    }
  };

  const openEditModal = (prazo: Prazo) => {
    setEditingPrazo(prazo);
    setDescricao(prazo.descricao);
    const dateFormatted = formatDateForInput(prazo.data_vencimento);
    setDataVencimento(dateFormatted);
    setHora(prazo.hora || '09:00');
    setTipoCompromisso(prazo.tipoCompromisso || 'Prazo Fatal');
    setResponsavel(prazo.responsavel || '');
    setStatus(prazo.status);
    setIdProcesso(String(prazo.id_processo));
    setFormErrors({});
    setModalOpen(true);
    if (responsaveis.length === 0) {
      fetchResponsaveis();
    }
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
    if (!hora.trim()) {
      errors.hora = 'O horário é obrigatório.';
    }
    if (!tipoCompromisso.trim()) {
      errors.tipoCompromisso = 'O tipo de compromisso é obrigatório.';
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
      hora: hora.trim() || '09:00',
      tipoCompromisso: tipoCompromisso.trim() || 'Prazo Fatal',
      responsavel: responsavel.trim() ? responsavel.trim() : undefined,
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

  // Ordenação crescente por data e hora de vencimento exatas
  const sortedPrazos = useMemo(() => {
    return [...prazos].sort((a, b) => {
      const timeA = parsePrazoDateTime(a.data_vencimento, a.hora).getTime();
      const timeB = parsePrazoDateTime(b.data_vencimento, b.hora).getTime();
      return timeA - timeB;
    });
  }, [prazos]);

  // Filtragem recalculada em tempo real via useMemo
  const filteredPrazos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return sortedPrazos.filter((prazo) => {
      const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status, prazo.hora);

      // 1. Filtro de Status
      if (selectedFilter === 'cumpridos' && calc.statusCategory !== 'cumprido') return false;
      if (selectedFilter === 'vencidos' && calc.statusCategory !== 'vencido') return false;
      if (selectedFilter === 'urgentes' && calc.statusCategory !== 'urgente') return false;
      if (selectedFilter === 'pendentes' && calc.statusCategory === 'cumprido') return false;
      if (selectedFilter === 'aberto' && calc.statusCategory !== 'aberto') return false;

      // 2. Filtro por Processo
      if (selectedProcessoFilter !== 'todos') {
        if (String(prazo.id_processo) !== selectedProcessoFilter) return false;
      }

      // 3. Busca textual em tempo real: descrição do prazo, número do processo, título do processo, cliente e responsável
      if (term) {
        const desc = (prazo.descricao || '').toLowerCase();
        const procNum = (prazo.processo?.numero_processo || '').toLowerCase();
        const procTitle = (prazo.processo?.titulo || '').toLowerCase();
        const clientName = (prazo.processo?.cliente?.nome || '').toLowerCase();
        const respName = (prazo.responsavel || '').toLowerCase();
        const tipoComp = (prazo.tipoCompromisso || '').toLowerCase();

        const matches =
          desc.includes(term) ||
          procNum.includes(term) ||
          procTitle.includes(term) ||
          clientName.includes(term) ||
          respName.includes(term) ||
          tipoComp.includes(term);

        if (!matches) return false;
      }

      return true;
    });
  }, [sortedPrazos, searchTerm, selectedFilter, selectedProcessoFilter]);

  // Métricas alinhadas estritamente com as 4 categorias dos cards superiores
  const totalPrazos = prazos.length;
  const totalCumpridos = prazos.filter((p) => {
    const calc = calcularStatusPrazo(p.data_vencimento, p.status, p.hora);
    return calc.statusCategory === 'cumprido';
  }).length;
  const totalVencidos = prazos.filter((p) => {
    const calc = calcularStatusPrazo(p.data_vencimento, p.status, p.hora);
    return calc.statusCategory === 'vencido';
  }).length;
  const totalUrgentes = prazos.filter((p) => {
    const calc = calcularStatusPrazo(p.data_vencimento, p.status, p.hora);
    return calc.statusCategory === 'urgente';
  }).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in-up space-y-6">
      {/* Breadcrumb de Navegação */}
      <div>
        <Breadcrumbs items={[{ label: 'Prazos & Agenda', icon: CalendarClock }]} />
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 dark:border-white/[0.05] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-[#d4af37]/90 border border-slate-200 dark:border-white/[0.08]">
                Controladoria Jurídica • Agenda Processual
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25">
                <CalendarClock className="h-4 w-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                Prazos & Agenda Processual
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Cronograma de audiências, manifestações e intimações ordenadas por urgência de vencimento.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchPrazos}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100/80 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06] backdrop-blur-sm transition-colors cursor-pointer"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b36f] text-slate-950 font-semibold px-4 py-2 text-xs shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-slate-950" />
              + Novo Prazo
            </button>
          </div>
        </div>

        {/* Métricas e Painéis de Urgência Interativos (Filtro por Clique) */}
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
              {/* Card 1: Total de Prazos */}
              <button
                type="button"
                onClick={() => setSelectedFilter('todos')}
                aria-pressed={selectedFilter === 'todos'}
                className={`legal-glass-card fio-de-luz p-4 sm:p-5 text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  selectedFilter === 'todos'
                    ? 'ring-1 ring-[#c5a059]'
                    : ''
                }`}
                title="Clique para exibir todos os prazos"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                    Total de Prazos
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-400">
                    <CalendarClock className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#f8fafc]">
                  {totalPrazos}
                </p>
              </button>

              {/* Card 2: 🟡 Urgentes / Hoje */}
              <button
                type="button"
                onClick={() => setSelectedFilter((prev) => (prev === 'urgentes' ? 'todos' : 'urgentes'))}
                aria-pressed={selectedFilter === 'urgentes'}
                className={`legal-glass-card fio-de-luz p-4 sm:p-5 text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  selectedFilter === 'urgentes'
                    ? 'ring-1 ring-amber-400'
                    : ''
                }`}
                title="Clique para filtrar apenas prazos Urgentes e de Hoje"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                    Urgentes / Hoje
                  </span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Flame className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#f8fafc]">
                  {totalUrgentes}
                </p>
              </button>

              {/* Card 3: 🔴 Prazos Vencidos */}
              <button
                type="button"
                onClick={() => setSelectedFilter((prev) => (prev === 'vencidos' ? 'todos' : 'vencidos'))}
                aria-pressed={selectedFilter === 'vencidos'}
                className={`legal-glass-card fio-de-luz p-4 sm:p-5 text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  selectedFilter === 'vencidos'
                    ? 'ring-1 ring-rose-400'
                    : ''
                }`}
                title="Clique para filtrar apenas prazos Vencidos"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                    Prazos Vencidos
                  </span>
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <XCircle className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#f8fafc]">
                  {totalVencidos}
                </p>
              </button>

              {/* Card 4: 🟢 Cumpridos */}
              <button
                type="button"
                onClick={() => setSelectedFilter((prev) => (prev === 'cumpridos' ? 'todos' : 'cumpridos'))}
                aria-pressed={selectedFilter === 'cumpridos'}
                className={`legal-glass-card fio-de-luz p-4 sm:p-5 text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  selectedFilter === 'cumpridos'
                    ? 'ring-1 ring-emerald-400'
                    : ''
                }`}
                title="Clique para filtrar apenas prazos Cumpridos"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                    Cumpridos
                  </span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#f8fafc]">
                  {totalCumpridos}
                </p>
              </button>
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
              className="w-full rounded-xl border border-slate-200/80 bg-white/80 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-white/[0.04] p-1 border border-slate-200/60 dark:border-white/[0.06]">
              <button
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-[#c5a059] text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Visualização em Calendário"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Calendário</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#c5a059] text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Visualização em Tabela"
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tabela</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-[#c5a059] text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Visualização em Cards"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            {/* Select de Status sincronizado */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as FilterType)}
              className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#12161f] px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden cursor-pointer"
            >
              <option value="todos" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Todos os Prazos</option>
              <option value="urgentes" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🟡 Urgentes / Hoje</option>
              <option value="vencidos" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🔴 Vencidos</option>
              <option value="cumpridos" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🟢 Cumpridos</option>
              <option value="pendentes" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Em Aberto (Todos Pendentes)</option>
              <option value="aberto" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🔵 Em Aberto / Padrão</option>
            </select>

            {processos.length > 0 && (
              <select
                value={selectedProcessoFilter}
                onChange={(e) => setSelectedProcessoFilter(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-hidden max-w-[200px] truncate cursor-pointer"
              >
                <option value="todos">Todos os Processos</option>
                {processos.map((p) => (
                  <option key={p.id_processo} value={String(p.id_processo)}>
                    {p.numero_processo} - {p.titulo}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Indicador de Filtros Ativos com Ação de Reset */}
        {(selectedFilter !== 'todos' || selectedProcessoFilter !== 'todos' || searchTerm.trim() !== '') && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Filtros aplicados:</span>
              <span>
                Exibindo <strong className="text-slate-900 dark:text-white">{filteredPrazos.length}</strong> de{' '}
                <strong className="text-slate-900 dark:text-white">{totalPrazos}</strong> prazos
              </span>
              {selectedFilter !== 'todos' && (
                <span className="rounded-md bg-white dark:bg-slate-900 px-2 py-0.5 font-medium border border-slate-200 dark:border-slate-700">
                  Status:{' '}
                  {selectedFilter === 'urgentes'
                    ? '🟡 Urgentes / Hoje'
                    : selectedFilter === 'vencidos'
                    ? '🔴 Vencidos'
                    : selectedFilter === 'cumpridos'
                    ? '🟢 Cumpridos'
                    : selectedFilter === 'pendentes'
                    ? 'Em Aberto (Pendentes)'
                    : '🔵 Em Aberto / Padrão'}
                </span>
              )}
              {selectedProcessoFilter !== 'todos' && (
                <span className="rounded-md bg-white dark:bg-slate-900 px-2 py-0.5 font-medium border border-slate-200 dark:border-slate-700">
                  Processo: #{selectedProcessoFilter}
                </span>
              )}
              {searchTerm.trim() && (
                <span className="rounded-md bg-white dark:bg-slate-900 px-2 py-0.5 font-medium border border-slate-200 dark:border-slate-700">
                  Busca: &ldquo;{searchTerm.trim()}&rdquo;
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFilter('todos');
                setSelectedProcessoFilter('todos');
                setSearchTerm('');
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 cursor-pointer transition"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* Conteúdo: Calendário Interativo, Tabela ou Cards */}
        {loading ? (
          viewMode === 'calendar' ? (
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 animate-pulse">
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 w-1/3"></div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"></div>
                ))}
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <TableSkeleton rows={6} columns={6} />
          ) : (
            <CardGridSkeleton count={6} />
          )
        ) : viewMode === 'calendar' ? (
          /* Grid de Calendário que ocupa 100% da largura disponível */
          <div className="w-full">
            <ProcessCalendar
              prazos={filteredPrazos}
              onSelectPrazo={handleSelectPrazoFromCalendar}
              onDateClick={handleDateClickFromCalendar}
              loading={loading}
            />
          </div>
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
          <div className="mt-6 legal-glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[0.5px] border-slate-200/70 bg-slate-50/80 font-semibold text-slate-700 dark:border-white/[0.04] dark:bg-[#12161f]/80 dark:text-slate-300 backdrop-blur-md">
                  <tr>
                    <th className="py-3.5 pl-6 pr-3 w-12 text-center">Status</th>
                    <th className="px-3 py-3.5">Descrição do Ato / Prazo</th>
                    <th className="px-3 py-3.5">Processo / Cliente</th>
                    <th className="px-3 py-3.5">Vencimento</th>
                    <th className="px-3 py-3.5">Situação</th>
                    <th className="py-3.5 pl-3 pr-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-white/[0.03]">
                  {filteredPrazos.map((prazo) => {
                    const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status, prazo.hora);
                    const Icon = calc.icon;
                    const isCumprido = prazo.status.toLowerCase() === 'cumprido';

                    return (
                      <tr
                        key={prazo.id_prazo}
                        className={`hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition ${
                          calc.urgencia === 'hoje'
                            ? 'bg-red-50/30 dark:bg-red-950/20'
                            : calc.urgencia === 'vencido'
                            ? 'bg-rose-50/20 dark:bg-rose-950/10'
                            : ''
                        }`}
                      >
                        <td className="py-4 pl-6 pr-3 text-center">
                          <button
                            onClick={() => handleToggleStatus(prazo)}
                            className={`flex min-h-[36px] min-w-[36px] mx-auto items-center justify-center rounded-xl border transition cursor-pointer ${
                              isCumprido
                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                                : 'border-slate-300/80 bg-white/60 text-transparent hover:border-[#c5a059] dark:border-white/[0.1] dark:bg-white/[0.03]'
                            }`}
                            title={isCumprido ? 'Reabrir prazo' : 'Marcar como cumprido'}
                            aria-label={isCumprido ? 'Reabrir prazo' : 'Marcar como cumprido'}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`font-semibold block text-slate-900 dark:text-[#f8fafc] ${
                              isCumprido ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                          >
                            {prazo.descricao}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            {prazo.tipoCompromisso && (
                              <span className="font-medium text-amber-600 dark:text-amber-400">
                                {prazo.tipoCompromisso}
                              </span>
                            )}
                            {prazo.responsavel && (
                              <span>• {prazo.responsavel}</span>
                            )}
                          </div>
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
                          <div>
                            {calc.dataExibicao}
                            {prazo.hora && (
                              <span className="text-[11px] text-slate-500 block font-mono">
                                às {prazo.hora}
                              </span>
                            )}
                          </div>
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
                              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-[#c5a059] dark:text-slate-400 dark:hover:text-[#c5a059] cursor-pointer transition-colors"
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
                              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 cursor-pointer transition-colors"
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
              const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status, prazo.hora);
              const Icon = calc.icon;
              const isCumprido = prazo.status.toLowerCase() === 'cumprido';

              return (
                <div
                  key={prazo.id_prazo}
                  className={`legal-glass-card fio-de-luz p-5 flex flex-col justify-between ${
                    isCumprido
                      ? 'opacity-70'
                      : calc.urgencia === 'hoje'
                      ? 'border-red-400/40 bg-red-950/10'
                      : calc.urgencia === 'vencido'
                      ? 'border-rose-400/40 bg-rose-950/10'
                      : ''
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
                        className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border transition cursor-pointer ${
                          isCumprido
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300/80 bg-white/60 text-transparent hover:border-[#c5a059] dark:border-white/[0.1] dark:bg-white/[0.03]'
                        }`}
                        title={isCumprido ? 'Reabrir prazo' : 'Marcar como cumprido'}
                        aria-label={isCumprido ? 'Reabrir prazo' : 'Marcar como cumprido'}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h4 className={`mt-3 font-semibold text-xs text-slate-900 dark:text-[#f8fafc] ${isCumprido ? 'line-through text-slate-400' : ''}`}>
                      {prazo.descricao}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/20">
                        {prazo.tipoCompromisso || 'Prazo Fatal'}
                      </span>
                      {prazo.responsavel && (
                        <span className="text-[11px] text-slate-400 truncate">
                          {prazo.responsavel}
                        </span>
                      )}
                    </div>

                    {prazo.processo && (
                      <div className="mt-3 rounded-xl bg-slate-50/80 p-2.5 text-[11px] dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 block truncate">
                          {prazo.processo.numero_processo}
                        </span>
                        <span className="text-slate-400 block truncate mt-0.5">
                          {prazo.processo.cliente?.nome || prazo.processo.titulo}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-white/[0.06] text-xs">
                    <span className="font-mono font-medium text-slate-600 dark:text-slate-400">
                      Vence: {calc.dataExibicao} {prazo.hora ? `às ${prazo.hora}` : ''}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(prazo)}
                        className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-[#c5a059] transition-colors cursor-pointer"
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
                        className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors cursor-pointer"
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

      {/* Modal de Criação / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg legal-glass-card fio-de-luz p-6 shadow-2xl text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25 p-2">
                  {editingPrazo ? <Edit2 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-[#f8fafc]">
                    {editingPrazo ? 'Editar Prazo Processual' : 'Cadastrar Novo Prazo'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Controle de prazos e compromissos judiciais
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer hover:bg-white/[0.04]"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrazo} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Processo Judicial Vinculado *
                </label>
                <select
                  value={idProcesso}
                  onChange={(e) => setIdProcesso(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#12161f] px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Selecione o Processo</option>
                  {processos.map((p) => (
                    <option key={p.id_processo} value={String(p.id_processo)} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {p.numero_processo} — {p.titulo}
                    </option>
                  ))}
                </select>
                {formErrors.idProcesso && (
                  <p className="text-red-500 dark:text-red-400 mt-1">{formErrors.idProcesso}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Ato Processual / Intimação *
                </label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Apresentar Réplica à Contestação com documentos"
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#12161f] px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#c5a059] focus:outline-hidden"
                />
                {formErrors.descricao && (
                  <p className="text-red-500 dark:text-red-400 mt-1">{formErrors.descricao}</p>
                )}
              </div>

              {/* Campo de Tipo de Compromisso */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Compromisso *
                </label>
                <select
                  value={tipoCompromisso}
                  onChange={(e) => setTipoCompromisso(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#12161f] px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                >
                  <option value="Prazo Fatal" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Prazo Fatal</option>
                  <option value="Audiência" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Audiência</option>
                  <option value="Reunião Externa" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Reunião Externa</option>
                  <option value="Diligência" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Diligência</option>
                </select>
                {formErrors.tipoCompromisso && (
                  <p className="text-red-500 dark:text-red-400 mt-1">{formErrors.tipoCompromisso}</p>
                )}
              </div>

              {/* Divisão da data em duas colunas (grid grid-cols-2 gap-4) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#12161f] px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                  />
                  {formErrors.dataVencimento && (
                    <p className="text-red-500 dark:text-red-400 mt-1">{formErrors.dataVencimento}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#12161f] px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                  />
                  {formErrors.hora && (
                    <p className="text-red-500 dark:text-red-400 mt-1">{formErrors.hora}</p>
                  )}
                </div>
              </div>

              {/* Campo opcional de Responsável pelo Cumprimento com Usuários Reais */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Responsável pelo Cumprimento <span className="text-slate-500 dark:text-slate-400 font-normal">(Opcional)</span>
                </label>
                <select
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#12161f] px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300">
                    {loadingResponsaveis ? 'Carregando equipe...' : 'Selecione um Responsável (Opcional)'}
                  </option>
                  {responsaveis.map((u) => {
                    const cargoFormatado = u.cargo || (u.role === 'ADVOGADO' ? 'Advogado' : 'Estagiário');
                    return (
                      <option key={u.id || u.id_usuario} value={u.nome} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {u.nome} ({cargoFormatado})
                      </option>
                    );
                  })}
                  {responsavel && !responsaveis.some((u) => u.nome === responsavel) && (
                    <option value={responsavel} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {responsavel}
                    </option>
                  )}
                </select>
              </div>

              {/* Status do Prazo */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status do Prazo *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#12161f] px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                >
                  <option value="Pendente" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pendente</option>
                  <option value="Cumprido" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Cumprido</option>
                </select>
              </div>

              {/* Botões do Rodapé */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200/60 dark:border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b36f] text-slate-950 font-semibold px-4 py-2 text-xs shadow-xs hover:shadow-md disabled:opacity-50 transition cursor-pointer active:scale-98"
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

      {/* Modal Interativo com Detalhes do Prazo Selecionado no Calendário */}
      <PrazoDetailModal
        prazo={selectedPrazoDetails}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onToggleStatus={handleToggleStatus}
        onEdit={(prazo) => {
          openEditModal(prazo);
        }}
        onDelete={(prazo) => {
          setPrazoToDelete(prazo);
          setDeleteModalOpen(true);
        }}
      />

      {/* Rodapé Institucional */}
      <InstitutionalFooter />
    </div>
  );
}
