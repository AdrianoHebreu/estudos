// Macros: correm durante a transpilação (bun run, bun build ou bun test). O valor devolvido é escrito no código.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function compiladoEm(): string {
  return new Date().toISOString();
}

// lê o loja.sql no momento da build e devolve só o que o programa precisa
export function tabelasDaLoja(): string[] {
  const sql = readFileSync(join(import.meta.dir, "../../../00-Introducao/dados/loja.sql"), "utf8");
  return [...sql.matchAll(/CREATE TABLE (\w+)/gi)].map((m) => m[1]);
}

export async function multiplicar(a: number, b: number): Promise<number> {
  return a * b; // as macros podem ser assíncronas
}

export function devolveFuncao() {
  return () => 1; // não é serializável
}
