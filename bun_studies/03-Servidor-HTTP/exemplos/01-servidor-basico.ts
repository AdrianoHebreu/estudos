// Bun.serve mínimo: handler fetch, propriedades do servidor e paragem.
const server = Bun.serve({
  port: 35030,
  hostname: "127.0.0.1",
  fetch(req, srv) {
    return new Response(`Olá! ${req.method} ${new URL(req.url).pathname}`);
  },
});

console.log("port     :", server.port);
console.log("hostname :", server.hostname);
console.log("url      :", server.url.href);
console.log("url é URL:", server.url instanceof URL);
console.log("pending  :", server.pendingRequests, "pedidos em curso");

const r = await fetch(server.url + "ola");
console.log(r.status, await r.text());

// port: 0 pede uma porta livre ao sistema operativo
const outro = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: () => new Response("outro") });
console.log("porta atribuída:", outro.port > 0, outro.port !== 35030);
await outro.stop();

await server.stop();
console.log("parado");
try {
  await fetch("http://127.0.0.1:35030/");
} catch (e) {
  console.log("depois de stop:", (e as Error).name, (e as Error).message);
}
