'use client';

import React from 'react';
import Link from 'next/link';
import { Prazo } from '@/services/prazoService';
import { calcularStatusPrazo, formatPrazoExtenso } from '@/utils/dateUtils';
import {
  X,
  Calendar,
  Clock,
  Scale,
  User,
  Check,
  RotateCcw,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

interface PrazoDetailModalProps {
  prazo: Prazo | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (prazo: Prazo) => void;
  onEdit: (prazo: Prazo) => void;
  onDelete: (prazo: Prazo) => void;
}

export function PrazoDetailModal({
  prazo,
  isOpen,
  onClose,
  onToggleStatus,
  onEdit,
  onDelete,
}: PrazoDetailModalProps) {
  if (!isOpen || !prazo) return null;

  const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status, prazo.hora);
  const StatusIcon = calc.icon;
  const isCumprido = prazo.status?.toLowerCase() === 'cumprido';

  // Formatação de data completa (ex: "Quarta-feira, 02 de setembro de 2026")
  const dataFormatada = formatPrazoExtenso(prazo.data_vencimento);

  const handleCopyCNJ = (cnj: string) => {
    navigator.clipboard.writeText(cnj);
    toast.success('Número do CNJ copiado para a área de transferência');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in-up">
      <div
        className="w-full max-w-lg legal-glass-card fio-de-luz shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-prazo-title"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] p-5 bg-slate-50/40 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div
              className={`rounded-xl p-2 border ${
                isCumprido
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : calc.urgencia === 'vencido' || calc.urgencia === 'hoje' || calc.urgencia === 'urgente'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-[#c5a059]/15 text-[#c5a059] border-[#c5a059]/25'
              }`}
            >
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 id="modal-prazo-title" className="text-base font-semibold text-slate-900 dark:text-[#f8fafc]">
                Detalhes do Prazo Judicial
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro processual #{prazo.id_prazo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-200 transition cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo dos Detalhes */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status e Urgência */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Situação do Prazo:</span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-semibold text-xs ${
                isCumprido
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : calc.urgencia === 'vencido' || calc.urgencia === 'hoje' || calc.urgencia === 'urgente'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-[#c5a059]/10 border-[#c5a059]/20 text-[#c5a059]'
              }`}
            >
              {calc.badgeText}
            </span>
          </div>

          {/* Descrição do Prazo */}
          <div className="space-y-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Ato Processual / Descrição:</span>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#f8fafc] leading-relaxed p-3 bg-white/60 dark:bg-white/[0.02] rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
              {prazo.descricao}
            </p>
          </div>

          {/* Data de Vencimento e Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Data Fatal:</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="capitalize font-medium">{dataFormatada}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Horário Marcado:</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-mono font-medium">{prazo.hora || '09:00'}</span>
              </div>
            </div>
          </div>

          {/* Tipo de Compromisso e Responsável */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Tipo de Compromisso:</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                <Tag className="h-4 w-4 text-[#c5a059] shrink-0" />
                <span className="font-semibold">{prazo.tipoCompromisso || 'Prazo Fatal'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Responsável:</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-medium truncate">{prazo.responsavel || 'Não atribuído'}</span>
              </div>
            </div>
          </div>

          {/* Processo Judicial Vinculado */}
          <div className="space-y-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Processo Vinculado:</span>
            {prazo.processo ? (
              <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-[#c5a059] shrink-0" />
                    <span className="font-mono font-semibold text-slate-900 dark:text-white text-xs">
                      {prazo.processo.numero_processo}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCNJ(prazo.processo!.numero_processo)}
                    className="flex items-center gap-1 rounded-md p-1 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 transition cursor-pointer"
                    title="Copiar CNJ"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="text-slate-700 dark:text-slate-300 font-medium truncate">
                  {prazo.processo.titulo}
                </p>

                {prazo.processo.cliente?.nome && (
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Cliente: <strong>{prazo.processo.cliente.nome}</strong></span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                  <Link
                    href={`/processos?busca=${prazo.processo.numero_processo}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c5a059] hover:underline"
                    onClick={onClose}
                  >
                    <span>Ver autos do processo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] p-3 text-slate-500">
                Processo ID #{prazo.id_processo}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="border-t border-slate-200/60 dark:border-white/[0.06] p-4 bg-slate-50/40 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-2">
          {/* Alternar Cumprimento */}
          <button
            onClick={() => {
              onToggleStatus(prazo);
              onClose();
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition active:scale-95 cursor-pointer ${
              isCumprido
                ? 'border border-slate-200/80 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300'
                : 'bg-[#c5a059] hover:bg-[#d4b36f] text-slate-950 font-semibold shadow-xs'
            }`}
          >
            {isCumprido ? (
              <>
                <RotateCcw className="h-4 w-4" />
                <span>Reabrir Prazo</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Marcar como Cumprido</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {/* Editar */}
            <button
              onClick={() => {
                onClose();
                onEdit(prazo);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06] transition cursor-pointer"
              title="Editar Prazo"
            >
              <Edit2 className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Editar</span>
            </button>

            {/* Excluir */}
            <button
              onClick={() => {
                onClose();
                onDelete(prazo);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400 transition cursor-pointer"
              title="Excluir Prazo"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            {/* Fechar */}
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrazoDetailModal;
