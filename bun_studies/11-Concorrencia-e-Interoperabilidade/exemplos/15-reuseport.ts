// Dois processos Bun na mesma porta com reusePort: no Linux o kernel reparte; no Windows?
const PORTA = 35111;
if (process.argv[2] === "filho") {
  try {
    const s = Bun.serve({ port: PORTA, reusePort: true, fetch: () => new Response(String(process.pid)) });
    process.send?.("a ouvir " + s.port);
    await Bun.sleep(3000);
    s.stop(true);
  } catch (e) { process.send?.("erro: " + (e as Error).message); }
  process.exit(0);
} else {
  const filhos = [0, 1].map(() => Bun.spawn([process.execPath, import.meta.path, "filho"], { ipc: (m) => console.log("filho:", m) }));
  await Bun.sleep(800);
  const pids = new Set<string>();
  for (let i = 0; i < 40; i++) {
    try { pids.add(await (await fetch(`http://127.0.0.1:${PORTA}/`)).text()); } catch (e) { pids.add("falhou"); }
  }
  console.log("processos distintos a responder:", pids.size);
  await Promise.all(filhos.map((f) => f.exited));
}
