// Corre uma vez antes de qualquer ficheiro de teste: regista matchers e hooks globais.
import { afterAll, beforeAll, expect } from "bun:test";

process.env.LOJA_AMBIENTE = "teste";

expect.extend({
  toSerPreco(recebido: unknown) {
    const ok = typeof recebido === "number" && recebido > 0 && Math.round(recebido * 100) === recebido * 100;
    return { pass: ok, message: () => `esperava um preço positivo com no máximo 2 casas, recebi ${String(recebido)}` };
  },
});

// Um beforeAll no preload aplica-se a todos os ficheiros.
beforeAll(() => console.log("[preload] antes de cada ficheiro"));
afterAll(() => console.log("[preload] depois de cada ficheiro"));
