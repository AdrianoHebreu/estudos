// Web Crypto: crypto.subtle, getRandomValues, randomUUID
const enc = new TextEncoder();
const hex = (b: ArrayBuffer | Uint8Array) => Buffer.from(b instanceof Uint8Array ? b : new Uint8Array(b)).toString("hex");
const texto = "loja: encomenda 12";

// 1. digest
console.log("digest sha-256:", hex(await crypto.subtle.digest("SHA-256", enc.encode(texto))));

// 2. HMAC
const chaveHmac = await crypto.subtle.importKey("raw", enc.encode("segredo-de-estudo"),
  { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
const assinatura = await crypto.subtle.sign("HMAC", chaveHmac, enc.encode(texto));
console.log("hmac          :", hex(assinatura));
console.log("hmac verify   :", await crypto.subtle.verify("HMAC", chaveHmac, assinatura, enc.encode(texto)));
console.log("hmac adulterado:", await crypto.subtle.verify("HMAC", chaveHmac, assinatura, enc.encode(texto + "!")));

// 3. AES-GCM: cifra e decifra, com IV aleatório de 12 bytes
const aes = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
const iv = crypto.getRandomValues(new Uint8Array(12));
const cifrado = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, enc.encode("NIF 123456789"));
console.log("aes-gcm bytes :", cifrado.byteLength, "(13 de texto + 16 da etiqueta de autenticação)");
console.log("decifrado     :", new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aes, cifrado)));
const adulterado = new Uint8Array(cifrado); adulterado[0] ^= 1;
try { await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aes, adulterado); }
catch (e: any) { console.log("adulterado    :", e.name, "-", e.message); }

// 4. ECDSA P-256
const ec = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]) as CryptoKeyPair;
const sigEc = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, ec.privateKey, enc.encode(texto));
console.log("ecdsa bytes   :", sigEc.byteLength, await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, ec.publicKey, sigEc, enc.encode(texto)));

// 5. Ed25519 (algoritmo mais recente: confirma-se executando)
try {
  const ed = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]) as CryptoKeyPair;
  const sigEd = await crypto.subtle.sign("Ed25519", ed.privateKey, enc.encode(texto));
  console.log("ed25519 bytes :", sigEd.byteLength, await crypto.subtle.verify("Ed25519", ed.publicKey, sigEd, enc.encode(texto)));
  console.log("chave pública :", hex(await crypto.subtle.exportKey("raw", ed.publicKey)).slice(0, 16) + "...");
} catch (e: any) { console.log("ed25519 falhou:", e.name, e.message); }

// 6. PBKDF2: derivar uma chave de uma palavra-passe
const base = await crypto.subtle.importKey("raw", enc.encode("Estudo_2026!"), "PBKDF2", false, ["deriveBits"]);
const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode("sal-de-estudo"), iterations: 100000, hash: "SHA-256" }, base, 256);
console.log("pbkdf2        :", hex(bits).slice(0, 32) + "...");

// 7. Aleatórios
const bytes = crypto.getRandomValues(new Uint8Array(8));
console.log("getRandomValues:", bytes.length, "bytes");
console.log("randomUUID    :", crypto.randomUUID(), crypto.randomUUID().length);
try { crypto.getRandomValues(new Uint8Array(70000)); console.log("70000 bytes   : aceite (a norma Web, nos browsers, limita a 65536 bytes)"); } catch (e: any) { console.log("70000 bytes   :", e.name, e.message); }

// 8. O objeto subtle é o padrão Web; o módulo node:crypto também existe
import { timingSafeEqual } from "node:crypto";
console.log("timingSafeEqual:", timingSafeEqual(new Uint8Array(assinatura), new Uint8Array(assinatura)));
