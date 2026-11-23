// Programa para compilar num executável: mostra de onde vem cada coisa.
import aviso from "../ativos/aviso.txt" with { type: "text" };
import logo from "../ativos/logo.svg" with { type: "file" };
import { basename } from "node:path";
import produtos from "../ativos/produtos.json";

console.log("argv       :", process.argv.length, "argumentos ->", process.argv.slice(2));
console.log("execPath   :", basename(process.execPath));
console.log("Bun.main   :", Bun.main);
console.log("import.meta:", import.meta.path, "| main?", import.meta.main);
console.log("env        :", process.env.LOJA_IVA ?? "(LOJA_IVA não definida)");
console.log("aviso      :", JSON.stringify(aviso.trim()));
console.log("produtos   :", produtos.length, "registos");

console.log("logo (caminho):", logo);
const f = Bun.file(logo);
console.log("logo existe?", await f.exists(), "| tamanho:", f.size, "| tipo:", f.type);

console.log("Bun.embeddedFiles:", Bun.embeddedFiles.length);
for (const e of Bun.embeddedFiles) console.log("  ", (e as File).name, e.size, "bytes");
