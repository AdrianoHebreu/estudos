// node:fs/promises, node:path e URLs de ficheiro (tudo vem com o Bun)
import { mkdir, readdir, stat, rm, rename, appendFile, mkdtemp, watch } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const base = await mkdtemp(path.join(tmpdir(), "bn02-"));
console.log("pasta temporária criada:", path.basename(base).startsWith("bn02-"));

// mkdir recursivo, readdir, stat
await mkdir(path.join(base, "a/b/c"), { recursive: true });
await Bun.write(path.join(base, "a/ficheiro.txt"), "12345");
console.log("readdir:", await readdir(path.join(base, "a")));
const entradas = await readdir(path.join(base, "a"), { withFileTypes: true });
console.log("tipos:", entradas.map(e => `${e.name}:${e.isDirectory() ? "pasta" : "ficheiro"}`));
console.log("readdir recursive:", (await readdir(base, { recursive: true })).sort());
const s = await stat(path.join(base, "a/ficheiro.txt"));
console.log("stat:", s.size, s.isFile(), s.mtime instanceof Date);

// acrescentar ao fim: o que o writer() não faz por omissão
const log = path.join(base, "acesso.log");
await appendFile(log, "linha 1\n");
await appendFile(log, "linha 2\n");
console.log("appendFile:", JSON.stringify(await Bun.file(log).text()));

await rename(log, path.join(base, "acesso-antigo.log"));
console.log("existsSync:", existsSync(log), existsSync(path.join(base, "acesso-antigo.log")));

// watch: um async iterator de eventos
const ac = new AbortController();
const eventos: string[] = [];
const observador = (async () => {
  try {
    for await (const ev of watch(base, { signal: ac.signal })) eventos.push(`${ev.eventType}:${ev.filename}`);
  } catch (e: any) { if (e.name !== "AbortError") throw e; }
})();
await Bun.sleep(100);
await Bun.write(path.join(base, "novo.txt"), "olá");
await Bun.sleep(300);
ac.abort();
await observador;
console.log("eventos do watch:", [...new Set(eventos)]);

// remover
await rm(base, { recursive: true, force: true });
console.log("existsSync depois do rm:", existsSync(base));

// node:path no Windows
console.log("sep:", JSON.stringify(path.sep), "| delimiter:", path.delimiter);
console.log("join:", path.join("dados", "..", "src", "main.ts"));
console.log("resolve é absoluto:", path.isAbsolute(path.resolve("dados")));
console.log("parse:", path.parse("C:/temp/loja.sql"));
console.log("posix.join:", path.posix.join("dados", "loja.sql"), "| win32.join:", path.win32.join("dados", "loja.sql"));
console.log("relative:", path.relative("C:/temp/a/b", "C:/temp/c/d.txt"));

// import.meta e URLs
console.log("import.meta.file:", import.meta.file);
console.log("import.meta.path == dir + file:", import.meta.path === path.join(import.meta.dir, import.meta.file));
const url = pathToFileURL("C:/temp/loja.sql");
console.log("pathToFileURL:", url.href);
console.log("fileURLToPath:", fileURLToPath(url));
console.log("Bun.pathToFileURL:", Bun.pathToFileURL("C:/temp/loja.sql").href);
console.log("Bun.fileURLToPath:", Bun.fileURLToPath("file:///C:/temp/loja.sql"));
console.log("URL com espaços:", pathToFileURL("C:/temp/minha loja.sql").href);
