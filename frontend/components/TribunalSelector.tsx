'use client';

import React, { useId, useState, useMemo, forwardRef } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from '@headlessui/react';
import {
  ChevronDown,
  Check,
  Landmark,
  X,
  Search,
  AlertCircle,
} from 'lucide-react';

export interface TribunalOption {
  /** Valor identificador do tribunal (ex: 'tjsp', 'trf3', '') */
  valor?: string;
  value?: string;
  /** Rótulo exibido (ex: 'TJSP - Tribunal de Justiça de São Paulo') */
  rotulo?: string;
  label?: string;
  /** Sigla destacada opcional (ex: 'TJSP', 'STJ') */
  sigla?: string;
  /** Ramo da justiça opcional (ex: 'Estadual', 'Federal', 'Trabalhista', 'Superior') */
  ramo?: string;
}

export interface TribunalSelectorProps {
  /** Lista de tribunais disponíveis */
  tribunais: (TribunalOption | string)[];
  /** Valor selecionado (controlado) */
  value?: string;
  /** Valor inicial padrão (não controlado) */
  defaultValue?: string;
  /** Callback acionado ao alterar o tribunal selecionado */
  onChange?: (valor: string) => void;
  /** Rótulo de acessibilidade exibido acima do componente */
  label?: string;
  /** Mensagem ou texto padrão quando nada estiver selecionado */
  placeholder?: string;
  /** Mensagem de erro de validação (ativa borda vermelha e anúncio via leitor de tela) */
  error?: string;
  /** Texto explicativo auxiliar exibido abaixo do seletor */
  helperText?: string;
  /** ID personalizado para ancoragem de acessibilidade */
  id?: string;
  /** Nome do campo em formulários */
  name?: string;
  /** Desabilita a interação com o seletor */
  disabled?: boolean;
  /** Indica campo obrigatório */
  required?: boolean;
  /** Exibe botão de limpeza quando há uma seleção ativa */
  clearable?: boolean;
  /** Exibe ícone institucional de tribunal/justiça à esquerda */
  showIcon?: boolean;
  /** Ativa campo de busca rápida dentro do dropdown (recomendado para listas extensas) */
  searchable?: boolean;
  /** Classes CSS adicionais para o container externo */
  containerClassName?: string;
  /** Classes CSS adicionais para o botão gatilho */
  className?: string;
}

interface NormalizedTribunal {
  value: string;
  label: string;
  sigla: string;
  nomeCompleto: string;
  ramo?: string;
}

/**
 * Normaliza qualquer formato de entrada (objeto com valor/rotulo, value/label ou string simples)
 */
function normalizeOption(item: TribunalOption | string): NormalizedTribunal {
  if (typeof item === 'string') {
    const trimmed = item.trim();
    const parts = trimmed.split(/\s*[-–—]\s*/);
    const sigla = parts[0] || trimmed;
    const nomeCompleto = parts.length > 1 ? parts.slice(1).join(' - ') : trimmed;
    return {
      value: trimmed.toLowerCase(),
      label: trimmed,
      sigla,
      nomeCompleto,
    };
  }

  const rawValue = item.valor !== undefined ? item.valor : item.value !== undefined ? item.value : '';
  const rawLabel = item.rotulo || item.label || rawValue || '';

  // Extrai sigla e nome se houver separador "SIGLA - Descrição"
  let sigla = item.sigla || '';
  let nomeCompleto = rawLabel;

  if (!sigla && rawLabel.includes('-')) {
    const parts = rawLabel.split(/\s*[-–—]\s*/);
    sigla = parts[0].trim();
    nomeCompleto = parts.slice(1).join(' - ').trim();
  } else if (!sigla) {
    sigla = rawValue ? rawValue.toUpperCase() : '';
  }

  return {
    value: String(rawValue),
    label: rawLabel,
    sigla,
    nomeCompleto,
    ramo: item.ramo,
  };
}

/**
 * Componente profissional de seleção de tribunais utilizando Headless UI.
 *
 * Características:
 * - Não utiliza `<select>` nativo: menus customizados com suporte completo a teclado e leitores de tela.
 * - Ícone de dropdown elegante com rotação suave ao abrir/fechar.
 * - Formatação da opção selecionada com cor de destaque Primary (#0047ab / blue-400) contra o fundo escuro (slate-900/slate-950).
 * - Acessibilidade WCAG total: label vinculado, estados aria-expanded, aria-invalid e aria-describedby.
 * - Busca integrada opcional para rápida localização entre dezenas de tribunais.
 */
