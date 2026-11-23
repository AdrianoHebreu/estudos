// Atomics.wait / notify: o worker dorme sem gastar CPU até a thread principal o acordar
const sab = new SharedArrayBuffer(8);
const flag = new Int32Array(sab);
const w = new Worker(new URL("./04-worker-wait.ts", import.meta.url));
w.onmessage = (ev) => {
  console.log("principal:", ev.data);
  if (ev.data.startsWith("acordou")) w.terminate();
};
w.postMessage(sab);
setTimeout(() => {
  console.log("principal: a acordar o worker");
  Atomics.store(flag, 0, 1);
  console.log("acordados:", Atomics.notify(flag, 0));
}, 200);

// waitAsync não bloqueia: devolve uma promessa
console.log("Atomics.waitAsync existe?", typeof Atomics.waitAsync);
const r = Atomics.waitAsync(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
console.log("waitAsync async:", r.async, "->", await r.value);
// wait na thread principal
try {
  console.log("wait no principal:", Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20));
} catch (e) { console.log("wait no principal falhou:", (e as Error).message); }
