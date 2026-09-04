'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ResumoFinanceiroResponse } from '@/services/financeiroService';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface FinancialChartsViewProps {
  data: ResumoFinanceiroResponse | null;
}

const COLORS_RECEITAS = ['#0284c7', '#10b981', '#6366f1', '#94a3b8'];
const COLORS_DESPESAS = ['#f59e0b', '#64748b', '#ef4444', '#a855f7'];

export function FinancialChartsView({ data }: FinancialChartsViewProps) {
  const historico = data?.historicoMensal || [];

  const categoriasReceita = data?.categorias?.receitas || {};
  const dataPieReceitas = [
    { name: 'Honorário Contratual', value: categoriasReceita['HONORARIO_CONTRATUAL'] || 0 },
    { name: 'Honorário de Êxito', value: categoriasReceita['HONORARIO_EXITO'] || 0 },
    { name: 'Consultivo & Pareceres', value: categoriasReceita['CONSULTIVO'] || 0 },
    { name: 'Outras Entradas', value: categoriasReceita['OUTROS'] || 0 },
  ].filter((i) => i.value > 0);

  const categoriasDespesa = data?.categorias?.despesas || {};
  const dataPieDespesas = [
    { name: 'Custas & Diligências', value: categoriasDespesa['CUSTAS_PROCESSUAIS'] || 0 },
    { name: 'Operacional & Softwares', value: categoriasDespesa['OPERACIONAL'] || 0 },
    { name: 'Impostos & Tributos', value: categoriasDespesa['IMPOSTOS'] || 0 },
    { name: 'Outras Saídas', value: categoriasDespesa['OUTROS'] || 0 },
  ].filter((i) => i.value > 0);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Gráfico 1: Comparativo Entradas vs Saídas Consolidado */}
      <div className="astrea-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Fluxo de Caixa Mensal (Receitas vs Despesas)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparativo consolidado dos últimos meses para análise de margem líquida
            </p>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            Últimos 6 meses
          </span>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={historico}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              barGap={8}
            >
              <XAxis
                dataKey="rotulo"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: unknown) => [formatBRL(Number(value) || 0), '']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              <Bar
                name="Entradas (R$)"
                dataKey="receitas"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                name="Despesas (R$)"
                dataKey="despesas"
                fill="#f43f5e"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos de Composição em Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composição de Receitas */}
        <div className="astrea-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <PieIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Composição das Receitas de Honorários
              </h3>
            </div>

            <div className="mt-4 h-64 w-full">
              {dataPieReceitas.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataPieReceitas}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {dataPieReceitas.map((_, index) => (
                        <Cell
                          key={`cell-rec-${index}`}
                          fill={COLORS_RECEITAS[index % COLORS_RECEITAS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [formatBRL(Number(val) || 0), '']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center p-4">
                  <PieIcon className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Nenhuma receita categorizada no período
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Os gráficos serão desenhados conforme honorários forem cadastrados.
                  </p>
                </div>
              )}
            </div>
          </div>

          {dataPieReceitas.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              {dataPieReceitas.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS_RECEITAS[idx % COLORS_RECEITAS.length] }}
                  />
                  <span className="truncate text-slate-600 dark:text-slate-400">
                    {item.name}: <strong>{formatBRL(item.value)}</strong>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Composição de Despesas */}
        <div className="astrea-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <PieIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribuição de Custos & Despesas
              </h3>
            </div>

            <div className="mt-4 h-64 w-full">
              {dataPieDespesas.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataPieDespesas}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {dataPieDespesas.map((_, index) => (
                        <Cell
                          key={`cell-desp-${index}`}
                          fill={COLORS_DESPESAS[index % COLORS_DESPESAS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [formatBRL(Number(val) || 0), '']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center p-4">
                  <PieIcon className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Nenhuma despesa categorizada no período
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Os custos e custas aparecerão aqui após os lançamentos.
                  </p>
                </div>
              )}
            </div>
          </div>

          {dataPieDespesas.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              {dataPieDespesas.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS_DESPESAS[idx % COLORS_DESPESAS.length] }}
                  />
                  <span className="truncate text-slate-600 dark:text-slate-400">
                    {item.name}: <strong>{formatBRL(item.value)}</strong>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
