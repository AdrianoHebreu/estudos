declare var self: Worker; // dá o tipo certo ao self dentro de um worker

console.log("isMainThread (worker):", Bun.isMainThread, "| threadId:", (await import("node:worker_threads")).threadId);

self.onmessage = (ev: MessageEvent) => {
  if (ev.data === "terminar") {
    self.postMessage({ fim: true });
    return;
  }
  const { nome, n } = ev.data;
  self.postMessage({ ola: `olá, ${nome}`, quadrado: n * n });
};
