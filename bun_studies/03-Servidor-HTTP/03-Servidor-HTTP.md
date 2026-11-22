# 03 Servidor HTTP

Neste módulo montas um servidor HTTP só com o que o Bun traz: Bun.serve, rotas, Request e Response padrão, ficheiros estáticos, cookies, streaming, WebSocket e recarregamento a quente. No fim documentas a API da loja com OpenAPI 3 e Swagger UI, com uma única tabela de rotas que gera as rotas e a documentação.

Tudo foi executado com o Bun 1.4.0 no Windows 11 (Git Bash), nas portas 35030 a 35039 de 127.0.0.1. A documentação oficial já descreve a 1.4.5: onde a documentação diz algo que não executei, digo-o. Os exemplos estão em exemplos/ (01 a 12 e a pasta loja-api). Os dados vêm do loja.sql do módulo 00, lido por bun:sqlite em memória: o SQLite a sério é o módulo 05, aqui usa-se o mínimo.

## O que substitui

| Biblioteca npm habitual | O que o Bun já traz |
|---|---|
| express, fastify, hono (rotas e parâmetros) | opção routes do Bun.serve |
| body-parser, multer | req.json(), req.text(), req.formData(), req.arrayBuffer() |
| cookie-parser | req.cookies, Bun.CookieMap e Bun.Cookie |
| serve-static, send | Bun.file como corpo da Response, com Content-Type e Range |
| ws, socket.io (só o essencial) | opção websocket e server.upgrade, com publish e subscribe |
| nodemon | bun --hot (e bun --watch) |
| swagger-ui-express, swagger-jsdoc | documento OpenAPI como objeto TypeScript e Swagger UI por CDN |
| ajv, zod (validação) | nada: o Bun não traz validador de JSON Schema (ver mais abaixo) |

## Bun.serve: o mínimo

O Bun.serve recebe um objeto de opções e devolve o servidor. A opção fetch é um handler que recebe um Request e devolve uma Response (ou uma Promise dela), exatamente as classes da API Web.

    const server = Bun.serve({
      port: 35030,
      hostname: "127.0.0.1",
      fetch(req, srv) {
        return new Response(`Olá! ${req.method} ${new URL(req.url).pathname}`);
      },
    });
    console.log(server.port, server.hostname, server.url.href);   // 35030 127.0.0.1 http://127.0.0.1:35030/
    console.log(server.url instanceof URL, server.pendingRequests);   // true 0

Exemplo 01. Com port: 0 o sistema operativo escolhe uma porta livre e lês o resultado em server.port. Sem port, a documentação diz que o Bun usa as variáveis BUN_PORT, PORT ou NODE_PORT e, na falta delas, a 3000 (não testei). Para o hostname, indica 127.0.0.1 quando só queres tráfego local.

**ATENÇÃO:** server.url termina em barra. Concatenar ${server.url}/ola dá duas barras; usa new URL("/ola", server.url) ou, como no exemplo, server.url + "ola".

Parar: await server.stop() deixa os pedidos em curso acabar e recusa novos; server.stop(true) corta as ligações já. Depois de stop(), o fetch ao mesmo endereço falhou com TypeError: Unable to connect. Is the computer able to access the url?; o comportamento de stop() está na documentação, a mensagem de erro medi-a.

## Rotas: a opção routes

Em vez de um fetch com if em cadeia, a opção routes mapeia caminhos para handlers. O valor pode ser uma função, uma Response pronta (rota estática) ou um objeto com um handler por método HTTP.

    routes: {
      "/versao": new Response("loja 1.0"),                          // estática
      "/api/ping": () => Response.json({ ok: true }),
      "/api/produtos/:id": (req) => Response.json({ id: Number(req.params.id) }),
      "/api/encomendas": {
        GET: () => Response.json([]),
        POST: async (req) => Response.json({ recebido: await req.json() }, { status: 201 }),
      },
      "/estatico/*": (req) => new Response("wildcard"),
      "/antigo": Response.redirect("/versao", 301),
    },
    fetch: () => new Response("sem rota", { status: 404 }),         // fallback

Exemplo 02, com estes resultados:

