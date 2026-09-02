import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    let dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.includes('pooler.supabase.com') && !dbUrl.includes('pgbouncer=true')) {
      dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }
    super(dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined);
  }

  async onModuleInit() {
    await this.$connect();
    await this.ensureColumnsExist();
  }

  /**
   * Garante que colunas adicionadas recentemente no schema.prisma existam no banco relacional
   * prevenindo erros P2022 caso a migration ainda não tenha sido executada no ambiente (ex: Render/Postgres).
   */
  private async ensureColumnsExist() {
    try {
      await this.$executeRawUnsafe(
        `ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "data_nascimento" DATE;`
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "data_nascimento" DATE;`
      );
    } catch (err: any) {
      this.logger.warn(`Nota na verificação de colunas do banco: ${err?.message || err}`);
    }
  }
}
