# 04 Cliente e Web APIs

Neste módulo aprendes a falar com o mundo a partir do Bun: pedidos HTTP com o fetch nativo, WebSocket, leitura de eventos em streaming, e a caixa de ferramentas de APIs Web que o Bun traz de série (URL, Headers, FormData, Blob, streams, compressão, HTMLRewriter, DNS). Nenhum pacote do npm. Todas as saídas foram obtidas com o Bun 1.4.0 no Windows 11 (Git Bash). A documentação online descreve a versão 1.4.5: onde a 1.4.0 difere, digo-o em notas com o título «Na 1.4.0».

Para teres com quem falar sem depender da internet, todos os exemplos usam um servidor local da loja (exemplos/servidor-loja.ts), arrancado dentro do próprio script e parado no fim com server.stop(). O Bun.serve é explicado a fundo no módulo 03; aqui é só a contraparte. Usa as portas 35040 a 35049.

## O que substitui

| Biblioteca ou hábito do npm | Funcionalidade nativa |
|---|---|
| axios, node-fetch, got, undici | fetch (global) |
| ws (cliente), websocket | new WebSocket |
| eventsource | fetch em streaming (o EventSource global não existe na 1.4.0) |
| form-data, formdata-node | FormData, Blob e File globais |
| whatwg-url, url-pattern | URL, URLSearchParams e URLPattern |
| cheerio ou parse5 só para reescrever HTML | HTMLRewriter |
| web-streams-polyfill, pako (gzip) | streams, CompressionStream e DecompressionStream |
| uuid, structured-clone | crypto.randomUUID e structuredClone |
| abort-controller, p-timeout | AbortController e AbortSignal.timeout |

## fetch: o essencial

O fetch devolve uma Promise de Response assim que chegam os cabeçalhos; o corpo lê-se depois, uma única vez. Exemplo completo em exemplos/01-fetch-basico.ts.

    const r = await fetch("http://localhost:35040/api/produtos/3");
    console.log(r.status, r.statusText, r.ok);      // 200 OK true
    console.log(r.headers.get("content-type"));     // application/json;charset=utf-8
    console.log(r.url, r.redirected, r.type);       // http://localhost:35040/api/produtos/3 false default
    console.log(await r.json());                    // { id: 3, nome: "Atlas Mundial", ... }
    await r.text();                                 // TypeError: Body already used

| Método de leitura | Devolve |
|---|---|
| text() e json() | string e valor JavaScript |
| bytes() e arrayBuffer() | Uint8Array e ArrayBuffer |
| blob() e formData() | Blob (com type) e FormData |
| body | ReadableStream, para ler aos pedaços |
| clone() | uma segunda Response, para leres o corpo duas vezes |

**ATENÇÃO:** um 404 ou um 500 não lançam exceção. A Promise só é rejeitada quando não há resposta nenhuma (rede, tempo limite, cancelamento). Verifica sempre r.ok ou r.status: a função obter do exemplo lança um Error quando !r.ok e é o padrão a copiar.

Para query strings, não concatenes texto: usa URL e URLSearchParams, que codificam acentos e espaços.

    const url = new URL("/api/produtos", "http://localhost:35040");
    url.searchParams.set("categoria", "3");
    url.searchParams.set("max", "30");
    // http://localhost:35040/api/produtos?categoria=3&max=30  ->  Candeeiro de Mesa 22, Caneca de Cerâmica 6.5

## Enviar dados: métodos, cabeçalhos e corpos

Exemplo completo em exemplos/02-fetch-escrita.ts. Com JSON, serializas tu e defines o Content-Type:

    const r = await fetch("http://localhost:35040/api/encomendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId: 1, linhas: [{ produtoId: 4, quantidade: 1 }] }),
    });
    console.log(r.status, r.headers.get("location"));   // 201 /api/encomendas/13

O servidor devolve 201 com Location. Um corpo inválido dá 422 com {"erro": "clienteId e linhas são obrigatórios"}, que lês com json() como qualquer resposta. PATCH e DELETE são o mesmo fetch com outro method; o DELETE do exemplo devolve 204, sem corpo.

