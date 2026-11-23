// Opções do construtor Worker: name, smol, preload, env, argv, workerData, ref/unref
const w = new Worker(new URL("./06-worker-info.ts", import.meta.url), {
  name: "contador-de-linhas",
  smol: true,                       // menos memória, mais GC (opção específica do Bun)
  preload: [new URL("./06-preload.ts", import.meta.url).href], // corre antes do módulo do worker
  env: { MODO: "estudo" },          // se omitido, herda process.env
  argv: ["--extra", "1"],
  // @ts-ignore workerData é do node:worker_threads; no Worker web não é tipado
  workerData: { limite: 3 },
});
w.onmessage = (ev) => {
  console.log(ev.data);
  w.terminate();
};
