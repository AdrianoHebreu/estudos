import { iniciar } from "./servidor-loja.ts";

const server = iniciar();
const base = server.url.origin;

// 1. Erro de rede: a promessa é rejeitada (não há Response). Porta 35049: ninguém escuta.
try {
  await fetch("http://localhost:35049/api/produtos");
} catch (e: any) {
  console.log("rede ->", e.name, "| code:", e.code, "|", e.message);
}

// 2. Redirecionamentos: por omissão o fetch segue-os
const seguido = await fetch(`${base}/api/antigo`);
console.log("follow  :", seguido.status, "redirected:", seguido.redirected, "->", seguido.url);

const manual = await fetch(`${base}/api/antigo`, { redirect: "manual" });
console.log("manual  :", manual.status, "location:", manual.headers.get("location"));

try {
  await fetch(`${base}/api/antigo`, { redirect: "error" });
} catch (e: any) {
  console.log("error   ->", e.name, e.code ?? "", "|", e.message);
}

// Redirecionamento infinito
try {
  await fetch(`${base}/api/loop`);
} catch (e: any) {
  console.log("loop    ->", e.name, e.code ?? "", "|", e.message);
}

// 3. Tempo limite com AbortSignal.timeout
const t0 = performance.now();
try {
  await fetch(`${base}/api/lento?ms=1500`, { signal: AbortSignal.timeout(200) });
} catch (e: any) {
  console.log("timeout ->", e.name, "|", e.message, `| ${Math.round(performance.now() - t0)} ms`);
}

// 4. Cancelamento manual com AbortController
const ctl = new AbortController();
setTimeout(() => ctl.abort(), 100);
try {
  await fetch(`${base}/api/lento?ms=1500`, { signal: ctl.signal });
} catch (e: any) {
  console.log("abort   ->", e.name, "|", e.message);
}
// abort com motivo próprio
const ctl2 = new AbortController();
ctl2.abort(new Error("o utilizador saiu da página"));
try {
  await fetch(`${base}/api/lento`, { signal: ctl2.signal });
} catch (e: any) {
  console.log("motivo  ->", e.name, "|", e.message);
}

// 5. AbortSignal.any: cancela quando QUALQUER sinal disparar
const manualCtl = new AbortController();
const sinal = AbortSignal.any([manualCtl.signal, AbortSignal.timeout(300)]);
try {
  await fetch(`${base}/api/lento?ms=1500`, { signal: sinal });
} catch (e: any) {
  console.log("any     ->", e.name, "| aborted:", sinal.aborted, "| reason:", sinal.reason?.name);
}

// 6. Repetir com espera crescente (retry), só para erros que valem a pena repetir
async function comRetry(caminho: string, tentativas = 3) {
  for (let i = 1; i <= tentativas; i++) {
    try {
      const r = await fetch(base + caminho, { signal: AbortSignal.timeout(500) });
      if (r.status < 500) return r;
      console.log(`  tentativa ${i}: HTTP ${r.status}`);
    } catch (e: any) {
      console.log(`  tentativa ${i}: ${e.name}`);
    }
    await Bun.sleep(50 * 2 ** i);
  }
  throw new Error(`desisti de ${caminho}`);
}
try {
  await comRetry("/api/falha");
} catch (e) {
  console.log((e as Error).message);
}

await server.stop();
