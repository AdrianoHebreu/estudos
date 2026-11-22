// file.writer(): escrita incremental com um FileSink
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const pasta = await mkdtemp(join(tmpdir(), "bn02-"));
const caminho = join(pasta, "saida.log");
const escritor = Bun.file(caminho).writer({ highWaterMark: 1024 });

console.log("tipo:", escritor.constructor.name);
for (let i = 1; i <= 5; i++) {
  const r = escritor.write(`linha ${i}\n`);
  console.log(`write(${i}) devolveu`, r);
}
console.log("antes do flush, no disco:", Bun.file(caminho).size, "bytes");
const n = await escritor.flush();
console.log("flush devolveu", n, "| no disco:", Bun.file(caminho).size, "bytes");

escritor.write("última linha\n");
const total = await escritor.end();
console.log("end devolveu", total);
console.log(JSON.stringify(await Bun.file(caminho).text()));

// O writer não apaga o conteúdo antigo: escreve a partir do início do ficheiro existente
await Bun.write(caminho, "AAAAAAAAAAAAAAAA\n");
const w2 = Bun.file(caminho).writer();
w2.write("curto\n");
await w2.end();
console.log("sem truncar:", JSON.stringify(await Bun.file(caminho).text()));

// Para começar de novo, esvazia o ficheiro primeiro
await Bun.write(caminho, "");
const w3 = Bun.file(caminho).writer();
w3.write("curto\n");
await w3.end();
console.log("esvaziado antes:", JSON.stringify(await Bun.file(caminho).text()));

await rm(pasta, { recursive: true });
