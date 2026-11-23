declare var self: Worker;
self.onmessage = (ev: MessageEvent) => {
  const a = new Int32Array(ev.data.sab);
  const b = new Int32Array(ev.data.naoAtomico);
  for (let i = 0; i < ev.data.n; i++) {
    Atomics.add(a, 0, 1);
    b[0]++; // leitura-modificação-escrita sem proteção
  }
  self.postMessage("ok");
};
