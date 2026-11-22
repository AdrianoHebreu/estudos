import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { iniciar } from "./servidor-loja.ts";

const server = iniciar(); // 35040
const base = server.url.origin;

// 1. proxy: um «proxy» de brincar na porta 35041 que regista o que recebe e reencaminha
const vistos: string[] = [];
const proxy = Bun.serve({
  port: 35041,
  async fetch(req) {
    vistos.push(`${req.method} ${req.url} (via ${req.headers.get("host")})`);
    return fetch(req.url, { method: req.method, headers: req.headers, proxy: false });
  },
});
const viaProxy = await fetch(`${base}/api/produtos/1`, { proxy: "http://localhost:35041" });
console.log("via proxy:", viaProxy.status, (await viaProxy.json()).nome);
console.log("o proxy viu:", vistos);

// proxy com cabeçalhos próprios (por exemplo, autenticação do proxy)
await fetch(`${base}/api/produtos/2`, {
  proxy: { url: "http://localhost:35041", headers: { "Proxy-Authorization": "Bearer so-para-estudo" } },
});
console.log("pedidos no proxy:", vistos.length);
// proxy: false ignora as variáveis HTTP_PROXY/HTTPS_PROXY/ALL_PROXY
await fetch(`${base}/api/produtos/3`, { proxy: false });
console.log("pedidos no proxy (proxy:false não passa lá):", vistos.length);
proxy.stop(true);

// 2. unix: falar com um servidor por socket Unix (ficheiro de socket numa pasta temporária)
const pasta = await mkdtemp(join(tmpdir(), "bn04-unix-"));
const socket = join(pasta, "loja.sock");
try {
  const sUnix = iniciar(0, socket);
  const r = await fetch("http://loja/api/produtos/4", { unix: socket });
  console.log("unix:", r.status, (await r.json()).nome);
  await sUnix.stop(true);
} catch (e: any) {
  console.log("unix falhou ->", e.name, e.message);
}
await rm(pasta, { recursive: true, force: true });

// 3. verbose: imprime o pedido e a resposta (cada linha começa por [fetch])
console.log("--- verbose: true");
await fetch(`${base}/api/produtos/5`, { verbose: true });
console.log("--- fim");

// 4. keepalive: false pede uma ligação nova e fecha-a no fim
const k = await fetch(`${base}/api/produtos/5`, { keepalive: false });
console.log("keepalive:false ->", k.status);

// 5. TLS: um servidor HTTPS com certificado que o cliente não conhece
const cert = process.env.CERT_DIR;
if (cert) {
  const https = Bun.serve({
    port: 35042,
    tls: { key: Bun.file(`${cert}/key.pem`), cert: Bun.file(`${cert}/cert.pem`) },
    fetch: () => new Response("segredo"),
  });
  try {
    await fetch("https://localhost:35042/");
  } catch (e: any) {
    console.log("tls ->", e.name, e.code ?? "", "|", e.message);
  }
  const ok = await fetch("https://localhost:35042/", { tls: { rejectUnauthorized: false } });
  console.log("rejectUnauthorized:false ->", await ok.text());
  https.stop(true);
} else {
  console.log("(define CERT_DIR com key.pem e cert.pem para ver o erro de TLS)");
}

// 6. Presentes na documentação mas ausentes nesta versão
console.log("Bun.FetchSession:", typeof (Bun as any).FetchSession, "| fetch.preconnect:", typeof fetch.preconnect);

await server.stop();
