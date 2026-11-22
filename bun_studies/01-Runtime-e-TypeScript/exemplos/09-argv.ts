// Bun.argv e process.argv: [executável, ficheiro, ...argumentos]
import { basename } from "node:path";

console.log("Bun.argv    :", Bun.argv.map((a) => basename(a)));
console.log("mesmo array :", JSON.stringify(Bun.argv) === JSON.stringify(process.argv));
console.log("execPath    :", basename(process.execPath));

const [, , categoria, limite = "3"] = Bun.argv;
if (!categoria) {
    console.error("uso: bun run 09-argv.ts <categoria> [limite]");
    process.exit(2);
}
console.log(`categoria=${categoria} limite=${Number(limite)}`);
process.exitCode = categoria === "Livros" ? 0 : 3;
