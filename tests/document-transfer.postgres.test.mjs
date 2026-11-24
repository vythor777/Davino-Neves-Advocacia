import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { PDFDocument } from 'pdf-lib';
import { AccessService } from '../backend/dist/access/access.service.js';
import { ClientesService } from '../backend/dist/clientes/clientes.service.js';
import { DocumentosService } from '../backend/dist/documentos/documentos.service.js';
import { ProcessosService } from '../backend/dist/processos/processos.service.js';
import { AuditoriaController } from '../backend/dist/auditoria/auditoria.controller.js';
import { PrazosService } from '../backend/dist/prazos/prazos.service.js';

const url = process.env.TEST_DATABASE_URL;

test('transferir o processo preserva o PDF e excluir o anexo preserva a auditoria', { skip: !url }, async () => {
  const db = new PrismaClient({ datasources: { db: { url } } });
  const rollback = new Error('Fim da transação de teste');
  try {
    await assert.rejects(db.$transaction(async tx => {
      // Keep service transactions in this sandbox transaction, including all audit writes.
      const prisma = Object.assign(Object.create(tx), { $transaction: work => work(tx) });
      const access = new AccessService(prisma);
      const removed = [];
      const docs = new DocumentosService(prisma, access, { upload: async () => {}, remove: async path => removed.push(path) });
      const clientes = new ClientesService(prisma, access, docs);
      const processos = new ProcessosService(prisma, access);
      const admin = await tx.usuario.create({ data: {
        nome: 'Admin de teste', email: randomUUID() + '@example.test', senha_hash: 'sem-login', role: 'ADMINISTRADOR',
      } });
      const a = await clientes.create({ nome: 'Cliente A', endereco: 'Teste' }, admin);
      const b = await clientes.create({ nome: 'Cliente B', endereco: 'Teste' }, admin);
      const proc = await processos.create({
        numero_processo: '1027575-75.2024.8.26.0114', titulo: 'Processo de teste', descricao: 'Teste',
        id_cliente: a.id_cliente, data_abertura: '2026-11-24', status: 'Em Andamento',
      }, admin);
      const pdf = await PDFDocument.create();
      pdf.addPage();
      const doc = await docs.upload(admin, { id_processo: proc.id_processo }, 'anexo.pdf', Buffer.from(await pdf.save()));
      await processos.update(proc.id_processo, { id_cliente: b.id_cliente }, admin);
      await clientes.remove(a.id_cliente, admin, true, true);
      assert.deepEqual(removed, []);
      const [preserved] = await docs.findAll(admin, proc.id_processo, b.id_cliente);
      assert.equal(preserved.id_documento, doc.id_documento);
      assert.equal(preserved.id_cliente, b.id_cliente);

      const prazos = new PrazosService(prisma, access);
      const prazo = await prazos.create({
        descricao: 'Audiência', id_processo: proc.id_processo, status: 'Pendente', tipoCompromisso: 'Audiência',
        id_responsavel: admin.id_usuario, data_vencimento: '2026-12-01', hora: '09:00',
      }, admin);
      assert.equal(prazo.id_responsavel, admin.id_usuario);
      assert.equal((await prazos.update(prazo.id_prazo, { id_responsavel: null }, admin)).responsavel, null);

      await docs.removeBatch([doc.id_documento], admin);
      assert.equal(removed.length, 1);
      const audit = new AuditoriaController(prisma);
      for (const [entity, id] of [['clientes', b.id_cliente], ['processos', proc.id_processo]]) {
        const logs = await audit.list(entity, String(id), undefined, undefined, undefined, true);
        assert.ok(logs.some(log => log.id_usuario === admin.id_usuario && log.acao === 'EXCLUSAO' && log.registro === String(doc.id_documento)));
      }
      throw rollback;
    }), error => error === rollback);
  } finally {
    await db.$disconnect();
  }
});
