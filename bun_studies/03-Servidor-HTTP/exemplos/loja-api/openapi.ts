// Gera o documento OpenAPI 3.0.3 a partir da tabela de rotas.
import { esquemas, rotas, type Rota } from "./rotas.ts";

export function gerarOpenApi(lista: Rota[] = rotas) {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const r of lista) {
    paths[r.caminho] ??= {};
    paths[r.caminho][r.metodo] = {
      summary: r.resumo,
      operationId: r.metodo + r.caminho.replace(/\{(\w+)\}/g, "_$1").replace(/\//g, "_"),
      tags: [r.caminho.split("/")[1]],
      ...(r.parametros && {
        parameters: r.parametros.map((p) => ({
          name: p.nome,
          in: p.em,
          required: p.obrigatorio ?? false,
          ...(p.descricao && { description: p.descricao }),
          schema: p.esquema,
        })),
      }),
      ...(r.corpo && { requestBody: { required: true, content: { "application/json": { schema: r.corpo } } } }),
      responses: Object.fromEntries(
        Object.entries(r.respostas).map(([estado, resp]) => [
          estado,
          { description: resp.descricao, ...(resp.esquema && { content: { "application/json": { schema: resp.esquema } } }) },
        ]),
      ),
    };
  }
  return {
    openapi: "3.0.3",
    info: { title: "API da loja", version: "1.0.0", description: "Produtos e encomendas da loja do curso de Bun." },
    servers: [{ url: "/api", description: "Este servidor" }],
    paths,
    components: { schemas: esquemas },
  };
}
