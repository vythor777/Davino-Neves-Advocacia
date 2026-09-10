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
import { calcularStatusPrazo } from '@/utils/dateUtils';
import {
  aniversarianteService,
  AniversariantesResponse,
  AniversarianteItem,
} from '@/services/aniversarianteService';
import {
  financeiroService,
  ResumoFinanceiroResponse,
} from '@/services/financeiroService';
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
  const [financeiroData, setFinanceiroData] = useState<ResumoFinanceiroResponse | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [procRes, prazRes, cliRes, anivRes, finRes] = await Promise.allSettled([
        processoService.getAll(),
        prazoService.getAll(),
        clienteService.getAll(),
        aniversarianteService.getAniversariantesDoMes(),
        financeiroService.getResumo(),
      ]);

      if (procRes.status === 'fulfilled') setProcessos(procRes.value || []);
      if (prazRes.status === 'fulfilled') setPrazos(prazRes.value || []);
      if (cliRes.status === 'fulfilled') setClientes(cliRes.value || []);
      if (anivRes.status === 'fulfilled') setAniversariantesData(anivRes.value);
      if (finRes.status === 'fulfilled') setFinanceiroData(finRes.value);
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

  const totalPrazos = prazos.length;
  const prazosPendentes = prazos.filter((p) => p.status?.toLowerCase() !== 'cumprido');
  const prazosHoje = prazosPendentes.filter((p) => {
    const calc = calcularStatusPrazo(p.data_vencimento, p.status, p.hora);
    return calc.urgencia === 'hoje';
  });
  const prazosUrgentes = prazosPendentes.filter((p) => {
    const calc = calcularStatusPrazo(p.data_vencimento, p.status, p.hora);
    return calc.urgencia === 'vencido' || calc.urgencia === 'hoje' || calc.dias <= 7;
  });
  const prazosCumpridos = prazos.filter((p) => p.status?.toLowerCase() === 'cumprido').length;
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
      <div className="legal-glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 dark:bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-[0.75px] border-slate-200/80 dark:border-white/[0.08]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059]" />
              <span className="tracking-wide">Davino Neves Advocacia</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Davino Neves Advocacia | Painel Executivo
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Gestão centralizada de processos, prazos processuais e clientes em tempo real.
            </p>
          </div>

          {/* Ações Rápidas de Topo */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/processos"
              id="btn-novo-processo-hero"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-[#161b22] px-4 py-2.5 text-xs font-semibold text-white dark:text-[#dfcaa0] border border-[0.75px] border-slate-800 dark:border-white/[0.12] hover:bg-slate-800 dark:hover:bg-[#1f2631] shadow-2xs transition active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[1.5] text-[#c5a059]" />
              <span>Novo Processo</span>
            </Link>
            <Link
              href="/prazos"
              id="btn-novo-prazo-hero"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] shadow-2xs transition active:scale-95"
            >
              <Clock className="h-4 w-4 stroke-[1.5] text-slate-500 dark:text-slate-400" />
              <span>Novo Prazo</span>
            </Link>
            <Link
              href="/datajud"
              id="btn-consultar-datajud-hero"
              className="inline-flex items-center gap-2 rounded-xl border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-transparent px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition active:scale-95"
            >
              <Search className="h-4 w-4 stroke-[1.5] text-slate-400 dark:text-[#dfcaa0]" />
              <span>Consultar DataJud</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Indicadores (KPI Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 stroke-[1.25] text-slate-700 dark:text-[#dfcaa0]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Indicadores do Escritório
            </h2>
          </div>
          <button
            onClick={loadData}
            title="Recarregar indicadores"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[#dfcaa0] transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 stroke-[1.25] ${loading ? 'animate-spin' : ''}`} />
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
              id="kpi-card-processos"
              className="group legal-glass-card p-5 relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Processos Ativos
                  </span>
                  <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {processosAtivos}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-[#dfcaa0] group-hover:scale-105 transition-transform">
                  <Briefcase className="h-5 w-5 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-[0.75px] border-slate-100 dark:border-white/[0.06] pt-2.5">
                <span>Total cadastrado: {totalProcessos}</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-semibold group-hover:underline flex items-center gap-0.5">
                  Ver detalhes <ChevronRight className="h-3 w-3 stroke-[1.25]" />
                </span>
              </div>
            </Link>

            {/* Card 2: Prazos Fatais / Hoje */}
            <Link
              href="/prazos"
              id="kpi-card-prazos"
              className="group legal-glass-card p-5 relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Prazos Esta Semana
                  </span>
                  <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{prazosUrgentes.length}</span>
                    {prazosHoje.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-[0.75px] border-rose-500/30">
                        <Flame className="h-3 w-3 stroke-[1.25]" /> {prazosHoje.length} hoje
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-[#dfcaa0] group-hover:scale-105 transition-transform">
                  <CalendarClock className="h-5 w-5 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-[0.75px] border-slate-100 dark:border-white/[0.06] pt-2.5">
                <span>{prazosCumpridos} cumpridos</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-semibold group-hover:underline flex items-center gap-0.5">
                  Ver detalhes <ChevronRight className="h-3 w-3 stroke-[1.25]" />
                </span>
              </div>
            </Link>

            {/* Card 3: Clientes */}
            <Link
              href="/clientes"
              id="kpi-card-clientes"
              className="group legal-glass-card p-5 relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Carteira de Clientes
                  </span>
                  <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {totalClientes}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-[#dfcaa0] group-hover:scale-105 transition-transform">
                  <Users className="h-5 w-5 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-[0.75px] border-slate-100 dark:border-white/[0.06] pt-2.5">
                <span>{clientesPf} PF / {clientesPj} PJ</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-semibold group-hover:underline flex items-center gap-0.5">
                  Ver detalhes <ChevronRight className="h-3 w-3 stroke-[1.25]" />
                </span>
              </div>
            </Link>

            {/* Card 4: Taxa de Cumprimento de Prazos */}
            <Link
              href="/prazos"
              id="kpi-card-taxa"
              className="group legal-glass-card p-5 relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Taxa de Cumprimento
                  </span>
                  <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{taxaCumprimento}%</span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-[#dfcaa0] group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="h-5 w-5 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-[0.75px] border-slate-100 dark:border-white/[0.06] pt-2.5">
                <span>{prazosCumpridos} de {totalPrazos} prazos</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-semibold group-hover:underline flex items-center gap-0.5">
                  Ver detalhes <ChevronRight className="h-3 w-3 stroke-[1.25]" />
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Seção Central: Prazos Críticos do Dia & Assistente IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Coluna 1 & 2: Prazos Imediatos e Agenda */}
        <div className="lg:col-span-2 legal-glass-card p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[0.75px] border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-[#dfcaa0]">
                  <CalendarClock className="h-4 w-4 stroke-[1.25]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Prazos em Destaque & Próximos Termos
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Termos com vencimento imediato para a controladoria
                  </p>
                </div>
              </div>
              <Link
                href="/prazos"
                id="link-ver-todos-prazos"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-[#dfcaa0] dark:hover:text-white flex items-center gap-1 transition"
              >
                <span>Ver Todos ({prazos.length})</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.25]" />
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
                  <CheckCircle2 className="h-8 w-8 text-slate-400 dark:text-[#dfcaa0] mx-auto opacity-70 mb-2 stroke-[1.25]" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nenhum prazo pendente para os próximos 7 dias!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sua controladoria jurídica está 100% em dia.
                  </p>
                </div>
              ) : (
                prazosUrgentes.slice(0, 4).map((prazo) => {
                  const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status, prazo.hora);
                  const isHoje = calc.urgencia === 'hoje';
                  const isVencido = calc.urgencia === 'vencido';

                  return (
                    <div
                      key={prazo.id_prazo}
                      onClick={() => router.push('/prazos')}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-[0.75px] border-slate-200/70 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#0d1117]/50 hover:bg-white dark:hover:bg-[#161b22] hover:border-slate-300 dark:hover:border-white/[0.12] transition cursor-pointer gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[0.75px] ${
                            isVencido
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25'
                              : isHoje
                              ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25'
                              : 'bg-slate-100 text-slate-700 dark:bg-white/[0.05] dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]'
                          }`}
                        >
                          <Calendar className="h-4 w-4 stroke-[1.25]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {prazo.descricao}
                            </span>
                            {isHoje && (
                              <span className="rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-[0.75px] border-amber-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                Hoje
                              </span>
                            )}
                            {isVencido && (
                              <span className="rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-[0.75px] border-rose-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                Vencido
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Vencimento: <strong>{calc.dataExibicao}</strong>{prazo.hora ? ` às ${prazo.hora}` : ''}</span>
                            {prazo.processo && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
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
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[0.75px] border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#161b22] px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f2631] transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.25] text-slate-500 dark:text-[#dfcaa0]" />
                          <span>Cumprir</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[0.75px] border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 stroke-[1.25] text-slate-400" />
              <span>Contagem de prazos em dias úteis CPC/CLT</span>
            </span>
            <Link
              href="/prazos"
              className="font-medium text-slate-700 dark:text-[#dfcaa0] hover:underline flex items-center gap-1"
            >
              <span>Central de Prazos</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[1.25]" />
            </Link>
          </div>
        </div>

        {/* Coluna 3: Assistente Jurídico (Conteúdo Simplificado, Sem Slop, Botão Fosco e Discreto) */}
        <div className="legal-glass-card p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[0.75px] border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-[#dfcaa0]">
                  <Sparkles className="h-4 w-4 stroke-[1.25]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Assistente Jurídico
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Análise e redação de peças
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-[0.75px] border-slate-200/80 dark:border-white/[0.08]">
                IA Segura
              </span>
            </div>

            <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Triagem ágil de intimações, geração estruturada de minutas processuais e sínteses executivas com rigor técnico e sigilo profissional.
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059]" />
                <span>Extração de prazos e termos de intimações</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059]" />
                <span>Resumos executivos de decisões para clientes</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[0.75px] border-slate-100 dark:border-white/[0.08]">
            <Link
              href="/gemini"
              id="btn-abrir-assistente-ia"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[0.75px] border-slate-300 dark:border-white/[0.12] bg-slate-100 hover:bg-slate-200/80 dark:bg-[#161b22] dark:hover:bg-[#1f2631] px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-[#dfcaa0] transition active:scale-95 shadow-2xs"
            >
              <Sparkles className="h-4 w-4 stroke-[1.25]" />
              <span>Abrir Assistente Jurídico</span>
            </Link>
          </div>
        </div>
      </div>

        {/* Seção Executiva de Duas Colunas: Aniversariantes do Mês & Indícios Financeiros */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lado Esquerdo: Aniversariantes do Mês (lg:col-span-5) */}
          <div className="lg:col-span-5 legal-glass-card p-6 flex flex-col justify-between">
            <div>
              {/* Header do Card */}
              <div className="flex items-start justify-between pb-4 border-b border-[0.75px] border-slate-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-[#dfcaa0]">
                    <Cake className="h-5 w-5 stroke-[1.25]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
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
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/[0.05] dark:hover:text-[#dfcaa0] transition"
                >
                  <RefreshCw className={`h-4 w-4 stroke-[1.25] ${loading ? 'animate-spin text-slate-400' : ''}`} />
                </button>
              </div>

              {/* Filtros rápidos: Todos, Equipe, Clientes */}
              <div className="mt-4 flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-[#0d1117]/60 rounded-xl border border-[0.75px] border-slate-200/60 dark:border-white/[0.06] text-xs">
                <button
                  type="button"
                  onClick={() => setAniversariantesFilter('TODOS')}
                  className={`flex-1 py-1 px-2 text-center rounded-lg font-medium transition cursor-pointer ${
                    aniversariantesFilter === 'TODOS'
                      ? 'bg-white dark:bg-[#161b22] text-slate-900 dark:text-[#dfcaa0] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Todos ({aniversariantesData?.total || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setAniversariantesFilter('USUARIO')}
                  className={`flex-1 py-1 px-2 text-center rounded-lg font-medium transition cursor-pointer ${
                    aniversariantesFilter === 'USUARIO'
                      ? 'bg-white dark:bg-[#161b22] text-slate-900 dark:text-[#dfcaa0] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Equipe ({aniversariantesData?.totalUsuarios || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setAniversariantesFilter('CLIENTE')}
                  className={`flex-1 py-1 px-2 text-center rounded-lg font-medium transition cursor-pointer ${
                    aniversariantesFilter === 'CLIENTE'
                      ? 'bg-white dark:bg-[#161b22] text-slate-900 dark:text-[#dfcaa0] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Clientes ({aniversariantesData?.totalClientes || 0})
                </button>
              </div>

              {/* Lista Elegante e Minimalista */}
              <div className="mt-4 space-y-2.5">
                {listaAniversariantes.length > 0 ? (
                  listaAniversariantes.map((pessoa) => (
                    <div
                      key={pessoa.id}
                      className="group relative flex items-center justify-between rounded-xl border border-[0.75px] border-slate-200/70 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#0d1117]/50 p-3 transition-all hover:border-slate-300 hover:bg-white dark:hover:border-white/[0.12] dark:hover:bg-[#161b22]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar Circular com Iniciais */}
                        <div className="relative shrink-0">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold border border-[0.75px] ${
                              pessoa.tipo === 'USUARIO'
                                ? 'bg-slate-900 text-[#dfcaa0] border-[#c5a059]/30 dark:bg-[#1f2631] dark:border-white/[0.12]'
                                : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-[#161b22] dark:text-slate-300 dark:border-white/[0.08]'
                            }`}
                          >
                            {pessoa.iniciais}
                          </div>
                          {pessoa.destaque && (
                            <span
                              title="Celebração iminente"
                              className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#c5a059] ring-2 ring-white dark:ring-[#161b22]"
                            />
                          )}
                        </div>

                        {/* Informações da Pessoa */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 dark:text-white dark:group-hover:text-[#dfcaa0] transition-colors truncate">
                              {pessoa.nome}
                            </h3>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider shrink-0 border border-[0.75px] ${
                                pessoa.tipo === 'USUARIO'
                                  ? 'bg-slate-100 text-slate-700 dark:bg-white/[0.05] dark:text-[#dfcaa0] border-slate-200/80 dark:border-white/[0.08]'
                                  : 'bg-slate-100 text-slate-600 dark:bg-white/[0.04] dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]'
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
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[0.75px] border-slate-200/80 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:border-white/[0.08] dark:bg-[#161b22] dark:text-slate-400 dark:hover:border-white/[0.15] dark:hover:text-[#dfcaa0] transition cursor-pointer"
                          >
                            <Mail className="h-3.5 w-3.5 stroke-[1.25]" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-[0.75px] border-slate-200 p-6 text-center dark:border-white/[0.08]">
                    <Cake className="mx-auto h-7 w-7 text-slate-400 stroke-[1.25] mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nenhum aniversariante neste filtro
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Registre datas de nascimento nos módulos de{' '}
                      <Link href="/usuarios" className="text-slate-700 dark:text-[#dfcaa0] underline font-medium">
                        Equipe
                      </Link>{' '}
                      ou{' '}
                      <Link href="/clientes" className="text-slate-700 dark:text-[#dfcaa0] underline font-medium">
                        Clientes
                      </Link>{' '}
                      para exibição automática.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé do Card de Aniversariantes */}
            <div className="mt-6 pt-4 border-t border-[0.75px] border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 stroke-[1.25] text-[#c5a059]" />
                <span>Integração com Colaboradores & Clientes</span>
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/usuarios"
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-[#dfcaa0] transition"
                >
                  Equipe
                </Link>
                <span>•</span>
                <Link
                  href="/clientes"
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-[#dfcaa0] transition"
                >
                  Clientes
                </Link>
              </div>
            </div>
          </div>

          {/* Lado Direito: Gestão Financeira & Indicadores (lg:col-span-7) */}
          <div className="lg:col-span-7 legal-glass-card p-6 flex flex-col justify-between">
            <div>
              {/* Header do Card */}
              <div className="flex items-start justify-between pb-4 border-b border-[0.75px] border-slate-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-[#dfcaa0]">
                    <TrendingUp className="h-5 w-5 stroke-[1.25]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Gestão Financeira
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Fluxo de caixa, honorários previstos e performance operacional
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 dark:bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-[0.75px] border-slate-200/80 dark:border-white/[0.08]">
                    Mês Corrente
                  </span>
                </div>
              </div>

              {/* Grid de 4 Cards de KPI Financeiro */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* KPI 1: Faturamento Previsto */}
                <div className="rounded-xl border border-[0.75px] border-slate-200/70 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#0d1117]/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Honorários Previstos
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-[#dfcaa0]">
                      <TrendingUp className="h-3 w-3 stroke-[1.25]" /> Previsão
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      financeiroData?.metricas.entradasPrevistas ?? 0,
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Realizados: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeiroData?.metricas.entradasRealizadas ?? 0)}
                    </span>
                  </div>
                </div>

                {/* KPI 2: Honorários Liquidados */}
                <div className="rounded-xl border border-[0.75px] border-slate-200/70 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#0d1117]/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Entradas Realizadas
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-[#dfcaa0] border border-[0.75px] border-slate-200/80 dark:border-white/[0.08]">
                      {financeiroData?.metricas.taxaRecebimento ?? 0}%
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      financeiroData?.metricas.entradasRealizadas ?? 0,
                    )}
                  </div>
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#c5a059] transition-all duration-500"
                        style={{ width: `${financeiroData?.metricas.taxaRecebimento ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* KPI 3: Inadimplência / Pendências */}
                <div className="rounded-xl border border-[0.75px] border-slate-200/70 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#0d1117]/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Pendências & Atrasos
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-300">
                      <TrendingDown className="h-3 w-3 stroke-[1.25]" /> Cobrança
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white tracking-tight text-rose-600 dark:text-rose-300">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      financeiroData?.metricas.pendenciasAtrasadas ?? 0,
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {financeiroData?.metricas.qtdAtrasadas ?? 0} lançamentos pendentes
                  </p>
                </div>

                {/* KPI 4: Saldo Operacional Líquido */}
                <div className="rounded-xl border border-[0.75px] border-slate-200/70 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#0d1117]/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Saldo Líquido em Caixa
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-[#dfcaa0]">
                      Consolidado
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white tracking-tight text-slate-900 dark:text-[#dfcaa0]">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      financeiroData?.metricas.saldoLiquido ?? 0,
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    Entradas pagas menos despesas pagas
                  </p>
                </div>
              </div>

              {/* Bloco de Composição de Receita */}
              <div className="mt-4 rounded-xl border border-[0.75px] border-slate-200/70 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#0d1117]/40 p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Composição de Honorários</span>
                  <span className="text-[11px] font-normal text-slate-500">Distribuição mensal</span>
                </div>
                {/* Barra Segmentada Calculada Dinamicamente */}
                {(() => {
                  const totalRec = financeiroData?.metricas.entradasPrevistas || 0;
                  const catRec = financeiroData?.categorias.receitas || {};
                  const pctContratual = totalRec > 0 ? Math.round(((catRec['HONORARIO_CONTRATUAL'] || 0) / totalRec) * 100) : 0;
                  const pctExito = totalRec > 0 ? Math.round(((catRec['HONORARIO_EXITO'] || 0) / totalRec) * 100) : 0;
                  const pctConsultivo = totalRec > 0 ? Math.round(((catRec['CONSULTIVO'] || 0) / totalRec) * 100) : 0;

                  return (
                    <>
                      <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.08]">
                        {totalRec > 0 ? (
                          <>
                            {pctContratual > 0 && (
                              <div className="h-full bg-[#c5a059]" style={{ width: `${pctContratual}%` }} title={`Contratual: ${pctContratual}%`} />
                            )}
                            {pctExito > 0 && (
                              <div className="h-full bg-slate-500" style={{ width: `${pctExito}%` }} title={`Êxito: ${pctExito}%`} />
                            )}
                            {pctConsultivo > 0 && (
                              <div className="h-full bg-slate-700 dark:bg-slate-400" style={{ width: `${pctConsultivo}%` }} title={`Consultivo: ${pctConsultivo}%`} />
                            )}
                          </>
                        ) : (
                          <div className="h-full w-full bg-slate-200 dark:bg-white/[0.08]" />
                        )}
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#c5a059]" />
                          <span>Contratual ({pctContratual}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-slate-500" />
                          <span>Êxito ({pctExito}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-slate-700 dark:bg-slate-400" />
                          <span>Consultivo ({pctConsultivo}%)</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Rodapé do Card Financeiro */}
            <div className="mt-6 pt-4 border-t border-[0.75px] border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 stroke-[1.25] text-slate-400 dark:text-[#dfcaa0]" />
                <span>Conciliação bancária sincronizada</span>
              </span>
              <Link
                href="/financeiro"
                id="link-financeiro-demonstrativo"
                className="font-semibold text-slate-700 dark:text-[#dfcaa0] hover:underline flex items-center gap-1 transition-colors"
              >
                Demonstrativo completo <ArrowUpRight className="h-3.5 w-3.5 stroke-[1.25]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Rodapé Institucional Completo */}
        <InstitutionalFooter />
      </div>
    );
  }
