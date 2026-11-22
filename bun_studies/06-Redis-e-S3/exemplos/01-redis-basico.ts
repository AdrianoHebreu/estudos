// Strings, expiração e contadores com o cliente Redis nativo.
// Precisa de REDIS_URL, por exemplo: redis://:PALAVRA-PASSE@127.0.0.1:35060
import { redis } from "bun";

console.log("é o mesmo objeto?", redis === Bun.redis, "| ligado antes do 1.º comando:", redis.connected);
console.log("ping:", await redis.ping(), "| ligado depois:", redis.connected);

await redis.set("est:produto:3:nome", "Atlas Mundial");
console.log("get:", await redis.get("est:produto:3:nome"));
console.log("get de chave que não existe:", await redis.get("est:nao-existe"));
console.log("exists:", await redis.exists("est:produto:3:nome"), await redis.exists("est:nao-existe"));
console.log("getBuffer:", await redis.getBuffer("est:produto:3:nome"));

await redis.set("est:stock:3", 10); // o número é enviado como texto
console.log("incr/decr/incrby:", await redis.incr("est:stock:3"), await redis.decr("est:stock:3"), await redis.incrby("est:stock:3", 5));
console.log("tipo devolvido pelo get:", typeof (await redis.get("est:stock:3")));

console.log("--- expiração ---");
console.log("set com EX 100:", await redis.set("est:sessao", "ativa", "EX", 100));
console.log("ttl:", await redis.ttl("est:sessao"), "| pttl:", await redis.pttl("est:sessao"));
await redis.expire("est:sessao", 5);
console.log("depois de expire(5):", await redis.ttl("est:sessao"));
console.log("persist:", await redis.persist("est:sessao"), "| ttl:", await redis.ttl("est:sessao"));
console.log("ttl de chave inexistente:", await redis.ttl("est:nao-existe"));
await redis.set("est:sem-ttl", "x");
console.log("ttl de chave sem expiração:", await redis.ttl("est:sem-ttl"));

console.log("set com NX (só se não existir):", await redis.set("est:sem-ttl", "y", "NX"), await redis.set("est:novo", "y", "NX", "PX", 50));
await Bun.sleep(80);
console.log("50 ms depois:", await redis.get("est:novo"));

console.log("del devolve quantas apagou:", await redis.del("est:produto:3:nome", "est:stock:3", "est:sessao", "est:sem-ttl", "est:nao-existe"));
redis.close();
