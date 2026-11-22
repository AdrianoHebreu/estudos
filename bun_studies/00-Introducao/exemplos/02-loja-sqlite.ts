// Mostra os dados da loja com o SQLite embutido (bun:sqlite).
// Só para ver os dados: o módulo 05 ensina bun:sqlite a fundo.
import { Database } from "bun:sqlite";

const sql = await Bun.file(`${import.meta.dir}/../dados/loja.sql`).text();

const db = new Database(":memory:");
db.exec(sql);

for (const tabela of ["categorias", "clientes", "produtos", "encomendas", "linhas_encomenda"]) {
  const { n } = db.query(`SELECT COUNT(*) AS n FROM ${tabela}`).get() as { n: number };
  console.log(`${tabela}: ${n} linhas`);
}

console.log("\nProdutos por categoria:");
console.table(
  db
    .query(
      `SELECT p.id, p.nome AS produto, c.nome AS categoria, p.preco, p.stock
       FROM produtos p JOIN categorias c ON c.id = p.categoria_id
       ORDER BY p.id LIMIT 5`,
    )
    .all(),
);

const total = db
  .query(
    `SELECT e.id, c.nome AS cliente, e.estado,
            SUM(l.quantidade * l.preco_unitario) AS total
     FROM encomendas e
     JOIN clientes c ON c.id = e.cliente_id
     JOIN linhas_encomenda l ON l.encomenda_id = e.id
     WHERE e.id IN (1, 3, 12)
     GROUP BY e.id ORDER BY e.id`,
  )
  .all();
console.log("\nTotais de três encomendas:");
console.table(total);
db.close();
