// bun:jsc expõe internos do JavaScriptCore (o motor do Bun). Instável: pensado para diagnóstico, não para aplicações.
import { serialize, deserialize, numberOfDFGCompiles, optimizeNextInvocation, profile, getProtectedObjects } from "bun:jsc";

// serialize/deserialize: structured clone para um buffer (útil para guardar ou enviar objetos)
const original = { loja: "Papelaria", datas: [new Date(0)], mapa: new Map([[1, "um"]]) };
const buf = serialize(original);
console.log("serialize ->", buf.constructor.name, buf.byteLength, "bytes");
const volta = deserialize(buf);
console.log("deserialize ->", volta.datas[0] instanceof Date, volta.mapa.get(1));


// O JIT em ação: contar compilações DFG de uma função quente
function soma(a: number, b: number) { return a + b; }
const antes = numberOfDFGCompiles(soma);
for (let i = 0; i < 100_000; i++) soma(i, 1);
console.log("compilações DFG antes/depois de 100 mil chamadas:", antes, "->", numberOfDFGCompiles(soma));
optimizeNextInvocation(soma);
soma(1, 2);

// profile: amostragem com o profiler do JSC
const r = await profile(() => { let x = 0; for (let i = 0; i < 5_000_000; i++) x += Math.sqrt(i); return x; }, 1000);
console.log("profile devolve:", typeof r, Object.keys(r).join(", "));
console.log("objetos protegidos:", Array.isArray(getProtectedObjects()));
