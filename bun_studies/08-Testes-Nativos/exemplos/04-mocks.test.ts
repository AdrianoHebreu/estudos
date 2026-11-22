// Mocks, spies e substituição de módulos. Correr: bun test 04-mocks
import { afterEach, describe, expect, jest, mock, spyOn, test } from "bun:test";
import { totalComIva } from "./src/calculo.ts";
import * as calculo from "./src/calculo.ts";

// mock mais simples: uma função que regista as chamadas
describe("mock() e jest.fn()", () => {
  test("regista chamadas e argumentos", () => {
    const f = mock((a: number, b: number) => a + b);
    expect(f(1, 2)).toBe(3);
    f(3, 4);
    expect(f).toHaveBeenCalledTimes(2);
    expect(f).toHaveBeenCalledWith(3, 4);
    expect(f).toHaveBeenLastCalledWith(3, 4);
    expect(f.mock.calls).toEqual([[1, 2], [3, 4]]);
    expect(f.mock.results[0]).toEqual({ type: "return", value: 3 });
  });

  test("jest.fn() existe e é equivalente", () => {
    const g = jest.fn().mockReturnValueOnce("primeira").mockReturnValue("seguintes");
    expect([g(), g(), g()]).toEqual(["primeira", "seguintes", "seguintes"]);
  });

  test("mockResolvedValue e mockRejectedValue", async () => {
    const buscar = jest.fn().mockResolvedValueOnce({ id: 1 }).mockRejectedValueOnce(new Error("offline"));
    expect(await buscar()).toEqual({ id: 1 });
    await expect(buscar()).rejects.toThrow("offline");
  });
});

// spyOn observa (e, se quiseres, substitui) um método de um objeto que já existe
describe("spyOn", () => {
  afterEach(() => jest.restoreAllMocks());

  test("observa sem alterar o comportamento", () => {
    const espiao = spyOn(Math, "max");
    expect(Math.max(1, 5, 3)).toBe(5);
    expect(espiao).toHaveBeenCalledWith(1, 5, 3);
  });

  test("substitui a implementação e restaura depois", () => {
    spyOn(Math, "random").mockReturnValue(0.5);
    expect(Math.random()).toBe(0.5);
    jest.restoreAllMocks();
    expect(Math.random()).not.toBe(0.5);
  });

  test("substitui o fetch global sem rede", async () => {
    const f = spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ id: "aviso-1" }));
    const { enviarAviso } = await import("./src/notificacoes.ts");
    expect(await enviarAviso("ana.ribeiro@exemplo.pt", "olá")).toEqual({ id: "aviso-1" });
    const [url, opcoes] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://avisos.exemplo.invalid/enviar");
    expect(JSON.parse(opcoes.body as string)).toEqual({ email: "ana.ribeiro@exemplo.pt", texto: "olá" });
  });
});

test("spyOn sobre um módulo importado como namespace", () => {
  // as funções exportadas de um módulo ES são ligações: o spy vê as chamadas feitas através do namespace
  const s = spyOn(calculo, "arredondar");
  expect(calculo.arredondar(1.005)).toBe(1.01);
  expect(s).toHaveBeenCalledTimes(1);
  s.mockRestore();
  expect(totalComIva([{ quantidade: 1, preco_unitario: 10 }])).toBe(12.3);
});
