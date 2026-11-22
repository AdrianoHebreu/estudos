// A loja em memória (bun:sqlite lê o loja.sql do módulo 00; o detalhe é do módulo 05).
import { Database } from "bun:sqlite";

export async function abrirLoja(): Promise<Database> {
  const sql = await Bun.file(`${import.meta.dir}/../../00-Introducao/dados/loja.sql`).text();
  const db = new Database(":memory:");
  db.exec(sql);
  return db;
}
