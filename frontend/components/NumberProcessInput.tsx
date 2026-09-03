'use client';

import React, { forwardRef, useId, useState, useCallback, useEffect } from 'react';
import { AlertCircle, Scale, X } from 'lucide-react';
import {
  formatProcessNumber,
  unmaskProcessNumber,
} from '@/hooks/useProcessNumberMask';

export interface NumberProcessInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  /**
   * Texto da etiqueta acessível vinculado ao input através de htmlFor
   */
  label?: string;
  /**
   * Mensagem de erro de validação (ativa a borda vermelha e anúncio via leitor de tela)
   */
  error?: string;
  /**
   * Texto de auxílio exibido abaixo do input quando não há erro
   */
  helperText?: string;
  /**
   * Valor controlado (máscara ou numérico)
   */
  value?: string;
  /**
   * Valor inicial não controlado
   */
  defaultValue?: string;
  /**
   * Callback quando o valor é alterado, fornecendo o evento sintético
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Callback simplificado que retorna o valor formatado e os dígitos puros
   */
  onValueChange?: (formattedValue: string, rawDigits: string) => void;
  /**
   * Exibe ícone institucional de balança da justiça à esquerda
   * @default true
   */
  showIcon?: boolean;
  /**
   * Exibe botão para limpar o campo quando preenchido
   * @default true
   */
  clearable?: boolean;
  /**
   * Classes adicionais para o container externo
   */
  containerClassName?: string;
}

/**
 * Componente reutilizável de entrada para Número de Processo Judicial (Padrão CNJ: 0000000-00.0000.0.00.0000).
 *
 * Características principais:
 * - Máscara automática CNJ em tempo real conforme digitação (20 dígitos).
 * - Feedback visual: borda azul (#0047ab/blue-500) em foco, borda vermelha (red-500) em caso de erro.
 * - Estado invisível resolvido: texto digitado configurado explicitamente com a cor clara #F1F5F9 contra fundos escuros.
 * - Acessibilidade completa (WCAG): <label> vinculado via id/htmlFor, aria-invalid e aria-describedby para leitores de tela.
 */
export const NumberProcessInput = forwardRef<HTMLInputElement, NumberProcessInputProps>(
  (
    {
      id,
      label = 'Número do Processo Judicial (CNJ)',
      error,
      helperText,
      value: controlledValue,
      defaultValue = '',
      onChange,
      onValueChange,
      showIcon = true,
      clearable = true,
      disabled = false,
      required = false,
      placeholder = '0000000-00.0000.0.00.0000',
      className = '',
      containerClassName = '',
      onFocus,
      onBlur,
      ...restProps
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `process-number-${generatedId}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const labelId = `${inputId}-label`;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string>(() =>
      formatProcessNumber(defaultValue)
    );
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // Sincroniza valor controlado quando prop muda
    useEffect(() => {
      if (isControlled) {
        setInternalValue(formatProcessNumber(controlledValue || ''));
      }
    }, [isControlled, controlledValue]);

    const displayValue = isControlled
      ? formatProcessNumber(controlledValue || '')
      : internalValue;

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawInput = e.target.value;
        const formatted = formatProcessNumber(rawInput);
        const rawDigits = unmaskProcessNumber(formatted);

        if (!isControlled) {
          setInternalValue(formatted);
        }

        // Modifica e.target.value para refletir a máscara antes de disparar onChange
        e.target.value = formatted;
        onChange?.(e);
        onValueChange?.(formatted, rawDigits);
      },
      [isControlled, onChange, onValueChange]
    );

    const handleClear = useCallback(() => {
      if (disabled) return;
      if (!isControlled) {
        setInternalValue('');
      }
      onValueChange?.('', '');

      // Dispara evento sintético para consumidores que usam onChange
      const syntheticEvent = {
        target: { value: '', name: restProps.name || '' },
        currentTarget: { value: '', name: restProps.name || '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    }, [disabled, isControlled, onValueChange, onChange, restProps.name]);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const hasError = Boolean(error);

    // Classes dinâmicas de borda e anel de foco conforme especificações de design
    const borderClasses = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500/20'
      : 'border-slate-300 hover:border-slate-400 focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/25 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

    return (
      <div className={`w-full text-left font-sans ${containerClassName}`}>
        {/* Label acessível vinculado via htmlFor */}
        {label && (
          <label
            htmlFor={inputId}
            id={labelId}
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

        <div className="relative flex items-center w-full">
          {/* Ícone contextual institucional à esquerda */}
          {showIcon && (
            <div
              className={`pointer-events-none absolute left-3.5 flex items-center transition-colors duration-150 ${
                hasError
                  ? 'text-red-500'
                  : isFocused
                  ? 'text-[#0047ab] dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
              aria-hidden="true"
            >
              <Scale className="h-4 w-4" />
            </div>
          )}

          {/* Campo de entrada com visual adaptativo para Modo Claro e Escuro */}
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            maxLength={25}
            disabled={disabled}
            required={required}
            value={displayValue}
            placeholder={placeholder}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            aria-invalid={hasError ? 'true' : 'false'}
            aria-required={required ? 'true' : 'false'}
            className={`
              w-full rounded-xl border bg-white dark:bg-slate-950
              py-2.5 text-xs sm:text-sm font-mono tracking-wide
              text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-sans
              outline-hidden transition-all duration-150 shadow-2xs
              disabled:cursor-not-allowed disabled:opacity-50
              ${showIcon ? 'pl-10' : 'pl-3.5'}
              ${clearable && displayValue && !disabled ? 'pr-9' : 'pr-3.5'}
              ${borderClasses}
              ${className}
            `}
            {...restProps}
          />

          {/* Botão de limpeza rápida */}
          {clearable && displayValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95 transition-all"
              title="Limpar número do processo"
              aria-label="Limpar campo de número do processo"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

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

NumberProcessInput.displayName = 'NumberProcessInput';

export default NumberProcessInput;
