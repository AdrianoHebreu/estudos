import { compiladoEm, multiplicar, tabelasDaLoja } from "./macros/relogio.ts" with { type: "macro" };

console.log("compilado em", compiladoEm());
console.log("tabelas:", tabelasDaLoja());
console.log("6 x 7 =", await multiplicar(6, 7));
