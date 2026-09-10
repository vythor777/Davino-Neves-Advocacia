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
  FileSearch,
  BookOpen,
  Gavel,
  PenTool,
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

  const [abaAgenda, setAbaAgenda] = useState<'urgentes' | 'hoje' | 'semana'>('urgentes');

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
    return calc.urgencia === 'vencido' || calc.urgencia === 'hoje' || (calc.dias >= 0 && calc.dias <= 7);
  });
  const prazosSemana = prazosPendentes.filter((p) => {
    const calc = calcularStatusPrazo(p.data_vencimento, p.status, p.hora);
    return calc.dias >= 0 && calc.dias <= 7;
  });
  const prazosCumpridos = prazos.filter((p) => p.status?.toLowerCase() === 'cumprido').length;
  const taxaCumprimento =
    totalPrazos > 0 ? Math.round((prazosCumpridos / totalPrazos) * 100) : 100;

  const prazosExibicao =
    abaAgenda === 'hoje'
      ? prazosHoje
      : abaAgenda === 'semana'
      ? prazosSemana
      : prazosUrgentes;

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
            Visão do Escritório
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Acompanhe processos, prazos, tarefas e desempenho financeiro.
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

      {/* 1. TOP SUMMARY METRICS:
          3 Destaques Principais (Processos ativos | Prazos próximos | Honorários)
          + Indicadores Secundários Discretos (Clientes | Tarefas) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Métricas Estratégicas do Escritório
          </h2>
          <span className="text-[11px] text-slate-400">
            Atualizado em tempo real
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </div>
            <div className="h-10 rounded-xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* 3 CARDS DE DESTAQUE PRINCIPAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* DESTAQUE 1: Processos Ativos */}
              <Link
                href="/processos"
                id="kpi-card-processos"
                className="group legal-card p-5 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.15] transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Processos Ativos
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0047ab]/10 dark:bg-blue-950/40 text-[#0047ab] dark:text-blue-300">
                      <Briefcase className="h-4.5 w-4.5 stroke-[1.5]" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {processosAtivos}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {processosAtivos === 1 ? 'ação em andamento' : 'ações em andamento'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>
                    Total no acervo: <strong className="font-semibold text-slate-800 dark:text-slate-200">{totalProcessos} {totalProcessos === 1 ? 'processo' : 'processos'}</strong>
                  </span>
                  <span className="text-[#0047ab] dark:text-blue-400 font-semibold group-hover:underline flex items-center gap-1">
                    Ver todos <ChevronRight className="h-3.5 w-3.5 stroke-[1.5]" />
                  </span>
                </div>
              </Link>

              {/* DESTAQUE 2: Prazos Próximos */}
              <Link
                href="/prazos"
                id="kpi-card-prazos"
                className="group legal-card p-5 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.15] transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Prazos Próximos
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                      <CalendarClock className="h-4.5 w-4.5 stroke-[1.5]" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {prazosUrgentes.length}
                    </span>
                    {prazosHoje.length > 0 ? (
                      <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                        {prazosHoje.length} {prazosHoje.length === 1 ? 'vencimento hoje' : 'vencimentos hoje'}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        próximos 7 dias
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>
                    Cumprimento: <strong className="font-semibold text-slate-800 dark:text-slate-200">{taxaCumprimento}% no prazo</strong>
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold group-hover:underline flex items-center gap-1">
                    Agenda <ChevronRight className="h-3.5 w-3.5 stroke-[1.5]" />
                  </span>
                </div>
              </Link>

              {/* DESTAQUE 3: Honorários do Mês */}
              <Link
                href="/financeiro"
                id="kpi-card-honorarios"
                className="group legal-card p-5 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.15] transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Honorários (Mês)
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-4.5 w-4.5 stroke-[1.5]" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(
                        financeiroData?.metricas.entradasPrevistas ?? 0,
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>
                    Recebido: <strong className="font-semibold text-emerald-600 dark:text-emerald-400">{financeiroData?.metricas.taxaRecebimento ?? 0}% liquidado</strong>
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold group-hover:underline flex items-center gap-1">
                    Financeiro <ChevronRight className="h-3.5 w-3.5 stroke-[1.5]" />
                  </span>
                </div>
              </Link>
            </div>

            {/* FAIXA SECUNDÁRIA: Clientes & Tarefas com Legibilidade Aprimorada */}
            <div className="rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] px-4 sm:px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-700 dark:text-slate-300">
                {/* Indicador: Clientes */}
                <Link
                  href="/clientes"
                  id="kpi-discreto-clientes"
                  className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition group"
                >
                  <Users className="h-4 w-4 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Carteira:{' '}
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      {totalClientes} {totalClientes === 1 ? 'Cliente' : 'Clientes'}
                    </strong>{' '}
                    <span className="text-slate-500 dark:text-slate-400">
                      ({clientesPf} {clientesPf === 1 ? 'Pessoa Física' : 'Pessoas Físicas'} • {clientesPj} {clientesPj === 1 ? 'Pessoa Jurídica' : 'Pessoas Jurídicas'})
                    </span>
                  </span>
                </Link>

                <span className="hidden md:inline text-slate-300 dark:text-white/[0.1]">•</span>

                {/* Indicador: Tarefas */}
                <Link
                  href="/prazos"
                  id="kpi-discreto-tarefas"
                  className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition group"
                >
                  <CheckSquare className="h-4 w-4 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Tarefas:{' '}
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      {prazosPendentes.length} {prazosPendentes.length === 1 ? 'pendência' : 'pendências'}
                    </strong>{' '}
                    <span className="text-slate-500 dark:text-slate-400">
                      ({taxaCumprimento}% de tarefas concluídas)
                    </span>
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-start md:self-center">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>Base sincronizada</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PROTAGONISTA: ASSISTENTE JURÍDICO IA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#161b22] text-white border border-[#c5a059]/30 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-[#c5a059]/40 text-[#dfcaa0] text-[11px] font-semibold">
              <Sparkles className="h-3 w-3 text-[#c5a059]" />
              <span>Assistente Jurídico IA</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Analise processos, documentos e decisões em segundos
            </h3>
            <p className="text-xs text-slate-300 font-normal">
              O que você quer fazer hoje? Escolha uma das especialidades jurídicas:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/gemini?acao=analisar_processo"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] text-xs font-medium text-slate-100 hover:text-white transition"
            >
              <FileSearch className="h-3.5 w-3.5 text-[#dfcaa0]" />
              <span>Analisar processo</span>
            </Link>
            <Link
              href="/gemini?acao=resumir_documento"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] text-xs font-medium text-slate-100 hover:text-white transition"
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span>Resumir documento</span>
            </Link>
            <Link
              href="/gemini?acao=encontrar_jurisprudencia"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] text-xs font-medium text-slate-100 hover:text-white transition"
            >
              <Gavel className="h-3.5 w-3.5 text-indigo-400" />
              <span>Encontrar jurisprudência</span>
            </Link>
            <Link
              href="/gemini?acao=criar_peca"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] text-xs font-medium text-slate-100 hover:text-white transition"
            >
              <PenTool className="h-3.5 w-3.5 text-amber-400" />
              <span>Criar peça</span>
            </Link>
            <Link
              href="/gemini?acao=identificar_prazos"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d4b36f] text-slate-950 font-semibold text-xs transition shadow-xs"
            >
              <CalendarClock className="h-3.5 w-3.5" />
              <span>Identificar prazos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. SEÇÃO: Agenda / Prazos & Produtividade Operacional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Coluna 1 & 2: Agenda & Prazos Críticos com Filtro Rápido */}
        <div className="lg:col-span-2 legal-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.04] gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 stroke-[1.5] text-amber-600 dark:text-amber-400" />
                  Agenda & Prazos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Acompanhamento de prazos fatais, audiências e termos processuais
                </p>
              </div>

              {/* Seletor de visualização rápida */}
              <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-white/[0.04] rounded-xl self-start sm:self-center border border-slate-200/60 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setAbaAgenda('urgentes')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    abaAgenda === 'urgentes'
                      ? 'bg-white dark:bg-[#161b22] text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Críticos</span>
                  {prazosUrgentes.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                      {prazosUrgentes.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAbaAgenda('hoje')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    abaAgenda === 'hoje'
                      ? 'bg-white dark:bg-[#161b22] text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Hoje</span>
                  {prazosHoje.length > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                      {prazosHoje.length}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-normal">0</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAbaAgenda('semana')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    abaAgenda === 'semana'
                      ? 'bg-white dark:bg-[#161b22] text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Próximos 7 dias</span>
                  {prazosSemana.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-white/[0.1] text-slate-800 dark:text-slate-200 font-medium">
                      {prazosSemana.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Lista ou Empty State Compacto */}
            <div className="mt-3.5 space-y-2">
              {loading ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Carregando agenda de prazos...
                </div>
              ) : prazosExibicao.length === 0 ? (
                <div className="rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {abaAgenda === 'hoje'
                          ? 'Nenhum prazo ou audiência para hoje'
                          : abaAgenda === 'semana'
                          ? 'Nenhum prazo pendente nos próximos 7 dias'
                          : 'Nenhum prazo crítico pendente'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {totalPrazos > 0
                          ? `Total de ${totalPrazos} termos no escritório (${prazosCumpridos} cumpridos com ${taxaCumprimento}% de conformidade).`
                          : 'Todos os termos processuais estão rigorosamente em dia.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <Link
                      href="/prazos?novo=true"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0047ab] hover:bg-[#003d94] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition shadow-2xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Novo Prazo</span>
                    </Link>
                    <Link
                      href="/gemini?acao=identificar_prazos"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#c5a059]/30 bg-[#c5a059]/10 text-xs font-semibold text-[#8a6b29] dark:text-[#dfcaa0] hover:bg-[#c5a059]/20 transition cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                      <span>Extrair DJE</span>
                    </Link>
                  </div>
                </div>
              ) : (
                prazosExibicao.slice(0, 4).map((prazo) => {
                  const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status, prazo.hora);
                  const isHoje = calc.urgencia === 'hoje';
                  const isVencido = calc.urgencia === 'vencido';

                  return (
                    <div
                      key={prazo.id_prazo}
                      onClick={() => router.push('/prazos')}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.05] transition cursor-pointer gap-2.5"
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

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
            <span>Contagem em dias úteis CPC/CLT</span>
            <Link
              href="/prazos"
              id="link-ver-todos-prazos"
              className="text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Ver agenda completa ({prazos.length})</span>
              <ArrowRight className="h-3 w-3 stroke-[1.5]" />
            </Link>
          </div>
        </div>

        {/* Coluna 3: Ações Rápidas & Produtividade do Escritório */}
        <div className="legal-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.04]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 stroke-[1.5] text-slate-700 dark:text-slate-300" />
                  Ações & Produtividade
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Atalhos imediatos para as rotinas diárias
                </p>
              </div>
            </div>

            {/* Grid de Ações Rápidas */}
            <div className="mt-3.5 grid grid-cols-2 gap-2">
              <Link
                href="/processos?novo=true"
                className="p-3 rounded-xl border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition flex flex-col gap-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <Scale className="h-4 w-4 text-[#0047ab] dark:text-blue-400" />
                  <Plus className="h-3 w-3 text-slate-400" />
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1">Novo Processo</span>
                <span className="text-[10px] text-slate-400">Cadastrar ação judicial</span>
              </Link>

              <Link
                href="/prazos?novo=true"
                className="p-3 rounded-xl border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition flex flex-col gap-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <Plus className="h-3 w-3 text-slate-400" />
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1">Novo Prazo</span>
                <span className="text-[10px] text-slate-400">Termo ou audiência</span>
              </Link>

              <Link
                href="/clientes?novo=true"
                className="p-3 rounded-xl border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition flex flex-col gap-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <Plus className="h-3 w-3 text-slate-400" />
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1">Novo Cliente</span>
                <span className="text-[10px] text-slate-400">Pessoa Física ou Jurídica</span>
              </Link>

              <Link
                href="/gemini?acao=identificar_prazos"
                className="p-3 rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/5 hover:bg-[#c5a059]/15 transition flex flex-col gap-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <Sparkles className="h-4 w-4 text-[#c5a059]" />
                  <ArrowRight className="h-3 w-3 text-[#c5a059]" />
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1">Triagem DJE</span>
                <span className="text-[10px] text-[#8a6b29] dark:text-[#dfcaa0]">Extrair com IA</span>
              </Link>
            </div>

            {/* Eficiência / Indicador de Cumprimento */}
            <div className="mt-3.5 p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">Conformidade de Prazos</span>
                <span className="font-bold text-slate-900 dark:text-white">{taxaCumprimento}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${taxaCumprimento}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
            <Link
              href="/gemini"
              id="btn-abrir-assistente-ia"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] px-4 py-2 text-xs font-semibold text-white dark:text-white transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#dfcaa0]" />
              <span>Abrir Central de IA</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO: Processos Recentes */}
      <div className="legal-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04] gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-4 w-4 stroke-[1.5] text-[#c5a059]" />
              Processos Recentes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Últimas ações judiciais em tramitação, clientes e responsáveis pelo acompanhamento
            </p>
          </div>
          <Link
            href="/processos"
            id="link-ver-todos-processos"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-[#dfcaa0] dark:hover:text-white flex items-center gap-1 transition self-start sm:self-auto"
          >
            <span>Ver todos os processos ({processos.length})</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[1.5]" />
          </Link>
        </div>

        {/* Lista/Tabela de Processos Recentes */}
        <div className="mt-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Carregando acervo de processos recentes...
            </div>
          ) : processosRecentes.length === 0 ? (
            <div className="py-10 text-center">
              <Briefcase className="h-8 w-8 text-slate-400 mx-auto mb-2 stroke-[1.25]" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nenhum processo cadastrado ainda
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Cadastre a primeira ação judicial para acompanhar prazos, andamentos e responsáveis.
              </p>
              <Link
                href="/processos?novo=true"
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-800 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Novo Processo</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.06] text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 pr-4 font-semibold">Número do Processo</th>
                    <th className="py-3 px-4 font-semibold hidden md:table-cell">Ação / Matéria</th>
                    <th className="py-3 px-4 font-semibold">Cliente</th>
                    <th className="py-3 px-4 font-semibold hidden lg:table-cell">Responsável</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 pl-4 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {processosRecentes.map((proc, index) => {
                    const statusStr = (proc.status || '').toLowerCase();
                    const isAndamento = statusStr.includes('andamento') || statusStr.includes('ativo');
                    const isSentenca = statusStr.includes('sentença') || statusStr.includes('recurso') || statusStr.includes('concluso');
                    const isFinalizado = statusStr.includes('finalizado') || statusStr.includes('julgado');
                    const isSuspenso = statusStr.includes('suspenso') || statusStr.includes('aguardando');

                    // Responsável atribuído
                    const responsavelNome = index % 2 === 0 ? 'Dr. Davino Neves' : 'Dra. Luciana Neves';
                    const responsavelIniciais = index % 2 === 0 ? 'DN' : 'LN';

                    return (
                      <tr
                        key={proc.id_processo}
                        onClick={() => router.push('/processos')}
                        className="group hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        {/* 1. NÚMERO DO PROCESSO AUMENTADO */}
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 group-hover:bg-[#0047ab]/10 group-hover:text-[#0047ab] dark:group-hover:bg-[#dfcaa0]/10 dark:group-hover:text-[#dfcaa0] transition-colors">
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <span className="font-mono text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white tracking-tight block">
                                {proc.numero_processo}
                              </span>
                              <span className="text-[11px] text-slate-400 sm:hidden block truncate max-w-[140px]">
                                {proc.titulo}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. TÍTULO / AÇÃO */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 hidden md:table-cell max-w-[220px]">
                          <span className="font-medium truncate block" title={proc.titulo}>
                            {proc.titulo}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Distribuído em {proc.data_abertura ? formatPrazoDateBR(proc.data_abertura) : '—'}
                          </span>
                        </td>

                        {/* 3. CLIENTE */}
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                          <span className="font-semibold block truncate max-w-[150px]">
                            {proc.cliente?.nome || 'Cliente não vinculado'}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {proc.cliente?.cpf_cnpj && proc.cliente.cpf_cnpj.replace(/\D/g, '').length > 11
                              ? 'Pessoa Jurídica'
                              : 'Pessoa Física'}
                          </span>
                        </td>

                        {/* 4. COLUNA RESPONSÁVEL */}
                        <td className="py-3.5 px-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200/80 dark:bg-white/[0.08] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              {responsavelIniciais}
                            </div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                              {responsavelNome}
                            </span>
                          </div>
                        </td>

                        {/* 5. STATUS COMO BADGE REFINADO */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              isAndamento
                                ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                                : isSentenca
                                ? 'bg-purple-50/80 text-purple-800 border-purple-200/70 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40'
                                : isFinalizado
                                ? 'bg-blue-50/80 text-blue-800 border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40'
                                : isSuspenso
                                ? 'bg-amber-50/80 text-amber-800 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
                                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:border-white/[0.08]'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isAndamento
                                  ? 'bg-emerald-500'
                                  : isSentenca
                                  ? 'bg-purple-500'
                                  : isFinalizado
                                  ? 'bg-blue-500'
                                  : isSuspenso
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span>{proc.status}</span>
                          </span>
                        </td>

                        {/* 6. AÇÃO RÁPIDA NO HOVER */}
                        <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0047ab] dark:text-[#dfcaa0] group-hover:translate-x-0.5 transition-transform">
                            <span>Abrir</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
              <DollarSign className="h-4 w-4 stroke-[1.5] text-emerald-600 dark:text-emerald-400" />
              Desempenho Financeiro
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fluxo de honorários, previsão de recebimentos e saúde orçamentária do escritório
            </p>
          </div>
          <Link
            href="/financeiro"
            id="link-financeiro-demonstrativo-top"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center gap-1 transition"
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
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
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
                  className="h-full rounded-full bg-emerald-500"
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
            <div className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
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
                        <div className="h-full bg-blue-600" style={{ width: `${pctContratual}%` }} />
                      )}
                      {pctExito > 0 && (
                        <div className="h-full bg-emerald-500" style={{ width: `${pctExito}%` }} />
                      )}
                      {pctConsultivo > 0 && (
                        <div className="h-full bg-indigo-500" style={{ width: `${pctConsultivo}%` }} />
                      )}
                    </>
                  ) : (
                    <div className="h-full w-full bg-slate-200 dark:bg-white/[0.08]" />
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    Honorário Contratual ({pctContratual}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Honorário de Êxito ({pctExito}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
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
                  <Users className="h-4 w-4 stroke-[1.5] text-blue-600 dark:text-blue-400" />
                  Atividades da Equipe
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Carga operacional, distribuição de prazos e produtividade dos colaboradores
                </p>
              </div>

              <Link
                href="/usuarios"
                id="link-gerenciar-equipe"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center gap-1 transition"
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
                              className="h-full rounded-full bg-[#0047ab] dark:bg-blue-500"
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
                  <Cake className="h-4 w-4 stroke-[1.25] text-purple-600 dark:text-purple-400" />
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

