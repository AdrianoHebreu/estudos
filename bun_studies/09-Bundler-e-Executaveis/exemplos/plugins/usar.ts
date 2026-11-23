import produtos from "./produtos.csv";
import { versao, compilado_em } from "loja:build";
console.log(versao, typeof compilado_em);
console.table(produtos);
console.log(produtos.reduce((t: number, p: any) => t + p.preco, 0).toFixed(2));
