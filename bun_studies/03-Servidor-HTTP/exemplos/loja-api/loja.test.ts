// Testes da documentação: bun test loja.test.ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { gerarOpenApi } from "./openapi.ts";
import { esquemas, rotas } from "./rotas.ts";
import { iniciar } from "./servidor.ts";
import { validar, type Esquema } from "./validar.ts";

const doc = gerarOpenApi();
let servidor: Awaited<ReturnType<typeof iniciar>>;
let base: string;

beforeAll(async () => {
  servidor = await iniciar(35031);
  base = servidor.url.origin;
});
afterAll(() => servidor.stop(true));

// constrói um valor a partir dos "example" do esquema
function exemploDe(e: Esquema): unknown {
  if (e.$ref) return exemploDe(esquemas[e.$ref.replace("#/components/schemas/", "")]);
  if (e.example !== undefined) return e.example;
  if (e.type === "array") return [exemploDe(e.items!)];
  if (e.type === "object") return Object.fromEntries(Object.entries(e.properties ?? {}).map(([k, v]) => [k, exemploDe(v)]));
  return undefined;
}

describe("o documento OpenAPI", () => {
  test("tem a estrutura mínima", () => {
    expect(doc.openapi).toBe("3.0.3");
    expect(Object.keys(doc.paths)).toEqual(["/categorias", "/produtos", "/produtos/{id}", "/encomendas", "/encomendas/{id}"]);
  });

  test("operationId são únicos", () => {
    const ids = Object.values(doc.paths).flatMap((p) => Object.values(p).map((op) => (op as { operationId: string }).operationId));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("todos os $ref apontam para esquemas que existem", () => {
    const refs = [...JSON.stringify(doc).matchAll(/#\/components\/schemas\/(\w+)/g)].map((m) => m[1]);
    for (const nome of refs) expect(esquemas[nome]).toBeDefined();
  });

  test.each(Object.keys(esquemas))("o exemplo do esquema %s é válido", (nome) => {
    expect(validar(exemploDe({ $ref: `#/components/schemas/${nome}` }), { $ref: `#/components/schemas/${nome}` }, esquemas)).toEqual([]);
  });
});

describe("as rotas documentadas existem e cumprem o esquema", () => {
  test.each(rotas.map((r) => [r.metodo.toUpperCase(), r.caminho, r] as const))("%s %s", async (_m, caminho, rota) => {
    const url = base + "/api" + caminho.replace(/\{(\w+)\}/g, (_, nome) => String(rota.parametros!.find((p) => p.nome === nome)!.esquema.minimum ?? 1));
    const r = await fetch(url, {
      method: rota.metodo.toUpperCase(),
      body: rota.corpo ? JSON.stringify(exemploDe(rota.corpo)) : undefined,
    });
    expect(Object.keys(rota.respostas).map(Number)).toContain(r.status); // o estado está documentado
    const esquema = rota.respostas[r.status].esquema!;
    expect(validar(await r.json(), esquema, esquemas)).toEqual([]); // o corpo cumpre o esquema
  });

  test("a rota inexistente não está documentada e dá 404", async () => {
    expect((await fetch(base + "/api/fornecedores")).status).toBe(404);
    expect(doc.paths["/fornecedores"]).toBeUndefined();
  });

  test("um corpo inválido dá 422 com os detalhes", async () => {
    const r = await fetch(base + "/api/encomendas", { method: "POST", body: JSON.stringify({ cliente_id: 0, linhas: [] }) });
    expect(r.status).toBe(422);
    const corpo = (await r.json()) as { detalhes: string[] };
    expect(corpo.detalhes).toEqual(["$.cliente_id: mínimo 1", "$.linhas: pelo menos 1 item(s)"]);
  });
});

describe("/openapi.json e /docs", () => {
  test("/openapi.json devolve o documento com o Content-Type certo", async () => {
    const r = await fetch(base + "/openapi.json");
    expect(r.headers.get("content-type")).toStartWith("application/json");
    expect(await r.json()).toEqual(JSON.parse(JSON.stringify(doc)));
  });

  test("/docs devolve HTML que aponta para /openapi.json e para a CDN com SRI", async () => {
    const r = await fetch(base + "/docs");
    const html = await r.text();
    expect(r.headers.get("content-type")).toStartWith("text/html");
    expect(html).toContain('url: "/openapi.json"');
    expect(html).toContain("swagger-ui-dist@5.35.1/swagger-ui-bundle.js");
    expect(html.match(/integrity="sha384-/g)).toHaveLength(2);
  });
});

describe("o mini validador", () => {
  const e: Esquema = { type: "object", required: ["a"], properties: { a: { type: "integer", minimum: 1 }, b: { type: "string", enum: ["x", "y"] } } };
  test("aceita e rejeita", () => {
    expect(validar({ a: 1, b: "x" }, e, {})).toEqual([]);
    expect(validar({ b: "z" }, e, {})).toEqual(["$.a: campo obrigatório", "$.b: devia ser um de x, y"]);
    expect(validar({ a: 1.5 }, e, {})).toEqual(["$.a: devia ser inteiro"]);
  });
  test("limitação conhecida: não valida formatos nem campos extra", () => {
    expect(validar({ a: 1, outro: true }, e, {})).toEqual([]);
    expect(validar("não-é-uma-data", { type: "string", format: "date" } as Esquema, {})).toEqual([]);
  });
});
