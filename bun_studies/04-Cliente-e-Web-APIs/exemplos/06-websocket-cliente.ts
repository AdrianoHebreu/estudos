import { iniciar } from "./servidor-loja.ts";

const server = iniciar();
const url = `ws://localhost:${server.port}/ws`;

// 1. O básico: new WebSocket + eventos
const ws = new WebSocket(url);
console.log("readyState ao criar:", ws.readyState, "(0 = CONNECTING)");
ws.addEventListener("open", () => {
  console.log("open | readyState:", ws.readyState, "| protocol:", JSON.stringify(ws.protocol), "| binaryType:", ws.binaryType);
  ws.send("olá, loja");
  ws.send(JSON.stringify({ produto: 4 }));
});
let recebidas = 0;
ws.addEventListener("message", ev => {
  console.log("message:", typeof ev.data, ev.data);
  if (++recebidas === 3) ws.send("fechar");
});
const fechado = await new Promise<CloseEvent>(res => ws.addEventListener("close", res as any));
console.log("close:", fechado.code, JSON.stringify(fechado.reason), "| wasClean:", fechado.wasClean);

// 2. Erro de ligação: porta onde ninguém escuta
const mau = new WebSocket("ws://localhost:35049/ws");
await new Promise<void>(res => {
  mau.addEventListener("error", ev => console.log("error:", ev.constructor.name, "| type:", ev.type));
  mau.addEventListener("close", ev => { console.log("close após erro:", ev.code); res(); });
});

// 3. Reconexão manual: o WebSocket NÃO volta a ligar sozinho. Backoff exponencial.
function ligarComReconexao(url: string, maxTentativas: number, aoMensagem: (m: string) => void) {
  let tentativa = 0;
  let parar = false;
  let atual: WebSocket;
  const abrir = () => {
    atual = new WebSocket(url);
    atual.addEventListener("open", () => {
      console.log(`  [ligado] tentativa ${tentativa + 1}`);
      tentativa = 0;
    });
    atual.addEventListener("message", ev => aoMensagem(String(ev.data)));
    atual.addEventListener("close", ev => {
      if (parar) return;
      if (tentativa >= maxTentativas) return console.log("  [desisto]");
      const espera = 50 * 2 ** tentativa++;
      console.log(`  [caiu] code ${ev.code} "${ev.reason}"; volto em ${espera} ms`);
      setTimeout(abrir, espera);
    });
  };
  abrir();
  return { enviar: (t: string) => atual.send(t), parar: () => { parar = true; atual.close(); } };
}

let boasVindas = 0;
const c = ligarComReconexao(url, 3, m => {
  if (m.startsWith("bem-vindo") && ++boasVindas === 1) setTimeout(() => c.enviar("cair"), 20);
});
await Bun.sleep(400);
console.log("boas-vindas recebidas:", boasVindas, "(2 = reconectou uma vez)");
c.parar();
await Bun.sleep(50);

// 4. Extras do cliente do Bun (não existem no browser): cabeçalhos próprios, ping()
const ws4 = new WebSocket(url, { headers: { "X-Cliente": "estudo" } });
await new Promise(res => ws4.addEventListener("open", res));
console.log("ping/pong/terminate:", typeof ws4.ping, typeof ws4.pong, typeof ws4.terminate);
ws4.close();

await Bun.sleep(100);
await server.stop(true);
