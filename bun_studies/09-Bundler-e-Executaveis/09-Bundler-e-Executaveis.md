# 09 Bundler e executáveis

Neste módulo usas o bundler que vem dentro do Bun: o comando bun build e a API Bun.build empacotam TypeScript, JSON, CSS e HTML sem webpack, esbuild nem rollup, e a opção --compile junta tudo num executável único. No fim empacotas a API da loja do módulo 03, com a página /docs do Swagger UI, num só ficheiro .exe e provas que funciona com um pedido real.

Tudo foi executado com o Bun 1.4.0 no Windows 11 (Git Bash), nas portas 35090 a 35099 de 127.0.0.1. A documentação oficial já descreve a 1.4.5: o que ela diz e a 1.4.0 não faz está assinalado. Os exemplos estão em exemplos/ (01 a 10, mais as pastas app, ativos, exe, web, macros, plugins, 07-plugin-runtime e loja-exe). Todos os produtos de build foram escritos fora da pasta do curso, em pastas temporárias. Não repito o Bun.serve: está no módulo 03.

## O que substitui

| Ferramenta habitual | O que o Bun já traz |
|---|---|
| webpack, esbuild, rollup, parcel, vite (bundler) | bun build e Bun.build |
| ts-loader, babel (transpilar TypeScript e JSX) | transpilador nativo, sem configuração |
| raw-loader, file-loader, url-loader | loaders text e file, ou import attributes |
| plugins do webpack ou do esbuild | Bun.plugin e a opção plugins do Bun.build (onResolve e onLoad) |
| babel-plugin-preval, ts-macros | macros: import com type macro |
| pkg, nexe, caxa (executável único) | bun build --compile |
| html-webpack-plugin, servidor de desenvolvimento | import de ficheiros .html no Bun.serve |
| cross-env, dotenv-webpack, DefinePlugin | opções define e env do bundler |

## O primeiro pacote: bun build

O bun build lê um ponto de entrada, segue os imports e escreve um ficheiro só. Para um programa de dois módulos (app/cli.ts importa app/preco.ts):

    bun build app/cli.ts --outfile=pacote.js
    Bundled 2 modules in 12ms
      b1.js  511 bytes  (entry point)

O resultado traz os dois módulos, sem os imports, e a exportação NUNCA_USADA do preco.ts não chegou lá (tree shaking). Sem --outfile nem --outdir o código vai para o ecrã. Opções que executei:

| Opção | O que fez no exemplo |
|---|---|
| --minify | 511 para 335 bytes; também há --minify-whitespace, --minify-syntax e --minify-identifiers |
| --target=browser, bun ou node | só o bun acrescenta a primeira linha de pragma: // @bun |
| --format=esm, cjs ou iife | o iife embrulha tudo numa função autoexecutável (558 bytes) |
| --define 'VERSAO="1.2.3"' | troca o identificador por um valor (funciona, mas não aparece no bun build --help) |
| --sourcemap=linked, inline ou external | linked e external escrevem um .map ao lado; inline mete-o no .js (2,48 KB contra 0,59 KB) |
| --external pacote | o import fica no resultado em vez de ser empacotado |
| --splitting com --outdir | partilha código entre pontos de entrada e import() dinâmicos |
| --metafile=meta.json | JSON com módulos e bytes de entrada e de saída |

**ATENÇÃO:** um import que não existe pára a build com error: Could not resolve: "pacote-inexistente". Maybe you need to "bun install"?, e a build termina com erro. Com --external a build passa e o import fica por resolver para a altura de correr o resultado.

## A API Bun.build

A API faz o mesmo em código e devolve um objeto BuildOutput. Sem outdir, o resultado fica em memória (exemplo 01):

    const r = await Bun.build({ entrypoints: ["./app/cli.ts"], target: "bun", minify: true, sourcemap: "external" });
    console.log(r.success, r.outputs.length, r.logs.length);   // true 2 0
    for (const o of r.outputs) console.log(o.kind, o.path, o.size, o.type, o.hash, o.loader);

    entry-point ./cli.js       396 bytes text/javascript;charset=utf-8 hash v6mcmsg6 loader ts
    sourcemap   ./cli.js.map  1324 bytes application/json;charset=utf-8 hash 00000000 loader file

