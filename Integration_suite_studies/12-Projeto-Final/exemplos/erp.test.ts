import { afterEach, beforeEach, expect, test } from "bun:test";
import { criarSimulador } from "./erp";

function iniciar() {
  return Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: criarSimulador() });
}
let servidor: ReturnType<typeof iniciar>;

beforeEach(() => { servidor = iniciar(); });
afterEach(() => { servidor.stop(true); });

const encomenda = { externalId: "CN-1001", items: [{ sku: "C-01", quantity: 2 }] };

function enviar(body: unknown, falha = false) {
  return fetch(new URL("/orders", servidor.url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(falha ? { "X-Lab-Fail": "before-write" } : {}),
    },
    body: JSON.stringify(body),
  });
}

function consultar() {
  return fetch(new URL("/orders/CN-1001", servidor.url));
}

test("regista e permite consultar a encomenda", async () => {
  const criada = await enviar(encomenda);
  expect(criada.status).toBe(201);
  expect(criada.headers.get("location")).toBe("/orders/CN-1001");
  const registo = await criada.json();
  expect(registo).toEqual({ ...encomenda, erpId: "ERP-1001", status: "accepted" });
  const existente = await consultar();
  expect(existente.status).toBe(200);
  expect(await existente.json()).toEqual(registo);
});

test("a repetição idêntica devolve a mesma referência", async () => {
  const primeira = await enviar(encomenda);
  const repetida = await enviar(encomenda);
  expect(primeira.status).toBe(201);
  expect(repetida.status).toBe(200);
  expect(await repetida.json()).toEqual(await primeira.json());
});

test("conflito de conteúdo preserva a encomenda original", async () => {
  await enviar(encomenda);
  const alterada = { ...encomenda, items: [{ sku: "C-01", quantity: 3 }] };
  expect((await enviar(alterada)).status).toBe(409);
  expect((await (await consultar()).json()).items).toEqual(encomenda.items);
});

test("uma quantidade inválida não cria uma encomenda", async () => {
  const invalida = { ...encomenda, items: [{ sku: "C-01", quantity: 0 }] };
  expect((await enviar(invalida)).status).toBe(400);
  expect((await consultar()).status).toBe(404);
});

test("indisponibilidade antes da escrita permite nova tentativa", async () => {
  const indisponivel = await enviar(encomenda, true);
  expect(indisponivel.status).toBe(503);
  expect(indisponivel.headers.get("retry-after")).toBe("1");
  expect((await consultar()).status).toBe(404);
  expect((await enviar(encomenda)).status).toBe(201);
});
