// Bun.password: hash e verify com argon2id (por omissão) e bcrypt
const palavra = "Estudo_2026!";

const h1 = await Bun.password.hash(palavra);
console.log("por omissão   :", h1);
console.log("verify certo  :", await Bun.password.verify(palavra, h1));
console.log("verify errado :", await Bun.password.verify("estudo_2026!", h1));

// Dois hashes da mesma palavra-passe são diferentes (sal aleatório)
const h2 = await Bun.password.hash(palavra);
console.log("sal diferente :", h1 !== h2);

// argon2id explícito, com custos: memoryCost em KiB, timeCost = iterações
const a = await Bun.password.hash(palavra, { algorithm: "argon2id", memoryCost: 19456, timeCost: 2 });
console.log("argon2id      :", a);

// outros argon2
for (const algorithm of ["argon2i", "argon2d"] as const) {
  const x = await Bun.password.hash(palavra, { algorithm });
  console.log(algorithm.padEnd(14), ":", x.slice(0, 30) + "...");
}

// bcrypt, custo (cost) 10 por omissão para bcrypt
const b = await Bun.password.hash(palavra, { algorithm: "bcrypt", cost: 10 });
console.log("bcrypt        :", b, "(" + b.length + " caracteres)");
console.log("verify bcrypt :", await Bun.password.verify(palavra, b));

// O verify descobre o algoritmo a partir do próprio hash
console.log("verify a      :", await Bun.password.verify(palavra, a));

// Versões síncronas
const s = Bun.password.hashSync(palavra, { algorithm: "bcrypt", cost: 4 });
console.log("hashSync      :", s, Bun.password.verifySync(palavra, s));

// Limite do bcrypt: só os primeiros 72 bytes contam
const longa = "x".repeat(72);
const hb = await Bun.password.hash(longa, { algorithm: "bcrypt", cost: 4 });
console.log("bcrypt 72+ ok :", await Bun.password.verify(longa + "diferente", hb));

// Palavra-passe vazia
try { await Bun.password.hash(""); } catch (e: any) { console.log("vazia:", e.code ?? e.name, e.message); }

// Hash inválido
try { console.log("formato lixo:", await Bun.password.verify(palavra, "isto-nao-e-um-hash")); } catch (e: any) { console.log("lixo:", e.code ?? e.name, e.message); }
