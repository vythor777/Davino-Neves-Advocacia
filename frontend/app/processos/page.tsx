'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
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
  return (
    <AuthGuard>
      <ProcessosContent />
    </AuthGuard>
  );
}

function ProcessosContent() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingClientes, setLoadingClientes] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Carregar Processos
  const fetchProcessos = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [procData, clientData] = await Promise.all([
        processoService.getAll(),
        clienteService.getAll(),
      ]);
      setProcessos(Array.isArray(procData) ? procData : []);
      setClientes(Array.isArray(clientData) ? clientData : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com o servidor.';
      setErrorMsg(msg);
      setProcessos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcessos();
  }, [fetchProcessos]);

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

    try {
      if (editingProcesso) {
        await processoService.update(editingProcesso.id_processo, payload);
        setSuccessMsg(`Processo "${numeroProcesso}" atualizado com sucesso no banco!`);
      } else {
        await processoService.create(payload);
        setSuccessMsg(`Processo "${numeroProcesso}" cadastrado com sucesso no banco!`);
      }
      setModalOpen(false);
      await fetchProcessos();
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
    setErrorMsg(null);
    try {
      await processoService.delete(processoToDelete.id_processo);
      setSuccessMsg(`Processo "${processoToDelete.numero_processo}" removido com sucesso.`);
      setDeleteModalOpen(false);
      setProcessoToDelete(null);
      await fetchProcessos();
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
      if (selectedStatus !== 'todos') {
        if (proc.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      if (selectedClienteFilter !== 'todos') {
        if (String(proc.id_cliente) !== selectedClienteFilter) {
          return false;
        }
      }

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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner de Feedback / Alertas */}
        {successMsg && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">{successMsg}</span>
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
          <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300 text-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button
              onClick={fetchProcessos}
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
                <Briefcase className="h-5 w-5" />
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Controle de Processos
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Acompanhamento de autos judiciais, comarcas, clientes vinculados e andamentos processuais.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProcessos}
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
              Novo Processo
            </button>
          </div>
        </div>

        {/* Métricas do Módulo */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Processos</span>
              <Briefcase className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
              {totalProcessos}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Em Andamento</span>
              <Scale className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
              {totalEmAndamento}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Conclusos / Pautas</span>
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
              {totalConclusos}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Finalizados / Arquivados</span>
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
              {totalArquivados}
            </p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número CNJ, título, cliente ou comarca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-600 focus:outline-hidden focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="todos">Todos os Status</option>
              {STATUS_OPCOES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {clientes.length > 0 && (
              <select
                value={selectedClienteFilter}
                onChange={(e) => setSelectedClienteFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="todos">Todos os Clientes</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={String(c.id_cliente)}>
                    {c.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tabela de Processos */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-amber-700 dark:text-amber-500" />
              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                Carregando processos do banco de dados...
              </p>
            </div>
          ) : filteredProcessos.length === 0 ? (
            <div className="py-16 text-center px-4">
              <Scale className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-3 font-serif text-lg font-bold text-slate-800 dark:text-slate-200">
                Nenhum processo judicial encontrado
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {searchTerm || selectedStatus !== 'todos' || selectedClienteFilter !== 'todos'
                  ? 'Nenhum resultado corresponde aos filtros aplicados.'
                  : 'Cadastre o primeiro processo para acompanhar termos e prazos.'}
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
              >
                <PlusCircle className="h-4 w-4" />
                Cadastrar Processo
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <tr>
                    <th className="py-3.5 pl-6 pr-3">Processo (CNJ) / Ação</th>
                    <th className="px-3 py-3.5">Cliente Vinculado</th>
                    <th className="px-3 py-3.5">Status</th>
                    <th className="px-3 py-3.5">Data de Distribuição</th>
                    <th className="px-3 py-3.5">Prazos</th>
                    <th className="py-3.5 pl-3 pr-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredProcessos.map((proc) => {
                    const countPrazos = proc._count?.prazos ?? proc.prazos?.length ?? 0;
                    return (
                      <tr
                        key={proc.id_processo}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="py-4 pl-6 pr-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                                {formatarNumeroCNJ(proc.numero_processo)}
                              </span>
                              <button
                                onClick={() => handleCopy(proc.numero_processo, `cnj-${proc.id_processo}`)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Copiar número CNJ"
                              >
                                {copiedId === `cnj-${proc.id_processo}` ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedProcesso(proc);
                                setDetailsModalOpen(true);
                              }}
                              className="font-medium text-amber-900 hover:underline dark:text-amber-400 text-left block line-clamp-1"
                            >
                              {proc.titulo}
                            </button>
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          {proc.cliente ? (
                            <div>
                              <span className="font-medium text-slate-800 dark:text-slate-200 block">
                                {proc.cliente.nome}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {proc.cliente.cpf_cnpj}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">ID #{proc.id_cliente}</span>
                          )}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold ${getStatusBadgeStyle(
                              proc.status,
                            )}`}
                          >
                            {proc.status}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-slate-500 dark:text-slate-400">
                          {new Date(proc.data_abertura).toLocaleDateString('pt-BR')}
                        </td>

                        <td className="px-3 py-4">
                          <Link
                            href={`/prazos?processo=${proc.id_processo}`}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition hover:opacity-80 ${
                              countPrazos > 0
                                ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {countPrazos} {countPrazos === 1 ? 'prazo' : 'prazos'}
                          </Link>
                        </td>

                        <td className="py-4 pl-3 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedProcesso(proc);
                                setDetailsModalOpen(true);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              title="Visualizar detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => openEditModal(proc)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                              title="Editar processo"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => {
                                setProcessoToDelete(proc);
                                setDeleteModalOpen(true);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                              title="Excluir processo"
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
      </main>

      {/* Modal de Criação / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  {editingProcesso ? <Edit2 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  {editingProcesso ? 'Editar Processo Judicial' : 'Novo Processo Judicial'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProcesso} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Número Único CNJ * (20 dígitos)
                </label>
                <input
                  type="text"
                  value={numeroProcesso}
                  onChange={(e) => setNumeroProcesso(formatarNumeroCNJ(e.target.value))}
                  placeholder="0000000-00.0000.0.00.0000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 font-mono"
                />
                {formErrors.numeroProcesso && (
                  <p className="text-red-500 mt-1">{formErrors.numeroProcesso}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título / Classe Processual *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Ação de Cobrança e Perdas e Danos"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                {formErrors.titulo && <p className="text-red-500 mt-1">{formErrors.titulo}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cliente Vinculado *
                  </label>
                  <select
                    value={idCliente}
                    onChange={(e) => setIdCliente(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="">Selecione o Cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id_cliente} value={String(c.id_cliente)}>
                        {c.nome} ({c.cpf_cnpj})
                      </option>
                    ))}
                  </select>
                  {formErrors.idCliente && <p className="text-red-500 mt-1">{formErrors.idCliente}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Distribuição / Abertura *
                  </label>
                  <input
                    type="date"
                    value={dataAbertura}
                    onChange={(e) => setDataAbertura(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  {formErrors.dataAbertura && (
                    <p className="text-red-500 mt-1">{formErrors.dataAbertura}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status Atual *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {STATUS_OPCOES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição / Objeto da Ação *
                </label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva a vara, foro, síntese dos pedidos e detalhes relevantes..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 resize-none"
                />
                {formErrors.descricao && <p className="text-red-500 mt-1">{formErrors.descricao}</p>}
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
                  {saving ? 'Salvando...' : editingProcesso ? 'Atualizar Processo' : 'Salvar no Banco'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {deleteModalOpen && processoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900/40 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="rounded-xl bg-red-100 p-2 dark:bg-red-950/60">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Confirmar Exclusão
              </h3>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tem certeza que deseja excluir o processo{' '}
              <strong>{processoToDelete.numero_processo}</strong>? Prazos e documentos associados poderão ser desvinculados.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteProcesso}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer / Modal de Detalhes */}
      {detailsModalOpen && selectedProcesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    Autos Processuais #{selectedProcesso.id_processo}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    {formatarNumeroCNJ(selectedProcesso.numero_processo)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ação / Título</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {selectedProcesso.titulo}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cliente</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {selectedProcesso.cliente?.nome || `Cliente #${selectedProcesso.id_cliente}`}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
                  <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[10px] mt-0.5 ${getStatusBadgeStyle(selectedProcesso.status)}`}>
                    {selectedProcesso.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Descrição / Objeto</span>
                <p className="text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
                  {selectedProcesso.descricao}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-amber-600 dark:hover:bg-amber-500"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