| Pedido | Estado | Nota |
|---|---|---|
| GET /api/produtos/7 | 200 | req.params.id é o texto 7, converte-o tu |
| GET /api/clientes/3/encomendas/11 | 200 | vários parâmetros: cid e eid |
| POST /api/encomendas | 201 | Response.json aceita opções (status) |
| DELETE /api/encomendas | 404 | método não definido cai no fetch: não há 405 automático |
| GET /api/produtos/7/ | 404 | a barra final não casa com a rota |
| GET /estatico/css/a/b.css | 200 | o wildcard apanha tudo por baixo |

Response.json devolve Content-Type: application/json;charset=utf-8. O exemplo 12 confirma a precedência descrita na documentação: rota exata, depois com parâmetro, depois wildcard, depois o catch-all global.

    "/u/todos" -> exata    "/u/7" -> parâmetro 7    "/u/7/x" -> wildcard    "/outra" -> catch-all global

Os parâmetros chegam já descodificados: /ola/Graça%20Nunes dá req.params.nome igual a Graça Nunes (mediu-se; não voltes a aplicar decodeURIComponent). As rotas estáticas ganham ETag e respondem 304 a If-None-Match (testado). Como o conteúdo da Response é criado uma vez, não serve para dados que mudam.

## Request, URL e Headers

O Request é o da API Web. Para a query string usa URL e URLSearchParams.

    const q = new URL(req.url).searchParams;
    q.get("q");                           // "caneca c"   (de ?q=caneca%20c)
    q.getAll("cat").map(Number);          // [1, 3]       (de &cat=1&cat=3)
    Object.fromEntries(q);                // {q, cat: "3", ...}: com repetidos só fica o último
    req.headers.get("host");              // "127.0.0.1:35032"
    req.headers.get("user-agent");        // "Bun/1.4.0" quando o cliente é o fetch do Bun

Exemplo 03. O corpo lê-se uma vez, com o método que corresponde ao tipo de conteúdo:

| Método | Devolve | Resultado no exemplo |
|---|---|---|
| req.json() | o valor JSON | corpo [1, 2] dá um objeto; lança SyntaxError se for inválido |
| req.text() | string | "Ação!" tem 5 caracteres |
| req.arrayBuffer() | bytes | 3 bytes, primeiro 200 |
| req.formData() | FormData | campo nome e um File (a.txt, 9 bytes: o texto tem acento) |

O limite do corpo é a opção maxRequestBodySize (em bytes). Com 1024, um pedido de 2000 bytes recebeu 413 sem sequer chegar ao handler.

**ATENÇÃO:** um req.json() que lança, sem handler de erro, dá 500. Em modo de desenvolvimento (o predefinido: só desliga com NODE_ENV=production ou development: false) a resposta é uma página HTML com o stack trace, o Bun imprime o erro e o processo termina com código de saída 1 no fim, mesmo tendo respondido (medi as duas coisas). Com NODE_ENV=production a resposta é text/plain, mas o código de saída continua a ser 1. Resolve com um handler de erro (ver adiante).

## Ficheiros estáticos com Bun.file

Uma BunFile como corpo de uma Response (ou como valor de rota) dá Content-Type a partir da extensão e Content-Length, e o Bun envia-a sem a carregar toda para a memória (zero-copy, segundo a documentação).

    const ficheiro = Bun.file(`${pasta}/${nome}`);
    if (!(await ficheiro.exists())) return new Response("ficheiro não existe", { status: 404 });
    return new Response(ficheiro);

Exemplo 05: estilo.css respondeu text/css;charset=utf-8, index.html text/html;charset=utf-8 e alfabeto.txt text/plain;charset=utf-8. O pedido de Range funciona sozinho num new Response(ficheiro), tanto na rota de fetch como na rota estática:

| Cabeçalho Range | Estado | Content-Range | Corpo |
|---|---|---|---|
| bytes=0-4 | 206 | bytes 0-4/20 | 01234 |
| bytes=10- | 206 | bytes 10-19/20 | ABCDEFGHIJ |
| bytes=-3 | 206 | bytes 17-19/20 | HIJ |

Para controlares tu o intervalo, file.slice(5, 10) devolve uma BunFile parcial (tamanho 5). A rota de diretório { dir: "./publico" } descrita na documentação também funcionou na 1.4.0 (exemplo 12).

**ATENÇÃO:** nunca juntes o caminho do pedido ao disco sem o limpar. O exemplo recusa nomes com .. ou barra invertida com 403 (testei com /publico/..%2Fsegredo) e descodifica o pathname só uma vez.

