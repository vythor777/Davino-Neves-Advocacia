'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Briefcase,
  CalendarClock,
  FileText,
  Calendar,
  Search,
  Sparkles,
  Scale,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Clientes', href: '/clientes', icon: Users },
    { label: 'Processos', href: '/processos', icon: Briefcase },
    { label: 'Prazos', href: '/prazos', icon: CalendarClock },
    { label: 'Documentos', href: '/documentos', icon: FileText },
    { label: 'Agenda', href: '/agenda', icon: Calendar },
    { label: 'DataJud (CNJ)', href: '/datajud', icon: Search },
    { label: 'IA Jurídica', href: '/gemini', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-900 text-amber-100 shadow-sm dark:bg-amber-800">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="font-serif text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Davino & Neves
            </div>
            <div className="text-[11px] font-medium tracking-wider uppercase text-amber-800 dark:text-amber-400">
              Sociedade de Advogados
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 font-semibold shadow-xs dark:bg-amber-950/50 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Header Right / Status */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistema Ativo
          </span>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-100 px-4 py-2 gap-1 dark:border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${
                isActive
                  ? 'bg-amber-100 text-amber-900 font-semibold dark:bg-amber-950 dark:text-amber-300'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

export default Navbar;
