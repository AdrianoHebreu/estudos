// Servidor mínimo da loja para os testes de integração (a API completa é a do módulo 03).
import type { Database } from "bun:sqlite";
import { totalComIva } from "./calculo.ts";
import { validarEncomenda } from "./encomenda.ts";
import { abrirLojaEmMemoria, RepositorioLoja, StockInsuficiente } from "./repositorio.ts";

export async function iniciar(porta: number, db?: Database) {
  const repo = new RepositorioLoja(db ?? (await abrirLojaEmMemoria()));
  return Bun.serve({
    port: porta,
    hostname: "127.0.0.1",
    development: false,
    routes: {
      "/produtos/:id": (req) => {
        const p = repo.produto(Number(req.params.id));
        return p ? Response.json(p) : Response.json({ erro: "produto não existe" }, { status: 404 });
      },
      "/encomendas": {
        POST: async (req) => {
          const v = validarEncomenda(await req.json().catch(() => null));
          if (!v.ok) return Response.json({ erros: v.erros }, { status: 422 });
          try {
            const id = repo.criarEncomenda(v.valor, new Date().toISOString().slice(0, 10));
            return Response.json({ id, total_com_iva: totalComIva(repo.linhas(id)) }, { status: 201 });
          } catch (e) {
            if (e instanceof StockInsuficiente) return Response.json({ erro: e.message }, { status: 409 });
            throw e;
          }
        },
      },
    },
    fetch: () => Response.json({ erro: "rota não existe" }, { status: 404 }),
  });
}
