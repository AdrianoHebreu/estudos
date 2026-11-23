import { encomendaImpar, prazoEntrega, formatarPreco } from "@loja/core";
import kleur from "kleur";

console.log(kleur.green("encomenda 7 é ímpar?"), encomendaImpar(7));
console.log("prazo de entrega em ms:", prazoEntrega());
console.log("preço:", formatarPreco(49.9));