## Cookies nativos

Em routes, o req.cookies é um Bun.CookieMap. Ler é get e has; escrever é set e delete, e as alterações viram cabeçalhos Set-Cookie na resposta sem mais código (exemplo 06).

    req.cookies.set("sessao", "abc123", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 3600 });
    // Set-Cookie: sessao=abc123; Path=/; Max-Age=3600; HttpOnly; SameSite=Lax
    req.cookies.delete("sessao");
    // Set-Cookie: sessao=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax

Fora do servidor, new Bun.Cookie("carrinho", "3 itens", { secure: true, sameSite: "strict", maxAge: 60 }).toString() dá carrinho=3%20itens; Path=/; Max-Age=60; Secure; SameSite=Strict. Bun.Cookie.parse("a=1; Path=/x; HttpOnly") devolve name, value, path e httpOnly, entre outros. new Bun.CookieMap("x=1; y=dois") junta o que lês com o que defines.

**NOTA:** sem opções, o set pôs Path=/ e SameSite=Lax. Um cookie de sessão a sério precisa de httpOnly e, em HTTPS, de secure. A segurança dos cookies de sessão fica para o módulo 07.

## Tratamento de erros

A opção error recebe o erro lançado por qualquer handler (síncrono ou assíncrono) e devolve a Response (exemplo 04).

    error(erro) {
      if (erro instanceof ErroHttp) return Response.json({ erro: erro.message }, { status: erro.status });
      if (erro instanceof SyntaxError) return Response.json({ erro: "JSON inválido" }, { status: 400 });
      console.error("[servidor] erro inesperado:", erro.message);
      return Response.json({ erro: "erro interno" }, { status: 500 });
    },

Resultados: JSON mau deu 400, throw new ErroHttp(404, ...) deu 404, o ErroHttp lançado depois de um await deu 409, e um null.a deu 500 com a mensagem registada só no servidor. Nunca devolvas ao cliente a mensagem de um erro inesperado.

## Streaming e Server-Sent Events

Um ReadableStream como corpo envia aos bocados, com Transfer-Encoding: chunked e sem Content-Length. O exemplo 07 mediu os pedaços a chegar com 30 ms de intervalo (+37, +67, +98 ms). Um gerador assíncrono também serve de corpo.

    return new Response(new ReadableStream({
      async pull(controlador) {
        await Bun.sleep(30);
        controlador.enqueue(codificador.encode(`pedaço ${++n}\n`));
        if (n === 3) controlador.close();
      },
    }));

Server-Sent Events são só texto com Content-Type: text/event-stream: cada evento são linhas id, event e data terminadas por uma linha em branco. O exemplo envia 3 eventos encomenda e fecha. Usa o cancel() do stream para limpar o temporizador quando o cliente desliga.

    id: 1
    event: encomenda
    data: {"encomenda":1}

**NOTA:** no browser o cliente é o EventSource. No Bun 1.4.0 typeof EventSource é undefined: para testar, lê o corpo com fetch como acima. Uma ligação SSE em silêncio morre com o idleTimeout (ver adiante).

## WebSocket no servidor

O WebSocket começa por um pedido HTTP normal que o handler promove com server.upgrade(req). Se devolver true, não se devolve Response. Os handlers open, message e close ficam numa única opção websocket, partilhada por todas as ligações, e os dados de cada ligação vêm de ws.data (o que passaste em upgrade).

    const server = Bun.serve<{ nome: string }>({
      routes: { "/ws": (req, srv) => srv.upgrade(req, { data: { nome: "Ana" } }) ? undefined : new Response("só WebSocket", { status: 426 }) },
      websocket: {
        open(ws) { ws.subscribe("loja"); server.publish("loja", `entrou ${ws.data.nome}`); },
        message(ws, msg) { ws.publish("loja", `${ws.data.nome}: ${msg}`); },
        close(ws, codigo) { server.publish("loja", `saiu ${ws.data.nome} (${codigo})`); },
      },
    });

O exemplo 08 abre dois clientes com o WebSocket nativo. Resultado real: ws.subscribe e publish funcionam por tópico, server.subscriberCount("loja") deu 2, o ws.publish chegou ao outro cliente mas não a quem o enviou, enquanto o server.publish chega a todos, incluindo o próprio. A mensagem recebida é string (texto) ou Buffer (binário). Um GET normal a /ws sem upgrade recebeu 426. A documentação indica 16 MB como tamanho máximo de mensagem (maxPayloadLength) e pings automáticos (sendPings); não os testei.

