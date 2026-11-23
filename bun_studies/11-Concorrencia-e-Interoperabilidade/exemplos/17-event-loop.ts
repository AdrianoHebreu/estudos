// A ordem de execução do event loop no Bun
import { nextTick } from "node:process";
import { setImmediate as setImmediatePromise } from "node:timers/promises";

console.log("1 síncrono (início)");
setTimeout(() => console.log("9 setTimeout 0"), 0);
setTimeout(() => console.log("10 setTimeout 1"), 1);
setImmediate(() => console.log("8 setImmediate"));
queueMicrotask(() => console.log("5 queueMicrotask"));
Promise.resolve().then(() => console.log("6 promise.then"));
process.nextTick(() => console.log("4 process.nextTick"));
(async () => { console.log("2 async (parte síncrona)"); await null; console.log("7 async depois do await"); })();
console.log("3 síncrono (fim)");

await setImmediatePromise(); // deixa tudo isto correr
await Bun.sleep(20);

console.log("--- dentro de um callback de I/O (fs) ---");
const fs = await import("node:fs");
await new Promise<void>((ok) => {
  fs.readFile(import.meta.path, () => {
    setTimeout(() => console.log("  b setTimeout 0"), 0);
    setImmediate(() => { console.log("  a setImmediate"); ok(); });
    process.nextTick(() => console.log("  1 nextTick"));
    queueMicrotask(() => console.log("  2 microtask"));
  });
});
await Bun.sleep(20);

console.log("--- nextTick vs microtask: quem corre primeiro dentro de uma microtask? ---");
await new Promise<void>((ok) => {
  Promise.resolve().then(() => {
    queueMicrotask(() => console.log("  microtask aninhada"));
    process.nextTick(() => console.log("  nextTick aninhado"));
    console.log("  dentro da microtask");
    setTimeout(ok, 5);
  });
});

console.log("--- ciclo de microtasks bloqueia os timers ---");
let n = 0;
const t0 = performance.now();
setTimeout(() => console.log(`  timer só correu depois de ${n} microtasks (${Math.round(performance.now() - t0)} ms)`), 0);
const girar = () => { if (++n < 200_000) queueMicrotask(girar); };
girar();
await Bun.sleep(100);
