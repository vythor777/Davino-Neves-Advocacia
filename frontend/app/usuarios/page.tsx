'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { TableSkeleton, MetricCardSkeleton } from '@/components/Skeleton';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  usuarioService,
  UsuarioItem,
  CreateUsuarioInput,
  UpdateUsuarioInput,
} from '@/services/usuarioService';
import { Role } from '@/services/authService';
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  GraduationCap,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Cake,
} from 'lucide-react';

export default function UsuariosPage() {
  return (
    <AuthGuard requireAdmin={true}>
      <UsuariosContent />
    </AuthGuard>
  );
}

function UsuariosContent() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('TODOS');

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioItem | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateUsuarioInput>({
    nome: '',
    email: '',
    senha: '',
    role: 'ADVOGADO',
    ativo: true,
    data_nascimento: '',
  });

  const [editFormData, setEditFormData] = useState<UpdateUsuarioInput>({
    nome: '',
    email: '',
    senha: '',
    role: 'ADVOGADO',
    ativo: true,
    data_nascimento: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar lista de usuários.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const handleOpenCreate = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      role: 'ADVOGADO',
      ativo: true,
      data_nascimento: '',
    });
    setShowPassword(false);
    setErrorMsg(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (usuario: UsuarioItem) => {
    setSelectedUsuario(usuario);
    setEditFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      role: usuario.role,
      ativo: usuario.ativo,
      data_nascimento: usuario.data_nascimento ? usuario.data_nascimento.split('T')[0] : '',
    });
    setShowPassword(false);
    setErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (usuario: UsuarioItem) => {
    setSelectedUsuario(usuario);
    setErrorMsg(null);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.senha) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.data_nascimento) {
      const match = formData.data_nascimento.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const [, ano, mes, dia] = match;
        const selectedDate = new Date(Number(ano), Number(mes) - 1, Number(dia));
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (selectedDate > today) {
          setErrorMsg('A data de nascimento não pode ser uma data futura.');
          return;
        }
        if (Number(ano) < 1900) {
          setErrorMsg('Insira um ano de nascimento válido a partir de 1900.');
          return;
        }
      }
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await usuarioService.create({
        ...formData,
        data_nascimento: formData.data_nascimento ? formData.data_nascimento : null,
      });
      setSuccessMsg('Novo colaborador cadastrado com sucesso na equipe!');
      setIsCreateModalOpen(false);
      await carregarUsuarios();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar usuário.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario) return;

    if (editFormData.data_nascimento) {
      const match = editFormData.data_nascimento.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const [, ano, mes, dia] = match;
        const selectedDate = new Date(Number(ano), Number(mes) - 1, Number(dia));
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (selectedDate > today) {
          setErrorMsg('A data de nascimento não pode ser uma data futura.');
          return;
        }
        if (Number(ano) < 1900) {
          setErrorMsg('Insira um ano de nascimento válido a partir de 1900.');
          return;
        }
      }
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const updatePayload: UpdateUsuarioInput = {
        nome: editFormData.nome,
        email: editFormData.email,
        role: editFormData.role,
        ativo: editFormData.ativo,
        data_nascimento: editFormData.data_nascimento ? editFormData.data_nascimento : null,
      };

      if (editFormData.senha && editFormData.senha.trim().length > 0) {
        updatePayload.senha = editFormData.senha;
      }

      await usuarioService.update(selectedUsuario.id_usuario, updatePayload);
      setSuccessMsg('Dados do colaborador atualizados com sucesso!');
      setIsEditModalOpen(false);
      await carregarUsuarios();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar dados do usuário.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUsuario) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await usuarioService.delete(selectedUsuario.id_usuario);
      setSuccessMsg('Colaborador removido com sucesso!');
      setIsDeleteModalOpen(false);
      await carregarUsuarios();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir usuário.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Contadores
  const stats = useMemo(() => {
    const total = usuarios.length;
    const administradores = usuarios.filter((u) => u.role === 'ADMINISTRADOR').length;
    const advogados = usuarios.filter((u) => u.role === 'ADVOGADO').length;
    const estagiarios = usuarios.filter((u) => u.role === 'ESTAGIARIO').length;
    const ativos = usuarios.filter((u) => u.ativo !== false).length;
    return { total, administradores, advogados, estagiarios, ativos };
  }, [usuarios]);

  // Lista filtrada
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const matchesSearch =
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'TODOS' || u.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [usuarios, searchTerm, selectedRole]);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Administrador
          </span>
        );
      case 'ADVOGADO':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
            <Briefcase className="h-3.5 w-3.5" />
            Advogado
          </span>
        );
      case 'ESTAGIARIO':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
            <GraduationCap className="h-3.5 w-3.5" />
            Estagiário
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in-up space-y-6">
      {/* Breadcrumb de Navegação */}
      <div>
        <Breadcrumbs items={[{ label: 'Equipe & Usuários', icon: Shield }]} />
      </div>

        {/* Cabeçalho da Página */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-100 p-1.5 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                <Shield className="h-5 w-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gestão da Equipe & Usuários
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Controle de acessos, papéis (Administrador, Advogado, Estagiário) e credenciais do escritório Davino Neves.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={carregarUsuarios}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 transition active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              Novo Colaborador
            </button>
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {successMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center justify-between dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-2xs">
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
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Cards de Métricas */}
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
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Equipe</span>
                  <Users className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/30 dark:bg-purple-950/20 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Administradores</span>
                  <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-purple-900 dark:text-purple-200">
                  {stats.administradores}
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-300">Advogados</span>
                  <Briefcase className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-amber-950 dark:text-amber-200">
                  {stats.advogados}
                </p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Estagiários</span>
                  <GraduationCap className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                </div>
                <p className="mt-2 text-2xl font-bold font-serif text-blue-950 dark:text-blue-200">
                  {stats.estagiarios}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail corporativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['TODOS', 'ADMINISTRADOR', 'ADVOGADO', 'ESTAGIARIO'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white dark:bg-blue-600'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {role === 'TODOS'
                  ? 'Todos'
                  : role === 'ADMINISTRADOR'
                  ? 'Administradores'
                  : role === 'ADVOGADO'
                  ? 'Advogados'
                  : 'Estagiários'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : filteredUsuarios.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchTerm || selectedRole !== 'TODOS' ? "Nenhum colaborador localizado" : "Nenhum colaborador cadastrado"}
              description={
                searchTerm || selectedRole !== 'TODOS'
                  ? "Tente ajustar o perfil de acesso ou a busca por nome/e-mail."
                  : "Cadastre novos advogados, administradores ou estagiários na equipe."
              }
              action={
                !searchTerm && selectedRole === 'TODOS'
                  ? {
                      label: "Cadastrar Colaborador",
                      onClick: handleOpenCreate,
                      icon: UserPlus,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <tr>
                    <th className="py-3.5 pl-6 pr-3">Colaborador</th>
                    <th className="px-3 py-3.5">E-mail Corporativo</th>
                    <th className="px-3 py-3.5">Perfil de Acesso</th>
                    <th className="px-3 py-3.5">Status</th>
                    <th className="px-3 py-3.5">Data de Criação</th>
                    <th className="py-3.5 pl-3 pr-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsuarios.map((u) => (
                    <tr
                      key={u.id_usuario}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                            {u.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {u.nome}
                            </span>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                              ID #{u.id_usuario}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="px-3 py-4">{getRoleBadge(u.role)}</td>
                      <td className="px-3 py-4">
                        {u.ativo !== false ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(u.data_criacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition"
                            title="Editar usuário"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(u)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Modal de Criação */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Cadastrar Novo Colaborador
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <div className="relative rounded-xl">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Dra. Juliana Neves"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail Corporativo *
                </label>
                <div className="relative rounded-xl">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juliana.neves@davinoeneves.adv.br"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data de Nascimento (para registro de aniversariante)
                </label>
                <div className="relative rounded-xl">
                  <Cake className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.data_nascimento || ''}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Senha Inicial de Acesso * (mínimo 6 caracteres)
                </label>
                <div className="relative rounded-xl">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 py-2 text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Perfil de Acesso *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMINISTRADOR' })}
                    className={`rounded-xl border p-3 text-center transition ${
                      formData.role === 'ADMINISTRADOR'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 dark:border-purple-500 dark:bg-purple-950/50 dark:text-purple-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    <ShieldCheck className="mx-auto h-5 w-5 mb-1 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold block">Administrador</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Acesso Total</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADVOGADO' })}
                    className={`rounded-xl border p-3 text-center transition ${
                      formData.role === 'ADVOGADO'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    <Briefcase className="mx-auto h-5 w-5 mb-1 text-amber-700 dark:text-amber-400" />
                    <span className="font-semibold block">Advogado</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Gestão Jurídica</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ESTAGIARIO' })}
                    className={`rounded-xl border p-3 text-center transition ${
                      formData.role === 'ESTAGIARIO'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    <GraduationCap className="mx-auto h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold block">Estagiário</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Apoio & Prazos</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ativoCreate"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="ativoCreate" className="font-medium text-slate-700 dark:text-slate-300">
                  Usuário ativo no sistema (liberar acesso imediatamente)
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Salvando...' : 'Cadastrar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditModalOpen && selectedUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Edit2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Editar Colaborador #{selectedUsuario.id_usuario}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail Corporativo
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data de Nascimento (para registro de aniversariante)
                </label>
                <div className="relative rounded-xl">
                  <Cake className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={editFormData.data_nascimento || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, data_nascimento: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Redefinir Senha (deixe em branco para manter a atual)
                </label>
                <div className="relative rounded-xl">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    minLength={6}
                    value={editFormData.senha || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, senha: e.target.value })}
                    placeholder="Nova senha (opcional)"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-10 py-2 text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Perfil de Acesso
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'ADMINISTRADOR' })}
                    className={`rounded-xl border p-3 text-center transition ${
                      editFormData.role === 'ADMINISTRADOR'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 dark:border-purple-500 dark:bg-purple-950/50 dark:text-purple-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    <ShieldCheck className="mx-auto h-5 w-5 mb-1 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold block">Administrador</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'ADVOGADO' })}
                    className={`rounded-xl border p-3 text-center transition ${
                      editFormData.role === 'ADVOGADO'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    <Briefcase className="mx-auto h-5 w-5 mb-1 text-amber-700 dark:text-amber-400" />
                    <span className="font-semibold block">Advogado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'ESTAGIARIO' })}
                    className={`rounded-xl border p-3 text-center transition ${
                      editFormData.role === 'ESTAGIARIO'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    <GraduationCap className="mx-auto h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold block">Estagiário</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ativoEdit"
                  checked={editFormData.ativo}
                  onChange={(e) => setEditFormData({ ...editFormData, ativo: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="ativoEdit" className="font-medium text-slate-700 dark:text-slate-300">
                  Status ativo (desmarque para bloquear o acesso deste usuário)
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão Reutilizável & Acessível */}
      <ConfirmModal
        isOpen={isDeleteModalOpen && !!selectedUsuario}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUsuario(null);
        }}
        onConfirm={handleDeleteSubmit}
        title="Confirmar Exclusão de Colaborador"
        description={`Tem certeza que deseja remover o usuário ${selectedUsuario?.nome} (${selectedUsuario?.email})? Todas as permissões de acesso deste colaborador serão revogadas.`}
        confirmLabel="Sim, Excluir Colaborador"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={submitting}
      />

      {/* Rodapé Institucional */}
      <InstitutionalFooter />
    </div>
  );
}
