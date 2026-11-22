// Três maneiras de evitar caminhos relativos como ../../lib/preco.ts
import { comIva } from "@loja/preco";          // paths do tsconfig.json
import { produtos } from "@dados";             // paths para um ficheiro concreto
import { comIva as mesmaFuncao } from "#preco"; // "imports" do package.json (padrão do Node)

for (const p of produtos) {
    console.log(p.nome.padEnd(20), p.preco.toFixed(2).padStart(6), "->", comIva(p.preco).toFixed(2).padStart(6));
}
console.log("#preco e @loja/preco são a mesma função:", mesmaFuncao === comIva);
console.log("resolvido para:", import.meta.resolve("@loja/preco").split("/").slice(-3).join("/"));
