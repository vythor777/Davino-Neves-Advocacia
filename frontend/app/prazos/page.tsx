'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { prazoService, Prazo, CreatePrazoInput } from '@/services/prazoService';
import { processoService, Processo } from '@/services/processoService';
import {
  CalendarClock,
  PlusCircle,
  Search,
  Users,
  Calendar,
  Clock,
  Briefcase,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  X,
  Copy,
  Check,
  RefreshCw,
  Info,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Flame,
  CheckSquare,
} from 'lucide-react';

// Dados de demonstração para fallback seguro caso o backend esteja em inicialização
const MOCK_PROCESSOS_LIST: Processo[] = [
  {
    id_processo: 1,
    numero_processo: '1002345-67.2026.8.26.0100',
    titulo: 'Ação de Cobrança e Indenização por Perdas e Danos',
    descricao: '2ª Vara Cível do Foro Central Cível da Comarca de São Paulo/SP.',
    data_abertura: '2026-01-15T00:00:00.000Z',
    status: 'Em Andamento',
    id_cliente: 2,
    data_criacao: '2026-01-15T11:00:00.000Z',
    data_atualizacao: '2026-02-10T14:20:00.000Z',
    cliente: {
      id_cliente: 2,
      nome: 'Construtora Horizonte Verde Ltda',
      cpf_cnpj: '12.345.678/0001-90',
      email: 'juridico@horizonteverde.com.br',
      telefone: '(11) 3210-9876',
      endereco: 'Rua Funchal, 418 - São Paulo/SP',
      data_criacao: '2026-01-20T14:30:00.000Z',
      data_atualizacao: '2026-01-20T14:30:00.000Z',
    },
  },
  {
    id_processo: 2,
    numero_processo: '0010456-89.2026.5.02.0045',
    titulo: 'Reclamação Trabalhista - Horas Extras e Reflexos',
    descricao: '45ª Vara do Trabalho de São Paulo - TRT2.',
    data_abertura: '2026-02-02T00:00:00.000Z',
    status: 'Distribuído',
    id_cliente: 1,
    data_criacao: '2026-02-02T09:30:00.000Z',
    data_atualizacao: '2026-02-02T09:30:00.000Z',
    cliente: {
      id_cliente: 1,
      nome: 'Carlos Eduardo Silveira',
      cpf_cnpj: '123.456.789-00',
      email: 'carlos.silveira@email.com',
      telefone: '(11) 98765-4321',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP',
      data_criacao: '2026-02-15T10:00:00.000Z',
      data_atualizacao: '2026-02-15T10:00:00.000Z',
    },
  },
  {
    id_processo: 3,
    numero_processo: '5003412-11.2025.4.02.5101',
    titulo: 'Mandado de Segurança - Compensação Tributária PIS/COFINS',
    descricao: '1ª Vara Federal do Rio de Janeiro - TRF2.',
    data_abertura: '2025-11-20T00:00:00.000Z',
    status: 'Concluso para Decisão',
    id_cliente: 3,
    data_criacao: '2025-11-20T16:00:00.000Z',
    data_atualizacao: '2026-02-18T10:15:00.000Z',
    cliente: {
      id_cliente: 3,
      nome: 'Mariana Duarte Souza',
      cpf_cnpj: '987.654.321-11',
      email: 'mariana.duarte@adv.br',
      telefone: '(21) 99887-6655',
      endereco: 'Rua Visconde de Pirajá, 303 - Rio de Janeiro/RJ',
      data_criacao: '2026-02-01T09:15:00.000Z',
      data_atualizacao: '2026-02-01T09:15:00.000Z',
    },
  },
];

// Prazos demonstrativos com datas relativas para ilustrar vencimentos urgentes, futuros e cumpridos
const now = new Date();
const addDays = (d: number) => {
  const target = new Date(now);
  target.setDate(target.getDate() + d);
  return target.toISOString().split('T')[0];
};

