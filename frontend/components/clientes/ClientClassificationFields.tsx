'use client';
import React from 'react';
import { processCategories } from '@/utils/processCategories';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60 dark:border-slate-700 dark:bg-surface dark:text-slate-100';

type Props = {
  disabled?: boolean;
  category: string;
  subcategory: string;
  onChange: (category: string, subcategory: string) => void;
};

export function ClientClassificationFields({ category, subcategory, onChange, disabled }: Props) {
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
        <input id="cliente-subcategoria" list="cliente-subcategorias" className={inputClass} maxLength={100} value={subcategory} disabled={!category} onChange={(event) => onChange(category, event.target.value)} placeholder={category ? 'Selecione ou digite a subcategoria' : 'Selecione uma categoria primeiro'} aria-describedby="cliente-subcategoria-ajuda" />
        <datalist id="cliente-subcategorias">
          {(processCategories[category] ?? []).map((name) => <option key={name} value={name} />)}
        </datalist>
        <p id="cliente-subcategoria-ajuda" className="mt-1 text-slate-500 dark:text-slate-400">Use uma sugestão ou digite outra subcategoria.</p>
      </div>
    </fieldset>
  );
}
