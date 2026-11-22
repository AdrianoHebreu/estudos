// O que o Bun já traz: o objeto global Bun, módulos bun:* e globais Web.
import { env, version } from "bun";                 // o módulo "bun" é o mesmo objeto Bun
import * as jsc from "bun:jsc";
import { Database } from "bun:sqlite";

console.log("import { version } from 'bun':", version === Bun.version);
console.log("Bun tem", Object.keys(Bun).length, "propriedades; amostra:", Object.keys(Bun).slice(0, 12).join(", "));
console.log("bun:sqlite Database :", typeof Database);
console.log("bun:jsc exporta     :", Object.keys(jsc).slice(0, 5).join(", "), "...");
console.log("módulos bun:* nativos:", ["bun:sqlite", "bun:ffi", "bun:test", "bun:jsc"].map((m) => `${m}=${typeof require(m)}`).join(" "));

const web = ["fetch", "Request", "Response", "Headers", "URL", "URLSearchParams", "AbortController",
    "TextEncoder", "ReadableStream", "WebSocket", "crypto", "structuredClone", "BroadcastChannel", "Worker"];
console.log("globais Web:", web.map((n) => `${n}:${typeof (globalThis as any)[n]}`).join(" "));
console.log("env === process.env:", env === process.env);
