// Real Nest HTTP pipeline (JWT, guards, DTO validation, controllers and services).
// Prisma is an isolated in-memory test double: these tests never connect to production.
import 'reflect-metadata';
import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
process.env.JWT_SECRET =
  'permissions-tests-only-secret-not-for-production-2026';
const { AppModule } = await import('../backend/dist/app.module.js');
const { PrismaService } =
  await import('../backend/dist/prisma/prisma.service.js');
const { DataJudService } =
  await import('../backend/dist/datajud/datajud.service.js');
let app, db, api;
const users = [
  { id_usuario: 1, role: 'ADMINISTRADOR' },
  { id_usuario: 2, role: 'ADVOGADO' },
  { id_usuario: 3, role: 'ADVOGADO' },
  { id_usuario: 4, role: 'ADVOGADO' },
  { id_usuario: 5, role: 'ESTAGIARIO' },
  { id_usuario: 6, role: 'ESTAGIARIO' },
].map((u) => ({
  ...u,
  nome: `Pessoa ${u.id_usuario}`,
  email: `p${u.id_usuario}@example.test`,
  ativo: true,
  acesso_financeiro: false,
}));
const token = (id) =>
  new JwtService({ secret: process.env.JWT_SECRET }).sign({
    sub: id,
    role: users.find((u) => u.id_usuario === id)?.role,
  });
