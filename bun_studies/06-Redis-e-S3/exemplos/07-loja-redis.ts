// Padrões da loja com Redis: cache de leitura com TTL e invalidação, contador de visitas e fila.
import { redis } from "bun";
import { abrirLoja } from "./loja-db.ts";

const db = await abrirLoja();
let leiturasNaBase = 0;

// 1. Cache de leitura (cache-aside): primeiro o Redis, depois a base, e guarda com TTL.
async function obterProduto(id: number) {
  const chave = `loja:produto:${id}`;
  const emCache = await redis.get(chave);
  if (emCache !== null) return { origem: "cache", produto: JSON.parse(emCache) };

  leiturasNaBase++;
  const produto = db.query("SELECT id, nome, preco, stock FROM produtos WHERE id = ?").get(id);
  if (!produto) return { origem: "base", produto: null }; // não guardamos ausências
  await redis.set(chave, JSON.stringify(produto), "EX", 30);
  return { origem: "base", produto };
}

// A escrita altera a base e apaga a cópia: a leitura seguinte volta a ir à base.
async function alterarPreco(id: number, preco: number) {
  db.query("UPDATE produtos SET preco = ? WHERE id = ?").run(preco, id);
  await redis.del(`loja:produto:${id}`);
}

console.log("--- cache de um produto ---");
for (let i = 1; i <= 3; i++) {
  const r = await obterProduto(3);
  console.log(`leitura ${i}: ${r.origem}`, r.produto.nome, r.produto.preco);
}
console.log("TTL restante:", await redis.ttl("loja:produto:3"), "s | leituras na base:", leiturasNaBase);
await alterarPreco(3, 24.99);
const depois = await obterProduto(3);
console.log("depois de alterar:", depois.origem, depois.produto.preco, "| leituras na base:", leiturasNaBase);
console.log("produto inexistente:", await obterProduto(99), "| chave criada?", await redis.exists("loja:produto:99"));

// 2. Contador de visitas: INCR é atómico, mesmo com pedidos em paralelo.
console.log("--- visitas ---");
await redis.del("loja:visitas:3", "loja:top");
await Promise.all(Array.from({ length: 50 }, () => redis.incr("loja:visitas:3")));
console.log("50 visitas em paralelo ao produto 3:", await redis.get("loja:visitas:3"));
for (const id of [3, 3, 5, 3, 10, 5]) await redis.zincrby("loja:top", 1, String(id));
console.log("mais vistos (id, visitas):", await redis.zrevrange("loja:top", 0, 2, "WITHSCORES"));

// 3. Fila simples: o produtor faz RPUSH, o trabalhador BLPOP numa ligação só dele.
console.log("--- fila de encomendas ---");
const trabalhador = await redis.duplicate();
const processadas: number[] = [];
const correr = (async () => {
  while (true) {
    const item = await trabalhador.blpop("loja:fila", 1); // espera até 1 s: [chave, valor] ou null
    if (item === null) break;
    processadas.push(JSON.parse(item[1]).encomendaId);
  }
})();
for (const encomendaId of [13, 14, 15]) await redis.rpush("loja:fila", JSON.stringify({ encomendaId }));
await correr;
console.log("processadas pela ordem de chegada:", processadas, "| fila agora:", await redis.llen("loja:fila"));

await redis.del("loja:visitas:3", "loja:top", "loja:produto:3");
trabalhador.close();
redis.close();
db.close();
