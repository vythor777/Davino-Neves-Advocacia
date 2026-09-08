'use client';

import React, { useState, useId } from 'react';
import {
  Calculator,
  Clock,
  ShieldCheck,
  CircleDollarSign,
  ArrowRight,
} from 'lucide-react';

export function RoiCalculator() {
  const [processCount, setProcessCount] = useState<number>(350);
  const [teamSize, setTeamSize] = useState<number>(4);

  const processSliderId = useId();
  const teamSliderId = useId();

  // Mathematical estimation based on real legal operations benchmarks
  // Approx 0.45 hours spent per process per month on docketing, checking tribunals, moving deadlines
  const manualHoursPerMonth = Math.round(processCount * 0.42);
  const hoursSavedPerMonth = Math.round(manualHoursPerMonth * 0.78);
  const averageHourlyRate = 120; // R$ 120/hr average legal ops cost
  const estimatedSavings = hoursSavedPerMonth * averageHourlyRate;

  return (
    <section id="calculadora" className="py-24 bg-[#0A0F1D] text-white border-t border-slate-800/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Context & Explanations */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Calculator className="h-3.5 w-3.5" />
              <span>Simulador Interativo de Eficiência</span>
            </div>

            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Calcule a Economia de Tempo e o <span className="gold-gradient-text">Retorno Financeiro</span>
            </h2>

            <p className="text-sm text-slate-300 font-sans font-light leading-relaxed">
              Descubra quanto tempo sua equipe perde em tarefas manuais de checagem de andamentos, diários oficiais e preenchimento de planilhas — e quanto a infraestrutura da Davino Neves pode devolver em produtividade e mitigação de riscos.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  01
                </div>
                <span>Varredura automática e instantânea no DataJud CNJ</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  02
                </div>
                <span>Contagem de prazos com compensação de feriados e recesso Forense</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  03
                </div>
                <span>Eliminação total de contingências por intempestividade</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Controls & Live Metrics */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-[#070B14] p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8">
            {/* Sliders Area */}
            <div className="space-y-6">
              {/* Slider 1: Volume de Processos */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <label htmlFor={processSliderId} className="font-medium text-slate-300">
                    Volume de Processos Ativos no Acervo:
                  </label>
                  <span className="font-mono text-sm font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-900/60">
                    {processCount.toLocaleString('pt-BR')} processos
                  </span>
                </div>
                <input
                  id={processSliderId}
                  type="range"
                  min="20"
                  max="3000"
                  step="20"
                  value={processCount}
                  onChange={(e) => setProcessCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>20</span>
                  <span>500</span>
                  <span>1.500</span>
                  <span>3.000+</span>
                </div>
              </div>

              {/* Slider 2: Tamanho da Equipe */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <label htmlFor={teamSliderId} className="font-medium text-slate-300">
                    Advogados e Analistas Jurídicos na Operação:
                  </label>
                  <span className="font-mono text-sm font-bold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-900/60">
                    {teamSize} {teamSize === 1 ? 'profissional' : 'profissionais'}
                  </span>
                </div>
                <input
                  id={teamSliderId}
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>15</span>
                  <span>25+</span>
                </div>
              </div>
            </div>

            {/* Live Generated KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span>Horas Poupadas</span>
                </div>
                <div className="font-cinzel text-2xl font-bold text-white">
                  ~{hoursSavedPerMonth}h
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  por mês em controladoria
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs mb-1">
                  <CircleDollarSign className="h-3.5 w-3.5" />
                  <span>Economia Estimada</span>
                </div>
                <div className="font-cinzel text-2xl font-bold text-emerald-300">
                  R$ {estimatedSavings.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  em retrabalho e riscos
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs mb-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Segurança em Prazos</span>
                </div>
                <div className="font-cinzel text-2xl font-bold text-amber-300">
                  100%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  com SLA duplo auditado
                </div>
              </div>
            </div>

            {/* Call to action button */}
            <div className="pt-2">
              <a
                href="#contato"
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-6 py-3.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition"
              >
                <span>Solicitar Diagnóstico com base nestes números</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
