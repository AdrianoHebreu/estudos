// Palavras-passe dos clientes da loja: guardar só o hash, verificar no login, atualizar o custo
type Cliente = { id: number; nome: string; email: string; hash: string };

// Armazém em memória (no módulo 05 isto seria uma tabela com a coluna hash)
const clientes = new Map<string, Cliente>();

const OPCOES = { algorithm: "argon2id", memoryCost: 19456, timeCost: 2 } as const; // custo moderado para o exemplo

async function registar(id: number, nome: string, email: string, palavraPasse: string) {
  if (palavraPasse.length < 10) throw new Error("palavra-passe demasiado curta (mínimo 10 caracteres)");
  const hash = await Bun.password.hash(palavraPasse, OPCOES);
  clientes.set(email, { id, nome, email, hash });
}

async function entrar(email: string, palavraPasse: string): Promise<Cliente | null> {
  const cliente = clientes.get(email);
  // Mesmo que o email não exista, gasta-se o tempo de um verify: não revela quais os emails registados
  const hash = cliente?.hash ?? FALSO;
  const ok = await Bun.password.verify(palavraPasse, hash);
  return cliente && ok ? cliente : null;
}
const FALSO = await Bun.password.hash("palavra-passe-que-ninguem-usa", OPCOES);

await registar(1, "Ana Ribeiro", "ana.ribeiro@exemplo.pt", "Estudo_2026!");
await registar(2, "Bruno Costa", "bruno.costa@exemplo.pt", "Outra#Palavra42");
try { await registar(3, "Carla Mendes", "carla.mendes@exemplo.pt", "curta"); } catch (e: any) { console.log("registo recusado:", e.message); }

console.log("o que fica guardado:", clientes.get("ana.ribeiro@exemplo.pt")!.hash.slice(0, 40) + "...");
console.log("ana, certa      :", (await entrar("ana.ribeiro@exemplo.pt", "Estudo_2026!"))?.nome);
console.log("ana, errada     :", await entrar("ana.ribeiro@exemplo.pt", "estudo_2026!"));
console.log("email inexistente:", await entrar("ninguem@exemplo.pt", "Estudo_2026!"));

// Tempos: um login falhado com email inexistente demora tanto como um com email existente?
async function ms(f: () => Promise<unknown>) { const t = Bun.nanoseconds(); await f(); return (Bun.nanoseconds() - t) / 1e6; }
await entrar("ana.ribeiro@exemplo.pt", "x"); // aquecimento
const tExiste = Math.min(await ms(() => entrar("ana.ribeiro@exemplo.pt", "errada")), await ms(() => entrar("ana.ribeiro@exemplo.pt", "errada")));
const tNao = Math.min(await ms(() => entrar("ninguem@exemplo.pt", "errada")), await ms(() => entrar("ninguem@exemplo.pt", "errada")));
console.log(`tempo com email existente: ${tExiste.toFixed(0)} ms; inexistente: ${tNao.toFixed(0)} ms`);

// Atualizar o custo: o hash antigo é bcrypt de custo baixo; no próximo login bem-sucedido regrava-se em argon2id
clientes.set("hugo@exemplo.pt", { id: 8, nome: "Hugo Teixeira", email: "hugo@exemplo.pt", hash: await Bun.password.hash("Antiga#Palavra1", { algorithm: "bcrypt", cost: 4 }) });
const hugo = clientes.get("hugo@exemplo.pt")!;
if (await Bun.password.verify("Antiga#Palavra1", hugo.hash)) {
  if (!hugo.hash.startsWith("$argon2id$")) hugo.hash = await Bun.password.hash("Antiga#Palavra1", OPCOES);
}
console.log("hugo migrado para:", hugo.hash.split("$")[1]);
