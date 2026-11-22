// Hashes, listas, conjuntos e conjuntos ordenados.
import { redis } from "bun";

console.log("--- hash ---");
console.log("hset (campos novos):", await redis.hset("est:p:3", "nome", "Atlas Mundial", "preco", "29.99"));
console.log("hset com objeto:", await redis.hset("est:p:3", { stock: 10 }));
console.log("hget:", await redis.hget("est:p:3", "nome"), await redis.hget("est:p:3", "nao-existe"));
console.log("hmget:", await redis.hmget("est:p:3", ["nome", "nao-existe"]));
console.log("hgetall:", await redis.hgetall("est:p:3"));
console.log("hincrby / hincrbyfloat:", await redis.hincrby("est:p:3", "stock", -3), await redis.hincrbyfloat("est:p:3", "preco", 0.01));
console.log("hkeys / hlen / hexists:", await redis.hkeys("est:p:3"), await redis.hlen("est:p:3"), await redis.hexists("est:p:3", "nome"));

console.log("--- lista ---");
console.log("rpush / lpush (tamanho):", await redis.rpush("est:l", "b", "c", "d"), await redis.lpush("est:l", "a"));
console.log("lrange 0 -1:", await redis.lrange("est:l", 0, -1));
console.log("lpop / rpop / llen:", await redis.lpop("est:l"), await redis.rpop("est:l"), await redis.llen("est:l"));
console.log("lpop de lista inexistente:", await redis.lpop("est:vazia"));

console.log("--- conjunto ---");
console.log("sadd:", await redis.sadd("est:tags:3", "livros", "mapas", "geografia"), "| repetido:", await redis.sadd("est:tags:3", "mapas"));
console.log("smembers:", (await redis.smembers("est:tags:3")).sort(), "| scard:", await redis.scard("est:tags:3"));
console.log("sismember:", await redis.sismember("est:tags:3", "mapas"), await redis.sismember("est:tags:3", "culinaria"));
await redis.sadd("est:tags:2", "livros", "culinaria");
console.log("sinter / sunion:", await redis.sinter("est:tags:3", "est:tags:2"), (await redis.sunion("est:tags:3", "est:tags:2")).sort());

console.log("--- conjunto ordenado ---");
console.log("zadd:", await redis.zadd("est:top", 3, "Atlas", 1, "Romance", 2, "Livro de Receitas"));
console.log("zrange:", await redis.zrange("est:top", 0, -1));
console.log("zrange com scores:", await redis.zrange("est:top", 0, -1, "WITHSCORES"));
console.log("zscore:", await redis.zscore("est:top", "Atlas"));

console.log("tipos:", await redis.type("est:p:3"), await redis.type("est:l"), await redis.type("est:tags:3"), await redis.type("est:top"));
console.log("keys est:* :", (await redis.keys("est:*")).sort());
await redis.del("est:p:3", "est:l", "est:tags:3", "est:tags:2", "est:top");
redis.close();
