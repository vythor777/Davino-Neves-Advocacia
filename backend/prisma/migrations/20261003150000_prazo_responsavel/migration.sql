ALTER TABLE "Prazo" ADD COLUMN "id_responsavel" INTEGER;
ALTER TABLE "Prazo" ADD CONSTRAINT "Prazo_id_responsavel_fkey" FOREIGN KEY ("id_responsavel") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Prazo_id_responsavel_idx" ON "Prazo"("id_responsavel");
