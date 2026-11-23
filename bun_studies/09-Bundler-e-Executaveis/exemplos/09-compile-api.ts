// Bun.build com compile: o mesmo que bun build --compile, mas em código. Tudo numa pasta temporária.
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const dir = await mkdtemp(join(tmpdir(), "bn09-"));
const exe = join(dir, "relatorio.exe"); // no Linux e no macOS o ficheiro não leva .exe

const t0 = performance.now();
const r = await Bun.build({
  entrypoints: ["./exe/relatorio.ts"],
  compile: { outfile: exe }, // compile: true também serve, com outdir
  minify: true,
  sourcemap: "linked",
});
console.log("success:", r.success, "| tempo:", Math.round(performance.now() - t0), "ms");
for (const o of r.outputs) console.log(" ", o.kind.padEnd(11), basename(o.path), o.size, "bytes");
console.log("tamanho no disco:", (await stat(exe)).size, "bytes");

// corre o executável, com argumentos e uma variável de ambiente só dele
const p = Bun.spawn([exe, "ola", "mundo"], { env: { ...process.env, LOJA_IVA: "0.06" }, stdout: "pipe" });
const saida = await new Response(p.stdout).text();
console.log("código de saída:", await p.exited);
console.log(saida.split("\n").slice(0, 6).join("\n"));
await rm(dir, { recursive: true });
