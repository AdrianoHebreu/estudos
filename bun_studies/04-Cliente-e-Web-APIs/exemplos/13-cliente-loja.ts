import { iniciar } from "./servidor-loja.ts";

type Produto = { id: number; nome: string; categoriaId: number; preco: number; stock: number };

class ErroHttp extends Error {
  constructor(readonly estado: number, readonly corpo: unknown, caminho: string) {
    super(`HTTP ${estado} em ${caminho}`);
    this.name = "ErroHttp";
  }
}

// Um cliente pequeno: URL base, tempo limite, JSON automático e erros tipados
class ClienteLoja {
  constructor(private base: string, private tempoLimiteMs = 2000) {}

  async pedir<T>(caminho: string, init: RequestInit = {}): Promise<T> {
    const r = await fetch(new URL(caminho, this.base), {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(this.tempoLimiteMs),
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
    const texto = await r.text();
    const corpo = texto ? JSON.parse(texto) : null;
    if (!r.ok) throw new ErroHttp(r.status, corpo, caminho);
    return corpo as T;
  }

  produtos(filtro: { categoria?: number; max?: number } = {}) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(filtro)) if (v !== undefined) q.set(k, String(v));
    return this.pedir<Produto[]>(`/api/produtos?${q}`);
  }
  produto(id: number) { return this.pedir<Produto>(`/api/produtos/${id}`); }
  ajustarStock(id: number, stock: number) {
    return this.pedir<Produto>(`/api/produtos/${id}`, { method: "PATCH", body: JSON.stringify({ stock }) });
  }
  criarEncomenda(clienteId: number, linhas: { produtoId: number; quantidade: number }[]) {
    return this.pedir<{ id: number; estado: string }>("/api/encomendas", { method: "POST", body: JSON.stringify({ clienteId, linhas }) });
  }
}

const server = iniciar();
const loja = new ClienteLoja(server.url.origin);

// Consultas
const eletronica = await loja.produtos({ categoria: 2 });
console.log("Eletrónica:", eletronica.map(p => `${p.nome} (${p.preco.toFixed(2)} €)`));

// Vários pedidos em paralelo com Promise.all (as respostas chegam pela ordem do array)
const t0 = performance.now();
const ids = [1, 3, 5, 8];
const lote = await Promise.all(ids.map(id => loja.produto(id)));
console.log(`4 produtos em paralelo (${Math.round(performance.now() - t0)} ms):`, lote.map(p => p.nome));

// Pedidos que podem falhar: Promise.allSettled não rejeita à primeira falha
const mistura = await Promise.allSettled([loja.produto(2), loja.produto(99), loja.produto(4)]);
for (const r of mistura) {
  console.log(r.status === "fulfilled" ? `ok: ${r.value.nome}` : `falhou: ${(r.reason as ErroHttp).message} ${JSON.stringify((r.reason as ErroHttp).corpo)}`);
}

// Fluxo: ver stock, criar encomenda, ajustar stock
const alvo = await loja.produto(8);
const encomenda = await loja.criarEncomenda(7, [{ produtoId: alvo.id, quantidade: 1 }]);
console.log("encomenda criada:", encomenda);
const novo = await loja.ajustarStock(alvo.id, alvo.stock - 1);
console.log(`stock de ${novo.nome}: ${alvo.stock} -> ${novo.stock}`);

// Dinheiro: soma em cêntimos inteiros para evitar 0.1 + 0.2
const todos = await loja.produtos();
const cent = todos.reduce((s, p) => s + Math.round(p.preco * 100) * p.stock, 0);
console.log("valor total em stock:", (cent / 100).toFixed(2), "€");

// Erros tipados
try {
  await loja.criarEncomenda(1, []);
} catch (e) {
  if (e instanceof ErroHttp) console.log(e.name, e.estado, e.corpo);
}
try {
  await new ClienteLoja(server.url.origin, 100).pedir("/api/lento?ms=1000");
} catch (e: any) {
  console.log("tempo limite:", e.name);
}

await server.stop(true);
