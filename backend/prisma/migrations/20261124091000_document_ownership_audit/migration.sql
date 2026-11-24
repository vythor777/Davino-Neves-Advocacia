BEGIN;
LOCK TABLE "Processo", "Documento", "AuditLog" IN SHARE ROW EXCLUSIVE MODE;
UPDATE "Documento" d SET id_cliente = p.id_cliente FROM "Processo" p
WHERE d.id_processo = p.id_processo AND d.id_cliente IS DISTINCT FROM p.id_cliente;
CREATE UNIQUE INDEX "Processo_id_processo_id_cliente_key" ON "Processo"(id_processo, id_cliente);
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_id_processo_fkey";
ALTER TABLE "Documento"
  ADD CONSTRAINT "Documento_id_processo_id_cliente_fkey" FOREIGN KEY (id_processo, id_cliente)
  REFERENCES "Processo"(id_processo, id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Documento_processo_tem_cliente" CHECK (id_processo IS NULL OR id_cliente IS NOT NULL);

ALTER TABLE "AuditLog" ADD COLUMN cliente_documento INTEGER, ADD COLUMN processo_documento INTEGER;
CREATE INDEX "AuditLog_cliente_documento_timestamp_idx" ON "AuditLog"(cliente_documento, timestamp);
CREATE INDEX "AuditLog_processo_documento_timestamp_idx" ON "AuditLog"(processo_documento, timestamp);
-- Historical events without a surviving document have no recoverable parent.
UPDATE "AuditLog" a SET cliente_documento = d.id_cliente, processo_documento = d.id_processo
FROM "Documento" d WHERE a.entidade = 'documentos' AND a.registro = d.id_documento::text;
COMMIT;
