// Snapshots: guardam a saída e comparam nas execuções seguintes. Correr: bun test 07-snapshots
import { describe, expect, test } from "bun:test";
import { totalComIva } from "./src/calculo.ts";
import { abrirLojaEmMemoria, RepositorioLoja } from "./src/repositorio.ts";

const repo = new RepositorioLoja(await abrirLojaEmMemoria());

describe("snapshots", () => {
  test("a lista de produtos da categoria 2 (ficheiro .snap)", () => {
    expect(repo.produtos(2)).toMatchSnapshot();
  });

  test("a encomenda 8 resumida (inline)", () => {
    const linhas = repo.linhas(8);
    expect({ linhas: linhas.length, semIva: totalComIva(linhas, 0), comIva: totalComIva(linhas) }).toMatchInlineSnapshot(`
      {
        "comIva": 122.75,
        "linhas": 3,
        "semIva": 99.8,
      }
    `);
  });

  test("propriedades que mudam entram como matchers", () => {
    const resposta = { id: 13, criada_em: new Date().toISOString(), estado: "pendente" };
    expect(resposta).toMatchSnapshot({ criada_em: expect.any(String) });
  });
});
