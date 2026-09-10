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
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 shadow-sm mx-auto">
          <FileQuestion className="h-10 w-10" />
        </div>
        <span className="absolute -bottom-2 -right-2 inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-bold text-[#c5a059] border border-[#c5a059]/40 shadow-xs dark:bg-black">
          404
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc]">
        Página não encontrada
      </h1>

      <p className="mt-3 max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        O registro processual, documento ou rota solicitada não foi localizada no sistema ou pode ter sido movida.
      </p>

      {/* Botões de Ação */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[#c5a059] hover:bg-[#d4b36f] text-slate-950 font-semibold px-5 py-2.5 text-xs shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Home className="h-4 w-4" />
          <span>Voltar ao Início</span>
        </Link>
      </div>

      {/* Módulos do Sistema para Acesso Rápido */}
      <div className="mt-12 w-full pt-8 border-t border-slate-200/60 dark:border-white/[0.06]">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-4">
          Módulos Principais
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          <Link
            href="/processos"
            className="legal-glass-card fio-de-luz flex flex-col items-center gap-2 p-3.5 hover:border-[#c5a059]/40 transition-all hover:-translate-y-0.5"
          >
            <Briefcase className="h-5 w-5 text-[#c5a059]" />
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Processos</span>
          </Link>

          <Link
            href="/prazos"
            className="legal-glass-card fio-de-luz flex flex-col items-center gap-2 p-3.5 hover:border-[#c5a059]/40 transition-all hover:-translate-y-0.5"
          >
            <CalendarClock className="h-5 w-5 text-[#c5a059]" />
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Prazos</span>
          </Link>

          <Link
            href="/clientes"
            className="legal-glass-card fio-de-luz flex flex-col items-center gap-2 p-3.5 hover:border-[#c5a059]/40 transition-all hover:-translate-y-0.5"
          >
            <Users className="h-5 w-5 text-[#c5a059]" />
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Clientes</span>
          </Link>

          <Link
            href="/datajud"
            className="legal-glass-card fio-de-luz flex flex-col items-center gap-2 p-3.5 hover:border-[#c5a059]/40 transition-all hover:-translate-y-0.5"
          >
            <Scale className="h-5 w-5 text-[#c5a059]" />
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">DataJud</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
