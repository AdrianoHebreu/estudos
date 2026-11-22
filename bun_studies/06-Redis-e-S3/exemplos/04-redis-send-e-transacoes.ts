// send() para qualquer comando, transações MULTI/EXEC e erros do servidor.
import { RedisClient, redis } from "bun";

console.log("send PING:", await redis.send("PING", ["olá"]));
await redis.send("RPUSH", ["est:fila", "a", "b"]);
console.log("send LRANGE:", await redis.send("LRANGE", ["est:fila", "0", "-1"]));
console.log("send HELLO (mapa RESP3 vira objeto):", (await redis.send("HELLO", [])).proto);
console.log("comando sem método dedicado, OBJECT ENCODING:", await redis.send("OBJECT", ["ENCODING", "est:fila"]));

console.log("--- erros do servidor ---");
for (const tentativa of [
  () => redis.incr("est:fila"),                  // tipo errado
  () => redis.send("NAOEXISTE", []),             // comando inexistente
  () => redis.send("SET", ["so-a-chave"]),       // argumentos a menos
]) {
  try {
    await tentativa();
  } catch (e: any) {
    console.log(e.name, e.code, "|", e.message);
  }
}

console.log("--- transação numa ligação só para ela ---");
const tx = await redis.duplicate(); // nunca uses MULTI numa ligação partilhada
console.log(await tx.send("MULTI", []));
console.log(await tx.send("SET", ["est:saldo", "100"]), await tx.send("INCRBY", ["est:saldo", "-30"]));
console.log("EXEC:", await tx.send("EXEC", []));
console.log("saldo:", await redis.get("est:saldo"));

console.log("--- DISCARD ---");
await tx.send("MULTI", []);
await tx.send("SET", ["est:saldo", "0"]);
console.log(await tx.send("DISCARD", []), "| saldo mantém-se:", await redis.get("est:saldo"));
tx.close();

console.log("--- o perigo de MULTI numa ligação partilhada ---");
await redis.set("est:x", "1");
await redis.send("MULTI", []);
const deOutroPedido = redis.get("est:x"); // outro código a usar o mesmo cliente
const dentro = redis.send("INCR", ["est:x"]);
console.log("o get alheio recebeu:", await deOutroPedido, "| o incr:", await dentro);
console.log("EXEC:", await redis.send("EXEC", []));

await redis.del("est:fila", "est:saldo", "est:x");
redis.close();