**NOTA:** sem cabeçalhos teus, o Bun envia accept com o valor curinga, accept-encoding: gzip, deflate, br, zstd, connection: keep-alive, host e user-agent: Bun/1.4.0 (visto no eco do servidor). Os nomes de cabeçalhos não distinguem maiúsculas de minúsculas.

Para enviar ficheiros usa FormData. O Content-Type multipart (com o boundary) é gerado pelo fetch: não o escrevas à mão, ou o boundary fica errado.

    const form = new FormData();
    form.append("legenda", "Capa do Atlas");
    form.append("imagem", new File(["PNG-FALSO"], "atlas.png", { type: "image/png" }));
    await fetch("http://localhost:35040/api/produtos/3/imagem", { method: "POST", body: form });
    // o servidor viu: { nome: "atlas.png", tipo: "image/png", bytes: 9 }

Um BunFile (Bun.file, módulo 02) é um Blob, por isso entra num FormData diretamente: form.set("imagem", Bun.file(caminho), "loja.sql") enviou 7665 bytes com o tipo application/x-sql deduzido da extensão. A classe Headers aceita append e set; com Set-Cookie repetido, getSetCookie() devolve a lista ["a=1", "b=2"]. Um GET com body lança TypeError: fetch() request with GET/HEAD method cannot have body.

## Erros de rede, redirecionamentos e tempos limite

Exemplo completo em exemplos/03-fetch-erros-e-tempo.ts. Uma porta onde ninguém escuta rejeita a Promise com um TypeError:

    try { await fetch("http://localhost:35049/api/produtos"); }
    catch (e) { console.log(e.name, e.code, e.message); }
    // TypeError ConnectionRefused Unable to connect. Is the computer able to access the url?

**Na 1.4.0:** a documentação diz que o code é ECONNREFUSED e que a mensagem começa pelo código. Na 1.4.0 medi code ConnectionRefused e a mensagem acima. Se o teu código decide por e.code, testa na versão que usas (no Node 24 a causa é e.cause.code igual a ECONNREFUSED).

Redirecionamentos: por omissão o fetch segue-os; a opção redirect muda isso.

| Opção redirect | Resultado medido em /api/antigo (301) |
|---|---|
| follow (omissão) | 200, redirected true, url final com ?categoria=3 |
| manual | 301 e o cabeçalho location para tu decidires |
| error | rejeita com TypeError, code UnexpectedRedirect |

Um redirecionamento infinito (/api/loop) rejeita com TypeError, code TooManyRedirects.

Tempos limite e cancelamento são feitos com sinais (AbortSignal), sem bibliotecas:

    await fetch(url, { signal: AbortSignal.timeout(200) });   // TimeoutError: The operation timed out. (202 ms)

    const ctl = new AbortController();
    setTimeout(() => ctl.abort(), 100);
    await fetch(url, { signal: ctl.signal });                 // AbortError: The operation was aborted.
    ctl.abort(new Error("saiu"));                              // com motivo próprio, é esse o erro lançado

    const sinal = AbortSignal.any([ctl.signal, AbortSignal.timeout(300)]);   // o primeiro que disparar

**DICA:** distingue na captura: e.name === "TimeoutError" é tempo limite, "AbortError" é cancelamento teu. O exemplo mostra ainda uma função comRetry com espera crescente (50 ms vezes 2 elevado à tentativa) que só repete erros 5xx e de rede, nunca 4xx.

## Ler o corpo em streaming e descarregar para ficheiro

Exemplo completo em exemplos/04-fetch-streaming.ts. response.body é um ReadableStream e é um iterável assíncrono: cada pedaço chega quando o servidor o envia, sem esperar pelo fim.

    for await (const pedaco of (await fetch(url)).body) { /* Uint8Array */ }
    // /api/linhas.ndjson: 10 pedaços, 758 bytes, 348 ms (o servidor faz uma pausa de 30 ms por linha)