## idleTimeout, requestIP, reload e --hot

O idleTimeout é o tempo de silêncio tolerado numa ligação, em segundos (por omissão 10, máximo 255, 0 desliga). server.timeout(req, 0) desliga-o só para um pedido. Exemplo 09, com idleTimeout igual a 2:

| Rota | Resultado |
|---|---|
| streaming com 4 s de silêncio entre pedaços | ligação cortada (~4 s) |
| o mesmo com server.timeout(req, 0) | 200 com os dois pedaços, 4 s |
| handler que só responde ao fim de 7 s | ligação cortada (~8 s) |

O corte não foi ao fim de 2 s: os cortes que medi chegaram 4 s e 8 s depois, por isso trata o idleTimeout como um mínimo, não como relógio exato. Para SSE e downloads lentos usa server.timeout(req, 0).

O server.requestIP(req) devolveu { address: "127.0.0.1", family: "IPv4", port: 59100 } (porta do cliente, efémera). Atrás de um proxy seria o IP do proxy (não testei).

O server.reload({ routes, fetch, error, websocket }) troca os handlers sem fechar a porta. Atenção: substitui, não funde. Depois de reload com só /versao, a rota /ip passou a dar 404 (exemplo 09).

    server.reload({ routes: { "/versao": () => new Response("v2") } });

O bun --hot faz isto sozinho quando gravas o ficheiro. Corri o exemplo 10 em segundo plano com bun --hot, pedi a mensagem, mudei "v1" para "v2" no ficheiro e voltei a pedir: o texto mudou, o pid manteve-se (36796) e a porta 35039 continuou a ouvir. O bun --watch reinicia o processo; não o testei.

**DICA:** guarda o PID ao arrancar em segundo plano (bun --hot x.ts e depois echo $! no Git Bash) e termina só esse PID. Nunca termines o bun por nome: há outros processos teus a correr.

## HTML imports: só uma introdução

Importar um .html para uma rota faz o Bun empacotar os scripts e folhas de estilo referenciados (exemplo 11):

    import pagina from "./html/index.html";
    Bun.serve({ routes: { "/": pagina, "/api/ping": () => Response.json({ ok: true }) } });

O HTML servido já não aponta para app.ts: os URLs foram reescritos para /_bun/client/index-....js e /_bun/asset/....css, e ambos responderam 200 (49028 bytes de JavaScript, com o código de desenvolvimento do Bun incluído; 58 bytes de CSS). O Bun imprimiu Bundled page in 15ms. O detalhe, a produção e os plugins são do módulo 09.

## TLS

Só descrito, sem gerar certificados: a opção tls recebe key e cert (ficheiros PEM, por exemplo Bun.file("./key.pem")), e a documentação lista passphrase, ca, requestCert (certificados de cliente), serverName (SNI, ou uma lista para vários nomes) e outras. Não executei nada com TLS.

## Documentar a API com OpenAPI e Swagger UI

A API da loja (exemplos/loja-api/) serve categorias, produtos e encomendas lidos do loja.sql. Arranca com bun run servidor.ts (porta 35030, ou a variável PORT). O objetivo desta secção: documentação que nunca se desatualiza, sem uma única dependência npm no código.

| Ficheiro | Papel |
|---|---|
| rotas.ts | a única tabela de rotas e os esquemas |
| openapi.ts | gera o documento OpenAPI 3.0.3 a partir da tabela |
| validar.ts | mini validador de JSON Schema |
| servidor.ts | regista as rotas, /openapi.json e /docs |
| docs.html | página do Swagger UI |
| loja.test.ts | testes com bun test |

### 1. O documento OpenAPI como objeto

O OpenAPI é só JSON. O openapi.ts devolve um objeto TypeScript e o servidor responde com Response.json(documento) em /openapi.json, que já traz Content-Type: application/json;charset=utf-8. Usei a versão 3.0.3 e servers: [{ url: "/api" }], por isso os caminhos documentados (/produtos) não repetem o prefixo.

### 2. Uma só tabela de rotas

