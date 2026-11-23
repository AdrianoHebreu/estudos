// Compila a loja de várias maneiras e mede o tamanho de cada executável.
// Uso: bun build.ts <pasta-de-saida>   (a pasta é só tua: nada é escrito junto ao curso)
import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

const saida = process.argv[2];
if (!saida) throw new Error("uso: bun build.ts <pasta-de-saida>");
await mkdir(saida, { recursive: true });

const variantes: Record<string, Partial<Bun.BuildConfig>> = {
  simples: {},
  minify: { minify: true },
  "minify+sourcemap": { minify: true, sourcemap: "linked" },
  "minify+bytecode": { minify: true, bytecode: true, format: "esm" }, // sem format: "esm" o bytecode usa cjs e o await de topo falha
};

const exeBun = (await stat(process.execPath)).size;
console.log("bun.exe (o próprio Bun):", exeBun, "bytes");

for (const [nome, extra] of Object.entries(variantes)) {
  const outfile = join(saida, `loja-${nome.replaceAll("+", "-")}.exe`);
  const t0 = performance.now();
  const r = await Bun.build({ entrypoints: ["./loja-exe/main.ts"], compile: { outfile }, throw: false, ...extra });
  const ms = Math.round(performance.now() - t0);
  if (!r.success) {
    console.log(nome.padEnd(18), "FALHOU:", r.logs.map((l) => l.message).join("; "));
    continue;
  }
  const tamanho = (await stat(outfile)).size;
  console.log(
    nome.padEnd(18),
    String(tamanho).padStart(9),
    "bytes |",
    ((tamanho - exeBun) / 1024).toFixed(1).padStart(7),
    "KiB a mais que o bun.exe |",
    ms,
    "ms |",
    r.outputs.length,
    "saídas",
  );
}
