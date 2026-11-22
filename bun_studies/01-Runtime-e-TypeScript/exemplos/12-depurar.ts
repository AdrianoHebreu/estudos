// Programa curto para depurar: o debugger pára aqui quando usas --inspect-brk.
function total(linhas: { qtd: number; preco: number }[]) {
    let soma = 0;
    for (const l of linhas) soma += l.qtd * l.preco;   // põe um breakpoint nesta linha
    return soma;
}
console.log("total da encomenda 1:", total([{ qtd: 2, preco: 12.9 }, { qtd: 1, preco: 14.9 }]).toFixed(2));
setTimeout(() => process.exit(0), 1500);               // só para o exemplo terminar sozinho
