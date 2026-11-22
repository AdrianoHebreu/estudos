// A loja em memória: lê o loja.sql do módulo 00 com bun:sqlite (o detalhe é do módulo 05).
import { Database } from "bun:sqlite";

export async function abrirLoja(): Promise<Database> {
  const sql = await Bun.file(`${import.meta.dir}/../../../00-Introducao/dados/loja.sql`).text();
  const db = new Database(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(sql);
  return db;
}
