// Bun.file: uma referência preguiçosa a um ficheiro (BunFile, que é um Blob)
const LOJA = import.meta.dir + "/../../00-Introducao/dados/loja.sql";
const ficheiro = Bun.file(LOJA);

console.log("nome:", ficheiro.name?.split(/[\/]/).pop());
console.log("size:", ficheiro.size, "bytes");
console.log("type:", ficheiro.type);
console.log("lastModified é número:", typeof ficheiro.lastModified);
console.log("exists:", await ficheiro.exists());
console.log("instanceof Blob:", ficheiro instanceof Blob);

const texto = await ficheiro.text();
console.log("linhas:", texto.split("\n").length, "| primeira:", texto.split("\n")[0]);

const bytes = await ficheiro.bytes();
console.log("bytes:", bytes.constructor.name, bytes.length);
const buffer = await ficheiro.arrayBuffer();
console.log("arrayBuffer:", buffer.constructor.name, buffer.byteLength);

// slice: lê só uma parte, sem carregar o resto
const inicio = await ficheiro.slice(0, 30).text();
console.log("slice(0, 30):", JSON.stringify(inicio));

// stream: lê aos blocos
let blocos = 0, total = 0;
for await (const bloco of ficheiro.stream()) {
  blocos++;
  total += bloco.byteLength;
}
console.log("stream:", blocos, "bloco(s),", total, "bytes");

// size e lastModified ficam em cache na referência: para ver o estado atual, cria outra Bun.file
const temp = import.meta.dir + "/temp-01.txt";
await Bun.write(temp, "olá");
const ref = Bun.file(temp);
console.log("size:", ref.size, "bytes (olá tem 4 em UTF-8)");
await ref.delete();
console.log("mesma referência, exists:", await ref.exists(), "| referência nova, exists:", await Bun.file(temp).exists());

// ficheiro inexistente: Bun.file não falha, só a leitura falha
const falta = Bun.file(import.meta.dir + "/nao-existe.txt");
console.log("exists:", await falta.exists(), "| size:", falta.size);
try {
  await falta.text();
} catch (e: any) {
  console.log("erro:", e.code, "|", e.message.split(",")[0]);
}
