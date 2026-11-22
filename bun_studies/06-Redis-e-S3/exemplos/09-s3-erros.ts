// Erros reais do cliente S3: chave inexistente, bucket inexistente, credenciais erradas,
// ligação recusada, falta de credenciais e URLs pré-assinados inválidos.
import { s3, S3Client } from "bun";

const base = { endpoint: process.env.S3_ENDPOINT, bucket: process.env.S3_BUCKET, region: "us-east-1" };

async function tenta(rotulo: string, fn: () => Promise<unknown>) {
  try {
    console.log(`${rotulo} -> OK`, await fn());
  } catch (e: any) {
    console.log(`${rotulo} -> ${e.name} code=${e.code}`);
    console.log(`    ${e.message.slice(0, 90)}`);
  }
}

await tenta("text() de chave inexistente", () => s3.file("nao/existe.txt").text());
await tenta("json() de chave inexistente", () => s3.file("nao/existe.json").json());
await tenta("stat() de chave inexistente", () => s3.file("nao/existe.txt").stat());
await tenta("exists() de chave inexistente", () => s3.file("nao/existe.txt").exists()); // não lança
await tenta("delete() de chave inexistente", () => s3.file("nao/existe.txt").delete()); // também não lança
await tenta("bucket inexistente", () => s3.file("a.txt", { bucket: "nao-existe" }).text());
await tenta("chave vazia", () => s3.file("").text());

const segredoErrado = new S3Client({ ...base, accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: "errado" });
await tenta("segredo errado (text)", () => segredoErrado.file("a.txt").text());
await tenta("segredo errado (exists, um HEAD sem corpo)", () => segredoErrado.file("a.txt").exists());
const acessoErrado = new S3Client({ ...base, accessKeyId: "inexistente", secretAccessKey: "errado" });
await tenta("chave de acesso inexistente (text)", () => acessoErrado.file("a.txt").text());

const recusada = new S3Client({ ...base, endpoint: "http://127.0.0.1:35069", accessKeyId: "x", secretAccessKey: "y" });
await tenta("ligação recusada", () => recusada.file("a.txt").text());
await tenta("método de presign inválido", async () => s3.presign("a.txt", { method: "PATCH" as any }));

// URL pré-assinado: expirado e adulterado
await s3.write("exemplos/erro.txt", "x");
const curto = s3.presign("exemplos/erro.txt", { expiresIn: 1 });
await Bun.sleep(2200);
const expirado = await fetch(curto);
console.log("URL expirado:", expirado.status, (await expirado.text()).match(/<Message>(.*)<\/Message>/)?.[1]);
const adulterado = await fetch(s3.presign("exemplos/erro.txt").replace("X-Amz-Signature=", "X-Amz-Signature=00"));
console.log("assinatura adulterada:", adulterado.status, (await adulterado.text()).match(/<Code>(.*)<\/Code>/)?.[1]);
await s3.delete("exemplos/erro.txt");
