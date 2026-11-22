import { dns } from "bun";
import { iniciar } from "./servidor-loja.ts";

console.log("funções:", Object.keys(dns).filter(k => typeof (dns as any)[k] === "function").join(", "));

// lookup: devolve os endereços de um nome (usado pelo fetch por baixo)
const enderecos = await dns.lookup("localhost");
console.log("localhost ->", enderecos);
console.log("só IPv4:", await dns.lookup("localhost", { family: 4 }));
console.log("backend system:", await dns.lookup("localhost", { backend: "system" }));
try {
  await dns.lookup("nome-que-nao-existe.invalid");
} catch (e: any) {
  console.log("inexistente ->", e.name, e.code, "|", e.message);
}

// A cache do Bun (30 s por omissão; 256 entradas)
console.log("cache inicial:", dns.getCacheStats());

// prefetch: aquece a cache antes de ligares (experimental). Só uso o servidor local.
const server = iniciar();
dns.prefetch("localhost", server.port);
await Bun.sleep(50);
console.log("depois de prefetch:", dns.getCacheStats());
for (let i = 0; i < 3; i++) await fetch(`${server.url.origin}/api/produtos/1`);
console.log("depois de 3 fetch:", dns.getCacheStats());
await server.stop(true);
