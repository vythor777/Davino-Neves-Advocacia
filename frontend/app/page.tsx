'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { MetricCardSkeleton } from '@/components/Skeleton';
import { processoService, Processo } from '@/services/processoService';
import { prazoService, Prazo } from '@/services/prazoService';
import { clienteService, Cliente } from '@/services/clienteService';
import { calcularStatusPrazo, formatPrazoDateBR } from '@/utils/dateUtils';
import {
  aniversarianteService,
  AniversariantesResponse,
} from '@/services/aniversarianteService';
import {
  financeiroService,
  ResumoFinanceiroResponse,
} from '@/services/financeiroService';
import { usuarioService, UsuarioItem } from '@/services/usuarioService';
import {
  Users,
  Briefcase,
  CalendarClock,
  Search,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  RefreshCw,
  ChevronRight,
  Calendar,
  Cake,
  TrendingUp,
  Mail,
  CheckSquare,
  Scale,
  FileText,
  DollarSign,
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

  const [loading, setLoading] = useState(true);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [aniversariantesData, setAniversariantesData] = useState<AniversariantesResponse | null>(null);
  const [aniversariantesFilter, setAniversariantesFilter] = useState<'TODOS' | 'USUARIO' | 'CLIENTE'>('TODOS');
  const [financeiroData, setFinanceiroData] = useState<ResumoFinanceiroResponse | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [procRes, prazRes, cliRes, anivRes, finRes, usuRes] = await Promise.allSettled([
        processoService.getAll(),
        prazoService.getAll(),
        clienteService.getAll(),
        aniversarianteService.getAniversariantesDoMes(),
        financeiroService.getResumo(),
        usuarioService.getAll(),
      ]);

      if (procRes.status === 'fulfilled') setProcessos(procRes.value || []);
      if (prazRes.status === 'fulfilled') setPrazos(prazRes.value || []);
      if (cliRes.status === 'fulfilled') setClientes(cliRes.value || []);
      if (anivRes.status === 'fulfilled') setAniversariantesData(anivRes.value);
      if (finRes.status === 'fulfilled') setFinanceiroData(finRes.value);
      if (usuRes.status === 'fulfilled') setUsuarios(usuRes.value || []);
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

  // Processos recentes (ordenados por ID ou data_abertura decrescente)
  const processosRecentes = [...processos]
    .sort((a, b) => b.id_processo - a.id_processo)
    .slice(0, 5);

  const handleCumprirPrazoRapido = async (idPrazo: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await prazoService.update(idPrazo, { status: 'Cumprido' });
      toast.success('Prazo marcado como cumprido com sucesso!');
      loadData();
    } catch {
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-fade-in-up">
      {/* Header Limpo com Pergunta Central "Como está meu escritório hoje?" */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 pb-2 border-b border-slate-200/60 dark:border-white/[0.05]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Painel Executivo
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Visão consolidada do escritório: processos ativos, prazos críticos e desempenho financeiro.
          </p>
        </div>

        {/* Ações Rápidas de Topo */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/processos"
            id="btn-novo-processo-hero"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-2 text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2]" />
            <span>Novo Processo</span>
          </Link>
          <Link
            href="/prazos"
            id="btn-novo-prazo-hero"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            <Clock className="h-3.5 w-3.5 stroke-[1.5] text-slate-400" />
            <span>Novo Prazo</span>
          </Link>
          <Link
            href="/datajud"
            id="btn-consultar-datajud-hero"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 stroke-[1.5] text-slate-400" />
            <span>DataJud CNJ</span>
          </Link>
          <button
            onClick={loadData}
            title="Recarregar dados"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] px-3 py-2 text-xs text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#c5a059]' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* 1. TOP SUMMARY METRICS (5 Indicadores-Chave):
          Processos ativos | Prazos próximos | Clientes | Tarefas pendentes | Honorários */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Resumo do Escritório Hoje
          </h2>
          <span className="text-xs text-slate-400">
            Atualizado em tempo real
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* KPI 1: Processos Ativos */}
            <Link
              href="/processos"
              id="kpi-card-processos"
              className="group legal-card p-4 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Processos Ativos
                  </span>
                  <div className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {processosAtivos}
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-[#dfcaa0]">
                  <Briefcase className="h-4 w-4 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Total: {totalProcessos}</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-medium group-hover:underline flex items-center gap-0.5">
                  Ver <ChevronRight className="h-3 w-3 stroke-[1.5]" />
                </span>
              </div>
            </Link>

            {/* KPI 2: Prazos Próximos */}
            <Link
              href="/prazos"
              id="kpi-card-prazos"
              className="group legal-card p-4 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Prazos Próximos
                  </span>
                  <div className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums flex items-center gap-1.5">
                    <span>{prazosUrgentes.length}</span>
                    {prazosHoje.length > 0 && (
                      <span className="inline-flex items-center text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50">
                        {prazosHoje.length} hoje
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-[#dfcaa0]">
                  <CalendarClock className="h-4 w-4 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Próximos 7 dias</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-medium group-hover:underline flex items-center gap-0.5">
                  Ver <ChevronRight className="h-3 w-3 stroke-[1.5]" />
                </span>
              </div>
            </Link>

            {/* KPI 3: Clientes */}
            <Link
              href="/clientes"
              id="kpi-card-clientes"
              className="group legal-card p-4 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Clientes
                  </span>
                  <div className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {totalClientes}
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-[#dfcaa0]">
                  <Users className="h-4 w-4 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{clientesPf} PF • {clientesPj} PJ</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-medium group-hover:underline flex items-center gap-0.5">
                  Ver <ChevronRight className="h-3 w-3 stroke-[1.5]" />
                </span>
              </div>
            </Link>

            {/* KPI 4: Tarefas Pendentes */}
            <Link
              href="/prazos"
              id="kpi-card-tarefas"
              className="group legal-card p-4 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Tarefas Pendentes
                  </span>
                  <div className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {prazosPendentes.length}
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-[#dfcaa0]">
                  <CheckSquare className="h-4 w-4 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{taxaCumprimento}% cumpridas</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-medium group-hover:underline flex items-center gap-0.5">
                  Ver <ChevronRight className="h-3 w-3 stroke-[1.5]" />
                </span>
              </div>
            </Link>

            {/* KPI 5: Honorários */}
            <Link
              href="/financeiro"
              id="kpi-card-honorarios"
              className="group legal-card p-4 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors col-span-2 sm:col-span-1"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Honorários (Mês)
                  </span>
                  <div className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(
                      financeiroData?.metricas.entradasPrevistas ?? 0,
                    )}
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-[#dfcaa0]">
                  <TrendingUp className="h-4 w-4 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{financeiroData?.metricas.taxaRecebimento ?? 0}% recebido</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-medium group-hover:underline flex items-center gap-0.5">
                  Ver <ChevronRight className="h-3 w-3 stroke-[1.5]" />
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* 2. SEÇÃO: Agenda / Prazos Críticos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Coluna 1 & 2: Agenda & Prazos Críticos */}
        <div className="lg:col-span-2 legal-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 stroke-[1.5] text-[#c5a059]" />
                  Agenda & Prazos Críticos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Termos processuais ordenados por urgência e vencimento imediato
                </p>
              </div>
              <Link
                href="/prazos"
                id="link-ver-todos-prazos"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-[#dfcaa0] dark:hover:text-white flex items-center gap-1 transition"
              >
                <span>Ver agenda completa ({prazos.length})</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.25]" />
              </Link>
            </div>

            {/* Lista de Prazos Críticos */}
            <div className="mt-4 space-y-2">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Carregando agenda de prazos...
                </div>
              ) : prazosUrgentes.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500/80 mx-auto mb-2 stroke-[1.25]" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nenhum prazo pendente para os próximos dias
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Todos os termos processuais estão rigorosamente em dia.
                  </p>
                </div>
              ) : (
                prazosUrgentes.slice(0, 5).map((prazo) => {
                  const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status, prazo.hora);
                  const isHoje = calc.urgencia === 'hoje';
                  const isVencido = calc.urgencia === 'vencido';

                  return (
                    <div
                      key={prazo.id_prazo}
                      onClick={() => router.push('/prazos')}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.05] transition cursor-pointer gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`mt-0.5 flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                            isVencido
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                              : isHoje
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300'
                          }`}
                        >
                          <Calendar className="h-3.5 w-3.5 stroke-[1.25]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                              {prazo.descricao}
                            </span>
                            {isHoje && (
                              <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider shrink-0">
                                Hoje
                              </span>
                            )}
                            {isVencido && (
                              <span className="rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider shrink-0">
                                Vencido
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 truncate">
                            <span>Vencimento: {calc.dataExibicao}{prazo.hora ? ` às ${prazo.hora}` : ''}</span>
                            {prazo.processo && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-slate-500">
                                  {prazo.processo.numero_processo}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleCumprirPrazoRapido(prazo.id_prazo, e)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3 stroke-[1.5] text-slate-400" />
                          <span>Cumprir</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
            <span>Contagem em dias úteis CPC/CLT</span>
            <Link
              href="/prazos"
              className="text-slate-700 dark:text-[#dfcaa0] hover:underline flex items-center gap-1 font-medium"
            >
              Central de Prazos <ArrowRight className="h-3 w-3 stroke-[1.5]" />
            </Link>
          </div>
        </div>

        {/* Coluna 3: Assistente Jurídico & Suporte de Produtividade */}
        <div className="legal-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 stroke-[1.25] text-[#c5a059]" />
                  Assistente Jurídico
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Análise e redação de peças processuais
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Triagem de intimações, minutas de petições e sínteses com segurança e rigor técnico.
            </p>

            <div className="mt-4 space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059] shrink-0" />
                <span>Identificação de prazos em publicações</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059] shrink-0" />
                <span>Estruturação de teses e jurisprudência</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059] shrink-0" />
                <span>Resumos executivos de autos volumosos</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
            <Link
              href="/gemini"
              id="btn-abrir-assistente-ia"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] px-4 py-2 text-xs font-semibold text-slate-800 dark:text-[#dfcaa0] transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 stroke-[1.25]" />
              <span>Abrir Assistente</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO: Processos Recentes */}
      <div className="legal-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-4 w-4 stroke-[1.5] text-[#c5a059]" />
              Processos Recentes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Últimas ações judiciais cadastradas e em acompanhamento
            </p>
          </div>
          <Link
            href="/processos"
            id="link-ver-todos-processos"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-[#dfcaa0] dark:hover:text-white flex items-center gap-1 transition"
          >
            <span>Ver processos ({processos.length})</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[1.25]" />
          </Link>
        </div>

        {/* Lista/Tabela de Processos Recentes */}
        <div className="mt-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Carregando processos recentes...
            </div>
          ) : processosRecentes.length === 0 ? (
            <div className="py-8 text-center">
              <Briefcase className="h-7 w-7 text-slate-400 mx-auto mb-2 stroke-[1.25]" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Nenhum processo cadastrado ainda
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cadastre sua primeira ação judicial para acompanhar os autos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.04] text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-medium">Processo</th>
                    <th className="py-2.5 font-medium hidden sm:table-cell">Ação / Título</th>
                    <th className="py-2.5 font-medium">Cliente</th>
                    <th className="py-2.5 font-medium">Status</th>
                    <th className="py-2.5 font-medium text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                  {processosRecentes.map((proc) => (
                    <tr
                      key={proc.id_processo}
                      onClick={() => router.push('/processos')}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition cursor-pointer"
                    >
                      <td className="py-3 pr-3 font-mono font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px] sm:max-w-none">
                            {proc.numero_processo}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 hidden sm:table-cell max-w-xs truncate">
                        {proc.titulo}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                        {proc.cliente?.nome || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            proc.status === 'Ativo' || proc.status === 'Em Andamento'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : proc.status === 'Aguardando Sentença' || proc.status === 'Fase Recursal'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {proc.status}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right text-slate-400 whitespace-nowrap">
                        {proc.data_abertura ? formatPrazoDateBR(proc.data_abertura) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. SEÇÃO: Desempenho Financeiro */}
      <div className="legal-card p-6">
        {/* Header do Card */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 stroke-[1.5] text-[#c5a059]" />
              Desempenho Financeiro
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fluxo de honorários, previsão de recebimentos e saúde orçamentária do escritório
            </p>
          </div>
          <Link
            href="/financeiro"
            id="link-financeiro-demonstrativo-top"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-[#dfcaa0] dark:hover:text-white flex items-center gap-1 transition"
          >
            <span>Demonstrativo completo</span>
            <ArrowUpRight className="h-3.5 w-3.5 stroke-[1.25]" />
          </Link>
        </div>

        {/* Grid de 4 Cards de KPI Financeiro */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* KPI 1: Faturamento Previsto */}
          <div className="rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Honorários Previstos
            </span>
            <div className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                financeiroData?.metricas.entradasPrevistas ?? 0,
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Realizados: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeiroData?.metricas.entradasRealizadas ?? 0)}
            </p>
          </div>

          {/* KPI 2: Honorários Liquidados */}
          <div className="rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Entradas Realizadas
              </span>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-[#dfcaa0]">
                {financeiroData?.metricas.taxaRecebimento ?? 0}%
              </span>
            </div>
            <div className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                financeiroData?.metricas.entradasRealizadas ?? 0,
              )}
            </div>
            <div className="mt-2.5">
              <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#c5a059]"
                  style={{ width: `${financeiroData?.metricas.taxaRecebimento ?? 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* KPI 3: Inadimplência / Pendências */}
          <div className="rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Pendências & Atrasos
            </span>
            <div className="mt-1.5 text-xl font-semibold tracking-tight text-rose-600 dark:text-rose-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                financeiroData?.metricas.pendenciasAtrasadas ?? 0,
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {financeiroData?.metricas.qtdAtrasadas ?? 0} lançamentos pendentes
            </p>
          </div>

          {/* KPI 4: Saldo Operacional Líquido */}
          <div className="rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Saldo Líquido
            </span>
            <div className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-[#dfcaa0]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                financeiroData?.metricas.saldoLiquido ?? 0,
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Entradas pagas menos despesas
            </p>
          </div>
        </div>

        {/* Bloco de Composição de Receita */}
        <div className="mt-4 rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-2.5">
            <span>Composição de Honorários por Modalidade</span>
            <span className="text-[11px] text-slate-400">Base: Faturamento Previsto</span>
          </div>
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
                        <div className="h-full bg-[#c5a059]" style={{ width: `${pctContratual}%` }} />
                      )}
                      {pctExito > 0 && (
                        <div className="h-full bg-slate-500" style={{ width: `${pctExito}%` }} />
                      )}
                      {pctConsultivo > 0 && (
                        <div className="h-full bg-slate-700 dark:bg-slate-400" style={{ width: `${pctConsultivo}%` }} />
                      )}
                    </>
                  ) : (
                    <div className="h-full w-full bg-slate-200 dark:bg-white/[0.08]" />
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#c5a059]" />
                    Honorário Contratual ({pctContratual}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    Honorário de Êxito ({pctExito}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-700 dark:bg-slate-400" />
                    Consultoria Jurídica ({pctConsultivo}%)
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 5. SEÇÃO: Atividades da equipe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel da Equipe & Distribuição de Carga (lg:col-span-7) */}
        <div className="lg:col-span-7 legal-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 stroke-[1.5] text-[#c5a059]" />
                  Atividades da Equipe
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Carga operacional, distribuição de prazos e produtividade dos colaboradores
                </p>
              </div>

              <Link
                href="/usuarios"
                id="link-gerenciar-equipe"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-[#dfcaa0] dark:hover:text-white flex items-center gap-1 transition"
              >
                <span>Ver equipe ({usuarios.length})</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.25]" />
              </Link>
            </div>

            {/* Lista de Colaboradores e Carga de Trabalho */}
            <div className="mt-4 space-y-2.5">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Carregando atividades da equipe...
                </div>
              ) : usuarios.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="h-7 w-7 text-slate-400 mx-auto mb-2 stroke-[1.25]" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nenhum membro de equipe cadastrado
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cadastre advogados e assistentes no módulo de Usuários.
                  </p>
                </div>
              ) : (
                usuarios.map((user) => {
                  // Calcular prazos atribuídos a este usuário (por nome do responsável)
                  const prazosUsuario = prazos.filter((p) => {
                    const respNome = p.responsavel?.toLowerCase() || '';
                    const userNome = user.nome.toLowerCase();
                    const primeiroNome = userNome.split(' ')[0];
                    return respNome === userNome || (primeiroNome.length > 2 && respNome.includes(primeiroNome));
                  });

                  const pendentesUser = prazosUsuario.filter((p) => p.status?.toLowerCase() !== 'cumprido').length;
                  const cumpridosUser = prazosUsuario.filter((p) => p.status?.toLowerCase() === 'cumprido').length;
                  const totalUser = prazosUsuario.length;
                  const taxaUser = totalUser > 0 ? Math.round((cumpridosUser / totalUser) * 100) : 100;

                  const getIniciais = (nome: string) => {
                    const partes = (nome || '').trim().split(' ').filter(Boolean);
                    if (partes.length === 0) return 'U';
                    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
                    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
                  };

                  const getRoleLabel = (role: string) => {
                    switch (role?.toUpperCase()) {
                      case 'ADMIN':
                        return 'Sócio / Administrador';
                      case 'ADVOGADO':
                        return 'Advogado Associado';
                      case 'ASSISTENTE':
                        return 'Assistente Jurídico';
                      default:
                        return 'Colaborador';
                    }
                  };

                  return (
                    <div
                      key={user.id_usuario}
                      onClick={() => router.push('/usuarios')}
                      className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/80 dark:bg-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                          {getIniciais(user.nome)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                              {user.nome}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300">
                              {getRoleLabel(user.role)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 ml-3 text-right">
                        <div>
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            {pendentesUser} {pendentesUser === 1 ? 'pendência' : 'pendências'}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {totalUser} prazos no total
                          </span>
                        </div>

                        <div className="hidden sm:block w-16">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span>{taxaUser}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#0047ab] dark:bg-[#c5a059]"
                              style={{ width: `${taxaUser}%` }}
                            />
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
            <span>{usuarios.filter((u) => u.ativo).length} colaboradores ativos</span>
            <Link href="/usuarios" className="hover:text-slate-700 dark:hover:text-slate-200">
              Escala de trabalho & permissões &rarr;
            </Link>
          </div>
        </div>

        {/* Painel de Aniversariantes e Celebrações da Equipe/Clientes (lg:col-span-5) */}
        <div className="lg:col-span-5 legal-card p-6 flex flex-col justify-between">
          <div>
            {/* Header do Card */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cake className="h-4 w-4 stroke-[1.25] text-[#c5a059]" />
                  Aniversariantes do Mês
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {aniversariantesData?.nomeMes || 'Mês Atual'} • {aniversariantesData?.total || 0} celebrações
                </p>
              </div>
            </div>

            {/* Filtros rápidos: Todos, Equipe, Clientes */}
            <div className="mt-4 flex items-center gap-1 p-1 bg-slate-100/70 dark:bg-white/[0.03] rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setAniversariantesFilter('TODOS')}
                className={`flex-1 py-1 px-2 text-center rounded-md font-medium transition cursor-pointer ${
                  aniversariantesFilter === 'TODOS'
                    ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                Todos ({aniversariantesData?.total || 0})
              </button>
              <button
                type="button"
                onClick={() => setAniversariantesFilter('USUARIO')}
                className={`flex-1 py-1 px-2 text-center rounded-md font-medium transition cursor-pointer ${
                  aniversariantesFilter === 'USUARIO'
                    ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                Equipe ({aniversariantesData?.totalUsuarios || 0})
              </button>
              <button
                type="button"
                onClick={() => setAniversariantesFilter('CLIENTE')}
                className={`flex-1 py-1 px-2 text-center rounded-md font-medium transition cursor-pointer ${
                  aniversariantesFilter === 'CLIENTE'
                    ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                Clientes ({aniversariantesData?.totalClientes || 0})
              </button>
            </div>

            {/* Lista de Aniversariantes */}
            <div className="mt-4 space-y-2">
              {listaAniversariantes.length > 0 ? (
                listaAniversariantes.slice(0, 4).map((pessoa) => (
                  <div
                    key={pessoa.id}
                    className="group flex items-center justify-between rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-2.5 transition hover:bg-slate-100/60 dark:hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/80 dark:bg-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                        {pessoa.iniciais}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                            {pessoa.nome}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({pessoa.tipo === 'USUARIO' ? 'Equipe' : 'Cliente'})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {pessoa.subtitulo}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="text-right">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {pessoa.diaFormatado} {aniversariantesData?.nomeMes?.slice(0, 3)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {pessoa.diasRestantesTexto}
                        </span>
                      </div>

                      {pessoa.email && (
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(pessoa.email!, pessoa.nome)}
                          title={`Copiar e-mail de ${pessoa.nome}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.08] transition cursor-pointer"
                        >
                          <Mail className="h-3.5 w-3.5 stroke-[1.25]" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 dark:border-white/[0.08] p-6 text-center">
                  <Cake className="mx-auto h-6 w-6 text-slate-400 stroke-[1.25] mb-2" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nenhum aniversariante neste filtro
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Cadastre datas nos módulos de Equipe ou Clientes.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rodapé do Card de Aniversariantes */}
          <div className="mt-6 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
            <span>Integração de Contatos</span>
            <div className="flex items-center gap-2">
              <Link href="/usuarios" className="hover:text-slate-700 dark:hover:text-slate-200">
                Equipe
              </Link>
              <span>•</span>
              <Link href="/clientes" className="hover:text-slate-700 dark:hover:text-slate-200">
                Clientes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé Institucional Completo */}
      <InstitutionalFooter />
    </div>
  );
}

