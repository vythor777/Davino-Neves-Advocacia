'use client';
import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { RemoteAuditTrail } from '@/components/RemoteAuditTrail';
export default function AuditoriaPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filter, setFilter] = useState({ from: '', to: '', page: 1 });
  const inputClass = 'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-brand dark:border-slate-700 dark:bg-surface';

  return (
    <AuthGuard requireAdmin>
      <div className="app-page">
        <PageHeader
          title="Auditoria"
          description="Consulte as alterações registradas por período, com autor, cargo e data."
        />
        <form className="legal-glass-card flex flex-wrap items-end gap-3 p-4" onSubmit={event => {
          event.preventDefault();
          setFilter({ from, to, page: 1 });
        }}>
          <label className="space-y-1 text-sm font-medium">
            <span>Data inicial</span>
            <input className={inputClass} type="date" value={from} max={to || undefined} onChange={event => setFrom(event.target.value)} />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Data final</span>
            <input className={inputClass} type="date" value={to} min={from || undefined} onChange={event => setTo(event.target.value)} />
          </label>
          <button className="ui-button ui-button-primary" type="submit">Filtrar</button>
          <button className="ui-button ui-button-secondary" type="button" onClick={() => {
            setFrom('');
            setTo('');
            setFilter({ from: '', to: '', page: 1 });
          }}>Limpar filtro</button>
        </form>
        <RemoteAuditTrail
          key={`${filter.from}/${filter.to}/${filter.page}`}
          from={filter.from}
          to={filter.to}
          pagination={{ page: filter.page, onChange: page => setFilter(previous => ({ ...previous, page })) }}
        />
      </div>
    </AuthGuard>
  );
}
