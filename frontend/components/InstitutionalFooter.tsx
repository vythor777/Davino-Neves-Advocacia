'use client';

import React, { useState } from 'react';
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
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

type LegalModalType = 'termos' | 'lgpd' | 'seguranca' | null;

export function InstitutionalFooter() {
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);

  return (
    <footer className="mt-auto border-t border-[#0c1f3d]/[0.08] bg-white dark:border-white/[0.08] dark:bg-[#091322] backdrop-blur-md text-slate-600 dark:text-slate-400 transition-colors">
      {/* Top Banner de Confiança & Segurança */}
      <div className="border-b border-[#0c1f3d]/[0.06] dark:border-white/[0.06] bg-[#f7f9fc] dark:bg-[#0d192e]/70">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 text-xs">
            {/* Selos de Conformidade e Criptografia */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6">
              <button
                type="button"
                onClick={() => setActiveModal('lgpd')}
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white active:scale-95 transition cursor-pointer py-1"
                aria-label="Ver detalhes de conformidade com a LGPD"
              >
                <ShieldCheck className="h-4 w-4 stroke-[1.25] text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] sm:text-xs">Conformidade LGPD (Lei 13.709/2018)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('seguranca')}
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white active:scale-95 transition cursor-pointer py-1"
                aria-label="Ver detalhes de segurança e criptografia TLS"
              >
                <Lock className="h-3.5 w-3.5 stroke-[1.25] text-[#0047ab] dark:text-blue-400 shrink-0" />
                <span className="text-[11px] sm:text-xs">Criptografia TLS 256-bit Ponta a Ponta</span>
              </button>

              <span className="hidden md:inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <FileCheck className="h-3.5 w-3.5 stroke-[1.25] text-slate-400 shrink-0" />
                <span className="text-[11px] sm:text-xs">Auditoria e Logs de Acesso RBAC</span>
              </span>
            </div>

            {/* Status Operacional DataJud CNJ */}
            <div className="flex items-center justify-between sm:justify-end gap-2 text-[11px] sm:text-xs pt-1 sm:pt-0 border-t sm:border-t-0 border-[#0c1f3d]/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  DataJud CNJ 100% Operacional
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corpo Institucional Principal */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8 text-xs">
          {/* Coluna 1: Identidade */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[#dfcaa0] border border-[#c5a059]/40 shadow-xs font-semibold text-xs dark:bg-slate-800">
                DN
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white tracking-tight text-sm truncate">
                  Davino Neves
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase">
                  Advocacia & Controladoria
                </p>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Sociedade de advogados voltada à excelência em contencioso estratégico, controladoria de prazos processuais e integração direta aos tribunais.
            </p>
          </div>

          {/* Coluna 2: Dados Oficiais e OAB */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 stroke-[1.25] text-slate-600 dark:text-slate-400" />
              <span>Registros Oficiais</span>
            </h5>
            <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                <span>OAB/SP • Sociedade de Advogados</span>
              </li>
              <li className="font-mono text-slate-600 dark:text-slate-400">
                CNPJ: 45.892.120/0001-34
              </li>
              <li className="flex items-start gap-1.5 leading-snug">
                <Building2 className="h-3.5 w-3.5 stroke-[1.25] text-slate-400 shrink-0 mt-0.5" />
                <span>Av. Paulista, 1842 - Torre Norte, 14º andar - Bela Vista, São Paulo/SP</span>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento e Plantão */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 stroke-[1.25] text-slate-600 dark:text-slate-400" />
              <span>Plantão & Atendimento</span>
            </h5>
            <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
              <li>
                <a
                  href="tel:+551134508900"
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition py-0.5"
                >
                  <Phone className="h-3.5 w-3.5 stroke-[1.25] text-slate-400 shrink-0" />
                  <span>(11) 3450-8900 / (11) 98877-0022</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@davinoneves.com.br"
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition break-all py-0.5"
                >
                  <Mail className="h-3.5 w-3.5 stroke-[1.25] text-slate-400 shrink-0" />
                  <span>contato@davinoneves.com.br</span>
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('lgpd')}
                  className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-left py-0.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5 stroke-[1.25] text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DPO / LGPD: dpo@davinoneves.com.br</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Módulos Rápidos */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5 stroke-[1.25] text-slate-600 dark:text-slate-400" />
              <span>Acesso Rápido</span>
            </h5>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
              <Link
                href="/processos"
                className="hover:text-[#0047ab] dark:hover:text-blue-400 hover:underline transition-colors py-1.5 flex items-center min-h-[36px]"
              >
                Processos
              </Link>
              <Link
                href="/prazos"
                className="hover:text-[#0047ab] dark:hover:text-blue-400 hover:underline transition-colors py-1.5 flex items-center min-h-[36px]"
              >
                Prazos Fatais
              </Link>
              <Link
                href="/clientes"
                className="hover:text-[#0047ab] dark:hover:text-blue-400 hover:underline transition-colors py-1.5 flex items-center min-h-[36px]"
              >
                Clientes
              </Link>
              <Link
                href="/datajud"
                className="hover:text-[#0047ab] dark:hover:text-blue-400 hover:underline transition-colors py-1.5 flex items-center min-h-[36px]"
              >
                DataJud CNJ
              </Link>
              <Link
                href="/gemini"
                className="hover:text-[#0047ab] dark:hover:text-blue-400 hover:underline transition-colors flex items-center gap-1 py-1.5 min-h-[36px]"
              >
                <Sparkles className="h-3 w-3 stroke-[1.25] text-[#c5a059] shrink-0" />
                <span>IA Gemini</span>
              </Link>
              <Link
                href="/usuarios"
                className="hover:text-[#0047ab] dark:hover:text-blue-400 hover:underline transition-colors py-1.5 flex items-center min-h-[36px]"
              >
                Equipe & RBAC
              </Link>
            </div>
          </div>
        </div>

        {/* Rodapé Inferior de Copyright e Links Legais */}
        <div className="mt-8 pt-6 border-t border-[#0c1f3d]/[0.08] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <p className="order-2 sm:order-1">
            © 2026 Davino Neves Advocacia. Todos os direitos reservados.
          </p>
          <div className="order-1 sm:order-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
            <button
              type="button"
              onClick={() => setActiveModal('termos')}
              className="hover:text-[#0047ab] dark:hover:text-blue-400 transition cursor-pointer min-h-[36px] px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04]"
            >
              Termos de Uso
            </button>
            <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
            <button
              type="button"
              onClick={() => setActiveModal('lgpd')}
              className="hover:text-[#0047ab] dark:hover:text-blue-400 transition cursor-pointer min-h-[36px] px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04]"
            >
              Política de Privacidade & LGPD
            </button>
            <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
            <button
              type="button"
              onClick={() => setActiveModal('seguranca')}
              className="hover:text-[#0047ab] dark:hover:text-blue-400 transition cursor-pointer min-h-[36px] px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04]"
            >
              Segurança da Informação
            </button>
          </div>
        </div>
      </div>

      {/* Modal Institucional Informativo */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-2xl border border-[0.75px] border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-white/[0.12] dark:bg-[#161b22] text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-[0.75px] border-slate-100 pb-4 dark:border-white/[0.08] gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-[#dfcaa0] border border-[0.75px] border-slate-200 dark:border-white/[0.08]">
                  <Scale className="h-5 w-5 stroke-[1.25]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug truncate">
                    {activeModal === 'termos' && 'Termos de Uso e Responsabilidade'}
                    {activeModal === 'lgpd' && 'Declaração de Privacidade & LGPD'}
                    {activeModal === 'seguranca' && 'Protocolos de Segurança & Custódia'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Davino Neves Advocacia • OAB/SP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/[0.05] dark:hover:text-slate-200 transition cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4 stroke-[1.25]" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeModal === 'termos' && (
                <>
                  <p>
                    O acesso a esta plataforma é restrito a advogados, estagiários e colaboradores autorizados de Davino Neves Advocacia e seus respectivos clientes credenciados.
                  </p>
                  <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-[#0d1117]/60 p-3.5 border border-[0.75px] border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[1.25]" />
                      <span><strong>Sigilo Profissional:</strong> Todos os dados processuais e documentos armazenados estão resguardados pelo sigilo profissional previsto no Estatuto da Advocacia (Lei Federal nº 8.906/1994).</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[1.25]" />
                      <span><strong>Rastreabilidade de Ações:</strong> Cada inclusão, alteração ou consulta a peças e processos é registrada em trilha de auditoria inviolável com identificação de IP e timestamp.</span>
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'lgpd' && (
                <>
                  <p>
                    Em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), tratamos dados pessoais exclusivamente para a execução de mandatos advocatícios, representação judicial e cumprimento de obrigações legais.
                  </p>
                  <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-[#0d1117]/60 p-3.5 border border-[0.75px] border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-slate-700 dark:text-[#dfcaa0] shrink-0 mt-0.5 stroke-[1.25]" />
                      <span><strong>Encarregado pelo Tratamento (DPO):</strong> Dúvidas, solicitações de revogação de consentimento ou consultas sobre retenção de dados devem ser enviadas a <code>dpo@davinoneves.com.br</code>.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-slate-700 dark:text-[#dfcaa0] shrink-0 mt-0.5 stroke-[1.25]" />
                      <span><strong>Direitos dos Titulares:</strong> Asseguramos a retificação, anonimização ou exclusão de dados não indispensáveis à guarda processual legal.</span>
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'seguranca' && (
                <>
                  <p>
                    Nossa infraestrutura tecnológica adota padrões de segurança corporativa de nível bancário e forense para proteção contínua de peças e informações sigilosas.
                  </p>
                  <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-[#0d1117]/60 p-3.5 border border-[0.75px] border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[1.25]" />
                      <span><strong>Criptografia em Trânsito e Repouso:</strong> Todas as conexões utilizam TLS 1.3 / AES-256 e os dados em repouso são protegidos com isolamento multi-tenant.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[1.25]" />
                      <span><strong>Controle de Acesso Baseado em Funções (RBAC):</strong> Permissões granulares impedem acesso indevido entre departamentos ou perfis não autorizados.</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-[0.75px] border-slate-100 pt-4 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full sm:w-auto rounded-xl border border-[0.75px] border-slate-300 dark:border-white/[0.12] bg-slate-900 dark:bg-[#0d1117] text-white dark:text-[#dfcaa0] hover:bg-slate-800 dark:hover:bg-[#1f2631] px-5 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer text-center"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default InstitutionalFooter;

