// TextEncoder/Decoder e Streams Web (sem rede)
const enc = new TextEncoder();
const bytes = enc.encode("Eletrónica €");
console.log(bytes.length, "bytes para", "Eletrónica €".length, "caracteres:", bytes.slice(0, 8));
console.log(new TextDecoder().decode(bytes));
console.log("latin1:", new TextDecoder("latin1").decode(new Uint8Array([0x4d, 0xe3, 0x6f])), "| utf-8 inválido:", JSON.stringify(new TextDecoder().decode(new Uint8Array([0xff, 0x41]))));
try { new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array([0xff])); } catch (e: any) { console.log("fatal ->", e.name, e.code); }
console.log("encodeInto:", enc.encodeInto("abc", new Uint8Array(2)));

// ReadableStream: produz pedaços. ReadableStream.from aceita iteráveis.
const produtos = ["Romance Policial", "Atlas Mundial", "Caneca de Cerâmica"];
const origem = ReadableStream.from(produtos);

// TransformStream: transforma pedaço a pedaço. pipeThrough liga origem -> transformação.
const maiusculas = new TransformStream<string, string>({
  transform(pedaco, controlo) { controlo.enqueue(pedaco.toUpperCase()); },
});
// WritableStream: consome pedaços
const recolhido: string[] = [];
const destino = new WritableStream<string>({
  write(p) { recolhido.push(p); },
  close() { console.log("WritableStream fechou com", recolhido.length, "pedaços"); },
});
await origem.pipeThrough(maiusculas).pipeTo(destino);
console.log(recolhido);

// Contrapressão: fonte lenta (pull) e consumidor lento; a fonte só produz quando há espaço
let produzidos = 0;
const fonte = new ReadableStream<number>({
  pull(c) { produzidos++; produzidos <= 5 ? c.enqueue(produzidos) : c.close(); },
}, { highWaterMark: 1 });
for await (const n of fonte) { await Bun.sleep(5); process.stdout.write(`lido ${n} (produzidos ${produzidos}); `); }
console.log();

// tee: duas cópias do mesmo fluxo
const [a, b] = ReadableStream.from(["x", "y"]).tee();
console.log(await Array.fromAsync(a), await Array.fromAsync(b));

// TextDecoderStream / TextEncoderStream
const texto = ReadableStream.from([enc.encode("Atlas "), enc.encode("Mundial")]).pipeThrough(new TextDecoderStream());
console.log(await Array.fromAsync(texto));
// Um caractere UTF-8 partido entre dois pedaços é reconstituído (o € tem 3 bytes)
const euro = enc.encode("€");
const partido = ReadableStream.from([euro.slice(0, 1), euro.slice(1)]).pipeThrough(new TextDecoderStream());
console.log("€ partido:", (await Array.fromAsync(partido)).join(""));

// CompressionStream / DecompressionStream: gzip, deflate, deflate-raw
const original = "id;nome\n".repeat(2000);
const comprimido = new Blob([original]).stream().pipeThrough(new CompressionStream("gzip"));
const bufC = await new Response(comprimido).bytes();
console.log(`gzip: ${original.length} -> ${bufC.length} bytes | magic: ${bufC[0].toString(16)} ${bufC[1].toString(16)}`);
const volta = await new Response(new Blob([bufC]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
console.log("ida e volta igual:", volta === original);
console.log("equivalente síncrono do Bun:", Bun.gzipSync(original).length, "bytes");

// Os helpers do Bun para consumir um stream inteiro
console.log(await Bun.readableStreamToText(ReadableStream.from(["a", "b", "c"])));

// Response e Blob também são streams
const r = new Response(ReadableStream.from([enc.encode("ola")]));
console.log(r.body instanceof ReadableStream, await r.text());