function matches(row, where = {}) {
  return Object.entries(where).every(([key, value]) => {
    if (value === undefined) return true;
    if (key === 'OR') return value.some((w) => matches(row, w));
    if (key === 'AND') return value.every((w) => matches(row, w));
    if (key === 'processo')
      return matches(
        db.processos.find((p) => p.id_processo === row.id_processo),
        value,
      );
    if (key === 'participantes')
      return row.participantes.some((p) => matches(p, value.some));
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('in' in value) return value.in.includes(row[key]);
      if ('notIn' in value) return !value.notIn.includes(row[key]);
      if ('not' in value) return row[key] !== value.not;
    }
    return row?.[key] === value;
  });
}
function project(row, select) {
  if (!row) return null;
  if (!select) return { ...row };
  return Object.fromEntries(
    Object.entries(select)
      .filter(([, yes]) => yes)
      .map(([key, spec]) => [
        key,
        typeof spec === 'object' ? project(row[key], spec.select) : row[key],
      ]),
  );
}
const prisma = {
  usuario: {
    update: async ({where, data, select}) => {
      const user = db.users.find(u => matches(u, where));
      Object.assign(user, data);
      return project(user, select);
    },
    count: async () => db.users.length,
    findUnique: async ({ where, select }) =>
      project(
        db.users.find((u) => matches(u, where)),
        select,
      ),
    findMany: async ({ where, select } = {}) =>
      db.users.filter((u) => matches(u, where)).map((u) => project(u, select)),
  },
  processo: {
    findUnique: async ({ where, select }) => project(db.processos.find(p => matches(p, where)), select),
    findMany: async ({ where, select } = {}) =>
      db.processos
        .filter((p) => matches(p, where))
        .map((p) => project(p, select)),
    findFirst: async ({ where, select }) =>
      project(
        db.processos.find((p) => matches(p, where)),
        select,
      ),
    count: async ({ where } = {}) =>
      db.processos.filter((p) => matches(p, where)).length,
    create: async ({ data }) => {
      const item = { ...data, id_processo: 104, participantes: [] };
      db.processos.push(item);
      return { ...item };
    },
    update: async ({ where, data }) => {
      const p = db.processos.find((p) => matches(p, where));
      const { participantes, ...rest } = data;
      Object.assign(p, rest);
      if (participantes) p.participantes = participantes.create;
      return { ...p };
    },
    delete: async ({ where }) => {
      const index = db.processos.findIndex((p) => matches(p, where));
      return db.processos.splice(index, 1)[0];
    },
  },
  cliente: {
    findUnique: async ({ where, include }) => {
      const item = db.clients.find((c) => matches(c, where));
      return item
        ? {
            ...item,
            processos: db.processos.filter(
              (p) =>
                p.id_cliente === item.id_cliente &&
                matches(p, include?.processos?.where),
            ),
          }
        : null;
    },
    findMany: async ({ where, include } = {}) =>
      db.clients
        .filter((c) => matches(c, where))
        .map((c) => ({
          ...c,
          _count: {
            processos: db.processos.filter(
              (p) =>
                p.id_cliente === c.id_cliente &&
                matches(p, include?._count?.select?.processos?.where),
            ).length,
          },
        })),
    update: async ({ where, data }) => {
      const c = db.clients.find((c) => matches(c, where));
      Object.assign(c, data);
      return { ...c };
    },
    create: async ({ data }) => {
      const c = { ...data, id_cliente: 202 };
      db.clients.push(c);
      return c;
    },
    delete: async ({ where }) =>
      db.clients.splice(
        db.clients.findIndex((c) => matches(c, where)),
        1,
      )[0],
  },
  prazo: {
    findUnique: async ({ where, select }) => project(db.prazos.find(p => matches(p, where)), select),
    findMany: async ({ where } = {}) =>
      db.prazos
        .filter((p) => matches(p, where))
        .map((p) => ({
          ...p,
          processo: db.processos.find((x) => x.id_processo === p.id_processo),
        })),
    findFirst: async ({ where }) =>
      db.prazos.find((p) => matches(p, where)) ?? null,
    create: async ({ data }) => {
      const p = { ...data, id_prazo: 303 };
      db.prazos.push(p);
      return p;
    },
    update: async ({ where, data }) => {
      const p = db.prazos.find((p) => matches(p, where));
      Object.assign(p, data);
      return p;
    },
  },
  documento: {
    findMany: async ({ where, select }) =>
      db.docs.filter((p) => matches(p, where)).map((p) => project(p, select)),
    findFirst: async ({ where, select }) =>
      project(
        db.docs.find((p) => matches(p, where)),
        select,
      ),
    create: async ({ data, select }) => {
      const item = { ...data, id_documento: 403 };
      db.docs.push(item);
      return project(item, select);
    },
    delete: async ({ where, select }) =>
      project(
        db.docs.splice(
          db.docs.findIndex((d) => matches(d, where)),
          1,
        )[0],
        select,
      ),
  },
  agenda: { findMany: async () => [], findFirst: async () => null },
  lancamentoFinanceiro: { findMany: async () => [] },
  auditLog: {
    create: async ({ data }) => {
      db.logs.push(data);
      return data;
    },
    findMany: async ({ where }) => db.logs.filter((l) => matches(l, where)),
  },
  configuracao: {
    findUnique: async () => null,
    upsert: async ({ create }) => create,
  },
};
before(async () => {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(DataJudService)
    .useValue({
      consultarProcesso: async (dto) => ({
        numero_processo: dto.numero_processo,
        movimentos: [],
      }),
    })
    .compile();
  app = module.createNestApplication({ logger: false });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  db = { users: structuredClone(users) };
  await app.init();
  api = request(app.getHttpServer());
});
after(async () => {
  await app?.close();
});
beforeEach(() => {
  db = {
    users: structuredClone(users),
    processos: [
      {
        id_processo: 101,
        id_responsavel: 2,
        participantes: [{ id_usuario: 3 }, { id_usuario: 5 }],
        numero_processo: '0000001-74.2026.8.26.0001',
        titulo: 'Liberado',
        id_cliente: 201,
        status: 'Em Andamento',
      },
      {
        id_processo: 102,
        id_responsavel: 4,
        participantes: [],
        numero_processo: '0000002-59.2026.8.26.0001',
        titulo: 'Segredo',
        id_cliente: 201,
        status: 'Em Andamento',
      },
      {
        id_processo: 103,
        id_responsavel: null,
        participantes: [],
        numero_processo: '0000003-44.2026.8.26.0001',
        titulo: 'Legado',
        id_cliente: 201,
        status: 'Em Andamento',
      },
    ],
    clients: [
      {
        id_cliente: 201,
        nome: 'Cliente',
        cpf_cnpj: '12345678901',
        email: 'cliente@example.test',
        telefone: '11999999999',
        endereco: 'Rua A',
        data_nascimento: null,
      },
    ],
    prazos: [
      {
        id_prazo: 301,
        id_processo: 101,
        descricao: 'Prazo permitido',
        data_vencimento: new Date(),
        status: 'Pendente',
      },
      {
        id_prazo: 302,
        id_processo: 102,
        descricao: 'Prazo secreto',
        data_vencimento: new Date(),
        status: 'Pendente',
      },
    ],
    docs: [
      {
        id_documento: 401,
        id_processo: 101,
        id_usuario: 2,
        nome_arquivo: 'arquivo.txt',
        conteudo: Buffer.from('teste'),
        tamanho: 5,
      },
      {
        id_documento: 402,
        id_processo: 102,
        id_usuario: 4,
        nome_arquivo: 'secreto.txt',
        conteudo: Buffer.from('privado'),
        tamanho: 7,
      },
    ],
    logs: [],
  };
});
const auth = (id) => ({ Authorization: `Bearer ${token(id)}` });
const processInput = {
  numero_processo: '00000042920268260001',
  titulo: 'Novo',
  descricao: 'Teste',
  data_abertura: '2026-09-28',
  status: 'Em Andamento',
  id_cliente: 201,
};
const prazoInput = {
  descricao: 'Novo prazo',
  responsavel: 'Pessoa 3',
  data_vencimento: '2026-10-01',
  hora: '09:00',
  tipoCompromisso: 'Prazo Fatal',
  status: 'Pendente',
  id_processo: 101,
};

