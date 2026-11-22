// Ler o stdin linha a linha e escrever no stdout e no stderr
console.log("stdin é um Blob?", Bun.stdin instanceof Blob);

let n = 0;
let soma = 0;
// for await (const linha of console) lê o stdin uma linha de cada vez
for await (const linha of console) {
  const texto = linha.trim();
  if (texto === "") continue;
  n++;
  const preco = Number(texto.split(";")[1]);
  if (Number.isNaN(preco)) {
    console.error(`linha ${n} ignorada (preço inválido): ${texto}`);
    continue;
  }
  soma += preco;
  await Bun.write(Bun.stdout, `ok ${texto}\n`);
}
console.log(`linhas: ${n}, soma dos preços: ${soma.toFixed(2)}`);
