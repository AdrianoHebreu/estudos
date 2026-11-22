// Pub/sub: um cliente fica em modo subscritor, outro publica.
// Na 1.4.0 o pub/sub é descrito como experimental na documentação.
import { RedisClient } from "bun";

const publicador = new RedisClient(process.env.REDIS_URL);
await publicador.connect();
const subscritor = await publicador.duplicate(); // 2.ª ligação, com a mesma configuração

const recebidas: string[] = [];
const subs = await subscritor.subscribe("loja:encomendas", (mensagem, canal) => {
  recebidas.push(`${canal} -> ${mensagem}`);
});
console.log("subscribe devolveu:", subs);

// publish devolve o número de subscritores que receberam a mensagem
console.log("publish (com subscritor):", await publicador.publish("loja:encomendas", JSON.stringify({ id: 13, total: 62.8 })));
console.log("publish (canal sem ninguém):", await publicador.publish("loja:stock", "baixo"));
await Bun.sleep(100);
console.log("recebidas:", recebidas);

// Um cliente em modo subscritor só aceita comandos de subscrição, pubsub() e ping()
try {
  await subscritor.get("est:x");
} catch (e: any) {
  console.log("get no subscritor:", e.code, "|", e.message);
}
console.log("ping no subscritor:", await subscritor.ping());
console.log("canais ativos:", await publicador.pubsub("CHANNELS"));

await subscritor.unsubscribe("loja:encomendas");
console.log("canais ativos depois de unsubscribe:", await publicador.pubsub("CHANNELS"));
subscritor.close();
publicador.close();
