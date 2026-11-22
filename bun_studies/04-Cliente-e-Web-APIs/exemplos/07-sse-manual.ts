import { iniciar } from "./servidor-loja.ts";

const server = iniciar();
const base = server.url.origin;

// No Bun 1.4.0 o EventSource NÃO existe como global.
console.log("typeof EventSource:", typeof EventSource);

// Server-Sent Events são só HTTP com Content-Type: text/event-stream.
// Lê-se com fetch + streaming e um parser de ~20 linhas.
type Evento = { id?: string; event: string; data: string };

async function* eventos(resposta: Response): AsyncGenerator<Evento> {
  const leitor = resposta.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { value, done } = await leitor.read();
    if (done) return;
    buffer += value.replaceAll("\r\n", "\n");
    let fim;
    while ((fim = buffer.indexOf("\n\n")) >= 0) {
      const bloco = buffer.slice(0, fim);
      buffer = buffer.slice(fim + 2);
      const ev: Evento = { event: "message", data: "" };
      for (const linha of bloco.split("\n")) {
        if (linha.startsWith(":")) continue; // comentário (usado como keep-alive)
        const i = linha.indexOf(":");
        const campo = i < 0 ? linha : linha.slice(0, i);
        const valor = i < 0 ? "" : linha.slice(i + 1).replace(/^ /, "");
        if (campo === "data") ev.data += (ev.data ? "\n" : "") + valor;
        else if (campo === "event") ev.event = valor;
        else if (campo === "id") ev.id = valor;
      }
      if (ev.data) yield ev;
    }
  }
}

const resp = await fetch(`${base}/api/eventos`, { headers: { Accept: "text/event-stream" } });
console.log("content-type:", resp.headers.get("content-type"));
for await (const ev of eventos(resp)) {
  console.log(`evento #${ev.id} (${ev.event}):`, JSON.parse(ev.data));
}
console.log("servidor fechou o fluxo");

// Cancelar a meio com AbortController
const ctl = new AbortController();
const r2 = await fetch(`${base}/api/eventos`, { signal: ctl.signal });
try {
  for await (const ev of eventos(r2)) {
    console.log("primeiro evento:", ev.id);
    ctl.abort();
  }
} catch (e: any) {
  console.log("cancelado ->", e.name);
}

await server.stop(true);
