// Cookies nativos: request.cookies (CookieMap), Bun.Cookie e Set-Cookie automático.
const server = Bun.serve({
  port: 35035,
  hostname: "127.0.0.1",
  routes: {
    "/cookies/ler": (req) => {
      return Response.json({
        sessao: req.cookies.get("sessao"),
        tema: req.cookies.get("tema"),
        tem: req.cookies.has("sessao"),
        todos: Object.fromEntries(req.cookies),
      });
    },
    "/cookies/definir": (req) => {
      // as alterações ao CookieMap viram cabeçalhos Set-Cookie na resposta
      req.cookies.set("sessao", "abc123", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 3600 });
      req.cookies.set("tema", "escuro");
      return new Response("definidos");
    },
    "/cookies/apagar": (req) => {
      req.cookies.delete("sessao");
      return new Response("apagado");
    },
  },
});
const b = server.url.origin;

let r = await fetch(b + "/cookies/definir");
console.log("Set-Cookie:", r.headers.getSetCookie());

r = await fetch(b + "/cookies/ler", { headers: { Cookie: "sessao=abc123; tema=escuro" } });
console.log("ler:", await r.json());

r = await fetch(b + "/cookies/apagar", { headers: { Cookie: "sessao=abc123" } });
console.log("apagar:", r.headers.getSetCookie());

console.log("--- Bun.Cookie e Bun.CookieMap fora do servidor");
const c = new Bun.Cookie("carrinho", "3 itens", { secure: true, sameSite: "strict", maxAge: 60 });
console.log(c.toString());
console.log(c.name, c.value, c.secure, c.sameSite, c.maxAge, c.path);
console.log("parse:", Bun.Cookie.parse("a=1; Path=/x; HttpOnly").toJSON());

const mapa = new Bun.CookieMap("x=1; y=dois");
mapa.set("z", "3");
console.log([...mapa], mapa.size, mapa.toSetCookieHeaders());

await server.stop();
