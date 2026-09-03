import React from 'react';
import Link from 'next/link';
import {
  FileQuestion,
  Home,
  Briefcase,
  CalendarClock,
  Users,
  Scale,
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:py-24 flex flex-col items-center justify-center text-center animate-fade-in-up">
      {/* Ícone de Destaque */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-900 shadow-sm mx-auto">
          <FileQuestion className="h-10 w-10" />
        </div>
        <span className="absolute -bottom-2 -right-2 inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-bold text-white shadow-xs dark:bg-slate-100 dark:text-slate-900">
          404
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Página não encontrada
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        O registro processual, documento ou rota solicitada não foi localizada no sistema ou pode ter sido movida.
      </p>

      {/* Botões de Ação */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-500 transition-all active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <Home className="h-4 w-4" />
          <span>Voltar ao Início</span>
        </Link>
      </div>

      {/* Módulos do Sistema para Acesso Rápido */}
      <div className="mt-12 w-full pt-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Módulos Principais
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          <Link
            href="/processos"
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-800 transition-all hover:-translate-y-0.5"
          >
            <Briefcase className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Processos</span>
          </Link>

          <Link
            href="/prazos"
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-800 transition-all hover:-translate-y-0.5"
          >
            <CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Prazos</span>
          </Link>

          <Link
            href="/clientes"
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800 transition-all hover:-translate-y-0.5"
          >
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Clientes</span>
          </Link>

          <Link
            href="/datajud"
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 transition-all hover:-translate-y-0.5"
          >
            <Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">DataJud</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
