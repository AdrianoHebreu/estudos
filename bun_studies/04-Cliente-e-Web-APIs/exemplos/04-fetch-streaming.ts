import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { iniciar } from "./servidor-loja.ts";

const server = iniciar();
const base = server.url.origin;

// 1. Ler o corpo em streaming com for await: cada pedaço chega quando o servidor o envia
const t0 = performance.now();
const r = await fetch(`${base}/api/linhas.ndjson`);
let pedacos = 0;
let bytes = 0;
for await (const pedaco of r.body!) {
  pedacos++;
  bytes += pedaco.length;
}
console.log(`for await: ${pedacos} pedaços, ${bytes} bytes, ${Math.round(performance.now() - t0)} ms`);

// 2. Texto + linhas: TextDecoderStream e um acumulador (uma linha pode vir partida entre pedaços)
async function* linhas(resposta: Response) {
  const leitor = resposta.body!.pipeThrough(new TextDecoderStream()).getReader();
  let resto = "";
  while (true) {
    const { value, done } = await leitor.read();
    if (done) break;
    resto += value;
    let i;
    while ((i = resto.indexOf("\n")) >= 0) {
      yield resto.slice(0, i);
      resto = resto.slice(i + 1);
    }
  }
  if (resto) yield resto;
}
let n = 0;
for await (const linha of linhas(await fetch(`${base}/api/linhas.ndjson`))) {
  const p = JSON.parse(linha);
  if (++n <= 3) console.log("  linha", n, "->", p.nome, p.preco);
}
console.log("linhas lidas:", n);

// 3. Parar a meio: cancelar o corpo liberta a ligação
const r3 = await fetch(`${base}/api/linhas.ndjson`);
const leitor = r3.body!.getReader();
const primeiro = await leitor.read();
console.log("primeiro pedaço:", primeiro.value!.length, "bytes");
await leitor.cancel();
console.log("cancelado");

// 4. Descarregar para ficheiro: Bun.write aceita uma Response
const pasta = await mkdtemp(join(tmpdir(), "bn04-"));
const destino = join(pasta, "relatorio.csv");
const escritos = await Bun.write(destino, await fetch(`${base}/api/relatorio.csv`));
console.log("Bun.write ->", escritos, "bytes;", (await Bun.file(destino).text()).split("\n").length - 1, "linhas");

// 5. Corpo comprimido: o fetch descomprime sozinho (decompress: true por omissão)
const gz = await fetch(`${base}/api/comprimido`);
console.log("content-encoding:", gz.headers.get("content-encoding"), "| produtos:", (await gz.json()).length);
const bruto = await fetch(`${base}/api/comprimido`, { decompress: false });
const dados = await bruto.bytes();
console.log("decompress:false ->", dados.length, "bytes, começa por", [...dados.slice(0, 2)].map(b => b.toString(16)).join(" "));
console.log("descomprimido à mão:", JSON.parse(new TextDecoder().decode(Bun.gunzipSync(dados))).length, "produtos");

// 6. Corpo de pedido em streaming (ReadableStream como body)
const corpo = new ReadableStream({
  start(c) {
    c.enqueue('{"clienteId":2,');
    c.enqueue('"linhas":[{"produtoId":1,"quantidade":1}]}');
    c.close();
  },
});
const post = await fetch(`${base}/api/encomendas`, { method: "POST", body: corpo });
console.log("POST em streaming:", post.status, (await post.json()).id);

await rm(pasta, { recursive: true, force: true });
await server.stop();
