'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
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
  Plus,
  ChevronDown,
  UserPlus,
  X,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const quickMenuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown de criação rápida ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setQuickMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseNavItems = [
    { label: 'Painel', href: '/', icon: LayoutDashboard, exact: true },
    { label: 'Processos', href: '/processos', icon: Briefcase },
    { label: 'Prazos & Tarefas', href: '/prazos', icon: CalendarClock },
    { label: 'Clientes', href: '/clientes', icon: Users },
    { label: 'DataJud CNJ', href: '/datajud', icon: Search, badge: 'Live' },
    { label: 'IA Jurídica', href: '/gemini', icon: Sparkles, badge: 'Gemini' },
  ];

  const navItems = isAdmin
    ? [...baseNavItems, { label: 'Equipe', href: '/usuarios', icon: Shield }]
    : baseNavItems;

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/processos?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/95 transition-colors">
        {/* Top Banner Ribbon */}
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-1 text-[11px] text-slate-500 dark:border-slate-800/60 dark:bg-slate-950/60 dark:text-slate-400 hidden sm:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Sincronização DataJud CNJ: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">Online (91 Tribunais)</strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="hidden md:inline text-slate-500">
                Davino Neves Advocacia
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:inline font-mono text-[10px] text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                Davino Neves Advocacia
              </span>
              <Link
                href="/gemini"
                className="flex items-center gap-1 font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
              >
                <Sparkles className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                <span>Google Gemini Ativo</span>
              </Link>
            </div>
          </div>
        </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand - Modern Style Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-all hover:opacity-95 shrink-0 group"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Scale className="h-5 w-5 text-white" />
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Davino Neves
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Advocacia
              </span>
            </div>
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
              Controladoria Jurídica & Processos
            </div>
          </div>
        </Link>

        {/* Global Quick Search (Astrea Style) */}
        <form
          onSubmit={handleGlobalSearch}
          className="hidden md:flex flex-1 max-w-xs xl:max-w-sm items-center relative"
        >
          <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar processo, cliente ou prazo..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* Navigation Items (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 shadow-xs dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-200 dark:ring-sky-800/80'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold tracking-wide uppercase ${
                    isActive
                      ? 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section / Quick Actions & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Action "+ Novo" Dropdown */}
          <div className="relative" ref={quickMenuRef}>
            <button
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-sky-600/20 hover:from-sky-500 hover:to-sky-400 transition active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Novo</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${quickMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {quickMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Ações Rápidas
                </div>
                <div className="space-y-1">
                  <Link
                    href="/processos"
                    onClick={() => setQuickMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-800 dark:text-slate-200 dark:hover:bg-sky-950/60 dark:hover:text-sky-300 transition"
                  >
                    <Briefcase className="h-4 w-4 text-sky-500" />
                    <span>Novo Processo</span>
                  </Link>
                  <Link
                    href="/prazos"
                    onClick={() => setQuickMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-800 dark:text-slate-200 dark:hover:bg-amber-950/60 dark:hover:text-amber-300 transition"
                  >
                    <CalendarClock className="h-4 w-4 text-amber-500" />
                    <span>Novo Prazo / Tarefa</span>
                  </Link>
                  <Link
                    href="/clientes"
                    onClick={() => setQuickMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition"
                  >
                    <UserPlus className="h-4 w-4 text-emerald-500" />
                    <span>Novo Cliente / Contato</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1 dark:border-slate-800" />
                  <Link
                    href="/datajud"
                    onClick={() => setQuickMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 dark:text-slate-200 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition"
                  >
                    <Search className="h-4 w-4 text-indigo-500" />
                    <span>Consultar Tribunal (CNJ)</span>
                  </Link>
                  <Link
                    href="/gemini"
                    onClick={() => setQuickMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-800 dark:text-slate-200 dark:hover:bg-purple-950/60 dark:hover:text-purple-300 transition"
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span>Análise com Google Gemini</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {user.nome}
                </span>
                <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400">
                  {user.role}
                </span>
              </div>

              <div
                title={`${user.nome} (${user.role})`}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 font-sans font-bold text-xs text-white shadow-xs ring-2 ring-sky-500/20"
              >
                {user.nome ? user.nome.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>

              <button
                onClick={logout}
                title="Sair com segurança"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
            >
              <LogIn className="h-4 w-4" />
              <span>Acessar</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Scrollbar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-100 px-3 py-2 gap-1.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? 'bg-sky-600 text-white dark:bg-sky-500 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
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

