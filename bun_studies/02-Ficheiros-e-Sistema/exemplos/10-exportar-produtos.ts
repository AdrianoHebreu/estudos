// A loja: exportar os produtos de loja.sql para CSV e JSON (sem SQLite, só ficheiros)
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

type Produto = { id: number; nome: string; categoriaId: number; preco: number; stock: number };

const LOJA = import.meta.dir + "/../../00-Introducao/dados/loja.sql";
const sql = await Bun.file(LOJA).text();

// Cada produto é uma linha: INSERT INTO produtos (...) VALUES (1, 'Romance Policial', 1, 12.90, 40);
const linha = /INSERT INTO produtos \([^)]*\) VALUES \((\d+), '([^']*)', (\d+), ([\d.]+), (\d+)\);/g;
const produtos: Produto[] = [...sql.matchAll(linha)].map(m => ({
  id: Number(m[1]), nome: m[2], categoriaId: Number(m[3]), preco: Number(m[4]), stock: Number(m[5]),
}));
console.log("produtos lidos:", produtos.length);

const pasta = await mkdtemp(join(tmpdir(), "bn02-"));

// JSON: uma escrita só
const bytesJson = await Bun.write(join(pasta, "produtos.json"), JSON.stringify(produtos, null, 2));

// CSV: escrita incremental com o FileSink (ponto e vírgula, como o Excel em português espera)
const csv = Bun.file(join(pasta, "produtos.csv")).writer();
csv.write("id;nome;categoria_id;preco;stock\n");
for (const p of produtos) {
  const nome = p.nome.includes(";") ? `"${p.nome}"` : p.nome;
  csv.write(`${p.id};${nome};${p.categoriaId};${p.preco.toFixed(2).replace(".", ",")};${p.stock}\n`);
}
await csv.end();

console.log("produtos.json:", bytesJson, "bytes");
const texto = await Bun.file(join(pasta, "produtos.csv")).text();
console.log("produtos.csv :", Bun.file(join(pasta, "produtos.csv")).size, "bytes,", texto.trim().split("\n").length, "linhas");
console.log(texto.split("\n").slice(0, 4).join("\n"));

// Ler de volta e confirmar
const lido = (await Bun.file(join(pasta, "produtos.json")).json()) as Produto[];
const valorStock = lido.reduce((soma, p) => soma + p.preco * p.stock, 0);
console.log("valor total em stock:", valorStock.toFixed(2), "euros");
console.log("sem stock:", lido.filter(p => p.stock === 0).map(p => p.nome));

await rm(pasta, { recursive: true });