Cada saída é um BuildArtifact. Tem kind (entry-point, chunk, asset ou sourcemap), path, size, type, hash, loader e, no ponto de entrada, o sourcemap associado. Tem os métodos text, arrayBuffer, stream e slice, e serve de corpo a new Response. Na 1.4.0, porém, instanceof Blob dá false: a documentação diz que é um Blob, eu só confirmei o comportamento. Com outdir (e naming) o Bun escreve os ficheiros e o path passa a absoluto.

**NOTA:** na 1.4.0 no Windows, um outdir relativo com dois pontos (como ../../tmp/dist) falhou com Failed to create output directory ENOENT numa pasta onde o pai existia. Os exemplos usam sempre pastas temporárias de mkdtemp, com caminho absoluto.

O exemplo 03 passa pelas opções da API sobre o mesmo programa: target (browser e node 514 bytes, bun 533), format, minify por partes (330 bytes todo, 419 só whitespace, 438 só identifiers, 498 só syntax), define, banner e footer, external, naming (com [name], [hash] e [ext]) e metafile (a API devolve meta.metafile). Duas armadilhas medidas:

- No splitting, dar a chunk um nome sem [hash] (chunk-[name].[ext]) falhou com Multiple files share the same output path. Usa chunk-[name]-[hash].[ext].
- Na opção env, "inline" cola TODAS as variáveis de ambiente no pacote (apareceu o SEGREDO) e "PUBLIC_" seguido de asterisco só cola as que começam por esse prefixo. O bundler lê o ambiente com que o processo arrancou: atribuir a process.env dentro do próprio script não chegou.

### Erros e logs

Por omissão, uma build falhada lança um AggregateError. Com throw: false recebes success false e os logs (exemplo 02):

    ./erros/falta.ts    ResolveMessage error | Could not resolve: "./nao-existe.ts" | falta.ts 1:17
    ./erros/sintaxe.ts  BuildMessage error | Unexpected ; | sintaxe.ts 1:11 | const a = ;

Cada log é um BuildMessage (ou ResolveMessage, nos imports que falham), com message, level e position (file, line, column, lineText). Para testar uma build sem ficheiros em disco, a opção files aceita um mapa de ficheiros virtuais: files: { "./entrada.ts": "import x from ..." } (existe na 1.4.0; usei-a nos exemplos 04 e 03).

## Loaders: o que o Bun faz a cada ficheiro

O loader depende da extensão. O exemplo 04 compila um import mínimo de cada tipo e mostra o código gerado (executado):

| Ficheiro | Resultado do import |
|---|---|
| produtos.json, loja.toml, loja.yaml | objeto JavaScript já resolvido, embutido no pacote |
| aviso.txt | texto (template string) embutido |
| um ficheiro .md (testado à parte) | texto convertido em HTML (um h1 por cada título), e não o Markdown |
| estilo.css | o JavaScript recebe um objeto vazio; o CSS sai num ficheiro asset à parte |
| logo.svg | caminho do ficheiro copiado, com hash no nome (loader file) |
| produtos.csv | extensão desconhecida: tratada como file, devolve o caminho |

Os nomes aceites na opção loader da 1.4.0 vêm na mensagem de erro de um nome inválido: js, jsx, ts, tsx, css, file, json, toml, wasm, napi, base64, dataurl, text e html. O yaml e o md funcionaram pela extensão mas não estão nessa lista. Os loaders base64 e dataurl devolveram uma string vazia (testei com um PNG, que já não está nos exemplos, e com um .txt, na API e na CLI): na 1.4.0 não os uses. Um módulo wasm de 8 bytes, que testei à parte, também devolveu o caminho, como o file. Não testei o loader napi, e o jsx precisou do react (o Bun foi buscá-lo sozinho), por isso não o usei.

**ATENÇÃO:** sem um tsconfig, um import de um .jsx ou .tsx faz o Bun resolver react/jsx-dev-runtime. No bundler deu Could not resolve; no runtime a 1.4.0 chegou a instalar o react na cache global (módulo 00). Nos exemplos não há JSX.

## Importar ficheiros como texto, caminho ou objeto

Os import attributes (with { type }) dizem ao Bun como ler o ficheiro (exemplo 05, que corre com bun run e tal e qual dentro de um executável):

    import aviso from "./ativos/aviso.txt" with { type: "text" };
    import logo from "./ativos/logo.svg" with { type: "file" };
    import config from "./ativos/loja.toml" with { type: "toml" };
    import produtos from "./ativos/produtos.json" with { type: "json" };

    text : "Preços com IVA incluído." (mais uma mudança de linha no fim)
    file : string logo.svg
           tamanho 112 | tipo image/svg+xml | começa por: <svg
           Response: image/svg+xml 112 bytes

