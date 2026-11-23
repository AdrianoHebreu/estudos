// node:cluster: vários processos a partilhar a mesma porta
import cluster from "node:cluster";
import http from "node:http";

const PORTA = 35110;

if (cluster.isPrimary) {
  console.log("primário pid", process.pid, "| isPrimary:", cluster.isPrimary);
  const pids = new Set<number>();
  for (let i = 0; i < 2; i++) {
    const w = cluster.fork();
    w.on("message", (m) => console.log("primário recebeu:", m));
  }
  cluster.on("listening", (w, addr) => console.log(`worker ${w.id} a ouvir na porta ${addr.port}`));
  let ouvintes = 0;
  cluster.on("listening", async () => {
    if (++ouvintes < 2) return;
    for (let i = 0; i < 40; i++) {
      const t = await (await fetch(`http://127.0.0.1:${PORTA}/`)).text();
      pids.add(Number(t));
    }
    console.log("pedidos servidos por", pids.size, "processo(s) diferente(s)");
    for (const id in cluster.workers) cluster.workers[id]!.kill();
  });
  cluster.on("exit", (w, code, sinal) => {
    console.log(`worker ${w.id} saiu (código ${code}, sinal ${sinal})`);
    if (Object.keys(cluster.workers ?? {}).length === 0) process.exit(0);
  });
  setTimeout(() => { console.log("tempo esgotado"); for (const id in cluster.workers) cluster.workers[id]!.kill(); process.exit(1); }, 15000);
} else {
  http.createServer((_req, res) => res.end(String(process.pid))).listen(PORTA);
  process.send!({ sou: "worker", id: cluster.worker!.id });
}
