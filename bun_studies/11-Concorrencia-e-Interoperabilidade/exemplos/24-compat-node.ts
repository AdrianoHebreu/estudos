// Cada módulo node:* é importado e usado de forma mínima. Só passa quem executou sem erro.
import { Readable, Writable, pipeline } from "node:stream";

type Teste = [string, () => Promise<unknown> | unknown];

const testes: Teste[] = [
  ["fs", async () => {
    const fs = await import("node:fs/promises");
    const f = (await import("node:os")).tmpdir() + "/est-bn11-compat.txt";
    await fs.writeFile(f, "olá");
    const t = await fs.readFile(f, "utf8");
    await fs.rm(f);
    return t;
  }],
  ["path", async () => (await import("node:path")).join("a", "..", "b", "c.txt")],
  ["os", async () => { const os = await import("node:os"); return `${os.platform()} ${os.arch()} cpus=${os.cpus().length}`; }],
  ["crypto", async () => {
    const c = await import("node:crypto");
    return c.createHash("sha256").update("loja").digest("hex").slice(0, 16) + " " + c.randomUUID().length;
  }],
  ["events", async () => {
    const { EventEmitter, once } = await import("node:events");
    const e = new EventEmitter();
    setTimeout(() => e.emit("x", 42), 1);
    return (await once(e, "x"))[0];
  }],
  ["stream", async () => {
    const saida: string[] = [];
    await new Promise<void>((ok, ko) => pipeline(Readable.from(["a", "b", "c"]), new Writable({ write(c, _e, cb) { saida.push(String(c).toUpperCase()); cb(); } }), (e) => (e ? ko(e) : ok())));
    return saida.join("");
  }],
  ["util", async () => { const u = await import("node:util"); return u.format("%s tem %d", "loja", 3) + " | " + u.inspect({ a: { b: 1 } }, { compact: true }) + " | " + u.types.isPromise(Promise.resolve()); }],
  ["zlib", async () => {
    const z = await import("node:zlib");
    const comp = z.gzipSync("x".repeat(1000));
    return `${comp.length} bytes -> ${z.gunzipSync(comp).length}`;
  }],
  ["readline", async () => {
    const rl = (await import("node:readline")).createInterface({ input: Readable.from(["l1\nl2\n", "l3\n"]) });
    const linhas: string[] = [];
    for await (const l of rl) linhas.push(l);
    return linhas.join(",");
  }],
  ["http", async () => {
    const http = await import("node:http");
    const srv = http.createServer((_q, r) => r.end("resposta node:http"));
    await new Promise<void>((ok) => srv.listen(35113, "127.0.0.1", ok));
    const txt = await new Promise<string>((ok) => http.get("http://127.0.0.1:35113/", (r) => { let b = ""; r.on("data", (d) => (b += d)); r.on("end", () => ok(b)); }));
    await new Promise((ok) => srv.close(ok));
    return txt;
  }],
  ["net", async () => {
    const net = await import("node:net");
    const srv = net.createServer((s) => s.end("pong"));
    await new Promise<void>((ok) => srv.listen(35114, "127.0.0.1", ok));
    const txt = await new Promise<string>((ok) => { const c = net.connect(35114, "127.0.0.1"); let b = ""; c.on("data", (d) => (b += d)); c.on("close", () => ok(b)); });
    await new Promise((ok) => srv.close(ok));
    return txt;
  }],
  ["dns", async () => { const r = await (await import("node:dns/promises")).lookup("localhost"); return r.address; }],
  ["child_process", async () => (await import("node:child_process")).execFileSync(process.execPath, ["-e", "console.log(7*6)"], { encoding: "utf8" }).trim()],
  ["worker_threads", async () => {
    const { Worker } = await import("node:worker_threads");
    return await new Promise((ok) => {
      const w = new Worker("require('node:worker_threads').parentPort.postMessage('do worker')", { eval: true });
      w.on("message", (m) => { ok(m); w.terminate(); });
    });
  }],
  ["perf_hooks", async () => { const { performance, PerformanceObserver } = await import("node:perf_hooks"); performance.mark("a"); return `now=${performance.now() > 0} observer=${typeof PerformanceObserver}`; }],
  ["vm", async () => { const vm = await import("node:vm"); return vm.runInNewContext("a + b", { a: 40, b: 2 }); }],
  ["assert", async () => { const a = await import("node:assert/strict"); a.deepEqual({ x: [1] }, { x: [1] }); try { a.equal(1, 2); } catch (e) { return (e as Error).name; } }],
  ["timers", async () => { const t = await import("node:timers/promises"); const v = await t.setTimeout(5, "valor"); return v; }],
  ["url", async () => { const u = await import("node:url"); return u.fileURLToPath("file:///C:/a/b.txt") + " | " + u.pathToFileURL("C:/x y").href; }],
  ["buffer", async () => (await import("node:buffer")).Buffer.from("olá").toString("base64")],
  ["string_decoder", async () => { const d = new (await import("node:string_decoder")).StringDecoder("utf8"); return d.write(Buffer.from([0xc3])) + "|" + d.write(Buffer.from([0xa1])); }],
  ["async_hooks", async () => typeof (await import("node:async_hooks")).AsyncLocalStorage],
  ["querystring", async () => JSON.stringify((await import("node:querystring")).parse("a=1&b=2&b=3"))],
  ["tty", async () => (await import("node:tty")).isatty(1)],
  ["module", async () => typeof (await import("node:module")).createRequire(import.meta.url)("node:path").join],
  ["http2", async () => typeof (await import("node:http2")).createServer],
  ["https", async () => typeof (await import("node:https")).request],
  ["tls", async () => typeof (await import("node:tls")).connect],
  ["dgram", async () => typeof (await import("node:dgram")).createSocket],
  ["inspector", async () => typeof (await import("node:inspector")).Session],
  ["v8", async () => { const v8 = await import("node:v8"); return typeof v8.getHeapStatistics().total_heap_size; }],
  ["diagnostics_channel", async () => typeof (await import("node:diagnostics_channel")).channel],
  ["sqlite", async () => { const m: any = await import("node:sqlite"); return typeof m.DatabaseSync; }],
  ["test", async () => typeof (await import("node:test")).test],
  ["cluster", async () => typeof (await import("node:cluster")).default.fork],
];

const linhas: string[] = [];
for (const [nome, fn] of testes) {
  try {
    const r = await Promise.race([Promise.resolve(fn()), new Promise((_, ko) => setTimeout(() => ko(new Error("timeout 5 s")), 5000))]);
    linhas.push(`${nome.padEnd(20)} OK     ${String(r).slice(0, 60)}`);
  } catch (e) {
    linhas.push(`${nome.padEnd(20)} FALHOU ${(e as Error).message.split("\n")[0].slice(0, 70)}`);
  }
}
console.log(linhas.join("\n"));
process.exit(0);
