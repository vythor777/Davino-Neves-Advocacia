ALTER TABLE "Cliente"
  ADD COLUMN IF NOT EXISTS "tratamento" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "genero" VARCHAR(30),
  ADD COLUMN IF NOT EXISTS "estado_civil" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "naturalidade" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "nacionalidade" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "empresa" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "profissao" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "nome_mae" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "nome_pai" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "qualificacao" TEXT,
  ADD COLUMN IF NOT EXISTS "id_representante_legal" INTEGER;

CREATE INDEX IF NOT EXISTS "Cliente_id_representante_legal_idx" ON "Cliente"("id_representante_legal");
DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Cliente_id_representante_legal_fkey' AND conrelid = '"Cliente"'::regclass) THEN
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_id_representante_legal_fkey" FOREIGN KEY ("id_representante_legal") REFERENCES "Cliente"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;
END IF;
END $$;
