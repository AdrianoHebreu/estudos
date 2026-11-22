// Precedência das rotas, rota estática com ETag e rota de diretório ({ dir }).
const server = Bun.serve({
  port: 35039,
  hostname: "127.0.0.1",
  routes: {
    "/u/todos": () => new Response("exata"),
    "/u/:id": (req) => new Response("parâmetro " + req.params.id),
    "/u/*": () => new Response("wildcard"),
    "/*": () => new Response("catch-all global"),
    "/estatico": new Response("conteúdo estático"),
    "/dir/*": { dir: `${import.meta.dir}/publico` },
  },
});
const b = server.url.origin;

for (const caminho of ["/u/todos", "/u/7", "/u/7/x", "/outra", "/dir/estilo.css"]) {
  console.log(caminho.padEnd(16), JSON.stringify((await (await fetch(b + caminho)).text()).trim()));
}

// as rotas estáticas ganham ETag e respondem 304 a If-None-Match
const r1 = await fetch(b + "/estatico");
const etag = r1.headers.get("etag")!;
console.log("ETag:", etag);
const r2 = await fetch(b + "/estatico", { headers: { "If-None-Match": etag } });
console.log("com If-None-Match:", r2.status);

await server.stop();
