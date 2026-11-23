// Relatório de receita por categoria: sequencial vs Workers.
import { gerar, linhasReais } from "./dados.ts";
import { somarIntervalo } from "./calculo.ts";

const euros = (cent: number) => (cent / 100).toFixed(2).replace(".", ",") + " EUR";
const mediana = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const REPETICOES = 5;

// 1. As 26 linhas reais: o resultado de referência, calculado em SQL
const { linhas, nomes } = linhasReais();
const real = new Float64Array(4);
for (const l of linhas) real[l.categoria] += Math.round(Math.round(l.quantidade * l.precoCent * (l.quantidade >= 5 ? 0.95 : 1)) * 1.23);
console.log(`Linhas reais (sem encomendas canceladas): ${linhas.length}`);
for (const id of [1, 2, 3]) console.log(`  ${nomes[id].padEnd(11)} ${euros(real[id])}`);

// As 25 linhas reais: o sequencial demora microssegundos; um worker novo demora milissegundos só a arrancar
{
  const c = { categoria: Int32Array.from(linhas, (l) => l.categoria), quantidade: Int32Array.from(linhas, (l) => l.quantidade), precoCent: Int32Array.from(linhas, (l) => l.precoCent) };
  const t0 = performance.now();
  somarIntervalo(c.categoria, c.quantidade, c.precoCent, 0, linhas.length, 0);
  const seq = performance.now() - t0;
  const t1 = performance.now();
  const w = new Worker(new URL("./worker.ts", import.meta.url));
  await new Promise<void>((ok) => { w.onmessage = () => ok(); w.postMessage({ tipo: "colunas", cat: c.categoria, qtd: c.quantidade, preco: c.precoCent }); });
  const viaWorker = performance.now() - t1;
  w.terminate();
  console.log(`25 linhas: sequencial ${(seq * 1000).toFixed(0)} microssegundos | só arrancar um worker ${viaWorker.toFixed(1)} ms`);
}

// 2. Conjunto grande: N linhas em memória partilhada
const N = Number(process.argv[2] ?? 2_000_000);
const NW = Number(process.argv[3] ?? 4);
const CUSTO = Number(process.argv[4] ?? 200);
const dados = gerar(N, true);
console.log(`\nConjunto sintético: ${N.toLocaleString("pt-PT")} linhas, custo por linha = ${CUSTO}, workers = ${NW}`);

function sequencial() {
  const t0 = performance.now();
  const soma = somarIntervalo(dados.categoria, dados.quantidade, dados.precoCent, 0, N, CUSTO);
  return { soma, ms: performance.now() - t0 };
}

const tArranque = performance.now();
const pool = Array.from({ length: NW }, () => new Worker(new URL("./worker.ts", import.meta.url)));
await Promise.all(pool.map((w) => new Promise<void>((ok) => {
  w.onmessage = () => ok();
  w.postMessage({ tipo: "colunas", cat: dados.categoria.buffer, qtd: dados.quantidade.buffer, preco: dados.precoCent.buffer });
})));

async function paralelo() {
  const t0 = performance.now();
  const parte = Math.ceil(N / NW);
  const parciais = await Promise.all(pool.map((w, i) => new Promise<Float64Array>((ok) => {
    w.onmessage = (e) => ok(e.data.soma);
    w.postMessage({ tipo: "somar", de: i * parte, ate: Math.min(N, (i + 1) * parte), custo: CUSTO });
  })));
  const soma = new Float64Array(4);
  for (const p of parciais) for (let c = 0; c < 4; c++) soma[c] += p[c];
  return { soma, ms: performance.now() - t0 };
}

// Variante: sem memória partilhada, a fatia é copiada para cada worker (postMessage)
async function paraleloComCopia() {
  const t0 = performance.now();
  const parte = Math.ceil(N / NW);
  const parciais = await Promise.all(pool.map((w, i) => new Promise<Float64Array>((ok) => {
    const de = i * parte, ate = Math.min(N, (i + 1) * parte);
    w.onmessage = (e) => ok(e.data.soma);
    w.postMessage({
      tipo: "somar-copia", custo: CUSTO,
      cat: dados.categoria.slice(de, ate), qtd: dados.quantidade.slice(de, ate), preco: dados.precoCent.slice(de, ate),
    });
  })));
  const soma = new Float64Array(4);
  for (const p of parciais) for (let c = 0; c < 4; c++) soma[c] += p[c];
  return { soma, ms: performance.now() - t0 };
}

console.log(`arranque do pool de ${NW} workers (criar + receber as colunas): ${(performance.now() - tArranque).toFixed(0)} ms`);

const ts: number[] = [], tp: number[] = [], tc: number[] = [];
let a!: Float64Array, b!: Float64Array;
await paralelo(); await paraleloComCopia(); // aquecimento
for (let i = 0; i < REPETICOES; i++) {
  const s = sequencial(); ts.push(s.ms); a = s.soma;
  const p = await paralelo(); tp.push(p.ms); b = p.soma;
  const c = await paraleloComCopia(); tc.push(c.ms);
}
const igual = [1, 2, 3].every((c) => a[c] === b[c]);
for (const id of [1, 2, 3]) console.log(`  ${nomes[id].padEnd(11)} ${euros(a[id])}`);
console.log(`resultados iguais: ${igual}`);
console.log(`sequencial: ${mediana(ts).toFixed(0)} ms | ${NW} workers: ${mediana(tp).toFixed(0)} ms | ganho x${(mediana(ts) / mediana(tp)).toFixed(2)}`);
console.log(`${NW} workers com cópia das fatias: ${mediana(tc).toFixed(0)} ms | ganho x${(mediana(ts) / mediana(tc)).toFixed(2)}`);
pool.forEach((w) => w.terminate());
