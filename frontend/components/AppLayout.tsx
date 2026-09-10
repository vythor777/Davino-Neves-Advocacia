'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  Briefcase,
  CalendarClock,
  Users,
  Search,
  Sparkles,
  Shield,
  Scale,
  Bell,
  ChevronDown,
  LogOut,
  X,
  Menu,
  CheckCircle2,
  Clock,
  Settings,
  CircleDollarSign,
  AlertCircle,
  CheckCheck,
  RefreshCw,
  PartyPopper,
  Calendar,
} from 'lucide-react';
import { notificacaoService, ResumoNotificacoes, ItemNotificacao } from '@/services/notificacaoService';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Notificações Reais do Escritório
  const [notificacoesData, setNotificacoesData] = useState<ResumoNotificacoes>({
    totalNaoLidas: 0,
    total: 0,
    notificacoes: [],
  });
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(false);

  const carregarNotificacoes = async () => {
    try {
      setLoadingNotificacoes(true);
      const data = await notificacaoService.getNotificacoes();
      setNotificacoesData(data);
    } catch (err) {
      console.warn('[AppLayout] Erro ao carregar notificações reais:', err);
    } finally {
      setLoadingNotificacoes(false);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
    // Atualizar a cada 45 segundos para refletir prazos e eventos reais
    const interval = setInterval(carregarNotificacoes, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleMarcarComoLida = (item: ItemNotificacao) => {
    notificacaoService.marcarComoLida(item.id);
    setNotificacoesData((prev) => {
      const updated = prev.notificacoes.map((n) => (n.id === item.id ? { ...n, lida: true } : n));
      const naoLidas = updated.filter((n) => !n.lida).length;
      return {
        ...prev,
        totalNaoLidas: naoLidas,
        notificacoes: updated,
      };
    });
    setNotificationsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  const handleMarcarTodasLidas = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ids = notificacoesData.notificacoes.map((n) => n.id);
    notificacaoService.marcarTodasComoLidas(ids);
    setNotificacoesData((prev) => ({
      ...prev,
      totalNaoLidas: 0,
      notificacoes: prev.notificacoes.map((n) => ({ ...n, lida: true })),
    }));
  };

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
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
      setNotificationsOpen(false);
      setUserDropdownOpen(false);
    }
  }, [pathname]);

  const navLinks = [
    { label: 'Painel', href: '/', icon: LayoutDashboard, exact: true },
    { label: 'Processos', href: '/processos', icon: Briefcase },
    { label: 'Prazos & Agenda', href: '/prazos', icon: CalendarClock },
    { label: 'Clientes', href: '/clientes', icon: Users },
    { label: 'Financeiro', href: '/financeiro', icon: CircleDollarSign },
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
    <div className="flex h-screen overflow-hidden bg-[#f6f8fa] dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      {/* Sidebar Esquerda (Fixa, w-64 border-r border-[0.75px] border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0d1117]/85 backdrop-blur-xl flex flex-col justify-between p-4) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-[0.75px] border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0d1117]/85 backdrop-blur-xl p-4 select-none z-30 transition-colors">
        {/* Topo da Sidebar */}
        <div className="flex flex-col">
          {/* Logotipo estilizado do escritório 'Davino Neves Advocacia' */}
          <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-95">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#161b22] text-[#dfcaa0] border border-[0.75px] border-[#c5a059]/30 shadow-xs ring-1 ring-[#c5a059]/20 group-hover:scale-105 transition-transform">
              <Scale className="h-5 w-5 stroke-[1.25] text-[#dfcaa0]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                  Davino Neves
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-[#c5a059] dark:text-[#dfcaa0] block">
                Advocacia
              </span>
            </div>
          </Link>

          {/* Badge discreto de segurança (TLS 256-bit) */}
          <div className="mt-4 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-[#161b22]/70 border border-[0.75px] border-slate-200/70 dark:border-white/[0.08] text-[10px] transition-colors">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Shield className="h-3 w-3 stroke-[1.25] text-[#c5a059] dark:text-[#dfcaa0]" />
              <span>Ambiente Seguro</span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-200/60 dark:bg-white/[0.05] px-1.5 py-0.5 rounded border border-[0.75px] border-slate-300/60 dark:border-white/[0.08] text-[9px] tabular-nums">
              <span className="h-1 w-1 rounded-full bg-[#c5a059]" />
              TLS 256-bit
            </span>
          </div>

          {/* Centro (Navegação): Links verticais em lista com ícones minimalistas */}
          <nav className="mt-6 space-y-1" aria-label="Navegação Lateral Principal">
            <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                  className={`group flex items-center gap-3 px-3 py-2.5 text-xs transition-all duration-150 rounded-xl ${
                    isActive
                      ? 'bg-slate-200/70 dark:bg-white/[0.06] text-slate-950 dark:text-[#f0f6fc] border-l-2 border-[#c5a059] font-medium shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.03] border-l-2 border-transparent font-normal'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 stroke-[1.25] transition-colors ${
                      isActive ? 'text-[#c5a059] dark:text-[#dfcaa0]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="flex flex-col gap-3 pt-4 transition-colors">
          {/* Card do usuário logado com dropdown de configurações */}
          <div className="relative" ref={userDropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-[0.75px] border-slate-200/70 dark:border-white/[0.08] bg-white/70 dark:bg-[#161b22]/70 p-2.5 text-left hover:bg-slate-50 dark:hover:bg-[#1f2631] hover:border-slate-300 dark:hover:border-white/[0.15] transition-colors cursor-pointer group shadow-2xs"
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#161b22] border border-[0.75px] border-[#c5a059]/30 text-xs font-semibold text-[#dfcaa0] shadow-2xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-slate-950 dark:group-hover:text-white">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {displayRole}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 stroke-[1.25] text-slate-400 transition-transform duration-150 shrink-0 ${
                  userDropdownOpen ? 'rotate-180 text-[#dfcaa0]' : ''
                }`}
              />
            </button>

            {/* Dropdown de Configurações do Usuário */}
            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-[0.75px] border-slate-200 dark:border-white/[0.1] bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-2.5 py-1.5 border-b border-[0.75px] border-slate-100 dark:border-white/[0.08] text-[10px] text-slate-500 dark:text-slate-400">
                  Conectado como <strong className="text-slate-900 dark:text-slate-200">{displayName}</strong>
                </div>
                <div className="mt-1 space-y-0.5">
                  <Link
                    href="/usuarios"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <Settings className="h-3.5 w-3.5 stroke-[1.25] text-slate-400" />
                    <span>Configurações & Equipe</span>
                  </Link>
                  <Link
                    href="/datajud"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <Scale className="h-3.5 w-3.5 stroke-[1.25] text-[#dfcaa0]" />
                    <span>Status de Conexão CNJ</span>
                  </Link>
                  <div className="border-t border-[0.75px] border-slate-100 dark:border-white/[0.08] my-1" />
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
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 transition cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5 stroke-[1.25]" />
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
          <div className="fixed inset-y-0 left-0 w-72 bg-white/95 dark:bg-[#0d1117]/95 border-r border-[0.75px] border-slate-200/80 dark:border-white/[0.08] p-4 flex flex-col justify-between z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[0.75px] border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#161b22] text-[#dfcaa0] border border-[0.75px] border-[#c5a059]/30 shadow-xs">
                    <Scale className="h-4 w-4 stroke-[1.25] text-[#dfcaa0]" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block">Davino Neves</span>
                    <span className="text-[10px] font-semibold tracking-widest text-[#c5a059] dark:text-[#dfcaa0] uppercase">Advocacia</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition"
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5 stroke-[1.25]" />
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
                          ? 'bg-slate-200/70 dark:bg-white/[0.06] text-slate-950 dark:text-white border-l-2 border-[#c5a059] font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <Icon className={`h-4 w-4 stroke-[1.25] ${isActive ? 'text-[#c5a059] dark:text-[#dfcaa0]' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tema do App</span>
                <ThemeToggle variant="segmented" />
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-[#161b22]/70 border border-[0.75px] border-slate-200/70 dark:border-white/[0.08]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#161b22] border border-[0.75px] border-[#c5a059]/30 font-semibold text-xs text-[#dfcaa0]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{displayRole}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  logout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4 stroke-[1.25]" />
                <span>Sair com Segurança</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Área Principal de Conteúdo */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Header Superior Responsivo */}
        <header className="h-14 sm:h-16 shrink-0 border-b border-[0.75px] border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 z-20 transition-colors">
          {/* Lado Esquerdo: Botão Mobile + Busca Global Expansível com Atalho Ctrl + K */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Hambúrguer Mobile */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[0.75px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b22]/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition shrink-0 cursor-pointer shadow-2xs"
              aria-label="Abrir menu de navegação lateral"
            >
              <Menu className="h-4 w-4 stroke-[1.25]" />
            </button>

            {/* Busca Global Expansível */}
            <form onSubmit={handleGlobalSearch} className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 stroke-[1.25] text-slate-400 dark:text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar processos, clientes, prazos..."
                className="w-full rounded-xl border border-[0.75px] border-slate-200 dark:border-white/[0.08] bg-slate-100/80 dark:bg-[#161b22]/70 pl-9 pr-14 sm:pr-18 py-1.5 sm:py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#c5a059]/60 focus:bg-white dark:focus:bg-[#161b22] focus:outline-hidden focus:ring-1 focus:ring-[#c5a059]/20 transition shadow-2xs"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[0.75px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b22] px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
                  <span>Ctrl</span>
                  <span>+</span>
                  <span>K</span>
                </kbd>
              </div>
            </form>
          </div>

          {/* Lado Direito: Alternador de Tema, Notificações e Botão de Ação Rápida */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Alternador de Tema Inteligente (Light/Dark/Auto) */}
            <ThemeToggle variant="dropdown" />

            {/* Botão Rápido de Notificações com Dados Reais */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen) carregarNotificacoes();
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[0.75px] border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#161b22]/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1f2631] transition cursor-pointer shadow-2xs"
                title="Notificações corporativas"
                aria-label="Notificações corporativas"
                aria-expanded={notificationsOpen}
              >
                <Bell className="h-4 w-4 stroke-[1.25]" />
                {notificacoesData.totalNaoLidas > 0 && (
                  <span className="absolute -top-1 -right-1 flex min-w-[16px] h-4 px-1 items-center justify-center rounded-full bg-[#161b22] border border-[0.75px] border-[#c5a059]/40 text-[9px] font-semibold text-[#dfcaa0] tabular-nums ring-2 ring-white dark:ring-[#0d1117]">
                    {notificacoesData.totalNaoLidas > 9 ? '9+' : notificacoesData.totalNaoLidas}
                  </span>
                )}
              </button>

              {/* Popover de Notificações com Dados Reais */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl border border-[0.75px] border-slate-200 dark:border-white/[0.1] bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[0.75px] border-slate-100 dark:border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">Alertas do Escritório</span>
                      {notificacoesData.totalNaoLidas > 0 ? (
                        <span className="text-[10px] font-medium text-[#c5a059] dark:text-[#dfcaa0] bg-[#c5a059]/10 dark:bg-[#c5a059]/20 px-1.5 py-0.5 rounded-md tabular-nums">
                          {notificacoesData.totalNaoLidas} pendente{notificacoesData.totalNaoLidas > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                          Em dia
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {notificacoesData.totalNaoLidas > 0 && (
                        <button
                          type="button"
                          onClick={handleMarcarTodasLidas}
                          className="flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] px-1.5 py-0.5 rounded transition cursor-pointer"
                          title="Marcar todas como lidas"
                        >
                          <CheckCheck className="h-3 w-3 stroke-[1.5]" />
                          <span>Lidas</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={carregarNotificacoes}
                        disabled={loadingNotificacoes}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded transition cursor-pointer"
                        title="Atualizar alertas"
                      >
                        <RefreshCw className={`h-3 w-3 stroke-[1.5] ${loadingNotificacoes ? 'animate-spin text-[#c5a059]' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Lista de Alertas Reais */}
                  <div className="mt-2 max-h-80 overflow-y-auto space-y-2 pr-0.5">
                    {loadingNotificacoes && notificacoesData.notificacoes.length === 0 ? (
                      <div className="space-y-2 py-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.04] p-3 space-y-1.5">
                            <div className="h-3 w-28 bg-slate-200 dark:bg-white/[0.08] rounded" />
                            <div className="h-2.5 w-full bg-slate-200 dark:bg-white/[0.08] rounded" />
                          </div>
                        ))}
                      </div>
                    ) : notificacoesData.notificacoes.length === 0 ? (
                      <div className="py-6 text-center px-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 stroke-[1.25]" />
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Tudo em dia!</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Nenhum prazo vencendo hoje ou pendência urgente no momento.
                        </p>
                      </div>
                    ) : (
                      notificacoesData.notificacoes.map((item) => {
                        const isAlta = item.urgencia === 'alta';
                        const isMedia = item.urgencia === 'media';

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleMarcarComoLida(item)}
                            className={`group rounded-xl border p-2.5 text-xs transition cursor-pointer ${
                              item.lida ? 'opacity-60 bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/[0.05]' : ''
                            } ${
                              !item.lida && isAlta
                                ? 'border-rose-500/25 bg-rose-500/5 dark:bg-rose-500/10 hover:border-rose-500/40'
                                : !item.lida && isMedia
                                ? 'border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 hover:border-amber-500/40'
                                : !item.lida
                                ? 'border-slate-300/50 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] hover:border-slate-400/60 dark:hover:border-white/[0.15]'
                                : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5 shrink-0">
                                {item.tipo === 'prazo' && (
                                  isAlta ? (
                                    <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 stroke-[1.5]" />
                                  ) : (
                                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 stroke-[1.5]" />
                                  )
                                )}
                                {item.tipo === 'financeiro' && (
                                  <CircleDollarSign className={`h-3.5 w-3.5 stroke-[1.5] ${isAlta ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                                )}
                                {item.tipo === 'agenda' && (
                                  <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 stroke-[1.5]" />
                                )}
                                {item.tipo === 'aniversario' && (
                                  <PartyPopper className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 stroke-[1.5]" />
                                )}
                                {(item.tipo === 'sistema' || item.tipo === 'processo') && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[#dfcaa0] stroke-[1.5]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`font-medium truncate ${
                                    isAlta
                                      ? 'text-rose-900 dark:text-rose-300'
                                      : isMedia
                                      ? 'text-amber-900 dark:text-amber-300'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}>
                                    {item.titulo}
                                  </span>
                                  {!item.lida && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059] shrink-0" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {item.descricao}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-[0.75px] border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-[11px]">
                    <Link
                      href="/prazos"
                      onClick={() => setNotificationsOpen(false)}
                      className="font-medium text-[#c5a059] dark:text-[#dfcaa0] hover:underline transition"
                    >
                      Prazos & Agenda &rarr;
                    </Link>
                    <Link
                      href="/financeiro"
                      onClick={() => setNotificationsOpen(false)}
                      className="font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:underline transition"
                    >
                      Financeiro &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo Rolável da Página */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#f6f8fa] dark:bg-[#0d1117] transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

