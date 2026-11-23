const url = new URL("./05-worker-erros.ts", import.meta.url);
// o message traz o excerto de código; ficamos só com a linha "error: ..."
const resumo = (m: string) => m.split("\n").find((l) => l.startsWith("error:")) ?? m.split("\n")[0];

// 1. Exceção não tratada no worker -> evento "error" no principal
const w1 = new Worker(url);
w1.addEventListener("error", (ev) => {
  console.log("1.", resumo(ev.message), "| ErrorEvent?", ev instanceof ErrorEvent);
});
w1.addEventListener("message", (ev) => console.log("1. o worker ainda responde:", ev.data));
w1.addEventListener("close", (ev) => console.log("1. close, code =", (ev as CloseEvent).code, "(o erro não tratado mata o worker)"));
w1.postMessage("lançar");
await Bun.sleep(300);
w1.postMessage("ping");
await Bun.sleep(200);

// 2. Mensagem não clonável -> DataCloneError no emissor (aqui, no principal)
try { w1.postMessage({ f: () => 1 }); } catch (e) { console.log("2.", (e as Error).name); }

// 3. Promessa rejeitada no worker
const w2 = new Worker(url);
w2.onerror = (ev) => console.log("3. rejeição no worker:", resumo(ev.message));
w2.postMessage("rejeitar");
await Bun.sleep(300);

// 4. terminate: o worker pára já, mesmo em ciclo infinito; evento "close"
const w3 = new Worker(url);
w3.addEventListener("close", (ev) => console.log("4. close, code =", (ev as CloseEvent).code));
w3.postMessage("ciclo-infinito");
await Bun.sleep(200);
const t0 = performance.now();
w3.terminate();
console.log("4. terminate chamado; demorou", Math.round(performance.now() - t0), "ms");
await Bun.sleep(200);

// 5. worker que acaba sozinho com process.exit(3)
const w4 = new Worker(url);
w4.addEventListener("close", (ev) => console.log("5. close após process.exit(3), code =", (ev as CloseEvent).code));
w4.postMessage("sair");
await Bun.sleep(300);

// 6. Ficheiro inexistente
const w5 = new Worker(new URL("./nao-existe.ts", import.meta.url));
w5.onerror = (ev) => console.log("6. ficheiro inexistente:", ev.message.slice(0, 40));
await Bun.sleep(300);
w5.terminate();
w1.terminate();
w2.terminate();
console.log("fim");