test('rotas de negócio exigem JWT; saúde e login continuam públicos', async () => {
  for (const path of [
    'clientes',
    'processos',
    'prazos',
    'documentos',
    'agenda',
    'notificacoes',
    'usuarios',
    'auditoria',
    'configuracoes',
    'financeiro/lancamentos',
  ])
    await api.get(`/api/${path}`).expect(401);
  await api.get('/api').expect(200);
  await api.post('/api/auth/login').send({}).expect(400);
  await api
    .get('/api/processos')
    .set('Authorization', 'Bearer invalid')
    .expect(401);
});
test('listagem: administrador vê todos; responsável e vinculados somente liberados; legado somente admin', async () => {
  for (const [id, expected] of [
    [1, [101, 102, 103]],
    [2, [101]],
    [3, [101]],
    [4, [102]],
    [5, [101]],
    [6, []],
  ]) {
    const res = await api.get('/api/processos').set(auth(id)).expect(200);
    assert.deepEqual(
      res.body.map((p) => p.id_processo),
      expected,
    );
  }
});
test('acesso direto por ID, prazos, documentos e CNJ não contornam vínculo', async () => {
  for (const id of [2, 3, 5, 6]) {
    for (const path of ['processos/102', 'prazos/302', 'documentos/402'])
      await api.get(`/api/${path}`).set(auth(id)).expect(404);
    await api
      .post('/api/datajud/consultar')
      .set(auth(id))
      .send({ numero_processo: '0000002-59.2026.8.26.0001' })
      .expect(404);
  }
  await api
    .post('/api/datajud/consultar')
    .set(auth(5))
    .send({ numero_processo: '0000001-74.2026.8.26.0001' })
    .expect(200);
});
test('somente advogado responsável edita; apenas administrador exclui', async () => {
  await api
    .patch('/api/processos/101')
    .set(auth(3))
    .send({ titulo: 'Tentativa' })
    .expect(403);
  await api
    .patch('/api/processos/101')
    .set(auth(5))
    .send({ titulo: 'Tentativa' })
    .expect(403);
  await api
    .patch('/api/processos/101')
    .set(auth(2))
    .send({ titulo: 'Atualizado' })
    .expect(200);
  for (const id of [2, 3, 5])
    await api.delete('/api/processos/101').set(auth(id)).expect(403);
  await api.delete('/api/processos/101').set(auth(1)).expect(200);
});
test('criação bloqueada ao estagiário; autoria é atribuída no servidor, não no payload', async () => {
  await api.post('/api/processos').set(auth(5)).send(processInput).expect(403);
  await api
    .post('/api/processos')
    .set(auth(2))
    .send({ ...processInput, id_responsavel: 4 })
    .expect(400);
  const res = await api
    .post('/api/processos')
    .set(auth(2))
    .send(processInput)
    .expect(201);
  assert.equal(res.body.id_responsavel, 2);
});
test('advogado vinculado pode arquivar; estagiário não; restauração somente administrador', async () => {
  await api.post('/api/processos/101/arquivar').set(auth(5)).expect(403);
  await api.post('/api/processos/101/arquivar').set(auth(3)).expect(201);
  await api
    .patch('/api/processos/101')
    .set(auth(2))
    .send({ status: 'Em Andamento' })
    .expect(403);
  await api.post('/api/processos/101/restaurar').set(auth(2)).expect(403);
  await api.post('/api/processos/101/restaurar').set(auth(1)).expect(201);
});
test('apenas administrador libera/revoga acesso; responsável precisa ser advogado ativo', async () => {
  const input = { id_responsavel: 2, participantes: [6] };
  await api
    .patch('/api/processos/101/acessos')
    .set(auth(2))
    .send(input)
    .expect(403);
  await api
    .patch('/api/processos/101/acessos')
    .set(auth(1))
    .send({ ...input, id_responsavel: 5 })
    .expect(400);
  await api
    .patch('/api/processos/101/acessos')
    .set(auth(1))
    .send(input)
    .expect(200);
  await api.get('/api/processos/101').set(auth(6)).expect(200);
  await api.get('/api/processos/101').set(auth(5)).expect(404);
  await api
    .patch('/api/processos/101/acessos')
    .set(auth(1))
    .send({ participantes: [] })
    .expect(400);
});
test('estagiário cria cliente e edita contatos, mas não dados sensíveis nem exclusão', async () => {
  await api
    .post('/api/clientes')
    .set(auth(5))
    .send({
      nome: 'Novo cliente',
      cpf_cnpj: '52998224725',
      email: 'novo@example.test',
      telefone: '11999999999',
      endereco: 'Rua B',
    })
    .expect(201);
  await api
    .patch('/api/clientes/201')
    .set(auth(5))
    .send({
      email: 'outro@example.test',
      telefone: '11988888888',
      endereco: 'Rua C',
    })
    .expect(200);
  for (const patch of [
    { nome: 'Alterado' },
    { cpf_cnpj: '11144477735' },
    { data_nascimento: '2000-01-01' },
  ])
    await api.patch('/api/clientes/201').set(auth(5)).send(patch).expect(403);
  await api.delete('/api/clientes/201').set(auth(5)).expect(403);
  await api.delete('/api/clientes/201').set(auth(2)).expect(403);
  await api
    .patch('/api/clientes/201')
    .set(auth(2))
    .send({ nome: 'Nome correto', data_nascimento: null })
    .expect(200);
});
test('detalhes/contagens de clientes e alertas não revelam processos de outro usuário', async () => {
  const detail = await api.get('/api/clientes/201').set(auth(5)).expect(200);
  assert.deepEqual(
    detail.body.processos.map((p) => p.id_processo),
    [101],
  );
  const list = await api.get('/api/clientes').set(auth(5)).expect(200);
  assert.equal(list.body[0]._count.processos, 1);
  const alerts = await api.get('/api/notificacoes').set(auth(5)).expect(200);
  assert.ok(!JSON.stringify(alerts.body).includes('secreto'));
  assert.ok(JSON.stringify(alerts.body).includes('Prazo permitido'));
});
test('prazos: advogado cria em processo vinculado; estagiário somente consulta', async () => {
  await api.post('/api/prazos').set(auth(5)).send(prazoInput).expect(403);
  await api
    .patch('/api/prazos/301')
    .set(auth(5))
    .send({ status: 'Cumprido' })
    .expect(403);
  await api.delete('/api/prazos/301').set(auth(5)).expect(403);
  await api.post('/api/prazos').set(auth(3)).send(prazoInput).expect(201);
  await api
    .post('/api/prazos')
    .set(auth(3))
    .send({ ...prazoInput, id_processo: 102 })
    .expect(404);
  await api
    .patch('/api/prazos/301')
    .set(auth(3))
    .send({ id_processo: 102 })
    .expect(404);
});
test('documentos: validação de PDF e controle das operações', async () => {
  const before = db.docs.length;
  for (const id of [1, 2]) {
    await api.post('/api/documentos').set(auth(id)).field('id_processo', '101')
      .attach('arquivo', Buffer.from('texto'), 'teste.txt').expect(400);
  }
  await api.post('/api/documentos').set(auth(5)).field('id_processo', '101')
    .attach('arquivo', Buffer.from('texto'), 'teste.txt').expect(403);
  await api.post('/api/documentos/backup').set(auth(2)).send({ ids: [401] }).expect(403);
  await api.post('/api/documentos/401/arquivar').set(auth(2)).send({ backup_conferido: true, sha256: 'a'.repeat(64) }).expect(403);
  assert.equal(db.docs.length, before);
  const list = await api.get('/api/documentos').set(auth(5)).expect(200);
  assert.ok(list.body.every(d => d.conteudo === undefined && d.caminho_arquivo === undefined));
});
test('usuários, auditoria e configurações administrativas protegidos', async () => {
  for (const id of [2, 5]) {
    for (const [method, path] of [
      ['post', 'usuarios'],
      ['patch', 'usuarios/1'],
      ['delete', 'usuarios/1'],
      ['get', 'usuarios'],
      ['get', 'usuarios/1'],
      ['get', 'auditoria'],
      ['patch', 'configuracoes'],
    ])
      await api[method](`/api/${path}`).set(auth(id)).send({}).expect(403);
    await api.get('/api/usuarios/equipe').set(auth(id)).expect(200);
  }
  await api
    .patch('/api/processos/101')
    .set(auth(1))
    .send({ titulo: 'Registro de auditoria' })
    .expect(200);
  const log = await api
    .get('/api/auditoria?entidade=processos&registro=101')
    .set(auth(1))
    .expect(200);
  assert.equal(log.body.length, 1);
  assert.equal(log.body[0].id_usuario, 1);
  assert.equal(log.body[0].acao, 'EDICAO');
  assert.ok(!JSON.stringify(log.body).includes('senha'));
});
test('cargo e conta ativa são revalidados mesmo com token antigo', async () => {
  const previous = token(1);
  db.users[0].role = 'ESTAGIARIO';
  await api
    .delete('/api/processos/101')
    .set('Authorization', `Bearer ${previous}`)
    .expect(403);
  db.users[0].ativo = false;
  await api
    .get('/api/processos')
    .set('Authorization', `Bearer ${previous}`)
    .expect(401);
});
test('nulos e campos extras não contornam validação de processos', async () => {
  await api
    .patch('/api/processos/101')
    .set(auth(2))
    .send({ status: null })
    .expect(400);
  await api
    .patch('/api/processos/101')
    .set(auth(2))
    .send({ id_responsavel: 2 })
    .expect(400);
  await api
    .patch('/api/processos/101')
    .set(auth(2))
    .send({ participantes: [6] })
    .expect(400);
});

