// Dados da loja para o relatório de receita por categoria.
// Colunas em arrays tipados (estrutura de arrays): barato de partilhar com workers.
import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";

export type Colunas = { categoria: Int32Array; quantidade: Int32Array; precoCent: Int32Array };

const SQL = new URL("../../../00-Introducao/dados/loja.sql", import.meta.url);

/** As 26 linhas reais da loja (encomendas canceladas excluídas), preço em cêntimos. */
export function linhasReais() {
  const db = new Database(":memory:");
  db.exec(readFileSync(SQL, "utf8"));
  const linhas = db.query(`
    SELECT p.categoria_id AS categoria, l.quantidade AS quantidade, CAST(ROUND(l.preco_unitario * 100) AS INTEGER) AS precoCent
    FROM linhas_encomenda l
    JOIN encomendas e ON e.id = l.encomenda_id
    JOIN produtos p ON p.id = l.produto_id
    WHERE e.estado <> 'cancelada'
    ORDER BY l.id`).all() as { categoria: number; quantidade: number; precoCent: number }[];
  const nomes = Object.fromEntries((db.query("SELECT id, nome FROM categorias").all() as any[]).map((c) => [c.id, c.nome]));
  db.close();
  return { linhas, nomes: nomes as Record<number, string> };
}

/** Gera n linhas repetindo as reais com um gerador pseudoaleatório fixo (a mesma semente dá sempre o mesmo). */
export function gerar(n: number, partilhado = false): Colunas {
  const { linhas } = linhasReais();
  const alocar = () => new Int32Array(partilhado ? new SharedArrayBuffer(n * 4) : new ArrayBuffer(n * 4));
  const c: Colunas = { categoria: alocar(), quantidade: alocar(), precoCent: alocar() };
  let s = 123456789; // xorshift32
  for (let i = 0; i < n; i++) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const base = linhas[(s >>> 0) % linhas.length];
    c.categoria[i] = base.categoria;
    c.quantidade[i] = 1 + ((s >>> 8) % 6);
    c.precoCent[i] = base.precoCent;
  }
  return c;
}
