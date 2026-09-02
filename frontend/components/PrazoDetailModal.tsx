'use client';

import React from 'react';
import Link from 'next/link';
import { Prazo } from '@/services/prazoService';
import { calcularStatusPrazo } from './ProcessCalendar';
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

  const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status);
  const StatusIcon = calc.icon;
  const isCumprido = prazo.status?.toLowerCase() === 'cumprido';

  // Formatação de data completa (ex: "15 de setembro de 2026")
  const dataVencimentoDate = new Date(
    prazo.data_vencimento.includes('T') ? prazo.data_vencimento : `${prazo.data_vencimento}T00:00:00`
  );
  const dataFormatada = dataVencimentoDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleCopyCNJ = (cnj: string) => {
    navigator.clipboard.writeText(cnj);
    toast.success('Número do CNJ copiado para a área de transferência');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-fade-in-up">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-prazo-title"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`rounded-xl p-2 ${
                isCumprido
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : calc.urgencia === 'vencido' || calc.urgencia === 'hoje' || calc.urgencia === 'urgente'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 id="modal-prazo-title" className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Detalhes do Prazo Judicial
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro processual #{prazo.id_prazo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo dos Detalhes */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status e Urgência */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Situação do Prazo:</span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-semibold text-xs ${
                isCumprido
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-900/50 dark:border-emerald-500 dark:text-emerald-200'
                  : calc.urgencia === 'vencido' || calc.urgencia === 'hoje' || calc.urgencia === 'urgente'
                  ? 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-500 dark:text-red-200'
                  : 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-200'
              }`}
            >
              {calc.badgeText}
            </span>
          </div>

          {/* Descrição do Prazo */}
          <div className="space-y-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Ato Processual / Descrição:</span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              {prazo.descricao}
            </p>
          </div>

          {/* Data de Vencimento e Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Data Fatal:</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="capitalize font-medium">{dataFormatada}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Horário Marcado:</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-mono font-medium">{prazo.hora || '09:00'}</span>
              </div>
            </div>
          </div>

          {/* Tipo de Compromisso e Responsável */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Tipo de Compromisso:</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <Tag className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="font-semibold">{prazo.tipoCompromisso || 'Prazo Fatal'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Responsável:</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-medium truncate">{prazo.responsavel || 'Não atribuído'}</span>
              </div>
            </div>
          </div>

          {/* Processo Judicial Vinculado */}
          <div className="space-y-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Processo Vinculado:</span>
            {prazo.processo ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {prazo.processo.numero_processo}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCNJ(prazo.processo!.numero_processo)}
                    className="flex items-center gap-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
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

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <Link
                    href={`/processos?busca=${prazo.processo.numero_processo}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={onClose}
                  >
                    <span>Ver autos do processo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-slate-500">
                Processo ID #{prazo.id_processo}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2">
          {/* Alternar Cumprimento */}
          <button
            onClick={() => {
              onToggleStatus(prazo);
              onClose();
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition active:scale-95 ${
              isCumprido
                ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition"
              title="Editar Prazo"
            >
              <Edit2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Editar</span>
            </button>

            {/* Excluir */}
            <button
              onClick={() => {
                onClose();
                onDelete(prazo);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition"
              title="Excluir Prazo"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            {/* Fechar */}
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
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