const MOCK_PRAZOS: Prazo[] = [
  {
    id_prazo: 1,
    descricao: 'Protocolar Manifestação sobre a Contestação (Réplica)',
    data_vencimento: addDays(1), // Amanhã - Urgente
    status: 'Pendente',
    id_processo: 1,
    processo: MOCK_PROCESSOS_LIST[0],
    data_criacao: '2026-02-20T10:00:00.000Z',
    data_atualizacao: '2026-02-20T10:00:00.000Z',
  },
  {
    id_prazo: 2,
    descricao: 'Audiência de Conciliação e Instrução - Sala Virtual 04',
    data_vencimento: addDays(3), // Próximos 3 dias
    status: 'Pendente',
    id_processo: 2,
    processo: MOCK_PROCESSOS_LIST[1],
    data_criacao: '2026-02-22T14:30:00.000Z',
    data_atualizacao: '2026-02-22T14:30:00.000Z',
  },
  {
    id_prazo: 3,
    descricao: 'Interposição de Embargos de Declaração contra Despacho',
    data_vencimento: addDays(-2), // Vencido há 2 dias
    status: 'Pendente',
    id_processo: 3,
    processo: MOCK_PROCESSOS_LIST[2],
    data_criacao: '2026-02-15T09:00:00.000Z',
    data_atualizacao: '2026-02-15T09:00:00.000Z',
  },
  {
    id_prazo: 4,
    descricao: 'Apresentar Rol de Testemunhas e Provas Documentais',
    data_vencimento: addDays(8), // Futuro
    status: 'Pendente',
    id_processo: 1,
    processo: MOCK_PROCESSOS_LIST[0],
    data_criacao: '2026-02-18T11:00:00.000Z',
    data_atualizacao: '2026-02-18T11:00:00.000Z',
  },
  {
    id_prazo: 5,
    descricao: 'Comprovante de Recolhimento de Custas e Preparo Recursal',
    data_vencimento: addDays(-5), // Cumprido
    status: 'Cumprido',
    id_processo: 2,
    processo: MOCK_PROCESSOS_LIST[1],
    data_criacao: '2026-02-10T16:00:00.000Z',
    data_atualizacao: '2026-02-24T15:30:00.000Z',
  },
];

const SUGESTOES_PRAZO = [
  'Apresentar Réplica à Contestação',
  'Interposição de Recurso de Apelação',
  'Apresentar Contrarrazões Recursais',
  'Audiência de Instrução e Julgamento',
  'Juntada de Procuração e Substabelecimento',
  'Manifestação sobre Laudo Pericial',
  'Cumprimento Provisório de Sentença',
  'Recolhimento de Custas Iniciais/Preparo',
];

