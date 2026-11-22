import { iniciar } from "./servidor-loja.ts";

const server = iniciar();
const base = server.url.origin;

// 1. POST com corpo JSON: tu defines o Content-Type e serializas
const r = await fetch(`${base}/api/encomendas`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({ clienteId: 1, linhas: [{ produtoId: 4, quantidade: 1 }, { produtoId: 10, quantidade: 3 }] }),
});
console.log(r.status, r.headers.get("location"));
console.log(await r.json());

// 2. Validação do servidor: 422 com corpo de erro
const mau = await fetch(`${base}/api/encomendas`, { method: "POST", body: "{}" });
console.log(mau.status, await mau.json());

// 3. PATCH e DELETE
const p = await fetch(`${base}/api/produtos/6`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ stock: 12 }),
});
console.log("PATCH:", p.status, await p.json());
const d = await fetch(`${base}/api/produtos/10`, { method: "DELETE" });
console.log("DELETE:", d.status, "| corpo vazio:", (await d.text()) === "");
console.log("depois do DELETE:", (await fetch(`${base}/api/produtos/10`)).status);

// 4. Request como objeto reutilizável
const req = new Request(`${base}/api/produtos/1`, { headers: { "X-Cliente": "estudo" } });
console.log(req.method, req.url, req.headers.get("x-cliente"));
console.log("eco:", (await (await fetch(req)).json()).nome);

// 5. FormData com ficheiro (multipart): NÃO escrevas o Content-Type, o boundary é gerado
const form = new FormData();
form.append("legenda", "Capa do Atlas");
form.append("imagem", new File(["PNG-FALSO"], "atlas.png", { type: "image/png" }));
const up = await fetch(`${base}/api/produtos/3/imagem`, { method: "POST", body: form });
console.log(await up.json());

// Um BunFile também é um Blob: serve diretamente em FormData
const csv = Bun.file(import.meta.dir + "/../../00-Introducao/dados/loja.sql");
const form2 = new FormData();
form2.set("imagem", csv, "loja.sql");
console.log((await (await fetch(`${base}/api/produtos/3/imagem`, { method: "POST", body: form2 })).json()).ficheiro);

// 6. Cabeçalhos: o que o Bun envia por omissão
const eco = await (await fetch(`${base}/api/cabecalhos`, { headers: { Authorization: "Bearer segredo-de-estudo" } })).json();
console.log(eco);

// 7. A classe Headers
const h = new Headers({ "Content-Type": "application/json" });
h.append("Set-Cookie", "a=1");
h.append("Set-Cookie", "b=2");
h.set("X-Loja", "demo");
console.log([...h], "| getSetCookie:", h.getSetCookie());
console.log("get é insensível a maiúsculas:", h.get("CONTENT-TYPE"));

// 8. GET com corpo é erro
try {
  await fetch(base, { method: "GET", body: "x" });
} catch (e) {
  console.log("GET com corpo ->", (e as Error).name + ":", (e as Error).message);
}

await server.stop();