O type file devolve um caminho, não os bytes: para o conteúdo usas Bun.file(caminho), que também serve de corpo a uma Response. O runtime aceitou ainda type html (um HTMLBundle) e type sqlite (um Database), mas só vi a forma do objeto. O type bytes, que a documentação descreve, não existe na 1.4.0: o Bun tratou-o como file e devolveu um caminho. Se precisas dos bytes, usa Bun.file(caminho).bytes().

## Plugins

Um plugin intercepta a resolução (onResolve) e o carregamento (onLoad) de módulos. O mesmo objeto BunPlugin serve o bundler (opção plugins do Bun.build) e o runtime (Bun.plugin), mas são dois momentos diferentes:

| | Plugin de build | Plugin de runtime |
|---|---|---|
| Regista-se em | Bun.build({ plugins }) | Bun.plugin(), antes do import |
| Corre | durante a build | quando o Bun carrega o módulo |
| Hooks que usei | onStart, onResolve, onLoad, onEnd | onLoad, onResolve e build.module |
| Loaders aceites no resultado | os da lista do bundler (js, text...) | js, jsx, object, ts, tsx, toml, yaml, json, xml e md |

O exemplo 06 carrega um produtos.csv como módulo e cria um módulo virtual (loja:build, sem ficheiro nenhum). A ordem dos eventos foi onStart, onLoad produtos.csv, onEnd (success=true):

    build.onLoad({ filter: /[.]csv$/ }, async ({ path }) => {
      /* lê o CSV e devolve registos */
      return { contents: "export default " + JSON.stringify(registos), loader: "js" };
    });
    build.onResolve({ filter: /^loja:/ }, ({ path }) => ({ path, namespace: "loja-virtual" }));
    build.onLoad({ filter: /.*/, namespace: "loja-virtual" }, () => ({ contents: "export const versao = '1.0.0'", loader: "js" }));

O resultado correu e imprimiu a tabela dos 3 produtos com o total 22.60. No runtime (pasta 07-plugin-runtime), o plugin regista-se num ficheiro de preload, que o bunfig.toml indica com preload = ["./plugin.ts"] (ou a opção --preload). O build.module cria um módulo sem ficheiro e o loader object devolve o objeto de exports. Sem o preload, o mesmo main.ts falhou com Cannot find package 'loja:config'. E o bun build ignora o preload: o bundler não conheceu o loja:config e deu Could not resolve.

**ATENÇÃO:** um onLoad com filtro largo, como /[.]sql$/, apanha TODOS os ficheiros dessa extensão, incluindo os que importas com type text. No exercício 34 o plugin estragou o import do loja.sql dessa forma. Devolver undefined deixa o bundler seguir o caminho normal, mas o runtime da 1.4.0 recusa-o (Expected module mock to return an object). Devolve um módulo JavaScript com o texto, que serve nos dois.

Os plugins nativos (onBeforeParse, em C ABI) e a opção de plugins para HTML imports no bunfig.toml estão na documentação; não os executei.

## Macros

Uma macro é uma função que corre durante a transpilação: o Bun escreve o valor devolvido no código e a função desaparece do pacote. Importa-se com type macro (exemplo 08, com macros/relogio.ts):

    import { compiladoEm, multiplicar, tabelasDaLoja } from "./macros/relogio.ts" with { type: "macro" };
    console.log("compilado em", compiladoEm());
    console.log("tabelas:", tabelasDaLoja());
    console.log("6 x 7 =", await multiplicar(6, 7));

    // bun build 08-macro.ts
    console.log("compilado em", "2026-11-23T08:52:00.254Z");
    console.log("tabelas:", ["categorias", "clientes", "produtos", "encomendas", "linhas_encomenda"]);
    console.log("6 x 7 =", await 42);