Para ler linhas de texto, passa por TextDecoderStream e junta o que sobra entre pedaços (uma linha pode vir partida). A função linhas do exemplo faz isso e leu as 10 linhas NDJSON. Cancelar a meio é leitor.cancel() ou um AbortController.

Para descarregar para ficheiro, o Bun.write aceita uma Response e escreve o corpo no disco:

    const bytes = await Bun.write("relatorio.csv", await fetch("http://localhost:35040/api/relatorio.csv"));
    // 341 bytes, 11 linhas

A decompressão é automática. O servidor devolve /api/comprimido em gzip (306 bytes); o fetch entrega o JSON já descomprimido. Com decompress: false (opção do Bun, não é padrão Web) recebes os bytes brutos, que começam por 1f 8b, e descomprimes com Bun.gunzipSync. **Na 1.4.0:** Bun.write(destino, new Response(stream)) só funcionou com a Response vinda do fetch. Com uma Response feita sobre um ReadableStream criado em JavaScript, a Promise nunca terminou (medido no Windows), e Bun.write(destino, stream) escreveu o texto [object ReadableStream]. Para streams teus usa file.writer() (for await e write) ou new Response(stream).bytes().

Um ReadableStream também serve de corpo de pedido (body: stream), e o Bun envia-o sem o juntar em memória.

## Opções do fetch específicas do Bun

Exemplo completo em exemplos/05-fetch-opcoes-bun.ts. Só descrevo o que executei.

| Opção | O que faz | Verificado |
|---|---|---|
| proxy | envia o pedido por um proxy HTTP; aceita texto ou objeto com url e headers; proxy: false ignora HTTP_PROXY e afins | sim, com um proxy local na porta 35041 |
| unix | liga a um socket Unix em vez de TCP | sim, no Windows 11, com Bun.serve({ unix }) |
| tls | opções de TLS do pedido; testei rejectUnauthorized (cert, key e ca estão na documentação, não os executei) | sim, com certificado autoassinado |
| verbose | imprime o pedido e a resposta | sim (ver nota) |
| decompress e keepalive | descompressão automática e reutilização de ligações | sim |

O proxy de brincar do exemplo regista GET http://localhost:35040/api/produtos/1: em proxy HTTP o pedido chega com o URL absoluto. Com um certificado autoassinado, o fetch rejeita (TypeError, code DEPTH_ZERO_SELF_SIGNED_CERT, mensagem self signed certificate); tls: { rejectUnauthorized: false } deixa passar.

**ATENÇÃO:** rejectUnauthorized: false desliga a validação do certificado. Usa só em desenvolvimento, contra serviços teus. O certificado do teste foi gerado com openssl fora da pasta do curso e não está nos exemplos (o exemplo só corre a parte TLS se definires a variável CERT_DIR).

**Na 1.4.0:** o verbose escreve no stderr, sem o prefixo [fetch] que a documentação mostra (as linhas do pedido começam por espaço, as da resposta por <). A documentação refere ainda Bun.FetchSession (sessões de ligações), que não existe na 1.4.0 (typeof devolve undefined). fetch.preconnect existe mas devolveu undefined e não consegui medir o efeito; a flag --fetch-preconnect, segundo a documentação, não está implementada no Windows (não testei).

## Cliente WebSocket nativo

Exemplo completo em exemplos/06-websocket-cliente.ts. new WebSocket(url) devolve logo o objeto com readyState 0 (CONNECTING); depois ouves os eventos com addEventListener (ou onopen, onmessage, onclose, onerror).

    const ws = new WebSocket("ws://localhost:35040/ws");
    ws.addEventListener("open", () => ws.send("olá, loja"));
    ws.addEventListener("message", ev => console.log(typeof ev.data, ev.data));
    ws.addEventListener("close", ev => console.log(ev.code, ev.reason, ev.wasClean));

    // message: string bem-vindo à loja
    // message: string eco: olá, loja
    // close: 1000 "até logo" wasClean: true

