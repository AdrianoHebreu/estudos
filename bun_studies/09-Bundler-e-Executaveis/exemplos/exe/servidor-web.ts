// Servidor + página (HTML import) num único executável: o HTML, o TypeScript do cliente e o CSS ficam lá dentro.
import pagina from "../web/index.html";

const produtos = [
  { id: 1, nome: "Romance Policial", preco: 12.9 },
  { id: 4, nome: "Caneca de Cerâmica", preco: 6.5 },
];
const servidor = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  hostname: "127.0.0.1",
  routes: { "/": pagina, "/api/produtos": () => Response.json(produtos) },
});
console.log("a servir em", servidor.url.href);
