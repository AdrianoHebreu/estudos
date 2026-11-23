import { formatarPreco, iva } from "./preco.ts";
declare const VERSAO: string;
const produtos = [
  { nome: "Romance Policial", preco: 12.9 },
  { nome: "Caneca de Cerâmica", preco: 6.5 },
];
for (const p of produtos) {
  console.log(p.nome.padEnd(20), formatarPreco(p.preco), "IVA", formatarPreco(iva(p.preco)));
}
console.log("versão", typeof VERSAO === "undefined" ? "(sem define)" : VERSAO);
