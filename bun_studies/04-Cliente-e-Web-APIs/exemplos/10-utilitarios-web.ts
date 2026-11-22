// Globais Web que não precisam de importação (sem rede)

// structuredClone: cópia profunda (Date, Map, Set, ciclos), ao contrário de JSON.parse(JSON.stringify())
const encomenda = {
  id: 8,
  data: new Date("2025-04-15"),
  linhas: new Map([[1, { produtoId: 1, quantidade: 1 }]]),
  etiquetas: new Set(["pendente"]),
  total: 98.7,
  eu: null as any,
};
encomenda.eu = encomenda; // referência circular
const copia = structuredClone(encomenda);
console.log(copia.data instanceof Date, copia.linhas instanceof Map, copia.eu === copia, copia !== encomenda);
try { structuredClone({ f() {} }); } catch (e: any) { console.log("funções não clonam ->", e.name); }
try { JSON.stringify(encomenda); } catch (e: any) { console.log("JSON.stringify ->", e.name); }

// crypto.randomUUID e getRandomValues
const id = crypto.randomUUID();
console.log(id.length, /^[0-9a-f-]{36}$/.test(id), crypto.getRandomValues(new Uint8Array(4)).length);

// atob / btoa (só Latin-1; para UTF-8 passa pelos bytes)
console.log(btoa("loja:segredo"), atob("bG9qYTpzZWdyZWRv"));
try { btoa("Eletrónica €"); } catch (e: any) { console.log("btoa com € ->", e.name); }
const b64 = btoa(String.fromCharCode(...new TextEncoder().encode("Eletrónica €")));
console.log(b64, "->", new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0))));
console.log("toBase64:", new TextEncoder().encode("loja").toBase64());

// performance.now: relógio monotónico em milissegundos com fração
const t0 = performance.now();
await Bun.sleep(20);
console.log("decorreu ~20 ms:", performance.now() - t0 >= 19, "| timeOrigin:", typeof performance.timeOrigin);
performance.mark("a"); performance.mark("b");
console.log("measure:", performance.measure("a-b", "a", "b").name);

// queueMicrotask: corre depois do código atual e antes de timers
const ordem: string[] = [];
setTimeout(() => ordem.push("timeout"), 0);
queueMicrotask(() => ordem.push("microtask"));
Promise.resolve().then(() => ordem.push("promise"));
ordem.push("síncrono");
await Bun.sleep(5);
console.log(ordem);

// EventTarget e CustomEvent
const alvo = new EventTarget();
alvo.addEventListener("encomenda", ev => console.log("evento:", (ev as CustomEvent).detail), { once: true });
alvo.dispatchEvent(new CustomEvent("encomenda", { detail: { id: 8 } }));

// BroadcastChannel: mensagens entre contextos do mesmo processo (workers incluídos)
const canal1 = new BroadcastChannel("loja");
const canal2 = new BroadcastChannel("loja");
const msg = new Promise(res => (canal2.onmessage = e => res(e.data)));
canal1.postMessage({ aviso: "stock baixo", produto: 8 });
console.log("BroadcastChannel:", await msg);
canal1.close(); canal2.close();

// MessageChannel: dois portos ligados um ao outro
const { port1, port2 } = new MessageChannel();
const resp = new Promise(res => (port2.onmessage = e => res(e.data)));
port1.postMessage(new Map([["total", 98.7]]));
console.log("MessageChannel:", await resp);
port1.close(); port2.close();

// AbortSignal.any e timeout já vistos no 03; aqui só o sinal já abortado
console.log(AbortSignal.abort("cancelado").reason, "|", AbortSignal.timeout(1).aborted);
