// Mede o custo de hash e de verify. Melhor de 7 execuções (o mínimo é o mais estável com a máquina ocupada), depois de 1 de aquecimento.
const palavra = "Estudo_2026!";

async function melhor(f: () => Promise<unknown>, n = 7) {
  await f(); // aquecimento
  const t: number[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = Bun.nanoseconds();
    await f();
    t.push((Bun.nanoseconds() - t0) / 1e6);
  }
  t.sort((a, b) => a - b);
  return t[0];
}

const casos: [string, any][] = [
  ["argon2id m=19456 t=2", { algorithm: "argon2id", memoryCost: 19456, timeCost: 2 }],
  ["argon2id m=65536 t=2 (omissão)", { algorithm: "argon2id" }],
  ["argon2id m=65536 t=4", { algorithm: "argon2id", memoryCost: 65536, timeCost: 4 }],
  ["bcrypt cost=4", { algorithm: "bcrypt", cost: 4 }],
  ["bcrypt cost=10 (omissão)", { algorithm: "bcrypt", cost: 10 }],
  ["bcrypt cost=12", { algorithm: "bcrypt", cost: 12 }],
];

console.log("configuração".padEnd(34), "hash (ms)".padStart(10), "verify (ms)".padStart(12));
for (const [nome, opts] of casos) {
  const hash = await Bun.password.hash(palavra, opts);
  const th = await melhor(() => Bun.password.hash(palavra, opts));
  const tv = await melhor(() => Bun.password.verify(palavra, hash));
  console.log(nome.padEnd(34), th.toFixed(1).padStart(10), tv.toFixed(1).padStart(12));
}

// O hash assíncrono corre fora da thread principal: o event loop continua livre?
let ticks = 0;
const timer = setInterval(() => ticks++, 5);
await Bun.password.hash(palavra, { algorithm: "argon2id", memoryCost: 65536, timeCost: 4 });
clearInterval(timer);
console.log("ticks de 5 ms durante um hash assíncrono:", ticks);

// A versão síncrona bloqueia
let ticks2 = 0;
const timer2 = setInterval(() => ticks2++, 5);
Bun.password.hashSync(palavra, { algorithm: "argon2id", memoryCost: 65536, timeCost: 4 });
await Bun.sleep(1);
clearInterval(timer2);
console.log("ticks de 5 ms durante um hashSync:", ticks2);
