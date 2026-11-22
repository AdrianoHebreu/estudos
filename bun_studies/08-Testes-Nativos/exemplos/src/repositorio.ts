// Repositório sobre bun:sqlite. Recebe a base por parâmetro: nos testes é uma base em memória.
import { Database } from "bun:sqlite";
import type { NovaEncomenda } from "./encomenda.ts";

export type Produto = { id: number; nome: string; categoria_id: number; preco: number; stock: number };

export class StockInsuficiente extends Error {
  constructor(public produto_id: number, public pedido: number, public disponivel: number) {
    super(`stock insuficiente no produto ${produto_id}: pedido ${pedido}, disponível ${disponivel}`);
    this.name = "StockInsuficiente";
  }
}

// Cria uma base em memória com os dados do loja.sql do módulo 00.
export async function abrirLojaEmMemoria(): Promise<Database> {
  const sql = await Bun.file(`${import.meta.dir}/../../../00-Introducao/dados/loja.sql`).text();
  const db = new Database(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(sql);
  return db;
}

export class RepositorioLoja {
  constructor(private db: Database) {}

  produto(id: number): Produto | null {
    return this.db.query<Produto, [number]>("SELECT * FROM produtos WHERE id = ?").get(id);
  }

  produtos(categoria_id?: number): Produto[] {
    return categoria_id === undefined
      ? this.db.query<Produto, []>("SELECT * FROM produtos ORDER BY id").all()
      : this.db.query<Produto, [number]>("SELECT * FROM produtos WHERE categoria_id = ? ORDER BY id").all(categoria_id);
  }

  // Tudo ou nada: se faltar stock numa linha, a transação desfaz as outras.
  criarEncomenda(nova: NovaEncomenda, data: string): number {
    const tx = this.db.transaction(() => {
      const r = this.db
        .query("INSERT INTO encomendas (cliente_id, data_encomenda, estado) VALUES (?, ?, 'pendente')")
        .run(nova.cliente_id, data);
      const id = Number(r.lastInsertRowid);
      for (const l of nova.linhas) {
        const p = this.produto(l.produto_id);
        if (!p) throw new Error(`produto ${l.produto_id} não existe`);
        if (p.stock < l.quantidade) throw new StockInsuficiente(p.id, l.quantidade, p.stock);
        this.db.query("UPDATE produtos SET stock = stock - ? WHERE id = ?").run(l.quantidade, p.id);
        this.db
          .query("INSERT INTO linhas_encomenda (encomenda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)")
          .run(id, p.id, l.quantidade, p.preco);
      }
      return id;
    });
    return tx();
  }

  linhas(encomenda_id: number) {
    return this.db
      .query<{ quantidade: number; preco_unitario: number }, [number]>(
        "SELECT quantidade, preco_unitario FROM linhas_encomenda WHERE encomenda_id = ? ORDER BY id",
      )
      .all(encomenda_id);
  }
}
