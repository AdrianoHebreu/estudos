// MessageChannel e BroadcastChannel: canais entre workers sem passar pela thread principal
const { port1, port2 } = new MessageChannel();
const codigoA = `
  declare var self: Worker;
  self.onmessage = (e: MessageEvent) => {
    const porta: MessagePort = e.data.porta;
    porta.postMessage("A diz olá ao B");
    porta.onmessage = (m) => { self.postMessage("A recebeu: " + m.data); };
  };
`;
const codigoB = `
  declare var self: Worker;
  self.onmessage = (e: MessageEvent) => {
    const porta: MessagePort = e.data.porta;
    porta.onmessage = (m) => porta.postMessage("B responde a '" + m.data + "'");
    self.postMessage("B pronto");
  };
`;
const a = new Worker(URL.createObjectURL(new File([codigoA], "a.ts")));
const b = new Worker(URL.createObjectURL(new File([codigoB], "b.ts")));
const fim = new Promise<void>((ok) => { a.onmessage = (e) => { console.log(e.data); ok(); }; });
b.onmessage = (e) => { console.log(e.data); a.postMessage({ porta: port1 }, [port1]); };
b.postMessage({ porta: port2 }, [port2]); // as portas são transferidas, não copiadas
await fim;

// BroadcastChannel: um para todos (mesmo nome de canal)
const bc = new BroadcastChannel("avisos");
const w = new Worker(URL.createObjectURL(new File([`
  const bc = new BroadcastChannel("avisos");
  bc.onmessage = (e) => { bc.postMessage("worker viu: " + e.data); bc.close(); };
  postMessage("a ouvir");
`], "c.ts")));
await new Promise<void>((ok) => (w.onmessage = () => ok()));
const resposta = new Promise<string>((ok) => (bc.onmessage = (e) => ok(e.data)));
bc.postMessage("promoção da semana");
console.log(await resposta);
bc.close(); a.terminate(); b.terminate(); w.terminate();
