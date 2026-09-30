/** Date-only due dates are stored as UTC midnight; compare to the office calendar date. */
export function effectiveFinancialStatus<T extends string>(status: T, dueDate: Date, now = new Date()): T | 'PENDENTE' | 'ATRASADO' {
  if (status !== 'PENDENTE' && status !== 'ATRASADO') return status;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
  return dueDate.toISOString().slice(0, 10) < today ? 'ATRASADO' : 'PENDENTE';
}
