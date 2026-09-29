-- O sistema usa JWT do Nest e Prisma, não Supabase Auth/Data API.
-- O backend deve conectar como proprietário das tabelas ou papel BYPASSRLS.
-- Sem políticas públicas: clientes acessam os dados exclusivamente pela API Nest.
-- LancamentoFinanceiro permanece fora desta etapa, conforme escopo autorizado.
BEGIN;

ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cliente" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Processo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prazo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Documento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Agenda" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProcessoParticipante" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Configuracao" ENABLE ROW LEVEL SECURITY;

-- Os papéis existem no Supabase; condicional mantém compatibilidade com PostgreSQL local.
DO $$
DECLARE client_role text;
BEGIN
  FOREACH client_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = client_role) THEN
      EXECUTE format(
        'REVOKE ALL ON TABLE "Usuario", "Cliente", "Processo", "Prazo", "Documento", "Agenda", "ProcessoParticipante", "AuditLog", "Configuracao" FROM %I',
        client_role
      );
    END IF;
  END LOOP;
END $$;

COMMIT;
