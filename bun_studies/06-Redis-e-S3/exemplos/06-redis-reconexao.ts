// Reconexão automática: pára e volta a arrancar o NOSSO contentor Redis a meio de um pedido.
// Precisa de: CONTENTOR_REDIS=est-bn06-redis (o nome do teu contentor de estudo).
import { RedisClient } from "bun";

const contentor = process.env.CONTENTOR_REDIS;
if (!contentor || !contentor.startsWith("est-")) throw new Error("define CONTENTOR_REDIS com o nome do teu contentor est-...");
const docker = (...args: string[]) => Bun.spawnSync(["docker", ...args]).exitCode;

const c = new RedisClient(process.env.REDIS_URL, { maxRetries: 10 });
c.onconnect = () => console.log("  [onconnect]");
c.onclose = (e: any) => console.log("  [onclose]", e?.code ?? e);

await c.set("est:vivo", "1");
console.log("antes:", await c.get("est:vivo"), "| ligado:", c.connected);

docker("stop", contentor);
await Bun.sleep(300);
console.log("servidor parado | ligado:", c.connected);

// O comando fica na fila offline e é enviado quando a ligação voltar.
const t = performance.now();
setTimeout(() => docker("start", contentor), 700);
console.log("get durante a falha:", await c.get("est:vivo"), `(${(performance.now() - t).toFixed(0)} ms)`);
await c.del("est:vivo");
c.close();

// Sem fila offline, o comando falha logo. Atenção: tens de chamar connect() antes.
const d = new RedisClient(process.env.REDIS_URL, { enableOfflineQueue: false });
try {
  await d.ping();
} catch (e: any) {
  console.log("sem connect():", e.code, "|", e.message);
}
await d.connect();
docker("stop", contentor);
await Bun.sleep(300);
try {
  await d.get("a");
} catch (e: any) {
  console.log("sem fila offline:", e.code, "|", e.message);
}
docker("start", contentor);
d.close();
