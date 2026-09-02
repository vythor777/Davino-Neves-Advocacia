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
  Menu,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setQuickMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fechar drawer e menus móveis com tecla Escape e travar rolagem quando drawer aberto
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setQuickMenuOpen(false);
        setUserMenuOpen(false);
      }
    }
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileDrawerOpen]);

  // Fechar gavetas e menus ao mudar de rota
  const lastPathnameRef = useRef(pathname);
  useEffect(() => {
    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname;
      setMobileDrawerOpen(false);
      setQuickMenuOpen(false);
      setUserMenuOpen(false);
    }
  }, [pathname]);

  const baseNavItems = [
    { label: 'Painel', href: '/', icon: LayoutDashboard, exact: true },
    { label: 'Processos', href: '/processos', icon: Briefcase },
    { label: 'Prazos', href: '/prazos', icon: CalendarClock },
    { label: 'Clientes', href: '/clientes', icon: Users },
    { label: 'DataJud', href: '/datajud', icon: Search },
    { label: 'IA Jurídica', href: '/gemini', icon: Sparkles },
  ];

  const navItems = isAdmin
    ? [...baseNavItems, { label: 'Equipe', href: '/usuarios', icon: Shield }]
    : baseNavItems;

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/processos?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileSearchQuery.trim()) return;
    setMobileDrawerOpen(false);
    router.push(`/processos?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/95 transition-colors">
      {/* Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {/* Botão Hambúrguer Mobile (Touch Target mínimo 44x44px) */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Abrir menu de navegação"
            aria-expanded={mobileDrawerOpen}
            className="flex lg:hidden h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand - Modern Style Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 transition-all hover:opacity-95 shrink-0 group"
          >
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  Davino Neves
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0">
                  Advocacia
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-xl px-2.5 xl:px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 shadow-xs dark:bg-sky-950/70 dark:text-sky-300 ring-1 ring-sky-200 dark:ring-sky-800/80'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section / Search, Quick Actions & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Global Quick Search (Desktop XL) */}
          <form
            onSubmit={handleGlobalSearch}
            className="hidden xl:flex items-center relative w-48 2xl:w-56"
          >
            <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar processo..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </form>

          {/* Action "+ Novo" Dropdown */}
          <div className="relative" ref={quickMenuRef}>
            <button
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              aria-label="Criar novo registro"
              aria-expanded={quickMenuOpen}
              className="flex min-h-[40px] sm:min-h-[44px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-3 sm:px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-sky-600/20 hover:from-sky-500 hover:to-sky-400 transition active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
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
                    className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-800 dark:text-slate-200 dark:hover:bg-sky-950/60 dark:hover:text-sky-300 transition"
                  >
                    <Briefcase className="h-4 w-4 text-sky-500" />
                    <span>Novo Processo</span>
                  </Link>
                  <Link
                    href="/prazos"
                    onClick={() => setQuickMenuOpen(false)}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-800 dark:text-slate-200 dark:hover:bg-amber-950/60 dark:hover:text-amber-300 transition"
                  >
                    <CalendarClock className="h-4 w-4 text-amber-500" />
                    <span>Novo Prazo / Tarefa</span>
                  </Link>
                  <Link
                    href="/clientes"
                    onClick={() => setQuickMenuOpen(false)}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition"
                  >
                    <UserPlus className="h-4 w-4 text-emerald-500" />
                    <span>Novo Cliente / Contato</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1 dark:border-slate-800" />
                  <Link
                    href="/datajud"
                    onClick={() => setQuickMenuOpen(false)}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 dark:text-slate-200 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition"
                  >
                    <Search className="h-4 w-4 text-indigo-500" />
                    <span>Consultar Tribunal (CNJ)</span>
                  </Link>
                  <Link
                    href="/gemini"
                    onClick={() => setQuickMenuOpen(false)}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-800 dark:text-slate-200 dark:hover:bg-purple-950/60 dark:hover:text-purple-300 transition"
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span>Análise com Google Gemini</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Popover / Dropdown (Consolidado & Responsivo) */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label={`Menu do usuário: ${user.nome}`}
                aria-expanded={userMenuOpen}
                className="flex min-h-[40px] sm:min-h-[44px] items-center gap-2 rounded-xl p-1 sm:px-2 sm:py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80 transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
              >
                <div
                  className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 font-sans font-bold text-xs text-white shadow-xs ring-2 ring-sky-500/20 shrink-0"
                >
                  {user.nome ? user.nome.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </div>

                <div className="hidden xl:flex flex-col text-left max-w-[130px]">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                    {user.nome}
                  </span>
                  <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400 capitalize">
                    {user.role.toLowerCase()}
                  </span>
                </div>

                <ChevronDown className={`hidden sm:block h-3.5 w-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Resumo do Usuário */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-1.5 border border-slate-100 dark:border-slate-800">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 font-bold text-sm text-white">
                      {user.nome ? user.nome.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.nome}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <div className="mt-1">
                        <span className="inline-block rounded-md bg-sky-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex min-h-[40px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-500" />
                      <span>Painel Geral</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/usuarios"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex min-h-[40px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                      >
                        <Shield className="h-4 w-4 text-sky-600" />
                        <span>Equipe & Permissões</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1 dark:border-slate-800" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex min-h-[40px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair com Segurança</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[40px] sm:min-h-[44px] items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-hidden"
            >
              <LogIn className="h-4 w-4" />
              <span>Acessar</span>
            </Link>
          )}
        </div>
      </div>

      {/* Drawer Móvel Acessível e Responsivo */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop com Blur */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Painel Lateral */}
          <div
            className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-50 border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
          >
            {/* Header do Drawer */}
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-xs">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Davino Neves
                  </span>
                  <span className="block text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
                    Advocacia & Controladoria
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Fechar menu"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corpo do Drawer com rolagem suave */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Usuário Ativo no Mobile */}
              {isAuthenticated && user ? (
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 font-bold text-sm text-white">
                      {user.nome ? user.nome.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.nome}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      {user.role}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Busca Expressa no Mobile */}
              <form onSubmit={handleMobileSearch} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Buscar autos ou clientes..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-400 focus:border-sky-500 focus:outline-hidden"
                />
              </form>

              {/* Navegação Principal */}
              <div className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Menu Principal
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-sm dark:bg-sky-500'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 opacity-50 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Ações Rápidas Mobile */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Criar Rapidamente
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/processos"
                    className="flex min-h-[44px] flex-col justify-center rounded-xl border border-sky-200 bg-sky-50/70 p-2.5 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300 transition hover:bg-sky-100"
                  >
                    <Briefcase className="h-4 w-4 mb-1 text-sky-600" />
                    <span className="text-xs font-bold leading-tight">Novo Processo</span>
                  </Link>
                  <Link
                    href="/prazos"
                    className="flex min-h-[44px] flex-col justify-center rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 transition hover:bg-amber-100"
                  >
                    <CalendarClock className="h-4 w-4 mb-1 text-amber-600" />
                    <span className="text-xs font-bold leading-tight">Novo Prazo</span>
                  </Link>
                </div>
              </div>

              {/* Status de Segurança e LGPD */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Ambiente Protegido LGPD</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  Criptografia TLS 256-bit ativa com auditoria de acessos e trilha de eventos.
                </p>
              </div>
            </div>

            {/* Rodapé do Drawer */}
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    logout();
                  }}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair com Segurança</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Acessar o Sistema</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;


