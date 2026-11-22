// Uma rota da API da loja cuja resposta vem de uma consulta SQL e é conferida contra o esquema OpenAPI.
// Uso: bun run 07-rota-openapi.ts [sqlite|postgres|mysql]   (palavra-passe fictícia em BN05_PW)
// O servidor (Bun.serve, rotas) está explicado no módulo 03; o validador completo e o Swagger UI também.
import { SQL } from "bun";
import { join } from "node:path";

const motor = process.argv[2] ?? "sqlite";
const pw = encodeURIComponent(process.env.BN05_PW ?? "");
const db =
    motor === "postgres" ? new SQL(`postgres://postgres:${pw}@127.0.0.1:35051/loja`)
    : motor === "mysql" ? new SQL(`mysql://root:${pw}@127.0.0.1:35052/loja`, { allowPublicKeyRetrieval: true })
    : new SQL(":memory:");
for (const t of ["linhas_encomenda", "encomendas", "produtos", "clientes", "categorias"]) await db.unsafe(`DROP TABLE IF EXISTS ${t}`);
await db.file(join(import.meta.dir, "../../00-Introducao/dados/loja.sql"));

// 1. O esquema e a operação, como objetos (o documento completo está no módulo 03)
const Produto = {
    type: "object",
    required: ["id", "nome", "categoria_id", "preco", "stock"],
    properties: {
        id: { type: "integer" },
        nome: { type: "string" },
        categoria_id: { type: "integer" },
        preco: { type: "number" },
        stock: { type: "integer" },
    },
} as const;
const operacao = {
    "/produtos": {
        get: {
            operationId: "listarProdutos",
            parameters: [{ name: "categoria", in: "query", schema: { type: "integer", minimum: 1 } }],
            responses: { "200": { description: "Lista de produtos", content: { "application/json": { schema: { type: "array", items: Produto } } } } },
        },
    },
};

// 2. Mini verificação (só type e required): o validador a sério está no módulo 03
function conforme(valor: any, esq: any, caminho = "$"): string[] {
    if (esq.type === "array") return Array.isArray(valor) ? valor.flatMap((v, i) => conforme(v, esq.items, `${caminho}[${i}]`)) : [`${caminho}: devia ser array`];
    if (esq.type === "integer") return Number.isInteger(valor) ? [] : [`${caminho}: devia ser inteiro (veio ${typeof valor} ${JSON.stringify(valor)})`];
    if (esq.type === "number") return typeof valor === "number" ? [] : [`${caminho}: devia ser número (veio ${typeof valor} ${JSON.stringify(valor)})`];
    if (esq.type === "string") return typeof valor === "string" ? [] : [`${caminho}: devia ser string`];
    const faltam = (esq.required ?? []).filter((c: string) => !(c in valor)).map((c: string) => `${caminho}.${c}: em falta`);
    return [...faltam, ...Object.entries(esq.properties ?? {}).flatMap(([k, e]) => (k in valor ? conforme(valor[k], e, `${caminho}.${k}`) : []))];
}
const esquemaResposta = operacao["/produtos"].get.responses["200"].content["application/json"].schema;

// 3. A consulta: o que o driver devolve não é sempre o que o esquema promete
const consulta = (categoria?: number) =>
    db`SELECT id, nome, categoria_id, preco, stock FROM produtos ${categoria ? db`WHERE categoria_id = ${categoria}` : db``} ORDER BY id`;
const bruto = await consulta(2);
const erros = conforme([...bruto], esquemaResposta);
console.log(`[${motor}] linhas sem conversão: ${erros.length} erro(s)`, erros.slice(0, 2));

// 4. A rota converte à saída: o esquema diz number, por isso preco passa a Number
const normalizar = (l: any) => ({ ...l, preco: Number(l.preco) });
const servidor = Bun.serve({
    port: 35050,
    hostname: "127.0.0.1",
    routes: {
        "/openapi.json": () => Response.json({ openapi: "3.0.3", info: { title: "Loja", version: "1" }, paths: operacao }),
        "/produtos": async req => {
            const c = new URL(req.url).searchParams.get("categoria");
            if (c !== null && !(Number.isInteger(Number(c)) && Number(c) >= 1)) return Response.json({ erro: "categoria: devia ser inteiro >= 1" }, { status: 400 });
            const linhas = await consulta(c ? Number(c) : undefined);
            return Response.json(linhas.map(normalizar));
        },
    },
});
const base = `http://127.0.0.1:${servidor.port}`;

// 5. Provar contra o servidor a sério: resposta, tipos e contrato
const r = await fetch(`${base}/produtos?categoria=2`);
const corpo = await r.json();
console.log(`GET /produtos?categoria=2 -> ${r.status} ${r.headers.get("content-type")} | ${corpo.length} produtos | erros do esquema: ${conforme(corpo, esquemaResposta).length}`);
console.log("primeiro:", JSON.stringify(corpo[0]));
const mau = await fetch(`${base}/produtos?categoria=abc`);
console.log(`GET /produtos?categoria=abc -> ${mau.status}`, JSON.stringify(await mau.json()));
const doc: any = await (await fetch(`${base}/openapi.json`)).json();
console.log("operationId documentado:", doc.paths["/produtos"].get.operationId);

await servidor.stop(true);
for (const t of ["linhas_encomenda", "encomendas", "produtos", "clientes", "categorias"]) await db.unsafe(`DROP TABLE IF EXISTS ${t}`);
await db.close();
