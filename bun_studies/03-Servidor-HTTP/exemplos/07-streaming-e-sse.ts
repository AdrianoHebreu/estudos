// Streaming de respostas: ReadableStream, gerador assíncrono e Server-Sent Events.
const codificador = new TextEncoder();

const server = Bun.serve({
  port: 35036,
  hostname: "127.0.0.1",
  routes: {
    // ReadableStream com pull: o corpo vai saindo aos bocados
    "/fluxo": () => {
      let n = 0;
      const corpo = new ReadableStream({
        async pull(controlador) {
          await Bun.sleep(30);
          controlador.enqueue(codificador.encode(`pedaço ${++n}\n`));
          if (n === 3) controlador.close();
        },
      });
      return new Response(corpo, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    },
    // um gerador assíncrono também serve de corpo (extensão do Bun)
    "/gerador": () =>
      new Response(
        (async function* () {
          for (const nome of ["Livros", "Eletrónica", "Casa"]) {
            yield nome + "\n";
            await Bun.sleep(10);
          }
        })(),
      ),
    // Server-Sent Events: text/event-stream, linhas "data: ...", linha em branco no fim
    "/eventos": (req) => {
      let id = 0;
      let temporizador: Timer;
      const corpo = new ReadableStream({
        start(c) {
          temporizador = setInterval(() => {
            id++;
            c.enqueue(codificador.encode(`id: ${id}\nevent: encomenda\ndata: ${JSON.stringify({ encomenda: id })}\n\n`));
            if (id === 3) {
              clearInterval(temporizador);
              c.close();
            }
          }, 40);
        },
        cancel() {
          clearInterval(temporizador); // o cliente desligou
        },
      });
      return new Response(corpo, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    },
  },
});
const b = server.url.origin;

// ler o corpo aos bocados e medir quando cada um chegou
const t0 = performance.now();
const r = await fetch(b + "/fluxo");
console.log("/fluxo", r.status, r.headers.get("transfer-encoding"), "content-length:", r.headers.get("content-length"));
for await (const bloco of r.body!) {
  console.log(`  +${Math.round(performance.now() - t0)} ms`, JSON.stringify(new TextDecoder().decode(bloco)));
}
console.log("/gerador:", JSON.stringify(await (await fetch(b + "/gerador")).text()));

const ev = await fetch(b + "/eventos");
console.log("/eventos", ev.headers.get("content-type"));
console.log(await ev.text());

// o cliente SSE do browser é o EventSource; o Bun 1.4.0 não o traz como global:
console.log("typeof EventSource:", typeof EventSource);

await server.stop();