Uma porta sem servidor dispara error (ErrorEvent) e depois close com o código 1006 (fecho anormal). O WebSocket não volta a ligar sozinho. A reconexão manual é um ciclo no evento close com espera crescente; o exemplo faz isso e, quando o servidor corta a ligação com 1011, regista [caiu] code 1011, espera 50 ms e liga outra vez (recebeu as boas-vindas duas vezes). Dois cuidados: guarda uma variável parar para não reconectares depois de fechares de propósito, e repõe o contador de tentativas no evento open.

**NOTA:** o cliente do Bun acrescenta ao padrão: segundo argumento com opções (headers para os cabeçalhos do pedido de upgrade, protocols, tls, proxy, perMessageDeflate), ping(), pong() e terminate(), e binaryType com o valor nodebuffer por omissão. Nada disto funciona num browser. Medi só a existência dos três métodos e o envio de headers; as restantes opções confirma na documentação.

## Server-Sent Events: o EventSource não existe

Exemplo completo em exemplos/07-sse-manual.ts. typeof EventSource é undefined na 1.4.0 e a documentação de APIs Web não o lista (no Node 24.18 também é undefined). SSE é só HTTP com Content-Type: text/event-stream, blocos separados por linha em branco, com campos id, event e data. Lê-se com fetch em streaming e um parser curto:

    for await (const ev of eventos(await fetch(".../api/eventos"))) console.log(ev.id, ev.event, JSON.parse(ev.data));
    // 1 estado { encomenda: 8, estado: "pendente" }   2 ... "enviada"   3 ... "entregue"

O parser do exemplo (cerca de 20 linhas) trata dos pedaços partidos, das linhas de comentário começadas por dois pontos e de data em várias linhas. Não faz a reconexão automática nem o Last-Event-ID do EventSource: se precisares, repete o fetch com o cabeçalho Last-Event-ID, como na reconexão do WebSocket.

## URL, Headers, FormData, Blob e File

Exemplo completo em exemplos/08-url-headers-formdata.ts (sem rede).

    const u = new URL("https://loja.exemplo.pt:8443/api/produtos/4?categoria=2&max=50#detalhe");
    u.host; u.pathname; u.searchParams.get("max");   // loja.exemplo.pt:8443  /api/produtos/4  "50"
    new URL("../encomendas", u).href;                // https://loja.exemplo.pt:8443/api/encomendas
    URL.canParse("/sem-base");                       // false
    new URLSearchParams({ nome: "Manta de Sofá" }).toString();   // nome=Manta+de+Sof%C3%A1

URLSearchParams repete chaves (getAll) e, ao passar a Object.fromEntries, a última ganha. Um URLSearchParams como body de um Request define Content-Type: application/x-www-form-urlencoded;charset=UTF-8. O URLPattern casa caminhos e extrai parâmetros, ideal para um roteador sem bibliotecas:

    const p = new URLPattern({ pathname: "/api/produtos/:id([0-9]+)" });
    p.test("http://x.pt/api/produtos/7");                  // true
    p.exec("http://x.pt/api/produtos/7")?.pathname.groups; // { id: "7" }

**Na 1.4.0:** um grupo com a classe de dígitos escrita à maneira de uma expressão regular (barra invertida e d) deu sempre false, tanto no Bun 1.4.0 como no Node 24.18 que usei para comparar. Usa [0-9]+, como acima.

Blob guarda bytes com um type; File acrescenta name e lastModified. Podes serializar um FormData com new Response(fd) (gera o multipart) e reconstruí-lo com formData(). URL.createObjectURL(blob) cria um endereço blob: que o fetch sabe ler.

## Texto e streams

Exemplo completo em exemplos/09-texto-e-streams.ts. O TextEncoder converte texto em bytes UTF-8 (Eletrónica € tem 12 caracteres e 15 bytes) e o TextDecoder faz o contrário, aceitando outras codificações (latin1) e fatal: true para recusar UTF-8 inválido (TypeError, code ERR_ENCODING_INVALID_ENCODED_DATA).