test('Financeiro exige liberação e revogação vale com o mesmo token', async () => {
  await api.get('/api/financeiro/lancamentos').set(auth(1)).expect(200);
  for (const id of [2, 5]) {
    const existingToken = token(id);
    const header = {Authorization: `Bearer ${existingToken}`};
    await api.get('/api/financeiro/lancamentos').set(header).expect(403);
    await api.patch(`/api/usuarios/${id}`).set(auth(1)).send({acesso_financeiro: true}).expect(200);
    await api.get('/api/financeiro/lancamentos').set(header).expect(200);
    await api.patch(`/api/usuarios/${id}`).set(auth(1)).send({acesso_financeiro: false}).expect(200);
    await api.get('/api/financeiro/lancamentos').set(header).expect(403);
  }
});
test('usuário não pode liberar seu Financeiro e endpoints de escrita são bloqueados', async () => {
  await api.patch('/api/usuarios/2').set(auth(2)).send({acesso_financeiro: true}).expect(403);
  await api.patch('/api/usuarios/2').set(auth(1)).send({acesso_financeiro: 'true'}).expect(400);
  for (const [method, path] of [['get','resumo'], ['get','lancamentos/x'], ['post','lancamentos'], ['patch','lancamentos/x'], ['delete','lancamentos/x']]) {
    await api[method](`/api/financeiro/${path}`).set(auth(2)).expect(403);
  }
});

