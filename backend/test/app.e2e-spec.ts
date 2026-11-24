import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service.js';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('reads the auth and financial models from the migrated database', async () => {
    const db = app.get(PrismaService);
    await db.usuario.findFirst({ select: { senha_hash: true, role: true, ativo: true } });
    await db.lancamentoFinanceiro.findFirst();
  });

  afterEach(async () => {
    await app.close();
  });
});
