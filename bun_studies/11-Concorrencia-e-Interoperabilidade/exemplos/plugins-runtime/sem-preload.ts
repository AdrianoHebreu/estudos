// Sem preload: os imports estáticos correm ANTES do plugin() existir, por isso o plugin
// tem de ser registado primeiro e o módulo importado depois, com import() dinâmico.
import { plugin } from "bun";

plugin({
  name: "inline",
  setup(build) {
    build.module("loja:versao", () => ({ exports: { VERSAO: "1.0.0" }, loader: "object" }));
  },
});

try {
  // @ts-ignore: o TypeScript não conhece o módulo virtual
  await import("loja:versao").then((m) => console.log("dinâmico OK:", m.VERSAO));
} catch (e) {
  console.log("erro:", (e as Error).message);
}
