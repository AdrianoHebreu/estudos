// routes: estáticas, parâmetros, wildcards, métodos por rota e fallback fetch.
const server = Bun.serve({
  port: 35031,
  hostname: "127.0.0.1",
  routes: {
    // rota estática: a Response é criada uma vez e reutilizada
    "/versao": new Response("loja 1.0"),
    // Response.json devolve JSON com o Content-Type certo
    "/api/ping": () => Response.json({ ok: true }),
    // parâmetros: req.params
    "/api/produtos/:id": (req) => Response.json({ id: Number(req.params.id) }),
    "/api/clientes/:cid/encomendas/:eid": (req) => Response.json(req.params),
    // um handler por método HTTP
    "/api/encomendas": {
      GET: () => Response.json([]),
      POST: async (req) => Response.json({ recebido: await req.json() }, { status: 201 }),
    },
    // wildcard: apanha tudo por baixo de /estatico/
    "/estatico/*": (req) => new Response("wildcard: " + new URL(req.url).pathname),
    // redirecionamento
    "/antigo": Response.redirect("/versao", 301),
  },
  // fallback: pedidos que nenhuma rota apanhou
  fetch(req) {
    return new Response("sem rota para " + new URL(req.url).pathname, { status: 404 });
  },
});

const base = server.url.origin;
async function ver(metodo: string, caminho: string, corpo?: unknown) {
  const r = await fetch(base + caminho, {
    method: metodo,
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
    redirect: "manual",
  });
  const tipo = r.headers.get("content-type");
  console.log(metodo.padEnd(6), caminho.padEnd(34), r.status, tipo ?? "-", (await r.text()).slice(0, 40));
}

await ver("GET", "/versao");
await ver("GET", "/api/ping");
await ver("GET", "/api/produtos/7");
await ver("GET", "/api/clientes/3/encomendas/11");
await ver("GET", "/api/encomendas");
await ver("POST", "/api/encomendas", { cliente_id: 1 });
await ver("DELETE", "/api/encomendas");
await ver("GET", "/estatico/css/a/b.css");
await ver("GET", "/antigo");
await ver("GET", "/nao-existe");
await ver("GET", "/api/produtos/7/");

await server.stop();
