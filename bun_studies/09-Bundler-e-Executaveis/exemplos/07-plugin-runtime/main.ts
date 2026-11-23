import produtos, { total } from "./produtos.csv";
import { iva, moeda } from "loja:config";
console.log(total, "produtos;", produtos[0], "| IVA", iva, moeda);
