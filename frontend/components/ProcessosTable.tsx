'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Processo } from '@/services/processoService';
import {
  Clock,
  Copy,
  Check,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Scale,
  PlusCircle,
} from 'lucide-react';

interface ProcessosTableProps {
  processos: Processo[];
  loading?: boolean;
  onViewDetails: (processo: Processo) => void;
  onEdit: (processo: Processo) => void;
  onDelete: (processo: Processo) => void;
  onCreateNew?: () => void;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function formatarNumeroCNJ(valor: string): string {
  const digits = (valor || '').replace(/\D/g, '').slice(0, 20);
  if (digits.length <= 7) return digits;
  if (digits.length <= 9) return digits.replace(/^(\d{7})(\d+)/, '$1-$2');
  if (digits.length <= 13) return digits.replace(/^(\d{7})(\d{2})(\d+)/, '$1-$2.$3');
  if (digits.length <= 14) return digits.replace(/^(\d{7})(\d{2})(\d{4})(\d+)/, '$1-$2.$3.$4');
  if (digits.length <= 16) return digits.replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d+)/, '$1-$2.$3.$4.$5');
  return digits.replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{1,4})/, '$1-$2.$3.$4.$5.$6');
}

export function getStatusBadgeStyle(status: string) {
  const s = (status || '').toLowerCase();
  if (s.includes('andamento')) {
    return 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300';
  }
  if (s.includes('distribuído') || s.includes('distribuido')) {
    return 'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/40 dark:border-sky-900/60 dark:text-sky-300';
  }
  if (s.includes('concluso') || s.includes('decisão') || s.includes('despacho')) {
    return 'bg-purple-50 text-purple-800 border-purple-200/80 dark:bg-purple-950/40 dark:border-purple-900/60 dark:text-purple-300';
  }
  if (s.includes('audiência') || s.includes('audiencia')) {
    return 'bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-300';
  }
  if (s.includes('suspenso') || s.includes('aguardando')) {
    return 'bg-orange-50 text-orange-800 border-orange-200/80 dark:bg-orange-950/40 dark:border-orange-900/60 dark:text-orange-300';
  }
  if (s.includes('finalizado') || s.includes('julgado')) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300';
  }
  if (s.includes('arquivado')) {
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300';
}

export function ProcessosTable({
  processos,
  loading = false,
  onViewDetails,
  onEdit,
  onDelete,
  onCreateNew,
  currentPage = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: ProcessosTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const total = totalItems !== undefined ? totalItems : processos.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Paginação local se totalItems não for controlado externamente
  const displayedItems =
    totalItems !== undefined
      ? processos
      : processos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (processos.length === 0 && !loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
          <Scale className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
          Nenhum processo localizado
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          Não encontramos processos com os critérios informados. Ajuste a busca ou cadastre um novo registro.
        </p>
        {onCreateNew && (
          <button
            type="button"
            onClick={onCreateNew}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Cadastrar Processo
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800/90 dark:bg-slate-900 overflow-hidden">
      {/* Wrapper com Scroll Vertical e Horizontal */}
      <div className="relative max-h-[620px] overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Header com backdrop blur */}
          <thead className="sticky top-0 z-10 border-b border-slate-200/90 bg-slate-50/95 backdrop-blur-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-300">
            <tr>
              <th className="py-3.5 pl-6 pr-4 font-medium tracking-tight">Processo (CNJ) / Ação</th>
              <th className="px-4 py-3.5 font-medium tracking-tight">Cliente Vinculado</th>
              <th className="px-4 py-3.5 font-medium tracking-tight">Status Atual</th>
              <th className="px-4 py-3.5 font-medium tracking-tight">Distribuição</th>
              <th className="px-4 py-3.5 font-medium tracking-tight">Prazos</th>
              <th className="py-3.5 pl-4 pr-6 text-right font-medium tracking-tight">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {displayedItems.map((proc) => {
              const countPrazos = proc._count?.prazos ?? proc.prazos?.length ?? 0;
              const formattedDate = proc.data_abertura
                ? new Date(proc.data_abertura).toLocaleDateString('pt-BR')
                : '—';

              return (
                <tr
                  key={proc.id_processo}
                  className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  {/* Número CNJ e Ação */}
                  <td className="py-3.5 pl-6 pr-4">
                    <div className="flex flex-col gap-0.5 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-[11px] tracking-tight">
                          {formatarNumeroCNJ(proc.numero_processo)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(proc.numero_processo, `cnj-${proc.id_processo}`)
                          }
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
                          title="Copiar número CNJ"
                        >
                          {copiedId === `cnj-${proc.id_processo}` ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onViewDetails(proc)}
                        className="text-left font-medium text-slate-800 hover:text-amber-800 dark:text-slate-200 dark:hover:text-amber-400 truncate transition-colors"
                        title={proc.titulo}
                      >
                        {proc.titulo}
                      </button>
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="px-4 py-3.5">
                    {proc.cliente ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                          {proc.cliente.nome}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {proc.cliente.cpf_cnpj}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">ID #{proc.id_cliente}</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide ${getStatusBadgeStyle(
                        proc.status,
                      )}`}
                    >
                      {proc.status}
                    </span>
                  </td>

                  {/* Data de Distribuição */}
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {formattedDate}
                  </td>

                  {/* Prazos */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Link
                      href={`/prazos?processo=${proc.id_processo}`}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        countPrazos > 0
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Clock className="h-2.5 w-2.5" />
                      {countPrazos} {countPrazos === 1 ? 'prazo' : 'prazos'}
                    </Link>
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onViewDetails(proc)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(proc)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(proc)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rodapé Elegante com Paginação Assíncrona */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/90 bg-slate-50/70 px-6 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Exibindo <strong className="font-semibold text-slate-900 dark:text-slate-200">{startItem}</strong> a{' '}
            <strong className="font-semibold text-slate-900 dark:text-slate-200">{endItem}</strong> de{' '}
            <strong className="font-semibold text-slate-900 dark:text-slate-200">{total}</strong> registros
          </span>

          {onPageSizeChange && (
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:outline-hidden"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange?.(1)}
            disabled={currentPage <= 1}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-slate-800 transition-colors"
            title="Primeira página"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-slate-800 transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <span className="px-2 text-xs font-medium">
            Página <strong className="text-slate-900 dark:text-slate-100">{currentPage}</strong> de{' '}
            <strong className="text-slate-900 dark:text-slate-100">{totalPages}</strong>
          </span>

          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-slate-800 transition-colors"
            title="Próxima página"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange?.(totalPages)}
            disabled={currentPage >= totalPages}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-slate-800 transition-colors"
            title="Última página"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
