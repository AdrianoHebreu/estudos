// Arranca o executável da loja, faz pedidos reais e termina SÓ esse processo.
// Uso: bun testar-exe.ts <caminho-do-executavel> [porta]
import { basename } from "node:path";

const exe = process.argv[2];
const porta = Number(process.argv[3] ?? 35094);
if (!exe) throw new Error("uso: bun testar-exe.ts <executável> [porta]");

const t0 = performance.now();
const filho = Bun.spawn([exe], {
  env: { ...process.env, PORT: String(porta) },
  stdout: "pipe",
  stderr: "inherit",
});
console.log("arrancou", basename(exe), "com pid", filho.pid);

try {
  // espera pela primeira linha do programa (o executável escreve-a quando já está à escuta)
  const leitor = filho.stdout.getReader();
  const primeira = new TextDecoder().decode((await leitor.read()).value);
  console.log("pronto em", Math.round(performance.now() - t0), "ms:", primeira.trim().replace(/pid \d+/, "pid " + filho.pid));
  leitor.releaseLock();

  const base = `http://127.0.0.1:${porta}`;

  const esquema = await fetch(base + "/openapi.json");
  const doc = (await esquema.json()) as { openapi: string; paths: Record<string, unknown> };
  console.log("/openapi.json", esquema.status, esquema.headers.get("content-type"), "| openapi", doc.openapi, "|", Object.keys(doc.paths).length, "caminhos");

  const docs = await fetch(base + "/docs");
  const html = await docs.text();
  console.log("/docs", docs.status, docs.headers.get("content-type"), "|", html.length, "carateres | swagger-ui-dist@5.35.1:", html.includes("swagger-ui-dist@5.35.1"), '| url "/openapi.json":', html.includes('"/openapi.json"'));

  const p = await fetch(base + "/api/produtos/4");
  console.log("/api/produtos/4", p.status, JSON.stringify(await p.json()));

  const nova = await fetch(base + "/api/encomendas", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cliente_id: 1, linhas: [{ produto_id: 4, quantidade: 2 }] }),
  });
  console.log("POST /api/encomendas", nova.status, JSON.stringify(await nova.json()));

  const mau = await fetch(base + "/api/encomendas", { method: "POST", body: JSON.stringify({ cliente_id: 0, linhas: [] }) });
  console.log("POST inválido", mau.status, JSON.stringify(await mau.json()));
} finally {
  filho.kill(); // só o processo que lançámos
  await filho.exited;
  console.log("terminado o pid", filho.pid, "(sinal:", filho.signalCode, "código:", filho.exitCode + ")");
}
