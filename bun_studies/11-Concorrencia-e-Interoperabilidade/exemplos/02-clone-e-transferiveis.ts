// structuredClone: o mesmo algoritmo que o postMessage usa
const origem = {
  data: new Date("2025-01-10"),
  mapa: new Map([["Livros", 3]]),
  conjunto: new Set([1, 2]),
  grande: 12345678901234567890n,
  nested: { a: [1, 2, { b: 3 }] },
};
const copia = structuredClone(origem);
console.log("independente:", copia.nested !== origem.nested, "| Date:", copia.data instanceof Date, "| Map:", copia.mapa.get("Livros"), "| bigint:", copia.grande);

for (const [nome, valor] of [["função", { f() {} }], ["símbolo", { s: Symbol("x") }]] as const) {
  try { structuredClone(valor); } catch (e) { console.log(`${nome}:`, (e as Error).name); }
}
class Caixa { constructor(public valor = 1) {} dobro() { return this.valor * 2; } }
const c = structuredClone(new Caixa(4));
console.log("classe perde protótipo:", c.constructor === Object, "| tem dobro:", typeof (c as any).dobro);

// Transferíveis: o buffer muda de dono em vez de ser copiado
const buf = new ArrayBuffer(8 * 1024 * 1024);
new Uint8Array(buf)[0] = 42;
const w = new Worker(new URL("./02-worker-buffer.ts", import.meta.url));
w.onmessage = (ev) => {
  console.log("worker devolveu", ev.data.byteLength, "bytes; primeiro byte =", new Uint8Array(ev.data)[0]);
  w.terminate();
};
console.log("antes de transferir:", buf.byteLength);
w.postMessage(buf, [buf]);
console.log("depois de transferir:", buf.byteLength, "| detached:", (buf as any).detached);

// Sem transferir: cópia, o original mantém-se
const b2 = new ArrayBuffer(16);
const copiado = structuredClone(b2);
console.log("clone sem transferir:", b2.byteLength, copiado.byteLength);
const movido = structuredClone(b2, { transfer: [b2] });
console.log("clone com transfer:", b2.byteLength, movido.byteLength);
