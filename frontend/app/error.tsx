'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import {
  AlertOctagon,
  RefreshCw,
  Home,
  LifeBuoy,
  ShieldAlert,
} from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro em monitoramento de telemetria se necessário
    console.error('Erro na aplicação jurídica:', error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-24 flex flex-col items-center justify-center text-center animate-fade-in-up">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900 shadow-sm mx-auto mb-6">
          <AlertOctagon className="h-8 w-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900 mb-3">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Interrupção Temporária</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Não foi possível concluir a operação
        </h1>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
          Ocorreu uma instabilidade pontual ao carregar os registros jurídicos. Nenhuma informação foi perdida e a segurança dos autos permanece preservada.
        </p>

        {error?.digest && (
          <div className="mt-4 rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ID de Referência: <span className="font-semibold text-slate-700 dark:text-slate-300">{error.digest}</span>
          </div>
        )}

        {/* Ações de Recuperação */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-500 transition-all active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Tentar Novamente</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-all active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Home className="h-4 w-4" />
            <span>Ir para o Início</span>
          </Link>
        </div>

        {/* Informações de Suporte e Ouvidoria */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 flex items-center justify-between gap-4 w-full max-w-md">
          <div className="flex items-center gap-2.5">
            <LifeBuoy className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-left">Dúvidas técnicas ou persistência de erro?</span>
          </div>
          <a
            href="mailto:suporte@davinoneves.com.br"
            className="font-semibold text-sky-600 dark:text-sky-400 hover:underline shrink-0"
          >
            Contatar Suporte
          </a>
        </div>

        <InstitutionalFooter />
      </div>
    );
  }