| Classe | Papel |
|---|---|
| ReadableStream | fonte de pedaços (ReadableStream.from aceita arrays e iteráveis) |
| WritableStream | destino que consome pedaços (write, close) |
| TransformStream | transforma pedaço a pedaço |
| TextDecoderStream e TextEncoderStream | bytes para texto e texto para bytes, em streaming |
| CompressionStream e DecompressionStream | gzip, deflate e deflate-raw |

    const maiusculas = new TransformStream({ transform(p, c) { c.enqueue(p.toUpperCase()); } });
    await ReadableStream.from(produtos).pipeThrough(maiusculas).pipeTo(destino);
    // [ "ROMANCE POLICIAL", "ATLAS MUNDIAL", "CANECA DE CERÂMICA" ]

pipeThrough liga a fonte a uma transformação e pipeTo liga ao destino; a contrapressão é automática (uma fonte com pull só produz quando o consumidor tem espaço). tee() faz duas cópias do fluxo. O TextDecoderStream reconstitui um caractere partido entre pedaços (o € tem 3 bytes e foi dividido em 1 mais 2). A compressão em streaming:

    const gz = new Blob([original]).stream().pipeThrough(new CompressionStream("gzip"));
    // 16000 bytes -> 134 bytes, magic 1f 8b; a ida e volta com DecompressionStream deu o texto original

**DICA:** para consumir um stream inteiro de uma vez usa new Response(stream).text() ou Bun.readableStreamToText(stream). Se não precisas de streaming, Bun.gzipSync é mais simples e deu o mesmo tamanho: 134 bytes.

## Globais úteis

Exemplo completo em exemplos/10-utilitarios-web.ts.

| API | O que mostrei |
|---|---|
| structuredClone | copia Date, Map, Set e referências circulares; funções dão DataCloneError; JSON.stringify da circular dá TypeError |
| crypto.randomUUID | UUID v4 de 36 caracteres; crypto.getRandomValues enche um Uint8Array |
| atob e btoa | só Latin-1: btoa("€") dá InvalidCharacterError; para UTF-8 passa por TextEncoder |
| performance.now | relógio monotónico em ms com fração; mark e measure também existem |
| queueMicrotask | ordem medida: síncrono, microtask, promise, timeout |
| EventTarget e CustomEvent | eventos próprios com detail |
| AbortSignal.any e timeout | ver a secção dos tempos limite |

Introdução a dois canais de mensagens (úteis sobretudo com Workers, módulo 11). O BroadcastChannel entrega uma mensagem a todos os canais com o mesmo nome, mesmo no mesmo processo; o MessageChannel cria dois portos ligados. Ambos copiam as mensagens como o structuredClone (o Map do exemplo chegou como Map).

    const a = new BroadcastChannel("loja"), b = new BroadcastChannel("loja");
    b.onmessage = e => console.log(e.data);
    a.postMessage({ aviso: "stock baixo", produto: 8 });   // { aviso: "stock baixo", produto: 8 }

## HTMLRewriter: transformar HTML em streaming

Exemplo completo em exemplos/11-htmlrewriter.ts. O HTMLRewriter (baseado no lol-html da Cloudflare) percorre o HTML uma só vez e chama os teus handlers para os elementos que casam com seletores CSS. Aceita string, ArrayBuffer ou Response (a versão da Cloudflare só aceita Response).

    const saida = new HTMLRewriter()
      .on("a[href]", { element(a) {
        const href = a.getAttribute("href");
        if (href.startsWith("/")) a.setAttribute("href", "https://loja.exemplo.pt" + href);
        else a.setAttribute("rel", "noopener nofollow").setAttribute("target", "_blank");
      } })
      .on("script", { element: el => el.remove() })
      .onDocument({ comments: c => c.remove() })
      .transform(html);

No exemplo, os links /api/produtos/1 ficaram absolutos, o link externo ganhou rel e target, e o script e o comentário desapareceram. Os seletores executados incluem tag, classe, id, atributo (a[href], li[data-id="10"]), e li:first-child.

| Handler ou método | Para quê |
|---|---|
| element(el) | atributos (getAttribute, setAttribute, removeAttribute), before, after, prepend, append, remove |
| text(t) | ler ou trocar texto; o texto chega em pedaços, usa t.lastInTextNode para saber o fim |
| comments(c) | ler ou remover comentários |
| onDocument | handlers do documento inteiro (comentários, texto, doctype, end) |
| setInnerContent(txt, { html: true }) | por omissão o conteúdo é escapado: Loja &lt;b&gt; |

