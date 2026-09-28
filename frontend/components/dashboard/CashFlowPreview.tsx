import type { ResumoFinanceiroResponse } from '@/services/financeiroService';

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Compact comparison using the same monthly series as the financial module. */
export function CashFlowPreview({ history }: { history: ResumoFinanceiroResponse['historicoMensal'] }) {
  const months = (history ?? []).slice(-6);
  if (!months.length) return null;
  const max = Math.max(1, ...months.flatMap(month => [month.receitas, month.despesas]));
  return (
    <figure className="mb-5 border-b border-line pb-5">
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Fluxo mensal</span>
        <span className="flex gap-3"><span><span aria-hidden className="mr-1 inline-block h-2 w-2 rounded-sm bg-action" />Entradas</span><span><span aria-hidden className="mr-1 inline-block h-2 w-2 rounded-sm bg-slate-400" />Saídas</span></span>
      </figcaption>
      <div aria-hidden className="flex items-end gap-3">
        {months.map(month => <div key={month.rotulo} className="min-w-0 flex-1 text-center" title={`${month.rotulo}: entradas ${money(month.receitas)}, saídas ${money(month.despesas)}`}>
          <div className="flex h-20 items-end justify-center gap-1 border-b border-line">
            <div className="w-3 rounded-t-sm bg-action" style={{ height: `${Math.max(0, month.receitas) / max * 100}%` }} />
            <div className="w-3 rounded-t-sm bg-slate-400" style={{ height: `${Math.max(0, month.despesas) / max * 100}%` }} />
          </div>
          <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">{month.rotulo}</span>
        </div>)}
      </div>
      <details className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        <summary className="cursor-pointer rounded py-1 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">Ver valores por mês</summary>
        <table className="mt-2 w-full text-left"><caption className="sr-only">Fluxo de caixa por mês</caption><thead><tr><th scope="col" className="py-2 font-medium">Mês</th><th scope="col" className="text-right font-medium">Entradas</th><th scope="col" className="text-right font-medium">Saídas</th></tr></thead><tbody>{months.map(month => <tr key={month.rotulo}><th scope="row" className="py-2 font-normal">{month.rotulo}</th><td className="text-right">{money(month.receitas)}</td><td className="text-right">{money(month.despesas)}</td></tr>)}</tbody></table>
      </details>
    </figure>
  );
}
