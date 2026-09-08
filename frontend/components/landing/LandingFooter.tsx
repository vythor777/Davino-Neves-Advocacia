'use client';

import React from 'react';
import Link from 'next/link';
import {
  Lock,
  ArrowUp,
  ExternalLink,
} from 'lucide-react';

export function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="sobre" className="bg-[#050811] text-white border-t border-slate-800/80 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand & Monogram (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-px">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#070B14]">
                  <span className="font-cinzel text-xs font-bold text-amber-300">DN</span>
                </div>
              </div>
              <div>
                <span className="font-cinzel text-base font-bold tracking-widest text-white block">
                  DAVINO NEVES
                </span>
                <span className="text-[10px] font-medium tracking-widest uppercase text-slate-400 block">
                  Advocacia & Controladoria Jurídica
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-light max-w-md">
              Sociedade de advogados focada na defesa de interesses corporativos de alta complexidade, combinando rigor técnico tradicional e ferramentas tecnológicas de última geração integradas ao Poder Judiciário.
            </p>

            <div className="pt-2 text-[11px] text-slate-400 space-y-1 font-mono">
              <div>OAB/SP Sociedade de Advogados nº 45.892/2012</div>
              <div>CNPJ: 45.892.120/0001-34</div>
            </div>
          </div>

          {/* Col 2: Soluções Jurídicas (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300">
              Áreas de Atuação
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#solucoes" className="hover:text-white transition">Contencioso Estratégico & Arbitragem</a>
              </li>
              <li>
                <a href="#solucoes" className="hover:text-white transition">Direito Tributário & Recuperação Fiscal</a>
              </li>
              <li>
                <a href="#solucoes" className="hover:text-white transition">M&A, Due Diligence & Societário</a>
              </li>
              <li>
                <a href="#solucoes" className="hover:text-white transition">Proteção de Dados (LGPD) & Digital</a>
              </li>
              <li>
                <a href="#solucoes" className="hover:text-white transition">Recuperação de Ativos & Sisbajud</a>
              </li>
              <li>
                <a href="#solucoes" className="hover:text-white transition">Legal Operations As a Service</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Plataforma & Ferramentas (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-blue-400">
              Plataforma
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-white transition flex items-center gap-1">
                  <span>Painel do Escritório</span>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link href="/datajud" className="hover:text-white transition flex items-center gap-1">
                  <span>DataJud CNJ</span>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link href="/gemini" className="hover:text-white transition flex items-center gap-1">
                  <span>IA Jurídica Gemini</span>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link href="/processos" className="hover:text-white transition">
                  Gestão de Autos
                </Link>
              </li>
              <li>
                <Link href="/prazos" className="hover:text-white transition">
                  Prazos & Agenda
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Endereços & Contato (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-slate-300">
              Sedes Físicas
            </h4>
            <div className="text-xs text-slate-400 space-y-3">
              <div>
                <strong className="text-white block font-medium">São Paulo (Matriz)</strong>
                <span>Av. Paulista, 1482 - Torre Norte, 14º andar - Bela Vista</span>
              </div>
              <div>
                <strong className="text-white block font-medium">Brasília (Representação)</strong>
                <span>Setor Bancário Sul, Q. 02, Ed. Prime Business</span>
              </div>
              <div className="pt-1 font-mono text-[11px] text-amber-300">
                (11) 3450-8900
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Compliance & Back to Top */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span>© {new Date().getFullYear()} Davino Neves Advocacia. Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[11px] text-slate-400">
              Termos de Uso • Política de Privacidade LGPD • Código de Conduta
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition p-1"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="h-4 w-4" />
              <span>Topo</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
