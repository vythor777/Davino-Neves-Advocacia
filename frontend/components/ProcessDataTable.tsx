'use client';

import React, { useState } from 'react';
import {
  Eye,
  Copy,
  Check,
  Landmark,
  Calendar,
  User,
  Scale,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import { formatarNumeroCNJ, getStatusBadgeStyle } from '@/components/ProcessosTable';

export interface ProcessoItem {
  id?: string | number;
  id_processo?: number;
  numero_processo?: string;
  numeroProcesso?: string;
  titulo?: string;
  classe?: string;
  descricao?: string;
  cliente?:
    | {
        id_cliente?: number;
        nome: string;
        cpf_cnpj?: string;
      }
    | string;
  id_cliente?: number;
  tribunal?: string;
  orgaoJulgador?: string;
  orgao_julgador?: string;
  grau?: string;
  data_abertura?: string;
  dataAjuizamento?: string;
  data_criacao?: string;
  status?: string;
  assuntos?: string[];
  prazos?: Array<{
    id_prazo: number;
    descricao: string;
    data_limite: string;
    status: string;
  }>;
  documentos?: Array<{
    id_documento: number;
    nome_arquivo: string;
    tipo_documento: string;
  }>;
  _count?: {
    prazos?: number;
    documentos?: number;
  };
}

export interface ProcessDataTableProps<T extends ProcessoItem = ProcessoItem> {
  /** Lista de processos a serem exibidos */
  processos: T[];
  /** Indica se os dados estão sendo carregados da API */
  loading?: boolean;
  /** Quantidade de linhas simuladas no Skeleton durante o loading */
  skeletonRows?: number;
  /** Ação disparada ao clicar no botão 'Ver Detalhes' ou na linha */
  onViewDetails?: (processo: T) => void;
  /** Ação opcional para edição */
  onEdit?: (processo: T) => void;
  /** Ação opcional para exclusão */
  onDelete?: (processo: T) => void;
  /** Mensagem customizada de estado vazio */
  emptyMessage?: string;
  /** Subtítulo/descrição do estado vazio */
  emptyDescription?: string;
  /** Callback para ação primária no empty state */
  onEmptyAction?: () => void;
  /** Rótulo da ação no empty state */
  emptyActionLabel?: string;
  /** Altura máxima do container com scroll (ex: 'max-h-[640px]') */
  maxHeight?: string;
  /** Classes adicionais para o container da tabela */
  className?: string;
  /** Controle de paginação opcional */
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  /** Título acessível para leitores de tela */
  caption?: string;
}

/**
 * Utilitário para extrair com segurança o número CNJ de diferentes formatos de processo
 */
function getNumeroCNJ(item: ProcessoItem): string {
  return item.numero_processo || item.numeroProcesso || '';
}

/**
 * Utilitário para extrair o título ou classe da ação
 */
function getTituloProcesso(item: ProcessoItem): string {
  return item.titulo || item.classe || 'Ação Judicial sem identificação';
}

/**
 * Utilitário para extrair o nome do cliente / parte vinculada
 */
function getNomeCliente(item: ProcessoItem): string {
  if (typeof item.cliente === 'string') return item.cliente;
  if (item.cliente && typeof item.cliente === 'object' && item.cliente.nome) {
    return item.cliente.nome;
  }
  if (item.id_cliente) return `Cliente #${item.id_cliente}`;
  return 'Não atribuído';
}

/**
 * Utilitário para extrair o tribunal ou órgão julgador
 */
function getTribunalOrgao(item: ProcessoItem): { tribunal: string; orgao: string } {
  const tribunal = item.tribunal ? item.tribunal.toUpperCase() : '';
  const orgao = item.orgaoJulgador || item.orgao_julgador || '';
  return { tribunal, orgao };
}

/**
 * Utilitário para formatar a data de distribuição/abertura
 */
function getDataFormatada(item: ProcessoItem): string {
  const data = item.data_abertura || item.dataAjuizamento || item.data_criacao;
  if (!data) return '—';
  try {
    return new Date(data).toLocaleDateString('pt-BR');
  } catch {
    return String(data);
  }
}

/**
 * Componente ProcessDataTable
 *
 * Características:
 * - Layout Profissional: Cabeçalhos fixos com backdrop blur, linhas com efeito hover contrastante e truncagem com reticências e tooltips nativos.
 * - Skeletons de Carregamento: Renderiza linhas de pulsação ocupando o lugar das linhas enquanto os dados reais não chegam da API.
 * - Ações: Coluna final com botão destacado 'Ver Detalhes' para visualização do processo.
 * - Acessibilidade completa (WCAG): Contraste rigoroso, navegação via teclado, atributos aria e marcação semântica de tabela.
 */
export function ProcessDataTable<T extends ProcessoItem = ProcessoItem>({
  processos,
  loading = false,
  skeletonRows = 5,
  onViewDetails,
  onEdit,
  onDelete,
  emptyMessage = 'Nenhum processo localizado',
  emptyDescription = 'Não foram encontrados registros para os parâmetros pesquisados.',
  onEmptyAction,
  emptyActionLabel = 'Cadastrar Novo Processo',
  maxHeight = 'max-h-[640px]',
  className = '',
  currentPage = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  caption = 'Tabela de Processos Judiciais',
}: ProcessDataTableProps<T>) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCNJ = (e: React.MouseEvent, cnj: string, idKey: string) => {
    e.stopPropagation();
    if (!cnj) return;
    navigator.clipboard.writeText(cnj);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const total = totalItems !== undefined ? totalItems : processos.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Paginação no cliente se totalItems não for controlado externamente
  const displayedItems =
    totalItems !== undefined
      ? processos
      : processos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ==========================================
  // ESTADO 1: SKELETONS DE CARREGAMENTO
  // ==========================================
  if (loading) {
    return (
      <div
        className={`flex flex-col w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
      >
        <div className={`overflow-x-auto ${maxHeight}`}>
          <table className="w-full text-left border-collapse" aria-busy="true">
            <caption className="sr-only">Carregando processos judiciais...</caption>
            {/* Cabeçalho Fixo */}
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-300">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-4 text-xs font-medium tracking-tight w-72">
                  Processo (CNJ) / Ação
                </th>
                <th scope="col" className="px-4 py-3.5 text-xs font-medium tracking-tight">
                  Cliente Vinculado
                </th>
                <th scope="col" className="px-4 py-3.5 text-xs font-medium tracking-tight">
                  Tribunal / Órgão
                </th>
                <th scope="col" className="px-4 py-3.5 text-xs font-medium tracking-tight">
                  Distribuição
                </th>
                <th scope="col" className="px-4 py-3.5 text-xs font-medium tracking-tight">
                  Status
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-6 text-right text-xs font-medium tracking-tight w-36"
                >
                  Ações
                </th>
              </tr>
            </thead>

            {/* Linhas de Pulsação (Skeletons) */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {Array.from({ length: skeletonRows }).map((_, index) => (
                <tr key={`skel-row-${index}`} className="p-4">
                  {/* Processo CNJ e Título */}
                  <td className="py-4 pl-6 pr-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-44 font-mono rounded-md" />
                      <Skeleton className="h-3.5 w-60 opacity-80" />
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="px-4 py-4">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24 opacity-60" />
                    </div>
                  </td>

                  {/* Tribunal */}
                  <td className="px-4 py-4">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-20 rounded-md" />
                      <Skeleton className="h-3 w-32 opacity-60" />
                    </div>
                  </td>

                  {/* Distribuição */}
                  <td className="px-4 py-4">
                    <Skeleton className="h-3.5 w-20" />
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </td>

                  {/* Botão Ver Detalhes */}
                  <td className="py-4 pl-4 pr-6 text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-28 rounded-xl" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Barra de Rodapé Simulada durante Carregamento */}
        <div className="border-t border-slate-200 bg-slate-50/60 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
          <Skeleton className="h-3.5 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ESTADO 2: TABELA VAZIA (EMPTY STATE)
  // ==========================================
  if (processos.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50">
          <Scale className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white tracking-tight">
          {emptyMessage}
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {emptyDescription}
        </p>
        {onEmptyAction && (
          <button
            type="button"
            onClick={onEmptyAction}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0047ab] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#003785] dark:bg-blue-600 dark:hover:bg-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0047ab] active:scale-98 transition-all"
          >
            <span>{emptyActionLabel}</span>
          </button>
        )}
      </div>
    );
  }

  // ==========================================
  // ESTADO 3: TABELA PROFISSIONAL POPULADA
  // ==========================================
  return (
    <div
      className={`flex flex-col w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800/90 dark:bg-slate-900 ${className}`}
    >
      <div className={`overflow-x-auto ${maxHeight} focus:outline-hidden`}>
        <table className="w-full text-left border-collapse text-xs">
          <caption className="sr-only">{caption}</caption>

          {/* Cabeçalhos Fixos (Sticky Top) */}
          <thead className="sticky top-0 z-10 border-b border-slate-200/90 bg-slate-50/95 backdrop-blur-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-300">
            <tr>
              <th scope="col" className="py-3.5 pl-6 pr-4 font-medium tracking-tight">
                Processo (CNJ) / Ação
              </th>
              <th scope="col" className="px-4 py-3.5 font-medium tracking-tight">
                Cliente Vinculado
              </th>
              <th scope="col" className="px-4 py-3.5 font-medium tracking-tight">
                Tribunal / Órgão
              </th>
              <th scope="col" className="px-4 py-3.5 font-medium tracking-tight">
                Distribuição
              </th>
              <th scope="col" className="px-4 py-3.5 font-medium tracking-tight">
                Status
              </th>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-6 text-right font-medium tracking-tight"
              >
                Ações
              </th>
            </tr>
          </thead>

          {/* Linhas com Efeito Hover */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {displayedItems.map((proc, index) => {
              const rawCNJ = getNumeroCNJ(proc);
              const formattedCNJ = formatarNumeroCNJ(rawCNJ);
              const titulo = getTituloProcesso(proc);
              const nomeCliente = getNomeCliente(proc);
              const { tribunal, orgao } = getTribunalOrgao(proc);
              const dataFormatada = getDataFormatada(proc);
              const statusText = proc.status || 'Ativo';
              const rowKey =
                proc.id_processo ||
                proc.id ||
                rawCNJ ||
                `proc-item-${index}`;
              const isCopied = copiedId === String(rowKey);

              return (
                <tr
                  key={String(rowKey)}
                  onClick={() => onViewDetails?.(proc)}
                  style={{ animationDelay: `${Math.min(index * 25, 200)}ms` }}
                  className="animate-row-fade-in group transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onViewDetails?.(proc);
                    }
                  }}
                  aria-label={`Processo ${formattedCNJ}, ação ${titulo}`}
                >
                  {/* Coluna 1: Processo (CNJ) / Ação com Truncagem */}
                  <td className="py-3.5 pl-6 pr-4">
                    <div className="flex flex-col gap-1 max-w-xs sm:max-w-sm lg:max-w-md">
                      {/* CNJ e Botão de Copiar */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                          {formattedCNJ || 'Sem número informado'}
                        </span>
                        {rawCNJ && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyCNJ(e, rawCNJ, String(rowKey))}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0047ab] transition-colors"
                            title="Copiar número CNJ completo"
                            aria-label={`Copiar CNJ do processo ${formattedCNJ}`}
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Título com Truncagem e Reticências */}
                      <p
                        className="truncate text-xs font-medium text-slate-700 group-hover:text-[#0047ab] dark:text-slate-300 dark:group-hover:text-blue-400 transition-colors"
                        title={titulo}
                      >
                        {titulo}
                      </p>

                      {/* Descrição resumida opcional com truncagem */}
                      {proc.descricao && (
                        <p
                          className="truncate text-[11px] text-slate-400 dark:text-slate-500"
                          title={proc.descricao}
                        >
                          {proc.descricao}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Coluna 2: Cliente Vinculado com Truncagem */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 max-w-[180px] sm:max-w-[220px]">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <User className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span
                          className="truncate font-medium text-slate-900 dark:text-slate-100"
                          title={nomeCliente}
                        >
                          {nomeCliente}
                        </span>
                        {typeof proc.cliente === 'object' && proc.cliente?.cpf_cnpj && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {proc.cliente.cpf_cnpj}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Coluna 3: Tribunal / Órgão Julgador com Truncagem */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-0.5 max-w-[160px] sm:max-w-[200px]">
                      {tribunal ? (
                        <span className="inline-flex w-fit items-center gap-1 rounded-md bg-[#0047ab]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#0047ab] dark:bg-blue-500/20 dark:text-blue-400 border border-[#0047ab]/20 dark:border-blue-500/30">
                          <Landmark className="h-3 w-3" aria-hidden="true" />
                          <span>{tribunal}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Tribunal pendente</span>
                      )}
                      {orgao && (
                        <span
                          className="truncate text-[11px] text-slate-500 dark:text-slate-400"
                          title={orgao}
                        >
                          {orgao}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Coluna 4: Distribuição */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{dataFormatada}</span>
                    </div>
                  </td>

                  {/* Coluna 5: Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${getStatusBadgeStyle(
                        statusText
                      )}`}
                    >
                      {statusText}
                    </span>
                  </td>

                  {/* Coluna 6: Ações (Botão 'Ver Detalhes') */}
                  <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails?.(proc);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-[#0047ab]/30 hover:bg-[#0047ab]/5 hover:text-[#0047ab] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0047ab] active:scale-98 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                        title="Ver detalhes completos do processo"
                        aria-label={`Ver detalhes do processo ${formattedCNJ || titulo}`}
                      >
                        <Eye className="h-3.5 w-3.5 text-[#0047ab] dark:text-blue-400" aria-hidden="true" />
                        <span>Ver Detalhes</span>
                      </button>

                      {onEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(proc);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0047ab] transition-colors"
                          title="Editar processo"
                          aria-label={`Editar processo ${formattedCNJ || titulo}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(proc);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
                          title="Excluir processo"
                          aria-label={`Excluir processo ${formattedCNJ || titulo}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginação / Resumo Inferior */}
      <div className="border-t border-slate-200 bg-slate-50/70 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Exibindo <span className="font-semibold text-slate-700 dark:text-slate-200">{startItem}</span> a{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{endItem}</span> de{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span> processos
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Anterior</span>
            </button>

            <span className="px-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              aria-label="Próxima página"
            >
              <span>Próxima</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProcessDataTable;
