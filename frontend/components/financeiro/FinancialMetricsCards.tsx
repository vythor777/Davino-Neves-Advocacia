import { ArrowUpRight, ArrowDownRight, Clock, Wallet } from 'lucide-react';
import type { ResumoFinanceiroResponse } from '@/services/financeiroService';
import { MetricCard } from '@/components/ui/MetricCard';

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function FinancialMetricsCards({ data, loading }: { data: ResumoFinanceiroResponse | null; loading?: boolean }) {
  const m = data?.metricas;
  const cards = [
    { label: 'Entradas realizadas', icon: ArrowUpRight, value: m && money(m.entradasRealizadas),
      detail: m ? `Previsto: ${money(m.entradasPrevistas)} · ${m.entradasPrevistas > 0 ? `${(m.entradasRealizadas / m.entradasPrevistas * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% recebido` : 'Sem previsão de recebimento'}` : '' },
    { label: 'Honorários a receber', icon: Clock, value: m && money(m.honorariosAReceber),
      detail: m ? `Atrasados: ${money(m.pendenciasAtrasadas)} · ${m.qtdAtrasadas > 0 ? `${m.qtdAtrasadas} em atraso` : 'Sem atrasos'}` : '' },
    { label: 'Despesas e custas', icon: ArrowDownRight, value: m && money(m.despesasPagas),
      detail: m ? `Pendente: ${money(m.contasAPagarPendentes)} · Fluxo de saída` : '' },
    { label: 'Saldo líquido', icon: Wallet, value: m && money(m.saldoLiquido),
      detail: m ? `Projetado: ${money(m.saldoPrevisto)} · ${m.saldoLiquido > 0 ? 'Superávit' : m.saldoLiquido < 0 ? 'Déficit' : 'Equilibrado'}` : '' },
  ];
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <MetricCard key={card.label} {...card} value={card.value ?? undefined} loading={loading} />)}</div>;
}
