import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { AuditoriaController } from '../backend/dist/auditoria/auditoria.controller.js';
import { DocumentosService } from '../backend/dist/documentos/documentos.service.js';
import { AccessService } from '../backend/dist/access/access.service.js';
import { AuditoriaInterceptor } from '../backend/dist/auditoria/auditoria.interceptor.js';
import { lastValueFrom, of, throwError } from 'rxjs';

test('advogado pode anexar PDF diretamente ao cliente sem processo', async () => {
  const lawyer = { role: 'ADVOGADO', id_usuario: 7, nome: 'Advogado' };
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const bytes = Buffer.from(await pdf.save());
  let record;
  let filters;
  const prisma = {
    cliente: { findUnique: async ({ where }) => where.id_cliente === 42 ? { id_cliente: 42 } : null },
    documento: {
      aggregate: async () => ({ _sum: { tamanho_bytes: 0 } }),
      create: async ({ data }) => (record = { ...data, id_documento: 1 }),
      update: async ({ data }) => ({ ...record, ...data }),
      findMany: async ({ where }) => { filters = where.AND; return []; },
    },
    $queryRaw: async () => [],
    $transaction: async callback => callback(prisma),
  };
  let stored;
  const access = new AccessService(prisma);
  const service = new DocumentosService(prisma, access, { upload: async (path, content) => { stored = { path, content }; } });

  const uploaded = await service.upload(lawyer, { id_cliente: 42 }, 'teste.pdf', bytes);
  assert.equal(uploaded.id_cliente, 42);
  assert.equal(uploaded.id_processo, undefined);
  assert.equal(uploaded.situacao, 'DISPONIVEL');
  assert.equal(uploaded.caminho_arquivo, stored.path);
  assert.deepEqual(stored.content, bytes);

  await service.findAll(lawyer, undefined, 42);
  assert.deepEqual(filters[1], { OR: [{ id_cliente: 42 }, { processo: { id_cliente: 42 } }] });
  assert.ok(filters[0].OR.some(rule => rule.id_processo === null && rule.id_usuario === lawyer.id_usuario));
  assert.ok(filters[0].OR.some(rule => rule.processo));
  await assert.rejects(service.upload(lawyer, { id_cliente: 999 }, 'teste.pdf', bytes), { status: 404 });
  await assert.rejects(service.upload({ ...lawyer, role: 'ESTAGIARIO' }, { id_cliente: 42 }, 'teste.pdf', bytes), { status: 403 });
});

test('auditoria filtra o período inclusivo no horário de Brasília e pagina os resultados', async () => {
  const controller = new AuditoriaController({ auditLog: { findMany: query => query } });
  const query = await controller.list('clientes', '42', '2026-11-22', '2026-11-22', '2');
  assert.deepEqual(query.where, {
    entidade: 'clientes',
    registro: '42',
    timestamp: { gte: new Date('2026-11-22T03:00:00Z'), lt: new Date('2026-11-23T03:00:00Z') },
  });
  assert.equal(query.skip, 100);
  assert.equal(query.take, 100);
  await assert.rejects(controller.list(undefined, undefined, '2026-02-30'), { status: 400 });
  await assert.rejects(controller.list(undefined, undefined, '2026-11-22', '2026-11-21'), { status: 400 });
  assert.equal((await controller.list(undefined, undefined, undefined, '2026-11-22')).where.timestamp.gte, undefined);
});

test('pop-ups do cliente e do processo incluem auditoria antiga dos documentos vinculados', async () => {
  const author = { usuario: 'Ana', cargo: 'ADVOGADO', timestamp: new Date('2026-11-22T14:00:00Z') };
  const recorded = [
    { ...author, entidade: 'documentos', registro: '11', acao: 'CRIACAO', descricao: 'Criação em documentos #11' },
    { ...author, usuario: 'Rui', entidade: 'documentos', registro: '11', acao: 'STATUS', descricao: 'arquivar em documentos #11' },
  ];
  let documentScope;
  let auditScope;
  const controller = new AuditoriaController({
    documento: { findMany: async ({ where }) => {
      documentScope = where;
      return [{ id_documento: 11, nome_arquivo: 'contrato.pdf' }];
    } },
    auditLog: { findMany: async ({ where }) => { auditScope = where; return recorded; } },
  });
  const client = await controller.list('clientes', '42', undefined, undefined, undefined, true);
  assert.deepEqual(documentScope, { OR: [{ id_cliente: 42 }, { processo: { id_cliente: 42 } }] });
  assert.deepEqual(auditScope.OR, [
    { entidade: 'clientes', registro: '42' },
    { entidade: 'documentos', registro: { in: ['11'] } },
  ]);
  assert.deepEqual(client.map(log => [log.usuario, log.descricao]), [
    ['Ana', 'Anexou o documento “contrato.pdf”.'],
    ['Rui', 'Arquivou o documento “contrato.pdf”.'],
  ]);
  const process = await controller.list('processos', '7', undefined, undefined, undefined, true);
  assert.deepEqual(documentScope, { id_processo: 7 });
  assert.deepEqual(auditScope.OR[0], { entidade: 'processos', registro: '7' });
  assert.deepEqual(process, client);
});

test('auditoria registra o autor e o PDF apenas após anexar ou arquivar com sucesso', async () => {
  const actor = { id_usuario: 2, nome: 'João', role: 'ADMINISTRADOR' };
  const writes = [];
  const interceptor = new AuditoriaInterceptor({ auditLog: { create: async ({ data }) => { writes.push(data); } } });
  const intercept = async (path, params, response) => {
    const request = { path, params, user: actor, method: 'POST', body: {} };
    const context = { switchToHttp: () => ({ getRequest: () => request }) };
    return lastValueFrom(await interceptor.intercept(context, { handle: () => response }));
  };
  const document = { id_documento: 11, nome_arquivo: 'contrato.pdf' };
  await intercept('/api/documentos', {}, of(document));
  await intercept('/api/documentos/11/arquivar', { id: '11' }, of(document));
  await assert.rejects(intercept('/api/documentos/11/arquivar', { id: '11' }, throwError(() => new Error('Falha no armazenamento'))));
  assert.deepEqual(writes.map(log => [log.usuario, log.registro, log.acao, log.descricao]), [
    ['João', '11', 'DOCUMENTO', 'Anexou o documento “contrato.pdf”.'],
    ['João', '11', 'STATUS', 'Arquivou o documento “contrato.pdf”.'],
  ]);
});
