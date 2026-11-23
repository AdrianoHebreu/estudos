// Plugin de build: Bun.build({ plugins }). Dois truques: carregar .csv como módulo e criar um módulo virtual.
import type { BunPlugin } from "bun";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const eventos: string[] = [];

const lojaPlugin: BunPlugin = {
  name: "loja",
  setup(build) {
    build.onStart(() => void eventos.push("onStart"));
    build.onEnd((r) => void eventos.push("onEnd (success=" + r.success + ")"));

    // 1) onLoad com filtro: qualquer .csv passa a ser um módulo JavaScript com um array de objetos
    build.onLoad({ filter: /[.]csv$/ }, async ({ path }) => {
      const [cabecalho, ...linhas] = (await Bun.file(path).text()).trim().split("\n");
      const campos = cabecalho.split(",");
      const registos = linhas.map((l) => {
        const v = l.split(",");
        return Object.fromEntries(campos.map((c, i) => [c, c === "nome" ? v[i] : Number(v[i])]));
      });
      eventos.push("onLoad " + basename(path));
      return { contents: "export default " + JSON.stringify(registos), loader: "js" };
    });

    // 2) módulo virtual: o import "loja:build" não corresponde a nenhum ficheiro
    build.onResolve({ filter: /^loja:/ }, ({ path }) => ({ path, namespace: "loja-virtual" }));
    build.onLoad({ filter: /.*/, namespace: "loja-virtual" }, () => ({
      contents: `export const versao = "1.0.0"; export const compilado_em = ${JSON.stringify(new Date().toISOString())};`,
      loader: "js",
    }));
  },
};

const r = await Bun.build({ entrypoints: ["./plugins/usar.ts"], plugins: [lojaPlugin], target: "bun" });
console.log("success:", r.success, "| eventos:", eventos.join(", "));
const codigo = await r.outputs[0].text();
console.log(codigo.split("\n").filter((l) => l.startsWith("//") || l.includes("versao =")).join("\n"));

// o resultado é só JavaScript: grava-o numa pasta temporária e corre-o
const dir = await mkdtemp(join(tmpdir(), "bn09-"));
await Bun.write(join(dir, "saida.js"), codigo);
await Bun.spawn([process.execPath, "run", join(dir, "saida.js")], { stdout: "inherit" }).exited;
await rm(dir, { recursive: true });
