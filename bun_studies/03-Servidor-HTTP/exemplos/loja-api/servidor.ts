// Servidor da loja: as rotas e o /openapi.json saem da mesma tabela (rotas.ts).
// Correr: bun run servidor.ts   (porta por omissão 35030; muda com a variável PORT)
import type { Database } from "bun:sqlite";
import { abrirLoja } from "./dados.ts";
import { gerarOpenApi } from "./openapi.ts";
import { esquemas, rotas, type Rota } from "./rotas.ts";
import { converter, validar } from "./validar.ts";

const JSON_ERRO = (estado: number, erro: string, detalhes?: string[]) =>
  Response.json(detalhes ? { erro, detalhes } : { erro }, { status: estado });

// Transforma uma linha da tabela num handler do Bun.serve: valida, chama e responde.
function adaptar(rota: Rota, db: Database) {
  return async (req: Request & { params: Record<string, string> }) => {
    const url = new URL(req.url);
    const erros: string[] = [];
    const params: Record<string, unknown> = {};
    const query: Record<string, unknown> = {};
    for (const p of rota.parametros ?? []) {
      const bruto = p.em === "path" ? req.params[p.nome] : url.searchParams.get(p.nome);
      if (bruto === undefined || bruto === null) continue;
      const valor = converter(bruto, p.esquema);
      erros.push(...validar(valor, p.esquema, esquemas, p.nome));
      (p.em === "path" ? params : query)[p.nome] = valor;
    }
    if (erros.length) return JSON_ERRO(400, "parâmetros inválidos", erros);

    let corpo: unknown;
    if (rota.corpo) {
      try {
        corpo = await req.json();
      } catch {
        return JSON_ERRO(400, "JSON inválido");
      }
      const errosCorpo = validar(corpo, rota.corpo, esquemas);
      if (errosCorpo.length) return JSON_ERRO(422, "corpo inválido", errosCorpo);
    }
    const r = rota.tratar({ db, params, query, corpo });
    return Response.json(r.corpo, { status: r.status });
  };
}

// /api/produtos/{id}  ->  /api/produtos/:id, agrupado por caminho e método
export function rotasDoBun(db: Database) {
  const routes: Record<string, Record<string, ReturnType<typeof adaptar>>> = {};
  for (const r of rotas) {
    const caminho = "/api" + r.caminho.replace(/\{(\w+)\}/g, ":$1");
    (routes[caminho] ??= {})[r.metodo.toUpperCase()] = adaptar(r, db);
  }
  return routes;
}

export async function iniciar(porta: number, db?: Database) {
  db ??= await abrirLoja();
  const documento = gerarOpenApi();
  return Bun.serve({
    port: porta,
    hostname: "127.0.0.1",
    development: false, // sem a página de erro HTML do modo de desenvolvimento
    routes: {
      ...rotasDoBun(db),
      "/openapi.json": () => Response.json(documento),
      "/docs": new Response(Bun.file(`${import.meta.dir}/docs.html`)),
    },
    fetch: () => JSON_ERRO(404, "rota não existe"),
    error(e) {
      console.error("[loja] erro:", e);
      return JSON_ERRO(500, "erro interno");
    },
  });
}

if (import.meta.main) {
  const servidor = await iniciar(Number(process.env.PORT ?? 35030));
  console.log(`API da loja em ${servidor.url.origin}  (docs em /docs, esquema em /openapi.json) pid ${process.pid}`);
}
