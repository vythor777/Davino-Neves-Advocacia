'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { TableSkeleton, MetricCardSkeleton } from '@/components/Skeleton';
import { SecurityBadge } from '@/components/SecurityBadge';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { ConfirmModal } from '@/components/ConfirmModal';
import { AuditTrail, AuditLogItem } from '@/components/AuditTrail';
import { clienteService, Cliente, CreateClienteInput } from '@/services/clienteService';
import {
  Users,
  UserPlus,
  Search,
  Building2,
  User,
  Mail,
  Phone,
  Briefcase,
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
  Cake,
} from 'lucide-react';

// Funções utilitárias de formatação
function formatarCpfCnpj(valor: string): string {
  const digits = valor.replace(/\D/g, '');
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
}

function formatarTelefone(valor: string): string {
  const digits = valor.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14);
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

export default function ClientesPage() {
  return (
    <AuthGuard>
      <ClientesContent />
    </AuthGuard>
  );
}

function ClientesContent() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados de busca e filtro
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'pf' | 'pj'>('todos');

  // Estados de Modal de Criação / Edição
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form fields
  const [formTipo, setFormTipo] = useState<'pf' | 'pj'>('pf');
  const [nome, setNome] = useState<string>('');
  const [cpfCnpj, setCpfCnpj] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [endereco, setEndereco] = useState<string>('');
  const [dataNascimento, setDataNascimento] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [clientToDelete, setClientToDelete] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Drawer de Detalhes
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  // Estado de cópia para clipboard
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await clienteService.getAll();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com a API do servidor.';
      setErrorMsg(msg);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setFormTipo('pf');
    setNome('');
    setCpfCnpj('');
    setEmail('');
    setTelefone('');
    setEndereco('');
    setDataNascimento('');
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (client: Cliente) => {
    setEditingClient(client);
    const digits = client.cpf_cnpj.replace(/\D/g, '');
    setFormTipo(digits.length > 11 ? 'pj' : 'pf');
    setNome(client.nome);
    setCpfCnpj(client.cpf_cnpj);
    setEmail(client.email);
    setTelefone(client.telefone);
    setEndereco(client.endereco);
    setDataNascimento(client.data_nascimento ? client.data_nascimento.split('T')[0] : '');
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!nome.trim()) errors.nome = 'O nome ou razão social é obrigatório.';
    if (!cpfCnpj.trim()) {
      errors.cpfCnpj = formTipo === 'pf' ? 'O CPF é obrigatório.' : 'O CNPJ é obrigatório.';
    } else {
      const digits = cpfCnpj.replace(/\D/g, '');
      if (formTipo === 'pf' && digits.length !== 11) {
        errors.cpfCnpj = 'CPF deve conter 11 dígitos válidos.';
      } else if (formTipo === 'pj' && digits.length !== 14) {
        errors.cpfCnpj = 'CNPJ deve conter 14 dígitos válidos.';
      }
    }
    if (!email.trim()) {
      errors.email = 'O e-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Insira um endereço de e-mail válido.';
    }
    if (!telefone.trim()) errors.telefone = 'O telefone de contato é obrigatório.';
    if (!endereco.trim()) errors.endereco = 'O endereço completo é obrigatório.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setErrorMsg(null);

    const clientPayload: CreateClienteInput = {
      nome: nome.trim(),
      cpf_cnpj: cpfCnpj.trim(),
      email: email.trim().toLowerCase(),
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      data_nascimento: dataNascimento ? dataNascimento : null,
    };

    try {
      if (editingClient) {
        await clienteService.update(editingClient.id_cliente, clientPayload);
        setSuccessMsg(`Cliente "${nome}" atualizado com sucesso no banco de dados!`);
      } else {
        await clienteService.create(clientPayload);
        setSuccessMsg(`Cliente "${nome}" cadastrado com sucesso no banco de dados!`);
      }
      setModalOpen(false);
      await fetchClientes();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar cliente no banco de dados.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    setDeleting(true);
    setErrorMsg(null);
    try {
      await clienteService.delete(clientToDelete.id_cliente);
      setSuccessMsg(`Cliente "${clientToDelete.nome}" removido com sucesso.`);
      setDeleteModalOpen(false);
      setClientToDelete(null);
      await fetchClientes();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao remover cliente.';
      setErrorMsg(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Clientes filtrados
  const filteredClientes = useMemo(() => {
    return clientes.filter((client) => {
      const digits = client.cpf_cnpj.replace(/\D/g, '');
      const isPJ = digits.length > 11;

      if (filtroTipo === 'pf' && isPJ) return false;
      if (filtroTipo === 'pj' && !isPJ) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        client.nome.toLowerCase().includes(term) ||
        client.cpf_cnpj.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.telefone.toLowerCase().includes(term) ||
        client.endereco.toLowerCase().includes(term)
      );
    });
  }, [clientes, searchTerm, filtroTipo]);

  // Métricas
  const totalClientes = clientes.length;
  const totalPF = clientes.filter((c) => c.cpf_cnpj.replace(/\D/g, '').length <= 11).length;
  const totalPJ = clientes.filter((c) => c.cpf_cnpj.replace(/\D/g, '').length > 11).length;
  const totalComProcessos = clientes.filter((c) => (c._count?.processos || (c.processos?.length ?? 0)) > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
        {/* Breadcrumbs & Security Indicator */}
        <div className="flex items-center justify-between pb-4">
          <Breadcrumbs items={[{ label: 'Clientes', icon: Users }]} />
          <SecurityBadge variant="compact" className="hidden sm:inline-flex" />
        </div>

        {/* Cabeçalho da Página */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-100 p-1.5 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <Users className="h-5 w-5" />
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gestão de Clientes
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Cadastro unificado de pessoas físicas e jurídicas, processos e contatos corporativos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchClientes}
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
              <UserPlus className="h-4 w-4" />
              Novo Cliente
            </button>
          </div>
        </div>

        {/* Mensagens de Sucesso / Erro */}
        {successMsg && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center justify-between dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={fetchClientes}
              className="underline hover:text-red-950 dark:hover:text-white font-semibold cursor-pointer ml-3"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Métricas do Módulo */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Clientes</span>
                  <Users className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  {totalClientes}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pessoas Físicas</span>
                  <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  {totalPF}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pessoas Jurídicas</span>
                  <Building2 className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  {totalPJ}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Com Processos Ativos</span>
                  <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  {totalComProcessos}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF/CNPJ, e-mail ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-600 focus:outline-hidden focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['todos', 'pf', 'pj'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filtroTipo === tipo
                    ? 'bg-amber-800 text-white dark:bg-amber-600'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {tipo === 'todos' ? 'Todos' : tipo === 'pf' ? 'Pessoas Físicas' : 'Pessoas Jurídicas'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <TableSkeleton rows={6} columns={6} />
          ) : filteredClientes.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchTerm || filtroTipo !== 'todos' ? "Nenhum cliente localizado" : "Nenhum cliente cadastrado"}
              description={
                searchTerm || filtroTipo !== 'todos'
                  ? "Tente ajustar os filtros ou o termo pesquisado."
                  : "Cadastre o primeiro cliente da carteira para vincular a processos e prazos."
              }
              action={
                !searchTerm && filtroTipo === 'todos'
                  ? {
                      label: "Cadastrar Cliente",
                      onClick: openCreateModal,
                      icon: UserPlus,
                    }
                  : undefined
              }
            />
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3">Cliente / Razão Social</th>
                      <th className="px-3 py-3.5">Documento (CPF/CNPJ)</th>
                      <th className="px-3 py-3.5">Contatos</th>
                      <th className="px-3 py-3.5">Localização</th>
                      <th className="px-3 py-3.5">Processos</th>
                      <th className="py-3.5 pl-3 pr-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredClientes.map((client) => {
                      const digits = client.cpf_cnpj.replace(/\D/g, '');
                      const isPJ = digits.length > 11;
                      const countProc = client._count?.processos ?? client.processos?.length ?? 0;

                      return (
                        <tr
                          key={client.id_cliente}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="py-4 pl-6 pr-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold shrink-0 ${
                                  isPJ
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {isPJ ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                              </div>
                              <div>
                                <button
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setDetailsModalOpen(true);
                                  }}
                                  className="font-semibold text-slate-900 hover:text-amber-800 dark:text-slate-100 dark:hover:text-amber-400 text-left transition"
                                >
                                  {client.nome}
                                </button>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                  Cadastro: {new Date(client.data_criacao).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-700 dark:text-slate-300">
                                {formatarCpfCnpj(client.cpf_cnpj)}
                              </span>
                              <button
                                onClick={() => copyToClipboard(client.cpf_cnpj, `doc-${client.id_cliente}`)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
                                title="Copiar documento"
                                aria-label="Copiar documento"
                              >
                                {copiedId === `doc-${client.id_cliente}` ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <Mail className="h-3 w-3 text-slate-400" />
                                <span>{client.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span>{formatarTelefone(client.telefone)}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                            {client.endereco}
                          </td>

                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                countProc > 0
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              <Briefcase className="h-3 w-3" />
                              {countProc} {countProc === 1 ? 'processo' : 'processos'}
                            </span>
                          </td>

                          <td className="py-4 pl-3 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedClient(client);
                                  setDetailsModalOpen(true);
                                }}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                title="Visualizar ficha"
                                aria-label="Visualizar ficha do cliente"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => openEditModal(client)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-amber-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                                title="Editar cliente"
                                aria-label="Editar cliente"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setClientToDelete(client);
                                  setDeleteModalOpen(true);
                                }}
                                className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                title="Excluir cliente"
                                aria-label="Excluir cliente"
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

              {/* Mobile Cards View */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClientes.map((client) => {
                  const digits = client.cpf_cnpj.replace(/\D/g, '');
                  const isPJ = digits.length > 11;
                  const countProc = client._count?.processos ?? client.processos?.length ?? 0;

                  return (
                    <div key={client.id_cliente} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold shrink-0 ${
                              isPJ
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {isPJ ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setDetailsModalOpen(true);
                              }}
                              className="font-bold text-sm text-slate-900 dark:text-white truncate block text-left"
                            >
                              {client.nome}
                            </button>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                              <span>{formatarCpfCnpj(client.cpf_cnpj)}</span>
                              <button
                                onClick={() => copyToClipboard(client.cpf_cnpj, `doc-m-${client.id_cliente}`)}
                                className="text-slate-400 p-1"
                                aria-label="Copiar documento"
                              >
                                {copiedId === `doc-m-${client.id_cliente}` ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            countProc > 0
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <Briefcase className="h-3 w-3" />
                          {countProc} {countProc === 1 ? 'processo' : 'processos'}
                        </span>
                      </div>

                      {/* Contatos */}
                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{formatarTelefone(client.telefone)}</span>
                        </div>
                        {client.endereco && (
                          <div className="text-[11px] text-slate-400 pt-0.5 truncate">
                            {client.endereco}
                          </div>
                        )}
                      </div>

                      {/* Ações Mobile */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setDetailsModalOpen(true);
                          }}
                          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                          aria-label="Ver ficha completa"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ficha</span>
                        </button>
                        <button
                          onClick={() => openEditModal(client)}
                          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300"
                          aria-label="Editar dados"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => {
                            setClientToDelete(client);
                            setDeleteModalOpen(true);
                          }}
                          className="flex min-h-[44px] items-center justify-center rounded-xl bg-rose-50 px-3.5 py-2 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300"
                          aria-label="Excluir cadastro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  {editingClient ? <Edit2 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  {editingClient ? 'Editar Cadastro de Cliente' : 'Novo Cadastro de Cliente'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="mt-4 space-y-4 text-xs">
              {/* Tipo PF ou PJ */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormTipo('pf');
                    setCpfCnpj('');
                  }}
                  className={`rounded-xl border p-2.5 text-center font-semibold transition ${
                    formTipo === 'pf'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  Pessoa Física (CPF)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormTipo('pj');
                    setCpfCnpj('');
                  }}
                  className={`rounded-xl border p-2.5 text-center font-semibold transition ${
                    formTipo === 'pj'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  Pessoa Jurídica (CNPJ)
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {formTipo === 'pf' ? 'Nome Completo *' : 'Razão Social / Nome Fantasia *'}
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={formTipo === 'pf' ? 'Ex: Carlos Eduardo Silveira' : 'Ex: Horizonte Verde Engenharia S/A'}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
                />
                {formErrors.nome && <p className="text-red-500 mt-1">{formErrors.nome}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {formTipo === 'pf' ? 'CPF *' : 'CNPJ *'}
                  </label>
                  <input
                    type="text"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(formatarCpfCnpj(e.target.value))}
                    placeholder={formTipo === 'pf' ? '000.000.000-00' : '00.000.000/0001-00'}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden font-mono"
                  />
                  {formErrors.cpfCnpj && <p className="text-red-500 mt-1">{formErrors.cpfCnpj}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone de Contato *
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden font-mono"
                  />
                  {formErrors.telefone && <p className="text-red-500 mt-1">{formErrors.telefone}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail de Contato *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@dominio.com.br"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
                />
                {formErrors.email && <p className="text-red-500 mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data de Nascimento {formTipo === 'pf' ? '(para aniversariantes do mês)' : '(opcional)'}
                </label>
                <div className="relative rounded-xl">
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Endereço Completo (Logradouro, Nº, Bairro, Cidade/UF) *
                </label>
                <textarea
                  rows={2}
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Av. Paulista, 1000, Apto 42 - Bela Vista, São Paulo/SP"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden resize-none"
                />
                {formErrors.endereco && <p className="text-red-500 mt-1">{formErrors.endereco}</p>}
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
                  {saving ? 'Salvando...' : editingClient ? 'Atualizar Cliente' : 'Salvar no Banco'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão Reutilizável & Acessível */}
      <ConfirmModal
        isOpen={deleteModalOpen && !!clientToDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={handleDeleteClient}
        title="Confirmar Exclusão de Cliente"
        description={`Tem certeza que deseja remover o cliente "${clientToDelete?.nome}"? Caso existam processos ou prazos vinculados a este titular, eles poderão ser desvinculados do acervo.`}
        confirmLabel="Sim, Excluir Cliente"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={deleting}
      />

      {/* Modal / Ficha Detalhada */}
      {detailsModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    Ficha do Cliente #{selectedClient.id_cliente}
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedClient.nome}</p>
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
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Documento de Identificação</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">
                    {formatarCpfCnpj(selectedClient.cpf_cnpj)}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Data de Nascimento</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {selectedClient.data_nascimento
                      ? new Date(selectedClient.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                      : 'Não informada'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">E-mail Corporativo</span>
                  <span className="text-slate-800 dark:text-slate-200 truncate block">
                    {selectedClient.email}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Telefone de Contato</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">
                    {formatarTelefone(selectedClient.telefone)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Endereço Cadastrado</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {selectedClient.endereco}
                </span>
              </div>

              {/* Trilha de Auditoria do Cliente */}
              <div className="pt-2">
                <AuditTrail
                  title="Histórico de Auditoria & Segurança"
                  logs={[
                    {
                      id: 'log-1',
                      timestamp: 'Hoje, às 10:14',
                      usuario: 'Dr. Roberto Davino',
                      cargo: 'Administrador',
                      acao: 'CONSULTA',
                      descricao: 'Acesso aos dados sensíveis do cliente para verificação cadastral.',
                      detalhes: 'Ficha individual visualizada no painel administrativo.',
                    },
                    {
                      id: 'log-2',
                      timestamp: 'Registro no Sistema',
                      usuario: 'Secretaria Geral',
                      cargo: 'Advogado',
                      acao: 'CRIACAO',
                      descricao: `Cliente cadastrado com documento ${formatarCpfCnpj(selectedClient.cpf_cnpj)}.`,
                      detalhes: `Vínculo com o escritório Davino Neves Advocacia formalizado.`,
                    },
                  ]}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
