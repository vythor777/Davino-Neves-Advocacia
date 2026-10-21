import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from 'class-validator';
import { CreateClienteDto } from '../backend/dist/clientes/dto/create-cliente.dto.js';
import { UpdateClienteDto } from '../backend/dist/clientes/dto/update-cliente.dto.js';
import { ClientesService } from '../backend/dist/clientes/clientes.service.js';

const base = { nome: 'Cliente exemplo', cpf_cnpj: '52998224725', email: 'example@example.test', telefone: '11999999999', endereco: 'Endereço exemplo' };
const profile = { tratamento: 'Sra.', genero: 'FEMININO', estado_civil: 'Casada', naturalidade: 'Campinas/SP', nacionalidade: 'Brasileira', empresa: 'Empresa exemplo', profissao: 'Analista', nome_mae: 'Mãe exemplo', nome_pai: 'Pai exemplo', qualificacao: 'Qualificação exemplo', id_representante_legal: 2 };

test('API aceita dados completos e continua aceitando cadastros sem novos campos', async () => {
  for (const data of [base, { ...base, ...profile }]) assert.deepEqual(await validate(Object.assign(new CreateClienteDto(), data), { whitelist: true, forbidNonWhitelisted: true }), []);
  assert.deepEqual(await validate(Object.assign(new UpdateClienteDto(), { qualificacao: null, id_representante_legal: null })), []);
});

test('API rejeita tipo inválido, texto excessivo, gênero inválido e representante inválido', async () => {
  for (const data of [{ profissao: 123 }, { qualificacao: 'x'.repeat(5001) }, { genero: 'invalido' }, { id_representante_legal: 0 }, { id_representante_legal: '2' }]) {
    assert.ok((await validate(Object.assign(new CreateClienteDto(), { ...base, ...data }))).length);
  }
});

function setup(representative = { id_cliente: 2, cpf_cnpj: '52998224725', tipo_pessoa: 'pf' }) {
  const writes = [];
  const prisma = { cliente: {
    findUnique: async ({ where }) => where.id_cliente === 1 ? { ...base, id_cliente: 1 } : representative,
    create: async ({ data }) => { writes.push(data); return data; },
    update: async ({ data }) => { writes.push(data); return data; },
  } };
  const access = { clientUpdate: () => {}, processScope: () => ({}) };
  return { service: new ClientesService(prisma, access), writes };
}

test('criação e edição persistem dados complementares e permitem remover representante', async () => {
  const { service, writes } = setup();
  await service.create({ ...base, ...profile }, {});
  await service.update(1, { ...profile, qualificacao: null, id_representante_legal: null }, {});
  assert.equal(writes[0].profissao, 'Analista');
  assert.equal(writes[0].id_representante_legal, 2);
  assert.equal(writes[1].qualificacao, null);
  assert.equal(writes[1].id_representante_legal, null);
});

test('representante inexistente, pessoa jurídica e autorrepresentação são bloqueados antes da gravação', async () => {
  for (const representative of [null, { id_cliente: 2, cpf_cnpj: '04252011000110', tipo_pessoa: 'pj' }]) {
    const { service, writes } = setup(representative);
    await assert.rejects(service.create({ ...base, ...profile }, {}), /pessoa física/);
    assert.equal(writes.length, 0);
  }
  const { service, writes } = setup();
  await assert.rejects(service.update(1, { id_representante_legal: 1 }, {}), /próprio representante/);
  assert.equal(writes.length, 0);
});
