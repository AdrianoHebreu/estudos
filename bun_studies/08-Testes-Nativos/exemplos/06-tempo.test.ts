// Tempo simulado: setSystemTime e jest.useFakeTimers. Correr: bun test 06-tempo
import { afterEach, beforeEach, describe, expect, jest, setSystemTime, test } from "bun:test";
import { agrupar, estaAtrasada } from "./src/prazos.ts";

describe("setSystemTime muda Date e Date.now()", () => {
  afterEach(() => setSystemTime()); // sem argumentos volta à hora real

  test("a encomenda 8 (2025-04-15, pendente) está atrasada em maio, mas não em abril", () => {
    setSystemTime(new Date("2025-04-20T12:00:00Z"));
    expect(estaAtrasada("2025-04-15", "pendente")).toBe(false);
    setSystemTime(new Date("2025-05-01T12:00:00Z"));
    expect(estaAtrasada("2025-04-15", "pendente")).toBe(true);
    expect(estaAtrasada("2025-04-15", "entregue")).toBe(false);
  });

  test("o relógio parado dá resultados repetíveis", () => {
    setSystemTime(new Date("2025-06-01T00:00:00Z"));
    expect(new Date().toISOString()).toBe("2025-06-01T00:00:00.000Z");
  });
});

describe("jest.useFakeTimers controla setTimeout", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("agrupar só chama a função depois da espera", () => {
    const f = jest.fn();
    const a = agrupar(f, 500);
    a(1);
    a(2);
    a(3);
    jest.advanceTimersByTime(499);
    expect(f).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f).toHaveBeenCalledWith(3);
  });

  test("runAllTimers e getTimerCount", () => {
    setTimeout(() => {}, 10_000);
    setTimeout(() => {}, 20_000);
    expect(jest.getTimerCount()).toBe(2);
    jest.runAllTimers();
    expect(jest.getTimerCount()).toBe(0);
  });
});
