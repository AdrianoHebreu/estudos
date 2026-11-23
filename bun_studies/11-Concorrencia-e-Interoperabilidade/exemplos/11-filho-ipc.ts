console.log("filho: process.send é", typeof process.send, "| connected:", process.connected);
process.on("message", (m: any) => {
  if (m === "terminar") { process.disconnect?.(); return; }
  if (m.tarefa === "somar") process.send!({ resultado: m.valores.reduce((a: number, b: number) => a + b, 0), data: new Date(0) });
});
process.send!({ pronto: true });
