'use client';
import React from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { processCategories } from '@/utils/processCategories';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60 dark:border-slate-700 dark:bg-surface dark:text-slate-100';

type Props = {
  disabled?: boolean;
  category: string;
  subcategory: string;
  onChange: (category: string, subcategory: string) => void;
};

export function ClientClassificationFields({ category, subcategory, onChange, disabled }: Props) {
  const suggestions = processCategories[category] ?? [];
  const matches = suggestions.filter((name) => name.toLocaleLowerCase('pt-BR').includes(subcategory.toLocaleLowerCase('pt-BR')));
  const customValue = subcategory.trim();
  const showCustom = customValue && !suggestions.some((name) => name.toLocaleLowerCase('pt-BR') === customValue.toLocaleLowerCase('pt-BR'));
  return (
    <fieldset disabled={disabled} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <legend className="mb-2 font-semibold text-slate-700 dark:text-slate-300">Área de atendimento</legend>
      <div>
        <label htmlFor="cliente-categoria" className="mb-1 block font-medium text-slate-700 dark:text-slate-300">Categoria</label>
        <select id="cliente-categoria" className={inputClass} value={category} onChange={(event) => onChange(event.target.value, '')}>
          <option value="">Não informada</option>
          {Object.keys(processCategories).map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="cliente-subcategoria" className="mb-1 block font-medium text-slate-700 dark:text-slate-300">Subcategoria</label>
        <Combobox value={subcategory} onChange={(value: string | null) => onChange(category, value ?? '')} disabled={disabled || !category} immediate>
          <div className="relative">
            <ComboboxInput
              id="cliente-subcategoria"
              className={`${inputClass} pr-10`}
              maxLength={100}
              displayValue={(value: string) => value}
              onChange={(event) => onChange(category, event.target.value)}
              placeholder={category ? 'Selecione ou digite a subcategoria' : 'Selecione uma categoria primeiro'}
              aria-describedby="cliente-subcategoria-ajuda"
              autoComplete="off"
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-xl text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-brand active:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-100 dark:active:bg-slate-800" aria-label="Mostrar subcategorias">
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </ComboboxButton>
          </div>
          {/* Portal avoids clipping inside the scrollable client modal. */}
          <ComboboxOptions anchor={{ to: 'bottom start', gap: 4, padding: 12 }} portal className="z-100 max-h-60 w-(--input-width) overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 text-xs text-slate-800 shadow-lg empty:invisible focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            {matches.map((name) => (
              <ComboboxOption key={name} value={name} className="group flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2.5 wrap-break-word select-none data-focus:bg-blue-50 data-focus:text-blue-800 dark:data-focus:bg-slate-800 dark:data-focus:text-white">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 group-data-selected:opacity-100" aria-hidden="true" />
                <span className="min-w-0 flex-1">{name}</span>
              </ComboboxOption>
            ))}
            {showCustom && (
              <ComboboxOption value={customValue} className="cursor-pointer rounded-lg px-3 py-2.5 wrap-break-word select-none data-focus:bg-blue-50 dark:data-focus:bg-slate-800">
                Usar “{customValue}”
              </ComboboxOption>
            )}
            {!matches.length && !showCustom && <p className="px-3 py-2.5 text-slate-500 dark:text-slate-400">Digite uma subcategoria personalizada.</p>}
          </ComboboxOptions>
        </Combobox>
        <p id="cliente-subcategoria-ajuda" className="mt-1 text-slate-500 dark:text-slate-400">Use uma sugestão ou digite outra subcategoria.</p>
      </div>
    </fieldset>
  );
}
