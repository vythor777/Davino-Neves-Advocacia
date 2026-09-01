'use client';

import { useState, useEffect } from 'react';

/**
 * Hook customizado para aplicar debounce em valores de busca e inputs com delay padrão de 400ms.
 * Evita chamadas excessivas a endpoints e buscas repetitivas a cada tecla digitada.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
