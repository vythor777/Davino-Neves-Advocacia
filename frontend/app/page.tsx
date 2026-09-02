'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { MetricCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { processoService, Processo } from '@/services/processoService';
import { prazoService, Prazo } from '@/services/prazoService';
import { clienteService, Cliente } from '@/services/clienteService';
import {
  aniversarianteService,
  AniversariantesResponse,
  AniversarianteItem,
} from '@/services/aniversarianteService';
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
  Cake,
  Gift,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  CreditCard,
  BarChart3,
  Mail,
  Copy,
  Percent,
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
  const [aniversariantesData, setAniversariantesData] = useState<AniversariantesResponse | null>(null);
  const [aniversariantesFilter, setAniversariantesFilter] = useState<'TODOS' | 'USUARIO' | 'CLIENTE'>('TODOS');

  const loadData = async () => {
    try {
      setLoading(true);
      const [procRes, prazRes, cliRes, anivRes] = await Promise.allSettled([
        processoService.getAll(),
        prazoService.getAll(),
        clienteService.getAll(),
        aniversarianteService.getAniversariantesDoMes(),
      ]);

      if (procRes.status === 'fulfilled') setProcessos(procRes.value || []);
      if (prazRes.status === 'fulfilled') setPrazos(prazRes.value || []);
      if (cliRes.status === 'fulfilled') setClientes(cliRes.value || []);
      if (anivRes.status === 'fulfilled') setAniversariantesData(anivRes.value);
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

  const totalPrazos = prazos.length;
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
  const taxaCumprimento =
    totalPrazos > 0 ? Math.round((prazosCumpridos / totalPrazos) * 100) : 100;

  const totalClientes = clientes.length;
  const clientesPj = clientes.filter(
    (c) => (c.cpf_cnpj || '').replace(/\D/g, '').length > 11,
  ).length;
  const clientesPf = totalClientes - clientesPj;

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

  const handleCopyEmail = (email: string, nome: string) => {
    if (!email) {
      toast.error('E-mail não cadastrado para este contato.');
      return;
    }
    navigator.clipboard.writeText(email);
    toast.success(`E-mail de ${nome.split(' ')[0]} copiado para felicitação!`);
  };

  const listaAniversariantes = (aniversariantesData?.aniversariantes || []).filter((item) => {
    if (aniversariantesFilter === 'TODOS') return true;
    return item.tipo === aniversariantesFilter;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8 animate-fade-in-up">
      {/* Astrea Hero Control Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>Painel de Gestão Jurídica</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Olá, {user?.nome ? user.nome : 'Doutor(a)'} 👋
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Gestão centralizada de processos, prazos processuais e clientes em tempo real.
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
              <span>Consultar DataJud</span>
            </Link>
          </div>
        </div>
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
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition cursor-pointer"
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400 group-hover:scale-105 transition-transform">
                  <Briefcase className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                <span>Total cadastrado: {totalProcessos}</span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold group-hover:underline flex items-center gap-0.5">
                  Ver detalhes <ChevronRight className="h-3 w-3" />
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
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                        <Flame className="h-3 w-3" /> {prazosHoje.length} hoje
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400 group-hover:scale-105 transition-transform">
                  <CalendarClock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                <span>{prazosCumpridos} cumpridos</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline flex items-center gap-0.5">
                  Ver detalhes <ChevronRight className="h-3 w-3" />
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:scale-105 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                <span>{clientesPf} PF / {clientesPj} PJ</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold group-hover:underline flex items-center gap-0.5">
                  Ver detalhes <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Link>

            {/* Card 4: Taxa de Cumprimento de Prazos */}
            <Link
              href="/prazos"
              className="group astrea-card p-5 relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Taxa de Cumprimento
                  </span>
                  <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{taxaCumprimento}%</span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                <span>{prazosCumpridos} de {totalPrazos} prazos</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline flex items-center gap-0.5">
                  Ver detalhes <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Seção Central: Prazos Críticos do Dia & Assistente IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Coluna 1 & 2: Prazos Imediatos e Agenda */}
        <div className="lg:col-span-2 astrea-card p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Prazos em Destaque & Próximos Termos
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Termos com vencimento imediato para a controladoria
                  </p>
                </div>
              </div>
              <Link
                href="/prazos"
                className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1 hover:underline"
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

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Contagem de prazos em dias úteis CPC/CLT</span>
              </span>
              <Link
                href="/prazos"
                className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>Central de Prazos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Coluna 3: Assistente Jurídico (Ponto Exclusivo de IA no Dashboard) */}
          <div className="astrea-card p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      Assistente & Análise de Peças
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Inteligência jurídica integrada
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-sky-50 dark:bg-sky-950/70 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                  IA Jurídica
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Estruture minutas de petições, resumos executivos para clientes e realize a triagem ágil de intimações e jurisprudências.
              </p>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Extração inteligente de prazos a partir de intimações</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Resumos executivos de decisões judiciais para clientes</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Análise de cláusulas e apontamento de riscos contratuais</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/gemini"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow-sm shadow-slate-900/10 transition active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Abrir Assistente Jurídico</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Seção Executiva de Duas Colunas: Aniversariantes do Mês & Indícios Financeiros */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lado Esquerdo: Aniversariantes do Mês (lg:col-span-5) */}
          <div className="lg:col-span-5 astrea-card p-6 flex flex-col justify-between">
            <div>
              {/* Header do Card */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Cake className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Aniversariantes do Mês
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {aniversariantesData?.nomeMes || 'Mês Atual'} •{' '}
                      {aniversariantesData?.total || 0} celebrações registradas
                    </p>
                  </div>
                </div>
                <button
                  onClick={loadData}
                  title="Atualizar lista"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-500' : ''}`} />
                </button>
              </div>

              {/* Filtros rápidos: Todos, Equipe, Clientes */}
              <div className="mt-4 flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
                <button
                  type="button"
                  onClick={() => setAniversariantesFilter('TODOS')}
                  className={`flex-1 py-1 px-2 text-center rounded-lg font-medium transition ${
                    aniversariantesFilter === 'TODOS'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Todos ({aniversariantesData?.total || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setAniversariantesFilter('USUARIO')}
                  className={`flex-1 py-1 px-2 text-center rounded-lg font-medium transition ${
                    aniversariantesFilter === 'USUARIO'
                      ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Equipe ({aniversariantesData?.totalUsuarios || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setAniversariantesFilter('CLIENTE')}
                  className={`flex-1 py-1 px-2 text-center rounded-lg font-medium transition ${
                    aniversariantesFilter === 'CLIENTE'
                      ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Clientes ({aniversariantesData?.totalClientes || 0})
                </button>
              </div>

              {/* Lista Elegante e Minimalista */}
              <div className="mt-4 space-y-3">
                {listaAniversariantes.length > 0 ? (
                  listaAniversariantes.map((pessoa) => (
                    <div
                      key={pessoa.id}
                      className="group relative flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:border-slate-300 hover:bg-white dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar Circular com Iniciais */}
                        <div className="relative shrink-0">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold shadow-xs ring-2 ${
                              pessoa.tipo === 'USUARIO'
                                ? 'bg-gradient-to-tr from-sky-800 via-slate-800 to-indigo-900 text-white ring-sky-200 dark:ring-sky-900/50'
                                : 'bg-gradient-to-tr from-amber-800 via-slate-800 to-amber-950 text-amber-100 ring-amber-200 dark:ring-amber-900/50'
                            }`}
                          >
                            {pessoa.iniciais}
                          </div>
                          {pessoa.destaque && (
                            <span
                              title="Celebração iminente"
                              className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            </span>
                          )}
                        </div>

                        {/* Informações da Pessoa */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 transition-colors truncate">
                              {pessoa.nome}
                            </h3>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider shrink-0 ${
                                pessoa.tipo === 'USUARIO'
                                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                              }`}
                            >
                              {pessoa.tipo === 'USUARIO' ? 'Equipe' : 'Cliente'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {pessoa.subtitulo}
                          </p>
                        </div>
                      </div>

                      {/* Data e Ação Rápida */}
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {pessoa.diaFormatado} {aniversariantesData?.nomeMes?.slice(0, 3)}
                          </div>
                          <span className="inline-block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            {pessoa.diasRestantesTexto}
                          </span>
                        </div>

                        {/* Botão sutil de felicitação / copiar e-mail */}
                        {pessoa.email && (
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(pessoa.email!, pessoa.nome)}
                            title={`Copiar e-mail de ${pessoa.nome} (${pessoa.email})`}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 opacity-80 hover:border-sky-300 hover:text-sky-600 hover:opacity-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-sky-400 transition"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                    <Cake className="mx-auto h-8 w-8 text-slate-400/80 mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nenhum aniversariante neste filtro
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Registre datas de nascimento nos módulos de{' '}
                      <Link href="/usuarios" className="text-sky-600 dark:text-sky-400 underline font-medium">
                        Equipe
                      </Link>{' '}
                      ou{' '}
                      <Link href="/clientes" className="text-amber-600 dark:text-amber-400 underline font-medium">
                        Clientes
                      </Link>{' '}
                      para exibição automática.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé do Card de Aniversariantes */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Integração com Colaboradores & Clientes</span>
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/usuarios"
                  className="text-[11px] font-medium text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition"
                >
                  Equipe
                </Link>
                <span>•</span>
                <Link
                  href="/clientes"
                  className="text-[11px] font-medium text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
                >
                  Clientes
                </Link>
              </div>
            </div>
          </div>

          {/* Lado Direito: Indícios Financeiros (lg:col-span-7) */}
          <div className="lg:col-span-7 astrea-card p-6 flex flex-col justify-between">
            <div>
              {/* Header do Card */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <TrendingUp className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Indícios Financeiros
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Fluxo de caixa, honorários previstos e performance
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Mês Corrente
                  </span>
                </div>
              </div>

              {/* Grid de 4 Cards de KPI Financeiro */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* KPI 1: Faturamento Previsto */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Honorários Previstos
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" /> +12.4%
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    R$ 148.500<span className="text-sm font-semibold text-slate-400">,00</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Meta: R$ 160.000,00
                    </span>
                    {/* Mini Sparkline SVG */}
                    <svg className="h-5 w-16 text-emerald-500 overflow-visible" viewBox="0 0 64 20" fill="none">
                      <path
                        d="M0 16 L14 13 L28 15 L42 7 L56 9 L64 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* KPI 2: Honorários Liquidados */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Honorários Realizados
                    </span>
                    <span className="rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      62.1%
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    R$ 92.300<span className="text-sm font-semibold text-slate-400">,00</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: '62.1%' }} />
                    </div>
                  </div>
                </div>

                {/* KPI 3: Inadimplência / Pendências */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Pendências & Atrasos
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingDown className="h-3 w-3" /> -3.5%
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    R$ 8.200<span className="text-sm font-semibold text-slate-400">,00</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    2 faturas em cobrança preventiva
                  </p>
                </div>

                {/* KPI 4: Ticket Médio por Causa */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Ticket Médio / Causa
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      +5.8%
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    R$ 14.850<span className="text-sm font-semibold text-slate-400">,00</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    Base: 12 novos contratos ativos
                  </p>
                </div>
              </div>

              {/* Bloco de Composição de Receita Minimalista */}
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/60 dark:bg-slate-950/30">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Composição de Honorários</span>
                  <span className="text-[11px] font-normal text-slate-500">Distribuição mensal</span>
                </div>
                {/* Barra Segmentada */}
                <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <div className="h-full bg-sky-500" style={{ width: '58%' }} title="Contratual Fixo: 58%" />
                  <div className="h-full bg-indigo-500" style={{ width: '28%' }} title="Êxito & Sucumbência: 28%" />
                  <div className="h-full bg-slate-400 dark:bg-slate-600" style={{ width: '14%' }} title="Consultivo: 14%" />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    <span>Contratual (58%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>Êxito (28%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                    <span>Consultivo (14%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé do Card Financeiro */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Conciliação bancária atualizada</span>
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer flex items-center gap-1 transition-colors">
                Demonstrativo completo <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé Institucional Completo */}
        <InstitutionalFooter />
      </div>
    );
  }
