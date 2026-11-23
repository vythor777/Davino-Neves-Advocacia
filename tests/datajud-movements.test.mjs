import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DataJudController } from '../backend/dist/datajud/datajud.controller.js';
import { DataJudService } from '../backend/dist/datajud/datajud.service.js';

test('consulta de movimentações repete a autenticação com a chave pública e distingue ausência de registro', async t => {
  const env = { DATAJUD_API_URL: 'https://api-publica.datajud.cnj.jus.br', DATAJUD_API_KEY: 'chave-vencida-de-teste' };
  for (const [name, value] of Object.entries(env)) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[name];
      else process.env[name] = previous;
    });
  }

  const headers = [];
  const responses = [
    new Response('Chave rejeitada', { status: 401 }),
    Response.json({ hits: { hits: [{ _source: { numeroProcesso: '10275757520248260114', movimentos: [{ nome: 'Recebimento', dataHora: '2026-11-15T17:00:00Z' }] } }] } }),
    Response.json({ hits: { hits: [] } }),
    new Response('Tribunal indisponível', { status: 503 }),
    new Response('Tribunal indisponível', { status: 503 }),
  ];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search');
    headers.push(options.headers.Authorization);
    return responses.shift();
  });
  const controller = new DataJudController(new DataJudService(), { processNumber: async () => {} });
  const actor = { role: 'ADMINISTRADOR', id_usuario: 1, nome: 'Admin de teste' };
  const number = '10275757520248260114';
  const first = await controller.movimentacoes(actor, number);
  assert.equal(first.encontrado, true);
  assert.equal(first.movimentos[0].nome, 'Recebimento');
  assert.equal(headers[0], 'APIKey chave-vencida-de-teste');
  assert.match(headers[1], /^APIKey [\w+=/-]+$/);
  assert.notEqual(headers[1], headers[0]);
  assert.deepEqual(await controller.movimentacoes(actor, number), { encontrado: false, movimentos: [] });
  await assert.rejects(controller.movimentacoes(actor, number), { status: 503 });
});

test('timeout renova o sinal e permite concluir a consulta na segunda tentativa', async t => {
  const firstSignal = AbortSignal.abort(new DOMException('Tempo limite', 'TimeoutError'));
  const secondSignal = new AbortController().signal;
  const signals = [firstSignal, secondSignal];
  t.mock.method(AbortSignal, 'timeout', () => signals.shift());
  const attempts = [];
  t.mock.method(globalThis, 'fetch', async (_url, { signal }) => {
    attempts.push(signal);
    signal.throwIfAborted();
    return Response.json({ hits: { hits: [{ _source: { numeroProcesso: '10275757520248260114' } }] } });
  });
  const result = await new DataJudService().consultarProcesso({ numero_processo: '10275757520248260114' });
  assert.equal(result.numeroProcesso, '10275757520248260114');
  assert.deepEqual(attempts, [firstSignal, secondSignal]);
});

test('resposta incompleta por timeout não vira processo não encontrado e retorna 504', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ timed_out: true, hits: { hits: [] } }),
  );
  const controller = new DataJudController(new DataJudService(), { processNumber: async () => {} });
  const actor = { role: 'ADMINISTRADOR', id_usuario: 1, nome: 'Admin de teste' };
  await assert.rejects(controller.movimentacoes(actor, '10275757520248260114'), { status: 504 });
  assert.equal(fetch.mock.callCount(), 2);
});
