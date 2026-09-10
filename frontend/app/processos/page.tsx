'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { processoService, Processo, CreateProcessoInput } from '@/services/processoService';
import { clienteService, Cliente } from '@/services/clienteService';
import { ProcessosTable, formatarNumeroCNJ, getStatusBadgeStyle } from '@/components/ProcessosTable';
import { ProcessDataTable } from '@/components/ProcessDataTable';
import { NumberProcessInput } from '@/components/NumberProcessInput';
import { SearchInput } from '@/components/SearchInput';
import { TableSkeleton, MetricCardSkeleton } from '@/components/Skeleton';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { ConfirmModal } from '@/components/ConfirmModal';
import { AuditTrail } from '@/components/AuditTrail';
import { toast } from 'sonner';
import {
  Briefcase,
  PlusCircle,
  Clock,
  Edit2,
  X,
  RefreshCw,
  Scale,
  FileCheck2,
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

export default function ProcessosPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Carregando acervo processual...</div>}>
        <ProcessosContent />
      </Suspense>
    </AuthGuard>
  );
}

function ProcessosContent() {
  const searchParams = useSearchParams();
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingClientes, setLoadingClientes] = useState<boolean>(false);

  // Filtros e Busca com Debounce
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedClienteFilter, setSelectedClienteFilter] = useState<string>('todos');

  // Paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modais de Criação / Edição
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
    try {
      const [procData, clientData] = await Promise.all([
        processoService.getAll(),
        clienteService.getAll(),
      ]);
      setProcessos(Array.isArray(procData) ? procData : []);
      setClientes(Array.isArray(clientData) ? clientData : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com o servidor.';
      toast.error('Erro ao sincronizar processos', { description: msg });
      setProcessos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcessos();
  }, [fetchProcessos]);

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

  useEffect(() => {
    if (searchParams.get('novo') === 'true') {
      openCreateModal();
    }
  }, [searchParams]);

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
      errors.titulo = 'O título ou classe de ação é obrigatório.';
    } else if (titulo.length > 100) {
      errors.titulo = 'O título não pode exceder 100 caracteres.';
    }
    if (!descricao.trim()) {
      errors.descricao = 'A descrição ou objeto da ação é obrigatória.';
    }
    if (!dataAbertura) {
      errors.dataAbertura = 'A data de distribuição é obrigatória.';
    }
    if (!status.trim()) {
      errors.status = 'O status é obrigatório.';
    }
    if (!idCliente || Number(idCliente) <= 0) {
      errors.idCliente = 'Selecione o cliente vinculado.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
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
        toast.success('Processo atualizado com sucesso!', {
          description: `Autos CNJ ${formatarNumeroCNJ(numeroProcesso)} salvos no banco.`,
        });
      } else {
        await processoService.create(payload);
        toast.success('Processo cadastrado com sucesso!', {
          description: `Novo processo ${formatarNumeroCNJ(numeroProcesso)} registrado no sistema.`,
        });
      }
      setModalOpen(false);
      await fetchProcessos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar dados.';
      toast.error('Falha ao salvar processo', { description: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProcesso = async () => {
    if (!processoToDelete) return;
    setDeleting(true);
    try {
      await processoService.delete(processoToDelete.id_processo);
      toast.success('Processo removido com sucesso!', {
        description: `Autos ${formatarNumeroCNJ(processoToDelete.numero_processo)} excluídos.`,
      });
      setDeleteModalOpen(false);
      setProcessoToDelete(null);
      await fetchProcessos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao remover o registro.';
      toast.error('Erro na exclusão', { description: msg });
    } finally {
      setDeleting(false);
    }
  };

  // Filtragem Otimizada com Busca Debounced
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

  // Resetar para página 1 ao filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedClienteFilter, pageSize]);

  // Paginação assíncrona/local
  const paginatedProcessos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProcessos.slice(start, start + pageSize);
  }, [filteredProcessos, currentPage, pageSize]);

  // Métricas
  const totalProcessos = processos.length;
  const totalEmAndamento = processos.filter(
    (p) => p.status.toLowerCase().includes('andamento') || p.status.toLowerCase().includes('distribu')
  ).length;
  const totalConclusos = processos.filter(
    (p) =>
      p.status.toLowerCase().includes('concluso') ||
      p.status.toLowerCase().includes('audiência') ||
      p.status.toLowerCase().includes('recurso')
  ).length;
  const totalFinalizados = processos.filter(
    (p) =>
      p.status.toLowerCase().includes('arquivado') ||
      p.status.toLowerCase().includes('julgado') ||
      p.status.toLowerCase().includes('finalizado')
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 animate-fade-in-up">
      {/* Breadcrumb de Navegação */}
      <div>
        <Breadcrumbs items={[{ label: 'Processos', icon: Briefcase }]} />
      </div>

        {/* Cabeçalho Minimalista & Tipografia Sofisticada */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/[0.05]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Processos
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Acompanhe autos judiciais, comarcas, andamentos e clientes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchProcessos}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition cursor-pointer"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 stroke-[2]" />
              Novo processo
            </button>
          </div>
        </div>

        {/* Grid de Métricas Corporativas */}
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
              <div className="legal-card p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Total Ativo
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-[#dfcaa0]">
                    <Briefcase className="h-4 w-4 stroke-[1.25]" />
                  </div>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                  {totalProcessos}
                </p>
              </div>

              <div className="legal-card p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Em Andamento
                  </span>
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    <Scale className="h-4 w-4 stroke-[1.25]" />
                  </div>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                  {totalEmAndamento}
                </p>
              </div>

              <div className="legal-card p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Conclusos / Pautas
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300">
                    <Clock className="h-4 w-4 stroke-[1.25]" />
                  </div>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                  {totalConclusos}
                </p>
              </div>

              <div className="legal-card p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Encerrados
                  </span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <FileCheck2 className="h-4 w-4 stroke-[1.25]" />
                  </div>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                  {totalFinalizados}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Barra de Filtros com Busca Debounced de 400ms */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Buscar por CNJ, cliente, ação ou vara..."
              onSearch={setSearchTerm}
              delay={400}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-200 cursor-pointer"
            >
              <option value="todos" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Todos os Status</option>
              {STATUS_OPCOES.map((st) => (
                <option key={st} value={st} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                  {st}
                </option>
              ))}
            </select>

            {clientes.length > 0 && (
              <select
                value={selectedClienteFilter}
                onChange={(e) => setSelectedClienteFilter(e.target.value)}
                className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-200 cursor-pointer"
              >
                <option value="todos" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Todos os Clientes</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={String(c.id_cliente)} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    {c.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tabela de Alta Performance com Sticky Header e Paginação */}
        <ProcessDataTable
          processos={paginatedProcessos}
          loading={loading}
          skeletonRows={6}
          onViewDetails={(proc) => {
            setSelectedProcesso(proc);
            setDetailsModalOpen(true);
          }}
          onEdit={(proc) => {
            openEditModal(proc);
          }}
          onDelete={(proc) => {
            setProcessoToDelete(proc);
            setDeleteModalOpen(true);
          }}
          onEmptyAction={openCreateModal}
          emptyActionLabel="Novo processo"
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredProcessos.length}
          onPageChange={setCurrentPage}
        />

      {/* Modal de Criação / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg legal-modal-card fio-de-luz shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200/60 p-5 dark:border-white/[0.06] shrink-0 bg-slate-50/80 dark:bg-[#111722]">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25 p-2">
                  {editingProcesso ? <Edit2 className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                    {editingProcesso ? 'Editar processo' : 'Novo processo'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Preencha os dados dos autos e vincule ao cliente
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProcesso} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto p-5 space-y-3.5 text-xs flex-1">
              <NumberProcessInput
                id="modal-numero-processo"
                label="Número Único CNJ * (20 dígitos)"
                required
                value={numeroProcesso}
                onChange={(e) => setNumeroProcesso(e.target.value)}
                error={formErrors.numeroProcesso}
                helperText="Padrão CNJ: 0000000-00.0000.0.00.0000 (formatação automática)"
              />

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Título / Classe Processual *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Ação de Cobrança e Perdas e Danos"
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {formErrors.titulo && <p className="text-rose-500 mt-1">{formErrors.titulo}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cliente Vinculado *
                  </label>
                  <select
                    value={idCliente}
                    onChange={(e) => setIdCliente(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100"
                  >
                    <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Selecione o Cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id_cliente} value={String(c.id_cliente)} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                        {c.nome} ({c.cpf_cnpj})
                      </option>
                    ))}
                  </select>
                  {formErrors.idCliente && (
                    <p className="text-rose-500 mt-1">{formErrors.idCliente}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Data de Distribuição *
                  </label>
                  <input
                    type="date"
                    value={dataAbertura}
                    onChange={(e) => setDataAbertura(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100"
                  />
                  {formErrors.dataAbertura && (
                    <p className="text-rose-500 mt-1">{formErrors.dataAbertura}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status Atual *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100"
                >
                  {STATUS_OPCOES.map((st) => (
                    <option key={st} value={st} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Descrição / Objeto da Ação *
                </label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Síntese da demanda, vara, foro e anotações essenciais..."
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#c5a059] focus:outline-hidden resize-none dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {formErrors.descricao && (
                  <p className="text-rose-500 mt-1">{formErrors.descricao}</p>
                )}
              </div>

              </div>

              <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-slate-200/60 p-4 dark:border-white/[0.06] bg-slate-50/80 dark:bg-[#111722]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200/80 bg-white/60 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06] transition-colors cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b36f] px-4 py-2 font-semibold text-slate-950 disabled:opacity-50 transition-all cursor-pointer text-xs"
                >
                  {saving ? 'Salvando...' : editingProcesso ? 'Salvar Alterações' : 'Cadastrar Processo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão Reutilizável & Acessível */}
      <ConfirmModal
        isOpen={deleteModalOpen && !!processoToDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setProcessoToDelete(null);
        }}
        onConfirm={handleDeleteProcesso}
        title="Confirmar Exclusão de Processo"
        description={`Tem certeza que deseja excluir o processo "${processoToDelete?.titulo}" (CNJ: ${processoToDelete ? formatarNumeroCNJ(processoToDelete.numero_processo) : ''})? Esta ação é irreversível e excluirá todos os prazos vinculados a ele.`}
        confirmLabel="Sim, Excluir Processo"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={deleting}
      />

      {/* Modal / Drawer de Detalhes */}
      {detailsModalOpen && selectedProcesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="legal-modal-card fio-de-luz w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25 p-2">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                    Autos Processuais
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {formatarNumeroCNJ(selectedProcesso.numero_processo)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50/90 dark:bg-[#141a26] p-3.5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Ação / Classe
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs mt-0.5 block">
                  {selectedProcesso.titulo}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-slate-50/90 dark:bg-[#141a26] p-3.5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Cliente
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block">
                    {selectedProcesso.cliente?.nome || `Cliente #${selectedProcesso.id_cliente}`}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50/90 dark:bg-[#141a26] p-3.5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Status
                  </span>
                  <span
                    className={`inline-block font-medium px-2 py-0.5 rounded text-[10px] mt-1 border ${getStatusBadgeStyle(
                      selectedProcesso.status
                    )}`}
                  >
                    {selectedProcesso.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50/90 dark:bg-[#141a26] p-3.5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Descrição dos Autos
                </span>
                <p className="text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
                  {selectedProcesso.descricao}
                </p>
              </div>

              {/* Trilha de Auditoria dos Autos */}
              <div className="pt-2">
                <AuditTrail
                  title="Auditoria & Histórico dos Autos"
                  logs={[]}
                  emptyMessage="Nenhum registro de auditoria disponível para este processo."
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end border-t border-slate-200/60 pt-4 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-xl border border-slate-200/80 bg-slate-100/80 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-white/[0.08] dark:bg-[#141a26] dark:text-slate-200 dark:hover:bg-[#1a2232] transition-colors cursor-pointer"
              >
                Fechar Autos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé Institucional */}
      <InstitutionalFooter />
    </div>
  );
}
