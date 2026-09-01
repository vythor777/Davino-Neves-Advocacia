'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Briefcase,
  CalendarClock,
  Search,
  Sparkles,
  Scale,
  Shield,
  LogOut,
  LogIn,
  User,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const baseNavItems = [
    { label: 'Clientes', href: '/clientes', icon: Users },
    { label: 'Processos', href: '/processos', icon: Briefcase },
    { label: 'Prazos', href: '/prazos', icon: CalendarClock },
    { label: 'DataJud (CNJ)', href: '/datajud', icon: Search },
    { label: 'IA Jurídica', href: '/gemini', icon: Sparkles },
  ];

  // Adiciona a rota de Usuários exclusivamente para administradores
  const navItems = isAdmin
    ? [...baseNavItems, { label: 'Equipe', href: '/usuarios', icon: Shield }]
    : baseNavItems;

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'Admin';
      case 'ADVOGADO':
        return 'Advogado';
      case 'ESTAGIARIO':
        return 'Estagiário';
      default:
        return 'Membro';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-900 text-amber-100 shadow-sm dark:bg-amber-800">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="font-serif text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Davino Neves
            </div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-amber-800 dark:text-amber-400">
              Sociedade de Advogados
            </div>
          </div>
        </Link>

        {/* Navigation Items (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 shadow-xs dark:bg-amber-950/60 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Header Right / Auth Area */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  {user.nome}
                </span>
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                  {getRoleLabel(user.role)} • Davino & Neves
                </span>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 font-serif font-bold text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800">
                {user.nome ? user.nome.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>

              <button
                onClick={logout}
                title="Sair do sistema"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 transition"
            >
              <LogIn className="h-4 w-4" />
              <span>Acessar Painel</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-100 px-4 py-2 gap-1 dark:border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                isActive
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
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
