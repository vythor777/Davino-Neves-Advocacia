'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (debouncedTerm: string) => void;
  initialValue?: string;
  delay?: number;
  isLoading?: boolean;
  className?: string;
  id?: string;
}

export function SearchInput({
  placeholder = 'Buscar por número CNJ, cliente, título ou vara...',
  onSearch,
  initialValue = '',
  delay = 400,
  isLoading = false,
  className = '',
  id = 'global-search-input',
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState<string>(initialValue);
  const debouncedTerm = useDebounce(searchTerm, delay);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onSearch(debouncedTerm);
  }, [debouncedTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>

      <input
        id={id}
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          title="Limpar busca"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
