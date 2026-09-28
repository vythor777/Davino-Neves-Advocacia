-- Mantém os processos legados sem responsável; atribuição explícita pelo administrador.
BEGIN;

-- AlterTable
ALTER TABLE "Processo" ADD COLUMN     "id_responsavel" INTEGER;

-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "conteudo" BYTEA,
ADD COLUMN     "tamanho" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "caminho_arquivo" SET DEFAULT '';

-- CreateTable
CREATE TABLE "ProcessoParticipante" (
    "id_processo" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "ProcessoParticipante_pkey" PRIMARY KEY ("id_processo","id_usuario")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "usuario" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "registro" TEXT,
    "descricao" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nome_escritorio" VARCHAR(100) NOT NULL DEFAULT 'Davino Neves Advocacia',
    "email_contato" VARCHAR(100),

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessoParticipante_id_usuario_idx" ON "ProcessoParticipante"("id_usuario");

-- CreateIndex
CREATE INDEX "AuditLog_entidade_registro_timestamp_idx" ON "AuditLog"("entidade", "registro", "timestamp");

-- CreateIndex
CREATE INDEX "Processo_id_responsavel_idx" ON "Processo"("id_responsavel");

-- AddForeignKey
ALTER TABLE "Processo" ADD CONSTRAINT "Processo_id_responsavel_fkey" FOREIGN KEY ("id_responsavel") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessoParticipante" ADD CONSTRAINT "ProcessoParticipante_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "Processo"("id_processo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessoParticipante" ADD CONSTRAINT "ProcessoParticipante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;


COMMIT;
