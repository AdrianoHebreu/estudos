// URL, URLSearchParams, URLPattern, Blob, File e FormData (APIs Web, sem rede)
const u = new URL("https://loja.exemplo.pt:8443/api/produtos/4?categoria=2&max=50#detalhe");
console.log(u.protocol, u.host, u.hostname, u.port, u.pathname, u.search, u.hash);
console.log("origin:", u.origin, "| searchParams.get:", u.searchParams.get("max"));
console.log("relativa:", new URL("../encomendas?estado=enviada", u).href);
console.log("canParse:", URL.canParse("/sem-base"), URL.canParse("/com-base", "http://x.pt"), "| parse:", URL.parse("lixo"));

const q = new URLSearchParams({ nome: "Manta de Sofá", cidade: "Coimbra" });
q.append("tag", "casa");
q.append("tag", "inverno");
console.log(q.toString());                  // acentos e espaços são codificados
console.log(q.getAll("tag"), q.has("nome"), [...q.keys()]);
console.log(Object.fromEntries(new URLSearchParams("a=1&b=2&a=3")), "(o último a ganha no objeto)");
q.sort();
console.log("ordenado:", q.toString());

// URLPattern: casar caminhos e extrair parâmetros.
// Nota: com :id(\d+) o teste deu sempre false no Bun 1.4.0 (e no Node 24.18); [0-9]+ funciona.
const padrao = new URLPattern({ pathname: "/api/produtos/:id([0-9]+)" });
console.log("test:", padrao.test("http://x.pt/api/produtos/7"), padrao.test("http://x.pt/api/produtos/abc"));
console.log("groups:", padrao.exec("http://x.pt/api/produtos/7")?.pathname.groups);
const ficheiros = new URLPattern({ pathname: "/estatico/*" });
console.log("wildcard:", ficheiros.exec("http://x.pt/estatico/css/site.css")?.pathname.groups);

// Blob e File
const blob = new Blob(["id;nome\n", "1;Romance Policial\n"], { type: "text/csv" });
console.log("blob:", blob.size, blob.type, JSON.stringify(await blob.slice(0, 7).text()));
const f = new File([blob], "produtos.csv", { type: "text/csv", lastModified: Date.UTC(2025, 0, 1) });
console.log("file:", f.name, f.size, new Date(f.lastModified).toISOString(), f instanceof Blob);
const objUrl = URL.createObjectURL(blob);
console.log("blob url:", objUrl.startsWith("blob:"), "->", (await (await fetch(objUrl)).text()).split("\n")[1]);
URL.revokeObjectURL(objUrl);

// FormData: vários valores, ficheiros, iteração, e conversão de/para corpo de pedido
const fd = new FormData();
fd.append("tag", "casa");
fd.append("tag", "inverno");
fd.set("produto", "9");
fd.set("anexo", f);
console.log([...fd.keys()], fd.getAll("tag"), fd.get("anexo") instanceof File);
const resposta = new Response(fd);   // serializa em multipart
console.log(resposta.headers.get("content-type")?.replace(/boundary=.*/, "boundary=..."));
const lido = await resposta.formData();
console.log("reconstruído:", lido.get("produto"), (lido.get("anexo") as File).name);

// Corpos x-www-form-urlencoded: URLSearchParams como body define o Content-Type
const login = new Request("http://x.pt/login", { method: "POST", body: new URLSearchParams({ user: "ana" }) });
console.log(login.headers.get("content-type"));
