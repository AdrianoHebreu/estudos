declare var self: Worker;
self.onmessage = (ev: MessageEvent<ArrayBuffer>) => {
  const v = new Uint8Array(ev.data);
  v[0] += 1; // 42 -> 43
  self.postMessage(ev.data, [ev.data]); // devolve sem copiar
};