Cada rota é um objeto com tudo o que o Bun e o OpenAPI precisam:

    { metodo: "get", caminho: "/produtos/{id}", resumo: "Obtém um produto",
      parametros: [{ nome: "id", em: "path", esquema: { type: "integer", minimum: 1 }, obrigatorio: true }],
      respostas: { 200: { descricao: "O produto", esquema: ref("Produto") }, 404: { descricao: "Não existe", esquema: ref("Erro") } },
      tratar: ({ db, params }) => { /* devolve { status, corpo } */ } }

O servidor.ts percorre a tabela e escreve /api/produtos/:id no objeto routes (troca {id} por :id e agrupa por método); o openapi.ts percorre a mesma tabela para escrever paths. A função adaptar valida os parâmetros e o corpo com os mesmos esquemas que ficam no documento: se mudares o esquema, o comportamento e a documentação mudam juntos. Respostas reais: /api/produtos/abc dá 400 com id: devia ser inteiro; limite=500 dá 400 com limite: máximo 50; um POST com cliente_id 0 dá 422 com $.cliente_id: mínimo 1 e $.linhas[0].quantidade: mínimo 1; um stock insuficiente dá 409 e a transação do bun:sqlite reverte a encomenda (o stock do produto 5 ficou 98 depois de uma encomenda de 2 e de outra falhada).

**NOTA:** o dinheiro vem do SQLite em vírgula flutuante (6.5, 12.9). O total é arredondado a 2 casas; para valores a sério usa inteiros em cêntimos.

### 3. Swagger UI por CDN

O /docs é uma página mínima que carrega o swagger-ui-dist da CDN jsDelivr e aponta para /openapi.json:

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.35.1/swagger-ui.css" integrity="sha384-WlYg..." crossorigin="anonymous" />
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.35.1/swagger-ui-bundle.js" integrity="sha384-J5eK..." crossorigin="anonymous"></script>
    <script>window.ui = SwaggerUIBundle({ url: "/openapi.json", dom_id: "#swagger-ui" });</script>

Verifiquei com curl em 2026-11-22: a API de dados do jsDelivr indica 5.35.1 como versão mais recente do swagger-ui-dist, e os dois ficheiros respondem 200 (CSS 187956 bytes, JavaScript 1732839 bytes). O hash do atributo integrity calculei-o com openssl dgst -sha384 sobre os bytes descarregados. As respostas do jsDelivr trazem o cabeçalho access-control-allow-origin com o valor asterisco (qualquer origem), necessário para o SRI com crossorigin.

| Compromisso | Consequência |
|---|---|
| dependência externa em execução | sem rede (ou com a CDN em baixo) o /docs abre em branco; a API continua a funcionar |
| fixar a versão (@5.35.1) | a documentação não muda sem tu quereres; tens de atualizar à mão |
| SRI (integrity) | o browser recusa o ficheiro se a CDN servir bytes diferentes; sem SRI, uma CDN comprometida corre código na tua origem |
| política de segurança de conteúdo | com um Content-Security-Policy tens de autorizar a CDN em script-src e style-src, e o script inline; não escrevi nem testei nenhuma política |
| dados | o browser pede o ficheiro à CDN: ela vê o IP dos teus utilizadores |

Outras interfaces: o Redoc (redoc@3.2.0, ficheiro bundles/redoc.standalone.js) e o Scalar (@scalar/api-reference@1.82.1) também estão na jsDelivr e os URLs respondem 200. Só isso verifiquei: não os renderizei nem escrevi as páginas, por isso não afirmo como se configuram.

### 4. A alternativa offline (só comparação)

Numa pasta minha, fora da pasta do curso, fiz bun add swagger-ui-dist@5.35.1 e servi os ficheiros com Bun.file em rotas estáticas (/swagger-ui/swagger-ui.css e /swagger-ui/swagger-ui-bundle.js). Resultado: os dois ficheiros têm exatamente o mesmo tamanho e o mesmo hash sha384 que os da CDN, e a página /docs respondeu 200. O custo é outro: foram instalados 2 pacotes (swagger-ui-dist e @scarf/scarf, uma dependência dele) e a pasta ocupa cerca de 13 MB. Isso já é uma dependência npm, fora da regra deste curso; por isso o código do curso usa a CDN. Se precisas de funcionar sem internet, esta é a alternativa, e aí o Content-Security-Policy pode ficar em default-src 'self' (não testei).

### 5. Validar pedidos: o Bun não traz um validador

