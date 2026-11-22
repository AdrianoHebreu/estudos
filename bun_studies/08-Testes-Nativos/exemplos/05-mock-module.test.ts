// mock.module: substituir um módulo inteiro. Correr: bun test 05-mock-module
import { describe, expect, mock, test } from "bun:test";
import { confirmarEncomenda } from "./src/servico.ts";

const enviarAviso = mock(async (_email: string, _texto: string) => ({ id: "falso-1" }));
// Regista-se antes dos testes correrem: vale para todos os imports deste processo a partir daqui.
mock.module("./src/notificacoes.ts", () => ({ enviarAviso }));

const repo = { linhas: () => [{ quantidade: 2, preco_unitario: 18.5 }] } as never;

describe("confirmarEncomenda com o módulo de avisos falso", () => {
  test("avisa o cliente com o total com IVA", async () => {
    const r = await confirmarEncomenda(repo, 8, "ana.ribeiro@exemplo.pt");
    expect(r).toEqual({ total: 45.51, avisado: true });
    expect(enviarAviso).toHaveBeenCalledWith("ana.ribeiro@exemplo.pt", "A tua encomenda 8 custa 45.51 euros com IVA.");
  });

  test("sem email não avisa", async () => {
    enviarAviso.mockClear();
    expect(await confirmarEncomenda(repo, 8, null)).toEqual({ total: 45.51, avisado: false });
    expect(enviarAviso).not.toHaveBeenCalled();
  });
});
