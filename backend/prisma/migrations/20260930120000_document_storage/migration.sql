-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "arquivado_em" TIMESTAMP(3),
ADD COLUMN     "id_cliente" INTEGER,
ADD COLUMN     "sha256" VARCHAR(64),
ADD COLUMN     "situacao" VARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL',
ADD COLUMN     "tamanho_bytes" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "id_processo" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Documento_id_cliente_idx" ON "Documento"("id_cliente");

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;
