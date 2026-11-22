// Uso: bun run 06-sql-injecao.ts [sqlite|postgres|mysql]   (palavra-passe fictícia em BN05_PW)
import { SQL } from "bun";
import { join } from "node:path";

const motor = process.argv[2] ?? "sqlite";
const pw = encodeURIComponent(process.env.BN05_PW ?? "");
const db =
    motor === "postgres" ? new SQL(`postgres://postgres:${pw}@127.0.0.1:35051/loja`)
    : motor === "mysql" ? new SQL(`mysql://root:${pw}@127.0.0.1:35052/loja`, { allowPublicKeyRetrieval: true })
    : new SQL(":memory:");
const marcador = motor === "postgres" ? "$1" : "?";
const j = (x: unknown) => JSON.stringify(x);
const tabelas = ["teste", "linhas_encomenda", "encomendas", "produtos", "clientes", "categorias"];
const repor = async () => { for (const t of tabelas) await db.unsafe(`DROP TABLE IF EXISTS ${t}`); };

console.log("=== motor:", motor, "===");
await repor();
await db.file(join(import.meta.dir, "../../00-Introducao/dados/loja.sql"));

// Entrada de um utilizador mal-intencionado, vinda de ?nome=... num pedido HTTP
const entrada = "x' OR '1'='1";

// 1. Errado: colar texto ao SQL com sql.unsafe devolve TODOS os clientes
const mau = await db.unsafe(`SELECT id, nome FROM clientes WHERE nome = '${entrada}' ORDER BY id`);
console.log("unsafe + concatenação:", mau.length, "linhas (devia ser 0)");

// 2. Certo: o template etiquetado envia a entrada como parâmetro
const bom = await db`SELECT id, nome FROM clientes WHERE nome = ${entrada} ORDER BY id`;
console.log("template etiquetado  :", bom.length, "linhas");

// 3. Pior: sql.unsafe SEM parâmetros aceita vários comandos
const estrago = "x'; DROP TABLE linhas_encomenda; -- "; // o espaço depois de -- é necessário no MySQL
console.log("antes:", j(await db`SELECT count(*) AS n FROM linhas_encomenda`));
await db.unsafe(`SELECT id FROM clientes WHERE nome = '${estrago}'`);
try {
    await db`SELECT count(*) AS n FROM linhas_encomenda`;
} catch (e: any) {
    console.log("depois:", e.code, "-", e.message);
}

// 4. Com parâmetros, um segundo comando é aceite ou recusado conforme o motor
await db.unsafe("CREATE TABLE teste (n INTEGER)");
try {
    await db.unsafe(`INSERT INTO teste VALUES (${marcador}); INSERT INTO teste VALUES (2)`, [1]);
} catch (e: any) {
    console.log("dois comandos com parâmetros:", e.code, "-", e.message.slice(0, 90));
}
console.log("linhas em teste:", j(await db`SELECT n FROM teste ORDER BY n`));

// 5. Identificadores (tabela, coluna, ORDER BY) não são parâmetros: valida contra uma lista
const colunasOrdenaveis = new Set(["id", "nome", "preco", "stock"]);
function ordenar(coluna: string) {
    if (!colunasOrdenaveis.has(coluna)) throw new Error(`coluna não permitida: ${coluna}`);
    return db`SELECT id, nome FROM produtos ORDER BY ${db(coluna)} DESC LIMIT 2`;
}
console.log("ordenar por preco:", j(await ordenar("preco")));
try {
    await ordenar("preco; DROP TABLE produtos");
} catch (e: any) {
    console.log("ordenar por texto livre:", e.message);
}
await repor();
await db.close();
