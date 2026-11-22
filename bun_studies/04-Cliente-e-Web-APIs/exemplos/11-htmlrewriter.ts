import { iniciar } from "./servidor-loja.ts";

const server = iniciar();
const base = server.url.origin;

const html = `<!doctype html>
<html><body>
  <h1 id="titulo">Loja</h1>
  <ul>
    <li class="produto" data-id="1">Romance Policial <a href="/api/produtos/1">ver</a></li>
    <li class="produto esgotado" data-id="6">Teclado Mecânico <a href="/api/produtos/6">ver</a></li>
    <li class="produto" data-id="10">Caneca de Cerâmica <a href="/api/produtos/10">ver</a></li>
  </ul>
  <script>alert("anúncio")</script>
  <!-- nota interna -->
  <a href="http://externo.exemplo/promo">promoção</a>
</body></html>`;

// 1. Atributos: tornar absolutos os links relativos e marcar os externos
const r1 = new HTMLRewriter().on("a[href]", {
  element(a) {
    const href = a.getAttribute("href")!;
    if (href.startsWith("/")) a.setAttribute("href", "https://loja.exemplo.pt" + href);
    else a.setAttribute("rel", "noopener nofollow").setAttribute("target", "_blank");
  },
}).transform(html);
console.log(r1.split("\n").filter(l => l.includes("<a ")).join("\n"));

// 2. Remover elementos e comentários
const r2 = new HTMLRewriter()
  .on("script", { element: el => el.remove() })
  .on("li.esgotado", { element: el => el.remove() })
  .onDocument({ comments: c => c.remove() })
  .transform(html);
console.log("\nscript presente:", r2.includes("<script"), "| esgotado presente:", r2.includes("Teclado"), "| comentário:", r2.includes("nota interna"));

// 3. Texto: ler (extrair) e substituir. O texto chega em pedaços: usa lastInTextNode.
const nomes: string[] = [];
let acc = "";
new HTMLRewriter().on("li.produto", {
  text(t) {
    acc += t.text;
    if (t.lastInTextNode) { if (acc.trim()) nomes.push(acc.trim()); acc = ""; }
  },
}).transform(html);
console.log("\nextraído:", nomes);

const r3 = new HTMLRewriter().on("h1#titulo", { element: el => el.setInnerContent("Loja <b>Estudo</b>") }).transform(html);
console.log(r3.match(/<h1.*<\/h1>/)![0], "(escapado por omissão)");
const r3b = new HTMLRewriter().on("h1#titulo", { element: el => el.setInnerContent("Loja <b>Estudo</b>", { html: true }) }).transform(html);
console.log(r3b.match(/<h1.*<\/h1>/)![0]);

// 4. Inserir antes/depois/dentro e usar atributos com seletores
const r4 = new HTMLRewriter()
  .on('li[data-id="10"]', { element(el) { el.before("<!-- novo -->", { html: true }); el.append(" <em>promoção</em>", { html: true }); el.setAttribute("class", "produto destaque"); } })
  .transform(html);
console.log("\n" + r4.split("\n").find(l => l.includes('data-id="10"')));

// 5. Em streaming sobre uma Response de verdade (o servidor local) e a ler o resultado
const resposta = await fetch(`${base}/catalogo.html`);
const transformada = new HTMLRewriter()
  .on("li.produto", { element(el) { el.setAttribute("data-visto", "sim"); } })
  .on("script", { element: el => el.remove() })
  .transform(resposta);
console.log("\ncontent-type mantido:", transformada.headers.get("content-type"));
let pedacos = 0;
let total = "";
for await (const p of transformada.body!) { pedacos++; total += new TextDecoder().decode(p); }
console.log(`${pedacos} pedaço(s);`, total.match(/data-visto/g)?.length, "marcações; script removido:", !total.includes("<script"));

// 6. Contadores com vários seletores ao mesmo tempo
const contagem: Record<string, number> = {};
const contar = (nome: string) => ({ element() { contagem[nome] = (contagem[nome] ?? 0) + 1; } });
new HTMLRewriter().on("li", contar("li")).on("a", contar("a")).on("[data-id]", contar("data-id")).on("li:first-child", contar("primeiro")).transform(html);
console.log(contagem);

// 7. Handler assíncrono: com string o transform() é síncrono e falha; com Response funciona
try {
  new HTMLRewriter().on("h1", { async element() { await Bun.sleep(5); } }).transform(html);
} catch (e: any) { console.log("\nasync + string ->", e.name + ":", e.message.slice(0, 60) + "..."); }
const ok = await new HTMLRewriter().on("h1", { async element(el) { await Bun.sleep(5); el.setInnerContent("async"); } }).transform(new Response(html)).text();
console.log("async + Response ->", ok.match(/<h1.*<\/h1>/)![0]);

await server.stop(true);
