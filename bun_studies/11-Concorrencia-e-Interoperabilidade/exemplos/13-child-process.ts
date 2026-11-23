// node:child_process dentro do Bun
import { spawn, exec, execFile, execSync, spawnSync, fork } from "node:child_process";
import { promisify } from "node:util";

if (process.argv[2] === "filho") {
  process.on("message", (m: any) => {
    process.send!({ eco: m, pid_diferente: true });
    process.disconnect();
  });
  process.send!("filho pronto");
} else {
  // spawnSync / execSync
  const r = spawnSync(process.execPath, ["-e", "console.log(1+1)"], { encoding: "utf8" });
  console.log("spawnSync:", JSON.stringify(r.stdout.trim()), "status", r.status);
  console.log("execSync:", execSync(`"${process.execPath}" -e "console.log('olá')"`, { encoding: "utf8" }).trim());

  // spawn com streams
  const s = spawn(process.execPath, ["-e", "console.log('linha A'); console.error('erro B')"]);
  s.stdout.on("data", (d) => console.log("spawn stdout:", String(d).trim()));
  s.stderr.on("data", (d) => console.log("spawn stderr:", String(d).trim()));
  await new Promise((ok) => s.on("close", (code) => { console.log("spawn close:", code); ok(null); }));

  // execFile / exec promisificados
  const { stdout } = await promisify(execFile)(process.execPath, ["--version"]);
  console.log("execFile --version:", stdout.trim());
  const { stdout: o2 } = await promisify(exec)("echo do-shell");
  console.log("exec:", o2.trim());

  // fork com IPC (o filho corre com o mesmo executável: Bun)
  const f = fork(new URL(import.meta.url).pathname.replace(/^\//, ""), ["filho"]);
  f.on("message", (m) => { console.log("fork recebeu:", JSON.stringify(m)); if (m === "filho pronto") f.send({ ola: 1 }); });
  await new Promise((ok) => f.on("exit", (c) => { console.log("fork exit:", c); ok(null); }));

  // código de saída e erro de comando inexistente
  const e = spawnSync("comando-que-nao-existe-xyz", { encoding: "utf8" });
  console.log("inexistente:", e.error?.message.slice(0, 50), "| status", e.status);
}
