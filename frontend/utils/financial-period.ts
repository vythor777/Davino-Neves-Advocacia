export function financialPeriods(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).formatToParts(now);
  const year = Number(parts.find(p => p.type === 'year')!.value);
  const month = Number(parts.find(p => p.type === 'month')!.value);
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 1 - i, 1));
    const value = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    return { value, label: label.charAt(0).toUpperCase() + label.slice(1) + (i === 0 ? ' (Mês Atual)' : '') };
  });
  return { current: months[0].value, year: String(year), months };
}
