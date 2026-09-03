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
            className="astrea-card p-5 animate-pulse flex flex-col justify-between h-36"
          >
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-7 w-36 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
            <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/60 rounded mt-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: Entradas Realizadas */}
      <div className="astrea-card p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Entradas Realizadas
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60">
              <ArrowUpRight className="h-3 w-3" /> {metricas.taxaRecebimento}% recebido
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatBRL(metricas.entradasRealizadas)}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Previsto: {formatBRL(metricas.entradasPrevistas)}</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Liquidado</span>
        </div>
      </div>

      {/* CARD 2: Honorários a Receber / Pendentes */}
      <div className="astrea-card p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Honorários a Receber
            </span>
            {metricas.qtdAtrasadas > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60">
                <AlertCircle className="h-3 w-3" /> {metricas.qtdAtrasadas} atrasado(s)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 dark:bg-sky-950/80 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-400">
                <Clock className="h-3 w-3" /> Em dia
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatBRL(metricas.honorariosAReceber)}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Atrasados: {formatBRL(metricas.pendenciasAtrasadas)}</span>
          <span className="font-medium text-amber-600 dark:text-amber-400">A vencer / cobrar</span>
        </div>
      </div>

      {/* CARD 3: Contas a Pagar / Despesas */}
      <div className="astrea-card p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Despesas & Custas Pagas
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
              <ArrowDownRight className="h-3 w-3 text-rose-500" /> Operacional
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
            {formatBRL(metricas.despesasPagas)}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>A Pagar Pendente: {formatBRL(metricas.contasAPagarPendentes)}</span>
          <span className="font-medium text-slate-500">Fluxo de Saída</span>
        </div>
      </div>

      {/* CARD 4: Saldo Líquido Operacional */}
      <div className="astrea-card p-5 flex flex-col justify-between bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:to-blue-950/20 border-blue-200/60 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
              Saldo Líquido em Caixa
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300">
              <Wallet className="h-3 w-3" /> Realizado
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
            {formatBRL(metricas.saldoLiquido)}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Projetado: {formatBRL(metricas.saldoPrevisto)}</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Superávit</span>
        </div>
      </div>
    </div>
  );
}
