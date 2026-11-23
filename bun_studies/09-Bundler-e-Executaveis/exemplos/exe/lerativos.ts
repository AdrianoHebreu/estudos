// Ficheiros embutidos com --asset: lidos pelo mesmo caminho relativo, de dentro do executável.
import { readdirSync } from "node:fs";
import { join } from "node:path";

const base = import.meta.dir;
console.log("import.meta.dir:", base);
for (const nome of ["publico/index.html", "publico/estilo.css", "nao-existe.txt"]) {
  const f = Bun.file(join(base, nome));
  console.log(nome.padEnd(20), (await f.exists()) ? "existe, " + f.size + " bytes" : "não existe");
}
console.log("embeddedFiles:", Bun.embeddedFiles.map((e) => (e as File).name));
