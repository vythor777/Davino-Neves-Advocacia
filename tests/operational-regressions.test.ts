import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidCpfCnpj, isValidCnj } from '../frontend/utils/identifiers';
import { isValidCpfCnpj as backendDocument, isValidCnj as backendCnj } from '../backend/src/common/validation/identifiers';
import { financialPeriods } from '../frontend/utils/financial-period';
import { auditChanges } from '../backend/src/auditoria/audit-changes';

test('frontend and backend reject reported fake identifiers and corrupted check digits', () => {
  for (const validate of [isValidCpfCnpj, backendDocument]) {
    for (const value of ['000.000.000-00', '111.111.111-11', '000.123.456-00', '123.456.789-99', '529.982.247-24', '04.252.011/0001-11']) assert.equal(validate(value), false);
    for (const value of ['529.982.247-25', '04.252.011/0001-10', '52998224725']) assert.equal(validate(value), true);
  }
  for (const validate of [isValidCnj, backendCnj]) {
    for (const value of ['0000000-00.0000.0.00.0000', '9000001-00.2026.8.26.0114', '1027575-76.2024.8.26.0114', 'abc10275757520248260114']) assert.equal(validate(value), false);
    assert.equal(validate('1027575-75.2024.8.26.0114'), true);
    assert.equal(validate('10275757520248260114'), true);
  }
});
test('financial month respects Sao Paulo boundary and year rollover', () => {
  assert.equal(financialPeriods(new Date('2026-10-01T01:00:00Z')).current, '2026-09');
  assert.equal(financialPeriods(new Date('2026-10-03T12:00:00Z')).current, '2026-10');
  const january = financialPeriods(new Date('2027-01-01T12:00:00Z'));
  assert.equal(january.current, '2027-01');
  assert.equal(january.months[1].value, '2026-12');
  assert.equal(january.year, '2027');
});
test('audit records the changed address, omits unchanged name and secrets', () => {
  const changes = auditChanges({ nome: 'Teste', endereco: 'Rua B', senha: 'secret', token: 'secret' }, { nome: 'Teste', endereco: 'Rua A' });
  assert.equal(changes, 'Endereço: "Rua A" → "Rua B"');
  assert.equal(auditChanges({ data_nascimento: '2000-01-01' }, { data_nascimento: new Date('2000-01-01') }), '');
});
