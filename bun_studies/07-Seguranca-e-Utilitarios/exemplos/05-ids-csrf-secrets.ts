// UUID v7 e v5, proteção CSRF e Bun.secrets (credenciais do sistema)

// --- UUID v7: ordenável no tempo (48 bits de milissegundos + aleatório) ---
const a = Bun.randomUUIDv7();
const b = Bun.randomUUIDv7();
console.log("v7 :", a);
console.log("v7 :", b, " b > a:", b > a);
const ts = parseInt(a.replace(/-/g, "").slice(0, 12), 16);
console.log("v7 timestamp embutido:", new Date(ts).toISOString().slice(0, 10), "(hoje:", new Date().toISOString().slice(0, 10) + ")");
console.log("v7 em base64 :", Bun.randomUUIDv7("base64"));
console.log("v7 em buffer :", Bun.randomUUIDv7("buffer").length, "bytes");
console.log("v7 fixo      :", Bun.randomUUIDv7("hex", 1700000000000)); // 3.º argumento: timestamp em ms
console.log("v4 (crypto)  :", crypto.randomUUID());

// --- UUID v5: determinístico (SHA-1 de namespace + nome) ---
const x1 = Bun.randomUUIDv5("cliente-1@exemplo.pt", "dns");
const x2 = Bun.randomUUIDv5("cliente-1@exemplo.pt", "dns");
console.log("v5 :", x1, "igual ao repetir:", x1 === x2);
console.log("v5 python.org (valor da RFC):", Bun.randomUUIDv5("python.org", "dns"));
console.log("v5 namespaces aceites:", ["dns", "url", "oid", "x500"].map((n) => Bun.randomUUIDv5("x", n as any).slice(0, 8)).join(" "));
try { Bun.randomUUIDv5("x", "outro" as any); } catch (e: any) { console.log("v5 namespace inválido:", e.message); }

// --- CSRF: token assinado com um segredo, com validade ---
const segredo = "segredo-de-estudo";
// sessionId liga o token a um utilizador: um token de uma sessão não vale para outra
const token = Bun.CSRF.generate(segredo, { expiresIn: 60_000, sessionId: "cliente-1" });
console.log("csrf token     :", token.slice(0, 24) + "... (" + token.length + " caracteres)");
console.log("csrf verify    :", Bun.CSRF.verify(token, { secret: segredo, sessionId: "cliente-1" }));
console.log("csrf outra sessão:", Bun.CSRF.verify(token, { secret: segredo, sessionId: "cliente-2" }), "| sem sessão:", Bun.CSRF.verify(token, { secret: segredo }));
console.log("csrf outro segredo:", Bun.CSRF.verify(token, { secret: "outro", sessionId: "cliente-1" }));
console.log("csrf adulterado:", Bun.CSRF.verify(token.slice(0, -2) + "xx", { secret: segredo, sessionId: "cliente-1" }));
console.log("csrf sem segredo:", Bun.CSRF.generate().length, "caracteres (usa um segredo aleatório do processo)");
const curto = Bun.CSRF.generate(segredo, { expiresIn: 200, sessionId: "cliente-1" });
await Bun.sleep(300);
console.log("csrf expirado  :", Bun.CSRF.verify(curto, { secret: segredo, sessionId: "cliente-1" }));

// --- Bun.secrets: Credential Manager (Windows), Keychain (macOS), libsecret (Linux) ---
const credencial = { service: "est-bn07-estudo", name: "palavra-passe-ficticia" };
console.log("secrets antes  :", await Bun.secrets.get(credencial));
// persist: "local" (só Windows) evita que o Windows replique a credencial por perfis móveis
await Bun.secrets.set({ ...credencial, value: "Estudo_2026!", persist: "local" } as any);
console.log("secrets depois :", await Bun.secrets.get(credencial));
console.log("secrets delete :", await Bun.secrets.delete(credencial));
console.log("secrets final  :", await Bun.secrets.get(credencial));
console.log("delete outra vez:", await Bun.secrets.delete(credencial));
