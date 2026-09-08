'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export function LeadContactForm() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    volumeProcessos: '50-200',
    areaInteresse: 'Contencioso Estratégico',
    mensagem: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.email.trim() || !formData.telefone.trim()) {
      toast.error('Por favor, preencha nome, e-mail e telefone para contato.');
      return;
    }

    setLoading(true);

    // Simulate secure transmission to CRM/Dispatch
    setTimeout(() => {
      const randomProtocol = `DN-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmittedProtocol(randomProtocol);
      setLoading(false);
      toast.success('Solicitação transmitida com sucesso! Protocolo gerado.');
    }, 1200);
  };

  const handleReset = () => {
    setSubmittedProtocol(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
      volumeProcessos: '50-200',
      areaInteresse: 'Contencioso Estratégico',
      mensagem: '',
    });
  };

  return (
    <section id="contato" className="py-24 bg-[#0A0F1D] text-white border-t border-slate-800/80 relative">
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-amber-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Contacts & Conversion Assurance */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Atendimento Corporativo Exclusivo</span>
            </div>

            <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Inicie seu Diagnóstico <span className="gold-gradient-text">Estratégico</span>
            </h2>

            <p className="text-sm text-slate-300 font-sans font-light leading-relaxed">
              Converse com sócios seniores da Davino Neves e descubra como nossa assessoria e infraestrutura de dados podem proteger e impulsionar suas operações.
            </p>

            {/* Direct Contact Cards */}
            <div className="space-y-4 pt-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Central Telefônica & Plantão</div>
                  <div className="text-sm font-semibold text-white font-mono">(11) 3450-8900 / (11) 98877-0022</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Correspondência Corporativa</div>
                  <div className="text-sm font-semibold text-white font-mono">contato@davinoneves.com.br</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Tempo Médio de Resposta</div>
                  <div className="text-sm font-semibold text-emerald-400 font-medium">Em até 2 horas úteis por advogado sócio</div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Dados protegidos sob sigilo advocatício e conformidade com a LGPD.</span>
            </div>
          </div>

          {/* Right Column: High-Conversion Form */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-[#070B14] p-6 sm:p-8 lg:p-10 shadow-2xl relative">
            {submittedProtocol ? (
              /* Success State */
              <div className="text-center py-10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                  Diagnóstico Solicitado com Sucesso
                </h3>
                <p className="text-sm text-slate-300 font-light max-w-md mx-auto">
                  Recebemos seus dados em nosso canal prioritário. Seu protocolo de atendimento formal foi gerado:
                </p>
                <div className="inline-block rounded-xl bg-slate-900 px-5 py-3 border border-amber-500/40 text-amber-300 font-mono font-bold text-base tracking-wider shadow-md">
                  {submittedProtocol}
                </div>
                <p className="text-xs text-slate-400">
                  Nossa equipe de sócios entrará em contato via telefone e e-mail nas próximas 2 horas úteis para alinhar o diagnóstico.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                  >
                    Enviar nova solicitação
                  </button>
                </div>
              </div>
            ) : (
              /* Active Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-800/80 pb-4 mb-2">
                  <h3 className="font-cinzel text-xl font-bold text-white">
                    Solicitar Diagnóstico ou Demonstração da Plataforma
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-light">
                    Preencha o formulário abaixo para receber uma análise preliminar personalizada.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dra. Mariana Costa"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition"
                    />
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      E-mail Corporativo *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="exemplo@empresa.com.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Telefone */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition"
                    />
                  </div>

                  {/* Empresa */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Empresa ou Razão Social
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Grupo Alpha S/A"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Área de Interesse */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Área de Interesse Principal
                    </label>
                    <select
                      value={formData.areaInteresse}
                      onChange={(e) => setFormData({ ...formData, areaInteresse: e.target.value })}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition"
                    >
                      <option value="Contencioso Estratégico">Contencioso Estratégico & Arbitragem</option>
                      <option value="Tributário & Fiscal">Direito Tributário & Planejamento</option>
                      <option value="M&A e Societário">M&A, Due Diligence e Societário</option>
                      <option value="LGPD e Digital">LGPD e Direito Digital</option>
                      <option value="Controladoria & Software">Demonstração da Plataforma Tecnológica</option>
                      <option value="Outra Demanda">Outra Demanda Corporativa</option>
                    </select>
                  </div>

                  {/* Volume de Processos */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Volume Estimado de Processos
                    </label>
                    <select
                      value={formData.volumeProcessos}
                      onChange={(e) => setFormData({ ...formData, volumeProcessos: e.target.value })}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition"
                    >
                      <option value="Até 50 processos">Até 50 processos ativos</option>
                      <option value="50-200">50 a 200 processos</option>
                      <option value="200-500">200 a 500 processos</option>
                      <option value="500-2000">500 a 2.000 processos</option>
                      <option value="2000+">Mais de 2.000 processos</option>
                      <option value="Não informado">Prefiro informar na reunião</option>
                    </select>
                  </div>
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Resumo Breve da Demanda (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva pontos centrais do seu caso, prazo relevante ou necessidade de auditoria..."
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-6 py-3.5 text-xs sm:text-sm font-bold tracking-wide text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-98 transition duration-150 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Transmitindo com segurança...
                      </span>
                    ) : (
                      <>
                        <span>Solicitar Diagnóstico Estratégico</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