export const TribunalSelector = forwardRef<HTMLButtonElement, TribunalSelectorProps>(
  (
    {
      tribunais,
      value: controlledValue,
      defaultValue = '',
      onChange,
      label = 'Tribunal',
      placeholder = 'Detectar automaticamente pelo CNJ',
      error,
      helperText,
      id,
      name,
      disabled = false,
      required = false,
      clearable = false,
      showIcon = true,
      searchable = true,
      containerClassName = '',
      className = '',
    },
    ref
  ) => {
    const generatedId = useId();
    const selectorId = id || `tribunal-selector-${generatedId}`;
    const labelId = `${selectorId}-label`;
    const errorId = `${selectorId}-error`;
    const helperId = `${selectorId}-helper`;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string>(defaultValue);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const currentValue = isControlled ? (controlledValue ?? '') : internalValue;

    // Normaliza todas as opções recebidas como prop
    const normalizedOptions = useMemo(() => {
      return (tribunais || []).map(normalizeOption);
    }, [tribunais]);

    // Opção atualmente selecionada
    const selectedOption = useMemo(() => {
      return (
        normalizedOptions.find((opt) => opt.value === currentValue) || null
      );
    }, [normalizedOptions, currentValue]);

    // Filtra opções caso busca esteja ativada
    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return normalizedOptions;
      const q = searchQuery.toLowerCase().trim();
      return normalizedOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(q) ||
          opt.value.toLowerCase().includes(q) ||
          opt.sigla.toLowerCase().includes(q) ||
          opt.nomeCompleto.toLowerCase().includes(q)
      );
    }, [normalizedOptions, searchQuery]);

    const handleSelect = (val: string) => {
      if (disabled) return;
      if (!isControlled) {
        setInternalValue(val);
      }
      onChange?.(val);
      setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (disabled) return;
      if (!isControlled) {
        setInternalValue('');
      }
      onChange?.('');
      setSearchQuery('');
    };

    const hasError = Boolean(error);

    // Classes dinâmicas de borda baseadas em erro ou estado normal
    const borderClasses = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-500'
      : 'border-slate-700 hover:border-slate-600 focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/25 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

    const isCustomSelected = Boolean(selectedOption && selectedOption.value !== '');

    return (
      <div className={`w-full text-left font-sans ${containerClassName}`}>
        {/* Label acessível vinculado */}
        {label && (
          <label
            id={labelId}
            htmlFor={selectorId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 transition-colors"
          >
            <span>{label}</span>
            {required && (
              <span
                aria-hidden="true"
                className="text-red-500 ml-1 font-bold"
                title="Campo obrigatório"
              >
                *
              </span>
            )}
          </label>
        )}

        <Listbox
          value={currentValue}
          onChange={handleSelect}
          disabled={disabled}
          name={name}
        >
          {({ open }) => (
            <div className="relative w-full">
              {/* Botão de Trigger personalizado */}
              <ListboxButton
                ref={ref}
                id={selectorId}
                aria-labelledby={label ? labelId : undefined}
                aria-describedby={
                  hasError ? errorId : helperText ? helperId : undefined
                }
                aria-invalid={hasError ? 'true' : 'false'}
                className={`
                  group relative flex w-full items-center justify-between
                  rounded-xl border bg-slate-900 dark:bg-slate-950
                  py-2.5 text-xs sm:text-sm font-sans
                  outline-hidden transition-all duration-150 shadow-2xs
                  disabled:cursor-not-allowed disabled:opacity-50
                  ${showIcon ? 'pl-10' : 'pl-3.5'}
                  ${clearable && isCustomSelected && !disabled ? 'pr-16' : 'pr-9'}
                  ${borderClasses}
                  ${open ? 'border-[#0047ab] ring-2 ring-[#0047ab]/20 dark:border-blue-500 dark:ring-blue-500/20' : ''}
                  ${className}
                `}
              >
                {/* Ícone contextual de Justiça/Tribunal à esquerda */}
                {showIcon && (
                  <div
                    className={`pointer-events-none absolute left-3.5 flex items-center transition-colors duration-150 ${
                      hasError
                        ? 'text-red-500'
                        : open || isCustomSelected
                        ? 'text-[#0047ab] dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                    aria-hidden="true"
                  >
                    <Landmark className="h-4 w-4 shrink-0" />
                  </div>
                )}

                {/* Conteúdo selecionado formatado com destaque Primary contra o fundo escuro */}
                <div className="flex items-center gap-2 truncate text-left">
                  {selectedOption ? (
                    isCustomSelected ? (
                      <div className="flex items-center gap-2 truncate">
                        {/* Tag/Badge de destaque com a cor primary */}
                        {selectedOption.sigla && (
                          <span className="shrink-0 rounded-md bg-[#0047ab]/20 px-1.5 py-0.5 text-[11px] font-mono font-bold text-[#0047ab] dark:bg-blue-500/20 dark:text-blue-400 border border-[#0047ab]/30 dark:border-blue-500/30">
                            {selectedOption.sigla}
                          </span>
                        )}
                        <span className="truncate font-medium text-blue-100 dark:text-blue-200">
                          {selectedOption.nomeCompleto || selectedOption.label}
                        </span>
                      </div>
                    ) : (
                      <span className="truncate text-slate-300 dark:text-slate-300">
                        {selectedOption.label}
                      </span>
                    )
                  ) : (
                    <span className="truncate text-slate-500">{placeholder}</span>
                  )}
                </div>

                {/* Ações à direita: botão de limpar e ícone elegante de chevron */}
                <div className="absolute right-2.5 flex items-center gap-1">
                  {clearable && isCustomSelected && !disabled && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors"
                      title="Limpar seleção de tribunal"
                      aria-label="Limpar seleção de tribunal"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}

                  {/* Ícone de dropdown elegante com transição suave */}
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ease-out ${
                      open ? 'rotate-180 text-[#0047ab] dark:text-blue-400' : 'group-hover:text-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </ListboxButton>

              {/* Menu suspenso de opções com animação refinada */}
              <Transition
                show={open}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-98 -translate-y-1"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-98 -translate-y-1"
              >
                <ListboxOptions
                  static
                  className="absolute z-50 mt-1.5 max-h-72 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/80 dark:border-slate-800 dark:bg-slate-950 focus:outline-hidden"
                >
                  {/* Campo de pesquisa interna quando searchable=true */}
                  {searchable && normalizedOptions.length > 5 && (
                    <div className="border-b border-slate-800 p-2 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xs">
                      <div className="relative flex items-center">
                        <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Filtrar por sigla, nome ou estado..."
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-7 text-xs text-slate-100 placeholder:text-slate-500 focus:border-[#0047ab] focus:outline-hidden dark:bg-slate-900 dark:focus:border-blue-500"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 text-slate-400 hover:text-slate-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lista de itens rolável com barra de rolagem estilizada */}
                  <div className="max-h-56 overflow-y-auto p-1 text-xs">
                    {filteredOptions.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-500">
                        Nenhum tribunal encontrado para &ldquo;{searchQuery}&rdquo;
                      </div>
                    ) : (
                      filteredOptions.map((opt) => (
                        <ListboxOption
                          key={opt.value || '__auto__'}
                          value={opt.value}
                          className={({ focus, selected }) => `
                            relative flex cursor-pointer select-none items-center justify-between
                            rounded-lg px-3 py-2 text-xs transition-colors duration-100 outline-hidden
                            ${
                              selected
                                ? 'bg-[#0047ab]/20 text-blue-300 font-semibold border-l-2 border-[#0047ab] dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500'
                                : focus
                                ? 'bg-slate-800 text-slate-100'
                                : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                            }
                          `}
                        >
                          {({ selected }) => (
                            <>
                              <div className="flex items-center gap-2 truncate pr-2">
                                {/* Sigla destacada em badge primary */}
                                {opt.sigla && opt.value !== '' ? (
                                  <span
                                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold transition-colors ${
                                      selected
                                        ? 'bg-[#0047ab] text-white dark:bg-blue-500 dark:text-white'
                                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                                    }`}
                                  >
                                    {opt.sigla}
                                  </span>
                                ) : null}

                                <span className="truncate">
                                  {opt.nomeCompleto || opt.label}
                                </span>
                              </div>

                              {/* Ícone de confirmação quando selecionado com cor primary */}
                              {selected && (
                                <span
                                  className="flex shrink-0 items-center text-[#0047ab] dark:text-blue-400"
                                  aria-hidden="true"
                                >
                                  <Check className="h-4 w-4 stroke-[2.5]" />
                                </span>
                              )}
                            </>
                          )}
                        </ListboxOption>
                      ))
                    )}
                  </div>
                </ListboxOptions>
              </Transition>
            </div>
          )}
        </Listbox>

        {/* Descrição de erro acessível por leitores de tela */}
        {hasError ? (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400 animate-in fade-in duration-150"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p
            id={helperId}
            className="mt-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

TribunalSelector.displayName = 'TribunalSelector';

export default TribunalSelector;
