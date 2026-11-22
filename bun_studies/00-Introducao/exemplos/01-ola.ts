// Primeiro programa: TypeScript executado diretamente, sem compilar.
interface Produto {
  nome: string;
  preco: number;
}

function comIva(produto: Produto, taxa = 0.23): number {
  return Math.round(produto.preco * (1 + taxa) * 100) / 100;
}

const atlas: Produto = { nome: "Atlas Mundial", preco: 29.99 };

console.log(`Olá, Bun! Versão ${Bun.version} (${process.platform}/${process.arch})`);
console.log(`${atlas.nome} com IVA: ${comIva(atlas)} EUR`);
console.log("Ficheiro em execução:", import.meta.file);
