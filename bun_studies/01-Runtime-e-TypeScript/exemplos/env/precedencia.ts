// Que ficheiro .env ganhou? Cada variável ORIGEM_x está definida em vários ficheiros.
const chaves = ["LOJA_NOME", "LOJA_MOEDA", "SAUDACAO", "MODO", "ORIGEM_A", "ORIGEM_B", "ORIGEM_C", "ORIGEM_D"];

console.log("NODE_ENV =", process.env.NODE_ENV ?? "(não definido)");
for (const k of chaves) console.log(k.padEnd(10), "=", Bun.env[k] ?? "(indefinido)");
console.log("Bun.env === process.env:", Bun.env === process.env, "| import.meta.env === Bun.env:", import.meta.env === Bun.env);
