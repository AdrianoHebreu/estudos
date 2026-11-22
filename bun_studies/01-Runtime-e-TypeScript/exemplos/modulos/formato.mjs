// ESM explícito: export nomeado e default.
export const formatar = (n) => `${n.toFixed(2).replace(".", ",")} EUR`;
export default function etiqueta(nome, preco) { return `${nome} -> ${formatar(preco)}`; }
