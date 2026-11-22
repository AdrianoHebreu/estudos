import { Database } from "bun:sqlite";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const j = (x: unknown) => JSON.stringify(x, (_k, v) => (typeof v === "bigint" ? `${v}n` : v));
const caminhoLoja = join(import.meta.dir, "../../00-Introducao/dados/loja.sql");
const sqlLoja = await Bun.file(caminhoLoja).text();

// 1. Mapear linhas para classes com .as(): sem construtor, só o protótipo
class Produto {
    id!: number;
    nome!: string;
    preco!: number;
    stock!: number;
    valorStock = -1; // inicializador: NÃO corre com .as()
    get semStock() {
        return this.stock === 0;
    }
    comIva(taxa = 0.23) {
        return Math.round(this.preco * (1 + taxa) * 100) / 100;
    }
}
const db = new Database(":memory:");
db.exec(sqlLoja);
const produtos = db.query("SELECT id, nome, preco, stock FROM produtos ORDER BY id").as(Produto);
const todos = produtos.all();
console.log("instância de Produto:", todos[0] instanceof Produto, "| comIva(12.90):", todos[0].comIva());
console.log("sem stock:", todos.filter(p => p.semStock).map(p => p.nome));
console.log("valorStock existe?", "valorStock" in todos[0], "| get() -> classe:", produtos.get()?.constructor.name);

// 2. Decimais: a coluna é DECIMAL(10,2), mas o SQLite devolve vírgula flutuante
console.log("1.23 * 29.99 =", j(db.query("SELECT preco * 1.23 AS x FROM produtos WHERE id = 3").get()));
console.log("typeof preco:", typeof (db.query("SELECT preco FROM produtos WHERE id = 3").get() as any).preco);
console.log("soma em cêntimos:", j(db.query("SELECT sum(CAST(round(preco * 100) AS INTEGER)) AS centimos FROM produtos").get()));

// 3. Inteiros grandes: number perde precisão acima de 2^53, safeIntegers devolve bigint
const grande = 9007199254740993n; // 2^53 + 1
const normal = new Database(":memory:");
console.log("normal      :", j(normal.query("SELECT ?1 AS x").get(grande)));
const seguro = new Database(":memory:", { safeIntegers: true });
console.log("safeIntegers:", j(seguro.query("SELECT ?1 AS x, 5 AS pequeno").get(grande)));
console.log("por statement:", j(normal.prepare("SELECT 9007199254740993 AS x").safeIntegers(true).get()));
try {
    seguro.query("SELECT ?1").get(2n ** 70n);
} catch (e: any) {
    console.log("bigint fora de 64 bits:", e.name, "-", e.message);
}

// 4. Strict mode: na 1.4.0 as chaves levam o nome SEM prefixo e um parâmetro em falta dá erro
const estrito = new Database(":memory:", { strict: true });
console.log("strict, chave sem prefixo:", j(estrito.query("SELECT $mensagem AS m").get({ mensagem: "olá" })));
try {
    estrito.query("SELECT $mensagem AS m").get({ mesagem: "typo" });
} catch (e: any) {
    console.log("strict, typo:", e.name, "-", e.message);
}
console.log("sem strict, typo:", j(db.query("SELECT $mensagem AS m").get({ $mesagem: "typo" })));

// 5. Tipos de JavaScript e de SQLite: Date, boolean, BLOB, JSON
db.run("CREATE TABLE tipos (d TEXT, b INTEGER, bin BLOB, js TEXT)");
const agora = new Date("2026-11-22T10:30:00Z");
try {
    db.run("INSERT INTO tipos (d) VALUES (?)", [agora as any]);
} catch (e: any) {
    console.log("Date direto:", e.name, "-", e.message);
}
db.run("INSERT INTO tipos VALUES (?, ?, ?, ?)", [agora.toISOString(), true as any, new Uint8Array([1, 2, 3]), JSON.stringify({ a: 1 })]);
const linha: any = db.query("SELECT d, b, bin, js, typeof(b) AS tb FROM tipos").get();
console.log("lido:", j({ d: linha.d, b: linha.b, tb: linha.tb, bin: Array.from(linha.bin), isUint8: linha.bin instanceof Uint8Array, js: JSON.parse(linha.js) }));

// 6. serialize e deserialize
const bytes = db.serialize();
console.log("serialize:", bytes.constructor.name, bytes.byteLength > 0);
const copia = Database.deserialize(bytes);
console.log("cópia tem", j(copia.query("SELECT count(*) AS n FROM produtos").get()), "produtos");
copia.run("DELETE FROM produtos");
console.log("original mantém", j(db.query("SELECT count(*) AS n FROM produtos").get()));

// 7. import com atributo de tipo, usando um ficheiro criado agora
const ficheiro = join(tmpdir(), "est-bn05-import.sqlite");
rmSync(ficheiro, { force: true });
const f = new Database(ficheiro);
f.exec(sqlLoja);
f.close();
const viaImport = (await import(pathToFileURL(ficheiro).href, { with: { type: "sqlite" } })).default as Database;
console.log("import type sqlite:", viaImport.constructor.name, j(viaImport.query("SELECT count(*) AS n FROM clientes").get()));
viaImport.close();
await Bun.file(ficheiro).delete();

// 8. Extensões: só confirmo o erro; sem uma DLL SQLite não executei nenhuma extensão real
try {
    db.loadExtension("nao-existe");
} catch (e: any) {
    console.log("loadExtension inexistente:", e.name, "-", e.message.trim());
}
console.log("db.function ?", typeof (db as any).function);

// 9. using fecha a ligação no fim do bloco
{
    using temp = new Database(":memory:");
    console.log("using:", j(temp.query("SELECT 1 AS um").get()));
}
