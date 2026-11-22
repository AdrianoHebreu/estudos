import { basename } from "node:path";
import { quemSou } from "./sub/auxiliar.ts";

console.log("import.meta.file :", import.meta.file);
console.log("import.meta.dir  :", basename(import.meta.dir), "(só a última pasta)");
console.log("import.meta.path :", basename(import.meta.path));
console.log("import.meta.url  :", import.meta.url.startsWith("file:///"), basename(import.meta.url));
console.log("import.meta.main :", import.meta.main);
console.log("Bun.main         :", basename(Bun.main));
console.log("process.argv[1]  :", basename(process.argv[1]));
console.log("auxiliar         :", quemSou());
console.log("resolve          :", basename(import.meta.resolve("./sub/auxiliar.ts")));
console.log("filename/dirname :", import.meta.filename === import.meta.path, import.meta.dirname === import.meta.dir);

if (import.meta.main) {
    console.log("Corri como programa principal (não fui importado).");
}