A macro leu o loja.sql com node:fs e só o resultado ficou no código. Funcionam na 1.4.0, tanto com bun run e bun build como dentro de ficheiros para o browser. Regras que testei: os argumentos têm de ser valores conhecidos na build (com uma variável deu "Cannot convert identifier to JS. Try a statically-known value"); o retorno tem de ser simples (uma função devolvida deu cannot coerce Function to Bun's AST) e a macro pode ser assíncrona; a flag --no-macros desliga-as (error: Macros are disabled). A documentação acrescenta que o código em node_modules não pode invocar macros (não testei).

## bun build --compile: um executável único

Com --compile o Bun copia o seu próprio executável e anexa-lhe o programa. Resultados reais no Windows x64:

    bun build --compile app/cli.ts --outfile=cli.exe
    bun.exe do anfitrião: 88825944 bytes
    cli.exe (olá mundo da loja): 88816640 bytes

O executável pesa praticamente o mesmo que o próprio bun.exe (o do olá mundo até 9 KB a menos): cerca de 84,7 MiB (88,8 MB), e comprimido com gzip o da loja fica em 40,07 MB. O teu programa acrescenta só quilobytes (ver o caso da loja). O .exe corre sem o Bun no PATH: arranquei o da loja com um ambiente sem PATH e respondeu. Embute o tempo de execução, as APIs nativas e os módulos node:.

### O que o executável vê

O exe/relatorio.ts imprime o que o programa vê quando compilado, em comparação com bun run (executado):

    sem compilar: execPath = bun.exe | Bun.main = o caminho real do ficheiro
    compilado   : execPath = relatorio.exe | Bun.main = B:/~BUN/root/relatorio.exe | main? true
                  argv = [ "um", "dois três", "--flag" ] (sem o nome do script)
                  env  = 0.23 (LOJA_IVA=0.23 definida no arranque)
                  Bun.embeddedFiles: 1  (logo-zwwts1qr.svg, 112 bytes)

- Os ficheiros embutidos vivem num disco virtual: na 1.4.0 no Windows aparece como B:/~BUN/root; a documentação fala em /$bunfs/ (no Linux e no macOS). Não escrevas esses caminhos no código: importa o ficheiro com type file e lê-o com Bun.file.
- Imports de JSON, texto e file ficam embutidos. Com type file, o ficheiro entra na lista de Bun.embeddedFiles.
- Os argumentos do executável chegam intactos: --version, --help e --hot não são apanhados pelo Bun. A exceção é a variável BUN_BE_BUN=1: o executável deixa de correr o teu programa e passa a ser o próprio Bun (com BUN_BE_BUN=1, --version respondeu 1.4.0).
- O executável lê o ficheiro .env da pasta onde corre (por omissão): com LOJA_IVA=0.99 no .env, o programa viu 0.99. A opção --no-compile-autoload-dotenv desliga-o. Há opções iguais para o bunfig.toml, o tsconfig.json e o package.json (--compile-autoload-...).
- --compile-exec-argv="--smol" embute argumentos de runtime: process.execArgv ficou [ "--smol" ].
- Para embutir uma pasta inteira, --asset exe/publico: o exe/lerativos.ts leu publico/index.html e publico/estilo.css por import.meta.dir e Bun.embeddedFiles listou os dois. Sem a opção --asset, os mesmos caminhos não existiam. Na API a opção chama-se compile.assets (funcionou).
- Metadados do Windows: --windows-title, --windows-publisher, --windows-version, --windows-description (e icon, hide-console, copyright). Confirmei com PowerShell que o ProductName, o CompanyName, a FileVersion e a FileDescription ficaram escritos no .exe.

### Compilar com a API, minify, sourcemap e bytecode

    const r = await Bun.build({ entrypoints: ["./exe/relatorio.ts"], compile: { outfile: exe }, minify: true, sourcemap: "linked" });

O exemplo 09 compila assim, corre o exe com um argumento e uma variável de ambiente só dele e apaga tudo (448 a 651 ms de build). Medi o efeito das opções no mesmo programa (a diferença é quilobytes, o executável tem sempre cerca de 88,8 MB):

| Variante da loja (compile) | Tamanho em bytes | A mais que o bun.exe |
|---|---|---|
| simples | 88839680 | 13,4 KiB |
| minify | 88834560 | 8,4 KiB |
| minify e sourcemap linked | 88847360 | 20,9 KiB |
| minify e bytecode (com format esm) | 88900096 | 72,4 KiB |

**ATENÇÃO:** o --bytecode usa o formato cjs por omissão (diz o bun build --help) e a loja usa await no topo do módulo: a build falhou com "await" can only be used inside an "async" function. Acrescentei --format=esm e passou. O arranque do exe da loja não mudou de forma mensurável: entre 368 e 460 ms nas quatro execuções seguintes à primeira (a primeira demorou 698 a 822 ms), contra 314 a 346 ms com bun run main.ts. O ganho prometido pela documentação não apareceu num programa tão pequeno.

**ATENÇÃO:** na 1.4.0, um executável compilado pela API (Bun.build com compile) deu import.meta.main false e Bun.main sem a extensão (B:/~BUN/root/relatorio), enquanto pela CLI deu true. Confirmei em quatro combinações (com e sem minify e sourcemap, outfile com e sem .exe, compile true com outdir). Não dependas de import.meta.main no ponto de entrada de um exe feito pela API. Com compile: true, o outfile também foi ignorado e o executável foi escrito na pasta atual: usa compile: { outfile } ou outdir.

### Outras plataformas

O --target aceita bun-windows-x64, bun-windows-arm64, bun-linux-x64, bun-linux-arm64, bun-linux-x64-musl, bun-linux-arm64-musl, bun-darwin-x64 e bun-darwin-arm64 (lista da documentação, que descreve a 1.4.5). Só executei um: com --target=bun-windows-arm64 o Bun compilou um .exe de 78566912 bytes, e o cabeçalho PE dizia machine 0xaa64 (ARM64), contra 0x8664 (x64) do exe do anfitrião. Não o corri, que a máquina é x64. Compilar para fora da plataforma do anfitrião obriga o Bun a descarregar o executável de destino (3,4 s e uma pasta nova na cache do Bun, bun-windows-aarch64-v1.4.0), por isso precisas de rede: não testei os outros alvos. O Bun aceitou ainda --aot e --trim, que a documentação descreve, mas sem efeito: o executável saiu com o mesmo tamanho (88816640 bytes), por isso na 1.4.0 trata-os como inexistentes.

## HTML imports: página e servidor no mesmo processo

Importar um .html no Bun.serve faz o Bun empacotar os scripts, o CSS e as imagens que ele referencia. A introdução está no módulo 03; aqui medi os modos (exemplo 10, com a pasta web: HTML, TypeScript do cliente, dois ficheiros CSS e um SVG):

    desenvolvimento   JS 49813 bytes (/_bun/client/...)   CSS 47 bytes   sem cache-control, com código de HMR
    dev sem hmr       JS   428 bytes (/chunk-....js)      CSS 121 bytes  sem minify
    produção          JS   224 bytes (/chunk-....js)      CSS  59 bytes  cache-control: public, max-age=31536000, immutable

O modo é a opção development do Bun.serve: true (por omissão) liga o recarregamento a quente (hmr: o JS leva o cliente de HMR do Bun, cerca de 49 KB), um objeto { hmr: false, console: false } serve o pacote sem HMR e false dá o pacote minificado com cache imutável. O que não testei: o hot reload no browser, porque não abri nenhum.

Também funcionam o bun web/index.html --port=35098 (um servidor de desenvolvimento sem escreveres código; na 1.4.0 no Windows só respondeu em localhost e [::1], e não em 127.0.0.1) e o bun build web/index.html --outdir=dist --minify, que escreveu index.html, um JS, um CSS e o SVG com hash no nome, e fundiu o CSS da página com o CSS importado pelo TypeScript num só ficheiro. O cliente (web/cliente.ts) é TypeScript puro que corre no browser: o Bun transpila-o e importa o CSS sem nenhuma biblioteca.

**DICA:** o HTML import dentro de um executável fica embutido: o exe/servidor-web.ts compilado (88819200 bytes) serviu a página, o JS (251 bytes), o CSS (59 bytes) e o SVG (112 bytes), todos com 200.

## Caso na loja: a API num único executável

O loja-exe/main.ts reaproveita, sem copiar, as rotas e o OpenAPI do módulo 03. O servidor.ts original lia o loja.sql e o docs.html do disco, por isso o ponto de entrada novo embute os dois com import attributes:

    import sql from "../../../00-Introducao/dados/loja.sql" with { type: "text" };
    import docs from "../../../03-Servidor-HTTP/exemplos/loja-api/docs.html" with { type: "file" };
    import { gerarOpenApi } from "../../../03-Servidor-HTTP/exemplos/loja-api/openapi.ts";
    import { rotasDoBun } from "../../../03-Servidor-HTTP/exemplos/loja-api/servidor.ts";
    /* abre a base em memória com o sql, e no Bun.serve: */
    routes: { ...rotasDoBun(db), "/openapi.json": () => Response.json(documento),
              "/docs": () => new Response(Bun.file(docs), { headers: { "content-type": "text/html; charset=utf-8" } }) }

    bun build --compile --minify loja-exe/main.ts --outfile=loja.exe
    8 modules, loja.exe: 88834560 bytes (8,4 KiB acima do bun.exe)
    bun build --target=bun --minify loja-exe/main.ts --outdir=...
    main.js 17,68 KB + docs.html 0,93 KB (o JavaScript sem o executável)

Para provar que funciona, o loja-exe/testar-exe.ts arranca o exe com Bun.spawn (guarda o PID de verdade, o do Windows), espera pela primeira linha, faz pedidos reais e termina só esse processo com filho.kill():

    arrancou loja-min.exe com pid 2984
    pronto em 449 ms: loja em http://127.0.0.1:35094 (docs em /docs) pid 2984
    /openapi.json 200 application/json;charset=utf-8 | openapi 3.0.3 | 5 caminhos
    /docs 200 text/html; charset=utf-8 | 924 carateres | swagger-ui-dist@5.35.1: true | url "/openapi.json": true
    /api/produtos/4 200 {"id":4,"nome":"Auscultadores Bluetooth","categoria_id":2,"preco":49.9,"stock":30}
    POST /api/encomendas 201 {"id":13,"cliente_id":1,"data_encomenda":"2026-11-23","estado":"pendente", ... "total":99.8}
    POST inválido 422 {"erro":"corpo inválido","detalhes":["$.cliente_id: mínimo 1","$.linhas: pelo menos 1 item(s)"]}
    terminado o pid 2984 (sinal: SIGTERM código: null)

Com o tasklist, filtrando só por esse PID, confirmei que o processo tinha desaparecido, e o netstat não mostrou nenhuma porta 3509x em escuta. O documento e a validação são os do módulo 03: o exe devolve o mesmo /openapi.json (5 caminhos) e o mesmo erro 422 do mini validador. Por baixo, a base é a do módulo 05 (SQLite em memória): cada arranque recomeça com os dados do loja.sql e a encomenda 13 desaparece quando o processo termina.

**ATENÇÃO:** o /docs continua a precisar de rede no browser de quem o abre, porque o HTML carrega o Swagger UI da CDN (swagger-ui-dist 5.35.1, com SRI). O executável só embute a página que o carrega. Embutir o próprio swagger-ui-dist exigiria o pacote npm (fora das regras do curso) e ficaria dezenas de ficheiros maior. Não abri um browser: não verifiquei que o Swagger UI desenha a página, só o HTML devolvido, o JSON e os hashes. O HTML import do docs.html também funciona (o Bun deixou os links da CDN com o integrity intacto), mas acrescentou um script de módulo vazio, por isso não ganhei nada com ele.

O loja-exe/build.ts compila as quatro variantes da tabela anterior e mede-as; recebe a pasta de saída como argumento, para nunca escreveres nada junto ao curso.

## Exercícios

**PRATICAR:** faz os exercícios 33 a 36 do módulo 13 (três variantes de um pacote para o browser, um plugin para ficheiros .sql, uma CLI da loja compilada e uma montra com servidor, página e macros num só executável). As soluções estão no módulo 15.

## Fontes oficiais

- [Bun: bundler](https://bun.sh/docs/bundler)
- [Bun: executáveis (single-file executable)](https://bun.com/docs/compiler/executables)
- [Bun: loaders](https://bun.sh/docs/bundler/loaders)
- [Bun: plugins do bundler](https://bun.sh/docs/bundler/plugins)
- [Bun: plugins de runtime](https://bun.sh/docs/runtime/plugins)
- [Bun: macros](https://bun.sh/docs/bundler/macros)
- [Bun: HTML imports e sites estáticos](https://bun.sh/docs/bundler/html-static)
- [Bun: full-stack dev server](https://bun.sh/docs/bundler/fullstack)
- [Bun: bunfig.toml](https://bun.sh/docs/runtime/bunfig)
- [Swagger UI: instalação](https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/)
- [Especificação OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3)
