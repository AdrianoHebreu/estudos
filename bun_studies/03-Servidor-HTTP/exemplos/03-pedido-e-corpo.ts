// Request, URL, query strings, Headers e leitura do corpo (json, text, formData, arrayBuffer).
const server = Bun.serve({
  port: 35032,
  hostname: "127.0.0.1",
  maxRequestBodySize: 1024, // 1 KiB, só para a demonstração
  routes: {
    "/pesquisa": (req) => {
      const url = new URL(req.url);
      const q = url.searchParams;
      return Response.json({
        pathname: url.pathname,
        search: url.search,
        q: q.get("q"),
        categorias: q.getAll("cat").map(Number),
        limite: Number(q.get("limite") ?? 10),
        todos: Object.fromEntries(q),
        host: req.headers.get("host"),
        agente: req.headers.get("user-agent")?.slice(0, 12),
        metodo: req.method,
      });
    },
    "/json": { POST: async (req) => Response.json({ tipo: typeof (await req.json()) }) },
    "/texto": { POST: async (req) => new Response(`${(await req.text()).length} caracteres`) },
    "/bytes": {
      POST: async (req) => {
        const buf = await req.arrayBuffer();
        return Response.json({ bytes: buf.byteLength, primeiro: new Uint8Array(buf)[0] });
      },
    },
    "/form": {
      POST: async (req) => {
        const f = await req.formData();
        const ficheiro = f.get("foto");
        return Response.json({
          campo: f.get("nome"),
          ficheiro: ficheiro instanceof File ? { nome: ficheiro.name, tamanho: ficheiro.size, tipo: ficheiro.type } : null,
        });
      },
    },
  },
});
const b = server.url.origin;

console.log("--- query string");
console.log(await (await fetch(`${b}/pesquisa?q=caneca%20c&cat=1&cat=3&limite=5`)).json());

console.log("--- corpo");
console.log("json     :", await (await fetch(`${b}/json`, { method: "POST", body: JSON.stringify([1, 2]) })).json());
// sem handler error, este pedido dá 500 e o processo acaba com código de saída 1 (ver a aula)
const mau = await fetch(`${b}/json`, { method: "POST", body: "{ isto não é JSON" });
console.log("json mau :", mau.status, (await mau.text()).slice(0, 60));
console.log("texto    :", await (await fetch(`${b}/texto`, { method: "POST", body: "Ação!" })).text());
console.log("bytes    :", await (await fetch(`${b}/bytes`, { method: "POST", body: new Uint8Array([200, 1, 2]) })).json());

const fd = new FormData();
fd.set("nome", "Ana");
fd.set("foto", new File(["conteúdo"], "a.txt", { type: "text/plain" }));
console.log("formData :", await (await fetch(`${b}/form`, { method: "POST", body: fd })).json());

console.log("--- maxRequestBodySize");
const grande = await fetch(`${b}/texto`, { method: "POST", body: "x".repeat(2000) });
console.log("2000 bytes:", grande.status, await grande.text());

await server.stop();
