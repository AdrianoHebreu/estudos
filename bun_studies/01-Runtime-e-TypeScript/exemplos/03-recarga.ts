// Mostra a diferença entre --watch e --hot: o PID e o estado em globalThis.
const g = globalThis as any;
g.recargas = (g.recargas ?? 0) + 1;
const MENSAGEM = "versao A";
console.log(`[${MENSAGEM}] pid=${process.pid} recargas=${g.recargas} reload-count-local=1`);
// Rede de segurança: o processo termina sozinho ao fim de 9 segundos.
setTimeout(() => process.exit(0), 9000);
