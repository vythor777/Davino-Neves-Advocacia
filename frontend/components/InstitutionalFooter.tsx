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
} from 'lucide-react';

type LegalModalType = 'termos' | 'lgpd' | 'seguranca' | null;

export function InstitutionalFooter() {
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors">
      {/* Top Banner de Confiança & Segurança */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <button
                onClick={() => setActiveModal('lgpd')}
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-400 transition cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <span>Conformidade LGPD (Lei 13.709/2018)</span>
              </button>
              <button
                onClick={() => setActiveModal('seguranca')}
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Criptografia TLS 256-bit Ponta a Ponta</span>
              </button>
              <span className="hidden md:inline-flex items-center gap-1.5 text-slate-500">
                <FileCheck className="h-3.5 w-3.5 text-slate-500" />
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
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-800 text-amber-100 shadow-xs font-bold font-serif text-sm">
                DN
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white tracking-tight">
                  Davino Neves
                </h4>
                <p className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold">
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
                <Scale className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
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
              <Link href="/processos" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors py-1">
                Processos
              </Link>
              <Link href="/prazos" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors py-1">
                Prazos Fatais
              </Link>
              <Link href="/clientes" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors py-1">
                Clientes
              </Link>
              <Link href="/datajud" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors py-1">
                DataJud CNJ
              </Link>
              <Link href="/gemini" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors flex items-center gap-1 py-1">
                <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                <span>IA Gemini</span>
              </Link>
              <Link href="/usuarios" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors py-1">
                Equipe & RBAC
              </Link>
            </div>
          </div>
        </div>

        {/* Rodapé Inferior de Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 Davino Neves Advocacia. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveModal('termos')}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer min-h-[32px] px-1"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveModal('lgpd')}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer min-h-[32px] px-1"
            >
              Política de Privacidade & LGPD
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveModal('seguranca')}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer min-h-[32px] px-1"
            >
              Segurança da Informação
            </button>
          </div>
        </div>
      </div>

      {/* Modal Institucional Informativo */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    {activeModal === 'termos' && 'Termos de Uso e Responsabilidade Operacional'}
                    {activeModal === 'lgpd' && 'Declaração de Privacidade e Conformidade LGPD'}
                    {activeModal === 'seguranca' && 'Protocolos de Segurança e Custódia de Dados'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Davino Neves Advocacia • OAB/SP</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeModal === 'termos' && (
                <>
                  <p>
                    O acesso a esta plataforma é restrito a advogados, estagiários e colaboradores autorizados de Davino Neves Advocacia e seus respectivos clientes credenciados.
                  </p>
                  <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Sigilo Profissional:</strong> Todos os dados processuais e documentos armazenados estão resguardados pelo sigilo profissional previsto no Estatuto da Advocacia (Lei Federal nº 8.906/1994).</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
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
                  <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                      <span><strong>Encarregado pelo Tratamento (DPO):</strong> Dúvidas, solicitações de revogação de consentimento ou consultas sobre retenção de dados devem ser enviadas a <code>dpo@davinoneves.com.br</code>.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
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
                  <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Criptografia em Trânsito e Repouso:</strong> Todas as conexões utilizam TLS 1.3 / AES-256 e os dados em repouso são protegidos com isolamento multi-tenant.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Controle de Acesso Baseado em Funções (RBAC):</strong> Permissões granulares impedem acesso indevido entre departamentos ou perfis não autorizados.</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
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
