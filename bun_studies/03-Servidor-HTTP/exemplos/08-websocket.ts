// WebSocket no servidor: upgrade, handlers, dados por ligação e publish/subscribe.
type Dados = { nome: string };

const server = Bun.serve<Dados>({
  port: 35037,
  hostname: "127.0.0.1",
  routes: {
    "/ws": (req, srv) => {
      const nome = new URL(req.url).searchParams.get("nome") ?? "anónimo";
      // upgrade devolve true se a ligação passou a WebSocket
      if (srv.upgrade(req, { data: { nome } })) return; // sem Response
      return new Response("precisa de WebSocket", { status: 426 });
    },
  },
  websocket: {
    open(ws) {
      ws.subscribe("loja"); // tópico
      ws.send(JSON.stringify({ tipo: "bem-vindo", nome: ws.data.nome }));
      server.publish("loja", JSON.stringify({ tipo: "entrou", nome: ws.data.nome }));
    },
    message(ws, mensagem) {
      // mensagem é string (texto) ou Buffer (binário)
      if (mensagem === "ping") return void ws.send("pong");
      // ws.publish envia a todos os subscritores EXCEPTO o próprio
      ws.publish("loja", JSON.stringify({ tipo: "mensagem", de: ws.data.nome, texto: String(mensagem) }));
    },
    close(ws, codigo, motivo) {
      server.publish("loja", JSON.stringify({ tipo: "saiu", nome: ws.data.nome, codigo }));
    },
  },
});

function cliente(nome: string) {
  const ws = new WebSocket(`ws://127.0.0.1:${server.port}/ws?nome=${nome}`);
  const recebidas: string[] = [];
  ws.addEventListener("message", (e) => recebidas.push(`${nome} <- ${e.data}`));
  const aberto = new Promise((ok) => ws.addEventListener("open", ok, { once: true }));
  return { ws, recebidas, aberto };
}

const ana = cliente("Ana");
await ana.aberto;
const bruno = cliente("Bruno");
await bruno.aberto;
await Bun.sleep(50);

ana.ws.send("olá a todos");
bruno.ws.send("ping");
await Bun.sleep(50);
console.log("subscritores do tópico:", server.subscriberCount("loja"));

bruno.ws.close(1000);
await Bun.sleep(50);
ana.ws.close();
await Bun.sleep(50);

console.log([...ana.recebidas, ...bruno.recebidas].join("\n"));

const normal = await fetch(server.url.origin + "/ws");
console.log("sem upgrade:", normal.status, await normal.text());

await server.stop(true);
