// SharedArrayBuffer + Atomics: memória partilhada entre threads
const N_WORKERS = 4;
const POR_WORKER = 100_000;
const sab = new SharedArrayBuffer(8);
const contador = new Int32Array(sab); // [0] = contador, [1] = sem sincronização (para comparar)

const naoAtomico = new Int32Array(new SharedArrayBuffer(4));
let terminados = 0;
const workers: Worker[] = [];
for (let i = 0; i < N_WORKERS; i++) {
  const w = new Worker(new URL("./03-worker-atomics.ts", import.meta.url));
  workers.push(w);
  w.onmessage = () => {
    if (++terminados === N_WORKERS) {
      console.log("esperado:", N_WORKERS * POR_WORKER);
      console.log("com Atomics.add:", Atomics.load(contador, 0));
      console.log("com ++ normal:  ", naoAtomico[0], "(perde incrementos)");
      workers.forEach((x) => x.terminate());
    }
  };
  w.postMessage({ sab, naoAtomico: naoAtomico.buffer, n: POR_WORKER });
}
