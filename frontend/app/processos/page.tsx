'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { processoService, Processo, CreateProcessoInput } from '@/services/processoService';
import { clienteService, Cliente } from '@/services/clienteService';
import { ProcessosTable, formatarNumeroCNJ, getStatusBadgeStyle } from '@/components/ProcessosTable';
import { NumberProcessInput } from '@/components/NumberProcessInput';
import { SearchInput } from '@/components/SearchInput';
import { TableSkeleton, MetricCardSkeleton } from '@/components/Skeleton';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { SecurityBadge } from '@/components/SecurityBadge';
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
      <ProcessosContent />
    </AuthGuard>
  );
}

function ProcessosContent() {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fade-in-up">
        {/* Breadcrumb de Navegação */}
        <div className="flex items-center justify-between">
          <Breadcrumbs items={[{ label: 'Processos', icon: Briefcase }]} />
          <SecurityBadge variant="compact" className="hidden sm:inline-flex" />
        </div>

        {/* Cabeçalho Minimalista & Tipografia Sofisticada */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100/80 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                <Scale className="h-4 w-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Controle de Processos
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Gestão de autos judiciais, comarcas, clientes vinculados e andamento de instâncias.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchProcessos}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors active:scale-98"
            >
              <PlusCircle className="h-4 w-4" />
              Novo Processo
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
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Total Ativo
                  </span>
                  <Briefcase className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {totalProcessos}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Em Andamento
                  </span>
                  <Scale className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {totalEmAndamento}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Conclusos / Pautas
                  </span>
                  <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {totalConclusos}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Encerrados
                  </span>
                  <FileCheck2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
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
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 focus:border-amber-500 focus:outline-hidden"
            >
              <option value="todos" className="bg-slate-900 text-slate-100">Todos os Status</option>
              {STATUS_OPCOES.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-slate-100">
                  {st}
                </option>
              ))}
            </select>

            {clientes.length > 0 && (
              <select
                value={selectedClienteFilter}
                onChange={(e) => setSelectedClienteFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="todos" className="bg-slate-900 text-slate-100">Todos os Clientes</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={String(c.id_cliente)} className="bg-slate-900 text-slate-100">
                    {c.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tabela de Alta Performance com Sticky Header e Paginação */}
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <ProcessosTable
            processos={paginatedProcessos}
            loading={loading}
            onViewDetails={(proc) => {
              setSelectedProcesso(proc);
              setDetailsModalOpen(true);
            }}
            onEdit={openEditModal}
            onDelete={(proc) => {
              setProcessoToDelete(proc);
              setDeleteModalOpen(true);
            }}
            onCreateNew={openCreateModal}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredProcessos.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </main>

      {/* Modal de Criação / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-amber-100/80 p-2 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  {editingProcesso ? <Edit2 className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingProcesso ? 'Editar Processo Judicial' : 'Novo Processo Judicial'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProcesso} className="mt-4 space-y-3.5 text-xs">
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
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
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="" className="bg-slate-900 text-slate-100">Selecione o Cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id_cliente} value={String(c.id_cliente)} className="bg-slate-900 text-slate-100">
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
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-hidden"
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-hidden"
                >
                  {STATUS_OPCOES.map((st) => (
                    <option key={st} value={st} className="bg-slate-900 text-slate-100">
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden resize-none"
                />
                {formErrors.descricao && (
                  <p className="text-rose-500 mt-1">{formErrors.descricao}</p>
                )}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 disabled:opacity-50 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-amber-100/80 p-2 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Autos Processuais
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    {formatarNumeroCNJ(selectedProcesso.numero_processo)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Ação / Classe
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs mt-0.5 block">
                  {selectedProcesso.titulo}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Cliente
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block">
                    {selectedProcesso.cliente?.nome || `Cliente #${selectedProcesso.id_cliente}`}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80">
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

              <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80">
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
                  logs={[
                    {
                      id: 'proc-log-1',
                      timestamp: 'Hoje, às 11:20',
                      usuario: 'Dr. Roberto Davino',
                      cargo: 'Administrador',
                      acao: 'CONSULTA',
                      descricao: 'Acesso à íntegra dos autos digitais e prazos pendentes.',
                      detalhes: 'Consulta processual realizada via módulo de controladoria.',
                    },
                    {
                      id: 'proc-log-2',
                      timestamp: selectedProcesso.data_abertura
                        ? new Date(selectedProcesso.data_abertura + 'T00:00:00').toLocaleDateString('pt-BR')
                        : 'Distribuição Inicial',
                      usuario: 'Sistema de Protocolo',
                      cargo: 'Advogado',
                      acao: 'CRIACAO',
                      descricao: `Distribuição da ação "${selectedProcesso.titulo}".`,
                      detalhes: `Número CNJ: ${selectedProcesso.numero_processo}`,
                    },
                  ]}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
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
