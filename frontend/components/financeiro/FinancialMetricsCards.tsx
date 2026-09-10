'use client';

import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { ResumoFinanceiroResponse } from '@/services/financeiroService';

interface FinancialMetricsCardsProps {
  data: ResumoFinanceiroResponse | null;
  loading?: boolean;
}

export function FinancialMetricsCards({ data, loading }: FinancialMetricsCardsProps) {
  const metricas = data?.metricas || {
    entradasRealizadas: 0,
    entradasPrevistas: 0,
    honorariosAReceber: 0,
    despesasPagas: 0,
    contasAPagarPendentes: 0,
    saldoLiquido: 0,
    saldoPrevisto: 0,
    pendenciasAtrasadas: 0,
    qtdAtrasadas: 0,
    taxaRecebimento: 0,
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="legal-glass-card fio-de-luz p-4 sm:p-5 animate-pulse flex flex-col justify-between h-36"
          >
            <div className="h-4 w-24 bg-slate-200 dark:bg-white/[0.06] rounded" />
            <div className="h-7 w-36 bg-slate-200 dark:bg-white/[0.06] rounded mt-2" />
            <div className="h-3 w-48 bg-slate-100 dark:bg-white/[0.03] rounded mt-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: Entradas Realizadas */}
      <div className="legal-glass-card fio-de-luz p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
              Entradas Realizadas
            </span>
            {metricas.entradasPrevistas > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ArrowUpRight className="h-3 w-3" /> {metricas.taxaRecebimento}% recebido
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Sem previsões
              </span>
            )}
          </div>
          <div className={`mt-3 text-3xl font-semibold tabular-nums ${
            metricas.entradasRealizadas > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-[#f8fafc]'
          }`}>
            {formatBRL(metricas.entradasRealizadas)}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Previsto: {formatBRL(metricas.entradasPrevistas)}</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Liquidado</span>
        </div>
      </div>

      {/* CARD 2: Honorários a Receber / Pendentes */}
      <div className="legal-glass-card fio-de-luz p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
              Honorários a Receber
            </span>
            {metricas.qtdAtrasadas > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <AlertCircle className="h-3 w-3" /> {metricas.qtdAtrasadas} atrasado(s)
              </span>
            ) : metricas.honorariosAReceber > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#c5a059]/15 px-2 py-0.5 text-[10px] font-semibold text-[#c5a059] border border-[#c5a059]/25">
                <Clock className="h-3 w-3" /> Em dia
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Em dia
              </span>
            )}
          </div>
          <div className="mt-3 text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#f8fafc]">
            {formatBRL(metricas.honorariosAReceber)}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Atrasados: {formatBRL(metricas.pendenciasAtrasadas)}</span>
          <span className="font-medium text-amber-500 dark:text-amber-400">A vencer</span>
        </div>
      </div>

      {/* CARD 3: Contas a Pagar / Despesas */}
      <div className="legal-glass-card fio-de-luz p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
              Despesas & Custas
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              <ArrowDownRight className="h-3 w-3 text-slate-400" /> Operacional
            </span>
          </div>
          <div className={`mt-3 text-3xl font-semibold tabular-nums ${
            metricas.despesasPagas > 0
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-900 dark:text-[#f8fafc]'
          }`}>
            {formatBRL(metricas.despesasPagas)}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Pendente: {formatBRL(metricas.contasAPagarPendentes)}</span>
          <span className="font-medium text-slate-400">Fluxo de Saída</span>
        </div>
      </div>

      {/* CARD 4: Saldo Líquido em Caixa */}
      <div className="legal-glass-card fio-de-luz p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
              Saldo Líquido
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/25 px-2 py-0.5 text-[10px] font-semibold text-[#c5a059]">
              <Wallet className="h-3 w-3" /> Realizado
            </span>
          </div>
          <div className={`mt-3 text-3xl font-semibold tabular-nums ${
            metricas.saldoLiquido > 0
              ? 'text-emerald-500 dark:text-emerald-400'
              : metricas.saldoLiquido < 0
              ? 'text-rose-500 dark:text-rose-400'
              : 'text-slate-900 dark:text-[#f8fafc]'
          }`}>
            {formatBRL(metricas.saldoLiquido)}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Projetado: {formatBRL(metricas.saldoPrevisto)}</span>
          <span className={`font-semibold ${
            metricas.saldoLiquido > 0
              ? 'text-emerald-500 dark:text-emerald-400'
              : metricas.saldoLiquido < 0
              ? 'text-rose-500 dark:text-rose-400'
              : 'text-slate-400'
          }`}>
            {metricas.saldoLiquido > 0 ? 'Superávit' : metricas.saldoLiquido < 0 ? 'Déficit' : 'Equilibrado'}
          </span>
        </div>
      </div>
    </div>
  );
}
