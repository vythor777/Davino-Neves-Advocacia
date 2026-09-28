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
  console.log('Pré-requisitos conferidos. Nenhum dado foi alterado.');
  const applied = [
    'Processo.id_responsavel',
    'ProcessoParticipante.id_usuario',
    'Documento.conteudo',
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
