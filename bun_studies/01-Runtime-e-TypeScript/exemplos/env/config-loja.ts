// A configuração da loja vem de dois sítios: variáveis de ambiente (.env) e um ficheiro .toml.
import loja from "./loja.toml";

// process.env só tem texto: converte e valida logo à entrada.
function numero(nome: string): number {
    const valor = Number(Bun.env[nome]);
    if (Bun.env[nome] === undefined || Number.isNaN(valor)) {
        console.error(`variável ${nome} em falta ou inválida (valor: ${Bun.env[nome]})`);
        process.exit(1);
    }
    return valor;
}

const iva = numero("IVA");
const stockMinimo = numero("STOCK_MINIMO");
const debug = Bun.env.LOJA_DEBUG === "true";          // "false" é uma string não vazia: seria truthy!

const produtos = [
    { id: 1, nome: "Romance Policial", preco: 12.9, stock: 40 },
    { id: 3, nome: "Atlas Mundial", preco: 29.99, stock: 10 },
    { id: 6, nome: "Teclado Mecânico", preco: 79.0, stock: 0 },
    { id: 8, nome: "Conjunto de Panelas", preco: 89.9, stock: 8 },
];

console.log(`${Bun.env.LOJA_NOME} (${loja.nome} no .toml) | IVA ${iva * 100}% | debug=${debug}`);
for (const p of produtos) {
    const final = p.preco * (1 + iva);
    const envio = final >= loja.envio.gratis_acima_de ? 0 : loja.envio.custo;
    const aviso = p.stock < stockMinimo ? "  <- repor stock" : "";
    console.log(`${p.nome.padEnd(20)} ${final.toFixed(2).padStart(7)} ${Bun.env.LOJA_MOEDA}  envio ${envio.toFixed(2)}${aviso}`);
}
console.log("categorias:", loja.categorias.map((c) => c.nome).join(", "));
console.log("Boolean('false') =", Boolean(Bun.env.LOJA_DEBUG));
