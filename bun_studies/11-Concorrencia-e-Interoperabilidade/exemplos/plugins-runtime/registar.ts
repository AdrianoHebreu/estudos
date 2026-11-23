import { plugin, type BunPlugin } from "bun";

const lojaPlugin: BunPlugin = {
  name: "loja-runtime",
  setup(build) {
    // 1. Um loader para ficheiros .csv: import linhas from "./produtos.csv"
    build.onLoad({ filter: /\.csv$/ }, async ({ path }) => {
      const texto = await Bun.file(path).text();
      const [cabecalho, ...linhas] = texto.trim().split(/\r?\n/);
      const colunas = cabecalho.split(",");
      const objetos = linhas.map((l) => Object.fromEntries(l.split(",").map((v, i) => [colunas[i], isNaN(+v) ? v : +v])));
      return { exports: { default: objetos, colunas }, loader: "object" };
    });

    // 2. Um módulo virtual (não existe em disco): import { NOME } from "loja:config"
    build.module("loja:config", () => ({
      exports: { NOME: "Papelaria do Bun", IVA: 0.23 },
      loader: "object",
    }));

    // 3. Um espaço de nomes próprio: import { hoje } from "gerado:relogio"
    //    onResolve recebe só o que vem depois de "gerado:" e onLoad devolve o código-fonte
    build.onResolve({ filter: /.*/, namespace: "gerado" }, (args) => ({ path: args.path, namespace: "gerado" }));
    build.onLoad({ filter: /.*/, namespace: "gerado" }, (args) => ({
      contents: `export const nome = ${JSON.stringify(args.path)}; export const hoje = ${JSON.stringify(new Date(0).toISOString().slice(0, 10))};`,
      loader: "js",
    }));
  },
};

plugin(lojaPlugin);
console.log("[preload] plugin registado");
