// Uso: bun run 05-sql-tres-motores.ts sqlite|postgres|mysql
// A palavra-passe (fictícia) vem da variável de ambiente BN05_PW; nunca fica em ficheiros.
import { SQL } from "bun";
import { join } from "node:path";

const motor = process.argv[2] ?? "sqlite";
const pw = encodeURIComponent(process.env.BN05_PW ?? "");

// A ÚNICA parte que muda de motor para motor é a ligação.
function ligar(): SQL {
    if (motor === "postgres") return new SQL(`postgres://postgres:${pw}@127.0.0.1:35051/loja`);
    if (motor === "mysql") return new SQL(`mysql://root:${pw}@127.0.0.1:35052/loja`, { allowPublicKeyRetrieval: true });
    return new SQL(":memory:");
}

const mostra = (x: unknown) => JSON.stringify(x, (_k, v) => (typeof v === "bigint" ? `${v}n` : v instanceof Date ? `Date(${v.toISOString()})` : v));
const tipo = (v: unknown) => (v === null ? "null" : v instanceof Date ? "Date" : typeof v);
async function tenta(titulo: string, f: () => unknown) {
    try {
        console.log(titulo, "->", mostra(await f()));
    } catch (e: any) {
        console.log(titulo, "-> ERRO", e.constructor.name, e.code, "errno", e.errno, e.sqlState ?? "", "-", e.message.slice(0, 110));
    }
}

const db = ligar();
console.log("=== motor:", motor, "| adaptador:", db.options.adapter, "===");

// 1. Repor e carregar a loja (o mesmo ficheiro nos três)
for (const t of ["linhas_encomenda", "encomendas", "produtos", "clientes", "categorias"]) await db.unsafe(`DROP TABLE IF EXISTS ${t}`);
await db.file(join(import.meta.dir, "../../00-Introducao/dados/loja.sql"));
await tenta("contagens", async () => (await db`SELECT (SELECT count(*) FROM clientes) AS clientes, (SELECT count(*) FROM linhas_encomenda) AS linhas`)[0]);
await tenta("acentos", async () => (await db`SELECT nome FROM categorias WHERE id = ${2}`)[0].nome);

// 2. Tipos devolvidos para a mesma consulta
const [linha] = await db`
    SELECT p.preco, p.stock, c.data_registo, count(*) AS n, sum(p.stock) AS soma_stock, avg(p.preco) AS media
    FROM produtos p, clientes c WHERE p.id = ${3} AND c.id = ${1}
    GROUP BY p.preco, p.stock, c.data_registo`;
console.log("valores:", mostra(linha));
console.log("tipos  :", mostra(Object.fromEntries(Object.entries(linha).map(([k, v]) => [k, tipo(v)]))));
await tenta("inteiro grande", async () => (await db`SELECT 9007199254740993 AS x`)[0]);

// 3. Escrever: o que o resultado diz de uma escrita
const ins: any = await db`INSERT INTO categorias ${db({ id: 4, nome: "Jardim" })}`;
console.log("insert  :", mostra({ count: ins.count, affectedRows: ins.affectedRows, lastInsertRowid: ins.lastInsertRowid, command: ins.command }));
const upd: any = await db`UPDATE categorias SET ${db({ nome: "Jardinagem" })} WHERE id = ${4}`;
console.log("update  :", mostra({ count: upd.count, affectedRows: upd.affectedRows, command: upd.command }));
console.log("linhas escritas (afetadas ?? count):", upd.affectedRows ?? upd.count);
await tenta("RETURNING", () => db`INSERT INTO categorias ${db({ id: 5, nome: "Brinquedos" })} RETURNING id, nome`);
await tenta("IN com lista", () => db`SELECT id FROM categorias WHERE id IN ${db([1, 3, 4])} ORDER BY id`);
await tenta("datas (texto ISO)", () => db`SELECT id FROM clientes WHERE data_registo >= ${"2024-06-01"} ORDER BY id`);
await tenta("datas (objeto Date)", () => db`SELECT id FROM clientes WHERE data_registo >= ${new Date("2024-06-01T00:00:00Z")} ORDER BY id`);
await tenta("sql.array", () => db`SELECT id FROM categorias WHERE id = ANY(${db.array([1, 2], "INT")}) ORDER BY id`);

// 4. Transação com ROLLBACK e savepoint
await tenta("begin com erro", async () => {
    try {
        await db.begin(async tx => {
            await tx`INSERT INTO categorias ${tx({ id: 21, nome: "Desfeita" })}`;
            await tx`INSERT INTO categorias ${tx({ id: 1, nome: "Repetida" })}`;
        });
    } catch (e: any) {
        return { erro: e.code, categoria21: (await db`SELECT id FROM categorias WHERE id = ${21}`).length };
    }
});
await db.begin(async tx => {
    await tx`INSERT INTO categorias ${tx({ id: 30, nome: "Mantida" })}`;
    await tx.savepoint(async sp => {
        await sp`INSERT INTO categorias ${sp({ id: 31, nome: "Desfeita" })}`;
        throw new Error("desfazer");
    }).catch(() => {});
});
console.log("savepoint:", mostra((await db`SELECT id FROM categorias WHERE id >= 30 ORDER BY id`).map((l: any) => l.id)));

// 5. Os erros de cada motor
await tenta("tabela inexistente", () => db`SELECT * FROM clientess`);
await tenta("chave repetida   ", () => db`INSERT INTO categorias ${db({ id: 1, nome: "x" })}`);
await tenta("NOT NULL         ", () => db`INSERT INTO categorias ${db({ id: 90, nome: null })}`);
await tenta("chave estrangeira", () => db`INSERT INTO produtos ${db({ id: 50, nome: "F", categoria_id: 99, preco: 1, stock: 1 })}`);
await tenta("sintaxe          ", () => db`SELEC 1`);

for (const t of ["linhas_encomenda", "encomendas", "produtos", "clientes", "categorias"]) await db.unsafe(`DROP TABLE IF EXISTS ${t}`);
await db.close();
