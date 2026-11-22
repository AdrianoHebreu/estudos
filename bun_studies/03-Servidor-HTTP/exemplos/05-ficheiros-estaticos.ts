// Ficheiros estáticos com Bun.file: Content-Type automático, Range e ficheiro em falta.
const pasta = `${import.meta.dir}/publico`;

const server = Bun.serve({
  port: 35034,
  hostname: "127.0.0.1",
  routes: {
    // uma BunFile como valor da rota: o Bun trata de tudo
    "/estilo.css": Bun.file(`${pasta}/estilo.css`),
  },
  async fetch(req) {
    const caminho = new URL(req.url).pathname;
    if (!caminho.startsWith("/publico/")) return new Response("não", { status: 404 });
    // nunca juntes o caminho do pedido sem o limpar: bloqueia o ../
    const nome = decodeURIComponent(caminho.slice("/publico/".length));
    if (nome.includes("..") || nome.includes("\\")) return new Response("proibido", { status: 403 });
    const ficheiro = Bun.file(`${pasta}/${nome}`);
    if (!(await ficheiro.exists())) return new Response("ficheiro não existe", { status: 404 });
    return new Response(ficheiro); // Content-Type e Content-Length vêm do ficheiro
  },
});
const b = server.url.origin;

for (const caminho of ["/estilo.css", "/publico/index.html", "/publico/alfabeto.txt", "/publico/nada.txt", "/publico/..%2Fsegredo"]) {
  const r = await fetch(b + caminho);
  console.log(caminho.padEnd(24), r.status, r.headers.get("content-type"), r.headers.get("content-length"), JSON.stringify((await r.text()).slice(0, 25)));
}

console.log("--- Range");
for (const range of ["bytes=0-4", "bytes=10-", "bytes=-3"]) {
  const r = await fetch(b + "/publico/alfabeto.txt", { headers: { Range: range } });
  console.log(range.padEnd(10), r.status, r.headers.get("content-range"), JSON.stringify(await r.text()));
}
const r = await fetch(b + "/estilo.css", { headers: { Range: "bytes=0-3" } });
console.log("rota estática + Range:", r.status, r.headers.get("accept-ranges"), r.headers.get("content-range"), JSON.stringify(await r.text()));

// slice() cria uma BunFile parcial: serve para controlares tu o intervalo
const parte = Bun.file(`${pasta}/alfabeto.txt`).slice(5, 10);
console.log("slice(5,10):", await parte.text(), "| tamanho", parte.size);

await server.stop();