**ATENÇÃO:** o texto de um li inclui o dos filhos: ao extrair os nomes dos produtos com text() sobre li.produto, o texto do link (ver) apareceu como itens separados no resultado. Seleciona o elemento certo ou filtra.

Sobre uma Response, o rewrite acontece em streaming: o transform devolve logo uma Response e só processa à medida que lês o corpo (mantém o content-type original). Com handlers assíncronos usa uma Response: com string, o transform é síncrono e lança TypeError: HTMLRewriter.transform() cannot synchronously return a string... Com new Response(html) o mesmo handler funcionou.

## DNS

Exemplo completo em exemplos/12-dns.ts. O Bun traz Bun.dns (importável como import { dns } from "bun") com lookup, prefetch, getCacheStats e as funções de resolução do node:dns (resolve, resolveMx, reverse e outras). Só executei as três primeiras e só com localhost (não dependo de rede).

    await dns.lookup("localhost");               // [ { address: "::1", family: 6 }, { address: "127.0.0.1", family: 4 } ]
    await dns.lookup("localhost", { family: 4 });
    dns.prefetch("localhost", 35040);            // aquece a cache antes de ligares (experimental)
    dns.getCacheStats();                         // { cacheMisses: 1, size: 1, ... }

Um nome inexistente rejeita com DNSException, code DNS_ENOTFOUND. No meu teste, após o prefetch e três fetch ao mesmo servidor, a cache tinha 1 entrada e 1 acerto: as outras ligações foram reaproveitadas (keep-alive). A cache guarda 256 entradas durante 30 s, segundo a documentação; a documentação marca prefetch e getCacheStats como experimentais. Repara que localhost resolve primeiro para ::1 (IPv6): se o teu servidor só escuta em IPv4, o fetch tenta as duas.

## Exemplo da loja: um cliente tipado

Exemplo completo em exemplos/13-cliente-loja.ts. Uma classe ClienteLoja junta o que viste: URL base, tempo limite por pedido (AbortSignal.timeout), JSON automático, erros tipados (ErroHttp com estado e corpo) e a query string de URLSearchParams.

    const loja = new ClienteLoja("http://localhost:35040");
    await loja.produtos({ categoria: 2 });     // Auscultadores Bluetooth, Carregador USB-C, Teclado Mecânico
    await Promise.all([1, 3, 5, 8].map(id => loja.produto(id)));    // 4 pedidos em paralelo, 15 ms
    await Promise.allSettled([loja.produto(2), loja.produto(99), loja.produto(4)]);
    // ok, falhou: HTTP 404 em /api/produtos/99, ok

Promise.all falha à primeira rejeição; Promise.allSettled devolve o estado de cada um. O fluxo do exemplo cria a encomenda 13, baixa o stock do Conjunto de Panelas de 8 para 7 e soma o valor total do stock em cêntimos inteiros, 7214.70 euros (7304.60 menos a panela vendida).

**NOTA:** os preços na loja são decimais (12.90). Em JavaScript são vírgula flutuante: soma em cêntimos inteiros (Math.round(preco * 100)) e divide só para mostrar, como no exemplo.

## Exercícios

**PRATICAR:** faz os exercícios 13 a 16 do módulo 13 (Exercícios), que consolidam este módulo: um cliente com repetição e tempo limite, descarregar e comprimir em streaming, um cliente WebSocket que reconecta e uma limpeza de HTML com HTMLRewriter.

## Fontes oficiais

- Fetch: https://bun.sh/docs/runtime/networking/fetch
- WebSockets: https://bun.sh/docs/runtime/http/websockets
- DNS: https://bun.sh/docs/runtime/networking/dns
- HTMLRewriter: https://bun.sh/docs/runtime/html-rewriter
- APIs Web suportadas: https://bun.sh/docs/runtime/web-apis
- Streams: https://bun.sh/docs/runtime/streams
