import { iniciar } from "./servidor-loja.ts";

const server = iniciar();
const base = server.url.origin; // http://localhost:35040

// 1. O pedido mais simples: GET
const r = await fetch(`${base}/api/produtos/3`);
console.log("status:", r.status, r.statusText, "| ok:", r.ok);
console.log("content-type:", r.headers.get("content-type"));
console.log("url:", r.url, "| redirected:", r.redirected, "| type:", r.type);
console.log("corpo já lido?", r.bodyUsed);
console.log("json:", await r.json());
console.log("corpo já lido?", r.bodyUsed);

// 2. Um corpo só se lê uma vez
try {
  await r.text();
} catch (e) {
  console.log("segunda leitura ->", (e as Error).name + ":", (e as Error).message);
}
// Para ler duas vezes, clona antes de ler
const r2 = await fetch(`${base}/api/produtos/5`);
const copia = r2.clone();
console.log("clone:", (await r2.json()).nome, "|", (await copia.text()).length, "caracteres");

// 3. Formas de ler o corpo
const r3 = await fetch(`${base}/api/produtos?categoria=1`);
console.log("X-Total-Count:", r3.headers.get("x-total-count"));
const lista: { nome: string }[] = await r3.json();
console.log(lista.map(p => p.nome));
console.log("bytes():", (await fetch(`${base}/api/produtos/1`).then(x => x.bytes())).constructor.name);
const blob = await fetch(`${base}/api/relatorio.csv`).then(x => x.blob());
console.log("blob():", blob.type, blob.size, "bytes");
console.log("arrayBuffer():", (await fetch(`${base}/api/produtos/1`).then(x => x.arrayBuffer())).byteLength, "bytes");

// 4. Query string construída com URL e URLSearchParams (sem concatenar à mão)
const url = new URL("/api/produtos", base);
url.searchParams.set("categoria", "3");
url.searchParams.set("max", "30");
console.log(url.href);
const baratos = await (await fetch(url)).json();
console.log(baratos.map((p: any) => `${p.nome} ${p.preco}`));

// 5. 404 e 500 NÃO lançam exceção: tens de verificar ok/status
const r404 = await fetch(`${base}/api/produtos/99`);
console.log(r404.status, r404.ok, await r404.json());
const r500 = await fetch(`${base}/api/falha`);
console.log(r500.status, r500.ok, await r500.json());

// Padrão recomendado: uma função que lança quando !ok
async function obter<T>(caminho: string): Promise<T> {
  const resp = await fetch(base + caminho);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} em ${caminho}: ${(await resp.json()).erro}`);
  return resp.json() as Promise<T>;
}
try {
  await obter("/api/produtos/99");
} catch (e) {
  console.log("apanhado:", (e as Error).message);
}

await server.stop();
