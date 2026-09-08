'use client';

import React from 'react';
import {
  Briefcase,
  TrendingUp,
  Cpu,
  Coins,
  ArrowRight,
  CheckCircle2,
  Building,
  Lock,
} from 'lucide-react';

interface PracticeArea {
  id: string;
  icon: React.ElementType;
  title: string;
  badge: string;
  shortDesc: string;
  highlights: string[];
  techAdvantage: string;
}

const areas: PracticeArea[] = [
  {
    id: 'contencioso',
    icon: Briefcase,
    title: 'Contencioso Estratégico & Arbitragem',
    badge: 'Alto Valor Econômico',
    shortDesc:
      'Defesa técnica incisiva em litígios cíveis, empresariais e contratuais complexos, atuando preventivamente e em todas as instâncias judiciais e tribunais arbitrais.',
    highlights: [
      'Disputas societárias, dissolução de sociedade e apuração de haveres',
      'Ações revisionais e indenizatórias de grande vulto',
      'Despachos virtuais e memoriais customizados para Desembargadores e Ministros',
    ],
    techAdvantage: 'Triagem preditiva de decisões do tribunal via DataJud para subsidiar a estratégia recursal.',
  },
  {
    id: 'tributario',
    icon: Coins,
    title: 'Direito Tributário & Planejamento Fiscal',
    badge: 'Eficiência de Caixa',
    shortDesc:
      'Defesa administrativa e judicial contra autuações fiscais federais (CARF), estaduais e municipais, além de planejamento tributário para redução lícita de carga fiscal.',
    highlights: [
      'Recuperação de tributos recolhidos indevidamente (PIS/COFINS, ICMS, IRPJ/CSLL)',
      'Impugnações e recursos fiscais perante o CARF e Tribunais de Impostos',
      'Pareceres de elisão fiscal e estruturação tributária para holdings',
    ],
    techAdvantage: 'Simulação automatizada de impactos financeiros e jurisprudência vinculante do STF e STJ.',
  },
  {
    id: 'societario',
    icon: Building,
    title: 'M&A, Governança & Direito Societário',
    badge: 'Segurança Institucional',
    shortDesc:
      'Assessoria jurídica integral para transações societárias, acordos de sócios/acionistas, governança corporativa e sucessão patrimonial estruturada.',
    highlights: [
      'Due Diligence legal completa com auditoria de contingências ativas e passivas',
      'Elaboração de memorandos de entendimento (MOU), NDAs e contratos de compra e venda',
      'Planejamento sucessório, holdings familiares e proteção de ativos',
    ],
    techAdvantage: 'Data room digital criptografado com controle granular de acesso e trilha de auditoria RBAC.',
  },
  {
    id: 'lgpd',
    icon: Lock,
    title: 'Direito Digital & Conformidade LGPD',
    badge: 'Blindagem de Dados',
    shortDesc:
      'Implementação, auditoria e manutenção de programas de privacidade e proteção de dados (Lei 13.709/2018), além de contratos de tecnologia e propriedade intelectual.',
    highlights: [
      'Mapeamento de fluxo de dados (ROPA) e Relatórios de Impacto (RIPD/DPIA)',
      'Atuação como DPO (Encarregado de Dados) As a Service perante a ANPD',
      'Elaboração e revisão de contratos SaaS, termos de uso e políticas corporativas',
    ],
    techAdvantage: 'Painel de conformidade contínua com verificação automática de riscos em contratos de dados.',
  },
  {
    id: 'recuperacao',
    icon: TrendingUp,
    title: 'Recuperação de Ativos & Execuções',
    badge: 'Rastreamento Patrimonial',
    shortDesc:
      'Estratégias avançadas de localização de patrimônio oculto, desconsideração da personalidade jurídica e execução célere de títulos judiciais e extrajudiciais.',
    highlights: [
      'Investigação patrimonial profunda via Sisbajud (Teimosinha), Renajud e Censec',
      'Ações de execução de títulos de crédito, debêntures e contratos bancários',
      'Medidas cautelares de arresto e sequestro de bens para garantia de juízo',
    ],
    techAdvantage: 'Cruzamento digital de dados societários e cadastrais para aceleração de constrições patrimoniais.',
  },
  {
    id: 'legalops',
    icon: Cpu,
    title: 'Controladoria & Legal Operations',
    badge: 'Gestão 4.0',
    shortDesc:
      'Transformação da controladoria jurídica interna da sua empresa em um centro de inteligência e previsibilidade, reduzindo custos e eliminando falhas humanas.',
    highlights: [
      'SLA garantido de 48 horas de antecedência em todos os prazos processuais',
      'Relatórios gerenciais mensais de contingência para diretoria financeira e conselho',
      'Padronização de peças, fluxos de aprovação e governança de autos',
    ],
    techAdvantage: 'Dashboard em tempo real com métricas financeiras de sucumbência, honorários e contingências.',
  },
];

export function PracticeAreas() {
  return (
    <section id="solucoes" className="py-24 bg-[#070B14] text-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 mb-4">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Especialidades Estratégicas</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Soluções Jurídicas de <span className="gold-gradient-text">Alto Impacto</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 font-sans font-light leading-relaxed">
            Atuamos em demandas de alta relevância corporativa, aliando o mais profundo rigor técnico às ferramentas tecnológicas mais avançadas do setor.
          </p>
        </div>

        {/* Areas Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => {
            const Icon = area.icon;

            return (
              <div
                key={area.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 sm:p-7 backdrop-blur-xs hover:border-amber-500/40 hover:bg-slate-900/80 transition-all duration-300 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-700/20 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-800/80 px-2.5 py-1 font-mono text-[10px] font-semibold text-slate-300 border border-slate-700/60">
                      {area.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 font-cinzel text-lg font-bold text-white group-hover:text-amber-200 transition-colors">
                    {area.title}
                  </h3>

                  <p className="mt-2.5 text-xs text-slate-300 leading-relaxed font-light">
                    {area.shortDesc}
                  </p>

                  {/* Highlights list */}
                  <div className="mt-4 space-y-2 border-t border-slate-800/60 pt-4">
                    {area.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech Advantage Pill */}
                  <div className="mt-4 rounded-xl bg-blue-950/40 p-3 border border-blue-900/50 text-[11px] text-blue-200">
                    <strong className="text-blue-300 font-semibold block mb-0.5">Diferencial Tecnológico:</strong>
                    {area.techAdvantage}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <a
                    href="#contato"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 group-hover:translate-x-1 transition"
                  >
                    <span>Consultar equipe especializada</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
