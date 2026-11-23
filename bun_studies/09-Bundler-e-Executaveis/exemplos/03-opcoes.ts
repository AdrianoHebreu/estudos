import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

// As opções mais usadas do Bun.build, uma a uma, sobre o mesmo programa (app/cli.ts). Tudo em memória.
const base = { entrypoints: ["./app/cli.ts"] };
const texto = async (cfg: Partial<Bun.BuildConfig>) => (await (await Bun.build({ ...base, ...cfg })).outputs[0].text()).trim();
const linhas = (s: string) => s.split("\n").length;

// target e format
for (const target of ["browser", "bun", "node"] as const) {
  const t = await texto({ target });
  console.log("target", target.padEnd(8), t.length, "bytes | 1.ª linha:", t.split("\n")[0]);
}
for (const format of ["esm", "cjs", "iife"] as const) {
  const t = await texto({ format });
  console.log("format", format.padEnd(5), t.length, "bytes |", linhas(t), "linhas | começa por:", JSON.stringify(t.slice(0, 22)));
}

// minify: tudo, ou por partes
console.log("minify true      :", (await texto({ minify: true })).length, "bytes");
console.log("só whitespace    :", (await texto({ minify: { whitespace: true } })).length, "bytes");
console.log("só identifiers   :", (await texto({ minify: { identifiers: true } })).length, "bytes");
console.log("só syntax        :", (await texto({ minify: { syntax: true } })).length, "bytes");

// define: substitui identificadores por constantes (aqui entra o remover código morto)
const comDefine = await texto({ define: { VERSAO: JSON.stringify("1.2.3") }, minify: true });
console.log("define VERSAO    :", comDefine.slice(-60));

// banner e footer
const bf = await texto({ banner: "// loja 1.0", footer: "// fim" });
console.log("banner/footer    :", JSON.stringify(bf.split("\n")[0]), JSON.stringify(bf.split("\n").at(-1)));

// external: o import fica no resultado em vez de ser empacotado (e de falhar por não existir)
const ext = await Bun.build({ entrypoints: ["./app/ext.ts"], external: ["pacote-inexistente"] });
console.log("external         :", (await ext.outputs[0].text()).trim().split("\n").slice(-2).join(" | "));

// naming: modelo do nome dos ficheiros ([name], [hash], [ext], [dir])
const nome = await Bun.build({ ...base, naming: "saida/[name].[hash].[ext]" });
console.log("naming           :", nome.outputs[0].path);

// metafile: o mapa de módulos e de bytes (existe na 1.4.0)
const meta = await Bun.build({ ...base, metafile: true });
const m = meta.metafile as { inputs: Record<string, { bytes: number }> };
console.log("metafile inputs  :", Object.entries(m.inputs).map(([k, v]) => `${k}=${v.bytes}B`).join(", "));

// tree shaking: a exportação NUNCA_USADA do preco.ts não chega ao resultado
console.log("tree shaking     : NUNCA_USADA no pacote?", (await texto({})).includes("NUNCA_USADA"));

// splitting: dois pontos de entrada que partilham o preco.ts e um import() dinâmico => chunks (precisa de outdir)
const dir = await mkdtemp(join(tmpdir(), "bn09-"));
const sp = await Bun.build({ entrypoints: ["./app/a.ts", "./app/b.ts"], splitting: true, outdir: dir, naming: { entry: "[name].[ext]", chunk: "chunk-[name]-[hash].[ext]" } });
console.log("splitting        :", sp.outputs.map((o) => `${basename(o.path)} (${o.kind}, ${o.size}B)`).join(", "));
await rm(dir, { recursive: true });

// env: por omissão o process.env fica por resolver; inline cola TODOS os valores no pacote (cuidado com segredos)
// (o bundler lê o ambiente com que o processo arrancou: atribuir a process.env aqui dentro não chega.
// Corre assim: PUBLIC_API=https://api.exemplo SEGREDO=abc123 bun 03-opcoes.ts)
for (const env of ["disable", "inline", "PUBLIC_*"] as const) {
  const r = await Bun.build({ entrypoints: ["./entrada.ts"], env, files: { "./entrada.ts": "console.log(process.env.PUBLIC_API, process.env.SEGREDO);" } });
  console.log("env", env.padEnd(9), (await r.outputs[0].text()).split("\n").find((l) => l.startsWith("console")));
}
