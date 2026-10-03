import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from 'class-validator';
import { CreateClienteDto } from '../backend/dist/clientes/dto/create-cliente.dto.js';
import { UpdateClienteDto } from '../backend/dist/clientes/dto/update-cliente.dto.js';
import { CreateProcessoDto } from '../backend/dist/processos/dto/create-processo.dto.js';
import { FinanceiroService } from '../backend/dist/financeiro/financeiro.service.js';

test('DTOs reject invalid identifiers on create and update', async () => {
  const invalidClient = Object.assign(new CreateClienteDto(), { cpf_cnpj: '000.000.000-00' });
  assert.ok((await validate(invalidClient)).find(e => e.property === 'cpf_cnpj'));
  const update = Object.assign(new UpdateClienteDto(), { cpf_cnpj: '111.111.111-11' });
  assert.ok((await validate(update)).find(e => e.property === 'cpf_cnpj'));
  assert.equal((await validate(Object.assign(new UpdateClienteDto(), { endereco: 'Rua B' }))).length, 0);
  const process = Object.assign(new CreateProcessoDto(), { numero_processo: '0000000-00.0000.0.00.0000' });
  assert.ok((await validate(process)).find(e => e.property === 'numero_processo'));
});
test('financial month uses the selected year; annual filter covers all months', async () => {
  let query;
  const service = new FinanceiroService({ lancamentoFinanceiro: { findMany: async q => { query = q; return []; } } });
  await service.findAll({ mes: '2025-12' });
  assert.equal(query.where.dataVencimento.gte.getFullYear(), 2025);
  assert.equal(query.where.dataVencimento.gte.getMonth(), 11);
  await service.findAll({ ano: '2025' });
  assert.equal(query.where.dataVencimento.gte.getFullYear(), 2025);
  assert.equal(query.where.dataVencimento.gte.getMonth(), 0);
  assert.equal(query.where.dataVencimento.lte.getMonth(), 11);
  await service.findAll();
  assert.equal(query.where.dataVencimento, undefined);
});
