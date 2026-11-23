// Bun.build: a API do bundler. Sem outdir, o resultado fica em memória.
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const r = await Bun.build({
  entrypoints: ["./app/cli.ts"],
  target: "bun",
  minify: true,
  sourcemap: "external",
});

console.log("success:", r.success, "| outputs:", r.outputs.length, "| logs:", r.logs.length);
for (const o of r.outputs) {
  // cada saída é um BuildArtifact: um Blob com campos extra
  console.log(o.kind.padEnd(11), o.path.padEnd(12), String(o.size).padStart(5), "bytes", o.type, "hash", o.hash, "loader", o.loader);
}
console.log("é um Blob?", r.outputs[0] instanceof Blob, "| tem sourcemap associado?", r.outputs[0].sourcemap?.path);
console.log("primeiros 60 carateres:", (await r.outputs[0].text()).slice(0, 60));

// Com outdir, o Bun escreve os ficheiros: o caminho passa a absoluto.
const dir = await mkdtemp(join(tmpdir(), "bn09-"));
const r2 = await Bun.build({ entrypoints: ["./app/cli.ts"], outdir: dir, naming: "[name]-[hash].[ext]" });
console.log("escrito:", (await readdir(dir)).join(", "), "| path absoluto?", r2.outputs[0].path.startsWith(dir));
await rm(dir, { recursive: true });
