// Worker nativo do Bun: o ficheiro do worker é um módulo normal.
const w = new Worker(new URL("./01-worker-eco.ts", import.meta.url));

w.onmessage = (ev: MessageEvent) => {
  console.log("principal recebeu:", ev.data);
  if (ev.data.fim) w.terminate();
};
w.onerror = (ev) => console.log("erro no worker:", ev.message);

w.postMessage({ nome: "Ana", n: 5 });
w.postMessage({ nome: "Bruno", n: 10 });
w.postMessage("terminar");

console.log("isMainThread (principal):", Bun.isMainThread);
