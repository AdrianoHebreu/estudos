// A opção serialization: "advanced" (structured clone, o predefinido do Bun) ou "json" (compatível com o Node)
const filhoPath = new URL("./11-filho-ipc.ts", import.meta.url).pathname.replace(/^\//, "");

async function correr(serialization: "advanced" | "json") {
  let recebido: any;
  const p = Bun.spawn([process.execPath, filhoPath], {
    serialization,
    ipc(m, sub) {
      if (m.pronto) sub.send({ tarefa: "somar", valores: [5, 5] });
      else if (m.resultado !== undefined) { recebido = m; sub.send("terminar"); }
    },
    stdout: "ignore",
  });
  await p.exited;
  console.log(serialization.padEnd(8), "->", "data é", recebido.data instanceof Date ? "Date" : typeof recebido.data, "| valor:", recebido.data);
}
await correr("advanced");
await correr("json");

// Um filho NODE (24) a falar com um pai Bun: tem de ser JSON
const node = Bun.spawn(["node", "-e", `
  process.on("message", (m) => { process.send({ eco: m, runtime: "node " + process.versions.node }); process.exit(0); });
  process.send("pronto");
`], {
  serialization: "json",
  ipc(m, sub) {
    console.log("pai (Bun) recebeu do Node:", JSON.stringify(m));
    if (m === "pronto") sub.send({ ola: "do Bun " + Bun.version });
  },
});
await node.exited;
console.log("node saiu com código", node.exitCode);
