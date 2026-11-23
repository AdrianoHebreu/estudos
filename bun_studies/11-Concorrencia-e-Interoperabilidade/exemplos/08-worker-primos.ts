declare var self: Worker;
function contarPrimos(de: number, ate: number): number {
  let n = 0;
  for (let i = Math.max(2, de); i < ate; i++) {
    let primo = true;
    for (let d = 2; d * d <= i; d++) if (i % d === 0) { primo = false; break; }
    if (primo) n++;
  }
  return n;
}
self.onmessage = (e: MessageEvent<[number, number]>) => {
  self.postMessage(contarPrimos(e.data[0], e.data[1]));
};
