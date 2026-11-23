// cluster com node:net: segundo a documentação do Bun, os servidores net são partilhados pelo primário
import cluster from "node:cluster";
import net from "node:net";

const PORTA = 35115;

if (cluster.isPrimary) {
  let prontos = 0;
  for (let i = 0; i < 2; i++) cluster.fork();
  cluster.on("listening", async () => {
    if (++prontos < 2) return;
    const pids = new Map<string, number>();
    for (let i = 0; i < 40; i++) {
      const resp = await new Promise<string>((ok) => {
        const c = net.connect(PORTA, "127.0.0.1");
        let b = ""; c.on("data", (d) => (b += d)); c.on("close", () => ok(b));
      });
      pids.set(resp, (pids.get(resp) ?? 0) + 1);
    }
    console.log("ligações por processo:", pids.size, "processos ->", [...pids.values()].join(" + "));
    for (const id in cluster.workers) cluster.workers[id]!.kill();
  });
  cluster.on("exit", () => { if (!Object.keys(cluster.workers ?? {}).length) process.exit(0); });
  setTimeout(() => process.exit(1), 15000);
} else {
  net.createServer((s) => s.end(String(process.pid))).listen(PORTA);
}
