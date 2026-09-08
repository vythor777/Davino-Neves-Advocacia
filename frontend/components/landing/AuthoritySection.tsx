'use client';

import React from 'react';
import {
  ShieldCheck,
  Lock,
  Award,
  Building2,
  Quote,
  Star,
} from 'lucide-react';

export function AuthoritySection() {
  const testimonials = [
    {
      quote:
        'A Davino Neves transformou o contencioso corporativo do nosso grupo. A sincronização automatizada com o DataJud e o rigor absoluto nos prazos nos deram total previsibilidade financeira e jurídica.',
      author: 'Eduardo M. Siqueira',
      role: 'Diretor Jurídico',
      company: 'Holding de Logística & Infraestrutura (SP)',
    },
    {
      quote:
        'Em nossa reestruturação societária e planejamento sucessório, o escritório conduziu a due diligence e os acordos com extrema discrição e solidez técnica, sem deixar qualquer margem para disputas futuras.',
      author: 'Renata Albuquerque',
      role: 'CFO & Conselheira',
      company: 'Grupo Empresarial do Agronegócio',
    },
    {
      quote:
        'A inteligência jurídica aplicada aos relatórios executivos permitiu à nossa diretoria tomar decisões estratégicas antes mesmo da intimação formal dos acórdãos. É a verdadeira advocacia 4.0.',
      author: 'Marcos Vinícius Prado',
      role: 'Head of Legal Operations',
      company: 'Fintech de Meios de Pagamento',
    },
  ];

  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Segurança & Criptografia TLS 256-bit',
      desc: 'Comunicação ponta a ponta criptografada, bancos de dados isolados e backups automatizados em conformidade com as normas bancárias mais rigorosas.',
    },
    {
      icon: Lock,
      title: 'Sigilo Profissional & LGPD Estrita',
      desc: 'Proteção irrestrita de dados estratégicos e segredos industriais, supervisionada por Encarregado de Dados (DPO) e alinhada ao Código de Ética da OAB.',
    },
    {
      icon: Award,
      title: 'Excelência Forense Comprovada',
      desc: 'Atuação especializada em litígios de alta complexidade perante o TJSP, TRFs, STJ e STF, com presença constante em sustentações orais.',
    },
    {
      icon: Building2,
      title: 'Governança Corporativa Transparente',
      desc: 'Relatórios claros de contingência (provável, possível, remota) para subsidiar auditorias contábeis (Big Four) e reuniões de conselho.',
    },
  ];

  return (
    <section id="diferenciais" className="py-24 bg-[#070B14] text-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 mb-4">
            <Award className="h-3.5 w-3.5" />
            <span>Padrão Institucional & Autoridade</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Solidez Jurídica Respaldada pela <span className="gold-gradient-text">Confiança</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 font-sans font-light leading-relaxed">
            Mais de uma década construindo relacionamentos duradouros com empresas líderes de mercado através de integridade técnica, sigilo absoluto e governança transparente.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xs hover:border-slate-700 transition"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30 mb-5">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-cinzel text-base font-bold text-white mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Social Proof / Testimonials Section */}
        <div className="mt-20 pt-16 border-t border-slate-800/80">
          <div className="text-center mb-12">
            <h3 className="font-cinzel text-2xl font-bold text-white">
              A Voz de Quem Confia na Davino Neves
            </h3>
            <p className="text-xs text-slate-400 mt-2 font-sans">
              Depoimentos de executivos, diretores jurídicos e conselheiros de empresas atendidas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-7 relative"
              >
                <Quote className="h-8 w-8 text-amber-500/20 absolute top-5 right-5" />
                <div>
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-light">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <div className="font-semibold text-xs text-white">
                    {t.author}
                  </div>
                  <div className="text-[11px] text-amber-400 font-medium">
                    {t.role}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Trust Banner */}
        <div className="mt-16 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-slate-900/50 to-blue-600/5 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="font-cinzel text-base font-bold text-white block">
              Registro Oficial na Ordem dos Advogados do Brasil
            </span>
            <span className="text-xs text-slate-400 font-sans mt-1 block">
              Davino Neves Sociedade de Advogados • Registro OAB/SP 45.892/2012 • CNPJ 45.892.120/0001-34
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 font-mono text-xs text-slate-300">
              AUDITADO 2026
            </span>
            <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 font-mono text-xs text-amber-300">
              PROVIMENTO 205/2021 OAB
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
