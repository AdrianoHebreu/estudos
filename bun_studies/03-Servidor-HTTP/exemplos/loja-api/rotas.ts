// A ÚNICA tabela de rotas da loja. Daqui saem as rotas do Bun.serve (servidor.ts)
// e o documento OpenAPI (openapi.ts): não há duas listas para manter em sincronia.
import type { Database } from "bun:sqlite";
import type { Esquema } from "./validar.ts";

const ref = (nome: string): Esquema => ({ $ref: `#/components/schemas/${nome}` });
const ESTADOS = ["pendente", "enviada", "entregue", "cancelada"];

export const esquemas: Record<string, Esquema> = {
  Categoria: {
    type: "object",
    required: ["id", "nome"],
    properties: { id: { type: "integer", example: 1 }, nome: { type: "string", example: "Livros" } },
  },
  Produto: {
    type: "object",
    required: ["id", "nome", "categoria_id", "preco", "stock"],
    properties: {
      id: { type: "integer", example: 10 },
      nome: { type: "string", example: "Caneca de Cerâmica" },
      categoria_id: { type: "integer", example: 3 },
      preco: { type: "number", example: 6.5, description: "Em euros. O SQLite devolve vírgula flutuante." },
      stock: { type: "integer", example: 200 },
    },
  },
  Encomenda: {
    type: "object",
    required: ["id", "cliente_id", "data_encomenda", "estado"],
    properties: {
      id: { type: "integer", example: 8 },
      cliente_id: { type: "integer", example: 1 },
      data_encomenda: { type: "string", example: "2025-04-15" },
      estado: { type: "string", enum: ESTADOS, example: "pendente" },
    },
  },
  EncomendaDetalhe: {
    type: "object",
    required: ["id", "cliente_id", "data_encomenda", "estado", "linhas", "total"],
    properties: {
      id: { type: "integer", example: 8 },
      cliente_id: { type: "integer", example: 1 },
      data_encomenda: { type: "string", example: "2025-04-15" },
      estado: { type: "string", enum: ESTADOS, example: "pendente" },
      linhas: {
        type: "array",
        items: {
          type: "object",
          required: ["produto_id", "quantidade", "preco_unitario"],
          properties: {
            produto_id: { type: "integer", example: 1 },
            quantidade: { type: "integer", example: 1 },
            preco_unitario: { type: "number", example: 12.9 },
          },
        },
      },
      total: { type: "number", example: 99.8 },
    },
  },
  NovaEncomenda: {
    type: "object",
    required: ["cliente_id", "linhas"],
    properties: {
      cliente_id: { type: "integer", minimum: 1, example: 2 },
      linhas: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["produto_id", "quantidade"],
          properties: {
            produto_id: { type: "integer", minimum: 1, example: 5 },
            quantidade: { type: "integer", minimum: 1, maximum: 100, example: 2 },
          },
        },
      },
    },
  },
  Erro: {
    type: "object",
    required: ["erro"],
    properties: {
      erro: { type: "string", example: "produto 99 não existe" },
      detalhes: { type: "array", items: { type: "string", example: "id: devia ser inteiro" } },
    },
  },
};

export type Resultado = { status: number; corpo: unknown };
export type Contexto = { params: Record<string, unknown>; query: Record<string, unknown>; corpo: unknown; db: Database };

export type Rota = {
  metodo: "get" | "post";
  caminho: string; // estilo OpenAPI: /produtos/{id}; o prefixo /api vem de "servers"
  resumo: string;
  parametros?: { nome: string; em: "path" | "query"; esquema: Esquema; obrigatorio?: boolean; descricao?: string }[];
  corpo?: Esquema;
  respostas: Record<number, { descricao: string; esquema?: Esquema }>;
  tratar: (ctx: Contexto) => Resultado;
};

const erro = (status: number, mensagem: string): Resultado => ({ status, corpo: { erro: mensagem } });
const arredondar = (n: number) => Math.round(n * 100) / 100;

function detalheEncomenda(db: Database, id: number): Resultado {
  const e = db.query("SELECT id, cliente_id, data_encomenda, estado FROM encomendas WHERE id = ?").get(id) as Record<string, unknown> | null;
  if (!e) return erro(404, `encomenda ${id} não existe`);
  const linhas = db
    .query("SELECT produto_id, quantidade, preco_unitario FROM linhas_encomenda WHERE encomenda_id = ? ORDER BY id")
    .all(id) as { quantidade: number; preco_unitario: number }[];
  const total = arredondar(linhas.reduce((s, l) => s + l.quantidade * l.preco_unitario, 0));
  return { status: 200, corpo: { ...e, linhas, total } };
}

