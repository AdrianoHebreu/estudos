// O Bun remove os tipos, não os verifica: este erro de tipos não impede a execução.
const preco: number = "doze euros e noventa";
const stock: number = preco * 2;
console.log("preco =", preco, "| stock =", stock);
console.log("typeof preco:", typeof preco);