Confirmei que nada nas chaves de Bun se parece com um validador (filtrei por schema, valid, ajv, openapi e swagger: vazio) e que a documentação do servidor não menciona nenhum. O validar.ts tem cerca de 70 linhas e cobre o que a API precisa:

| Cobre | Não cobre |
|---|---|
| $ref para components/schemas | oneOf, anyOf, allOf |
| type: string, integer, number, boolean, array, object | format (date, email...) e pattern |
| enum, minimum, maximum, minLength, minItems | campos a mais (additionalProperties) |
| required e properties, items | nullable, uniqueItems, multipleOf, $ref externos |

Os parâmetros de caminho e de query chegam como texto, por isso a função converter transforma-os em número antes de validar. O teste confirma as limitações: um campo a mais e uma data inválida passam sem erro. Para um esquema a sério, usa uma biblioteca; aqui o objetivo é ver como funciona.

### 6. Testar a documentação

O loja.test.ts (bun test loja.test.ts, 21 testes, 0 falhas, cerca de 0,2 s) arranca o servidor na porta 35031 e verifica:

    test.each(rotas.map((r) => [r.metodo.toUpperCase(), r.caminho, r] as const))("%s %s", async (_m, caminho, rota) => {
      const r = await fetch(url, { method: rota.metodo.toUpperCase(), body: ... });
      expect(Object.keys(rota.respostas).map(Number)).toContain(r.status);      // o estado está documentado
      expect(validar(await r.json(), rota.respostas[r.status].esquema!, esquemas)).toEqual([]);   // o corpo cumpre o esquema
    });

Também testa que os operationId são únicos, que todos os $ref existem, que o exemplo de cada esquema é válido, que um corpo inválido dá 422 com os detalhes, que /openapi.json devolve application/json e o mesmo documento, e que /docs devolve HTML com url: "/openapi.json", a versão 5.35.1 e dois atributos integrity. O teste dos exemplos apanhou um erro verdadeiro na primeira execução: o esquema Erro tinha uma lista detalhes sem exemplo e o validador devolveu $.detalhes[0]: devia ser string. Corrigi o esquema e passou.

Também fiz pedidos reais com curl a um servidor em segundo plano (arrancado com PID guardado e terminado só por esse PID): /openapi.json deu 200 com application/json, e /docs deu 200 com text/html e o HTML da página.

**ATENÇÃO:** não consegui abrir um browser. A renderização do Swagger UI, o botão Try it out, o carregamento da CDN com SRI e o aspeto das páginas Redoc e Scalar não foram testados. O que verifiquei foi o HTML devolvido, o JSON, os hashes e os URLs. O documento também não foi validado por um validador oficial de OpenAPI (não instalei nenhum).

### 7. O que o OpenAPI permite fora do Bun

Só descrito, sem instalar nada: com o documento publicado, ferramentas externas geram clientes tipados (por exemplo o OpenAPI Generator), servidores simulados (mocks), testes de contrato e documentação estática, e ferramentas como o Postman importam o esquema. Nada disso foi testado aqui. Nos módulos seguintes: 05 liga a tabela a consultas SQL a sério, 08 aprofunda os testes e 09 serve a página de documentação como HTML import. O projeto final (12) entrega a API documentada.

## Exercícios

**PRATICAR:** faz os exercícios 9 a 12 do módulo 13 (servidor com rotas e parâmetros, cookies com erros, notificações por WebSocket e uma nova rota documentada com OpenAPI). As soluções estão no módulo 15.

## Fontes oficiais

- [Bun: servidor HTTP](https://bun.sh/docs/runtime/http/server)
- [Bun: rotas](https://bun.sh/docs/runtime/http/routing)
- [Bun: cookies](https://bun.sh/docs/runtime/http/cookies)
- [Bun: WebSockets](https://bun.sh/docs/runtime/http/websockets)
- [Bun: TLS](https://bun.sh/docs/runtime/http/tls)
- [Bun: tratamento de erros](https://bun.sh/docs/runtime/http/error-handling)
- [Bun: ficheiros (Bun.file)](https://bun.sh/docs/runtime/file-io)
- [Bun: HTML imports](https://bun.sh/docs/bundler/html-static)
- [Especificação OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI: instalação](https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/)
- [MDN: pedidos Range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests)
- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [OpenAPI Generator](https://openapi-generator.tech/)
