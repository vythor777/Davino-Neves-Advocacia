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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 p-1.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <CalendarClock className="h-5 w-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 transition active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Novo Prazo
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
                className={`text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-2xs group active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 h-24 flex flex-col justify-between ${
                  selectedFilter === 'todos'
                    ? 'border-blue-400 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-950/40 ring-2 ring-blue-500/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
                title="Clique para exibir todos os prazos"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                    Total de Prazos
                  </span>
                  <CalendarClock className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </div>
                <p className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  {totalPrazos}
                </p>
              </button>

              {/* Card 2: 🟡 Urgentes / Hoje (Laranja/Amarelo) */}
              <button
                type="button"
                onClick={() => setSelectedFilter((prev) => (prev === 'urgentes' ? 'todos' : 'urgentes'))}
                aria-pressed={selectedFilter === 'urgentes'}
                className={`text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-2xs group active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 h-24 flex flex-col justify-between ${
                  selectedFilter === 'urgentes'
                    ? 'border-amber-400 bg-amber-100/70 dark:border-amber-500 dark:bg-amber-950/60 ring-2 ring-amber-500 shadow-xs'
                    : 'border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20 dark:hover:border-amber-800'
                }`}
                title="Clique para filtrar apenas prazos Urgentes e de Hoje"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-900 dark:text-amber-300">
                    Urgentes / Hoje
                  </span>
                  <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-2xl font-bold font-serif text-amber-900 dark:text-amber-200">
                  {totalUrgentes}
                </p>
              </button>

              {/* Card 3: 🔴 Prazos Vencidos (Vermelho/Rosa) */}
              <button
                type="button"
                onClick={() => setSelectedFilter((prev) => (prev === 'vencidos' ? 'todos' : 'vencidos'))}
                aria-pressed={selectedFilter === 'vencidos'}
                className={`text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-2xs group active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 h-24 flex flex-col justify-between ${
                  selectedFilter === 'vencidos'
                    ? 'border-rose-400 bg-rose-100/70 dark:border-rose-500 dark:bg-rose-950/60 ring-2 ring-rose-500 shadow-xs'
                    : 'border-rose-200 bg-rose-50/50 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/20 dark:hover:border-rose-800'
                }`}
                title="Clique para filtrar apenas prazos Vencidos"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-rose-900 dark:text-rose-300">
                    Prazos Vencidos
                  </span>
                  <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <p className="text-2xl font-bold font-serif text-rose-900 dark:text-rose-200">
                  {totalVencidos}
                </p>
              </button>

              {/* Card 4: 🟢 Cumpridos (Verde) */}
              <button
                type="button"
                onClick={() => setSelectedFilter((prev) => (prev === 'cumpridos' ? 'todos' : 'cumpridos'))}
                aria-pressed={selectedFilter === 'cumpridos'}
                className={`text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-2xs group active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 h-24 flex flex-col justify-between ${
                  selectedFilter === 'cumpridos'
                    ? 'border-emerald-400 bg-emerald-100/70 dark:border-emerald-500 dark:bg-emerald-950/60 ring-2 ring-emerald-500 shadow-xs'
                    : 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:hover:border-emerald-800'
                }`}
                title="Clique para filtrar apenas prazos Cumpridos"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-900 dark:text-emerald-300">
                    Cumpridos
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-2xl font-bold font-serif text-emerald-900 dark:text-emerald-200">
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
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
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
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
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
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
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
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-hidden cursor-pointer"
            >
              <option value="todos">Todos os Prazos</option>
              <option value="urgentes">🟡 Urgentes / Hoje</option>
              <option value="vencidos">🔴 Vencidos</option>
              <option value="cumpridos">🟢 Cumpridos</option>
              <option value="pendentes">Em Aberto (Todos Pendentes)</option>
              <option value="aberto">🔵 Em Aberto / Padrão</option>
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
                    const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status, prazo.hora);
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
                                : 'border-slate-300 bg-white text-transparent hover:border-blue-600 dark:border-slate-600 dark:bg-slate-800'
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
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            {prazo.tipoCompromisso && (
                              <span className="font-medium text-orange-600 dark:text-orange-400">
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
                              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
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
              const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status, prazo.hora);
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
                            : 'border-slate-300 bg-white text-transparent hover:border-blue-600 dark:border-slate-600 dark:bg-slate-800'
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

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800/60">
                        {prazo.tipoCompromisso || 'Prazo Fatal'}
                      </span>
                      {prazo.responsavel && (
                        <span className="text-[11px] text-slate-500 truncate">
                          {prazo.responsavel}
                        </span>
                      )}
                    </div>

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
                      Vence: {calc.dataExibicao} {prazo.hora ? `às ${prazo.hora}` : ''}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(prazo)}
                        className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
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

      {/* Modal de Criação / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-2xl text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-orange-100 dark:bg-orange-950/80 p-2 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60">
                  {editingPrazo ? <Edit2 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  {editingPrazo ? 'Editar Prazo Processual' : 'Cadastrar Novo Prazo'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrazo} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Processo Judicial Vinculado *
                </label>
                <select
                  value={idProcesso}
                  onChange={(e) => setIdProcesso(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-hidden"
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
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Descrição do Ato Processual / Intimação *
                </label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Apresentar Réplica à Contestação com documentos"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden"
                />
                {formErrors.descricao && (
                  <p className="text-red-500 dark:text-red-400 mt-1">{formErrors.descricao}</p>
                )}
              </div>

              {/* Campo de Tipo de Compromisso */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Tipo de Compromisso *
                </label>
                <select
                  value={tipoCompromisso}
                  onChange={(e) => setTipoCompromisso(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-hidden"
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
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-hidden"
                  />
                  {formErrors.dataVencimento && (
                    <p className="text-red-500 dark:text-red-400 mt-1">{formErrors.dataVencimento}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-hidden"
                  />
                  {formErrors.hora && (
                    <p className="text-red-500 dark:text-red-400 mt-1">{formErrors.hora}</p>
                  )}
                </div>
              </div>

              {/* Campo opcional de Responsável pelo Cumprimento com Usuários Reais */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Responsável pelo Cumprimento <span className="text-slate-500 dark:text-slate-400 font-normal">(Opcional)</span>
                </label>
                <select
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-hidden"
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
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Status do Prazo *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Pendente" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pendente</option>
                  <option value="Cumprido" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Cumprido</option>
                </select>
              </div>

              {/* Botões do Rodapé */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 transition shadow-xs"
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
