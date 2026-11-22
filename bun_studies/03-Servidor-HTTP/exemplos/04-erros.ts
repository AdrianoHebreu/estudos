// Tratamento de erros: o handler error devolve a Response quando um handler lança.
class ErroHttp extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const server = Bun.serve({
  port: 35033,
  hostname: "127.0.0.1",
  routes: {
    "/ok": () => new Response("ok"),
    "/json-mau": { POST: async (req) => Response.json(await req.json()) },
    "/nao-encontrado": () => {
      throw new ErroHttp(404, "produto 99 não existe");
    },
    "/bug": () => {
      const x = null as unknown as { a: number };
      return Response.json(x.a);
    },
    "/async": async () => {
      await Bun.sleep(5);
      throw new ErroHttp(409, "stock insuficiente");
    },
  },
  fetch: () => new Response("sem rota", { status: 404 }),
  error(erro) {
    if (erro instanceof ErroHttp) {
      return Response.json({ erro: erro.message }, { status: erro.status });
    }
    if (erro instanceof SyntaxError) {
      return Response.json({ erro: "JSON inválido" }, { status: 400 });
    }
    console.error("[servidor] erro inesperado:", erro.message);
    return Response.json({ erro: "erro interno" }, { status: 500 });
  },
});

for (const [metodo, caminho, corpo] of [
  ["GET", "/ok"],
  ["POST", "/json-mau", "{ não é JSON"],
  ["GET", "/nao-encontrado"],
  ["GET", "/async"],
  ["GET", "/bug"],
] as const) {
  const r = await fetch(server.url.origin + caminho, { method: metodo, body: corpo });
  console.log(metodo.padEnd(5), caminho.padEnd(16), r.status, (await r.text()).trim());
}
await server.stop();
