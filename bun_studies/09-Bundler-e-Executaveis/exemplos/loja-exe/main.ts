// Ponto de entrada do executável da loja. Reutiliza, sem as copiar, as rotas e o OpenAPI do módulo 03
// e embute no executável os dois ficheiros que a API lia do disco: o loja.sql e a página /docs.
import { Database } from "bun:sqlite";
import sql from "../../../00-Introducao/dados/loja.sql" with { type: "text" };
import docs from "../../../03-Servidor-HTTP/exemplos/loja-api/docs.html" with { type: "file" };
import { gerarOpenApi } from "../../../03-Servidor-HTTP/exemplos/loja-api/openapi.ts";
import { rotasDoBun } from "../../../03-Servidor-HTTP/exemplos/loja-api/servidor.ts";

const db = new Database(":memory:");
db.exec("PRAGMA foreign_keys = ON");
db.exec(sql);

const documento = gerarOpenApi();
const servidor = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  hostname: "127.0.0.1",
  development: false,
  routes: {
    ...rotasDoBun(db),
    "/openapi.json": () => Response.json(documento),
    "/docs": () => new Response(Bun.file(docs), { headers: { "content-type": "text/html; charset=utf-8" } }),
  },
  fetch: () => Response.json({ erro: "rota não existe" }, { status: 404 }),
});
console.log(`loja em ${servidor.url.origin} (docs em /docs) pid ${process.pid}`);
