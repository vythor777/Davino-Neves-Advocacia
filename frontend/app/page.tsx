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
import { calcularStatusPrazo } from '@/utils/dateUtils';
import {
  aniversarianteService,
  AniversariantesResponse,
} from '@/services/aniversarianteService';
import {
  financeiroService,
  ResumoFinanceiroResponse,
} from '@/services/financeiroService';
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
      {/* Header Limpo e Moderno */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 pb-2 border-b border-slate-200/60 dark:border-white/[0.05]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Painel Executivo
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Visão centralizada de processos, prazos e finanças do escritório em tempo real.
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
        </div>
      </div>

      {/* Indicadores (KPI Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Visão Geral
          </h2>
          <button
            onClick={loadData}
            title="Recarregar indicadores"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-[#c5a059]' : ''}`} />
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
              className="group legal-card p-5 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Processos Ativos
                  </span>
                  <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {processosAtivos}
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-[#dfcaa0]">
                  <Briefcase className="h-4.5 w-4.5 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Total: {totalProcessos}</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-medium group-hover:underline flex items-center gap-0.5">
                  Ver <ChevronRight className="h-3 w-3 stroke-[1.5]" />
                </span>
              </div>
            </Link>

            {/* Card 2: Prazos Fatais / Hoje */}
            <Link
              href="/prazos"
              id="kpi-card-prazos"
              className="group legal-card p-5 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Prazos Próximos
                  </span>
                  <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums flex items-center gap-2">
                    <span>{prazosUrgentes.length}</span>
                    {prazosHoje.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50">
                        {prazosHoje.length} hoje
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-[#dfcaa0]">
                  <CalendarClock className="h-4.5 w-4.5 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{prazosCumpridos} cumpridos</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-medium group-hover:underline flex items-center gap-0.5">
                  Ver <ChevronRight className="h-3 w-3 stroke-[1.5]" />
                </span>
              </div>
            </Link>

            {/* Card 3: Clientes */}
            <Link
              href="/clientes"
              id="kpi-card-clientes"
              className="group legal-card p-5 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Clientes
                  </span>
                  <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {totalClientes}
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-[#dfcaa0]">
                  <Users className="h-4.5 w-4.5 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{clientesPf} PF • {clientesPj} PJ</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-medium group-hover:underline flex items-center gap-0.5">
                  Ver <ChevronRight className="h-3 w-3 stroke-[1.5]" />
                </span>
              </div>
            </Link>

            {/* Card 4: Taxa de Cumprimento de Prazos */}
            <Link
              href="/prazos"
              id="kpi-card-taxa"
              className="group legal-card p-5 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Eficiência em Prazos
                  </span>
                  <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {taxaCumprimento}%
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-[#dfcaa0]">
                  <CheckCircle2 className="h-4.5 w-4.5 stroke-[1.25]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{prazosCumpridos} de {totalPrazos} prazos</span>
                <span className="text-slate-700 dark:text-[#dfcaa0] font-medium group-hover:underline flex items-center gap-0.5">
                  Ver <ChevronRight className="h-3 w-3 stroke-[1.5]" />
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Seção Central: Prazos Críticos do Dia & Assistente IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Coluna 1 & 2: Prazos Imediatos e Agenda */}
        <div className="lg:col-span-2 legal-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Prazos Imediatos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Termos processuais com vencimento próximo
                </p>
              </div>
              <Link
                href="/prazos"
                id="link-ver-todos-prazos"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-[#dfcaa0] dark:hover:text-white flex items-center gap-1 transition"
              >
                <span>Ver todos ({prazos.length})</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.25]" />
              </Link>
            </div>

            {/* Lista de Prazos */}
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
                    Todos os termos processuais estão em dia.
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

        {/* Coluna 3: Assistente Jurídico */}
        <div className="legal-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Assistente Jurídico
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Análise e redação de peças processuais
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-[#dfcaa0]">
                <Sparkles className="h-4 w-4 stroke-[1.25]" />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Triagem de intimações, minutas de petições e sínteses processuais com sigilo e precisão técnica.
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059] shrink-0" />
                <span>Identificação de prazos em publicações</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059] shrink-0" />
                <span>Estruturação de teses e jurisprudência</span>
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

      {/* Seção Executiva de Duas Colunas: Aniversariantes do Mês & Gestão Financeira */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo: Aniversariantes do Mês (lg:col-span-5) */}
        <div className="lg:col-span-5 legal-card p-6 flex flex-col justify-between">
          <div>
            {/* Header do Card */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Aniversariantes do Mês
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {aniversariantesData?.nomeMes || 'Mês Atual'} • {aniversariantesData?.total || 0} aniversários
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-[#dfcaa0]">
                <Cake className="h-4 w-4 stroke-[1.25]" />
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

            {/* Lista Elegante e Minimalista */}
            <div className="mt-4 space-y-2">
              {listaAniversariantes.length > 0 ? (
                listaAniversariantes.map((pessoa) => (
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

        {/* Lado Direito: Gestão Financeira & Indicadores (lg:col-span-7) */}
        <div className="lg:col-span-7 legal-card p-6 flex flex-col justify-between">
          <div>
            {/* Header do Card */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Gestão Financeira
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fluxo de caixa e honorários do mês
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.04] text-[#dfcaa0]">
                <TrendingUp className="h-4 w-4 stroke-[1.25]" />
              </div>
            </div>

            {/* Grid de 4 Cards de KPI Financeiro */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* KPI 1: Faturamento Previsto */}
              <div className="rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Honorários Previstos
                </span>
                <div className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    financeiroData?.metricas.entradasPrevistas ?? 0,
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Realizados: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeiroData?.metricas.entradasRealizadas ?? 0)}
                </p>
              </div>

              {/* KPI 2: Honorários Liquidados */}
              <div className="rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Entradas Realizadas
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-[#dfcaa0]">
                    {financeiroData?.metricas.taxaRecebimento ?? 0}%
                  </span>
                </div>
                <div className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    financeiroData?.metricas.entradasRealizadas ?? 0,
                  )}
                </div>
                <div className="mt-2">
                  <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#c5a059]"
                      style={{ width: `${financeiroData?.metricas.taxaRecebimento ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* KPI 3: Inadimplência / Pendências */}
              <div className="rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Pendências & Atrasos
                </span>
                <div className="mt-1.5 text-lg font-semibold tracking-tight text-rose-600 dark:text-rose-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    financeiroData?.metricas.pendenciasAtrasadas ?? 0,
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {financeiroData?.metricas.qtdAtrasadas ?? 0} lançamentos pendentes
                </p>
              </div>

              {/* KPI 4: Saldo Operacional Líquido */}
              <div className="rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Saldo Líquido
                </span>
                <div className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 dark:text-[#dfcaa0]">
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
            <div className="mt-3 rounded-lg border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] p-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                <span>Composição de Honorários</span>
              </div>
              {(() => {
                const totalRec = financeiroData?.metricas.entradasPrevistas || 0;
                const catRec = financeiroData?.categorias.receitas || {};
                const pctContratual = totalRec > 0 ? Math.round(((catRec['HONORARIO_CONTRATUAL'] || 0) / totalRec) * 100) : 0;
                const pctExito = totalRec > 0 ? Math.round(((catRec['HONORARIO_EXITO'] || 0) / totalRec) * 100) : 0;
                const pctConsultivo = totalRec > 0 ? Math.round(((catRec['CONSULTIVO'] || 0) / totalRec) * 100) : 0;

                return (
                  <>
                    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.08]">
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
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059]" />
                        Contratual ({pctContratual}%)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        Êxito ({pctExito}%)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-700 dark:bg-slate-400" />
                        Consultivo ({pctConsultivo}%)
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Rodapé do Card Financeiro */}
          <div className="mt-6 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
            <span>Fluxo de Caixa</span>
            <Link
              href="/financeiro"
              id="link-financeiro-demonstrativo"
              className="text-slate-700 dark:text-[#dfcaa0] font-medium hover:underline flex items-center gap-1 transition"
            >
              Demonstrativo completo <ArrowUpRight className="h-3 w-3 stroke-[1.5]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Rodapé Institucional Completo */}
      <InstitutionalFooter />
    </div>
  );
}
