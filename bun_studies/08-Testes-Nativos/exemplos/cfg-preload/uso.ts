import { expect, test } from "bun:test";

test("o preload registou o matcher e a variável de ambiente", () => {
  // @ts-expect-error matcher registado em runtime pelo preload.ts
  expect(14.9).toSerPreco();
  // @ts-expect-error idem
  expect(14.999).not.toSerPreco();
  expect(process.env.LOJA_AMBIENTE).toBe("teste");
});
