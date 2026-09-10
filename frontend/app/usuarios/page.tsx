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
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
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
        <Breadcrumbs items={[{ label: 'Equipe', icon: Shield }]} />
      </div>

        {/* Cabeçalho da Página */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 dark:border-white/[0.05] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-[#d4af37]/90 border border-slate-200 dark:border-white/[0.08]">
              <Shield className="h-3.5 w-3.5 text-[#c5a059]" />
              Controle de Acessos
            </div>
            <div className="flex items-center gap-2.5 mt-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25">
                <Users className="h-4 w-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                Equipe
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Acessos, advogados, colaboradores e permissões do escritório Davino Neves.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={carregarUsuarios}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100/80 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06] backdrop-blur-sm transition-colors cursor-pointer"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c5a059] hover:bg-[#d4b36f] text-slate-950 font-semibold px-4 py-2 text-xs shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              Novo membro
            </button>
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {successMsg && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="cursor-pointer">
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
              <div className="legal-glass-card fio-de-luz p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Equipe</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                  {stats.total}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{stats.ativos} ativos no sistema</p>
              </div>

              <div className="legal-glass-card fio-de-luz p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Administradores</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                  {stats.administradores}
                </p>
                <p className="text-[11px] text-purple-500/80 mt-0.5">Acesso administrativo integral</p>
              </div>

              <div className="legal-glass-card fio-de-luz p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Advogados</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c5a059]/15 text-[#c5a059]">
                    <Briefcase className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                  {stats.advogados}
                </p>
                <p className="text-[11px] text-[#c5a059]/80 mt-0.5">Operação e gestão jurídica</p>
              </div>

              <div className="legal-glass-card fio-de-luz p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Estagiários</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f8fafc]">
                  {stats.estagiarios}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Apoio jurídico e prazos</p>
              </div>
            </>
          )}
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail corporativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#12161f] pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#c5a059] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['TODOS', 'ADMINISTRADOR', 'ADVOGADO', 'ESTAGIARIO'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedRole === role
                    ? 'bg-[#c5a059] text-slate-950 font-semibold shadow-xs'
                    : 'border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
        <div className="legal-glass-card fio-de-luz overflow-hidden">
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
                <thead className="border-b border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] font-semibold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-3.5 pl-6 pr-3 font-medium">Colaborador</th>
                    <th className="px-3 py-3.5 font-medium">E-mail Corporativo</th>
                    <th className="px-3 py-3.5 font-medium">Perfil de Acesso</th>
                    <th className="px-3 py-3.5 font-medium">Status</th>
                    <th className="px-3 py-3.5 font-medium">Data de Criação</th>
                    <th className="py-3.5 pl-3 pr-6 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40 dark:divide-white/[0.04]">
                  {filteredUsuarios.map((u) => (
                    <tr
                      key={u.id_usuario}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition"
                    >
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/25 font-bold text-[#c5a059] shrink-0 text-xs">
                            {u.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-[#f8fafc]">
                              {u.nome}
                            </span>
                            <p className="text-[11px] text-slate-400">
                              ID #{u.id_usuario}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="px-3 py-3.5">{getRoleBadge(u.role)}</td>
                      <td className="px-3 py-3.5">
                        {u.ativo !== false ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/60 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-slate-500 dark:text-slate-400">
                        {new Date(u.data_criacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#c5a059] dark:hover:bg-white/[0.04] dark:hover:text-[#c5a059] transition cursor-pointer"
                            title="Editar usuário"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(u)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition cursor-pointer"
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg legal-glass-card fio-de-luz p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25">
                  <UserPlus className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-[#f8fafc]">
                  Adicionar membro da equipe
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.04] dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Dra. Juliana Neves"
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#12161f] pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#c5a059] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail Corporativo *
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juliana.neves@davinoeneves.adv.br"
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#12161f] pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#c5a059] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data de Nascimento (para registro de aniversariante)
                </label>
                <div className="relative">
                  <Cake className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.data_nascimento || ''}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#12161f] pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Senha Inicial de Acesso * (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#12161f] pl-9 pr-10 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Perfil de Acesso *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMINISTRADOR' })}
                    className={`rounded-xl border p-3 text-center transition cursor-pointer ${
                      formData.role === 'ADMINISTRADOR'
                        ? 'border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300'
                        : 'border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <ShieldCheck className="mx-auto h-4 w-4 mb-1 text-purple-500" />
                    <span className="font-semibold block">Administrador</span>
                    <span className="text-[10px] text-slate-400">Acesso Total</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADVOGADO' })}
                    className={`rounded-xl border p-3 text-center transition cursor-pointer ${
                      formData.role === 'ADVOGADO'
                        ? 'border-[#c5a059]/50 bg-[#c5a059]/15 text-[#c5a059]'
                        : 'border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Briefcase className="mx-auto h-4 w-4 mb-1 text-[#c5a059]" />
                    <span className="font-semibold block">Advogado</span>
                    <span className="text-[10px] text-slate-400">Gestão Jurídica</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ESTAGIARIO' })}
                    className={`rounded-xl border p-3 text-center transition cursor-pointer ${
                      formData.role === 'ESTAGIARIO'
                        ? 'border-[#c5a059]/50 bg-[#c5a059]/15 text-slate-900 dark:text-[#dfcaa0]'
                        : 'border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <GraduationCap className="mx-auto h-4 w-4 mb-1 text-[#c5a059]" />
                    <span className="font-semibold block">Estagiário</span>
                    <span className="text-[10px] text-slate-400">Apoio & Prazos</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ativoCreate"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded text-[#c5a059] focus:ring-[#c5a059]"
                />
                <label htmlFor="ativoCreate" className="font-medium text-slate-700 dark:text-slate-300">
                  Usuário ativo no sistema (liberar acesso imediatamente)
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200/60 dark:border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b36f] text-slate-950 font-semibold px-4 py-2 text-xs shadow-xs hover:shadow-md transition active:scale-98 disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg legal-glass-card fio-de-luz p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/25">
                  <Edit2 className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-[#f8fafc]">
                  Editar membro da equipe
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.04] dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#12161f] px-3.5 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail Corporativo
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#12161f] px-3.5 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data de Nascimento (para registro de aniversariante)
                </label>
                <div className="relative">
                  <Cake className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={editFormData.data_nascimento || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, data_nascimento: e.target.value })}
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#12161f] pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Redefinir Senha (deixe em branco para manter a atual)
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    minLength={6}
                    value={editFormData.senha || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, senha: e.target.value })}
                    placeholder="Nova senha (opcional)"
                    className="w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#12161f] pl-9 pr-10 py-2 text-slate-900 dark:text-slate-100 focus:border-[#c5a059] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Perfil de Acesso
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'ADMINISTRADOR' })}
                    className={`rounded-xl border p-3 text-center transition cursor-pointer ${
                      editFormData.role === 'ADMINISTRADOR'
                        ? 'border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300'
                        : 'border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <ShieldCheck className="mx-auto h-4 w-4 mb-1 text-purple-500" />
                    <span className="font-semibold block">Administrador</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'ADVOGADO' })}
                    className={`rounded-xl border p-3 text-center transition cursor-pointer ${
                      editFormData.role === 'ADVOGADO'
                        ? 'border-[#c5a059]/50 bg-[#c5a059]/15 text-[#c5a059]'
                        : 'border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Briefcase className="mx-auto h-4 w-4 mb-1 text-[#c5a059]" />
                    <span className="font-semibold block">Advogado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'ESTAGIARIO' })}
                    className={`rounded-xl border p-3 text-center transition cursor-pointer ${
                      editFormData.role === 'ESTAGIARIO'
                        ? 'border-[#c5a059]/50 bg-[#c5a059]/15 text-slate-900 dark:text-[#dfcaa0]'
                        : 'border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <GraduationCap className="mx-auto h-4 w-4 mb-1 text-[#c5a059]" />
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
                  className="rounded text-[#c5a059] focus:ring-[#c5a059]"
                />
                <label htmlFor="ativoEdit" className="font-medium text-slate-700 dark:text-slate-300">
                  Status ativo (desmarque para bloquear o acesso deste usuário)
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200/60 dark:border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b36f] text-slate-950 font-semibold px-4 py-2 text-xs shadow-xs hover:shadow-md transition active:scale-98 disabled:opacity-50 cursor-pointer"
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
