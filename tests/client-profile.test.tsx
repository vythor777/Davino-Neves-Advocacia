import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ClientProfileFields, ClientProfileDetails } from '../frontend/components/clientes/ClientProfileFields';
import type { Cliente } from '../frontend/services/clienteService';

const client: Cliente = {
  id_cliente: 1, nome: 'Cliente exemplo', cpf_cnpj: '52998224725',
  email: 'example@example.test', telefone: '11999999999', endereco: 'Endereço exemplo',
  data_criacao: '', data_atualizacao: '', genero: 'FEMININO', profissao: 'Analista',
  qualificacao: 'Linha 1\nLinha 2 <script>', id_representante_legal: 2,
};
const representative: Cliente = { ...client, id_cliente: 2, nome: 'Representante exemplo' };

test('formulário oferece todos os dados complementares sem categoria ou palavras-chave', () => {
  const html = renderToStaticMarkup(<ClientProfileFields value={{}} onChange={() => {}} representatives={[representative]} />);
  for (const label of ['Tratamento', 'Gênero', 'Estado civil', 'Naturalidade', 'Nacionalidade', 'Empresa', 'Profissão', 'Nome da mãe', 'Nome do pai', 'Qualificação', 'Representante legal']) assert.ok(html.includes(label), label);
  assert.ok(!html.includes('Palavras-chave'));
  assert.ok(!html.includes('Categoria'));
  assert.ok(html.includes('Representante exemplo'));
  assert.ok(html.includes('Sem representante legal'));
});

test('ficha apresenta os valores persistidos, o representante e escapa texto do usuário', () => {
  const html = renderToStaticMarkup(<ClientProfileDetails client={client} representatives={[representative]} />);
  for (const value of ['Analista', 'Feminino', 'Representante exemplo', 'Não informado', '&lt;script&gt;']) assert.ok(html.includes(value), value);
  assert.ok(!html.includes('<script>'));
});

test('edição restrita desabilita todos os campos complementares', () => {
  const html = renderToStaticMarkup(<ClientProfileFields value={client} onChange={() => {}} representatives={[]} disabled />);
  assert.match(html, /<fieldset disabled=""/);
});
