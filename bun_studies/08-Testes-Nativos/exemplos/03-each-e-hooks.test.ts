// test.each, describe.each e hooks, aplicados à validação de encomendas. Correr: bun test 03-each
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { validarEncomenda } from "./src/encomenda.ts";

// Cada linha: [descrição, entrada, erros esperados]
const casos: [string, unknown, string[]][] = [
  ["encomenda válida", { cliente_id: 1, linhas: [{ produto_id: 4, quantidade: 2 }] }, []],
  ["corpo não é objeto", "olá", ["o corpo tem de ser um objeto"]],
  ["sem linhas", { cliente_id: 1, linhas: [] }, ["linhas: pelo menos 1 linha"]],
  ["cliente 0", { cliente_id: 0, linhas: [{ produto_id: 1, quantidade: 1 }] }, ["cliente_id: inteiro maior ou igual a 1"]],
  [
    "quantidade decimal",
    { cliente_id: 1, linhas: [{ produto_id: 1, quantidade: 1.5 }] },
    ["linhas[0].quantidade: inteiro maior ou igual a 1"],
  ],
];

describe("validarEncomenda", () => {
  // %s formata a primeira coluna; os restantes argumentos chegam à função
  test.each(casos)("%s", (_descricao, entrada, erros) => {
    const r = validarEncomenda(entrada);
    expect(r.ok ? [] : r.erros).toEqual(erros);
  });
});

// describe.each repete um grupo inteiro para cada valor
describe.each([
  { estado: "pendente", cancelavel: true },
  { estado: "enviada", cancelavel: false },
  { estado: "entregue", cancelavel: false },
])("encomenda $estado", ({ estado, cancelavel }) => {
  test(`cancelável: ${cancelavel}`, () => {
    expect(["pendente"].includes(estado)).toBe(cancelavel);
  });
});

// Hooks: a ordem de execução fica registada para a mostrarmos.
describe("hooks", () => {
  const registo: string[] = [];
  beforeAll(() => void registo.push("beforeAll"));
  afterAll(() => {
    registo.push("afterAll");
    console.log("ordem dos hooks:", registo.join(" > "));
  });
  beforeEach(() => void registo.push("beforeEach"));
  afterEach(() => void registo.push("afterEach"));

  test("primeiro", () => void registo.push("teste 1"));
  test("segundo", () => void registo.push("teste 2"));
});
