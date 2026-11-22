// Bun.write: escreve quase tudo para um ficheiro e devolve os bytes escritos
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const LOJA = import.meta.dir + "/../../00-Introducao/dados/loja.sql";

// pasta temporária, apagada no fim
const pasta = await mkdtemp(join(tmpdir(), "bn02-"));

// Bun.write cria as pastas que faltarem
const a = await Bun.write(pasta + "/texto.txt", "Olá, loja!\n");
console.log("string      ->", a, "bytes");

const b = await Bun.write(pasta + "/dados.json", JSON.stringify({ produtos: 10 }));
console.log("JSON        ->", b, "bytes");

const c = await Bun.write(pasta + "/bytes.bin", new Uint8Array([72, 105, 33]));
console.log("Uint8Array  ->", c, "bytes");

const d = await Bun.write(pasta + "/buffer.bin", new TextEncoder().encode("ArrayBuffer").buffer);
console.log("ArrayBuffer ->", d, "bytes");

const e = await Bun.write(pasta + "/blob.txt", new Blob(["dentro de um Blob"], { type: "text/plain" }));
console.log("Blob        ->", e, "bytes");

const f = await Bun.write(pasta + "/resposta.txt", new Response("corpo de uma Response"));
console.log("Response    ->", f, "bytes");

// Copiar: o segundo argumento pode ser outro BunFile
const g = await Bun.write(pasta + "/copia.sql", Bun.file(LOJA));
console.log("BunFile     ->", g, "(devolve 0 neste Windows; no disco:", Bun.file(pasta + "/copia.sql").size, "bytes)");

// Cuidado: copiar um slice() de um BunFile copiou o ficheiro todo (Windows, Bun 1.4.0)
await Bun.write(pasta + "/parte-errada.sql", Bun.file(LOJA).slice(0, 10));
console.log("slice(0, 10) copiado:", Bun.file(pasta + "/parte-errada.sql").size, "bytes (esperavas 10)");
// Solução: lê o pedaço para memória e escreve esse
await Bun.write(pasta + "/parte.sql", await Bun.file(LOJA).slice(0, 10).arrayBuffer());
console.log("via arrayBuffer:", Bun.file(pasta + "/parte.sql").size, "bytes");

// Escrever num BunFile também funciona; sobrescreve o que lá estava
const destino = Bun.file(pasta + "/texto.txt");
await Bun.write(destino, "Segunda versão\n");
console.log("sobrescrito:", JSON.stringify(await destino.text()));

// Escrever uma ligação para o stdout e para o stderr
await Bun.write(Bun.stdout, "para o stdout\n");
await Bun.write(Bun.stderr, "para o stderr\n");

// Verificar que a copia e o original sao iguais
const igual = (await Bun.file(pasta + "/copia.sql").text()) === (await Bun.file(LOJA).text());
console.log("copia igual ao original:", igual);

await rm(pasta, { recursive: true, force: true });
