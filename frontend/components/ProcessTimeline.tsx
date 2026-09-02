'use client';

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';

export interface ComplementoItem {
  codigo?: number;
  nome?: string;
  valor?: string | number | boolean;
  descricao?: string;
}

export interface MovimentacaoDataJud {
  id?: string | number;
  codigo?: number;
  /** Título/Descrição tabelada do ato no padrão CNJ */
  descricaoTabelada?: string;
  nome?: string;
  descricao?: string;
  titulo?: string;
  /** Data e hora do andamento no DataJud */
  dataHora?: string;
  data?: string;
  dataMovimento?: string;
  data_hora?: string;
  /** Texto complementar ou observação */
  textoComplementar?: string;
  complemento?: string | Record<string, unknown>;
  complementos?: ComplementoItem[] | string[] | Array<{
    codigo?: number;
    nome?: string;
    valor?: string | number | boolean;
    descricao?: string;
  }>;
  complementosTabelados?: ComplementoItem[];
}

export interface ProcessTimelineProps<T extends MovimentacaoDataJud = MovimentacaoDataJud> {
  /** Array de movimentações retornado pelo DataJud ou cadastrado no processo */
  movimentacoes: T[];
  /** Indica se os dados estão sendo requisitados */
  loading?: boolean;
  /** Mensagem exibida caso o array esteja vazio */
  emptyMessage?: string;
  /** Descrição auxiliar para o estado vazio */
  emptyDescription?: string;
  /** Limite inicial de movimentações exibidas antes de expandir */
  initialDisplayCount?: number;
  /** Permite busca textual rápida pelas movimentações */
  searchable?: boolean;
  /** Exibe o código CNJ do movimento caso existente */
  showCodeBadge?: boolean;
  /** Classes CSS adicionais para o container externo */
  className?: string;
}

/**
 * Extrai o timestamp numérico para ordenação decrescente precisa
 */
function extractTimestamp(item: MovimentacaoDataJud): number {
  const rawDate =
    item.dataHora ||
    item.data ||
    item.dataMovimento ||
    item.data_hora;

  if (!rawDate) return 0;

  // Se já for numérico (ms)
  if (typeof rawDate === 'number') return rawDate;

  // Tenta parse direto de ISO ou formato padrão
  const parsed = Date.parse(rawDate);
  if (!isNaN(parsed)) return parsed;

  // Trata formato comum brasileiro DD/MM/YYYY ou DD/MM/YYYY HH:mm:ss
  const brMatch = String(rawDate).match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (brMatch) {
    const [, day, month, year, hours = '00', mins = '00', secs = '00'] = brMatch;
    const dateObj = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(mins),
      Number(secs)
    );
    return dateObj.getTime();
  }

  return 0;
}

/**
 * Formata a data e hora para apresentação jurídica refinada
 */
