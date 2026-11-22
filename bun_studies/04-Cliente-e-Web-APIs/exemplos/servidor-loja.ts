// Contraparte local dos exemplos do módulo 04: uma API mínima da «loja».
// O Bun.serve é explicado a fundo no módulo 03; aqui serve só para teres
// com quem conversar sem depender da internet.
// Uso: import { iniciar } from "./servidor-loja.ts"  (ou: bun servidor-loja.ts)

export const PORTA = Number(process.env.PORTA_LOJA ?? 35040);

export const produtos = [
  { id: 1, nome: "Romance Policial", categoriaId: 1, preco: 12.9, stock: 40 },
  { id: 2, nome: "Livro de Receitas", categoriaId: 1, preco: 18.5, stock: 25 },
  { id: 3, nome: "Atlas Mundial", categoriaId: 1, preco: 29.99, stock: 10 },
  { id: 4, nome: "Auscultadores Bluetooth", categoriaId: 2, preco: 49.9, stock: 30 },
  { id: 5, nome: "Carregador USB-C", categoriaId: 2, preco: 14.9, stock: 100 },
  { id: 6, nome: "Teclado Mecânico", categoriaId: 2, preco: 79.0, stock: 0 },
  { id: 7, nome: "Candeeiro de Mesa", categoriaId: 3, preco: 22.0, stock: 15 },
  { id: 8, nome: "Conjunto de Panelas", categoriaId: 3, preco: 89.9, stock: 8 },
  { id: 9, nome: "Manta de Sofá", categoriaId: 3, preco: 34.5, stock: 20 },
  { id: 10, nome: "Caneca de Cerâmica", categoriaId: 3, preco: 6.5, stock: 200 },
];

const json = (dados: unknown, init: ResponseInit = {}) => Response.json(dados, init);
const dormir = (ms: number) => new Promise(r => setTimeout(r, ms));

export function iniciar(port = PORTA, unix?: string) {
  const memoria = structuredClone(produtos);
  let proximaEncomenda = 13;
  return Bun.serve({
    ...(unix ? { unix } : { port }),
    async fetch(req, server) {
      const url = new URL(req.url);
      const { pathname: p } = url;

      if (p === "/ws") {
        return server.upgrade(req) ? undefined : new Response("precisa de WebSocket", { status: 426 });
      }
      if (p === "/api/produtos" && req.method === "GET") {
        let lista = memoria;
        const cat = url.searchParams.get("categoria");
        const max = url.searchParams.get("max");
        if (cat) lista = lista.filter(x => x.categoriaId === Number(cat));
        if (max) lista = lista.filter(x => x.preco <= Number(max));
        return json(lista, { headers: { "X-Total-Count": String(lista.length) } });
      }
      const m = p.match(/^\/api\/produtos\/(\d+)$/);
      if (m) {
        const prod = memoria.find(x => x.id === Number(m[1]));
        if (!prod) return json({ erro: "Produto não encontrado" }, { status: 404 });
        if (req.method === "GET") return json(prod);
        if (req.method === "PATCH") {
          Object.assign(prod, await req.json());
          return json(prod);
        }
        if (req.method === "DELETE") {
          memoria.splice(memoria.indexOf(prod), 1);
          return new Response(null, { status: 204 });
        }
      }
      if (p === "/api/encomendas" && req.method === "POST") {
        let corpo: any;
        try { corpo = await req.json(); } catch { return json({ erro: "JSON inválido" }, { status: 400 }); }
        if (!corpo.clienteId || !Array.isArray(corpo.linhas) || corpo.linhas.length === 0) {
          return json({ erro: "clienteId e linhas são obrigatórios" }, { status: 422 });
        }
        const id = proximaEncomenda++;
        return json({ id, estado: "pendente", ...corpo }, { status: 201, headers: { Location: `/api/encomendas/${id}` } });
      }
      if (p.match(/^\/api\/produtos\/\d+\/imagem$/) && req.method === "POST") {
        const form = await req.formData();
        const f = form.get("imagem");
        return json({
          legenda: form.get("legenda"),
          ficheiro: f instanceof File ? { nome: f.name, tipo: f.type, bytes: f.size } : null,
        });
      }
      if (p === "/api/cabecalhos") {
        return json(Object.fromEntries(req.headers), { headers: { "X-Servidor": "loja-local" } });
      }
      if (p === "/api/antigo") return Response.redirect(new URL("/api/produtos?categoria=3", url), 301);
      if (p === "/api/loop") return Response.redirect(new URL("/api/loop", url), 302);
      if (p === "/api/lento") {
        await dormir(Number(url.searchParams.get("ms") ?? 500));
        return json({ ok: true });
      }
      if (p === "/api/falha") return json({ erro: "falha interna simulada" }, { status: 500 });
      if (p === "/api/linhas.ndjson") {
        // Uma linha JSON por pedaço, com pausa: para ler em streaming.
        const enc = new TextEncoder();
        return new Response(new ReadableStream({
          async start(c) {
            for (const x of memoria) { c.enqueue(enc.encode(JSON.stringify(x) + "\n")); await dormir(30); }
            c.close();
          },
        }), { headers: { "Content-Type": "application/x-ndjson" } });
      }
      if (p === "/api/relatorio.csv") {
        const linhas = ["id;nome;categoria;preco;stock"];
        for (const x of memoria) linhas.push(`${x.id};${x.nome};${x.categoriaId};${x.preco.toFixed(2).replace(".", ",")};${x.stock}`);
        return new Response(linhas.join("\n") + "\n", { headers: { "Content-Type": "text/csv; charset=utf-8" } });
      }
      if (p === "/api/comprimido") {
        const corpo = Bun.gzipSync(JSON.stringify(memoria));
        return new Response(corpo, { headers: { "Content-Type": "application/json", "Content-Encoding": "gzip" } });
      }
      if (p === "/api/eventos") {
        const enc = new TextEncoder();
        const estados = ["pendente", "enviada", "entregue"];
        return new Response(new ReadableStream({
          async start(c) {
            c.enqueue(enc.encode(": ligado\n\n"));
            for (const [i, estado] of estados.entries()) {
              await dormir(40);
              c.enqueue(enc.encode(`id: ${i + 1}\nevent: estado\ndata: ${JSON.stringify({ encomenda: 8, estado })}\n\n`));
            }
            c.close();
          },
        }), { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
      }
      if (p === "/catalogo.html") {
        const itens = memoria.slice(0, 3).map(x => `<li class="produto" data-id="${x.id}">${x.nome} <a href="/api/produtos/${x.id}">ver</a></li>`).join("\n    ");
        return new Response(`<!doctype html>\n<html><head><title>Catálogo</title></head>\n<body>\n  <h1>Loja</h1>\n  <ul>\n    ${itens}\n  </ul>\n  <script>alert("anúncio")</script>\n  <!-- nota interna -->\n</body></html>\n`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
      return json({ erro: "Rota não encontrada", caminho: p }, { status: 404 });
    },
    websocket: {
      message(ws, msg) {
        const texto = String(msg);
        if (texto === "cair") return ws.close(1011, "queda simulada");
        if (texto === "fechar") return ws.close(1000, "até logo");
        ws.send(`eco: ${texto}`);
      },
      open(ws) { ws.send("bem-vindo à loja"); },
    },
  });
}

if (import.meta.main) {
  const s = iniciar();
  console.log(`servidor da loja em ${s.url}`);
}
