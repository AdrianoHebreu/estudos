// smol: JSC::HeapSize Small em vez de Large. Compara o pico de memória do heap do worker.
const codigo = `
  import { heapStats } from "bun:jsc";
  declare var self: Worker;
  self.onmessage = () => {
    let pico = 0;
    for (let i = 0; i < 15; i++) {
      const lixo = Array.from({ length: 300_000 }, (_, k) => ({ k, s: "x" + k }));
      pico = Math.max(pico, heapStats().heapSize);
      lixo.length = 0;
    }
    self.postMessage({ picoMB: +(pico / 1048576).toFixed(1) });
  };
`;
for (const smol of [false, true, false, true, false, true]) {
  const w = new Worker(URL.createObjectURL(new File([codigo], "w.ts")), { smol });
  const r = await new Promise<any>((ok) => { w.onmessage = (e) => ok(e.data); w.postMessage(0); });
  console.log(`smol=${smol}: pico do heap ${r.picoMB} MB`);
  w.terminate();
}
