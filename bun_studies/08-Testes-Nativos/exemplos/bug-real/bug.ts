// Correr: bun test ./bug.ts   (falha de propósito: o nome do ficheiro não tem .test, por isso o bun test normal ignora-o)
import { expect, test } from "bun:test";
import { validarEncomendaV1 } from "./encomenda-v1.ts";
import { validarEncomenda } from "../src/encomenda.ts";

const entradas = [
  { cliente_id: 1, linhas: [{ produto_id: 1, quantidade: 1.5 }] },
  { cliente_id: 1, linhas: [{ produto_id: 1, quantidade: 0 }] },
];

test("V1: quantidades inválidas têm de ser recusadas", () => {
  for (const e of entradas) expect(validarEncomendaV1(e)).toHaveLength(1);
});

test("V1: o resultado completo", () => {
  expect(validarEncomendaV1(entradas[0])).toEqual(["linhas[0].quantidade: inteiro maior ou igual a 1"]);
});

test("versão corrigida (src/encomenda.ts) recusa as duas", () => {
  for (const e of entradas) expect(validarEncomenda(e).ok).toBe(false);
});
