'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { processoService, Processo, CreateProcessoInput } from '@/services/processoService';
import { clienteService, Cliente } from '@/services/clienteService';
import {
  Briefcase,
  PlusCircle,
  Search,
  Users,
  Calendar,
  Clock,
  FileText,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  X,
  Copy,
  Check,
  RefreshCw,
  Info,
  Scale,
  Filter,
} from 'lucide-react';

// Dados iniciais de demonstração (fallback caso o backend esteja em inicialização ou sem registros)
const MOCK_CLIENTES: Cliente[] = [
  {
    id_cliente: 1,
    nome: 'Carlos Eduardo Silveira',
    cpf_cnpj: '123.456.789-00',
    email: 'carlos.silveira@email.com',
    telefone: '(11) 98765-4321',
    endereco: 'Av. Paulista, 1000, Apto 42 - Bela Vista, São Paulo/SP',
    data_criacao: '2026-02-15T10:00:00.000Z',
    data_atualizacao: '2026-02-15T10:00:00.000Z',
  },
  {
    id_cliente: 2,
    nome: 'Construtora Horizonte Verde Ltda',
    cpf_cnpj: '12.345.678/0001-90',
    email: 'juridico@horizonteverde.com.br',
    telefone: '(11) 3210-9876',
    endereco: 'Rua Funchal, 418, 14º andar - Vila Olímpia, São Paulo/SP',
    data_criacao: '2026-01-20T14:30:00.000Z',
    data_atualizacao: '2026-01-20T14:30:00.000Z',
  },
  {
    id_cliente: 3,
    nome: 'Mariana Duarte Souza',
    cpf_cnpj: '987.654.321-11',
    email: 'mariana.duarte@adv.br',
    telefone: '(21) 99887-6655',
    endereco: 'Rua Visconde de Pirajá, 303 - Ipanema, Rio de Janeiro/RJ',
    data_criacao: '2026-02-01T09:15:00.000Z',
    data_atualizacao: '2026-02-01T09:15:00.000Z',
  },
];

const MOCK_PROCESSOS: Processo[] = [
  {
    id_processo: 1,
    numero_processo: '1002345-67.2026.8.26.0100',
    titulo: 'Ação de Cobrança e Indenização por Perdas e Danos',
    descricao: 'Ação ordinária em trâmite perante a 2ª Vara Cível do Foro Central Cível da Comarca de São Paulo/SP. Cobrança de faturas inadimplidas e reparação civil.',
    data_abertura: '2026-01-15T00:00:00.000Z',
    status: 'Em Andamento',
    id_cliente: 2,
    data_criacao: '2026-01-15T11:00:00.000Z',
    data_atualizacao: '2026-02-10T14:20:00.000Z',
    cliente: MOCK_CLIENTES[1],
    prazos: [
      { id_prazo: 1, descricao: 'Apresentar Réplica à Contestação', data_limite: '2026-03-10T23:59:59.000Z', status: 'pendente' },
    ],
    documentos: [
      { id_documento: 1, nome_arquivo: 'Peticao_Inicial.pdf', tipo_documento: 'Petição', data_upload: '2026-01-15T11:00:00.000Z' },
      { id_documento: 2, nome_arquivo: 'Contrato_Prestacao_Servicos.pdf', tipo_documento: 'Contrato', data_upload: '2026-01-15T11:05:00.000Z' },
    ],
    _count: { prazos: 1, documentos: 2 },
  },
  {
    id_processo: 2,
    numero_processo: '0010456-89.2026.5.02.0045',
    titulo: 'Reclamação Trabalhista - Horas Extras e Verbas Rescisórias',
    descricao: '45ª Vara do Trabalho de São Paulo - TRT2. Requerimento de pagamento de horas extraordinárias, reflexos e adicional de insalubridade.',
    data_abertura: '2026-02-02T00:00:00.000Z',
    status: 'Distribuído',
    id_cliente: 1,
    data_criacao: '2026-02-02T09:30:00.000Z',
    data_atualizacao: '2026-02-02T09:30:00.000Z',
    cliente: MOCK_CLIENTES[0],
    prazos: [
      { id_prazo: 2, descricao: 'Audiência Una Designada', data_limite: '2026-03-25T14:00:00.000Z', status: 'agendado' },
    ],
    documentos: [
      { id_documento: 3, nome_arquivo: 'Reclamacao_Inicial.pdf', tipo_documento: 'Petição', data_upload: '2026-02-02T09:30:00.000Z' },
    ],
    _count: { prazos: 1, documentos: 1 },
  },
  {
    id_processo: 3,
    numero_processo: '5003412-11.2025.4.02.5101',
    titulo: 'Mandado de Segurança - Compensação Tributária',
    descricao: '1ª Vara Federal do Rio de Janeiro - TRF2. Impetração contra ato do Delegado da Receita Federal sobre créditos de PIS/COFINS.',
    data_abertura: '2025-11-20T00:00:00.000Z',
    status: 'Concluso para Decisão',
    id_cliente: 3,
    data_criacao: '2025-11-20T16:00:00.000Z',
    data_atualizacao: '2026-02-18T10:15:00.000Z',
    cliente: MOCK_CLIENTES[2],
    prazos: [],
    documentos: [
      { id_documento: 4, nome_arquivo: 'Inicial_MS_Tributario.pdf', tipo_documento: 'Petição', data_upload: '2025-11-20T16:00:00.000Z' },
    ],
    _count: { prazos: 0, documentos: 1 },
  },
];

