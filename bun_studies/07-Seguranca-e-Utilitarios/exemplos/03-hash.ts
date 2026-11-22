// Bun.CryptoHasher (criptográficos) e Bun.hash (não criptográficos)
console.log("algoritmos:", Bun.CryptoHasher.algorithms.join(", "));

const texto = "loja: encomenda 12";

// Forma encadeada
console.log("sha256 hex   :", new Bun.CryptoHasher("sha256").update(texto).digest("hex"));
console.log("sha256 base64:", new Bun.CryptoHasher("sha256").update(texto).digest("base64"));
console.log("md5 hex      :", new Bun.CryptoHasher("md5").update(texto).digest("hex"));
console.log("blake2b256   :", new Bun.CryptoHasher("blake2b256").update(texto).digest("hex"));
console.log("sha3-256     :", new Bun.CryptoHasher("sha3-256").update(texto).digest("hex"));

// Em várias partes e com copy()
const h = new Bun.CryptoHasher("sha256");
h.update("loja: ");
const copia = h.copy();
h.update("encomenda 12");
console.log("em partes    :", h.digest("hex") === new Bun.CryptoHasher("sha256").update(texto).digest("hex"));
console.log("copia (parcial):", copia.digest("hex").slice(0, 16) + "...");

// digest() sem argumento devolve bytes (Buffer). Na 1.4.0, depois do digest o objeto volta ao estado
// inicial: um segundo digest() dá o hash da entrada vazia e um update() recomeça do zero.
const h2 = new Bun.CryptoHasher("sha1").update("a");
console.log("digest bytes :", h2.digest().constructor.name, h2.byteLength);
console.log("2.º digest   :", h2.digest("hex"), "(sha1 da entrada vazia)");
console.log("update depois:", h2.update("b").digest("hex") === Bun.CryptoHasher.hash("sha1", "b", "hex"));

// Atalho estático
console.log("estático     :", Bun.CryptoHasher.hash("sha256", texto, "hex").slice(0, 16) + "...");
console.log("atalhos      :", Bun.SHA256.hash(texto, "hex").slice(0, 16) + "...", typeof Bun.sha);

// HMAC: o segundo argumento é a chave
const mac = new Bun.CryptoHasher("sha256", "segredo-de-estudo").update(texto).digest("hex");
console.log("hmac sha256  :", mac);

// Algoritmo que não existe
try { new Bun.CryptoHasher("sha999" as any); } catch (e: any) { console.log("sha999       :", e.message); }

// Bun.hash: não criptográficos. Devolve number (32 bits) ou bigint (64 bits)
console.log("--- Bun.hash ---");
console.log("Bun.hash(texto)      :", Bun.hash(texto), typeof Bun.hash(texto));
console.log("com semente          :", Bun.hash(texto, 1234n));
for (const nome of Object.keys(Bun.hash) as (keyof typeof Bun.hash)[]) {
  const f = (Bun.hash as any)[nome];
  const r = f(texto);
  console.log(String(nome).padEnd(12), typeof r === "bigint" ? "bigint " : "number ", r);
}

// Para que servem: chaves de cache, ETag, partição, deteção de alterações. NUNCA para segurança.
const etag = '"' + Bun.hash(JSON.stringify({ id: 12, estado: "pendente" })).toString(16) + '"';
console.log("etag exemplo :", etag);
console.log("crc32 de 'a' :", Bun.hash.crc32("a").toString(16), "(ficheiro zip/gzip usam crc32)");
