// Tempo, versão, caminhos, streams e buffers
console.log("--- tempo ---");
const t0 = Bun.nanoseconds();
const p0 = performance.now();
await Bun.sleep(50);
console.log("sleep(50)  nanoseconds:", ((Bun.nanoseconds() - t0) / 1e6).toFixed(1), "ms | performance.now:", (performance.now() - p0).toFixed(1), "ms");
console.log("tipos      :", typeof Bun.nanoseconds(), typeof performance.now());
const t1 = Bun.nanoseconds(); Bun.sleepSync(20); console.log("sleepSync(20):", ((Bun.nanoseconds() - t1) / 1e6).toFixed(1), "ms");
await Bun.sleep(new Date(Date.now() + 10)); console.log("sleep até uma Date: ok");

console.log("--- peek ---");
const pronta = Promise.resolve(42);
const pendente = new Promise(() => {});
const falhada = Promise.reject(new Error("falhou")); falhada.catch(() => {});
await pronta;
console.log("peek pronta  :", Bun.peek(pronta), Bun.peek.status(pronta));
console.log("peek pendente:", Bun.peek(pendente) === pendente, Bun.peek.status(pendente));
console.log("peek falhada :", Bun.peek.status(falhada), (Bun.peek(falhada) as Error).message);
console.log("peek valor   :", Bun.peek(7));

console.log("--- versão, which, caminhos ---");
console.log("version      :", Bun.version, "| revision:", Bun.revision.slice(0, 9));
console.log("which bun    :", Bun.which("bun"));
console.log("which inexistente:", Bun.which("programa-que-nao-existe"));
console.log("which com PATH própria:", Bun.which("bun", { PATH: "C:/nao-existe" }));
console.log("pathToFileURL:", Bun.pathToFileURL("C:/loja/ficheiro com espaços.txt").href);
console.log("fileURLToPath:", Bun.fileURLToPath("file:///C:/loja/ficheiro%20com%20espa%C3%A7os.txt"));
console.log("openInEditor :", typeof Bun.openInEditor, "(não executado: abre o editor do utilizador)");

console.log("--- readableStreamTo* ---");
const mk = (...partes: string[]) => new ReadableStream({ start(c) { for (const p of partes) c.enqueue(new TextEncoder().encode(p)); c.close(); } });
console.log("text         :", JSON.stringify(await Bun.readableStreamToText(mk("olá ", "loja"))));
console.log("json         :", JSON.stringify(await Bun.readableStreamToJSON(mk('{"id":', "4}"))));
console.log("bytes        :", await Bun.readableStreamToBytes(mk("ab")));
console.log("arrayBuffer  :", (await Bun.readableStreamToArrayBuffer(mk("abc"))).byteLength);
console.log("blob         :", (await Bun.readableStreamToBlob(mk("abc"))).size);
const objs = new ReadableStream({ start(c) { c.enqueue({ id: 1 }); c.enqueue({ id: 2 }); c.close(); } });
console.log("array        :", JSON.stringify(await Bun.readableStreamToArray(objs)));

console.log("--- buffers ---");
const juntos = Bun.concatArrayBuffers([new Uint8Array([1, 2]), new Uint8Array([3]).buffer]);
console.log("concat       :", new Uint8Array(juntos), juntos.constructor.name);
console.log("concat Uint8 :", Bun.concatArrayBuffers([new Uint8Array([1]), new Uint8Array([2])], Infinity, true));
const sink = new Bun.ArrayBufferSink();
sink.start({ asUint8Array: true, highWaterMark: 1024 });
sink.write("olá "); sink.write(new Uint8Array([108, 111, 106, 97])); // "loja"
console.log("ArrayBufferSink:", new TextDecoder().decode(sink.end() as Uint8Array));

const dados = new TextEncoder().encode("linha 1\nlinha 2\r\nlinha 3");
console.log("indexOfLine  :", Bun.indexOfLine(dados, 0), Bun.indexOfLine(dados, 8), Bun.indexOfLine(dados, 17), Bun.indexOfLine(dados, 20));
