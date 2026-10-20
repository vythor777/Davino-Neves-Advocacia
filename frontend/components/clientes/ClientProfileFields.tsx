'use client';

import React from 'react';

import type { Cliente, ClienteProfile } from '@/services/clienteService';

export const profileFields = [
  { key: 'tratamento', label: 'Tratamento', maxLength: 50, placeholder: 'Ex.: Sr., Sra., Dr., Dra.' },
  { key: 'genero', label: 'Gênero', maxLength: 30 },
  { key: 'estado_civil', label: 'Estado civil', maxLength: 50, placeholder: 'Informe o estado civil' },
  { key: 'naturalidade', label: 'Naturalidade', maxLength: 100, placeholder: 'Cidade e estado de nascimento' },
  { key: 'nacionalidade', label: 'Nacionalidade', maxLength: 100, placeholder: 'Ex.: Brasileira' },
  { key: 'empresa', label: 'Empresa', maxLength: 150, placeholder: 'Empresa onde trabalha' },
  { key: 'profissao', label: 'Profissão', maxLength: 100, placeholder: 'Informe a profissão' },
  { key: 'nome_mae', label: 'Nome da mãe', maxLength: 100, placeholder: 'Nome completo da mãe' },
  { key: 'nome_pai', label: 'Nome do pai', maxLength: 100, placeholder: 'Nome completo do pai' },
  { key: 'qualificacao', label: 'Qualificação', maxLength: 5000, placeholder: 'Informações complementares para a qualificação do cliente' },
] as const;

export const genderLabels: Record<string, string> = {
  FEMININO: 'Feminino', MASCULINO: 'Masculino', NAO_BINARIO: 'Não binário', OUTRO: 'Outro',
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60 dark:border-slate-700 dark:bg-surface dark:text-slate-100';

type Props = {
  value: ClienteProfile;
  onChange: (value: ClienteProfile) => void;
  representatives: Cliente[];
  disabled?: boolean;
};

export function ClientProfileFields({ value, onChange, representatives, disabled }: Props) {
  const update = (key: keyof ClienteProfile, next: string | number | null) => onChange({ ...value, [key]: next });
  return (
    <fieldset disabled={disabled} className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
      <legend className="px-1 font-semibold text-slate-900 dark:text-slate-100">Qualificação do cliente</legend>
      <p className="text-slate-500 dark:text-slate-400">Dados complementares opcionais.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {profileFields.map((field) => (
          <div key={field.key} className={field.key === 'qualificacao' ? 'sm:col-span-2' : undefined}>
            <label htmlFor={`cliente-${field.key}`} className="mb-1 block font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
            {field.key === 'genero' ? (
              <select id={`cliente-${field.key}`} className={inputClass} value={value.genero ?? ''} onChange={(event) => update('genero', event.target.value || null)}>
                <option value="">Não informado</option>
                {Object.entries(genderLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            ) : field.key === 'qualificacao' ? (
              <textarea id={`cliente-${field.key}`} rows={3} maxLength={field.maxLength} className={`${inputClass} resize-y`} placeholder={field.placeholder} value={value[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)} />
            ) : (
              <input id={`cliente-${field.key}`} type="text" maxLength={field.maxLength} className={inputClass} placeholder={field.placeholder} value={value[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)} />
            )}
          </div>
        ))}
        <div className="sm:col-span-2">
          <label htmlFor="cliente-representante-legal" className="mb-1 block font-medium text-slate-700 dark:text-slate-300">Representante legal</label>
          <select id="cliente-representante-legal" className={inputClass} value={value.id_representante_legal ?? ''} aria-describedby="cliente-representante-ajuda" onChange={(event) => update('id_representante_legal', event.target.value ? Number(event.target.value) : null)}>
            <option value="">Sem representante legal</option>
            {representatives.map((client) => <option key={client.id_cliente} value={client.id_cliente}>{client.nome} — {client.cpf_cnpj}</option>)}
          </select>
          <p id="cliente-representante-ajuda" className="mt-1 text-slate-500 dark:text-slate-400">Selecione uma pessoa física já cadastrada como cliente. Se necessário, cadastre-a primeiro.</p>
        </div>
      </div>
    </fieldset>
  );
}

export function ClientProfileDetails({ client, representatives }: { client: Cliente; representatives: Cliente[] }) {
  const representative = representatives.find((candidate) => candidate.id_cliente === client.id_representante_legal);
  return (
    <section className="border-t border-slate-200 pt-4 dark:border-slate-700" aria-label="Qualificação do cliente">
      <h4 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Qualificação do cliente</h4>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {profileFields.map((field) => (
          <div key={field.key} className={field.key === 'qualificacao' ? 'sm:col-span-2' : undefined}>
            <dt className="text-slate-500 dark:text-slate-400">{field.label}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-slate-800 dark:text-slate-200">{(field.key === 'genero' ? genderLabels[client.genero ?? ''] : client[field.key]) || 'Não informado'}</dd>
          </div>
        ))}
        <div className="sm:col-span-2">
          <dt className="text-slate-500 dark:text-slate-400">Representante legal</dt>
          <dd className="mt-1 text-slate-800 dark:text-slate-200">{representative ? `${representative.nome} — ${representative.cpf_cnpj}` : client.id_representante_legal ? `Cliente #${client.id_representante_legal}` : 'Não informado'}</dd>
        </div>
      </dl>
    </section>
  );
}
