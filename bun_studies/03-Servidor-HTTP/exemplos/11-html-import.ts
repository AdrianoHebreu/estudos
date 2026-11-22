// HTML imports: introdução. O Bun empacota o <script> e o <link> do HTML ao servir.
// O detalhe (bundler, produção, plugins) é do módulo 09.
import pagina from "./html/index.html";

const server = Bun.serve({
  port: 35039,
  hostname: "127.0.0.1",
  routes: {
    "/": pagina,
    "/api/ping": () => Response.json({ ok: true }),
  },
});

const html = await (await fetch(server.url)).text();
console.log("HTML com", html.length, "caracteres; referência ao app.ts original?", html.includes("app.ts"));

// os URLs reescritos apontam para ficheiros gerados pelo Bun (rota /_bun/...)
const js = html.match(/src="([^"]+\.js)"/)?.[1];
const css = html.match(/href="([^"]+\.css)"/)?.[1];
console.log("js :", js);
console.log("css:", css);
for (const url of [js, css]) {
  const r = await fetch(new URL(url!, server.url));
  console.log(url, r.status, r.headers.get("content-type"), (await r.text()).length, "bytes");
}
await server.stop();
