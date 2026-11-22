'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { Cliente } from '@/services/clienteService';
import type { Processo } from '@/services/processoService';

type PickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  emptyLabel?: string;
  emptyValue?: string;
  ariaLabel?: string;
  describedBy?: string;
  required?: boolean;
  disabled?: boolean;
};

type Option = {
  id: string;
  label: string;
  detail?: string;
  search?: string;
  identifiers: string[];
};

const optionClass = 'flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 data-focus:bg-blue-50 data-focus:text-blue-900 dark:data-focus:bg-slate-800 dark:data-focus:text-white';

function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
}

function EntityPicker({
  id, value, onChange, emptyLabel, emptyValue = '', ariaLabel, describedBy, required, disabled,
  options, placeholder, noResults,
}: PickerProps & { options: Option[]; placeholder: string; noResults: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const pending = query !== debouncedQuery && !!query.trim();
  const matches = useMemo(() => {
    const terms = normalize(debouncedQuery.trim()).split(/\s+/).filter(Boolean);
    if (!terms.length) return options;
    return options.filter(({ label, detail, search, identifiers }) => {
      const text = normalize([label, detail, search].filter(Boolean).join(' '));
      const digits = identifiers.map((identifier) => identifier.replace(/\D/g, ''));
      return terms.every((term) => text.includes(term) || (
        /^[\d.\/-]+$/.test(term) && /\d/.test(term)
        && digits.some((identifier) => identifier.includes(term.replace(/\D/g, '')))
      ));
    });
  }, [debouncedQuery, options]);
  const selected = options.find((option) => option.id === value);
  const visibleOptions = query.trim() ? matches : options;

  useEffect(() => {
    input.current?.setCustomValidity(required && !selected ? 'Selecione uma opção da lista.' : '');
  }, [required, selected]);

  return (
    <Combobox
      value={value || null}
      onChange={(next: string | null) => {
        const nextValue = next ?? emptyValue;
        if (nextValue !== value) onChange(nextValue);
      }}
      onClose={() => setQuery('')}
      disabled={disabled}
      immediate
    >
      <div className="relative min-w-0">
        <ComboboxInput
          ref={input}
          id={id}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-required={required}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-slate-900 placeholder:text-slate-500 focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60 dark:border-slate-700 dark:bg-surface dark:text-slate-100 dark:placeholder:text-slate-400"
          displayValue={() => selected?.label ?? ''}
          placeholder={value === emptyValue && emptyLabel ? emptyLabel : placeholder}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand active:bg-slate-200 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700" aria-label="Mostrar opções">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </ComboboxButton>
        <ComboboxOptions anchor={{ to: 'bottom start', gap: 4, padding: 8 }} modal={false} className="z-[60] max-h-60 w-(--input-width) overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 text-sm text-slate-900 shadow-lg focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          {emptyLabel && !required && !query.trim() && <ComboboxOption value={emptyValue} className={optionClass}>{emptyLabel}</ComboboxOption>}
          {pending ? <p role="status" className="px-3 py-2 text-slate-500 dark:text-slate-400">Buscando…</p> : (
            visibleOptions.map(({ id: optionId, label, detail }) => (
              <ComboboxOption key={optionId} value={optionId} className={`group ${optionClass}`}>
                <span className="min-w-0 wrap-break-word">
                  <span className="block font-medium">{label}</span>
                  {detail && <span className="block text-xs text-slate-500 dark:text-slate-400">{detail}</span>}
                </span>
                <Check className="h-4 w-4 shrink-0 opacity-0 group-data-selected:opacity-100" aria-hidden="true" />
              </ComboboxOption>
            ))
          )}
          {!pending && !visibleOptions.length && <p role="status" className="px-3 py-2 text-slate-500 dark:text-slate-400">{noResults}</p>}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}

export function ClientPicker({ clients, ...props }: PickerProps & { clients: Pick<Cliente, 'id_cliente' | 'nome' | 'cpf_cnpj'>[] }) {
  const options = useMemo(() => clients.map((client) => ({
    id: String(client.id_cliente),
    label: client.nome,
    detail: client.cpf_cnpj || undefined,
    identifiers: client.cpf_cnpj ? [client.cpf_cnpj] : [],
  })), [clients]);
  return <EntityPicker {...props} options={options} placeholder="Buscar por nome ou CPF/CNPJ" noResults="Nenhum cliente encontrado." />;
}

export function ProcessPicker({ processes, ...props }: PickerProps & { processes: Processo[] }) {
  const options = useMemo(() => processes.map((process) => ({
    id: String(process.id_processo),
    label: process.titulo || process.numero_processo,
    detail: [process.numero_processo, process.cliente?.nome].filter(Boolean).join(' · '),
    search: process.cliente?.cpf_cnpj ?? undefined,
    identifiers: [process.numero_processo, process.cliente?.cpf_cnpj ?? ''],
  })), [processes]);
  return <EntityPicker {...props} options={options} placeholder="Buscar por número, título ou cliente" noResults="Nenhum processo encontrado." />;
}