function formatarDataMovimentacao(item: MovimentacaoDataJud): string {
  const rawDate =
    item.dataHora ||
    item.data ||
    item.dataMovimento ||
    item.data_hora;

  if (!rawDate) return 'Data não informada';

  try {
    const timestamp = extractTimestamp(item);
    if (timestamp > 0) {
      const date = new Date(timestamp);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return String(rawDate);
  } catch {
    return String(rawDate);
  }
}

/**
 * Obtém o título principal da movimentação (priorizando descricaoTabelada)
 */
function getTituloMovimentacao(item: MovimentacaoDataJud): string {
  return (
    item.descricaoTabelada ||
    item.nome ||
    item.descricao ||
    item.titulo ||
    'Movimentação Processual'
  );
}

/**
 * Extrai e estrutura o texto complementar / detalhes da movimentação
 */
function getTextoComplementar(item: MovimentacaoDataJud): {
  textoSimples?: string;
  itensComplemento: Array<{ chave: string; valor: string }>;
} {
  const itensComplemento: Array<{ chave: string; valor: string }> = [];

  // Se houver textoComplementar explícito como string
  if (typeof item.textoComplementar === 'string' && item.textoComplementar.trim()) {
    return { textoSimples: item.textoComplementar.trim(), itensComplemento };
  }

  // Se houver complemento simples em string
  if (typeof item.complemento === 'string' && item.complemento.trim()) {
    return { textoSimples: item.complemento.trim(), itensComplemento };
  }

  // Se complementos for um array de objetos ou strings
  const complementosList = item.complementosTabelados || item.complementos;
  if (Array.isArray(complementosList) && complementosList.length > 0) {
    for (const comp of complementosList) {
      if (typeof comp === 'string') {
        if (comp.trim()) {
          itensComplemento.push({ chave: 'Observação', valor: comp.trim() });
        }
      } else if (comp && typeof comp === 'object') {
        const chave =
          comp.nome ||
          comp.descricao ||
          (comp.codigo ? `Código ${comp.codigo}` : 'Complemento');
        const valor = String(
          comp.valor !== undefined
            ? comp.valor
            : comp.descricao !== undefined
            ? comp.descricao
            : ''
        );
        if (valor) {
          itensComplemento.push({ chave, valor });
        }
      }
    }
  }

  // Se complemento for um objeto chave/valor
  if (
    item.complemento &&
    typeof item.complemento === 'object' &&
    !Array.isArray(item.complemento)
  ) {
    for (const [k, v] of Object.entries(item.complemento)) {
      if (v !== undefined && v !== null && v !== '') {
        itensComplemento.push({ chave: k, valor: String(v) });
      }
    }
  }

  return { itensComplemento };
}

/**
 * Componente ProcessTimeline
 *
 * Responsável por exibir o array de movimentações do DataJud organizadas verticalmente:
 * - Visual: Ponto azul conectado por uma linha cinza contínua para cada evento.
 * - Dados: Data formatada, título da movimentação (`descricaoTabelada`) em negrito e texto complementar abaixo.
 * - Ordenação: Garante que a movimentação mais recente apareça sempre no topo.
 */
export function ProcessTimeline<T extends MovimentacaoDataJud = MovimentacaoDataJud>({
  movimentacoes = [],
  loading = false,
  emptyMessage = 'Nenhuma movimentação registrada',
  emptyDescription = 'Não foram encontrados andamentos ou atos processuais para este processo até o momento.',
  initialDisplayCount = 10,
  searchable = true,
  showCodeBadge = true,
  className = '',
}: ProcessTimelineProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Ordenação garantida: Mais recente sempre no topo
  const sortedMovimentacoes = useMemo(() => {
    if (!movimentacoes || movimentacoes.length === 0) return [];
    return [...movimentacoes].sort((a, b) => {
      const timeA = extractTimestamp(a);
      const timeB = extractTimestamp(b);
      // Mais recente no topo (decrescente)
      return timeB - timeA;
    });
  }, [movimentacoes]);

  // Filtro textual por termo de busca
  const filteredMovimentacoes = useMemo(() => {
    if (!searchQuery.trim()) return sortedMovimentacoes;
    const term = searchQuery.toLowerCase().trim();
    return sortedMovimentacoes.filter((mov) => {
      const titulo = getTituloMovimentacao(mov).toLowerCase();
      const dataStr = formatarDataMovimentacao(mov).toLowerCase();
      const { textoSimples, itensComplemento } = getTextoComplementar(mov);
      const complementosStr = [
        textoSimples || '',
        ...itensComplemento.map((c) => `${c.chave} ${c.valor}`),
      ]
        .join(' ')
        .toLowerCase();

      return (
        titulo.includes(term) ||
        dataStr.includes(term) ||
        complementosStr.includes(term) ||
        (mov.codigo && String(mov.codigo).includes(term))
      );
    });
  }, [sortedMovimentacoes, searchQuery]);

  // Paginação/limite de visualização expansível
  const displayedMovimentacoes = useMemo(() => {
    if (showAll || filteredMovimentacoes.length <= initialDisplayCount) {
      return filteredMovimentacoes;
    }
    return filteredMovimentacoes.slice(0, initialDisplayCount);
  }, [filteredMovimentacoes, showAll, initialDisplayCount]);

  // ==========================================
  // ESTADO 1: CARREGANDO (SKELETONS)
  // ==========================================
  if (loading) {
    return (
      <div
        className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
      >
        {/* Cabeçalho do Skeleton */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-3.5 w-64 rounded-md opacity-70" />
            </div>
          </div>
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>

        {/* Linha do Tempo Skeleton */}
        <div className="mt-8 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          <div className="space-y-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="relative">
                {/* Ponto simulado */}
                <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-300 dark:border-slate-900 dark:bg-slate-700" />
                <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-32 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-md opacity-60" />
                  </div>
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-lg opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ESTADO 2: ARRAY VAZIO
  // ==========================================
  if (sortedMovimentacoes.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0047ab] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50">
          <Clock className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white tracking-tight">
          {emptyMessage}
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {emptyDescription}
        </p>
      </div>
    );
  }

  // ==========================================
  // ESTADO 3: LINHA DO TEMPO COMPLETA
  // ==========================================
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {/* Cabeçalho da Linha do Tempo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0047ab]/10 text-[#0047ab] dark:bg-blue-500/20 dark:text-blue-400 border border-[#0047ab]/20 dark:border-blue-500/30">
            <Clock className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
              Linha do Tempo de Movimentações
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Histórico cronológico ordenado do ato mais recente ao mais antigo.
            </p>
          </div>
        </div>

        {/* Contador de Atos */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <FileText className="h-3 w-3 text-slate-500" />
            <span>
              {sortedMovimentacoes.length}{' '}
              {sortedMovimentacoes.length === 1 ? 'movimento' : 'movimentos'}
            </span>
          </span>
        </div>
      </div>

      {/* Barra de Busca Opcional */}
      {searchable && sortedMovimentacoes.length > 3 && (
        <div className="mt-4">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por termo, tipo de despacho ou complemento..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 transition focus:border-[#0047ab] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0047ab]/15 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista Vertical de Movimentações */}
      {filteredMovimentacoes.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Nenhuma movimentação corresponde ao filtro &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <ol
          role="list"
          className="mt-6 relative pl-7 before:absolute before:left-[11px] before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700"
        >
          {displayedMovimentacoes.map((mov, index) => {
            const isMaisRecente = index === 0 && !searchQuery;
            const dataFormatada = formatarDataMovimentacao(mov);
            const titulo = getTituloMovimentacao(mov);
            const { textoSimples, itensComplemento } = getTextoComplementar(mov);
            const itemKey =
              mov.id ||
              `${mov.codigo || 'mov'}-${mov.dataHora || mov.data || index}`;

            return (
              <li key={itemKey} className="relative group pb-6 last:pb-0">
                {/* Visual: Ponto Azul conectado pela Linha Cinza */}
                <div
                  className={`absolute -left-[23px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 transition-transform duration-150 group-hover:scale-110 ${
                    isMaisRecente
                      ? 'bg-[#0047ab] ring-4 ring-[#0047ab]/20 dark:bg-blue-500 dark:ring-blue-500/25 shadow-xs'
                      : 'bg-[#0047ab] dark:bg-blue-500 shadow-2xs'
                  }`}
                  aria-hidden="true"
                >
                  {/* Ponto interno sutil para o evento mais recente */}
                  {isMaisRecente && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-slate-950" />
                  )}
                </div>

                {/* Card de Conteúdo da Movimentação */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-slate-100/70 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/80">
                  {/* Topo do Card: Data Formatada e Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <Calendar
                        className="h-3.5 w-3.5 text-[#0047ab] dark:text-blue-400 shrink-0"
                        aria-hidden="true"
                      />
                      <time
                        dateTime={
                          mov.dataHora ||
                          mov.data ||
                          mov.dataMovimento ||
                          undefined
                        }
                        className="font-semibold tracking-tight text-slate-800 dark:text-slate-200"
                      >
                        {dataFormatada}
                      </time>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMaisRecente && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-[#0047ab] dark:bg-blue-500/20 dark:text-blue-300 border border-[#0047ab]/20 dark:border-blue-500/30">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>Mais Recente</span>
                        </span>
                      )}

                      {showCodeBadge && mov.codigo && (
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                          Cód. #{mov.codigo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dados: Título da movimentação (descricaoTabelada) em NEGRITO */}
                  <h4 className="mt-2 font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
                    {titulo}
                  </h4>

                  {/* Dados: Texto complementar abaixo */}
                  {textoSimples && (
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed rounded-lg bg-white p-3 border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/90 shadow-2xs">
                      {textoSimples}
                    </div>
                  )}

                  {/* Se houver complementos estruturados tabelados */}
                  {itensComplemento.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 rounded-lg bg-white p-3 text-xs text-slate-600 border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/90 shadow-2xs">
                      {itensComplemento.map((comp, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex flex-col sm:flex-row sm:items-baseline gap-1"
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                            {comp.chave}:
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 break-words">
                            {comp.valor}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Botão de Expandir / Recolher se houver muitas movimentações */}
      {filteredMovimentacoes.length > initialDisplayCount && (
        <div className="mt-5 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-[#0047ab] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0047ab] active:scale-98 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-blue-400"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Mostrar menos movimentações</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>
                  Ver todas as {filteredMovimentacoes.length} movimentações (
                  +{filteredMovimentacoes.length - initialDisplayCount} restantes)
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProcessTimeline;
