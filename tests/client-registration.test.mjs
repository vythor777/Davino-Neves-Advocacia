import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateClienteDto } from '../backend/dist/clientes/dto/create-cliente.dto.js';
import { UpdateClienteDto } from '../backend/dist/clientes/dto/update-cliente.dto.js';
import { ClientesService } from '../backend/dist/clientes/clientes.service.js';
const base = { nome: 'Cliente exemplo', endereco: 'Campinas/SP' };
const companyContacts = { cpf_cnpj: '04.252.011/0001-10', email: 'empresa@example.test', telefone: '(19) 3333-4444' };

test('contatos podem estar ausentes, nulos ou vazios e ainda permitem cadastro', async () => {
  for (const contacts of [{}, {cpf_cnpj:null,email:null,telefone:null}, {cpf_cnpj:' ',email:'',telefone:''}]) {
    const dto = plainToInstance(CreateClienteDto, {...base,...contacts});
    assert.deepEqual(await validate(dto), []);
    if ('cpf_cnpj' in contacts) assert.equal(dto.cpf_cnpj, null);
  }
});
test('CPF/CNPJ e e-mail preenchidos continuam sendo validados', async () => {
  for (const value of [{cpf_cnpj:'11111111111'}, {cpf_cnpj:'04252011000111'}, {email:'invalido'}]) {
    assert.ok((await validate(plainToInstance(CreateClienteDto,{...base,...value}))).length);
  }
  assert.deepEqual(await validate(plainToInstance(CreateClienteDto,{...base,cpf_cnpj:'52998224725',email:'exemplo@example.test'})),[]);
});
test('classificação pertence ao cliente e pode ser cadastrada para pessoa jurídica', async () => {
  const writes=[];
  const prisma={cliente:{create:async({data})=>{writes.push(data);return data;},findUnique:async()=>({...base,id_cliente:1,categoria:'Trabalhista',subcategoria:'Insalubridade'}),update:async({data})=>{writes.push(data);return data;}}};
  const service=new ClientesService(prisma,{clientUpdate:()=>{},processScope:()=>({})});
  const dto=plainToInstance(CreateClienteDto,{...base,...companyContacts,tipo_pessoa:'pj',categoria:'Previdenciário',subcategoria:'Benefício BPC/LOAS'});
  assert.deepEqual(await validate(dto),[]);
  await service.create(dto,{});
  assert.equal(writes[0].tipo_pessoa,'pj');
  assert.equal(writes[0].subcategoria,'Benefício BPC/LOAS');
  await service.update(1,{categoria:'Cível'},{});
  assert.equal(writes[1].subcategoria,null);
  await assert.rejects(service.create({...base,subcategoria:'Divórcio'},{}),/categoria antes/);
});

test('criação de pessoa jurídica exige CNPJ válido, e-mail e telefone', async () => {
  const writes = [];
  const service = new ClientesService({
    cliente: { create: async ({ data }) => { writes.push(data); return data; } },
  }, {});
  for (const missing of [{ cpf_cnpj: null }, { email: ' ' }, { telefone: undefined }]) {
    await assert.rejects(service.create({ ...base, ...companyContacts, ...missing, tipo_pessoa: 'pj' }, {}), /Informe o CNPJ, o e-mail e o telefone/);
  }
  await assert.rejects(service.create({ ...base, ...companyContacts, email: null }, {}), /Informe o CNPJ, o e-mail e o telefone/);
  await assert.rejects(service.create({ ...base, ...companyContacts, cpf_cnpj: '52998224725', tipo_pessoa: 'pj' }, {}), /CNPJ válido/);
  assert.equal(writes.length, 0);
  assert.equal((await service.create({ ...base, ...companyContacts }, {})).tipo_pessoa, 'pj');
  assert.equal((await service.create(base, {})).tipo_pessoa, 'pf');
});

test('edição mantém o tipo do cliente e aceita corrigir um documento do mesmo tipo', async () => {
  const person = { ...base, id_cliente: 1, tipo_pessoa: 'pf', cpf_cnpj: '52998224725' };
  const company = { ...base, id_cliente: 2, tipo_pessoa: 'pj' };
  const writes = [];
  const service = new ClientesService({
    cliente: {
      findUnique: async ({ where }) => where.id_cliente === 1 ? person : company,
      update: async ({ data }) => { writes.push(data); return data; },
    },
  }, { clientUpdate: () => {}, processScope: () => ({}) });
  await assert.rejects(service.update(1, { ...companyContacts, tipo_pessoa: 'pj' }, {}), /tipo de pessoa não pode ser alterado/);
  await assert.rejects(service.update(2, { tipo_pessoa: 'pf' }, {}), /tipo de pessoa não pode ser alterado/);
  await assert.rejects(service.update(1, { cpf_cnpj: companyContacts.cpf_cnpj }, {}), /CPF válido/);
  await assert.rejects(service.update(2, { cpf_cnpj: person.cpf_cnpj }, {}), /CNPJ válido/);
  assert.equal(writes.length, 0);
  await service.update(1, { tipo_pessoa: 'pf', cpf_cnpj: '11144477735' }, {});
  await service.update(2, { endereco: 'Novo endereço' }, {});
  await service.update(2, { cpf_cnpj: companyContacts.cpf_cnpj }, {});
  assert.deepEqual(writes, [
    { cpf_cnpj: '11144477735' },
    { endereco: 'Novo endereço' },
    { cpf_cnpj: '04252011000110' },
  ]);
});
test('edição permite apagar contatos e rejeita categoria inválida', async () => {
  assert.deepEqual(await validate(plainToInstance(UpdateClienteDto,{cpf_cnpj:'',email:'',telefone:''})),[]);
  assert.ok((await validate(plainToInstance(CreateClienteDto,{...base,categoria:'invalida'}))).length);
  assert.ok((await validate(plainToInstance(CreateClienteDto,{...base,tipo_pessoa:null}))).length);
});

test('CNPJ alfanumérico conserva as letras e a edição mantém os campos obrigatórios', async () => {
  const empresa = { ...companyContacts, tipo_pessoa: 'pj', cpf_cnpj: '00.000.000/E08G-12' };
  const service = new ClientesService({ cliente: {
    create: async ({ data }) => data,
    findUnique: async () => empresa,
  } }, { clientUpdate() {}, processScope() { return {}; } });
  const dto = plainToInstance(CreateClienteDto, { ...base, ...empresa });
  assert.deepEqual(await validate(dto), []);
  assert.equal((await service.create(dto, {})).cpf_cnpj, '00000000E08G12');
  await assert.rejects(service.create({ ...dto, tipo_pessoa: 'pf' }, {}), {status: 400});
  for (const field of ['cpf_cnpj', 'email', 'telefone']) {
    await assert.rejects(service.update(2, { [field]: null }, {}), {status: 400});
  }
});
