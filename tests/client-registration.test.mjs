import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateClienteDto } from '../backend/dist/clientes/dto/create-cliente.dto.js';
import { UpdateClienteDto } from '../backend/dist/clientes/dto/update-cliente.dto.js';
import { ClientesService } from '../backend/dist/clientes/clientes.service.js';
const base = { nome: 'Cliente exemplo', endereco: 'Campinas/SP' };

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
test('classificação pertence ao cliente e tipo de pessoa pode ser informado sem documento', async () => {
  const writes=[];
  const prisma={cliente:{create:async({data})=>{writes.push(data);return data;},findUnique:async()=>({...base,id_cliente:1,categoria:'Trabalhista',subcategoria:'Insalubridade'}),update:async({data})=>{writes.push(data);return data;}}};
  const service=new ClientesService(prisma,{clientUpdate:()=>{},processScope:()=>({})});
  const dto=plainToInstance(CreateClienteDto,{...base,tipo_pessoa:'pj',categoria:'Previdenciário',subcategoria:'Benefício BPC/LOAS'});
  assert.deepEqual(await validate(dto),[]);
  await service.create(dto,{});
  assert.equal(writes[0].tipo_pessoa,'pj');
  assert.equal(writes[0].subcategoria,'Benefício BPC/LOAS');
  await service.update(1,{categoria:'Cível'},{});
  assert.equal(writes[1].subcategoria,null);
  await assert.rejects(service.create({...base,subcategoria:'Divórcio'},{}),/categoria antes/);
});
test('edição permite apagar contatos e rejeita categoria inválida', async () => {
  assert.deepEqual(await validate(plainToInstance(UpdateClienteDto,{cpf_cnpj:'',email:'',telefone:''})),[]);
  assert.ok((await validate(plainToInstance(CreateClienteDto,{...base,categoria:'invalida'}))).length);
  assert.ok((await validate(plainToInstance(CreateClienteDto,{...base,tipo_pessoa:null}))).length);
});
