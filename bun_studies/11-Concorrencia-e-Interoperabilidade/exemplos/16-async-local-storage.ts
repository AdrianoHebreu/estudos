// AsyncLocalStorage: contexto por pedido sem passar parâmetros
import { AsyncLocalStorage, AsyncResource } from "node:async_hooks";

type Contexto = { pedido: number; utilizador: string };
const als = new AsyncLocalStorage<Contexto>();

const log = (msg: string) => {
  const c = als.getStore();
  console.log(`[pedido ${c?.pedido ?? "-"} / ${c?.utilizador ?? "sem contexto"}] ${msg}`);
};

async function servico() {
  log("início do serviço");
  await Bun.sleep(als.getStore()!.pedido === 1 ? 25 : 5); // tempos fixos para a saída ser estável
  log("depois do await");
  await Promise.all([Bun.sleep(5).then(() => log("dentro de Promise.all")), (async () => { await Bun.sleep(1); log("async interna"); })()]);
  setTimeout(() => log("dentro de setTimeout"), 5);
  queueMicrotask(() => log("dentro de microtask"));
  await Bun.sleep(20);
}

// Dois "pedidos" em simultâneo, cada um com o seu contexto
await Promise.all([
  als.run({ pedido: 1, utilizador: "ana" }, servico),
  als.run({ pedido: 2, utilizador: "bruno" }, servico),
]);
log("fora de run");

// enterWith liga o contexto ao fluxo atual; exit corre sem contexto
als.enterWith({ pedido: 99, utilizador: "enterWith" });
log("após enterWith");
als.exit(() => log("dentro de exit"));

// Um servidor Bun.serve: contexto por pedido
const s = Bun.serve({
  port: 35112,
  fetch(req) {
    return als.run({ pedido: Number(new URL(req.url).searchParams.get("n")), utilizador: "http" }, async () => {
      await Bun.sleep(5);
      return new Response(JSON.stringify(als.getStore()));
    });
  },
});
const respostas = await Promise.all([1, 2, 3].map((n) => fetch(`http://127.0.0.1:35112/?n=${n}`).then((r) => r.text())));
console.log(respostas);
s.stop(true);

// AsyncLocalStorage.bind / snapshot: reter o contexto para chamar mais tarde
const ligada = als.run({ pedido: 7, utilizador: "bind" }, () => AsyncLocalStorage.bind(() => log("callback ligada")));
ligada();
