// Matchers do expect. Correr: bun test 02-matchers
import { describe, expect, test } from "bun:test";

const produto = { id: 10, nome: "Caneca de Cerâmica", categoria_id: 3, preco: 6.5, stock: 200 };
const categorias = ["Livros", "Eletrónica", "Casa"];

describe("igualdade", () => {
  test("toBe compara com Object.is; toEqual compara a estrutura", () => {
    expect(produto).not.toBe({ ...produto });
    expect(produto).toEqual({ ...produto });
  });

  test("toEqual ignora undefined; toStrictEqual não", () => {
    expect({ a: 1, b: undefined }).toEqual({ a: 1 });
    expect({ a: 1, b: undefined }).not.toStrictEqual({ a: 1 });
  });

  test("toStrictEqual distingue classes", () => {
    class Ponto { constructor(public x: number) {} }
    expect(new Ponto(1)).toEqual({ x: 1 });
    expect(new Ponto(1)).not.toStrictEqual({ x: 1 });
  });
});

describe("conteúdo", () => {
  test("toContain, toHaveLength, toMatch", () => {
    expect(categorias).toContain("Casa");
    expect(categorias).toHaveLength(3);
    expect(produto.nome).toMatch(/^Caneca/);
    expect(produto.nome).toContain("Cerâmica");
  });

  test("toMatchObject verifica só um subconjunto", () => {
    expect(produto).toMatchObject({ nome: "Caneca de Cerâmica", stock: 200 });
  });

  test("toHaveProperty aceita caminhos", () => {
    expect({ encomenda: { linhas: [{ produto_id: 4 }] } }).toHaveProperty("encomenda.linhas[0].produto_id", 4);
  });
});

describe("números", () => {
  test("comparações e toBeCloseTo", () => {
    expect(produto.stock).toBeGreaterThan(100);
    expect(produto.preco).toBeLessThanOrEqual(6.5);
    expect(29.99 * 3).toBeCloseTo(89.97, 2);
  });
});

describe("erros", () => {
  const aviso = () => {
    throw new TypeError("preço negativo");
  };
  test("toThrow aceita classe, texto ou regex", () => {
    expect(aviso).toThrow();
    expect(aviso).toThrow(TypeError);
    expect(aviso).toThrow("negativo");
    expect(aviso).toThrow(/^preço/);
  });
});

describe("promessas", () => {
  test("resolves e rejects", async () => {
    await expect(Promise.resolve(produto)).resolves.toMatchObject({ id: 10 });
    await expect(Promise.reject(new Error("sem ligação"))).rejects.toThrow("sem ligação");
  });
});

describe("asymmetric matchers", () => {
  test("expect.any, expect.anything e expect.objectContaining", () => {
    const resposta = { id: 13, criada_em: new Date(), estado: "pendente", extra: 1 };
    expect(resposta).toEqual({
      id: expect.any(Number),
      criada_em: expect.any(Date),
      estado: expect.stringMatching(/^pend/),
      extra: expect.anything(),
    });
    expect(resposta).toEqual(expect.objectContaining({ estado: "pendente" }));
    expect(categorias).toEqual(expect.arrayContaining(["Casa", "Livros"]));
  });
});

describe("expect.assertions", () => {
  test("garante que o catch correu", async () => {
    expect.assertions(1);
    try {
      await Promise.reject(new Error("falhou"));
    } catch (e) {
      expect((e as Error).message).toBe("falhou");
    }
  });
});

describe("expect.extend", () => {
  expect.extend({
    toSerPrecoValido(recebido: unknown) {
      const ok = typeof recebido === "number" && recebido > 0 && Math.round(recebido * 100) === recebido * 100;
      return { pass: ok, message: () => `esperava um preço positivo com no máximo 2 casas, recebi ${String(recebido)}` };
    },
  });

  test("matcher próprio", () => {
    // @ts-expect-error o matcher só existe em runtime; os tipos exigiriam uma declaração
    expect(6.5).toSerPrecoValido();
    // @ts-expect-error idem
    expect(6.555).not.toSerPrecoValido();
  });
});
