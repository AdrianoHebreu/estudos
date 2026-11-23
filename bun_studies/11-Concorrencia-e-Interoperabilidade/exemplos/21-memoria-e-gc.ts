import { heapStats, memoryUsage, gcAndSweep, fullGC, edenGC, estimateShallowMemoryUsageOf, heapSize, isRope } from "bun:jsc";

const mb = (n: number) => (n / 1048576).toFixed(1) + " MB";

console.log("process.memoryUsage():", Object.fromEntries(Object.entries(process.memoryUsage()).map(([k, v]) => [k, mb(v as number)])));
console.log("memoryUsage.rss() existe:", typeof process.memoryUsage.rss, "->", mb(process.memoryUsage.rss()));
console.log("bun:jsc memoryUsage():", Object.keys(memoryUsage()).join(", "));

const antes = heapStats();
console.log("heapStats campos:", Object.keys(antes).join(", "));
console.log("heapSize:", mb(antes.heapSize), "| objectCount:", antes.objectCount);

// Criar lixo e medir antes/depois do GC
let lixo: any[] | null = Array.from({ length: 500_000 }, (_, i) => ({ i, nome: "item " + i }));
const cheio = heapStats();
console.log("com 500 mil objetos:", mb(cheio.heapSize), "| objectCount:", cheio.objectCount);
lixo = null;
console.log("Bun.gc(false) devolve:", Bun.gc(false), "(coleta assíncrona, pedida)");
Bun.gc(true); // true = síncrono
const depois = heapStats();
console.log("depois de Bun.gc(true):", mb(depois.heapSize), "| objectCount:", depois.objectCount);

// As variantes de bun:jsc
edenGC(); fullGC();
console.log("gcAndSweep devolve:", typeof gcAndSweep(), "| heapSize atual:", mb(heapSize()));

// Tamanho de um objeto
const arr = new Array(1000).fill(0).map((_, i) => ({ i }));
console.log("estimateShallowMemoryUsageOf(array de 1000):", estimateShallowMemoryUsageOf(arr), "bytes");
console.log("estimateShallowMemoryUsageOf(string de 1 MB):", estimateShallowMemoryUsageOf("x".repeat(1_000_000)), "bytes");
console.log("isRope('a'.repeat(100) + 'b'):", isRope("a".repeat(100) + "b"));

// WeakRef e FinalizationRegistry
let alvo: object | null = { grande: new Array(10000).fill(1) };
const ref = new WeakRef(alvo);
const reg = new FinalizationRegistry((v) => console.log("finalizado:", v));
reg.register(alvo, "o objeto alvo");
alvo = null;
Bun.gc(true);
await Bun.sleep(50);
Bun.gc(true);
await Bun.sleep(50);
console.log("WeakRef.deref() depois do GC:", ref.deref());

// Fuga de memória típica: Map que só cresce
const cache = new Map<number, string>();
const m0 = process.memoryUsage().heapUsed;
for (let i = 0; i < 300_000; i++) cache.set(i, "valor " + i);
Bun.gc(true);
console.log("cache sem limite:", cache.size, "entradas, +" + mb(process.memoryUsage().heapUsed - m0), "no heap");
