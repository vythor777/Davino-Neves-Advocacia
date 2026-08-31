-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'advogado',
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cpf_cnpj" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "endereco" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "Processo" (
    "id_processo" SERIAL NOT NULL,
    "numero_processo" VARCHAR(50) NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "descricao" TEXT NOT NULL,
    "data_abertura" DATE NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,
    "id_cliente" INTEGER NOT NULL,

    CONSTRAINT "Processo_pkey" PRIMARY KEY ("id_processo")
);

-- CreateTable
CREATE TABLE "Prazo" (
    "id_prazo" SERIAL NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "data_vencimento" DATE NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,
    "id_processo" INTEGER NOT NULL,

    CONSTRAINT "Prazo_pkey" PRIMARY KEY ("id_prazo")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id_documento" SERIAL NOT NULL,
    "nome_arquivo" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "caminho_arquivo" TEXT NOT NULL,
    "data_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_processo" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id_agenda" SERIAL NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "descricao" TEXT NOT NULL,
    "data_evento" TIMESTAMP NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id_agenda")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_cnpj_key" ON "Cliente"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Processo_numero_processo_key" ON "Processo"("numero_processo");

-- AddForeignKey
ALTER TABLE "Processo" ADD CONSTRAINT "Processo_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prazo" ADD CONSTRAINT "Prazo_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "Processo"("id_processo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "Processo"("id_processo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
