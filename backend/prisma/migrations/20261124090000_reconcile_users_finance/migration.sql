BEGIN;

-- Environments initialized by db push already have these enums.
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMINISTRADOR', 'ADVOGADO', 'ESTAGIARIO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TipoLancamento" AS ENUM ('RECEITA', 'DESPESA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CategoriaLancamento" AS ENUM ('HONORARIO_CONTRATUAL', 'HONORARIO_EXITO', 'CONSULTIVO', 'CUSTAS_PROCESSUAIS', 'OPERACIONAL', 'IMPOSTOS', 'OUTROS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "StatusLancamento" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Preserve the original password hashes. Refuse ambiguous mixed layouts.
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"Usuario"'::regclass AND attname = 'senha' AND NOT attisdropped) THEN
    ALTER TABLE "Usuario" RENAME COLUMN "senha" TO "senha_hash";
  END IF;
  IF EXISTS (SELECT FROM pg_attribute WHERE attrelid = '"Usuario"'::regclass AND attname = 'tipo' AND NOT attisdropped) THEN
    ALTER TABLE "Usuario" RENAME COLUMN "tipo" TO "role";
    ALTER TABLE "Usuario" ALTER COLUMN "role" DROP DEFAULT;
    ALTER TABLE "Usuario" ALTER COLUMN "role" TYPE "Role" USING
      (CASE lower(trim("role"))
        WHEN 'admin' THEN 'ADMINISTRADOR'
        WHEN 'estagiário' THEN 'ESTAGIARIO'
        ELSE upper(trim("role"))
      END)::"Role";
    ALTER TABLE "Usuario" ALTER COLUMN "role" SET DEFAULT 'ADVOGADO';
  END IF;
END $$;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "ativo" BOOLEAN NOT NULL DEFAULT true;
UPDATE "Usuario" SET email = lower(trim(email)) WHERE email <> lower(trim(email));

DO $$ BEGIN
  IF to_regclass('"LancamentoFinanceiro"') IS NULL THEN
    CREATE TABLE "LancamentoFinanceiro" (
        "id" VARCHAR(50) NOT NULL,
        "descricao" VARCHAR(255) NOT NULL,
        "tipo" "TipoLancamento" NOT NULL,
        "categoria" "CategoriaLancamento" NOT NULL DEFAULT 'HONORARIO_CONTRATUAL',
        "valor" DECIMAL(12,2) NOT NULL,
        "dataVencimento" DATE NOT NULL,
        "dataPagamento" DATE,
        "status" "StatusLancamento" NOT NULL DEFAULT 'PENDENTE',
        "formaPagamento" VARCHAR(50),
        "observacoes" TEXT,
        "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "dataAtualizacao" TIMESTAMP(3) NOT NULL,
        "processoId" INTEGER,
        "clienteId" INTEGER,

        CONSTRAINT "LancamentoFinanceiro_pkey" PRIMARY KEY ("id")
    );
    ALTER TABLE "LancamentoFinanceiro" ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conrelid = '"LancamentoFinanceiro"'::regclass AND conname = 'LancamentoFinanceiro_processoId_fkey') THEN
    ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo"("id_processo") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conrelid = '"LancamentoFinanceiro"'::regclass AND conname = 'LancamentoFinanceiro_clienteId_fkey') THEN
    ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;
