'use client';

import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Database,
  Lock,
} from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 bg-[#070B14] text-white">
      {/* Background Architectural Mesh & Subtle Lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full bg-gradient-to-b from-blue-900/20 via-indigo-950/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-blue-600/5 blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* OAB / Authority Micro-Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xs mb-6 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>OAB/SP 45.892/2012 • Legal Operations & IA Jurídica</span>
          </div>

          {/* Imposing Title */}
          <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            A Fusão entre a <span className="gold-gradient-text">Excelência Jurídica</span> e a Mais Alta Tecnologia.
          </h1>

          {/* Elegant Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 font-sans font-light leading-relaxed max-w-3xl mx-auto">
            Defesa contenciosa de alto valor, governança societária e controladoria processual corporativa, potencializadas por sincronização em tempo real com o <strong className="font-semibold text-white">DataJud CNJ</strong> e <strong className="font-semibold text-white">Inteligência Artificial Preditiva</strong>.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contato"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-8 py-4 text-sm font-bold tracking-wide text-slate-950 shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/35 active:scale-98 transition duration-200"
            >
              <span>Agendar Diagnóstico Estratégico</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#plataforma"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/80 px-7 py-4 text-sm font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-800 hover:text-white transition shadow-sm"
            >
              <span>Explorar Plataforma</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </a>
          </div>

          {/* Compliance & Security Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Conformidade LGPD (Lei 13.709)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-blue-400" />
              <span>Criptografia Bancária TLS 256-bit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="h-4 w-4 text-amber-400" />
              <span>Auditoria Imutável & RBAC</span>
            </div>
          </div>
        </div>

        {/* Live Authority Ticker Grid */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm text-center">
            <div className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              +R$ 480M
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans">
              Em causas e patrimônio sob tutela
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm text-center">
            <div className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-400">
              99.9%
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans">
              Pontualidade estrita em prazos
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm text-center">
            <div className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400">
              27 Tribunais
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans">
              Interligados via DataJud em tempo real
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm text-center">
            <div className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400">
              0% de Falha
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans">
              Histórico com 0 perda de prazos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
