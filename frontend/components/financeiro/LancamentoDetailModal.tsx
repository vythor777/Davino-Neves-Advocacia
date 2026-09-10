'use client';

import React from 'react';
import {
  X,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Trash2,
  Edit,
  User,
  Scale,
  Tag,
  CreditCard,
} from 'lucide-react';
import {
  LancamentoFinanceiro,
  CATEGORIAS_LABELS,
  StatusLancamento,
} from '@/services/financeiroService';

interface LancamentoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lancamento: LancamentoFinanceiro | null;
  onEdit: (lancamento: LancamentoFinanceiro) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: StatusLancamento) => void;
}

export function LancamentoDetailModal({
  isOpen,
  onClose,
  lancamento,
  onEdit,
  onDelete,
  onToggleStatus,
}: LancamentoDetailModalProps) {
  if (!isOpen || !lancamento) return null;

  const isReceita = lancamento.tipo === 'RECEITA';
  const categoriaInfo = CATEGORIAS_LABELS[lancamento.categoria] || {
    label: lancamento.categoria,
    badgeClass: 'bg-slate-100 text-slate-800',
  };

  const formattedValor = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(lancamento.valor));

  const formatData = (dataStr?: string | null) => {
    if (!dataStr) return '-';
    const [ano, mes, dia] = dataStr.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl legal-modal-card fio-de-luz shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs ${
                isReceita
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
              }`}
            >
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#c5a059]">
                  Comprovante Financeiro
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  #{lancamento.id.slice(-6)}
                </span>
              </div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc] line-clamp-1">
                {lancamento.descricao}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Card de Valor e Status Principal */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                {isReceita ? 'Valor a Receber / Faturado' : 'Valor a Pagar / Desembolsado'}
              </span>
              <div
                className={`text-2xl sm:text-3xl font-bold tracking-tight mt-1 ${
                  isReceita
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isReceita ? '+ ' : '- '}
                {formattedValor}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lancamento.status === 'PAGO' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-xs font-semibold border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4" /> Liquidado
                </span>
              ) : lancamento.status === 'ATRASADO' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 text-xs font-semibold border border-rose-500/20">
                  <AlertTriangle className="h-4 w-4" /> Em Atraso
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 text-xs font-semibold border border-amber-500/20">
                  <Clock className="h-4 w-4" /> Pendente
                </span>
              )}
            </div>
          </div>

          {/* Grid de Atributos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] p-3.5 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Tag className="h-3.5 w-3.5 text-[#c5a059]" /> Categoria
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {categoriaInfo.label}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] p-3.5 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <CreditCard className="h-3.5 w-3.5 text-[#c5a059]" /> Meio de Pagamento
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {lancamento.formaPagamento || 'Não especificado'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] p-3.5 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-[#c5a059]" /> Data de Vencimento
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {formatData(lancamento.dataVencimento)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] p-3.5 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#c5a059]" /> Data da Baixa / Pagamento
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {formatData(lancamento.dataPagamento)}
              </p>
            </div>
          </div>

          {/* Vínculo Cliente & Processo */}
          {(lancamento.cliente || lancamento.processo) && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059] block">
                Auditoria e Vinculação Jurídica
              </span>
              {lancamento.cliente && (
                <div className="flex items-center gap-2.5 text-xs">
                  <User className="h-4 w-4 text-[#c5a059] shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400">Cliente:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {lancamento.cliente.nome} ({lancamento.cliente.cpf_cnpj})
                  </span>
                </div>
              )}
              {lancamento.processo && (
                <div className="flex items-center gap-2.5 text-xs">
                  <Scale className="h-4 w-4 text-[#c5a059] shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400">Processo:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                    {lancamento.processo.numero_processo} - {lancamento.processo.titulo}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          {lancamento.observacoes && (
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] p-4 text-xs">
              <span className="text-slate-400 font-medium block mb-1">Notas Contábeis:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {lancamento.observacoes}
              </p>
            </div>
          )}
        </div>

        {/* Footer & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200/60 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(lancamento.id)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir</span>
            </button>
            <button
              type="button"
              onClick={() => onEdit(lancamento)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Editar</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition cursor-pointer"
              title="Imprimir comprovante"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {lancamento.status !== 'PAGO' ? (
              <button
                type="button"
                onClick={() => onToggleStatus(lancamento.id, 'PAGO')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{isReceita ? 'Confirmar Recebimento' : 'Confirmar Pagamento'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleStatus(lancamento.id, 'PENDENTE')}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Reverter para Pendente</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
