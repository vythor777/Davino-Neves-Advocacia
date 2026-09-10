'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { TableSkeleton, MetricCardSkeleton } from '@/components/Skeleton';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { ConfirmModal } from '@/components/ConfirmModal';
import { AuditTrail } from '@/components/AuditTrail';
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
} from 'lucide-react';

// Funções utilitárias de formatação estrita
function formatarCPF(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

function formatarCNPJ(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function formatarCpfCnpj(valor: string): string {
  const digits = valor.replace(/\D/g, '');
  if (digits.length <= 11) {
    return formatarCPF(digits);
  }
  return formatarCNPJ(digits);
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

function formatarDataNascimento(dataStr?: string | null): string {
  if (!dataStr) return 'Não informada';
  // Extrai ano, mês e dia da string ISO (ex: "1995-09-12T00:00:00.000Z" ou "1995-09-12")
  // para DD/MM/YYYY sem sofrer conversão ou distorção de fuso horário UTC vs local
  const clean = dataStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    const [ano, mes, dia] = parts;
    return `${dia}/${mes}/${ano}`;
  }
  const d = new Date(dataStr);
  return isNaN(d.getTime()) ? 'Não informada' : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatarDataHora(dataStr?: string | null): string {
  if (!dataStr) return 'Não informada';
  const d = new Date(dataStr);
  if (isNaN(d.getTime())) return 'Não informada';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
    const isPj = digits.length > 11;
    setFormTipo(isPj ? 'pj' : 'pf');
    setNome(client.nome);
    setCpfCnpj(isPj ? formatarCNPJ(client.cpf_cnpj) : formatarCPF(client.cpf_cnpj));
    setEmail(client.email);
    setTelefone(client.telefone);
    setEndereco(client.endereco);
    setDataNascimento(client.data_nascimento ? client.data_nascimento.split('T')[0] : '');
    setFormErrors({});
    setModalOpen(true);
  };

  const handleTrocarTipoPessoa = (novoTipo: 'pf' | 'pj') => {
    if (formTipo === novoTipo) return;
    setFormTipo(novoTipo);
    // Limpeza de estado estrita para evitar resquícios de dígitos e conflito de formatação
    setCpfCnpj('');
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.cpfCnpj;
      return next;
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!nome.trim()) errors.nome = 'O nome ou razão social é obrigatório.';
    if (!cpfCnpj.trim()) {
      errors.cpfCnpj = formTipo === 'pf' ? 'O CPF é obrigatório.' : 'O CNPJ é obrigatório.';
    } else {
      const digits = cpfCnpj.replace(/\D/g, '');
      if (formTipo === 'pf' && digits.length !== 11) {
        errors.cpfCnpj = 'CPF deve conter 11 dígitos válidos (000.000.000-00).';
      } else if (formTipo === 'pj' && digits.length !== 14) {
        errors.cpfCnpj = 'CNPJ deve conter 14 dígitos válidos (00.000.000/0001-00).';
      }
    }
    if (!email.trim()) {
      errors.email = 'O e-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Insira um endereço de e-mail válido.';
    }
    if (!telefone.trim()) errors.telefone = 'O telefone de contato é obrigatório.';
    if (!endereco.trim()) errors.endereco = 'O endereço completo é obrigatório.';

    if (dataNascimento) {
      const match = dataNascimento.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const [, ano, mes, dia] = match;
        const selectedDate = new Date(Number(ano), Number(mes) - 1, Number(dia));
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (selectedDate > today) {
          errors.dataNascimento = formTipo === 'pf'
            ? 'A data de nascimento não pode ser uma data futura.'
            : 'A data de fundação/abertura não pode ser uma data futura.';
        }
        if (Number(ano) < 1900) {
          errors.dataNascimento = 'Insira um ano válido a partir de 1900.';
        }
      }
    }

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
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 animate-fade-in-up">
      {/* Breadcrumb e Título: Hierarquia 'Início > Clientes' com tipografia refinada */}
      <div className="pb-1">
        <Breadcrumbs items={[{ label: 'Clientes', icon: Users }]} />
      </div>

        {/* Cabeçalho da Página */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 dark:border-white/[0.05] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-[#dfcaa0] border border-slate-200 dark:border-white/[0.08]">
                Controladoria Jurídica • Carteira de Clientes
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/25 text-[#c5a059]">
                <Users className="h-4 w-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                Gestão de Clientes
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Cadastro unificado de pessoas físicas e jurídicas, processos e contatos corporativos.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchClientes}
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
              <UserPlus className="h-4 w-4 text-slate-950" />
              + Novo Cliente
            </button>
          </div>
        </div>

        {/* Mensagens de Sucesso / Erro */}
        {successMsg && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
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
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={fetchClientes}
              className="underline hover:text-rose-950 dark:hover:text-white font-semibold cursor-pointer ml-3"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Cards de Métricas: 4 cards com o design system legal-glass-card */}
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
              <div className="legal-glass-card fio-de-luz p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                    Total de Clientes
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#f8fafc]">
                  {totalClientes}
                </p>
              </div>

              <div className="legal-glass-card fio-de-luz p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                    Pessoas Físicas
                  </span>
                  <div className="p-1.5 rounded-lg bg-[#c5a059]/10 text-[#c5a059]">
                    <User className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#f8fafc]">
                  {totalPF}
                </p>
              </div>

              <div className="legal-glass-card fio-de-luz p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                    Pessoas Jurídicas
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-[#dfcaa0]">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#f8fafc]">
                  {totalPJ}
                </p>
              </div>

              <div className="legal-glass-card fio-de-luz p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                    Com Processos Ativos
                  </span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400/90">
                    <Briefcase className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#f8fafc]">
                  {totalComProcessos}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Filtros e Tabela: Barra de ferramentas integrada */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF/CNPJ, e-mail ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-white/80 pl-10 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100 dark:placeholder-slate-500 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div
            className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/80 p-1 shrink-0 dark:border-white/[0.08] dark:bg-[#12161f]"
            role="tablist"
            aria-label="Filtro por tipo de pessoa"
          >
            {(['todos', 'pf', 'pj'] as const).map((tipo) => {
              const isActive = filtroTipo === tipo;
              return (
                <button
                  key={tipo}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFiltroTipo(tipo)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#c5a059] text-slate-950 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-[#dfcaa0] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {tipo === 'todos' ? 'Todos' : tipo === 'pf' ? 'Pessoas Físicas' : 'Pessoas Jurídicas'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="legal-glass-card rounded-2xl overflow-hidden">
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
                  <thead className="border-b border-slate-200/60 bg-slate-50/50 font-semibold text-slate-600 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-300">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3">Cliente / Razão Social</th>
                      <th className="px-3 py-3.5">Documento (CPF/CNPJ)</th>
                      <th className="px-3 py-3.5">Contatos</th>
                      <th className="px-3 py-3.5">Localização</th>
                      <th className="px-3 py-3.5">Processos</th>
                      <th className="py-3.5 pl-3 pr-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {filteredClientes.map((client) => {
                      const digits = client.cpf_cnpj.replace(/\D/g, '');
                      const isPJ = digits.length > 11;
                      const countProc = client._count?.processos ?? client.processos?.length ?? 0;

                      return (
                        <tr
                          key={client.id_cliente}
                          className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-4 pl-6 pr-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold shrink-0 ${
                                  isPJ
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    : 'bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25'
                                }`}
                              >
                                {isPJ ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    onClick={() => {
                                      setSelectedClient(client);
                                      setDetailsModalOpen(true);
                                    }}
                                    className="font-semibold text-slate-900 hover:text-[#c5a059] dark:text-[#f8fafc] dark:hover:text-[#dfcaa0] text-left transition cursor-pointer"
                                  >
                                    {client.nome}
                                  </button>
                                  {isPJ ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-300">
                                      Pessoa Jurídica
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 dark:text-[#dfcaa0]">
                                      Pessoa Física
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                                className="text-slate-400 hover:text-slate-200 p-1 rounded transition cursor-pointer"
                                title="Copiar documento"
                                aria-label="Copiar documento"
                              >
                                {copiedId === `doc-${client.id_cliente}` ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                <Mail className="h-3 w-3 text-slate-400" />
                                <span>{client.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span>{formatarTelefone(client.telefone)}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                            {client.endereco}
                          </td>

                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                countProc > 0
                                  ? 'bg-[#c5a059]/15 text-[#c5a059] dark:text-[#dfcaa0] border border-[#c5a059]/25'
                                  : 'bg-slate-100 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06]'
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
                                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-[#dfcaa0] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                                title="Visualizar ficha detalhada do cliente"
                                aria-label="Visualizar ficha do cliente"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => openEditModal(client)}
                                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-[#dfcaa0] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                                title="Editar dados do cliente"
                                aria-label="Editar cliente"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setClientToDelete(client);
                                  setDeleteModalOpen(true);
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Excluir cliente do sistema"
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
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filteredClientes.map((client) => {
                  const digits = client.cpf_cnpj.replace(/\D/g, '');
                  const isPJ = digits.length > 11;
                  const countProc = client._count?.processos ?? client.processos?.length ?? 0;

                  return (
                    <div key={client.id_cliente} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold shrink-0 ${
                              isPJ
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25'
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
                              className="font-bold text-sm text-slate-900 hover:text-[#c5a059] dark:text-[#f8fafc] dark:hover:text-[#dfcaa0] truncate block text-left"
                            >
                              {client.nome}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isPJ ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-300">
                                  Pessoa Jurídica
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 dark:text-[#dfcaa0]">
                                  Pessoa Física
                                </span>
                              )}
                              <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                                {formatarCpfCnpj(client.cpf_cnpj)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            countProc > 0
                              ? 'bg-[#c5a059]/15 text-[#c5a059] dark:text-[#dfcaa0] border border-[#c5a059]/25'
                              : 'bg-slate-100 text-slate-600 dark:bg-white/[0.04] dark:text-slate-400'
                          }`}
                        >
                          {countProc} {countProc === 1 ? 'processo' : 'processos'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1 text-xs text-slate-600 dark:text-slate-300 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatarTelefone(client.telefone)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setDetailsModalOpen(true);
                          }}
                          className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-[#dfcaa0]"
                          title="Visualizar ficha completa do cliente"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Ficha</span>
                        </button>

                        <button
                          onClick={() => openEditModal(client)}
                          className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/10 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-[#dfcaa0] hover:bg-[#c5a059]/20"
                          title="Editar dados do cliente"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => {
                            setClientToDelete(client);
                            setDeleteModalOpen(true);
                          }}
                          className="flex min-h-[38px] items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
                          title="Excluir cliente do sistema"
                          aria-label="Excluir cadastro"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      {/* Modal de Criação / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div className="legal-glass-card fio-de-luz w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25 p-2">
                  {editingClient ? <Edit2 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                    {editingClient ? 'Editar Cadastro de Cliente' : 'Novo Cadastro de Cliente'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Preencha os dados cadastrais do titular
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="mt-4 space-y-4 text-xs">
              {/* Tipo PF ou PJ com Reset Estrito de Estado */}
              <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Tipo de Pessoa">
                <button
                  type="button"
                  role="tab"
                  id="tab-pf"
                  aria-selected={formTipo === 'pf'}
                  onClick={() => handleTrocarTipoPessoa('pf')}
                  className={`rounded-xl border p-2.5 text-center font-semibold transition cursor-pointer ${
                    formTipo === 'pf'
                      ? 'border-[#c5a059]/50 bg-[#c5a059]/15 text-[#dfcaa0] shadow-xs'
                      : 'border-slate-200/80 bg-white/60 text-slate-700 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  Pessoa Física (CPF)
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-pj"
                  aria-selected={formTipo === 'pj'}
                  onClick={() => handleTrocarTipoPessoa('pj')}
                  className={`rounded-xl border p-2.5 text-center font-semibold transition cursor-pointer ${
                    formTipo === 'pj'
                      ? 'border-[#c5a059]/50 bg-[#c5a059]/15 text-[#dfcaa0] shadow-xs'
                      : 'border-slate-200/80 bg-white/60 text-slate-700 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  Pessoa Jurídica (CNPJ)
                </button>
              </div>

              <div>
                <label htmlFor="input-nome-cliente" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {formTipo === 'pf' ? 'Nome Completo *' : 'Razão Social / Nome Fantasia *'}
                </label>
                <input
                  id="input-nome-cliente"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={formTipo === 'pf' ? 'Ex: Carlos Eduardo Silveira' : 'Ex: Horizonte Verde Engenharia S/A'}
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100 dark:placeholder:text-slate-500 transition"
                />
                {formErrors.nome && <p className="text-rose-400 mt-1">{formErrors.nome}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="input-cpf-cnpj" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {formTipo === 'pf' ? 'CPF *' : 'CNPJ *'}
                  </label>
                  <input
                    id="input-cpf-cnpj"
                    type="text"
                    inputMode="numeric"
                    maxLength={formTipo === 'pf' ? 14 : 18}
                    value={cpfCnpj}
                    onChange={(e) => {
                      const val = e.target.value;
                      const formatted = formTipo === 'pf' ? formatarCPF(val) : formatarCNPJ(val);
                      setCpfCnpj(formatted);
                      if (formErrors.cpfCnpj) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.cpfCnpj;
                          return next;
                        });
                      }
                    }}
                    placeholder={formTipo === 'pf' ? '000.000.000-00' : '00.000.000/0001-00'}
                    className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#c5a059] focus:outline-hidden font-mono dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100 dark:placeholder:text-slate-500 transition"
                  />
                  {formErrors.cpfCnpj && <p className="text-rose-400 mt-1">{formErrors.cpfCnpj}</p>}
                </div>

                <div>
                  <label htmlFor="input-telefone-cliente" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Telefone de Contato *
                  </label>
                  <input
                    id="input-telefone-cliente"
                    type="text"
                    inputMode="tel"
                    maxLength={15}
                    value={telefone}
                    onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#c5a059] focus:outline-hidden font-mono dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100 dark:placeholder:text-slate-500 transition"
                  />
                  {formErrors.telefone && <p className="text-rose-400 mt-1">{formErrors.telefone}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="input-email-cliente" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail de Contato *
                </label>
                <input
                  id="input-email-cliente"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@dominio.com.br"
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100 dark:placeholder:text-slate-500 transition"
                />
                {formErrors.email && <p className="text-rose-400 mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="input-data-nascimento" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {formTipo === 'pf'
                    ? 'Data de Nascimento (para aniversariantes do mês)'
                    : 'Data de Fundação / Abertura (opcional)'}
                </label>
                <div className="relative rounded-xl">
                  <input
                    id="input-data-nascimento"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#c5a059] focus:outline-hidden dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100 dark:placeholder:text-slate-500 transition"
                  />
                  {formErrors.dataNascimento && (
                    <p className="text-rose-400 text-xs mt-1">{formErrors.dataNascimento}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Endereço Completo (Logradouro, Nº, Bairro, Cidade/UF) *
                </label>
                <textarea
                  rows={2}
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Av. Paulista, 1000, Apto 42 - Bela Vista, São Paulo/SP"
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#c5a059] focus:outline-hidden resize-none dark:border-white/[0.08] dark:bg-[#12161f] dark:text-slate-100 dark:placeholder:text-slate-500 transition"
                />
                {formErrors.endereco && <p className="text-rose-400 mt-1">{formErrors.endereco}</p>}
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-200/60 pt-4 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200/80 bg-white/60 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b36f] px-4 py-2 font-semibold text-slate-950 disabled:opacity-50 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md overflow-y-auto">
          <div className="legal-glass-card fio-de-luz w-full max-w-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25 p-2">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                    Ficha do Cliente #{selectedClient.id_cliente}
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedClient.nome}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Documento de Identificação</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono font-medium mt-0.5 block">
                    {formatarCpfCnpj(selectedClient.cpf_cnpj)}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    {selectedClient.cpf_cnpj.replace(/\D/g, '').length > 11
                      ? 'Data de Fundação / Abertura'
                      : 'Data de Nascimento'}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block">
                    {formatarDataNascimento(selectedClient.data_nascimento)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">E-mail Corporativo</span>
                  <span className="text-slate-800 dark:text-slate-200 truncate block mt-0.5 font-medium">
                    {selectedClient.email}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Telefone de Contato</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono mt-0.5 block font-medium">
                    {formatarTelefone(selectedClient.telefone)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Endereço Cadastrado</span>
                <span className="text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {selectedClient.endereco}
                </span>
              </div>

              {/* Metadados Reais de Persistência */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Data de Cadastro</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono font-medium mt-0.5 block">
                    {formatarDataHora(selectedClient.data_criacao)}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Última Atualização</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono font-medium mt-0.5 block">
                    {formatarDataHora(selectedClient.data_atualizacao)}
                  </span>
                </div>
              </div>

              {/* Trilha de Auditoria do Cliente - Real / Empty State sem dados mockados */}
              <div className="pt-2">
                <AuditTrail
                  title="Histórico de Auditoria & Segurança"
                  logs={[]}
                  emptyMessage="Nenhum registro de auditoria disponível para este cliente."
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end border-t border-slate-200/60 pt-4 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-xl border border-slate-200/80 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé Institucional Completo */}
      <InstitutionalFooter />
    </div>
  );
}
