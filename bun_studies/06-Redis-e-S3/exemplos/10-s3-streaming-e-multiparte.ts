// writer() com envio em partes (multipart), leitura em streaming, S3Client explícito,
// cópia entre disco e S3 e S3File dentro de uma Response.
import { S3Client } from "bun";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

// Credenciais explícitas em vez do Bun.s3 (continuam a vir do ambiente, nunca do código).
const cliente = new S3Client({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
  bucket: process.env.S3_BUCKET,
  region: "us-east-1",
});

// 1. writer pequeno: escreves aos poucos, end() fecha
const csv = cliente.file("exemplos/linhas.csv");
const w = csv.writer({ type: "text/csv" });
w.write("id,nome\n");
w.write("1,Romance Policial\n");
await w.end();
console.log("csv:", JSON.stringify(await csv.text()), "|", (await csv.stat()).type);

// 2. multipart: 12 MB em partes de 5 MB (a parte mínima do S3 é 5 MB)
const grande = cliente.file("exemplos/grande.bin");
const mb = new Uint8Array(1024 * 1024).fill(7);
const w2 = grande.writer({ partSize: 5 * 1024 * 1024, queueSize: 3, retry: 2 });
let t = performance.now();
for (let i = 0; i < 12; i++) {
  w2.write(mb);
  await w2.flush();
}
await w2.end();
const st = await grande.stat();
console.log(`multipart: ${st.size} bytes em ${(performance.now() - t).toFixed(0)} ms | etag ${st.etag}`);
console.log("(o sufixo -3 do etag indica 3 partes)");

// 3. leitura em streaming e leitura parcial
let total = 0;
let blocos = 0;
for await (const bloco of grande.stream()) {
  total += bloco.length;
  blocos++;
}
console.log(`stream: ${total} bytes em ${blocos} blocos`);
console.log("slice(5 MB - 2, 5 MB + 2):", await grande.slice(5 * 1024 * 1024 - 2, 5 * 1024 * 1024 + 2).bytes());

// write() com um buffer de 12 MB de uma vez: ao contrário do writer, é um único PUT (etag sem sufixo)
await grande.write(new Uint8Array(12 * 1024 * 1024));
console.log("write de 12 MB de uma vez, etag:", (await grande.stat()).etag);

// 4. entre disco e S3
const pasta = await mkdtemp(`${tmpdir()}/est-bn06-`);
const local = `${pasta}/copia.csv`.replaceAll("\\", "/");
await Bun.write(local, csv);                       // S3 -> disco
await Bun.write(cliente.file("exemplos/copia.csv"), Bun.file(local)); // disco -> S3
console.log("iguais?", (await Bun.file(local).text()) === (await cliente.file("exemplos/copia.csv").text()));
await rm(pasta, { recursive: true });

// 5. Response com um S3File: o Bun devolve um redirecionamento 302 para um URL pré-assinado
const r = new Response(csv);
const destino = new URL(r.headers.get("location")!);
console.log("Response(S3File):", r.status, destino.origin + destino.pathname, "| expira em", destino.searchParams.get("X-Amz-Expires"), "s");

for (const k of ["linhas.csv", "grande.bin", "copia.csv"]) await cliente.delete(`exemplos/${k}`);
console.log("objetos que sobram:", (await cliente.list({ prefix: "exemplos/" })).keyCount);
