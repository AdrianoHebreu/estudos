// Bun.which, Bun.sleep, process e node:os: o sistema onde o programa corre
import os from "node:os";

// Bun.which: onde está um executável? (null se não existir)
console.log("which bun        :", Bun.which("bun")?.split(/[\\/]/).slice(-2).join("/"));
console.log("which comando-xyz:", Bun.which("comando-xyz"));
console.log("which com PATH vazio:", Bun.which("bun", { PATH: "" }));

// Bun.sleep (assíncrono, aceita ms ou Date) e Bun.sleepSync (bloqueia tudo)
let t = performance.now();
await Bun.sleep(200);
console.log("Bun.sleep(200) demorou >= 190 ms:", performance.now() - t >= 190);
t = performance.now();
Bun.sleepSync(100);
console.log("Bun.sleepSync(100) demorou >= 95 ms:", performance.now() - t >= 95);
await Bun.sleep(new Date(Date.now() + 50));

// process e node:os
console.log("platform:", process.platform, "| arch:", process.arch, "| os.type:", os.type(), "| os.release:", os.release());
console.log("EOL é CRLF:", os.EOL === "\r\n", "| devNull:", os.devNull);
console.log("cpus >= 1:", os.availableParallelism() >= 1, "| memória total > 0:", os.totalmem() > 0);
console.log("cwd:", process.cwd() === import.meta.dir ? "= import.meta.dir" : "diferente de import.meta.dir (depende de onde corres o comando)");
console.log("Bun.version:", Bun.version, "| process.versions.bun:", process.versions.bun);
console.log("Bun.env === process.env:", Bun.env === process.env, "| Bun.main é este ficheiro:", Bun.main === import.meta.path);

// código que depende do sistema operativo
const abrir = process.platform === "win32" ? ["cmd", "/c", "echo", "olá do cmd"]
            : process.platform === "darwin" ? ["echo", "olá do macOS"] : ["echo", "olá do Linux"];
console.log("comando escolhido:", abrir.join(" "));
console.log("saída:", Bun.spawnSync(abrir).stdout.toString().trim());
