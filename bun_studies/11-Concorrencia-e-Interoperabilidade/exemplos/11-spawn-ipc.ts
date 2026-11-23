// Bun.spawn com ipc: comunicação bidirecional pai <-> filho (filho Bun usa process.send / process.on("message"))
const filho = Bun.spawn([process.execPath, new URL("./11-filho-ipc.ts", import.meta.url).pathname.replace(/^\//, "")], {
  ipc(mensagem, subprocesso) {
    console.log("pai recebeu:", mensagem);
    if (mensagem.pronto) subprocesso.send({ tarefa: "somar", valores: [1, 2, 3, 4] });
    if (mensagem.resultado !== undefined) subprocesso.send("terminar");
  },
  onExit(_proc, codigo, sinal) {
    console.log("filho terminou: código", codigo, "sinal", sinal);
  },
  stdout: "inherit",
});
console.log("pid do filho é número:", typeof filho.pid === "number");
await filho.exited;
console.log("fim; process.send existe no pai?", typeof process.send);
