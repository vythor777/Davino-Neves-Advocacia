'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '@/components/Navbar';
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
} from 'lucide-react';

// Dados iniciais de demonstração (fallback caso o backend não esteja ativo no momento)
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
    _count: { processos: 2 },
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
    _count: { processos: 4 },
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
    _count: { processos: 1 },
  },
];

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
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState<boolean>(false);

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
      if (data && Array.isArray(data)) {
        setClientes(data);
        setIsUsingMock(false);
      } else {
        setClientes([]);
        setIsUsingMock(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com o servidor.';
      console.warn('API não conectada ou offline. Carregando dados locais demonstrativos:', msg);
      setClientes(MOCK_CLIENTES);
      setIsUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const data = await clienteService.getAll();
        if (!active) return;
        if (data && Array.isArray(data)) {
          setClientes(data);
          setIsUsingMock(false);
        } else {
          setClientes([]);
          setIsUsingMock(false);
        }
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Falha na conexão com o servidor.';
        console.warn('API não conectada ou offline. Carregando dados locais demonstrativos:', msg);
        setClientes(MOCK_CLIENTES);
        setIsUsingMock(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text.replace(/\D/g, ''));
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
    };

    try {
      if (editingClient) {
        if (isUsingMock) {
          // Atualização local no mock
          setClientes((prev) =>
            prev.map((c) =>
              c.id_cliente === editingClient.id_cliente
                ? { ...c, ...clientPayload, data_atualizacao: new Date().toISOString() }
                : c,
            ),
          );
        } else {
          await clienteService.update(editingClient.id_cliente, clientPayload);
          await fetchClientes();
        }
        setSuccessMsg(`Cliente "${nome}" atualizado com sucesso!`);
      } else {
        if (isUsingMock) {
          // Criação local no mock
          const newMockClient: Cliente = {
            id_cliente: Math.max(...clientes.map((c) => c.id_cliente), 0) + 1,
            ...clientPayload,
            data_criacao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString(),
            _count: { processos: 0 },
          };
          setClientes((prev) => [newMockClient, ...prev]);
        } else {
          await clienteService.create(clientPayload);
          await fetchClientes();
        }
        setSuccessMsg(`Cliente "${nome}" cadastrado com sucesso!`);
      }
      setModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar cliente.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    setDeleting(true);
    try {
      if (isUsingMock) {
        setClientes((prev) => prev.filter((c) => c.id_cliente !== clientToDelete.id_cliente));
      } else {
        await clienteService.delete(clientToDelete.id_cliente);
        await fetchClientes();
      }
      setSuccessMsg(`Cliente "${clientToDelete.nome}" removido.`);
      setDeleteModalOpen(false);
      setClientToDelete(null);
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
              <Users className="h-4 w-4" />
              Gestão de Cadastro
            </div>
            <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Clientes do Escritório
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Gerencie pessoas físicas e jurídicas, documentos de identificação e vínculos processuais.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchClientes}
              disabled={loading}
              title="Atualizar lista"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-amber-800 active:scale-[0.98] dark:bg-amber-700 dark:hover:bg-amber-600"
            >
              <UserPlus className="h-4 w-4" />
              Novo Cliente
            </button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Cadastrado</span>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalClientes}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Pessoas e Empresas</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pessoas Físicas (CPF)</span>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                <User className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalPF}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Pessoas Naturais</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Empresas (CNPJ)</span>
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalPJ}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Pessoas Jurídicas</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Com Ações Judiciais</span>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalComProcessos}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Com processos vinculados</span>
          </div>
        </div>

        {/* Barra de Filtros e Pesquisa */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, CPF/CNPJ, e-mail, telefone..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </div>

          <div className="flex items-center gap-1 border-t border-slate-100 pt-2 sm:border-t-0 sm:pt-0 dark:border-slate-800">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filtroTipo === 'todos'
                  ? 'bg-amber-900 text-white dark:bg-amber-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Todos ({totalClientes})
            </button>
            <button
              onClick={() => setFiltroTipo('pf')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filtroTipo === 'pf'
                  ? 'bg-blue-800 text-white dark:bg-blue-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Física ({totalPF})
            </button>
            <button
              onClick={() => setFiltroTipo('pj')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filtroTipo === 'pj'
                  ? 'bg-indigo-800 text-white dark:bg-indigo-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Jurídica ({totalPJ})
            </button>
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/80 text-xs font-semibold tracking-wide uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Cliente / Razão Social
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    CPF / CNPJ
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Contato
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Processos
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-amber-800 dark:text-amber-400" />
                        <span>Carregando clientes...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Nenhum cliente encontrado
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {searchTerm
                          ? 'Tente alterar os termos da sua pesquisa.'
                          : 'Comece adicionando o primeiro cliente do escritório.'}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={openCreateModal}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-amber-700"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Cadastrar Agora
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((client) => {
                    const digits = client.cpf_cnpj.replace(/\D/g, '');
                    const isPJ = digits.length > 11;
                    const numProcessos = client._count?.processos || (client.processos?.length ?? 0);

                    return (
                      <tr
                        key={client.id_cliente}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        {/* Nome / Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                                isPJ
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {isPJ ? (
                                <Building2 className="h-5 w-5" />
                              ) : (
                                client.nome.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {client.nome}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                <span
                                  className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                                    isPJ
                                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-900/60 dark:text-indigo-300'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:border-blue-900/60 dark:text-blue-300'
                                  }`}
                                >
                                  {isPJ ? 'Pessoa Jurídica' : 'Pessoa Física'}
                                </span>
                                <span className="truncate max-w-[200px]" title={client.endereco}>
                                  {client.endereco}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CPF / CNPJ */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                              {client.cpf_cnpj}
                            </span>
                            <button
                              onClick={() => handleCopy(client.cpf_cnpj, `doc-${client.id_cliente}`)}
                              title="Copiar documento"
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              {copiedId === `doc-${client.id_cliente}` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Contato (Email / Tel) */}
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-xs">
                            <a
                              href={`mailto:${client.email}`}
                              className="flex items-center gap-1.5 text-slate-600 hover:text-amber-800 dark:text-slate-300 dark:hover:text-amber-400"
                            >
                              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{client.email}</span>
                            </a>
                            <a
                              href={`tel:${client.telefone.replace(/\D/g, '')}`}
                              className="flex items-center gap-1.5 text-slate-600 hover:text-amber-800 dark:text-slate-300 dark:hover:text-amber-400"
                            >
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>{client.telefone}</span>
                            </a>
                          </div>
                        </td>

                        {/* Processos */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              numProcessos > 0
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <Briefcase className="h-3 w-3" />
                            {numProcessos} {numProcessos === 1 ? 'processo' : 'processos'}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setDetailsModalOpen(true);
                              }}
                              title="Visualizar ficha"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(client)}
                              title="Editar cliente"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-800 dark:text-slate-400 dark:hover:bg-amber-950/60 dark:hover:text-amber-300"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setClientToDelete(client);
                                setDeleteModalOpen(true);
                              }}
                              title="Excluir cliente"
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

          {/* Footer da tabela */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            <span>
              Exibindo <strong>{filteredClientes.length}</strong> de <strong>{clientes.length}</strong> clientes
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
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {/* Header do modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  {editingClient ? 'Editar Cliente' : 'Novo Cadastro de Cliente'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Preencha as informações completas para registro no banco de dados.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Toggle Tipo de Pessoa */}
            <div className="mt-4 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setFormTipo('pf');
                  setCpfCnpj('');
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-semibold transition ${
                  formTipo === 'pf'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Pessoa Física (CPF)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormTipo('pj');
                  setCpfCnpj('');
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-semibold transition ${
                  formTipo === 'pj'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                Pessoa Jurídica (CNPJ)
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveClient} className="mt-4 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {formTipo === 'pf' ? 'Nome Completo *' : 'Razão Social / Nome Fantasia *'}
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={formTipo === 'pf' ? 'Ex: Ana Clara Martins' : 'Ex: Martins & Associados Ltda'}
                  className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                    formErrors.nome
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                      : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                  }`}
                />
                {formErrors.nome && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.nome}</p>
                )}
              </div>

              {/* Grid CPF/CNPJ e Telefone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    {formTipo === 'pf' ? 'CPF *' : 'CNPJ *'}
                  </label>
                  <input
                    type="text"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(formatarCpfCnpj(e.target.value))}
                    placeholder={formTipo === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    maxLength={formTipo === 'pf' ? 14 : 18}
                    className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                      formErrors.cpfCnpj
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                        : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                    }`}
                  />
                  {formErrors.cpfCnpj && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.cpfCnpj}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                      formErrors.telefone
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                        : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                    }`}
                  />
                  {formErrors.telefone && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.telefone}</p>
                  )}
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  E-mail de Contato *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                    formErrors.email
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                      : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.email}</p>
                )}
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Endereço Completo (Rua, Número, Bairro, Cidade/UF, CEP) *
                </label>
                <textarea
                  rows={2}
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Av. Rio Branco, 156, Sala 801 - Centro, Rio de Janeiro/RJ, CEP 20040-002"
                  className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:bg-slate-800 dark:text-slate-100 ${
                    formErrors.endereco
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                      : 'border-slate-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 dark:border-slate-700'
                  }`}
                />
                {formErrors.endereco && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.endereco}</p>
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
                      Salvando...
                    </>
                  ) : editingClient ? (
                    'Atualizar Cadastro'
                  ) : (
                    'Cadastrar Cliente'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteModalOpen && clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/80">
                <Trash2 className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                Excluir Cliente?
              </h2>
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Você está prestes a remover o cadastro de{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {clientToDelete.nome}
              </strong>{' '}
              ({clientToDelete.cpf_cnpj}).
            </p>

            {(clientToDelete._count?.processos || (clientToDelete.processos?.length ?? 0)) > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Atenção: Este cliente possui{' '}
                  <strong>
                    {clientToDelete._count?.processos || (clientToDelete.processos?.length ?? 0)} processo(s)
                  </strong>{' '}
                  vinculados. Não será possível excluí-lo diretamente pelo banco sem antes desvincular ou arquivar as ações.
                </span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setClientToDelete(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteClient}
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

      {/* MODAL / FICHA DE DETALHES DO CLIENTE */}
      {detailsModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-900 text-amber-100 dark:bg-amber-800">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
                    {selectedClient.nome}
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">
                    ID #{selectedClient.id_cliente} • Cadastrado em{' '}
                    {new Date(selectedClient.data_criacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedClient(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[11px] font-medium uppercase text-slate-400">Documento Oficial</div>
                <div className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedClient.cpf_cnpj}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[11px] font-medium uppercase text-slate-400">Telefone / WhatsApp</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedClient.telefone}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[11px] font-medium uppercase text-slate-400">E-mail</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedClient.email}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-[11px] font-medium uppercase text-slate-400">Ações Vinculadas</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedClient._count?.processos || (selectedClient.processos?.length ?? 0)} processo(s)
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="text-[11px] font-medium uppercase text-slate-400">Endereço Residencial / Comercial</div>
              <div className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                {selectedClient.endereco}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  openEditModal(selectedClient);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Editar Dados
              </button>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedClient(null);
                }}
                className="rounded-lg bg-amber-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-amber-700"
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
