// Primeiro ficheiro TypeScript executado diretamente pelo Bun.
interface Produto {
    id: number;
    nome: string;
    preco: number;
}

const p: Produto = { id: 1, nome: "Romance Policial", preco: 12.9 };
console.log(`${p.nome} custa ${p.preco.toFixed(2)} EUR`);
console.log("Bun", Bun.version, "| revisão", Bun.revision.slice(0, 9));
console.log("typeof Bun:", typeof Bun, "| typeof process:", typeof process);
