'use client';

import React, { useState } from 'react';
import {
  X,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  LancamentoFinanceiro,
  CreateLancamentoInput,
  TipoLancamento,
  CategoriaLancamento,
  StatusLancamento,
} from '@/services/financeiroService';
import { Cliente } from '@/services/clienteService';
import { Processo } from '@/services/processoService';

interface LancamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateLancamentoInput) => Promise<void>;
  initialData?: LancamentoFinanceiro | null;
  clientes: Cliente[];
  processos: Processo[];
  defaultTipo?: TipoLancamento;
}

export function LancamentoModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  clientes,
  processos,
  defaultTipo = 'RECEITA',
}: LancamentoModalProps) {
  if (!isOpen) return null;

  return (
    <LancamentoModalForm
      key={initialData ? initialData.id : 'new-lancamento'}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
      clientes={clientes}
      processos={processos}
      defaultTipo={defaultTipo}
    />
  );
}

function LancamentoModalForm({
  onClose,
  onSave,
  initialData,
  clientes,
  processos,
  defaultTipo = 'RECEITA',
}: Omit<LancamentoModalProps, 'isOpen'>) {
  const hoje = new Date().toISOString().split('T')[0];

  const [tipo, setTipo] = useState<TipoLancamento>(
    initialData ? initialData.tipo : defaultTipo,
  );
  const [descricao, setDescricao] = useState(initialData ? initialData.descricao : '');
  const [categoria, setCategoria] = useState<CategoriaLancamento>(
    initialData
      ? initialData.categoria
      : defaultTipo === 'RECEITA'
      ? 'HONORARIO_CONTRATUAL'
      : 'CUSTAS_PROCESSUAIS',
  );
  const [valor, setValor] = useState(initialData ? String(initialData.valor) : '');
  const [dataVencimento, setDataVencimento] = useState(
    initialData ? initialData.dataVencimento.split('T')[0] : hoje,
  );
  const [dataPagamento, setDataPagamento] = useState(
    initialData?.dataPagamento ? initialData.dataPagamento.split('T')[0] : '',
  );
  const [status, setStatus] = useState<StatusLancamento>(
    initialData ? initialData.status : 'PENDENTE',
  );
  const [formaPagamento, setFormaPagamento] = useState(
    initialData?.formaPagamento || 'PIX Bancário',
  );
  const [clienteId, setClienteId] = useState<string>(
    initialData?.clienteId ? String(initialData.clienteId) : '',
  );
  const [processoId, setProcessoId] = useState<string>(
    initialData?.processoId ? String(initialData.processoId) : '',
  );
  const [observacoes, setObservacoes] = useState(initialData?.observacoes || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Se o tipo mudar, atualizar categoria padrão correspondente
  const handleTipoChange = (newTipo: TipoLancamento) => {
    setTipo(newTipo);
    if (newTipo === 'RECEITA') {
      if (categoria === 'CUSTAS_PROCESSUAIS' || categoria === 'OPERACIONAL' || categoria === 'IMPOSTOS') {
        setCategoria('HONORARIO_CONTRATUAL');
      }
    } else {
      if (categoria === 'HONORARIO_CONTRATUAL' || categoria === 'HONORARIO_EXITO' || categoria === 'CONSULTIVO') {
        setCategoria('CUSTAS_PROCESSUAIS');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!descricao.trim()) {
      setErrorMessage('Informe uma descrição clara para o lançamento.');
      return;
    }

    const valorNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) {
      setErrorMessage('Informe um valor válido e positivo.');
      return;
    }

    if (!dataVencimento) {
      setErrorMessage('Informe a data de vencimento.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        descricao: descricao.trim(),
        tipo,
        categoria,
        valor: valorNum,
        dataVencimento,
        dataPagamento: status === 'PAGO' ? (dataPagamento || dataVencimento) : (dataPagamento || null),
        status,
        formaPagamento,
        clienteId: clienteId ? Number(clienteId) : null,
        processoId: processoId ? Number(processoId) : null,
        observacoes: observacoes.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      console.error('Erro ao salvar lançamento:', err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Erro ao salvar lançamento financeiro.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs ${
                tipo === 'RECEITA'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
              }`}
            >
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {initialData ? 'Editar Lançamento Financeiro' : 'Novo Lançamento Financeiro'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Controle de receitas, honorários, despesas operacionais e custas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Seletor de Tipo (Receita vs Despesa) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tipo de Movimentação *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTipoChange('RECEITA')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  tipo === 'RECEITA'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/80 dark:bg-emerald-950/50 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Receita / Honorários (Entrada)
              </button>
              <button
                type="button"
                onClick={() => handleTipoChange('DESPESA')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  tipo === 'DESPESA'
                    ? 'border-rose-500 bg-rose-50/80 text-rose-700 dark:border-rose-500/80 dark:bg-rose-950/50 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Despesa / Custas (Saída)
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Descrição do Lançamento *
            </label>
            <input
              type="text"
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Honorários Contratuais Mensais - Parcela 01/12"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          {/* Categoria & Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Categoria Contábil *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaLancamento)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
              >
                {tipo === 'RECEITA' ? (
                  <>
                    <option value="HONORARIO_CONTRATUAL">Honorário Contratual Fixo</option>
                    <option value="HONORARIO_EXITO">Honorário de Êxito / Sucumbência</option>
                    <option value="CONSULTIVO">Consultivo & Pareceres</option>
                    <option value="OUTROS">Outras Receitas</option>
                  </>
                ) : (
                  <>
                    <option value="CUSTAS_PROCESSUAIS">Custas & Diligências Judiciais</option>
                    <option value="OPERACIONAL">Operacional, Aluguel & Softwares</option>
                    <option value="IMPOSTOS">Impostos (Simples, ISS, DARF)</option>
                    <option value="OUTROS">Outras Despesas</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 pl-10 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>
          </div>

          {/* Vencimento, Data Pagamento & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Data Vencimento *
              </label>
              <input
                type="date"
                required
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value as StatusLancamento;
                  setStatus(newStatus);
                  if (newStatus === 'PAGO' && !dataPagamento) {
                    setDataPagamento(new Date().toISOString().split('T')[0]);
                  }
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Liquidado / Pago</option>
                <option value="ATRASADO">Em Atraso</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Data Liquidação
              </label>
              <input
                type="date"
                disabled={status !== 'PAGO'}
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 px-3 py-2 text-xs text-slate-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Meio de Pagamento / Cobrança
            </label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
            >
              <option value="PIX Bancário">PIX Bancário</option>
              <option value="Boleto Bancário">Boleto Bancário</option>
              <option value="Transferência TED">Transferência TED / DOC</option>
              <option value="Cartão Corporativo">Cartão de Crédito / Débito</option>
              <option value="Depósito Judicial / Alvará">Depósito Judicial / Alvará / MLE</option>
              <option value="DARE / Guia Tributária">DARE / Guia Tributária</option>
              <option value="Espécie / Cheque">Espécie / Dinheiro</option>
            </select>
          </div>

          {/* Vínculo com Cliente & Processo (Opcionais) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Vincular ao Cliente (Opcional)
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
              >
                <option value="">Nenhum cliente específico</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nome} ({c.cpf_cnpj})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Vincular ao Processo (Opcional)
              </label>
              <select
                value={processoId}
                onChange={(e) => setProcessoId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
              >
                <option value="">Nenhum processo específico</option>
                {processos.map((p) => (
                  <option key={p.id_processo} value={p.id_processo}>
                    {p.numero_processo} - {p.titulo.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Observações & Detalhes da Auditoria
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Nota fiscal 1042 emitida; referente ao acordo judicial homologado na 3ª Vara."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{initialData ? 'Atualizar Lançamento' : 'Salvar Lançamento'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
