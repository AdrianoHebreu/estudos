// node:worker_threads: a mesma tecnologia, com a API do Node (Worker, parentPort, workerData, MessageChannel)
import { Worker, isMainThread, parentPort, workerData, MessageChannel, receiveMessageOnPort, threadId } from "node:worker_threads";

if (isMainThread) {
  const w = new Worker(new URL(import.meta.url), { workerData: { base: 10 } });
  w.on("online", () => console.log("online"));
  w.on("message", (m) => { console.log("principal recebeu:", m); });
  w.on("error", (e) => console.log("erro:", e.message));
  w.on("exit", (code) => console.log("exit code:", code));
  w.postMessage(5);
  w.postMessage("fim");

  // MessageChannel: canal entre duas pontas, que se pode passar a um worker como transferível
  const { port1, port2 } = new MessageChannel();
  port1.postMessage({ x: 1 });
  console.log("receiveMessageOnPort (síncrono):", receiveMessageOnPort(port2));
  console.log("sem mensagem:", receiveMessageOnPort(port2));
  port1.close();

  // Comparar com o Worker "web" global
  console.log("são a mesma classe?", Worker === globalThis.Worker);
} else {
  parentPort!.on("message", (m) => {
    if (m === "fim") { process.exit(0); }
    parentPort!.postMessage({ threadId, resultado: workerData.base + m });
  });
}
