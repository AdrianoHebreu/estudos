// Compressão: gzip, deflate, zstd (síncronas e assíncronas) e streams
const linhas = Array.from({ length: 2000 }, (_, i) => JSON.stringify({ id: i + 1, cliente_id: (i % 8) + 1, estado: ["entregue", "enviada", "pendente"][i % 3], total: +(10 + (i % 17) * 3.5).toFixed(2) }));
const original = new TextEncoder().encode(linhas.join("\n"));
console.log("original      :", original.length, "bytes");

const gz = Bun.gzipSync(original);
console.log("gzip          :", gz.length, "bytes; cabeçalho", gz[0].toString(16), gz[1].toString(16));
console.log("gzip nível 9  :", Bun.gzipSync(original, { level: 9 }).length, "| nível 1:", Bun.gzipSync(original, { level: 1 }).length);
console.log("deflate       :", Bun.deflateSync(original).length, "bytes");
console.log("gunzip igual  :", Bun.deepEquals(Bun.gunzipSync(gz), original));
console.log("inflate igual :", Bun.deepEquals(Bun.inflateSync(Bun.deflateSync(original)), original));
console.log("tipos         :", gz.constructor.name, Bun.gunzipSync(gz).constructor.name);
console.log("aceita string :", Bun.gzipSync("olá olá olá olá").length);

// zstd (síncrono e assíncrono)
const zs = Bun.zstdCompressSync(original);
console.log("zstd          :", zs.length, "bytes; igual:", Bun.deepEquals(Bun.zstdDecompressSync(zs), original));
console.log("zstd nível 19 :", Bun.zstdCompressSync(original, { level: 19 }).length, "| nível 1:", Bun.zstdCompressSync(original, { level: 1 }).length);
const za = await Bun.zstdCompress(original);
console.log("zstd async    :", za.length, (await Bun.zstdDecompress(za)).length);

// Dados corrompidos
try { Bun.gunzipSync(new Uint8Array([1, 2, 3, 4])); } catch (e: any) { console.log("gunzip lixo   :", e.code ?? e.name, "-", e.message); }

// Streams: CompressionStream / DecompressionStream (padrão Web)
const origemStream = new Blob([original]).stream();
const comprimido = origemStream.pipeThrough(new CompressionStream("gzip"));
const bytesGz = new Uint8Array(await new Response(comprimido).arrayBuffer());
console.log("stream gzip   :", bytesGz.length, "bytes; Bun.gunzipSync lê-o:", Bun.deepEquals(Bun.gunzipSync(bytesGz), original));
const volta = new Blob([bytesGz]).stream().pipeThrough(new DecompressionStream("gzip"));
console.log("stream volta  :", (await new Response(volta).text()).split("\n").length, "linhas");

for (const formato of ["gzip", "deflate", "deflate-raw", "zstd", "brotli"]) {
  try { new CompressionStream(formato as any); console.log("CompressionStream", formato.padEnd(12), "existe"); }
  catch (e: any) { console.log("CompressionStream", formato.padEnd(12), "não:", e.message); }
}

