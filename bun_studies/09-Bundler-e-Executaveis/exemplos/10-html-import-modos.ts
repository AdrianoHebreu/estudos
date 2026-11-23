// HTML imports: o mesmo HTML servido em modo de desenvolvimento e em modo de produção.
// O Bun empacota o <script> e o <link> sozinho; a diferença está no que ele lhes faz.
import pagina from "./web/index.html";

const produtos = [
  { id: 1, nome: "Romance Policial", preco: 12.9 },
  { id: 4, nome: "Caneca de Cerâmica", preco: 6.5 },
];

async function medir(rotulo: string, porta: number, development: boolean | { hmr: boolean; console: boolean }) {
  const servidor = Bun.serve({
    port: porta,
    hostname: "127.0.0.1",
    development,
    routes: {
      "/": pagina,
      "/api/produtos": () => Response.json(produtos),
    },
  });
  const t0 = performance.now();
  const html = await (await fetch(servidor.url)).text();
  const ms = Math.round(performance.now() - t0);
  const js = html.match(/src="([^"]+[.]js)"/)![1];
  const css = html.match(/href="([^"]+[.]css)"/)![1];
  const rj = await fetch(new URL(js, servidor.url));
  const corpoJs = await rj.text();
  const rc = await fetch(new URL(css, servidor.url));
  console.log(rotulo.padEnd(22), "1.º pedido", ms + " ms |", js, rj.status, corpoJs.length, "bytes |", css, rc.status, (await rc.text()).length, "bytes");
  console.log("  cache-control do js:", rj.headers.get("cache-control"), "| etag:", rj.headers.get("etag") ? "sim" : "não", "| contém 'hmr'?", /hmr|HMR/.test(corpoJs));
  await servidor.stop(true);
}

await medir("desenvolvimento", 35090, true);
await medir("dev sem hmr", 35091, { hmr: false, console: false });
await medir("produção", 35092, false);
