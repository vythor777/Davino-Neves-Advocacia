import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from 'class-validator';
import { CreateProcessoDto, PROCESS_CATEGORIES } from '../backend/dist/processos/dto/create-processo.dto.js';
import { UpdateProcessoDto } from '../backend/dist/processos/dto/update-processo.dto.js';
import { ProcessosService } from '../backend/dist/processos/processos.service.js';

function setup(current = { categoria: 'Trabalhista', subcategoria: 'Insalubridade', status: 'Em Andamento' }) {
  const writes = [];
  const prisma = { processo: { create: async ({data}) => { writes.push(data); return data; }, update: async ({data}) => { writes.push(data); return data; } } };
  const access = { requireRole: () => {}, process: async () => current };
  return { service: new ProcessosService(prisma, access), writes };
}
const actor = { role: 'ADMINISTRADOR', id_usuario: 1 };

test('DTO aceita classificação opcional, todas as categorias e subcategorias personalizadas', async () => {
  for (const categoria of PROCESS_CATEGORIES) assert.deepEqual(await validate(Object.assign(new UpdateProcessoDto(), { categoria, subcategoria: 'Outro assunto do escritório' })), []);
  assert.deepEqual(await validate(Object.assign(new UpdateProcessoDto(), { categoria: null, subcategoria: null })), []);
  for (const data of [{ categoria: 'inválida' }, { subcategoria: 123 }, { subcategoria: 'x'.repeat(101) }]) assert.ok((await validate(Object.assign(new UpdateProcessoDto(), data))).length);
});

test('criação persiste categoria e subcategoria e rejeita subcategoria isolada', async () => {
  const {service, writes} = setup();
  await service.create({ categoria: 'Previdenciário', subcategoria: 'Benefício BPC/LOAS', data_abertura: '2026-10-20' }, actor);
  assert.equal(writes[0].categoria, 'Previdenciário');
  assert.equal(writes[0].subcategoria, 'Benefício BPC/LOAS');
  await assert.rejects(service.create({ subcategoria: 'Divórcio', data_abertura: '2026-10-20' }, actor), /categoria antes/);
  assert.equal(writes.length, 1);
});

test('edição parcial preserva classificação; troca de categoria limpa subcategoria anterior', async () => {
  const {service, writes} = setup();
  await service.update(1, { titulo: 'Novo título' }, actor);
  assert.equal(Object.hasOwn(writes[0], 'categoria'), false);
  assert.equal(Object.hasOwn(writes[0], 'subcategoria'), false);
  await service.update(1, { categoria: 'Cível' }, actor);
  assert.equal(writes[1].subcategoria, null);
  await service.update(1, { subcategoria: 'Periculosidade' }, actor);
  assert.equal(writes[2].categoria, 'Trabalhista');
  assert.equal(writes[2].subcategoria, 'Periculosidade');
  await service.update(1, { categoria: null }, actor);
  assert.equal(writes[3].categoria, null);
  assert.equal(writes[3].subcategoria, null);
  await assert.rejects(service.update(1, { categoria: null, subcategoria: 'Divórcio' }, actor), /categoria antes/);
});
