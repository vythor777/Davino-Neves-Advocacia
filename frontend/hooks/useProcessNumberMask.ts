import { useState, useCallback, ChangeEvent } from 'react';

/**
 * Formata um valor numérico para a máscara padrão CNJ (20 dígitos):
 * 0000000-00.0000.0.00.0000
 *
 * Estrutura CNJ (Resolução nº 65/2008 do CNJ):
 * NNNNNNN-DD.AAAA.J.TR.OOOO
 * - NNNNNNN (7 dígitos): Número sequencial
 * - DD (2 dígitos): Dígitos verificadores
 * - AAAA (4 dígitos): Ano de ajuizamento
 * - J (1 dígito): Órgão/segmento do Poder Judiciário
 * - TR (2 dígitos): Tribunal do segmento
 * - OOOO (4 dígitos): Vara / unidade de origem
 */
export function formatProcessNumber(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 20);
  
  if (digits.length === 0) return '';
  if (digits.length <= 7) return digits;
  if (digits.length <= 9) return `${digits.slice(0, 7)}-${digits.slice(7)}`;
  if (digits.length <= 13) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9)}`;
  if (digits.length <= 14) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13)}`;
  if (digits.length <= 16) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14)}`;
  return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16, 20)}`;
}

/**
 * Extrai apenas os dígitos do número de processo (até 20 dígitos)
 */
export function unmaskProcessNumber(value: string): string {
  return (value || '').replace(/\D/g, '').slice(0, 20);
}

/**
 * Validação básica de completude e formato do número de processo CNJ
 */
export function validateProcessNumberCNJ(value: string): { isValid: boolean; error?: string } {
  const digits = unmaskProcessNumber(value);
  if (!digits) {
    return { isValid: false, error: 'O número do processo é obrigatório.' };
  }
  if (digits.length < 20) {
    return {
      isValid: false,
      error: `Número incompleto (${digits.length}/20 dígitos). Padrão: 0000000-00.0000.0.00.0000`,
    };
  }
  return { isValid: true };
}

interface UseProcessNumberMaskOptions {
  initialValue?: string;
  onChange?: (formattedValue: string, rawDigits: string) => void;
}

export function useProcessNumberMask(options: UseProcessNumberMaskOptions = {}) {
  const [value, setValue] = useState<string>(() => formatProcessNumber(options.initialValue || ''));

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatProcessNumber(e.target.value);
      const raw = unmaskProcessNumber(formatted);
      setValue(formatted);
      options.onChange?.(formatted, raw);
    },
    [options]
  );

  const setManualValue = useCallback(
    (val: string) => {
      const formatted = formatProcessNumber(val);
      const raw = unmaskProcessNumber(formatted);
      setValue(formatted);
      options.onChange?.(formatted, raw);
    },
    [options]
  );

  return {
    value,
    setValue: setManualValue,
    rawDigits: unmaskProcessNumber(value),
    handleChange,
    isValid: unmaskProcessNumber(value).length === 20,
  };
}
