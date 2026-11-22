// Erros de ligação: porta fechada, sem palavra-passe, palavra-passe errada, URL inválido.
// REDIS_URL aponta para o servidor bom; a partir dele montamos as variantes más.
import { RedisClient } from "bun";

const bom = new URL(process.env.REDIS_URL!);
const host = `${bom.hostname}:${bom.port}`;

async function tenta(rotulo: string, url: string, opcoes: ConstructorParameters<typeof RedisClient>[1] = {}) {
  const t = performance.now();
  const c = new RedisClient(url, opcoes);
  try {
    console.log(rotulo, "->", await c.ping());
  } catch (e: any) {
    console.log(`${rotulo} -> ${e.name} ${e.code}`);
    console.log(`    ${e.message}  (${(performance.now() - t).toFixed(0)} ms)`);
  } finally {
    c.close();
  }
}

await tenta("palavra-passe certa", process.env.REDIS_URL!);
await tenta("sem palavra-passe", `redis://${host}`);
await tenta("palavra-passe errada", `redis://:errada@${host}`);
await tenta("utilizador errado", `redis://outro:${decodeURIComponent(bom.password)}@${host}`);
await tenta("porta fechada (2 tentativas)", "redis://127.0.0.1:35069", { maxRetries: 2 });

// O URL é validado logo no construtor: o erro é síncrono.
try {
  new RedisClient("http://127.0.0.1:35060");
} catch (e: any) {
  console.log("protocolo inválido:", e.message);
}

// Sem maxRetries, a porta fechada só falha depois de 20 tentativas com espera crescente.
const t = performance.now();
try {
  await new RedisClient("redis://127.0.0.1:35069").get("a");
} catch (e: any) {
  console.log(`porta fechada, configuração por omissão: ${e.code} ao fim de ${((performance.now() - t) / 1000).toFixed(1)} s`);
}
