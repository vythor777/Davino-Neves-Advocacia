'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Soluções Jurídicas', href: '#solucoes' },
    { label: 'Plataforma Integrada', href: '#plataforma' },
    { label: 'Diferenciais & Compliance', href: '#diferenciais' },
    { label: 'Simulador de ROI', href: '#calculadora' },
    { label: 'Sobre o Escritório', href: '#sobre' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070B14]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40 py-3'
          : 'bg-[#070B14]/60 backdrop-blur-xs border-b border-white/5 py-4'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Monogram */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-px shadow-md shadow-amber-900/20 group-hover:scale-105 transition-transform duration-200">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#070B14]">
              <span className="font-cinzel text-xs font-bold tracking-wider text-amber-300">
                DN
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-cinzel text-sm sm:text-base font-bold tracking-[0.18em] text-white group-hover:text-amber-200 transition-colors">
              DAVINO NEVES
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.24em] text-slate-400 uppercase">
              Advocacia & Controladoria
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Navegação Institucional">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-amber-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800/80 hover:text-white transition shadow-2xs"
          >
            <UserCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>Acessar Plataforma</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400" />
          </Link>

          <a
            href="#contato"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-5 py-2.5 text-xs font-bold tracking-wide text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30 active:scale-98 transition duration-150"
          >
            <span>Agendar Diagnóstico</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-200"
          >
            Entrar
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#070B14]/98 px-4 py-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 hover:text-amber-300 transition"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </a>
            ))}

            <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                <UserCheck className="h-4 w-4 text-blue-400" />
                <span>Acessar Plataforma do Escritório</span>
              </Link>

              <a
                href="#contato"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20"
              >
                <span>Solicitar Diagnóstico Jurídico</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
