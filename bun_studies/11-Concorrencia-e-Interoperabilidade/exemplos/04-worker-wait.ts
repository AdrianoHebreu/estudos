declare var self: Worker;
self.onmessage = (ev: MessageEvent<SharedArrayBuffer>) => {
  const flag = new Int32Array(ev.data);
  self.postMessage("a dormir no Atomics.wait");
  const t0 = performance.now();
  const r = Atomics.wait(flag, 0, 0); // bloqueia enquanto flag[0] == 0
  self.postMessage(`acordou (${r}) ao fim de ${Math.round(performance.now() - t0)} ms`);
};