// Helper para cálculo de urgência e dias restantes
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

  // Comparações de datas (resetando horas para zero)
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
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProcessos, setLoadingProcessos] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState<boolean>(false);

  // Modo de exibição: Lista Tabela vs Cards / Agenda
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
      if (data && Array.isArray(data) && data.length > 0) {
        setProcessos(data);
      } else {
        setProcessos(MOCK_PROCESSOS_LIST);
      }
    } catch {
      setProcessos(MOCK_PROCESSOS_LIST);
    } finally {
      setLoadingProcessos(false);
    }
  }, []);

  // Carregar Prazos
  const fetchPrazos = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await prazoService.getAll();
      if (data && Array.isArray(data)) {
        setPrazos(data);
        setIsUsingMock(false);
      } else {
        setPrazos([]);
        setIsUsingMock(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com a API de Prazos.';
      console.warn('API offline. Carregando dados demonstrativos de prazos:', msg);
      setPrazos(MOCK_PRAZOS);
      setIsUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [prazosRes, processosRes] = await Promise.allSettled([
          prazoService.getAll(),
          processoService.getAll(),
        ]);

        if (!active) return;

        if (prazosRes.status === 'fulfilled' && Array.isArray(prazosRes.value)) {
          setPrazos(prazosRes.value);
          setIsUsingMock(false);
        } else {
          setPrazos(MOCK_PRAZOS);
          setIsUsingMock(true);
        }

        if (processosRes.status === 'fulfilled' && Array.isArray(processosRes.value) && processosRes.value.length > 0) {
          setProcessos(processosRes.value);
        } else {
          setProcessos(MOCK_PROCESSOS_LIST);
        }
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Falha ao carregar prazos.';
        console.warn('Carregando dados padrão de prazos:', msg);
        setPrazos(MOCK_PRAZOS);
        setProcessos(MOCK_PROCESSOS_LIST);
        setIsUsingMock(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateModal = () => {
    setEditingPrazo(null);
    setDescricao('');
    // Data sugerida: 5 dias a partir de hoje
    const suggestedDate = addDays(5);
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

    const selectedProc = processos.find((p) => p.id_processo === Number(idProcesso));

    try {
      if (editingPrazo) {
        if (isUsingMock) {
          setPrazos((prev) =>
            prev.map((p) =>
              p.id_prazo === editingPrazo.id_prazo
                ? {
                    ...p,
                    ...payload,
                    processo: selectedProc || p.processo,
                    data_atualizacao: new Date().toISOString(),
                  }
                : p,
            ),
          );
        } else {
          await prazoService.update(editingPrazo.id_prazo, payload);
          await fetchPrazos();
        }
        setSuccessMsg(`Prazo atualizado com sucesso!`);
      } else {
        if (isUsingMock) {
          const newMockPrazo: Prazo = {
            id_prazo: Math.max(...prazos.map((p) => p.id_prazo), 0) + 1,
            ...payload,
            processo: selectedProc,
            data_criacao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString(),
          };
          setPrazos((prev) => [newMockPrazo, ...prev]);
        } else {
          await prazoService.create(payload);
          await fetchPrazos();
        }
        setSuccessMsg(`Prazo cadastrado com sucesso na agenda processual!`);
      }
      setModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar prazo.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  // Alternar Status Rápido (Cumprir ou Reabrir)
  const handleToggleStatus = async (prazo: Prazo) => {
    const isCurrentlyCumprido = prazo.status.toLowerCase() === 'cumprido';
    const newStatus = isCurrentlyCumprido ? 'Pendente' : 'Cumprido';

    try {
      if (isUsingMock) {
        setPrazos((prev) =>
          prev.map((p) =>
            p.id_prazo === prazo.id_prazo
              ? { ...p, status: newStatus, data_atualizacao: new Date().toISOString() }
              : p,
          ),
        );
      } else {
        await prazoService.update(prazo.id_prazo, { status: newStatus });
        await fetchPrazos();
      }
      setSuccessMsg(
        isCurrentlyCumprido
          ? `Prazo reaberto como Pendente.`
          : `Prazo marcado como CUMPRIDO com sucesso!`,
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar status do prazo.';
      setErrorMsg(msg);
    }
  };

  const handleDeletePrazo = async () => {
    if (!prazoToDelete) return;
    setDeleting(true);
    try {
      if (isUsingMock) {
        setPrazos((prev) => prev.filter((p) => p.id_prazo !== prazoToDelete.id_prazo));
      } else {
        await prazoService.delete(prazoToDelete.id_prazo);
        await fetchPrazos();
      }
      setSuccessMsg(`Prazo excluído com sucesso.`);
      setDeleteModalOpen(false);
      setPrazoToDelete(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao remover prazo.';
      setErrorMsg(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Ordenação e Filtragem em Tempo Real
  const filteredPrazos = useMemo(() => {
    // Ordenar primeiro por data de vencimento crescente
    const sorted = [...prazos].sort((a, b) => {
      const dateA = new Date(a.data_vencimento).getTime();
      const dateB = new Date(b.data_vencimento).getTime();
      return dateA - dateB;
    });

    return sorted.filter((prazo) => {
      const statusInfo = calcularStatusPrazo(prazo.data_vencimento, prazo.status);

      // Filtro de Categoria
      if (selectedFilter === 'urgentes') {
        if (statusInfo.urgencia !== 'hoje' && statusInfo.urgencia !== 'urgente') {
          return false;
        }
      } else if (selectedFilter === 'vencidos') {
        if (statusInfo.urgencia !== 'vencido') return false;
      } else if (selectedFilter === 'cumpridos') {
        if (statusInfo.urgencia !== 'cumprido') return false;
      } else if (selectedFilter === 'pendentes') {
        if (statusInfo.urgencia === 'cumprido') return false;
      }

      // Filtro por Processo
      if (selectedProcessoFilter !== 'todos') {
        if (String(prazo.id_processo) !== selectedProcessoFilter) {
          return false;
        }
      }

      // Busca Textual
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
  }, [prazos, searchTerm, selectedFilter, selectedProcessoFilter]);

  // Contadores de Métricas
  const totalPrazos = prazos.length;
  const totalUrgentes = prazos.filter((p) => {
    const info = calcularStatusPrazo(p.data_vencimento, p.status);
    return info.urgencia === 'hoje' || info.urgencia === 'urgente';
  }).length;
  const totalVencidos = prazos.filter((p) => {
    const info = calcularStatusPrazo(p.data_vencimento, p.status);
    return info.urgencia === 'vencido';
  }).length;
  const totalCumpridos = prazos.filter((p) => p.status.toLowerCase() === 'cumprido').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner de Feedback */}
        {successMsg && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium">{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <span className="text-sm font-medium">{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 hover:text-rose-900 dark:hover:text-rose-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Cabeçalho da Página */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              <CalendarClock className="h-4 w-4" />
              Agenda & Controladoria Processual
            </div>
            <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Gestão de Prazos e Fatalidades
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Controle de termos peremptórios, audiências, recursos e distribuição de atos ordenados por vencimento.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Alternador de visualização Tabela / Cards */}
            <div className="flex items-center rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('table')}
                title="Visualização em Tabela Detalhada"
                className={`rounded-md p-1.5 transition ${
                  viewMode === 'table'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Visualização em Cards / Agenda"
                className={`rounded-md p-1.5 transition ${
                  viewMode === 'cards'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={fetchPrazos}
              disabled={loading}
              title="Atualizar lista de prazos"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-amber-800 active:scale-[0.98] dark:bg-amber-700 dark:hover:bg-amber-600"
            >
              <PlusCircle className="h-4 w-4" />
              Novo Prazo
            </button>
          </div>
        </div>

        {/* Cards de Métricas e Alertas */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Prazos</span>
              <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalPrazos}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Cadastrados na pauta</span>
          </div>

          <div
            onClick={() => setSelectedFilter(selectedFilter === 'urgentes' ? 'todos' : 'urgentes')}
            className={`cursor-pointer rounded-xl border p-4 shadow-2xs transition hover:border-amber-400 ${
              selectedFilter === 'urgentes'
                ? 'border-amber-400 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-950/40'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-800 dark:text-amber-400">Prazos Urgentes (≤ 3 dias)</span>
              <div className="rounded-lg bg-amber-100 p-2 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-amber-900 dark:text-amber-300">
              {totalUrgentes}
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400">Atenção prioritária</span>
          </div>

          <div
            onClick={() => setSelectedFilter(selectedFilter === 'vencidos' ? 'todos' : 'vencidos')}
            className={`cursor-pointer rounded-xl border p-4 shadow-2xs transition hover:border-rose-400 ${
              selectedFilter === 'vencidos'
                ? 'border-rose-400 bg-rose-50/70 dark:border-rose-700 dark:bg-rose-950/40'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-700 dark:text-rose-400">Prazos Vencidos</span>
              <div className="rounded-lg bg-rose-100 p-2 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-400">
              {totalVencidos}
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400">Requerem regularização</span>
          </div>

          <div
            onClick={() => setSelectedFilter(selectedFilter === 'cumpridos' ? 'todos' : 'cumpridos')}
            className={`cursor-pointer rounded-xl border p-4 shadow-2xs transition hover:border-emerald-400 ${
              selectedFilter === 'cumpridos'
                ? 'border-emerald-400 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/40'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800 dark:text-emerald-400">Prazos Cumpridos</span>
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-300">
              {totalCumpridos}
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Protocolados e finalizados</span>
          </div>
        </div>

        {/* Barra de Filtros e Pesquisa */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
          {/* Busca Textual */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição do prazo, número do processo ou nome do cliente..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 lg:border-t-0 lg:pt-0 dark:border-slate-800">
            {/* Pílulas de filtro de status rápido */}
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
              <button
                onClick={() => setSelectedFilter('todos')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  selectedFilter === 'todos'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedFilter('pendentes')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  selectedFilter === 'pendentes'
                    ? 'bg-amber-800 text-white dark:bg-amber-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setSelectedFilter('urgentes')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  selectedFilter === 'urgentes'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                Urgentes
              </button>
              <button
                onClick={() => setSelectedFilter('vencidos')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  selectedFilter === 'vencidos'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                Vencidos
              </button>
              <button
                onClick={() => setSelectedFilter('cumpridos')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  selectedFilter === 'cumpridos'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                Cumpridos
              </button>
            </div>

            {/* Filtro por Processo */}
            <select
              value={selectedProcessoFilter}
              onChange={(e) => setSelectedProcessoFilter(e.target.value)}
              className="max-w-[200px] truncate rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="todos">Todos os Processos</option>
              {processos.map((p) => (
                <option key={p.id_processo} value={String(p.id_processo)}>
                  {p.numero_processo} - {p.titulo}
                </option>
              ))}
            </select>

            {(selectedFilter !== 'todos' || selectedProcessoFilter !== 'todos' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedFilter('todos');
                  setSelectedProcessoFilter('todos');
                  setSearchTerm('');
                }}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* VISUALIZAÇÃO: TABELA OU CARDS */}
        {viewMode === 'table' ? (
          /* TABELA DE PRAZOS */
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                <thead className="bg-slate-50/80 text-xs font-semibold tracking-wide uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 w-12 text-center">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Ato / Descrição do Prazo
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Vencimento & Contagem
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Processo Vinculado
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Cliente Associado
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <div className="inline-flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin text-amber-800 dark:text-amber-400" />
                          <span>Carregando agenda de prazos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPrazos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                          <CalendarClock className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Nenhum prazo encontrado
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {searchTerm || selectedFilter !== 'todos' || selectedProcessoFilter !== 'todos'
                            ? 'Ajuste os filtros ou termos da pesquisa.'
                            : 'Nenhum prazo cadastrado para os processos em andamento.'}
                        </p>
                        {!searchTerm && selectedFilter === 'todos' && selectedProcessoFilter === 'todos' && (
                          <button
                            onClick={openCreateModal}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-amber-700"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Cadastrar Primeiro Prazo
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredPrazos.map((prazo) => {
                      const statusInfo = calcularStatusPrazo(prazo.data_vencimento, prazo.status);
                      const isCumprido = prazo.status.toLowerCase() === 'cumprido';
                      const proc = prazo.processo;
                      const cliente = proc?.cliente;

                      return (
                        <tr
                          key={prazo.id_prazo}
                          className={`transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                            statusInfo.urgencia === 'hoje'
                              ? 'bg-red-50/40 dark:bg-red-950/20'
                              : statusInfo.urgencia === 'vencido'
                              ? 'bg-rose-50/30 dark:bg-rose-950/15'
                              : isCumprido
                              ? 'opacity-85'
                              : ''
                          }`}
                        >
                          {/* Checkbox / Toggle Rápido de Cumprimento */}
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStatus(prazo)}
                              title={isCumprido ? 'Reabrir prazo (marcar como Pendente)' : 'Concluir / Marcar como Cumprido'}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                                isCumprido
                                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'border-slate-300 bg-white text-slate-400 hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-800 dark:hover:text-amber-400'
                              }`}
                            >
                              {isCumprido ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <div className="h-3.5 w-3.5 rounded-xs border border-dashed border-slate-400" />
                              )}
                            </button>
                          </td>

                          {/* Ato / Descrição do Prazo */}
                          <td className="px-6 py-4 max-w-sm">
                            <div
                              className={`font-semibold text-slate-900 dark:text-slate-100 ${
                                isCumprido ? 'line-through text-slate-500 dark:text-slate-400' : ''
                              }`}
                            >
                              {prazo.descricao}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusInfo.badgeClass}`}
                              >
                                <statusInfo.icon className="h-3 w-3" />
                                {statusInfo.badgeText}
                              </span>
                            </div>
                          </td>

                          {/* Vencimento */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <div>
                                <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {new Date(prazo.data_vencimento).toLocaleDateString('pt-BR', {
                                    timeZone: 'UTC',
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                  })}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {statusInfo.label}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Processo Vinculado */}
                          <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                            {proc ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                                    {proc.numero_processo}
                                  </span>
                                  <button
                                    onClick={() => handleCopy(proc.numero_processo, `proc-${prazo.id_prazo}`)}
                                    title="Copiar número do processo"
                                    className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                  >
                                    {copiedId === `proc-${prazo.id_prazo}` ? (
                                      <Check className="h-3 w-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                                <p className="mt-0.5 text-xs text-slate-500 truncate dark:text-slate-400 max-w-[220px]" title={proc.titulo}>
                                  {proc.titulo}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Processo #{prazo.id_processo}</span>
                            )}
                          </td>

                          {/* Cliente Associado */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {cliente ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                                  <Users className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900 dark:text-slate-100 text-xs truncate max-w-[160px]">
                                    {cliente.nome}
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                    {cliente.cpf_cnpj}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(prazo)}
                                title="Editar prazo"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-800 dark:text-slate-400 dark:hover:bg-amber-950/60 dark:hover:text-amber-300"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setPrazoToDelete(prazo);
                                  setDeleteModalOpen(true);
                                }}
                                title="Excluir prazo"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Rodapé da tabela */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              <span>
                Exibindo <strong>{filteredPrazos.length}</strong> de <strong>{prazos.length}</strong> prazos
              </span>
              {isUsingMock && (
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                  <Info className="h-3.5 w-3.5" />
                  Modo local de demonstração
                </span>
              )}
            </div>
          </div>
        ) : (
          /* VISUALIZAÇÃO EM CARDS / LINHA DO TEMPO */
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-500">
                <div className="inline-flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-amber-800 dark:text-amber-400" />
                  <span>Carregando agenda...</span>
                </div>
              </div>
            ) : filteredPrazos.length === 0 ? (
              <div className="col-span-full rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                <CalendarClock className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Nenhum prazo encontrado
                </h3>
                <p className="mt-1 text-xs text-slate-500">Tente ajustar os filtros de busca.</p>
              </div>
            ) : (
              filteredPrazos.map((prazo) => {
                const statusInfo = calcularStatusPrazo(prazo.data_vencimento, prazo.status);
                const isCumprido = prazo.status.toLowerCase() === 'cumprido';
                const proc = prazo.processo;
                const cliente = proc?.cliente;

                return (
                  <div
                    key={prazo.id_prazo}
                    className={`relative flex flex-col justify-between rounded-xl border p-5 shadow-2xs transition hover:shadow-md ${
                      statusInfo.urgencia === 'hoje'
                        ? 'border-red-400 bg-red-50/20 dark:border-red-800 dark:bg-red-950/20'
                        : statusInfo.urgencia === 'vencido'
                        ? 'border-rose-300 bg-rose-50/20 dark:border-rose-900 dark:bg-rose-950/20'
                        : statusInfo.urgencia === 'urgente'
                        ? 'border-amber-300 bg-amber-50/15 dark:border-amber-900 dark:bg-amber-950/20'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      {/* Cabeçalho do Card */}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badgeClass}`}
                        >
                          <statusInfo.icon className="h-3.5 w-3.5" />
                          {statusInfo.badgeText}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(prazo)}
                            title="Editar"
                            className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setPrazoToDelete(prazo);
                              setDeleteModalOpen(true);
                            }}
                            title="Excluir"
                            className="rounded p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Descrição do Prazo */}
                      <h3
                        className={`mt-3 font-medium text-slate-900 text-sm leading-snug dark:text-slate-100 ${
                          isCumprido ? 'line-through text-slate-500 dark:text-slate-400' : ''
                        }`}
                      >
                        {prazo.descricao}
                      </h3>

                      {/* Vencimento Data */}
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                        <Calendar className="h-4 w-4 text-amber-800 dark:text-amber-400" />
                        <div>
                          <div className="font-semibold">
                            {new Date(prazo.data_vencimento).toLocaleDateString('pt-BR', {
                              timeZone: 'UTC',
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Informações do Processo e Cliente */}
                      {proc && (
                        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{proc.numero_processo}</span>
                          </div>
                          {cliente && (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{cliente.nome}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botão de Ação Rápida */}
                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        onClick={() => handleToggleStatus(prazo)}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                          isCumprido
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98'
                        }`}
                      >
                        {isCumprido ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            Reabrir Prazo
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Marcar como Cumprido
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-900 text-amber-100 dark:bg-amber-800">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                    {editingPrazo ? 'Editar Prazo Processual' : 'Cadastrar Novo Prazo'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Defina a data fatal, o ato a ser cumprido e vincule aos autos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSavePrazo} className="mt-5 space-y-4">
              {/* Dropdown de Processo */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Processo Judicial Vinculado *
                  </label>
                  <Link
                    href="/processos"
                    className="text-[11px] text-amber-800 hover:underline dark:text-amber-400"
                  >
                    + Novo Processo
                  </Link>
                </div>
                <select
                  value={idProcesso}
                  onChange={(e) => setIdProcesso(e.target.value)}
                  disabled={loadingProcessos}
                  className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                    formErrors.idProcesso
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                      : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                  }`}
                >
                  <option value="">Selecione um processo...</option>
                  {processos.map((p) => {
                    const cName = p.cliente?.nome ? ` (${p.cliente.nome})` : '';
                    return (
                      <option key={p.id_processo} value={p.id_processo}>
                        {p.numero_processo} - {p.titulo}
                        {cName}
                      </option>
                    );
                  })}
                </select>
                {formErrors.idProcesso && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.idProcesso}</p>
                )}
              </div>

              {/* Descrição do Ato / Prazo */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Descrição do Ato Processual / Prazo *
                </label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Protocolar Réplica à Contestação com documentos probatórios"
                  maxLength={255}
                  className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                    formErrors.descricao
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                      : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                  }`}
                />
                {formErrors.descricao && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.descricao}</p>
                )}

                {/* Sugestões Rápidas de Prazos Típicos */}
                <div className="mt-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Atos frequentes:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {SUGESTOES_PRAZO.slice(0, 4).map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDescricao(sug)}
                        className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-amber-100 hover:text-amber-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-950"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data de Vencimento e Status */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Data de Vencimento / Termo Fatal *
                  </label>
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                      formErrors.dataVencimento
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                        : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                    }`}
                  />
                  {formErrors.dataVencimento && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {formErrors.dataVencimento}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Status do Prazo *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Elaboração">Em Elaboração</option>
                    <option value="Em Revisão">Em Revisão</option>
                    <option value="Cumprido">Cumprido</option>
                  </select>
                </div>
              </div>

              {/* Botões de Ação do Modal */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-700"
                >
                  {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {editingPrazo ? 'Atualizar Prazo' : 'Salvar na Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteModalOpen && prazoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                Excluir Prazo Processual
              </h3>
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Tem certeza que deseja excluir o prazo &ldquo;
              <strong className="text-slate-900 dark:text-slate-100">
                {prazoToDelete.descricao}
              </strong>
              &rdquo; agendado para{' '}
              {new Date(prazoToDelete.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPrazoToDelete(null);
                }}
                disabled={deleting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeletePrazo}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
