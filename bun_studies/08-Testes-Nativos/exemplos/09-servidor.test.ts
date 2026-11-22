// Teste de integração: servidor real na porta 35081, pedidos reais com fetch. Correr: bun test 09-servidor
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { iniciar } from "./src/servidor.ts";

let servidor: Awaited<ReturnType<typeof iniciar>>;
let base: string;

beforeAll(async () => {
  servidor = await iniciar(35081); // base em memória nova para este ficheiro
  base = servidor.url.origin;
});
afterAll(() => servidor.stop(true)); // sem isto o processo podia ficar à espera

const post = (corpo: unknown) =>
  fetch(base + "/encomendas", { method: "POST", body: typeof corpo === "string" ? corpo : JSON.stringify(corpo) });

describe("GET /produtos/:id", () => {
  test("devolve o produto em JSON", async () => {
    const r = await fetch(base + "/produtos/5");
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toStartWith("application/json");
    expect(await r.json()).toEqual({ id: 5, nome: "Carregador USB-C", categoria_id: 2, preco: 14.9, stock: 100 });
  });

  test("produto inexistente dá 404", async () => {
    const r = await fetch(base + "/produtos/999");
    expect(r.status).toBe(404);
    expect(await r.json()).toEqual({ erro: "produto não existe" });
  });
});

describe("POST /encomendas", () => {
  test("cria a encomenda e devolve o total com IVA", async () => {
    const r = await post({ cliente_id: 2, linhas: [{ produto_id: 10, quantidade: 4 }] }); // 4 x 6.50 = 26.00
    expect(r.status).toBe(201);
    expect(await r.json()).toEqual({ id: expect.any(Number), total_com_iva: 31.98 });
  });

  test("corpo inválido dá 422 com a lista de erros", async () => {
    const r = await post({ cliente_id: 0, linhas: [] });
    expect(r.status).toBe(422);
    expect(await r.json()).toEqual({ erros: ["cliente_id: inteiro maior ou igual a 1", "linhas: pelo menos 1 linha"] });
  });

  test("JSON partido também dá 422", async () => {
    expect((await post("{isto não é json")).status).toBe(422);
  });

  test("stock insuficiente dá 409", async () => {
    const r = await post({ cliente_id: 1, linhas: [{ produto_id: 6, quantidade: 1 }] });
    expect(r.status).toBe(409);
    expect(await r.json()).toEqual({ erro: "stock insuficiente no produto 6: pedido 1, disponível 0" });
  });
});

test("rota desconhecida dá 404", async () => {
  expect((await fetch(base + "/fornecedores")).status).toBe(404);
});
