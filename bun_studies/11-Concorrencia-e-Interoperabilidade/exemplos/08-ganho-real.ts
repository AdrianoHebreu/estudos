// Contar primos num intervalo: sequencial vs N workers. Mede-se várias vezes e usa-se a mediana
// (a máquina é partilhada, uma só medição engana).
const LIMITE = 6_000_000;
const REPETICOES = 5;

function contarPrimos(de: number, ate: number): number {
  let n = 0;
  for (let i = Math.max(2, de); i < ate; i++) {
    let primo = true;
    for (let d = 2; d * d <= i; d++) if (i % d === 0) { primo = false; break; }
    if (primo) n++;
  }
  return n;
}

const mediana = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

async function sequencial() {
  const t0 = performance.now();
  const r = contarPrimos(0, LIMITE);
  return { r, ms: performance.now() - t0 };
}

// Os workers já estão criados e "quentes": só se mede o cálculo + mensagens
async function comWorkers(pool: Worker[]) {
  const t0 = performance.now();
  // fatias com custo parecido: o custo cresce com o valor, por isso intercalam-se blocos pequenos
  const BLOCO = 50_000;
  const blocos: [number, number][] = [];
  for (let a = 0; a < LIMITE; a += BLOCO) blocos.push([a, Math.min(a + BLOCO, LIMITE)]);
  let proximo = 0;
  let total = 0;
  await Promise.all(pool.map((w) => new Promise<void>((ok) => {
    const pedir = () => {
      if (proximo >= blocos.length) return ok();
      w.postMessage(blocos[proximo++]);
    };
    w.onmessage = (e) => { total += e.data; pedir(); };
    pedir();
  })));
  return { r: total, ms: performance.now() - t0 };
}

function criarPool(n: number) {
  return Array.from({ length: n }, () => new Worker(new URL("./08-worker-primos.ts", import.meta.url)));
}

console.log("CPUs lógicos (navigator.hardwareConcurrency):", navigator.hardwareConcurrency);
const seq: number[] = [];
let esperado = 0;
for (let i = 0; i < REPETICOES; i++) { const x = await sequencial(); seq.push(x.ms); esperado = x.r; }
console.log(`sequencial: primos=${esperado}, mediana=${mediana(seq).toFixed(0)} ms (min ${Math.min(...seq).toFixed(0)})`);

for (const n of [1, 2, 4, 8]) {
  const pool = criarPool(n);
  await comWorkers(pool); // aquecimento (carrega o módulo em cada worker)
  const tempos: number[] = [];
  for (let i = 0; i < REPETICOES; i++) {
    const x = await comWorkers(pool);
    if (x.r !== esperado) throw new Error("resultado diferente!");
    tempos.push(x.ms);
  }
  const m = mediana(tempos);
  console.log(`${n} worker(s): mediana=${m.toFixed(0)} ms (min ${Math.min(...tempos).toFixed(0)}) | ganho vs sequencial: x${(mediana(seq) / m).toFixed(2)}`);
  pool.forEach((w) => w.terminate());
}
