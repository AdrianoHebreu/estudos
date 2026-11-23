import { setEnvironmentData } from "node:worker_threads";

// Workers a partir de um Blob (TypeScript em memória, sem ficheiro)
const codigo = `
  import { getEnvironmentData } from "node:worker_threads";
  declare var self: Worker;
  self.onmessage = (e: MessageEvent<number>) => {
    const cfg = getEnvironmentData("cfg") as { prefixo: string };
    self.postMessage(cfg.prefixo + (e.data * 2));
  };
`;
setEnvironmentData("cfg", { prefixo: "dobro = " });

process.on("worker", (w) => console.log("evento process 'worker', threadId:", w.threadId));

const url = URL.createObjectURL(new File([codigo], "dobro.ts"));
const w = new Worker(url);
console.log("url:", url.slice(0, 12) + "...");
w.addEventListener("open", () => console.log("evento open: worker pronto"));
w.addEventListener("close", () => console.log("evento close"));
w.onmessage = (e) => console.log(e.data);
w.postMessage(21);          // enfileirada até o script correr
await Bun.sleep(300);

// Um worker sem handlers e sem trabalho pendente termina sozinho (close sem terminate)
const w2 = new Worker(URL.createObjectURL(new File([`console.log("w2 a correr e a acabar")`], "curto.ts")));
await new Promise<void>((ok) => w2.addEventListener("close", () => ok()));
console.log("w2 fechou sozinho");

// ref/unref: um worker com onmessage mantém o processo vivo; unref() larga-o
const w3 = new Worker(URL.createObjectURL(new File([`self.onmessage = () => {}`], "preso.ts")));
w3.unref();
console.log("w3 com unref(): o processo pode terminar sem terminate()");

// Mensagem enviada enquanto o worker faz await no topo: perde-se se o handler vem depois do await
const w4 = new Worker(URL.createObjectURL(new File([`
  declare var self: Worker;
  await Bun.sleep(100);
  self.onmessage = (e) => self.postMessage("w4 recebeu " + e.data);
`], "tarde.ts")));
w4.onmessage = (e) => console.log(e.data);
w4.postMessage("cedo");
await Bun.sleep(500);
w4.postMessage("tarde");
await Bun.sleep(300);
w4.terminate();
w.terminate();
