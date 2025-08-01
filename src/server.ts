import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fetch from "node-fetch";
import { PrismaClient, Product } from "@prisma/client";
import jwt from "@fastify/jwt";

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

fastify.register(jwt, {
  secret: "supersecret", // 🔐 Troque por algo seguro em produção
});

fastify.post("/login", async (request, reply) => {
  const user = { id: 1, username: "admin" };
  const token = fastify.jwt.sign(user);
  return reply.send({ token });
});

fastify.addHook("onRequest", async (request, reply) => {
  if (request.url === "/login" || request.url === "/products") return;

  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: "Token inválido ou ausente" });
  }
});

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

      await fetch(
        "https://alefebsp.app.n8n.cloud/webhook/6b05c577-efb6-48fa-8b89-623b5ce40b0a",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        }
      );

      return reply.status(201).send(product);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Erro ao criar produto" });
    }
  }
);

const contactSchema = {
  type: "object",
  required: [
    "Nome",
    "Endereco_Residencial",
    "Cep_Residencial",
    "Sexo",
    "Email",
    "Nascimento",
    "CPF_CGC",
  ],
  properties: {
    Nome: { type: "string" },
    Endereco_Residencial: { type: "string" },
    Cidade_Residencial: { type: "string" },
    Estado_Residencial: { type: "string" },
    Cep_Residencial: { type: "string" },
    Pais_Residencial: { type: "string" },
    Telefone_Residencial: { type: "string" },
    Celular: { type: "string" },
    Observacoes: { type: "string" },
    Sexo: { type: "string", enum: ["M", "F"] },
    Bairro_Residencial: { type: "string" },
    Email: { type: "string", format: "email" },
    Nascimento: { type: "string", format: "date-time" },
    CPF_CGC: { type: "string" },
    RG: { type: "string" },
  },
};

fastify.post(
  "/contatos",
  { schema: { body: contactSchema } },
  async (request, reply) => {
    const body = request.body as any;

    try {
      const contato = await prisma.contato.create({
        data: {
          nome: body.Nome,
          enderecoResidencial: body.Endereco_Residencial,
          cidadeResidencial: body.Cidade_Residencial,
          estadoResidencial: body.Estado_Residencial,
          cepResidencial: body.Cep_Residencial,
          paisResidencial: body.Pais_Residencial,
          telefoneResidencial: body.Telefone_Residencial,
          celular: body.Celular,
          observacoes: body.Observacoes,
          sexo: body.Sexo,
          bairroResidencial: body.Bairro_Residencial,
          email: body.Email,
          nascimento: new Date(body.Nascimento),
          cpfCgc: body.CPF_CGC,
          rg: body.RG,
        },
      });

      return reply.status(201).send(contato);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Erro ao criar contato" });
    }
  }
);

fastify.get("/contatos", async (request, reply) => {
  try {
    const contatos = await prisma.contato.findMany();

    return reply.send(contatos);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "Erro ao buscar contatos" });
  }
});

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
