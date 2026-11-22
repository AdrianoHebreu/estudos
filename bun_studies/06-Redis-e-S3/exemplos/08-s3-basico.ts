// O cliente S3 nativo contra um servidor compatível com S3 (aqui o RustFS num contentor).
// Credenciais por variáveis de ambiente (nunca no código): S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY,
// S3_ENDPOINT (ex.: http://127.0.0.1:35061), S3_BUCKET e S3_REGION.
import { s3 } from "bun";

const ficheiro = s3.file("exemplos/ola.txt"); // preguiçoso: ainda não houve pedido nenhum
console.log("nome:", ficheiro.name, "| bucket:", ficheiro.bucket, "| é um Blob?", ficheiro instanceof Blob);
console.log("existe antes?", await ficheiro.exists());

console.log("write devolve os bytes escritos:", await ficheiro.write("Olá, S3!", { type: "text/plain" }));
console.log("text():", await ficheiro.text());
console.log("stat():", await ficheiro.stat());
console.log("size síncrono:", ficheiro.size, "| size do cliente:", await s3.size("exemplos/ola.txt"));

// slice usa o cabeçalho Range: conta bytes, não caracteres (o á tem 2 bytes em UTF-8)
console.log("slice(0, 3):", JSON.stringify(await ficheiro.slice(0, 3).text()), "| slice(4):", JSON.stringify(await ficheiro.slice(4).text()));

// JSON
await s3.write("exemplos/produto-3.json", JSON.stringify({ id: 3, nome: "Atlas Mundial" }), { type: "application/json" });
console.log("json():", await s3.file("exemplos/produto-3.json").json());
console.log("bytes():", await s3.file("exemplos/ola.txt").bytes());

// Bun.write aceita um S3File como destino
console.log("Bun.write ->", await Bun.write(s3.file("exemplos/bw.txt"), "via Bun.write"));

// Listagem (máximo 1000 objetos por pedido)
const lista = await s3.list({ prefix: "exemplos/" });
console.log("list:", lista.keyCount, "objetos, truncada:", lista.isTruncated);
for (const o of lista.contents ?? []) console.log("  ", o.key, o.size, o.storageClass);
const pagina = await s3.list({ prefix: "exemplos/", maxKeys: 2 });
console.log("maxKeys 2 -> truncada:", pagina.isTruncated, "| próximo:", pagina.nextContinuationToken !== undefined);
const resto = await s3.list({ prefix: "exemplos/", startAfter: pagina.contents!.at(-1)!.key });
console.log("startAfter:", resto.contents?.map(o => o.key));

// Com delimiter, as "pastas" aparecem em commonPrefixes (o S3 não tem pastas, só chaves com barras)
await s3.write("exemplos/sub/x.txt", "x");
const pastas = await s3.list({ prefix: "exemplos/", delimiter: "/" });
console.log("ficheiros:", pastas.contents?.map(o => o.key), "| pastas:", pastas.commonPrefixes);

// delete e unlink são o mesmo
console.log("delete:", await ficheiro.delete(), "| existe depois?", await ficheiro.exists());
await s3.delete("exemplos/produto-3.json");
await s3.unlink("exemplos/bw.txt");
await s3.delete("exemplos/sub/x.txt");
console.log("objetos que sobram:", (await s3.list({ prefix: "exemplos/" })).keyCount);
