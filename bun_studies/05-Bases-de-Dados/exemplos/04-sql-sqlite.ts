import { SQL } from "bun";
import { join } from "node:path";

const j = (x: unknown) => JSON.stringify(x);
const db = new SQL(":memory:"); // sqlite://:memory: também serve; o adaptador vem da URL

// 1. Carregar o loja.sql: sql.file lê o ficheiro e corre todos os comandos
const r = await db.file(join(import.meta.dir, "../../00-Introducao/dados/loja.sql"));
console.log("adaptador:", db.options.adapter, "| comando:", r.command);
console.log("contagens:", j(await db`SELECT (SELECT count(*) FROM categorias) AS categorias, (SELECT count(*) FROM produtos) AS produtos, (SELECT count(*) FROM linhas_encomenda) AS linhas`));

// 2. Consultas: cada ${valor} vira um parâmetro, nunca texto colado ao SQL
const categoria = 2;
const eletronica = await db`SELECT id, nome, preco FROM produtos WHERE categoria_id = ${categoria} ORDER BY id`;
console.log("objetos :", j(eletronica), "| count:", eletronica.count);
console.log("values():", j(await db`SELECT id, nome FROM categorias ORDER BY id`.values()));

// 3. INSERT com sql(objeto): colunas e valores saem do objeto
const ins = await db`INSERT INTO categorias ${db({ id: 4, nome: "Jardim" })}`;
console.log("insert:", j({ count: ins.count, affectedRows: ins.affectedRows, lastInsertRowid: ins.lastInsertRowid, command: ins.command }));
console.log("returning:", j(await db`INSERT INTO categorias ${db({ id: 5, nome: "Brinquedos" })} RETURNING id, nome`));
await db`INSERT INTO categorias ${db([{ id: 6, nome: "Desporto" }, { id: 7, nome: "Moda" }])}`; // vários de uma vez
const novo = { id: 8, nome: "Animais", ignorado: "isto não é coluna" };
await db`INSERT INTO categorias ${db(novo, "id", "nome")}`; // só as colunas indicadas

// 4. UPDATE com sql(objeto) e condição dinâmica com fragmentos
const upd = await db`UPDATE categorias SET ${db({ nome: "Jardinagem" })} WHERE id = ${4}`;
console.log("update count:", upd.count, "| command:", upd.command);

function procurar(filtros: { maxPreco?: number; categoria?: number }) {
    const condicoes = [db`stock > ${0}`];
    if (filtros.maxPreco !== undefined) condicoes.push(db`preco <= ${filtros.maxPreco}`);
    if (filtros.categoria !== undefined) condicoes.push(db`categoria_id = ${filtros.categoria}`);
    return db`SELECT id, nome FROM produtos WHERE ${condicoes.reduce((a, c) => db`${a} AND ${c}`)} ORDER BY id`;
}
console.log("filtro 1:", j(await procurar({ maxPreco: 15 })));
console.log("filtro 2:", j(await procurar({ maxPreco: 50, categoria: 3 })));
console.log("IN:", j(await db`SELECT id, nome FROM categorias WHERE id IN ${db([1, 3, 8])} ORDER BY id`));
console.log("identificador:", j(await db`SELECT count(*) AS n FROM ${db("clientes")}`));

// 5. Transações: begin faz COMMIT ao acabar e ROLLBACK se o callback lançar
await db.begin(async tx => {
    await tx`UPDATE produtos SET stock = stock - ${2} WHERE id = ${1}`;
    await tx`INSERT INTO linhas_encomenda ${tx({ encomenda_id: 12, produto_id: 1, quantidade: 2, preco_unitario: 12.9 })}`;
});
console.log("stock do produto 1 depois da venda:", j(await db`SELECT stock FROM produtos WHERE id = ${1}`));
try {
    await db.begin(async tx => {
        await tx`UPDATE produtos SET stock = 0 WHERE categoria_id = ${1}`;
        await tx`INSERT INTO categorias ${tx({ id: 1, nome: "Repetida" })}`; // chave repetida
    });
} catch (e: any) {
    console.log("begin falhou:", e.code, "-", e.message);
}
console.log("stock dos livros (revertido):", j(await db`SELECT id, stock FROM produtos WHERE categoria_id = ${1} ORDER BY id`));

// 6. Savepoints: desfazer só uma parte
await db.begin(async tx => {
    await tx`INSERT INTO categorias ${tx({ id: 30, nome: "Mantida" })}`;
    try {
        await tx.savepoint(async sp => {
            await sp`INSERT INTO categorias ${sp({ id: 31, nome: "Desfeita" })}`;
            throw new Error("desfazer só isto");
        });
    } catch (e: any) {
        console.log("savepoint:", e.message);
    }
    await tx`INSERT INTO categorias ${tx({ id: 32, nome: "Também mantida" })}`;
});
console.log("ids >= 30:", j(await db`SELECT id FROM categorias WHERE id >= 30 ORDER BY id`));

// 7. sql.unsafe com os marcadores do próprio SQLite
console.log("unsafe ?     :", j(await db.unsafe("SELECT nome FROM categorias WHERE id = ?", [2])));
console.log("unsafe :nome :", j(await db.unsafe("SELECT nome FROM categorias WHERE id = :id", { ":id": 3 })));
console.log("unsafe id    :", j(await db.unsafe("SELECT nome FROM categorias WHERE id = :id", { id: 3 })), "(sem prefixo, na 1.4.0, liga NULL)");

// 8. Erros reais: SQL.SQLiteError com code e errno
for (const [titulo, consulta] of [
    ["tabela inexistente", () => db`SELECT * FROM clientess`],
    ["chave repetida", () => db`INSERT INTO categorias ${db({ id: 1, nome: "x" })}`],
    ["NOT NULL", () => db`INSERT INTO categorias ${db({ id: 90, nome: null })}`],
    ["chave estrangeira", async () => { await db`PRAGMA foreign_keys = ON`; return db`INSERT INTO produtos ${db({ id: 50, nome: "F", categoria_id: 99, preco: 1, stock: 1 })}`; }],
] as const) {
    try {
        await consulta();
    } catch (e: any) {
        console.log(`${titulo}:`, e instanceof SQL.SQLiteError, e.code, e.errno, "-", e.message);
    }
}
await db.close();
