// bun:ffi cc: compila C em runtime com o TinyCC EMBUTIDO no Bun (não precisa de gcc nem de cl.exe)
import { cc, ptr } from "bun:ffi";

const { symbols, close } = cc({
  source: new URL("./cc/loja.c", import.meta.url).pathname.replace(/^\//, ""),
  symbols: {
    receita_cent: { args: ["ptr", "ptr", "i32"], returns: "i64" },
    contar_primos: { args: ["i32"], returns: "i32" },
    saudacao: { args: [], returns: "cstring" },
  },
});

// linhas da encomenda 12 da loja: (quantidade, preço em cêntimos)
const q = new Int32Array([2, 3, 1]);
const p = new Int32Array([4990, 1290, 650]);
console.log("receita (cêntimos):", symbols.receita_cent(ptr(q), ptr(p), q.length), "-> 145,00 EUR (devolve bigint)");
console.log("saudacao():", symbols.saudacao());

// C contra JavaScript no mesmo cálculo (mediana de 5 medições)
function jsPrimos(limite: number) {
  let n = 0;
  for (let i = 2; i < limite; i++) { let ok = true; for (let d = 2; d * d <= i; d++) if (i % d === 0) { ok = false; break; } if (ok) n++; }
  return n;
}
const medir = (f: () => number) => {
  const t: number[] = []; let r = 0;
  for (let i = 0; i < 5; i++) { const a = performance.now(); r = f(); t.push(performance.now() - a); }
  return { r, ms: t.sort((a, b) => a - b)[2] };
};
const c = medir(() => symbols.contar_primos(2_000_000));
const j = medir(() => jsPrimos(2_000_000));
console.log(`C (TinyCC): ${c.r} primos em ${c.ms.toFixed(0)} ms | JS: ${j.r} primos em ${j.ms.toFixed(0)} ms`);
close();
