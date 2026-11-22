import { Database } from "bun:sqlite";
import { SQL } from "bun";
import { join } from "node:path";

const j = (x: unknown) => JSON.stringify(x);
const ddl = await Bun.file(join(import.meta.dir, "../../00-Introducao/dados/loja.sql")).text();

const a = new Database(":memory:"); // bun:sqlite: síncrono
a.exec(ddl);
const b = new SQL(":memory:"); // Bun.sql sobre o mesmo motor SQLite: assíncrono
await b.unsafe(ddl);

// 1. A mesma pergunta nas duas APIs
console.log("bun:sqlite get   :", j(a.query("SELECT id, nome FROM produtos WHERE id = ?").get(3)));
console.log("Bun.sql 1ª linha :", j((await b`SELECT id, nome FROM produtos WHERE id = ${3}`)[0]));
console.log("sem linhas       :", j(a.query("SELECT 1 FROM produtos WHERE id = -1").get()), "contra", j(await b`SELECT 1 FROM produtos WHERE id = ${-1}`));

// 2. O que uma escrita devolve
console.log("bun:sqlite run   :", j(a.run("UPDATE produtos SET stock = stock + 1 WHERE categoria_id = 3")));
const u = await b`UPDATE produtos SET stock = stock + 1 WHERE categoria_id = ${3}`;
console.log("Bun.sql update   :", j({ count: u.count, affectedRows: u.affectedRows, lastInsertRowid: u.lastInsertRowid }));

// 3. Erros: a mesma classe SQLiteError?
let ea: any, eb: any;
try { a.query("SELECT * FROM clientess").all(); } catch (e) { ea = e; }
try { await b`SELECT * FROM clientess`; } catch (e) { eb = e; }
console.log("erro bun:sqlite  :", ea.name, ea.code, ea.errno, "| instanceof SQL.SQLiteError:", ea instanceof SQL.SQLiteError);
console.log("erro Bun.sql     :", eb.name, eb.code, eb.errno, "| instanceof SQL.SQLiteError:", eb instanceof SQL.SQLiteError);

// 4. Medição indicativa: 20000 leituras por chave primária
const N = 20000;
const q = a.query("SELECT id, nome, preco FROM produtos WHERE id = ?");
let t = performance.now();
for (let i = 0; i < N; i++) q.get((i % 10) + 1);
const tSync = performance.now() - t;
t = performance.now();
for (let i = 0; i < N; i++) await b`SELECT id, nome, preco FROM produtos WHERE id = ${(i % 10) + 1}`;
const tAsync = performance.now() - t;
console.log(`bun:sqlite: ${tSync.toFixed(0)} ms | Bun.sql (SQLite): ${tAsync.toFixed(0)} ms | razão: ${(tAsync / tSync).toFixed(1)}x`);
await b.close();
a.close();
