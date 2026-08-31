'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Briefcase,
  CalendarClock,
  Search,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Shield,
  FileText,
} from 'lucide-react';

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user, isAdmin } = useAuth();

  const modules = [
    {
      title: 'Gestão de Clientes',
      description: 'Cadastro de pessoas físicas e jurídicas, documentos de identificação e vínculos processuais.',
      href: '/clientes',
      icon: Users,
      badge: 'Ativo',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
    },
    {
      title: 'Controle de Processos',
      description: 'Acompanhamento de autos, distribuição, varas e histórico processual unificado.',
      href: '/processos',
      icon: Briefcase,
      badge: 'Integrado',
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300',
    },
    {
      title: 'Prazos Processuais',
      description: 'Gestão de termos fatais, contagem de prazos CPC/CLT e alertas de vencimento.',
      href: '/prazos',
      icon: CalendarClock,
      badge: 'Prioritário',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300',
    },
    {
      title: 'Consulta DataJud CNJ',
      description: 'Integração direta com tribunais de todo o país para busca e sincronização de andamentos.',
      href: '/datajud',
      icon: Search,
      badge: 'Público CNJ',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300',
    },
    {
      title: 'Inteligência Artificial Jurídica',
      description: 'Análise de petições e contratos, resumos executivos e extração de prazos com Gemini 3.7.',
      href: '/gemini',
      icon: Sparkles,
      badge: 'Gemini AI',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300',
    },
    {
      title: 'Equipe & Usuários (RBAC)',
      description: 'Controle de acessos e permissões por perfil (Administrador, Advogado, Estagiário).',
      href: '/usuarios',
      icon: Shield,
      badge: isAdmin ? 'Admin' : 'Restrito',
      badgeColor: isAdmin
        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Banner de Boas-Vindas */}
        <div className="rounded-2xl border border-amber-900/20 bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 p-8 text-amber-50 shadow-md">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-800/60 px-3 py-1 text-xs font-semibold tracking-wide text-amber-200 border border-amber-700/50">
                <ShieldCheck className="h-3.5 w-3.5" />
                {user ? `Sessão Ativa: ${user.nome} (${user.role})` : 'Davino & Neves Advocacia'}
              </div>
              <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Sistema Web de Gestão Jurídica
              </h1>
              <p className="mt-2 text-sm text-amber-100/80 sm:text-base leading-relaxed">
                Plataforma integrada de controladoria jurídica, gestão de clientes, processos judiciais, prazos processuais e IA generativa integrada ao CNJ.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/processos"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-400 active:scale-95"
              >
                <Briefcase className="h-4 w-4" />
                Acessar Processos
              </Link>

              <Link
                href="/prazos"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-900/80 border border-amber-600/40 px-4 py-3 text-sm font-semibold text-amber-100 shadow-sm transition hover:bg-amber-800 active:scale-95"
              >
                <CalendarClock className="h-4 w-4" />
                Agenda de Prazos
              </Link>
            </div>
          </div>
        </div>

        {/* Grid de Módulos */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
                Módulos do Sistema
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acesse as ferramentas e bases de dados do escritório.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={idx}
                  href={mod.href}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-amber-700/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-700/60"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-900 transition group-hover:bg-amber-900 group-hover:text-amber-50 dark:bg-amber-950/70 dark:text-amber-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 font-serif text-lg font-bold text-slate-900 group-hover:text-amber-900 dark:text-slate-100 dark:group-hover:text-amber-300">
                      {mod.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-amber-800 dark:border-slate-800 dark:text-amber-400">
                    <span>Acessar funcionalidade</span>
                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer sóbrio */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Davino & Neves Advocacia © 2026. Todos os direitos reservados.</span>
          <span>Plataforma Web de Controladoria e Gestão Jurídica</span>
        </div>
      </footer>
    </div>
  );
}
