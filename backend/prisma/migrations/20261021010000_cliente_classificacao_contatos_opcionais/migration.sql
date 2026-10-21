ALTER TABLE "Cliente"
  ADD COLUMN IF NOT EXISTS "categoria" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "subcategoria" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "tipo_pessoa" VARCHAR(2) NOT NULL DEFAULT 'pf',
  ALTER COLUMN "cpf_cnpj" DROP NOT NULL,
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "telefone" DROP NOT NULL;
UPDATE "Cliente" SET "tipo_pessoa" = 'pj' WHERE length(regexp_replace(coalesce("cpf_cnpj", ''), '[^0-9]', '', 'g')) = 14 AND "tipo_pessoa" = 'pf';
