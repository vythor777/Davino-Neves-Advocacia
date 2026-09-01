'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  Building2,
  Phone,
  Mail,
  Scale,
  Sparkles,
} from 'lucide-react';

export function InstitutionalFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors">
      {/* Top Banner de Confiança & Segurança */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>Conformidade LGPD (Lei 13.709/2018)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Criptografia TLS 256-bit Ponta a Ponta</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-slate-500">
                <FileCheck className="h-3.5 w-3.5 text-indigo-500" />
                <span>Auditoria e Logs de Acesso RBAC</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                DataJud CNJ 100% Operacional
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Corpo Institucional Principal */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          {/* Coluna 1: Identidade */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 text-white shadow-xs font-bold font-mono text-sm">
                DN
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white tracking-tight">
                  Davino Neves
                </h4>
                <p className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold">
                  Advocacia & Controladoria Jurídica
                </p>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Sociedade de advogados voltada à excelência em contencioso estratégico, controladoria de prazos processuais e integração direta aos tribunais.
            </p>
          </div>

          {/* Coluna 2: Dados Oficiais e OAB */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Registros Oficiais
            </h5>
            <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>OAB/SP • Sociedade de Advogados</span>
              </li>
              <li className="font-mono">
                CNPJ: 45.892.120/0001-34
              </li>
              <li className="flex items-start gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Av. Paulista, 1842 - Torre Norte, 14º andar - Bela Vista, São Paulo/SP</span>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento e Plantão */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Plantão & Atendimento
            </h5>
            <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>(11) 3450-8900 / (11) 98877-0022</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>contato@davinoneves.com.br</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>DPO / LGPD: dpo@davinoneves.com.br</span>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Módulos Rápidos */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Acesso Rápido
            </h5>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <Link href="/processos" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                Processos
              </Link>
              <Link href="/prazos" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                Prazos Fatais
              </Link>
              <Link href="/clientes" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                Clientes
              </Link>
              <Link href="/datajud" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                DataJud CNJ
              </Link>
              <Link href="/gemini" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-purple-500" />
                <span>IA Gemini</span>
              </Link>
              <Link href="/usuarios" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                Equipe & RBAC
              </Link>
            </div>
          </div>
        </div>

        {/* Rodapé Inferior de Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 Davino Neves Advocacia. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              Termos de Uso
            </span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              Política de Privacidade & LGPD
            </span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              Segurança da Informação
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default InstitutionalFooter;
