// Token simples assinado com HMAC-SHA256: payload.assinatura (NÃO é um JWT completo)
const enc = new TextEncoder();
const b64url = (b: Uint8Array) => b.toBase64({ alphabet: "base64url", omitPadding: true });
const SEGREDO = "segredo-de-estudo-trocar-em-producao";

const chave = await crypto.subtle.importKey("raw", enc.encode(SEGREDO), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

async function emitir(sub: number, validadeMs: number) {
  const payload = b64url(enc.encode(JSON.stringify({ sub, exp: Date.now() + validadeMs })));
  const assinatura = new Uint8Array(await crypto.subtle.sign("HMAC", chave, enc.encode(payload)));
  return payload + "." + b64url(assinatura);
}

async function verificar(token: string): Promise<{ sub: number } | string> {
  const [payload, assinatura, resto] = token.split(".");
  if (!payload || !assinatura || resto !== undefined) return "formato inválido";
  let bytes: Uint8Array;
  try { bytes = Uint8Array.fromBase64(assinatura, { alphabet: "base64url" }); } catch { return "assinatura ilegível"; }
  // crypto.subtle.verify compara em tempo constante
  if (!(await crypto.subtle.verify("HMAC", chave, bytes, enc.encode(payload)))) return "assinatura inválida";
  const dados = JSON.parse(new TextDecoder().decode(Uint8Array.fromBase64(payload, { alphabet: "base64url" })));
  if (Date.now() > dados.exp) return "expirado";
  return { sub: dados.sub };
}

const token = await emitir(1, 60_000);
console.log("token         :", token);
console.log("verificar     :", JSON.stringify(await verificar(token)));

// Adulterar o payload (tentar passar a ser o cliente 2) mantendo a assinatura
const [p, s] = token.split(".");
const falso = b64url(enc.encode(JSON.stringify({ sub: 2, exp: Date.now() + 60_000 }))) + "." + s;
console.log("payload trocado:", await verificar(falso));
console.log("truncado      :", await verificar(token.slice(0, -4)));
console.log("lixo          :", await verificar("abc"));
const curto = await emitir(1, 100);
await Bun.sleep(150);
console.log("expirado      :", await verificar(curto));
console.log("payload visível (não está cifrado):", new TextDecoder().decode(Uint8Array.fromBase64(p, { alphabet: "base64url" })));
