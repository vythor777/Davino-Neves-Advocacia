// Somente leitura. Execute com as variáveis do ambiente de destino.
import { PrismaClient } from '@prisma/client';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    'JWT_SECRET ausente ou curta. Configure pelo menos 32 caracteres aleatórios.',
  );
  process.exit(1);
}
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('Configure DIRECT_URL ou DATABASE_URL.');
  process.exit(1);
}
const prisma = new PrismaClient({ datasources: { db: { url } } });
try {
  const columns =
    await prisma.$queryRaw`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = current_schema()`;
  const present = new Set(
    columns.map((c) => `${c.table_name}.${c.column_name}`),
  );
  const required = [
    'Usuario.role',
    'Usuario.ativo',
    'Usuario.senha_hash',
    'Usuario.data_nascimento',
    'Cliente.data_nascimento',
    'Processo.id_processo',
    'Documento.id_documento',
    'Prazo.hora',
    'Prazo.tipoCompromisso',
    'Prazo.responsavel',
  ];
  const missing = required.filter((c) => !present.has(c));
  if (missing.length)
    throw new Error(
      `O banco não está na base esperada. Concilie o histórico antes da migração: ${missing.join(', ')}`,
    );
  const admins = await prisma.usuario.count({
    where: { role: 'ADMINISTRADOR', ativo: true },
  });
  if (!admins)
    throw new Error(
      'Nenhum administrador ativo. Corrija o acesso administrativo antes de habilitar as restrições.',
    );
  const privateTables = [
    'Usuario', 'Cliente', 'Processo', 'Prazo', 'Documento', 'Agenda',
    'ProcessoParticipante', 'AuditLog', 'Configuracao',
  ];
  const access = await prisma.$queryRaw`
    SELECT c.relname,
      (r.rolsuper OR r.rolbypassrls OR
        pg_has_role(current_user, c.relowner, 'USAGE')) AS backend_allowed
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles r ON r.rolname = current_user
    WHERE n.nspname = current_schema() AND c.relkind = 'r'
  `;
  const blocked = access.filter(
    (table) => privateTables.includes(table.relname) && !table.backend_allowed,
  );
  if (blocked.length)
    throw new Error(
      `A conexão Prisma seria bloqueada por RLS: ${blocked.map((t) => t.relname).join(', ')}. Confira o papel da conexão antes de implantar.`,
    );
  const policies = await prisma.$queryRaw`
    SELECT tablename FROM pg_policies WHERE schemaname = current_schema()
  `;
  if (policies.some((policy) => privateTables.includes(policy.tablename)))
    throw new Error(
      'Há políticas RLS preexistentes nas tabelas privadas. Revise-as antes da migração; não presumir bloqueio do acesso público.',
    );
  console.log('Pré-requisitos conferidos. Nenhum dado foi alterado.');
  const applied = [
    'Processo.id_responsavel',
    'ProcessoParticipante.id_usuario',
    'AuditLog.id',
    'Configuracao.id',
  ].every((c) => present.has(c));
  console.log(
    applied
      ? 'Estruturas de permissões já existem: confira prisma migrate status.'
      : 'A migração de permissões ainda precisa ser aplicada.',
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Falha na conferência.',
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
