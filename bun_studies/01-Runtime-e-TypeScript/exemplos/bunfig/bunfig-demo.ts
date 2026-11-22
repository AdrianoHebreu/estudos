// Corre dentro desta pasta: o Bun lê o bunfig.toml do diretório atual.
import modelo from "./aviso.tpl";

console.log("global do preload :", (globalThis as any).LOJA);
console.log("define            :", process.env.LOJA_VERSAO);
console.log("loader .tpl       :", modelo.trim());
console.log("LOJA_NOME         :", Bun.env.LOJA_NOME ?? "(não carregado)");
console.log("depth 4           :", { a: { b: { c: { d: { e: 1 } } } } });
