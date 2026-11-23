import produtos, { colunas } from "./produtos.csv";
import { NOME, IVA } from "loja:config";
import { nome, hoje } from "gerado:relogio";
import { comIva } from "@loja/util"; // alias do tsconfig.json (paths), não é um plugin

console.log(NOME, "| colunas:", colunas, "|", nome, hoje);
for (const p of produtos as any[]) console.log(`${p.id} ${p.nome}: ${p.preco} -> ${comIva(p.preco, IVA)} com IVA`);
