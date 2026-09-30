import { describe, expect, it } from 'vitest';
import { effectiveFinancialStatus } from './financial-status.js';
describe('financial overdue status', () => {
  const now = new Date('2026-09-30T11:00:00Z');
  it('recognizes the reported overdue pending receipt', () => {
    expect(effectiveFinancialStatus('PENDENTE', new Date('2026-09-28'), now)).toBe('ATRASADO');
  });
  it('does not mark a receipt due today as late', () => {
    expect(effectiveFinancialStatus('PENDENTE', new Date('2026-09-30'), now)).toBe('PENDENTE');
  });
  it('preserves paid and cancelled states', () => {
    for (const status of ['PAGO', 'CANCELADO']) expect(effectiveFinancialStatus(status, new Date('2026-09-28'), now)).toBe(status);
  });
  it('uses Sao Paulo date near UTC midnight', () => {
    expect(effectiveFinancialStatus('PENDENTE', new Date('2026-09-29'), new Date('2026-09-30T01:00:00Z'))).toBe('PENDENTE');
  });
});
