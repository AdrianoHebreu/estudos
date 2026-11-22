// Comprimir um export da loja: em memória, em ficheiro e em streaming
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Export: uma linha JSON por linha de encomenda (formato NDJSON), com 24 000 linhas geradas a partir dos dados da loja
const estados = ["entregue", "entregue", "cancelada", "enviada", "pendente"];
const precos = [12.9, 18.5, 29.99, 49.9, 14.9, 79, 22, 89.9, 34.5, 6.5];
let ndjson = "";
for (let i = 1; i <= 24000; i++) {
  ndjson += JSON.stringify({ id: i, encomenda_id: 1 + (i % 12), produto_id: 1 + (i % 10), quantidade: 1 + (i % 4), preco_unitario: precos[i % 10], estado: estados[i % 5] }) + "\n";
}
const bytes = new TextEncoder().encode(ndjson);
console.log("export original:", bytes.length, "bytes");

const pasta = mkdtempSync(join(tmpdir(), "est-bn07-"));
try {
  // 1. Em memória -> ficheiro
  await Bun.write(join(pasta, "export.ndjson"), bytes);
  await Bun.write(join(pasta, "export.ndjson.gz"), Bun.gzipSync(bytes));
  await Bun.write(join(pasta, "export.ndjson.zst"), Bun.zstdCompressSync(bytes, { level: 6 }));

  // 2. Em streaming, sem carregar o ficheiro todo (útil para exports grandes).
  // Atenção (Bun 1.4.0 no Windows): Bun.write(destino, new Response(stream)) ficou pendurado nos meus testes,
  // por isso escreve-se com o FileSink (writer) lendo o stream pedaço a pedaço.
  const escritor = Bun.file(join(pasta, "export-stream.ndjson.gz")).writer();
  const leitor = Bun.file(join(pasta, "export.ndjson")).stream().pipeThrough(new CompressionStream("gzip")).getReader();
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    escritor.write(value);
  }
  await escritor.end();

  for (const nome of ["export.ndjson", "export.ndjson.gz", "export.ndjson.zst", "export-stream.ndjson.gz"]) {
    const tam = statSync(join(pasta, nome)).size;
    console.log(nome.padEnd(26), String(tam).padStart(8), "bytes", (100 * tam / bytes.length).toFixed(1).padStart(5) + "%");
  }

  // 3. Ler de volta e confirmar
  const lido = Bun.gunzipSync(new Uint8Array(await Bun.file(join(pasta, "export.ndjson.gz")).arrayBuffer()));
  console.log("gz lido igual ao original :", Bun.deepEquals(lido, bytes));
  const viaStream = await new Response(Bun.file(join(pasta, "export-stream.ndjson.gz")).stream().pipeThrough(new DecompressionStream("gzip"))).text();
  console.log("stream lido igual         :", viaStream === ndjson);
  console.log("linhas / 1.ª linha        :", viaStream.trimEnd().split("\n").length, viaStream.split("\n")[0]);

  // 4. Tempos (melhor de 5), com o aviso habitual: a máquina está partilhada
  const melhor = (f: () => unknown) => { let m = Infinity; for (let i = 0; i < 5; i++) { const t = Bun.nanoseconds(); f(); m = Math.min(m, (Bun.nanoseconds() - t) / 1e6); } return m.toFixed(1); };
  console.log("tempo gzip nível 6 (omissão):", melhor(() => Bun.gzipSync(bytes)), "ms");
  console.log("tempo gzip nível 9          :", melhor(() => Bun.gzipSync(bytes, { level: 9 })), "ms");
  console.log("tempo zstd nível 3 (omissão):", melhor(() => Bun.zstdCompressSync(bytes)), "ms");
  console.log("tempo zstd nível 10         :", melhor(() => Bun.zstdCompressSync(bytes, { level: 10 })), "ms");
} finally {
  rmSync(pasta, { recursive: true, force: true });
}
