import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const j = (x: unknown) => JSON.stringify(x);
const db = new Database(":memory:");
db.exec(await Bun.file(join(import.meta.dir, "../../00-Introducao/dados/loja.sql")).text());

function erro(titulo: string, f: () => unknown) {
    try {
        f();
        console.log(titulo, "-> sem erro");
    } catch (e: any) {
        console.log(titulo, "->", e.name, e.code, e.errno, "-", e.message);
    }
}

// 1. Erros reais
erro("tabela inexistente  ", () => db.query("SELECT * FROM clientess").all());
erro("coluna inexistente  ", () => db.query("SELECT salario FROM clientes").all());
erro("sintaxe             ", () => db.query("SELEC 1").all());
erro("chave primária      ", () => db.run("INSERT INTO categorias (id, nome) VALUES (1, 'Repetida')"));
erro("NOT NULL            ", () => db.run("INSERT INTO categorias (id, nome) VALUES (9, NULL)"));

// 2. As chaves estrangeiras vêm desligadas: liga-as em cada ligação
console.log("foreign_keys:", j(db.query("PRAGMA foreign_keys").get()));
erro("FK desligada        ", () => db.run("INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (11, 'Fantasma', 99, 1, 1)"));
db.run("DELETE FROM produtos WHERE id = 11");
db.run("PRAGMA foreign_keys = ON");
erro("FK ligada           ", () => db.run("INSERT INTO produtos (id, nome, categoria_id, preco, stock) VALUES (11, 'Fantasma', 99, 1, 1)"));
erro("apagar com filhos   ", () => db.run("DELETE FROM categorias WHERE id = 1"));

// 3. Transações: db.transaction devolve uma função que faz BEGIN, COMMIT ou ROLLBACK
const abate = db.prepare("UPDATE produtos SET stock = stock - $qtd WHERE id = $id AND stock >= $qtd");
const novaLinha = db.prepare("INSERT INTO linhas_encomenda (encomenda_id, produto_id, quantidade, preco_unitario) VALUES ($enc, $prod, $qtd, $preco)");
const stock = (id: number) => (db.query("SELECT stock FROM produtos WHERE id = ?").get(id) as { stock: number }).stock;

const vender = db.transaction((enc: number, itens: { id: number; qtd: number; preco: number }[]) => {
    for (const it of itens) {
        const r = abate.run({ $id: it.id, $qtd: it.qtd });
        if (r.changes === 0) throw new Error(`stock insuficiente do produto ${it.id}`);
        novaLinha.run({ $enc: enc, $prod: it.id, $qtd: it.qtd, $preco: it.preco });
    }
    return itens.length;
});

console.log("antes: produto 1 =", stock(1), "produto 6 =", stock(6));
console.log("venda ok, linhas:", vender(12, [{ id: 1, qtd: 2, preco: 12.9 }]));
try {
    vender(12, [{ id: 1, qtd: 5, preco: 12.9 }, { id: 6, qtd: 1, preco: 79 }]); // o teclado está esgotado
} catch (e: any) {
    console.log("venda falhou:", e.message);
}
console.log("depois: produto 1 =", stock(1), "(o abate de 5 foi desfeito) produto 6 =", stock(6));
console.log("linhas:", j(db.query("SELECT count(*) AS n FROM linhas_encomenda").get()), "inTransaction:", db.inTransaction);

// 4. Transações aninhadas viram savepoints
const interna = db.transaction(() => {
    db.run("INSERT INTO categorias (id, nome) VALUES (50, 'Interna')");
    throw new Error("falha na interna");
});
const externa = db.transaction(() => {
    db.run("INSERT INTO categorias (id, nome) VALUES (40, 'Externa')");
    try {
        interna();
    } catch {}
});
externa();
console.log("aninhadas:", j(db.query("SELECT id, nome FROM categorias WHERE id >= 40").all()));

// 5. Variantes do BEGIN
console.log("variantes:", typeof vender.deferred, typeof vender.immediate, typeof vender.exclusive);

// 6. async dentro de transação não funciona: o commit acontece no primeiro await
const assinc = db.transaction(async () => {
    db.run("INSERT INTO categorias (id, nome) VALUES (60, 'Antes do await')");
    await Bun.sleep(1);
    db.run("INSERT INTO categorias (id, nome) VALUES (61, 'Depois do await')");
    throw new Error("falha depois do await");
});
await assinc().catch((e: Error) => console.log("async falhou:", e.message));
console.log("async deixou:", j(db.query("SELECT id, nome FROM categorias WHERE id >= 60 ORDER BY id").all()));

// 7. PRAGMAs e WAL num ficheiro
const ficheiro = join(tmpdir(), "est-bn05-wal.sqlite");
const disco = new Database(ficheiro);
console.log("journal por omissão:", j(disco.query("PRAGMA journal_mode").get()));
console.log("WAL:", j(disco.query("PRAGMA journal_mode = WAL").get()));
disco.run("PRAGMA synchronous = NORMAL");
disco.run("CREATE TABLE t (n INTEGER)");
disco.run("INSERT INTO t VALUES (1)");
console.log("ficheiros durante:", existsSync(ficheiro + "-wal"), existsSync(ficheiro + "-shm"));
disco.run("PRAGMA user_version = 3");
console.log("synchronous:", j(disco.query("PRAGMA synchronous").get()), "user_version:", j(disco.query("PRAGMA user_version").get()));
console.log("integrity_check:", j(disco.query("PRAGMA integrity_check").get()));
disco.close();
console.log("ficheiros depois de close:", existsSync(ficheiro + "-wal"), existsSync(ficheiro + "-shm"));
await Bun.file(ficheiro).delete();
for (const s of ["-wal", "-shm"]) if (existsSync(ficheiro + s)) await Bun.file(ficheiro + s).delete();
