// Plugin de runtime: regista-se antes do código da aplicação (preload no bunfig.toml).
import { plugin } from "bun";

plugin({
  name: "csv-e-config",
  setup(build) {
    build.onLoad({ filter: /[.]csv$/ }, async ({ path }) => {
      const [cab, ...linhas] = (await Bun.file(path).text()).trim().split("\n");
      const campos = cab.split(",");
      const dados = linhas.map((l) => Object.fromEntries(l.split(",").map((v, i) => [campos[i], isNaN(+v) ? v : +v])));
      return { exports: { default: dados, total: dados.length }, loader: "object" };
    });
    build.module("loja:config", () => ({
      exports: { iva: 0.23, moeda: "EUR" },
      loader: "object",
    }));
  },
});
