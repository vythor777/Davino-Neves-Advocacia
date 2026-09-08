'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Scale,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  ArrowRight,
} from 'lucide-react';

type TabKey = 'processos' | 'datajud' | 'gemini' | 'prazos';

export function PlatformShowcase() {
  const [activeTab, setActiveTab] = useState<TabKey>('processos');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Simulated DataJud query
  const simulatedCnj = '1004523-88.2024.8.26.0100';

  const handleCopyCnj = () => {
    navigator.clipboard.writeText(simulatedCnj);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  return (
    <section id="plataforma" className="relative py-24 bg-[#0A0F1D] text-white border-t border-slate-800/80">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 mb-4">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>Infraestrutura Tecnológica Proprietária</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Uma Plataforma Construída para a <span className="gold-gradient-text">Alta Performance</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 font-sans font-light leading-relaxed">
            Elimine a lentidão e as falhas operacionais com nosso ecossistema integrado: autos sincronizados, inteligência artificial preditiva e rastreamento milimétrico de prazos judiciais.
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('processos')}
            className={`flex items-center gap-2.5 rounded-xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'processos'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Controladoria & Autos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('datajud')}
            className={`flex items-center gap-2.5 rounded-xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'datajud'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>DataJud CNJ em Tempo Real</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`flex items-center gap-2.5 rounded-xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'gemini'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>IA Jurídica Preditiva</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prazos')}
            className={`flex items-center gap-2.5 rounded-xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'prazos'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarClock className="h-4 w-4" />
            <span>Prazos Fatais & SLA</span>
          </button>
        </div>

        {/* Tab Contents: Ultra-realistic Live Showcase Card */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#070B14] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle top indicator */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs text-slate-400">
                SISTEMA OPERACIONAL ATIVO • SERVIDORES BRASÍLIA & SÃO PAULO
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-900 px-2.5 py-1 font-mono text-[10px] text-slate-400 border border-slate-800">
                TLS 256-BIT • ISO 27001
              </span>
            </div>
          </div>

          {/* TAB 1: CONTROLADORIA DE PROCESSOS */}
          {activeTab === 'processos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
                  <Briefcase className="h-3.5 w-3.5" />
                  Módulo de Controladoria Jurídica
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Visão Panorâmica de Autos com Granularidade Total
                </h3>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  Controle centralizado de processos em todas as instâncias do Judiciário nacional. Sincronização automatizada de movimentações, classes e órgãos julgadores, com vinculação imediata a clientes e advogados responsáveis.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Rastreabilidade de instâncias G1, G2 e Tribunais Superiores</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Triagem inteligente de fases processuais e cumprimento de sentença</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Trilha de auditoria com histórico de alterações e logs de acesso</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link
                    href="/processos"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-blue-600 transition"
                  >
                    <span>Acessar Módulo no Sistema Real</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Interactive Mockup Panel */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-inner space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs">
                  <span className="font-semibold text-slate-300">Autos em Destaque no Contencioso</span>
                  <span className="rounded-full bg-blue-950/80 text-blue-300 px-2.5 py-0.5 font-mono text-[11px] border border-blue-800">
                    124 Ativos
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 hover:border-slate-700 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            1004523-88.2024.8.26.0100
                          </span>
                          <span className="rounded-md bg-amber-500/10 text-amber-300 px-2 py-0.5 text-[10px] font-semibold border border-amber-500/20">
                            TJSP • 1ª Instância
                          </span>
                        </div>
                        <h4 className="mt-1 text-xs font-medium text-slate-200">
                          Ação Anulatória de Débito Fiscal c/c Pedido de Tutela de Urgência
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Cliente: Alpha Logística & Transportes S/A • 14ª Vara da Fazenda Pública
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-500/10 text-emerald-400 px-2.5 py-1 text-[10px] font-semibold border border-emerald-500/20">
                        Em Andamento
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 hover:border-slate-700 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            5001928-12.2023.4.03.6100
                          </span>
                          <span className="rounded-md bg-blue-500/10 text-blue-300 px-2 py-0.5 text-[10px] font-semibold border border-blue-500/20">
                            TRF3 • 2ª Instância
                          </span>
                        </div>
                        <h4 className="mt-1 text-xs font-medium text-slate-200">
                          Recurso de Apelação Cível - Exclusão do ICMS da Base de Cálculo PIS/COFINS
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Cliente: Holding Imobiliária Paulista S/A • 3ª Turma Federal
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-500/10 text-blue-400 px-2.5 py-1 text-[10px] font-semibold border border-blue-500/20">
                        Fase Recursal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATAJUD CNJ */}
          {activeTab === 'datajud' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                  <Scale className="h-3.5 w-3.5" />
                  API Pública do Conselho Nacional de Justiça
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Consulta & Importação Direta em Menos de 2 Segundos
                </h3>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  Conecte-se aos dados oficiais do Poder Judiciário de todo o país. Extraia classes, órgãos julgadores, datas de ajuizamento e andamentos com a precisão do padrão CNJ unificado.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Detecção automática do tribunal pelo dígito de ramo e comarca</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Vinculação ao acervo ativo do escritório com 1 único clique</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Disponibilidade 24/7 com proteção contra timeouts e instabilidades</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link
                    href="/datajud"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-blue-600 transition"
                  >
                    <span>Testar Consulta DataJud Real</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* DataJud Simulation Frame */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-inner space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs font-semibold text-slate-200">Terminal de Consulta DataJud CNJ</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    API Conectada
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5">
                  <Scale className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    value={simulatedCnj}
                    className="flex-1 bg-transparent font-mono text-xs text-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCnj}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-white transition"
                    title="Copiar número"
                  >
                    {copiedNumber ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Simulated Response */}
                <div className="rounded-xl border border-emerald-950/60 bg-emerald-950/20 p-4 space-y-2 border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-300">RETORNO OFICIAL CONFIRMADO</span>
                    <span className="text-[10px] text-slate-400">Resposta em 1.12s</span>
                  </div>
                  <p className="text-xs text-slate-200">
                    <strong>Tribunal:</strong> TJSP • <strong>Classe:</strong> Procedimento Comum Cível • <strong>Grau:</strong> G1
                  </p>
                  <p className="text-xs text-slate-300">
                    <strong>Órgão Julgador:</strong> 22ª Vara Cível Central da Comarca da Capital
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                      Sincronizado via CNJ JSON-RPC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTELIGÊNCIA ARTIFICIAL PREDITIVA */}
          {activeTab === 'gemini' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/20">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  IA Jurídica Especializada
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Análise Preditiva & Síntese de Jurisprudência
                </h3>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  Nossa inteligência jurídica processa decisões complexas em segundos, destacando súmulas vinculantes, riscos de sucumbência e teses aceitas pelos relatores dos Tribunais de Justiça e Tribunais Superiores.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Geração de resumos executivos para boards e diretores jurídicos</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Mapeamento de precedentes do STF, STJ e TST aplicáveis ao caso</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Minutas iniciais de recursos e memoriais de audiência</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link
                    href="/gemini"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition"
                  >
                    <span>Testar IA Jurídica no Sistema</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* AI Mockup Panel */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-inner space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="font-semibold text-slate-200">Relatório de Inteligência Preditiva</span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-mono">Modo: Análise Estratégica</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Probabilidade Estimada de Provimento:</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      84.7% (Alta)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    A tese recursal encontra amparo direto no <strong>Tema 69 de Repercussão Geral do STF</strong> e na pacífica jurisprudência da 1ª Seção do Superior Tribunal de Justiça.
                  </p>
                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="font-semibold text-amber-300">Recomendação Tática:</div>
                    <div>Interposição de Agravo Interno em até 15 dias úteis com despacho virtual perante o Desembargador Relator.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MONITORAMENTO DE PRAZOS FATAIS */}
          {activeTab === 'prazos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/20">
                  <CalendarClock className="h-3.5 w-3.5 text-rose-400" />
                  Tolerância Zero a Perdas de Prazo
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Controle de Prazos Fatais com Auditoria e Tripla Validação
                </h3>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  Sistema de contagem em dias úteis automatizado conforme o CPC e CLT, compensando feriados nacionais, locais e suspensões regimentais publicadas nos diários oficiais.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Alerta escalonado com SLA estrito de 48h de antecedência</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Protocolo final com validação dupla (advogado + controlador)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Histórico de 100% de pontualidade comprovado em mais de uma década</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Link
                    href="/prazos"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-blue-600 transition"
                  >
                    <span>Ver Painel de Prazos do Sistema</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Deadlines Mockup Panel */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-inner space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs">
                  <span className="font-semibold text-slate-200">Agenda de Prazos Fatais Auditada</span>
                  <span className="rounded-full bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 font-mono text-[11px] border border-emerald-800">
                    100% em Dia
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 border-l-4 border-l-rose-500">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-rose-500/20 text-rose-300 px-2 py-0.5 text-[10px] font-bold font-mono">
                            FATAL EM 48H
                          </span>
                          <span className="text-xs font-mono text-slate-300">Autos: 1029384-22.2024.8.26.0001</span>
                        </div>
                        <h4 className="mt-1 text-xs font-semibold text-white">
                          Contestação com Pedido de Reconvenção - Ação de Cobrança
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Responsável: Dra. Beatriz Neves • Status da Peça: Em Revisão Final
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-rose-300 font-bold">
                        D-2
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-blue-500/20 text-blue-300 px-2 py-0.5 text-[10px] font-semibold font-mono">
                            PRAZO REGULAR
                          </span>
                          <span className="text-xs font-mono text-slate-300">Autos: 0039281-55.2023.5.02.0014</span>
                        </div>
                        <h4 className="mt-1 text-xs font-semibold text-white">
                          Recurso Ordinário Trabalhista - Horas Extras e Cargo de Confiança
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Responsável: Dr. Carlos Davino • Status da Peça: Concluída e Protocolada
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-emerald-400 font-bold">
                        OK
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
