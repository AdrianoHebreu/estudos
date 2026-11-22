// Corre com: bun --hot 10-hot.ts
// Edita a mensagem, grava, e pede de novo: a porta e o processo mantêm-se.
const arranque = new Date().toISOString().slice(11, 19);

const server = Bun.serve({
  port: 35039,
  hostname: "127.0.0.1",
  fetch() {
    return new Response(`mensagem v1 | processo ${process.pid} | módulo carregado às ${arranque}`);
  },
});

console.log("a ouvir em", server.url.href, "| pid", process.pid);