test('upload para IA exige sessão, extrai texto e rejeita formato inválido', async () => {
 await api.post('/api/gemini/extrair-texto').attach('arquivo',Buffer.from('Teste'),'teste.txt').expect(401);
 const response=await api.post('/api/gemini/extrair-texto').set(auth(5)).attach('arquivo',Buffer.from('Texto fictício de teste.'),'teste.txt').expect(200);
 assert.equal(response.body.texto,'Texto fictício de teste.');
 await api.post('/api/gemini/extrair-texto').set(auth(2)).attach('arquivo',Buffer.from('falso'),'teste.pdf').expect(400);
 await api.post('/api/gemini/extrair-texto').set(auth(2)).attach('arquivo',Buffer.alloc(5000001),'grande.txt').expect(413);
});
test('recursos de IA rejeitam campos obrigatórios vazios ou somente espaços antes de chamar Gemini', async () => {
 for(const [path,payload] of [['analisar-processo',{conteudo_processual:'   '}],['resumir-documento',{texto:'  '}],['encontrar-jurisprudencia',{tema:'   '}],['criar-peca',{tipo_peca:'Petição',fatos_contexto:'   '}],['identificar-prazos',{texto_publicacao:'  '}]]) {
   await api.post(`/api/gemini/${path}`).set(auth(2)).send(payload).expect(400);
 }
});
