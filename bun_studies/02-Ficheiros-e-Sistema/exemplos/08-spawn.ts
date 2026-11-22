// Bun.spawn e Bun.spawnSync: processos filhos com controlo total
import { $ } from "bun";

// 1. spawnSync: espera e devolve tudo de uma vez
const s = Bun.spawnSync(["bun", "-e", "console.log('saída'); console.error('aviso'); process.exit(3)"]);
console.log("spawnSync -> exitCode:", s.exitCode, "| success:", s.success);
console.log("  stdout:", JSON.stringify(s.stdout.toString()), "| stderr:", JSON.stringify(s.stderr.toString()));

// 2. spawn: assíncrono; stdout é um ReadableStream
const p = Bun.spawn(["bun", "--version"]);
console.log("spawn -> pid é número:", typeof p.pid === "number");
console.log("  versão:", (await new Response(p.stdout).text()).trim(), "| exited:", await p.exited);

// 3. falar com o processo pelo stdin (pipe)
const filtro = Bun.spawn(
  ["bun", "-e", "const t = await Bun.stdin.text(); console.log(t.toUpperCase().trim())"],
  { stdin: "pipe", stdout: "pipe" },
);
filtro.stdin.write("romance policial\n");
filtro.stdin.write("atlas mundial\n");
filtro.stdin.end();
console.log("stdin por pipe ->", JSON.stringify((await filtro.stdout.text()).trim()), "| exitCode:", await filtro.exited);

// 4. cwd e env
const e = Bun.spawnSync(["bun", "-e", "console.log(process.cwd(), process.env.LOJA)"], {
  cwd: "C:/temp",
  env: { ...process.env, LOJA: "Loja do Estudo" },
});
console.log("cwd e env ->", e.stdout.toString().trim());

// 5. kill: termina SÓ o processo que lançaste, pelo objeto (ou pelo pid)
const longo = Bun.spawn(["bun", "-e", "setTimeout(() => {}, 60000)"]);
console.log("antes do kill -> killed:", longo.killed, "| exitCode:", longo.exitCode);
longo.kill();
console.log("depois -> exited:", await longo.exited, "| signalCode:", longo.signalCode, "| killed:", longo.killed);

// 6. timeout: o Bun mata o processo por ti
const t = Bun.spawnSync(["bun", "-e", "setTimeout(() => {}, 60000)"], { timeout: 500 });
console.log("timeout -> exitCode:", t.exitCode, "| signalCode:", t.signalCode, "| success:", t.success);

// 6b. AbortSignal: cancelar de fora
const ctl = new AbortController();
const cancelavel = Bun.spawn(["bun", "-e", "setTimeout(() => {}, 60000)"], { signal: ctl.signal });
setTimeout(() => ctl.abort(), 300);
console.log("abort -> exited:", await cancelavel.exited, "| signalCode:", cancelavel.signalCode);

// 7. comando que não existe
try {
  Bun.spawn(["comando-que-nao-existe"]);
} catch (err: any) {
  console.log("inexistente ->", err.code, "|", err.message);
}

// 8. Bun.$ vs Bun.spawn: o mesmo comando
console.log("Bun.$     :", (await $`bun --version`.text()).trim());
console.log("Bun.spawn :", Bun.spawnSync(["bun", "--version"]).stdout.toString().trim());
