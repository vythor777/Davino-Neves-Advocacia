'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { SecurityBadge } from '@/components/SecurityBadge';
import { MetricCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { processoService, Processo } from '@/services/processoService';
import { prazoService, Prazo } from '@/services/prazoService';
import { clienteService, Cliente } from '@/services/clienteService';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarClock,
  Search,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Scale,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Calendar,
  Building2,
  Layers,
  Sparkle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  return (
    <AuthGuard>
      <AstreaDashboard />
    </AuthGuard>
  );
}

function AstreaDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [quickCnj, setQuickCnj] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [procRes, prazRes, cliRes] = await Promise.allSettled([
        processoService.getAll(),
        prazoService.getAll(),
        clienteService.getAll(),
      ]);

      if (procRes.status === 'fulfilled') setProcessos(procRes.value || []);
      if (prazRes.status === 'fulfilled') setPrazos(prazRes.value || []);
      if (cliRes.status === 'fulfilled') setClientes(cliRes.value || []);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cálculos de métricas do sistema
  const totalProcessos = processos.length;
  const processosAtivos = processos.filter(
    (p) => p.status !== 'Arquivado' && p.status !== 'Encerrado',
  ).length;
  const processosAguardando = processos.filter(
    (p) => p.status === 'Aguardando Sentença' || p.status === 'Fase Recursal',
  ).length;

  const hojeStr = new Date().toISOString().split('T')[0];
  const seteDiasFrente = new Date();
  seteDiasFrente.setDate(seteDiasFrente.getDate() + 7);
  const seteDiasStr = seteDiasFrente.toISOString().split('T')[0];

  const prazosPendentes = prazos.filter((p) => p.status === 'Pendente');
  const prazosHoje = prazosPendentes.filter((p) => {
    const dataPrazo = p.data_vencimento ? p.data_vencimento.split('T')[0] : '';
    return dataPrazo === hojeStr;
  });
  const prazosUrgentes = prazosPendentes.filter((p) => {
    const dataPrazo = p.data_vencimento ? p.data_vencimento.split('T')[0] : '';
    return dataPrazo <= seteDiasStr;
  });
  const prazosCumpridos = prazos.filter((p) => p.status === 'Cumprido').length;

  const totalClientes = clientes.length;
  const clientesPj = clientes.filter(
    (c) => (c.cpf_cnpj || '').replace(/\D/g, '').length > 11,
  ).length;
  const clientesPf = totalClientes - clientesPj;

  const handleQuickCnjSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCnj.trim()) return;
    router.push(`/datajud?cnj=${encodeURIComponent(quickCnj.trim())}`);
  };

  const handleCumprirPrazoRapido = async (idPrazo: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await prazoService.update(idPrazo, { status: 'Cumprido' });
      toast.success('Prazo marcado como cumprido com sucesso!');
      loadData();
    } catch (error) {
      toast.error('Não foi possível atualizar o prazo.');
    }
  };

  const modules = [
    {
      title: 'Controle de Processos',
      subtitle: `${processosAtivos} processos em andamento`,
      description: 'Acompanhamento unificado de autos, varas, foros e histórico de andamentos com o cliente.',
      href: '/processos',
      icon: Briefcase,
      badge: 'Essencial',
      iconBg: 'from-sky-500 to-blue-600',
      badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
    },
    {
      title: 'Prazos & Atividades',
      subtitle: `${prazosUrgentes.length} termos para esta semana`,
      description: 'Gestão de termos fatais, contagem de prazos CPC/CLT e alertas visuais de vencimento.',
      href: '/prazos',
      icon: CalendarClock,
      badge: prazosHoje.length > 0 ? `${prazosHoje.length} Hoje!` : 'Agenda',
      iconBg: 'from-amber-500 to-orange-600',
      badgeColor:
        prazosHoje.length > 0
          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    },
    {
      title: 'Contatos & Clientes',
      subtitle: `${totalClientes} clientes cadastrados`,
      description: 'Gestão completa de pessoas físicas e jurídicas, documentos de identificação e vínculos aos autos.',
      href: '/clientes',
      icon: Users,
      badge: 'CRM Jurídico',
      iconBg: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    },
    {
      title: 'DataJud CNJ (Tribunais)',
      subtitle: '91 tribunais integrados',
      description: 'Sincronização direta com a API pública do CNJ para busca e extração de andamentos e movimentos.',
      href: '/datajud',
      icon: Search,
      badge: 'Live CNJ',
      iconBg: 'from-indigo-500 to-purple-600',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    },
    {
      title: 'IA Jurídica (Gemini)',
      subtitle: 'Gemini 3.7 Flash & Fallbacks',
      description: 'Análise estruturada de petições, contratos, resumos executivos para clientes e extração automática de prazos.',
      href: '/gemini',
      icon: Sparkles,
      badge: 'Gemini 3.7 Ativo',
      iconBg: 'from-purple-500 to-pink-600',
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Equipe & Permissões',
      subtitle: 'Controle RBAC',
      description: 'Gerenciamento de membros do escritório por perfil (Administrador, Advogado, Estagiário).',
      href: '/usuarios',
      icon: Shield,
      badge: isAdmin ? 'Admin' : 'Restrito',
      iconBg: 'from-slate-600 to-slate-800',
      badgeColor: isAdmin
        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Astrea Hero Control Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-gradient-to-bl from-sky-400/10 via-cyan-400/5 to-transparent blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 border border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800">
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                <span>Davino Neves • Painel de Gestão Jurídica</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Olá, {user?.nome ? user.nome : 'Doutor(a)'} 👋
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Gestão inteligente de processos, prazos fatais e controladoria jurídica conectada à base nacional do CNJ.
              </p>
            </div>

            {/* Ações Rápidas de Topo */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/processos"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-sky-600/20 hover:bg-sky-500 transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Processo</span>
              </Link>
              <Link
                href="/prazos"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm shadow-amber-500/20 hover:bg-amber-400 transition active:scale-95"
              >
                <Clock className="h-4 w-4" />
                <span>Novo Prazo</span>
              </Link>
              <Link
                href="/datajud"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition active:scale-95"
              >
                <Search className="h-4 w-4 text-sky-500" />
                <span>Consultar CNJ</span>
              </Link>
            </div>
          </div>

          {/* Barra de Busca Expressa CNJ */}
          <form
            onSubmit={handleQuickCnjSearch}
            className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={quickCnj}
                onChange={(e) => setQuickCnj(e.target.value)}
                placeholder="Consulta Expressa CNJ: Digite o número único (ex: 0000000-00.0000.0.00.0000)..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-400 font-mono focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition shrink-0"
            >
              <span>Buscar Andamentos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Astrea Indicadores (KPI Cards) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Indicadores do Escritório
              </h2>
            </div>
            <button
              onClick={loadData}
              title="Recarregar indicadores"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Processos */}
              <Link
                href="/processos"
                className="group astrea-card p-5 relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Processos Ativos
                    </span>
                    <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      {processosAtivos}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400 group-hover:scale-110 transition-transform">
                    <Briefcase className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                  <span>Total: {totalProcessos}</span>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Ver autos <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>

              {/* Card 2: Prazos Fatais / Hoje */}
              <Link
                href="/prazos"
                className="group astrea-card p-5 relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Prazos Esta Semana
                    </span>
                    <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{prazosUrgentes.length}</span>
                      {prazosHoje.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                          <Flame className="h-3 w-3" /> {prazosHoje.length} hoje
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                  <span>{prazosCumpridos} cumpridos</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Ver agenda <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>

              {/* Card 3: Clientes */}
              <Link
                href="/clientes"
                className="group astrea-card p-5 relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Carteira de Clientes
                    </span>
                    <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      {totalClientes}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                  <span>{clientesPf} PF / {clientesPj} PJ</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Ver contatos <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>

              {/* Card 4: DataJud & Gemini IA */}
              <Link
                href="/gemini"
                className="group astrea-card p-5 relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      IA Jurídica (Google Gemini)
                    </span>
                    <div className="mt-1 text-base font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>Gemini 3.7 Ativo</span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                  <span>Análise de Peças</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Abrir IA <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Seção Central: Prazos Críticos do Dia (Astrea Priority Hub) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 & 2: Prazos Imediatos e Agenda */}
          <div className="lg:col-span-2 astrea-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-amber-500" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Prazos em Destaque & Próximos Termos
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Termos com vencimento imediato para o escritório
                    </p>
                  </div>
                </div>
                <Link
                  href="/prazos"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
                >
                  <span>Ver Todos ({prazos.length})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Lista de Prazos */}
              <div className="mt-4 space-y-2.5">
                {loading ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Carregando agenda de prazos...
                  </div>
                ) : prazosUrgentes.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto opacity-70 mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nenhum prazo pendente para os próximos 7 dias!
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sua controladoria jurídica está 100% em dia.
                    </p>
                  </div>
                ) : (
                  prazosUrgentes.slice(0, 4).map((prazo) => {
                    const dataFormatada = prazo.data_vencimento
                      ? prazo.data_vencimento.split('T')[0]
                      : '';
                    const isHoje = dataFormatada === hojeStr;
                    const isVencido = dataFormatada < hojeStr;

                    return (
                      <div
                        key={prazo.id_prazo}
                        onClick={() => router.push('/prazos')}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:hover:border-slate-700 transition cursor-pointer gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isVencido
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : isHoje
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                            }`}
                          >
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {prazo.descricao}
                              </span>
                              {isHoje && (
                                <span className="rounded-full bg-rose-500 text-white px-2 py-0.2 text-[9px] font-extrabold uppercase">
                                  Hoje
                                </span>
                              )}
                              {isVencido && (
                                <span className="rounded-full bg-red-600 text-white px-2 py-0.2 text-[9px] font-extrabold uppercase">
                                  Vencido
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>Vencimento: <strong>{dataFormatada}</strong></span>
                              {prazo.processo && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">
                                    {prazo.processo.numero_processo}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={(e) => handleCumprirPrazoRapido(prazo.id_prazo, e)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-emerald-950/60 transition"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Cumprir</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Alertas de contagem de dias úteis CPC/CLT</span>
              <Link href="/prazos" className="font-semibold text-sky-600 hover:underline">
                Abrir Central de Prazos →
              </Link>
            </div>
          </div>

          {/* Coluna 3: Card de Produtividade & IA Gemini */}
          <div className="astrea-card p-6 bg-gradient-to-br from-sky-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between relative overflow-hidden border-sky-800/40">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 h-36 w-36 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
                <Sparkles className="h-3 w-3" />
                <span>Google Gemini 3.7</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white leading-snug">
                IA Jurídica Gemini Integrada
              </h3>
              <p className="mt-1.5 text-xs text-sky-100/80 leading-relaxed">
                Analise intimações, extraia prazos automaticamente e gere minutas de petições com inteligência artificial de última geração.
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-sky-200/90">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Extração de prazos a partir de intimações</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sky-200/90">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Resumos executivos de decisões para clientes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sky-200/90">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Análise de validade e riscos contratuais</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-sky-800/50">
              <Link
                href="/gemini"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-cyan-300 transition active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Iniciar Análise com IA</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Grid de Módulos (App Grid) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Módulos do Sistema
            </h2>
            <span className="text-xs text-slate-400">
              Davino Neves Advocacia
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={idx}
                  href={mod.href}
                  className="group astrea-card p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:border-sky-500/50"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr ${mod.iconBg} text-white shadow-md shadow-sky-500/10 group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 mt-0.5">
                      {mod.subtitle}
                    </p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs font-bold text-sky-600 dark:text-sky-400">
                    <span>Acessar módulo</span>
                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Rodapé Institucional Completo */}
      <InstitutionalFooter />
    </div>
  );
}
