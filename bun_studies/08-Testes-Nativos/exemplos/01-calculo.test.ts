// Primeiros testes: funções puras de src/calculo.ts. Correr: bun test 01-calculo
import { describe, expect, it, test } from "bun:test";
import { arredondar, formatarEuros, IVA, totalComIva, totalSemIva } from "./src/calculo.ts";

// Linhas da encomenda 8 da loja (loja.sql): 1 x 12.90, 2 x 18.50 e 1 x 49.90
const encomenda8 = [
  { quantidade: 1, preco_unitario: 12.9 },
  { quantidade: 2, preco_unitario: 18.5 },
  { quantidade: 1, preco_unitario: 49.9 },
];

describe("totalSemIva", () => {
  test("soma quantidade vezes preço", () => {
    expect(totalSemIva(encomenda8)).toBe(99.8);
  });

  it("devolve 0 sem linhas", () => {
    expect(totalSemIva([])).toBe(0);
  });
});

describe("totalComIva", () => {
  test("usa 23% por omissão", () => {
    expect(IVA).toBe(0.23);
    expect(totalComIva(encomenda8)).toBe(122.75); // 99.80 * 1.23 = 122.754
  });

  test("aceita outra taxa", () => {
    expect(totalComIva(encomenda8, 0.06)).toBe(105.79);
  });

  test("rejeita taxas fora de 0 a 1", () => {
    expect(() => totalComIva(encomenda8, 23)).toThrow(RangeError);
    expect(() => totalComIva(encomenda8, 23)).toThrow("taxa de IVA inválida: 23");
  });
});

describe("vírgula flutuante", () => {
  test("0.1 + 0.2 não é 0.3, mas é próximo", () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(0.1 + 0.2).toBeCloseTo(0.3, 10);
  });

  test("arredondar corrige o caso clássico de 1.005", () => {
    expect(Math.round(1.005 * 100) / 100).toBe(1); // o erro habitual
    expect(arredondar(1.005)).toBe(1.01);
  });
});

test("formatarEuros usa vírgula decimal", () => {
  expect(formatarEuros(122.75)).toBe("122,75 €");
});

// Estados especiais: aparecem no resumo, mas não falham a execução.
test.skip("ainda por decidir: IVA reduzido por categoria", () => {});
test.todo("arredondar para o cêntimo em cada linha e não só no total");
test.failing("bug conhecido (falha de propósito): desconto por quantidade", () => {
  expect(totalSemIva([{ quantidade: 10, preco_unitario: 10 }])).toBe(90);
});
