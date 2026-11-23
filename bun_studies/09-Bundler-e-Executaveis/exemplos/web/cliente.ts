// TypeScript que corre no browser. O Bun transpila-o e empacota-o; o CSS importado vai para um ficheiro à parte.
import "./estilo.css";
import { formatarPreco } from "../app/preco.ts";

type Produto = { id: number; nome: string; preco: number };

const produtos: Produto[] = await (await fetch("/api/produtos")).json();
const lista = document.querySelector<HTMLUListElement>("#lista")!;
lista.innerHTML = produtos.map((p) => `<li class="preco">${p.nome}: ${formatarPreco(p.preco)}</li>`).join("");
