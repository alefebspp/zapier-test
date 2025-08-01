-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('M', 'F');

-- CreateTable
CREATE TABLE "Contato" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "enderecoResidencial" TEXT NOT NULL,
    "cidadeResidencial" TEXT,
    "estadoResidencial" TEXT,
    "cepResidencial" TEXT NOT NULL,
    "paisResidencial" TEXT,
    "telefoneResidencial" TEXT,
    "celular" TEXT,
    "observacoes" TEXT,
    "sexo" "Sexo" NOT NULL,
    "bairroResidencial" TEXT,
    "email" TEXT NOT NULL,
    "nascimento" TIMESTAMP(3) NOT NULL,
    "cpfCgc" TEXT NOT NULL,
    "rg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contato_email_key" ON "Contato"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contato_cpfCgc_key" ON "Contato"("cpfCgc");