const STATUS_OPCOES = [
  'Distribuído',
  'Em Andamento',
  'Concluso para Decisão',
  'Aguardando Audiência',
  'Em Grau de Recurso',
  'Suspenso',
  'Finalizado / Julgado',
  'Arquivado',
];

// Utilitário de formatação de número CNJ do processo: NNNNNNN-DD.YYYY.J.TR.OOOO (20 dígitos)
function formatarNumeroCNJ(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 20);
  if (digits.length <= 7) return digits;
  if (digits.length <= 9) return digits.replace(/^(\d{7})(\d+)/, '$1-$2');
  if (digits.length <= 13) return digits.replace(/^(\d{7})(\d{2})(\d+)/, '$1-$2.$3');
  if (digits.length <= 14) return digits.replace(/^(\d{7})(\d{2})(\d{4})(\d+)/, '$1-$2.$3.$4');
  if (digits.length <= 16) return digits.replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d+)/, '$1-$2.$3.$4.$5');
  return digits.replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{1,4})/, '$1-$2.$3.$4.$5.$6');
}

function getStatusBadgeStyle(status: string) {
  const s = status.toLowerCase();
  if (s.includes('andamento')) {
    return 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:border-amber-900/60 dark:text-amber-300';
  }
  if (s.includes('distribuído') || s.includes('distribuido')) {
    return 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:border-blue-900/60 dark:text-blue-300';
  }
  if (s.includes('concluso') || s.includes('decisão') || s.includes('despacho')) {
    return 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:border-purple-900/60 dark:text-purple-300';
  }
  if (s.includes('audiência') || s.includes('audiencia')) {
    return 'bg-indigo-100 text-indigo-900 border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-900/60 dark:text-indigo-300';
  }
  if (s.includes('suspenso') || s.includes('aguardando')) {
    return 'bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-950/60 dark:border-orange-900/60 dark:text-orange-300';
  }
  if (s.includes('finalizado') || s.includes('julgado')) {
    return 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900/60 dark:text-emerald-300';
  }
  if (s.includes('arquivado')) {
    return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300';
  }
  return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300';
}

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingClientes, setLoadingClientes] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState<boolean>(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedClienteFilter, setSelectedClienteFilter] = useState<string>('todos');

  // Modal de Criação / Edição
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form Fields
  const [numeroProcesso, setNumeroProcesso] = useState<string>('');
  const [titulo, setTitulo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [dataAbertura, setDataAbertura] = useState<string>('');
  const [status, setStatus] = useState<string>('Em Andamento');
  const [idCliente, setIdCliente] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [processoToDelete, setProcessoToDelete] = useState<Processo | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Modal / Drawer de Detalhes
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);

  // Cópia para o clipboard
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Carregar Clientes para o Select
  const fetchClientesList = useCallback(async () => {
    setLoadingClientes(true);
    try {
      const data = await clienteService.getAll();
      if (data && Array.isArray(data) && data.length > 0) {
        setClientes(data);
      } else {
        setClientes(MOCK_CLIENTES);
      }
    } catch {
      setClientes(MOCK_CLIENTES);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Carregar Processos
  const fetchProcessos = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await processoService.getAll();
      if (data && Array.isArray(data)) {
        setProcessos(data);
        setIsUsingMock(false);
      } else {
        setProcessos([]);
        setIsUsingMock(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com o servidor.';
      console.warn('API não conectada ou offline. Carregando dados demonstrativos de processos:', msg);
      setProcessos(MOCK_PROCESSOS);
      setIsUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [procData, clientData] = await Promise.allSettled([
          processoService.getAll(),
          clienteService.getAll(),
        ]);

        if (!active) return;

        if (procData.status === 'fulfilled' && Array.isArray(procData.value)) {
          setProcessos(procData.value);
          setIsUsingMock(false);
        } else {
          setProcessos(MOCK_PROCESSOS);
          setIsUsingMock(true);
        }

        if (clientData.status === 'fulfilled' && Array.isArray(clientData.value) && clientData.value.length > 0) {
          setClientes(clientData.value);
        } else {
          setClientes(MOCK_CLIENTES);
        }
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Falha ao carregar dados.';
        console.warn('Carregando dados padrão:', msg);
        setProcessos(MOCK_PROCESSOS);
        setClientes(MOCK_CLIENTES);
        setIsUsingMock(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

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
    setEditingProcesso(null);
    setNumeroProcesso('');
    setTitulo('');
    setDescricao('');
    // Padrão: data de hoje no formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    setDataAbertura(today);
    setStatus('Em Andamento');
    setIdCliente(clientes.length > 0 ? String(clientes[0].id_cliente) : '');
    setFormErrors({});
    setModalOpen(true);
    if (clientes.length === 0) {
      fetchClientesList();
    }
  };

  const openEditModal = (proc: Processo) => {
    setEditingProcesso(proc);
    setNumeroProcesso(proc.numero_processo);
    setTitulo(proc.titulo);
    setDescricao(proc.descricao);
    const dateFormatted = proc.data_abertura
      ? new Date(proc.data_abertura).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    setDataAbertura(dateFormatted);
    setStatus(proc.status);
    setIdCliente(String(proc.id_cliente));
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!numeroProcesso.trim()) {
      errors.numeroProcesso = 'O número do processo é obrigatório.';
    }
    if (!titulo.trim()) {
      errors.titulo = 'O título ou tipo de ação é obrigatório.';
    } else if (titulo.length > 100) {
      errors.titulo = 'O título não pode exceder 100 caracteres.';
    }
    if (!descricao.trim()) {
      errors.descricao = 'A descrição / objeto da ação é obrigatória.';
    }
    if (!dataAbertura) {
      errors.dataAbertura = 'A data de distribuição/abertura é obrigatória.';
    }
    if (!status.trim()) {
      errors.status = 'O status atual é obrigatório.';
    }
    if (!idCliente || Number(idCliente) <= 0) {
      errors.idCliente = 'Selecione o cliente vinculado ao processo.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setErrorMsg(null);

    const payload: CreateProcessoInput = {
      numero_processo: numeroProcesso.trim(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      data_abertura: dataAbertura,
      status: status.trim(),
      id_cliente: Number(idCliente),
    };

    const clienteObj = clientes.find((c) => c.id_cliente === Number(idCliente));

    try {
      if (editingProcesso) {
        if (isUsingMock) {
          setProcessos((prev) =>
            prev.map((p) =>
              p.id_processo === editingProcesso.id_processo
                ? {
                    ...p,
                    ...payload,
                    cliente: clienteObj || p.cliente,
                    data_atualizacao: new Date().toISOString(),
                  }
                : p,
            ),
          );
        } else {
          await processoService.update(editingProcesso.id_processo, payload);
          await fetchProcessos();
        }
        setSuccessMsg(`Processo "${numeroProcesso}" atualizado com sucesso!`);
      } else {
        if (isUsingMock) {
          const newMockProc: Processo = {
            id_processo: Math.max(...processos.map((p) => p.id_processo), 0) + 1,
            ...payload,
            cliente: clienteObj,
            data_criacao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString(),
            prazos: [],
            documentos: [],
            _count: { prazos: 0, documentos: 0 },
          };
          setProcessos((prev) => [newMockProc, ...prev]);
        } else {
          await processoService.create(payload);
          await fetchProcessos();
        }
        setSuccessMsg(`Processo "${numeroProcesso}" cadastrado com sucesso!`);
      }
      setModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar processo.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProcesso = async () => {
    if (!processoToDelete) return;
    setDeleting(true);
    try {
      if (isUsingMock) {
        setProcessos((prev) => prev.filter((p) => p.id_processo !== processoToDelete.id_processo));
      } else {
        await processoService.delete(processoToDelete.id_processo);
        await fetchProcessos();
      }
      setSuccessMsg(`Processo "${processoToDelete.numero_processo}" removido com sucesso.`);
      setDeleteModalOpen(false);
      setProcessoToDelete(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao remover processo.';
      setErrorMsg(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Filtragem
  const filteredProcessos = useMemo(() => {
    return processos.filter((proc) => {
      // Filtro de Status
      if (selectedStatus !== 'todos') {
        if (proc.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // Filtro de Cliente
      if (selectedClienteFilter !== 'todos') {
        if (String(proc.id_cliente) !== selectedClienteFilter) {
          return false;
        }
      }

      // Filtro de Busca Textual (Número, Título, Descrição, Nome do Cliente, CPF/CNPJ)
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const clientName = proc.cliente?.nome?.toLowerCase() || '';
      const clientDoc = proc.cliente?.cpf_cnpj?.toLowerCase() || '';
      const procNum = proc.numero_processo.toLowerCase();
      const procTitle = proc.titulo.toLowerCase();
      const procDesc = proc.descricao.toLowerCase();

      return (
        procNum.includes(term) ||
        procTitle.includes(term) ||
        procDesc.includes(term) ||
        clientName.includes(term) ||
        clientDoc.includes(term)
      );
    });
  }, [processos, searchTerm, selectedStatus, selectedClienteFilter]);

  // Métricas
  const totalProcessos = processos.length;
  const totalEmAndamento = processos.filter((p) => p.status.toLowerCase().includes('andamento') || p.status.toLowerCase().includes('distribu')).length;
  const totalConclusos = processos.filter((p) => p.status.toLowerCase().includes('concluso') || p.status.toLowerCase().includes('audiência') || p.status.toLowerCase().includes('recurso')).length;
  const totalArquivados = processos.filter((p) => p.status.toLowerCase().includes('arquivado') || p.status.toLowerCase().includes('julgado') || p.status.toLowerCase().includes('finalizado')).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner de Feedback / Alertas */}
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
              <Scale className="h-4 w-4" />
              Controladoria Jurídica
            </div>
            <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Gestão de Processos
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Acompanhe autos judiciais, comarcas, clientes vinculados e andamentos processuais.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchProcessos}
              disabled={loading}
              title="Atualizar lista de processos"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-amber-800 active:scale-[0.98] dark:bg-amber-700 dark:hover:bg-amber-600"
            >
              <PlusCircle className="h-4 w-4" />
              Novo Processo
            </button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Processos</span>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalProcessos}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Na base do escritório</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Em Andamento / Ativos</span>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalEmAndamento}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Distribuídos ou em curso</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Conclusos / Pautas</span>
              <div className="rounded-lg bg-purple-50 p-2 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalConclusos}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Decisões, audiências e recursos</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Baixados / Arquivados</span>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalArquivados}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Com trânsito em julgado</span>
          </div>
        </div>

        {/* Barra de Filtros e Pesquisa */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número CNJ, título da ação, cliente, vara ou comarca..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 lg:border-t-0 lg:pt-0 dark:border-slate-800">
            {/* Filtro de Status */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="todos">Todos os Status</option>
                {STATUS_OPCOES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Cliente */}
            <select
              value={selectedClienteFilter}
              onChange={(e) => setSelectedClienteFilter(e.target.value)}
              className="max-w-[200px] truncate rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="todos">Todos os Clientes</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={String(c.id_cliente)}>
                  {c.nome}
                </option>
              ))}
            </select>

            {(selectedStatus !== 'todos' || selectedClienteFilter !== 'todos' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedStatus('todos');
                  setSelectedClienteFilter('todos');
                  setSearchTerm('');
                }}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Tabela de Processos */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/80 text-xs font-semibold tracking-wide uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Número do Processo (CNJ)
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Ação / Título
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Cliente Vinculado
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Prazos / Docs
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
                        <span>Carregando processos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProcessos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <Briefcase className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Nenhum processo encontrado
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {searchTerm || selectedStatus !== 'todos' || selectedClienteFilter !== 'todos'
                          ? 'Tente ajustar os filtros ou termos da sua busca.'
                          : 'Inicie distribuindo ou cadastrando o primeiro processo do escritório.'}
                      </p>
                      {!searchTerm && selectedStatus === 'todos' && selectedClienteFilter === 'todos' && (
                        <button
                          onClick={openCreateModal}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-amber-700"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          Cadastrar Primeiro Processo
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredProcessos.map((proc) => {
                    const clientName = proc.cliente?.nome || `Cliente #${proc.id_cliente}`;
                    const clientDoc = proc.cliente?.cpf_cnpj || '';
                    const numPrazos = proc._count?.prazos ?? (proc.prazos?.length ?? 0);
                    const numDocs = proc._count?.documentos ?? (proc.documentos?.length ?? 0);

                    return (
                      <tr
                        key={proc.id_processo}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        {/* Número CNJ */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {proc.numero_processo}
                            </div>
                            <button
                              onClick={() => handleCopy(proc.numero_processo, `proc-${proc.id_processo}`)}
                              title="Copiar número do processo"
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              {copiedId === `proc-${proc.id_processo}` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Abertura: {new Date(proc.data_abertura).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </td>

                        {/* Ação / Título */}
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-medium text-slate-900 line-clamp-1 dark:text-slate-100">
                            {proc.titulo}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1 dark:text-slate-400">
                            {proc.descricao}
                          </p>
                        </td>

                        {/* Cliente Vinculado */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                              <Users className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                                {clientName}
                              </div>
                              {clientDoc && (
                                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                  {clientDoc}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeStyle(
                              proc.status,
                            )}`}
                          >
                            {proc.status}
                          </span>
                        </td>

                        {/* Prazos / Documentos */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                                numPrazos > 0
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                              }`}
                              title={`${numPrazos} prazo(s) vinculado(s)`}
                            >
                              <Clock className="h-3 w-3" />
                              {numPrazos}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                                numDocs > 0
                                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                              }`}
                              title={`${numDocs} documento(s) anexado(s)`}
                            >
                              <FileText className="h-3 w-3" />
                              {numDocs}
                            </span>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedProcesso(proc);
                                setDetailsModalOpen(true);
                              }}
                              title="Visualizar detalhes do processo"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(proc)}
                              title="Editar processo"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-800 dark:text-slate-400 dark:hover:bg-amber-950/60 dark:hover:text-amber-300"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setProcessoToDelete(proc);
                                setDeleteModalOpen(true);
                              }}
                              title="Excluir processo"
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
              Exibindo <strong>{filteredProcessos.length}</strong> de <strong>{processos.length}</strong> processos
            </span>
            {isUsingMock && (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <Info className="h-3.5 w-3.5" />
                Modo local de demonstração
              </span>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-900 text-amber-100 dark:bg-amber-800">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                    {editingProcesso ? 'Editar Processo Judicial' : 'Cadastrar Novo Processo'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Preencha os dados dos autos, vincule o cliente e defina o status inicial.
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
            <form onSubmit={handleSaveProcesso} className="mt-5 space-y-4">
              {/* Cliente Vinculado (Dropdown dinâmico) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Cliente Vinculado (Pessoa Física ou Jurídica) *
                  </label>
                  <Link
                    href="/clientes"
                    className="text-[11px] text-amber-800 hover:underline dark:text-amber-400"
                  >
                    + Novo Cliente
                  </Link>
                </div>
                <select
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  disabled={loadingClientes}
                  className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                    formErrors.idCliente
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                      : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                  }`}
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nome} ({c.cpf_cnpj})
                    </option>
                  ))}
                </select>
                {formErrors.idCliente && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.idCliente}</p>
                )}
              </div>

              {/* Grid Número CNJ e Data de Abertura */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Número do Processo (CNJ) *
                  </label>
                  <input
                    type="text"
                    value={numeroProcesso}
                    onChange={(e) => setNumeroProcesso(formatarNumeroCNJ(e.target.value))}
                    placeholder="0000000-00.0000.0.00.0000"
                    maxLength={25}
                    className={`mt-1 w-full font-mono rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                      formErrors.numeroProcesso
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                        : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                    }`}
                  />
                  {formErrors.numeroProcesso && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {formErrors.numeroProcesso}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Data de Distribuição / Abertura *
                  </label>
                  <input
                    type="date"
                    value={dataAbertura}
                    onChange={(e) => setDataAbertura(e.target.value)}
                    className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                      formErrors.dataAbertura
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                        : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                    }`}
                  />
                  {formErrors.dataAbertura && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {formErrors.dataAbertura}
                    </p>
                  )}
                </div>
              </div>

              {/* Grid Título da Ação e Status */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Título / Tipo de Ação *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Ação de Cobrança c/c Danos Morais"
                    maxLength={100}
                    className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                      formErrors.titulo
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                        : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                    }`}
                  />
                  {formErrors.titulo && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.titulo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Status Atual *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {STATUS_OPCOES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descrição / Objeto da Causa / Vara */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Descrição dos Fatos, Vara, Comarca e Objeto da Causa *
                </label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: 3ª Vara Cível de São Paulo/SP. Ação versando sobre rescisão contratual com pedido de tutela antecipada."
                  className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                    formErrors.descricao
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                      : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                  }`}
                />
                {formErrors.descricao && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {formErrors.descricao}
                  </p>
                )}
              </div>

              {/* Ações do Modal */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-800 active:scale-[0.98] disabled:opacity-50 dark:bg-amber-700"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Gravando...
                    </>
                  ) : editingProcesso ? (
                    'Atualizar Processo'
                  ) : (
                    'Cadastrar Processo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteModalOpen && processoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/80">
                <Trash2 className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                Excluir Processo?
              </h2>
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Você está prestes a remover o processo{' '}
              <strong className="font-mono text-slate-900 dark:text-slate-100">
                {processoToDelete.numero_processo}
              </strong>{' '}
              ({processoToDelete.titulo}).
            </p>

            {((processoToDelete._count?.prazos ?? 0) > 0 || (processoToDelete._count?.documentos ?? 0) > 0) && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Aviso: Este processo possui{' '}
                  <strong>{processoToDelete._count?.prazos ?? 0} prazo(s)</strong> e{' '}
                  <strong>{processoToDelete._count?.documentos ?? 0} documento(s)</strong> vinculados.
                </span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProcessoToDelete(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProcesso}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Confirmar Exclusão'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / FICHA COMPLETA DO PROCESSO */}
      {detailsModalOpen && selectedProcesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-900 text-amber-100 dark:bg-amber-800">
                  <Scale className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
                    Ficha dos Autos
                  </h2>
                  <span className="font-mono text-xs text-amber-800 dark:text-amber-400 font-semibold">
                    {selectedProcesso.numero_processo}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedProcesso(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Grid de Informações Chave */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[11px] font-medium uppercase text-slate-400">Título da Ação</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedProcesso.titulo}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[11px] font-medium uppercase text-slate-400">Status Processual</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeStyle(
                      selectedProcesso.status,
                    )}`}
                  >
                    {selectedProcesso.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[11px] font-medium uppercase text-slate-400">Cliente / Parte Representada</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedProcesso.cliente?.nome || `Cliente ID #${selectedProcesso.id_cliente}`}
                </div>
                {selectedProcesso.cliente?.cpf_cnpj && (
                  <div className="text-xs font-mono text-slate-500">
                    {selectedProcesso.cliente.cpf_cnpj}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[11px] font-medium uppercase text-slate-400">Data de Distribuição / Abertura</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {new Date(selectedProcesso.data_abertura).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {/* Descrição dos Fatos / Objeto */}
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="text-[11px] font-medium uppercase text-slate-400">Objeto e Detalhes da Causa</div>
              <div className="mt-1 text-xs text-slate-800 leading-relaxed dark:text-slate-200 whitespace-pre-wrap">
                {selectedProcesso.descricao}
              </div>
            </div>

            {/* Prazos Vinculados */}
            {selectedProcesso.prazos && selectedProcesso.prazos.length > 0 && (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[11px] font-medium uppercase text-slate-400 mb-2">Prazos e Audiências</div>
                <div className="space-y-1.5">
                  {selectedProcesso.prazos.map((prz) => (
                    <div key={prz.id_prazo} className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{prz.descricao}</span>
                      <span className="font-mono text-amber-800 dark:text-amber-400 font-semibold">
                        {new Date(prz.data_limite).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões do Rodapé */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedProcesso.numero_processo, 'details-proc')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {copiedId === 'details-proc' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar CNJ
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    openEditModal(selectedProcesso);
                  }}
                  className="rounded-lg bg-amber-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-amber-700"
                >
                  Editar Processo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
