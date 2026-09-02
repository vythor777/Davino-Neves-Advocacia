'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  CalendarClock,
  Users,
  Search,
  Sparkles,
  Shield,
  Scale,
  Plus,
  Bell,
  ChevronDown,
  LogOut,
  X,
  Menu,
  CheckCircle2,
  Clock,
  UserPlus,
  Settings,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const quickMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (quickMenuRef.current && !quickMenuRef.current.contains(target)) {
        setQuickMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global shortcut Ctrl + K / Cmd + K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setQuickMenuOpen(false);
        setNotificationsOpen(false);
        setUserDropdownOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close drawer and menus on path change
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setMobileDrawerOpen(false);
      setQuickMenuOpen(false);
      setNotificationsOpen(false);
      setUserDropdownOpen(false);
    }
  }, [pathname]);

  const navLinks = [
    { label: 'Painel', href: '/', icon: LayoutDashboard, exact: true },
    { label: 'Processos', href: '/processos', icon: Briefcase },
    { label: 'Prazos & Agenda', href: '/prazos', icon: CalendarClock },
    { label: 'Clientes', href: '/clientes', icon: Users },
    { label: 'DataJud CNJ', href: '/datajud', icon: Scale },
    { label: 'IA Jurídica', href: '/gemini', icon: Sparkles },
    { label: 'Equipe', href: '/usuarios', icon: Shield },
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/processos?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const displayName = user?.nome || 'Vythor';
  const displayRole =
    user?.role === 'ADMINISTRADOR'
      ? 'Administrador'
      : user?.role === 'ADVOGADO'
      ? 'Advogado'
      : user?.role === 'ESTAGIARIO'
      ? 'Estagiário'
      : 'Administrador';

  // Ocultar Sidebar e Header na tela de autenticação
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0F17] text-slate-100 font-sans antialiased">
      {/* Sidebar Esquerda (Fixa, w-64 border-r border-slate-800/60 bg-[#0F172A]/70 backdrop-blur-xl flex flex-col justify-between p-4) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-slate-800/60 bg-[#0F172A]/70 backdrop-blur-xl p-4 select-none z-30">
        {/* Topo da Sidebar */}
        <div className="flex flex-col">
          {/* Logotipo estilizado do escritório 'Davino Neves Advocacia' */}
          <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-95">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-md shadow-blue-600/25 ring-1 ring-blue-500/30 group-hover:scale-105 transition-transform">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-sm font-bold tracking-tight text-white truncate">
                  Davino Neves
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-400/90 block">
                Advocacia
              </span>
            </div>
          </Link>

          {/* Badge discreto de segurança (TLS 256-bit) */}
          <div className="mt-4 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span>Ambiente Seguro</span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono font-medium text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[9px]">
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              TLS 256-bit
            </span>
          </div>

          {/* Centro (Navegação): Links verticais em lista com ícones elegantes */}
          <nav className="mt-6 space-y-1" aria-label="Navegação Lateral Principal">
            <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Menu Principal
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 text-xs transition-all duration-150 rounded-r-xl ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 font-medium shadow-2xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-2 border-transparent font-normal'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/60">
          {/* Card compacto de status da integração ('DataJud CNJ 100% Operacional' com ponto verde pulsante) */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-slate-200">DataJud CNJ</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/30">
                100% Operacional
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 leading-tight">
              Sincronização ativa com tribunais
            </p>
          </div>

          {/* Card do usuário logado ('Vythor - Administrador') com dropdown de configurações */}
          <div className="relative" ref={userDropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 text-left hover:bg-slate-800/60 hover:border-slate-700/80 transition-colors cursor-pointer group"
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-bold text-white shadow-2xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {displayRole}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-150 shrink-0 ${
                  userDropdownOpen ? 'rotate-180 text-blue-400' : ''
                }`}
              />
            </button>

            {/* Dropdown de Configurações do Usuário */}
            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-2.5 py-1.5 border-b border-slate-800/80 text-[10px] text-slate-400">
                  Conectado como <strong className="text-slate-200">{displayName}</strong>
                </div>
                <div className="mt-1 space-y-0.5">
                  <Link
                    href="/usuarios"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    <span>Configurações & Equipe</span>
                  </Link>
                  <Link
                    href="/datajud"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Scale className="h-3.5 w-3.5 text-blue-400" />
                    <span>Status de Conexão CNJ</span>
                  </Link>
                  <div className="border-t border-slate-800/80 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (isAuthenticated) {
                        logout();
                      } else {
                        router.push('/login');
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sair com Segurança</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Drawer Mobile (quando tela < lg) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#0F172A] border-r border-slate-800 p-4 flex flex-col justify-between z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-serif text-sm font-bold text-white block">Davino Neves</span>
                    <span className="text-[10px] font-semibold text-blue-400 uppercase">Advocacia</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500 font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{displayRole}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  logout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/30 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-900/40 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair com Segurança</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Área Principal de Conteúdo (flex-1 overflow-y-auto) */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Header Superior Limpo: Barra superior mínima contendo apenas a busca global expansível com atalho visual Ctrl + K, botão rápido de notificações e o botão de ação rápida + Novo */}
        <header className="h-14 sm:h-16 shrink-0 border-b border-slate-800/60 bg-[#0F172A]/40 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 z-20">
          {/* Lado Esquerdo: Botão Mobile + Busca Global Expansível com Atalho Ctrl + K */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Hambúrguer Mobile */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition shrink-0"
              aria-label="Abrir menu de navegação lateral"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Busca Global Expansível */}
            <form onSubmit={handleGlobalSearch} className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar processos, clientes, prazos..."
                className="w-full rounded-xl border border-slate-800/80 bg-slate-900/80 pl-9 pr-14 sm:pr-18 py-1.5 sm:py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500/40 transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-700/70 bg-slate-800/70 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
                  <span>Ctrl</span>
                  <span>+</span>
                  <span>K</span>
                </kbd>
              </div>
            </form>
          </div>

          {/* Lado Direito: Botão Rápido de Notificações e Botão de Ação Rápida + Novo */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Botão Rápido de Notificações */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800/80 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition cursor-pointer"
                title="Notificações corporativas"
                aria-label="Notificações corporativas"
                aria-expanded={notificationsOpen}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-2 ring-[#0B0F17]">
                  2
                </span>
              </button>

              {/* Popover de Notificações */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">Alertas do Escritório</span>
                    <span className="text-[10px] font-medium text-blue-400">2 pendentes</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>Prazo Fatal TJSP</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-300">
                        Contestação do Processo 0001234-56.2024 vence hoje às 18h.
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>DataJud Sincronizado</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-300">
                        92 tribunais monitorados e atualizados com sucesso.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/prazos"
                    onClick={() => setNotificationsOpen(false)}
                    className="mt-3 block text-center text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition"
                  >
                    Ver todos os prazos e compromissos &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Botão de Ação Rápida + Novo */}
            <div className="relative" ref={quickMenuRef}>
              <button
                type="button"
                onClick={() => setQuickMenuOpen(!quickMenuOpen)}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition active:scale-95 cursor-pointer"
                aria-expanded={quickMenuOpen}
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Novo</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${quickMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown de Ação Rápida */}
              {quickMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Cadastros Rápidos
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      href="/processos"
                      onClick={() => setQuickMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-blue-600/10 hover:text-blue-400 transition"
                    >
                      <Briefcase className="h-4 w-4 text-blue-400" />
                      <span>Novo Processo</span>
                    </Link>
                    <Link
                      href="/prazos"
                      onClick={() => setQuickMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-amber-600/10 hover:text-amber-400 transition"
                    >
                      <CalendarClock className="h-4 w-4 text-amber-400" />
                      <span>Novo Prazo / Audiência</span>
                    </Link>
                    <Link
                      href="/clientes"
                      onClick={() => setQuickMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-emerald-600/10 hover:text-emerald-400 transition"
                    >
                      <UserPlus className="h-4 w-4 text-emerald-400" />
                      <span>Novo Cliente</span>
                    </Link>
                    <div className="border-t border-slate-800 my-1" />
                    <Link
                      href="/datajud"
                      onClick={() => setQuickMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-600/10 hover:text-indigo-400 transition"
                    >
                      <Scale className="h-4 w-4 text-indigo-400" />
                      <span>Consultar Tribunal (CNJ)</span>
                    </Link>
                    <Link
                      href="/gemini"
                      onClick={() => setQuickMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-purple-600/10 hover:text-purple-400 transition"
                    >
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>IA Jurídica</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo Rolável da Página */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#0B0F17]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
