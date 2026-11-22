// server.reload, server.requestIP e idleTimeout / server.timeout.
const enc = new TextEncoder();

// resposta em streaming com um silêncio de 4 s entre dois pedaços
const pausa = (req: Request, srv: Bun.Server) => {
  if (new URL(req.url).searchParams.has("sem-limite")) srv.timeout(req, 0);
  return new Response(
    new ReadableStream({
      async start(c) {
        c.enqueue(enc.encode("um\n"));
        await Bun.sleep(4000);
        c.enqueue(enc.encode("dois\n"));
        c.close();
      },
    }),
  );
};

const server = Bun.serve({
  port: 35038,
  hostname: "127.0.0.1",
  idleTimeout: 2, // segundos de silêncio permitidos (por omissão 10)
  routes: {
    "/versao": () => new Response("v1"),
    "/ip": (req, srv) => Response.json(srv.requestIP(req)),
    "/pausa": pausa,
    "/lento": async () => {
      await Bun.sleep(7000);
      return new Response("fim");
    },
  },
});
const b = server.url.origin;

console.log("ip:", await (await fetch(b + "/ip")).json());

console.log("--- reload");
console.log("antes :", await (await fetch(b + "/versao")).text());
server.reload({ routes: { "/versao": () => new Response("v2") } });
console.log("depois:", await (await fetch(b + "/versao")).text(), "| porta:", server.port);
console.log("/ip depois do reload:", (await fetch(b + "/ip")).status, "(as rotas foram substituídas, não fundidas)");
server.reload({ routes: { "/pausa": pausa, "/lento": async () => (await Bun.sleep(7000), new Response("fim")) } });

console.log("--- idleTimeout = 2 s");
for (const caminho of ["/pausa", "/pausa?sem-limite=1", "/lento"] /* o /lento dura 7 s sem escrever nada */) {
  const t0 = performance.now();
  try {
    const r = await fetch(b + caminho);
    console.log(caminho.padEnd(20), r.status, JSON.stringify(await r.text()), Math.round(performance.now() - t0), "ms");
  } catch (e) {
    console.log(caminho.padEnd(20), "ligação cortada", Math.round(performance.now() - t0), "ms");
  }
}

await server.stop();
