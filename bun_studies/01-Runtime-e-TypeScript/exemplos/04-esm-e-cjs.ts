// Um ficheiro ESM (import/export, top-level await) a usar CommonJS e ESM sem compilar nada.
import { comIva, IVA } from "./modulos/moeda.cjs";      // import de um módulo CommonJS
import etiqueta, { formatar } from "./modulos/formato.mjs";
import { createRequire } from "node:module";

console.log("IVA:", IVA, "| 12,90 com IVA:", formatar(comIva(12.9)));
console.log(etiqueta("Atlas Mundial", 29.99));

// require() também funciona num ficheiro ESM com o Bun (no Node é preciso createRequire).
const moeda = require("./modulos/moeda.cjs");
console.log("require em ESM:", moeda === (await import("./modulos/moeda.cjs")).default);

// Top-level await: sem função async à volta.
const dados = await Promise.resolve({ categorias: 3 });
console.log("top-level await:", dados);

console.log("typeof require:", typeof require, "| typeof module:", typeof module, "| typeof __dirname:", typeof __dirname);
console.log("typeof createRequire:", typeof createRequire);