export const rotas: Rota[] = [
  {
    metodo: "get",
    caminho: "/categorias",
    resumo: "Lista as categorias",
    respostas: { 200: { descricao: "Todas as categorias", esquema: { type: "array", items: ref("Categoria") } } },
    tratar: ({ db }) => ({ status: 200, corpo: db.query("SELECT id, nome FROM categorias ORDER BY id").all() }),
  },
  {
    metodo: "get",
    caminho: "/produtos",
    resumo: "Lista produtos, com filtros opcionais",
    parametros: [
      { nome: "categoria", em: "query", esquema: { type: "integer", minimum: 1 }, descricao: "Filtra por categoria_id" },
      { nome: "limite", em: "query", esquema: { type: "integer", minimum: 1, maximum: 50 }, descricao: "Máximo de produtos (por omissão 50)" },
    ],
    respostas: {
      200: { descricao: "Produtos por ordem de id", esquema: { type: "array", items: ref("Produto") } },
      400: { descricao: "Parâmetro inválido", esquema: ref("Erro") },
    },
    tratar: ({ db, query }) => ({
      status: 200,
      corpo: db
        .query("SELECT id, nome, categoria_id, preco, stock FROM produtos WHERE ($cat IS NULL OR categoria_id = $cat) ORDER BY id LIMIT $lim")
        .all({ $cat: (query.categoria as number) ?? null, $lim: (query.limite as number) ?? 50 }),
    }),
  },
  {
    metodo: "get",
    caminho: "/produtos/{id}",
    resumo: "Obtém um produto",
    parametros: [{ nome: "id", em: "path", esquema: { type: "integer", minimum: 1 }, obrigatorio: true }],
    respostas: {
      200: { descricao: "O produto", esquema: ref("Produto") },
      400: { descricao: "id inválido", esquema: ref("Erro") },
      404: { descricao: "Não existe", esquema: ref("Erro") },
    },
    tratar: ({ db, params }) => {
      const p = db.query("SELECT id, nome, categoria_id, preco, stock FROM produtos WHERE id = ?").get(params.id as number);
      return p ? { status: 200, corpo: p } : erro(404, `produto ${params.id} não existe`);
    },
  },
  {
    metodo: "get",
    caminho: "/encomendas",
    resumo: "Lista encomendas, com filtro por estado",
    parametros: [{ nome: "estado", em: "query", esquema: { type: "string", enum: ESTADOS } }],
    respostas: {
      200: { descricao: "Encomendas por ordem de id", esquema: { type: "array", items: ref("Encomenda") } },
      400: { descricao: "Parâmetro inválido", esquema: ref("Erro") },
    },
    tratar: ({ db, query }) => ({
      status: 200,
      corpo: db
        .query("SELECT id, cliente_id, data_encomenda, estado FROM encomendas WHERE ($e IS NULL OR estado = $e) ORDER BY id")
        .all({ $e: (query.estado as string) ?? null }),
    }),
  },
  {
    metodo: "get",
    caminho: "/encomendas/{id}",
    resumo: "Obtém uma encomenda com as linhas e o total",
    parametros: [{ nome: "id", em: "path", esquema: { type: "integer", minimum: 1 }, obrigatorio: true }],
    respostas: {
      200: { descricao: "A encomenda", esquema: ref("EncomendaDetalhe") },
      400: { descricao: "id inválido", esquema: ref("Erro") },
      404: { descricao: "Não existe", esquema: ref("Erro") },
    },
    tratar: ({ db, params }) => detalheEncomenda(db, params.id as number),
  },
  {
    metodo: "post",
    caminho: "/encomendas",
    resumo: "Cria uma encomenda e retira o stock",
    corpo: ref("NovaEncomenda"),
    respostas: {
      201: { descricao: "Encomenda criada", esquema: ref("EncomendaDetalhe") },
      400: { descricao: "JSON inválido", esquema: ref("Erro") },
      404: { descricao: "Cliente ou produto inexistente", esquema: ref("Erro") },
      409: { descricao: "Stock insuficiente", esquema: ref("Erro") },
      422: { descricao: "O corpo não cumpre o esquema", esquema: ref("Erro") },
    },
    tratar: ({ db, corpo }) => {
      const nova = corpo as { cliente_id: number; linhas: { produto_id: number; quantidade: number }[] };
      if (!db.query("SELECT 1 FROM clientes WHERE id = ?").get(nova.cliente_id)) {
        return erro(404, `cliente ${nova.cliente_id} não existe`);
      }
      // a transação reverte tudo se lançarmos um Resultado de erro a meio
      const criar = db.transaction((): number => {
        const hoje = new Date().toISOString().slice(0, 10);
        const { id } = db
          .query("INSERT INTO encomendas (cliente_id, data_encomenda, estado) VALUES (?, ?, 'pendente') RETURNING id")
          .get(nova.cliente_id, hoje) as { id: number };
        for (const l of nova.linhas) {
          const p = db.query("SELECT preco, stock FROM produtos WHERE id = ?").get(l.produto_id) as { preco: number; stock: number } | null;
          if (!p) throw erro(404, `produto ${l.produto_id} não existe`);
          if (p.stock < l.quantidade) throw erro(409, `stock insuficiente do produto ${l.produto_id}: ${p.stock}`);
          db.query("UPDATE produtos SET stock = stock - ? WHERE id = ?").run(l.quantidade, l.produto_id);
          db.query("INSERT INTO linhas_encomenda (encomenda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)").run(id, l.produto_id, l.quantidade, p.preco);
        }
        return id;
      });
      try {
        const detalhe = detalheEncomenda(db, criar());
        return { status: 201, corpo: detalhe.corpo };
      } catch (e) {
        if (e && typeof e === "object" && "status" in e) return e as Resultado;
        throw e;
      }
    },
  },
];
