import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fetch from "node-fetch";
import { PrismaClient, Product } from "@prisma/client";

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

interface ProductInput {
  nome: string;
  descricao: string;
  valor: number;
  quantidade: number;
  unidade: string;
}

const productSchema = {
  type: "object",
  required: ["nome", "descricao", "valor", "quantidade", "unidade"],
  properties: {
    nome: { type: "string" },
    descricao: { type: "string" },
    valor: { type: "number" },
    quantidade: { type: "integer" },
    unidade: { type: "string" },
  },
};

fastify.post(
  "/products",
  { schema: { body: productSchema } },
  async (
    request: FastifyRequest<{ Body: ProductInput }>,
    reply: FastifyReply
  ) => {
    try {
      const { nome, descricao, valor, quantidade, unidade } = request.body;

      const product: Product = await prisma.product.create({
        data: { nome, descricao, valor, quantidade, unidade },
      });

      await fetch("https://hooks.zapier.com/hooks/catch/23887811/uu4607l/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      return reply.status(201).send(product);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Erro ao criar produto" });
    }
  }
);

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Servidor rodando em http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
