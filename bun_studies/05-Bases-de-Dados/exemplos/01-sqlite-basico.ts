import { Database } from "bun:sqlite";
import { tmpdir } from "node:os";
import { join } from "node:path";

const j = (x: unknown) => JSON.stringify(x);

// 1. Base em memória e carregar o loja.sql com db.exec (vários comandos de uma vez)
const db = new Database(":memory:");
const sqlLoja = await Bun.file(join(import.meta.dir, "../../00-Introducao/dados/loja.sql")).text();
db.exec(sqlLoja);
console.log("SQLite", j(db.query("SELECT sqlite_version() AS v").get()));
console.log("tabelas:", db.query("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").values().flat().join(", "));

// 2. query() compila e põe em cache; all, get e values
const porCategoria = db.query("SELECT id, nome, preco FROM produtos WHERE categoria_id = ?1 ORDER BY id");
console.log("all   :", j(porCategoria.all(2)));
console.log("get   :", j(porCategoria.get(1)));
console.log("values:", j(porCategoria.values(3)));
console.log("get sem linhas:", db.query("SELECT * FROM produtos WHERE id = -1").get());

// 3. Parâmetros nomeados: na 1.4.0 a chave leva o prefixo ($, : ou @)
const nomeado = db.query("SELECT nome FROM clientes WHERE cidade = $cidade AND data_registo >= :desde");
console.log("nomeados:", j(nomeado.all({ $cidade: "Lisboa", ":desde": "2024-03-01" })));
console.log("sem prefixo:", j(nomeado.all({ cidade: "Lisboa", desde: "2024-03-01" })));

// 4. run() devolve changes e lastInsertRowid
const inserir = db.query("INSERT INTO categorias (id, nome) VALUES ($id, $nome)");
console.log("insert:", j(inserir.run({ $id: 4, $nome: "Jardim" })));
console.log("update:", j(db.run("UPDATE produtos SET stock = stock + ? WHERE categoria_id = ?", [5, 3])));

// 5. toString mostra o SQL expandido; iterate lê linha a linha
console.log("toString:", porCategoria.toString());
for (const linha of db.prepare("SELECT id, nome FROM categorias ORDER BY id").iterate()) {
    console.log("linha:", j(linha));
}

// 6. Base em ficheiro, modo só de leitura e create: false
const ficheiro = join(tmpdir(), "est-bn05-demo.sqlite");
const disco = new Database(ficheiro);
disco.run("CREATE TABLE IF NOT EXISTS visitas (n INTEGER)");
disco.run("INSERT INTO visitas VALUES (1)");
disco.close();
const leitura = new Database(ficheiro, { readonly: true });
console.log("readonly lê:", j(leitura.query("SELECT count(*) AS n FROM visitas").get()));
try {
    leitura.run("INSERT INTO visitas VALUES (2)");
} catch (e: any) {
    console.log("readonly escreve:", e.name, e.code, "-", e.message);
}
leitura.close();
await Bun.file(ficheiro).delete();
try {
    new Database(ficheiro, { readwrite: true, create: false });
} catch (e: any) {
    console.log("ficheiro em falta:", e.name, e.code, "-", e.message);
}
