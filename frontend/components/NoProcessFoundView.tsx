'use client';

import React from 'react';
import { Search, RefreshCw, HelpCircle } from 'lucide-react';
import { formatarNumeroCNJ } from '@/components/ProcessosTable';

export interface NoProcessFoundViewProps {
  /** Número do processo pesquisado (opcional, para feedback contextual) */
  numeroProcesso?: string;
  /** Tribunal selecionado no momento da consulta (opcional) */
  tribunal?: string;
  /** Título principal (padrão estrito: 'Nenhum processo encontrado para este número') */
  title?: string;
  /** Descrição explicativa adicional */
  description?: string;
  /** Ação disparada para limpar a busca ou tentar nova consulta */
  onResetSearch?: () => void;
  /** Rótulo da ação de reset */
  resetLabel?: string;
  /** Ação alternativa para alterar o tribunal pesquisado */
  onChangeTribunal?: () => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Ilustração vetorial limpa e institucional para indicar busca processual sem registros
 */
function ProcessNotFoundIllustration() {
  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
      {/* Círculo de fundo sutil com anel concêntrico */}
      <div className="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800/60" />
      <div className="absolute inset-2 rounded-full border border-dashed border-slate-300 dark:border-slate-700" />

      {/* Vetor gráfico: Prancheta jurídica com lupa de verificação */}
      <svg
        className="relative h-12 w-12 text-slate-400 dark:text-slate-500"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Folha do Processo */}
        <rect
          x="11"
          y="8"
          width="26"
          height="32"
          rx="3"
          className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
          strokeWidth="2"
        />
        {/* Linhas de texto simuladas */}
        <path
          d="M17 17H31M17 23H27M17 29H23"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Marcador de pendência / vazio */}
        <circle
          cx="33"
          cy="33"
          r="8"
          className="fill-slate-50 dark:fill-slate-800 stroke-[#0047ab] dark:stroke-blue-400"
          strokeWidth="2"
        />
        {/* Lupa / Linha de busca dentro do marcador */}
        <path
          d="M30 30L36 36M36 30L30 36"
          className="stroke-[#0047ab] dark:stroke-blue-400"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Componente NoProcessFoundView
 *
 * Exibido quando a consulta ao DataJud retornar vazia.
 * Apresenta:
 * - Ilustração simples vetorial no design system institucional
 * - Texto: 'Nenhum processo encontrado para este número'
 * - Informações de auxílio para conferência do número CNJ e tribunal
 */
export function NoProcessFoundView({
  numeroProcesso,
  tribunal,
  title = 'Nenhum processo encontrado para este número',
  description,
  onResetSearch,
  resetLabel = 'Realizar Nova Consulta',
  onChangeTribunal,
  className = '',
}: NoProcessFoundViewProps) {
  const formattedCNJ = numeroProcesso ? formatarNumeroCNJ(numeroProcesso) : '';

  return (
    <div
      role="status"
      className={`rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {/* Ilustração Simples */}
      <ProcessNotFoundIllustration />

      {/* Título Estrito Conforme Requisito */}
      <h3 className="mt-4 text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      {/* Feedback do Número Pesquisado */}
      {formattedCNJ && (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
          <span>{formattedCNJ}</span>
          {tribunal && (
            <span className="text-slate-400 dark:text-slate-500 font-sans">
              • Tribunal {tribunal.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Descrição e Orientações Amigáveis */}
      <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {description ||
          'O tribunal consultado não localizou registros processuais públicos para esta numeração única. O processo pode tramitar sob segredo de justiça ou em outra corte judiciária.'}
      </p>

      {/* Dicas Práticas de Verificação */}
      <div className="mx-auto mt-6 max-w-lg rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left dark:border-slate-800/80 dark:bg-slate-800/40">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <HelpCircle className="h-3.5 w-3.5 text-[#0047ab] dark:text-blue-400" />
          <span>O que verificar:</span>
        </h4>
        <ul className="mt-2 space-y-1.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-1.5">
            <span className="text-[#0047ab] dark:text-blue-400 font-bold">•</span>
            <span>Certifique-se de que os 20 dígitos do padrão CNJ foram digitados integralmente.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-[#0047ab] dark:text-blue-400 font-bold">•</span>
            <span>Confira se a corte selecionada (ex: TJSP, TRF3, TST) corresponde à jurisdição da ação.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-[#0047ab] dark:text-blue-400 font-bold">•</span>
            <span>Processos recém-distribuídos podem levar algumas horas para indexação no DataJud.</span>
          </li>
        </ul>
      </div>

      {/* Botões de Ação */}
      {(onResetSearch || onChangeTribunal) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onResetSearch && (
            <button
              type="button"
              onClick={onResetSearch}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0047ab] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003785] dark:bg-blue-600 dark:hover:bg-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0047ab] active:scale-98 transition-all"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{resetLabel}</span>
            </button>
          )}

          {onChangeTribunal && (
            <button
              type="button"
              onClick={onChangeTribunal}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Alterar Tribunal</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default NoProcessFoundView;
