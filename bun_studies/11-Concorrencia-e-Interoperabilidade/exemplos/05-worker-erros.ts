declare var self: Worker;
self.onmessage = async (ev: MessageEvent) => {
  switch (ev.data) {
    case "ping": self.postMessage("pong"); break;
    case "lançar": throw new Error("falhou dentro do worker");
    case "rejeitar": await Promise.reject(new Error("promessa rejeitada")); break;
    case "ciclo-infinito": while (true) { /* ocupa a thread */ }
    case "sair": process.exit(3);
  }
};
