// Repositório testado com SQLite em memória: cada teste tem a sua base limpa. Correr: bun test 08-repositorio
import type { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { abrirLojaEmMemoria, RepositorioLoja, StockInsuficiente } from "./src/repositorio.ts";

let db: Database;
let repo: RepositorioLoja;

beforeEach(async () => {
  db = await abrirLojaEmMemoria(); // base nova e isolada em cada teste
  repo = new RepositorioLoja(db);
});
afterEach(() => db.close());

describe("consultas", () => {
  test("a loja tem 10 produtos", () => {
    expect(repo.produtos()).toHaveLength(10);
  });

  test("filtra por categoria", () => {
    expect(repo.produtos(1).map((p) => p.nome)).toEqual(["Romance Policial", "Livro de Receitas", "Atlas Mundial"]);
  });

  test("produto inexistente dá null", () => {
    expect(repo.produto(999)).toBeNull();
  });
});

describe("criarEncomenda", () => {
  test("grava linhas, usa o preço atual e baixa o stock", () => {
    const id = repo.criarEncomenda({ cliente_id: 1, linhas: [{ produto_id: 4, quantidade: 2 }] }, "2026-11-22");
    expect(id).toBe(13); // a loja já tem 12 encomendas
    expect(repo.linhas(id)).toEqual([{ quantidade: 2, preco_unitario: 49.9 }]);
    expect(repo.produto(4)?.stock).toBe(28);
  });

  test("sem stock lança StockInsuficiente e a transação desfaz tudo", () => {
    const antes = db.query("SELECT COUNT(*) AS n FROM encomendas").get();
    const pedido = {
      cliente_id: 1,
      linhas: [
        { produto_id: 5, quantidade: 1 }, // há stock
        { produto_id: 6, quantidade: 1 }, // o teclado tem stock 0
      ],
    };
    expect(() => repo.criarEncomenda(pedido, "2026-11-22")).toThrow(StockInsuficiente);
    expect(db.query("SELECT COUNT(*) AS n FROM encomendas").get()).toEqual(antes);
    expect(repo.produto(5)?.stock).toBe(100); // o carregador voltou ao stock original
  });

  test("a chave estrangeira recusa clientes que não existem", () => {
    expect(() => repo.criarEncomenda({ cliente_id: 99, linhas: [{ produto_id: 1, quantidade: 1 }] }, "2026-11-22")).toThrow(
      /FOREIGN KEY/,
    );
  });
});
