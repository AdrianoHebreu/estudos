# 15 Soluções e critérios

Soluções dos exercícios do módulo 13. Todas foram executadas durante a escrita do curso e os resultados mostrados são reais. Há sempre mais de uma solução correta: compara o comportamento, não o código.

## Módulo 01 · Runtime e TypeScript

### Exercício 1

Ficheiros: produtos.ts (os 10 produtos num array, o argumento lido com Number(Bun.argv[2] ?? "0"), Number.isNaN para validar, filter e sort, process.exit(2) e process.exit(1) nos casos de erro) e package.json:

    {
        "name": "ex01",
        "private": true,
        "scripts": {
            "caros": "bun run produtos.ts 30",
            "precheck": "echo A consultar a loja...",
            "check": "bun run produtos.ts 1000"
        }
    }

    bun run caros
    $ bun run produtos.ts 30
     8 Conjunto de Panelas       89.90
     6 Teclado Mecânico          79.00
     4 Auscultadores Bluetooth   49.90
     9 Manta de Sofá             34.50
    (código 0)

    bun run check
    $ echo A consultar a loja...
    A consultar a loja...
    $ bun run produtos.ts 1000
    nenhum produto com preço >= 1000
    error: script "check" exited with code 1
    (código 1)

    bun run produtos.ts abc
    preço mínimo inválido: abc
    (código 2)

Respostas: o bun run check imprime a mensagem de erro (stderr), o Bun acrescenta error: script "check" exited with code 1 e termina com 1. O precheck correu sozinho antes do check (prefixo pre). Com --silent desaparecem as linhas que começam por $ (o comando que o Bun anuncia), mas a saída do programa mantém-se. O código do programa passou intacto para o bun run.

### Exercício 2

Ficheiros .env, .env.local, .env.production e config.ts (função numero que lê Bun.env[nome], rejeita undefined, vazio e NaN, escreve em stderr e faz process.exit(1)).

| Execução | PORTA | MOEDA | IVA | Porquê |
|---|---|---|---|---|
| (a) sem NODE_ENV | 4000 | EUR | 0.23 | o .env.local ganha ao .env |
| (b) NODE_ENV=production | 4000 | USD | 0.2 | .env.production ganha ao .env; o .env.local só define PORTA |
| (c) NODE_ENV=test | 3000 | EUR | 0.23 | em test o .env.local não é lido |
| (d) PORTA=5000 e production | 5000 | USD | 0.2 | o shell ganha a todos os ficheiros |

    bun run config.ts
    { modo: "(sem NODE_ENV)", porta: 4000, moeda: "EUR", iva: 0.23 }
    12.90 com IVA: 15.87 EUR

    NODE_ENV=production bun run config.ts
    { modo: "production", porta: 4000, moeda: "USD", iva: 0.2 }
    12.90 com IVA: 15.48 USD

    NODE_ENV=test bun run config.ts
    { modo: "test", porta: 3000, moeda: "EUR", iva: 0.23 }
    12.90 com IVA: 15.87 EUR

    PORTA=5000 NODE_ENV=production bun run config.ts
    { modo: "production", porta: 5000, moeda: "USD", iva: 0.2 }

    IVA=abc bun run config.ts
    IVA em falta ou inválida: abc
    (código 1)

O objeto sai em várias linhas no console.log do Bun; aqui está numa só. Sem NODE_ENV o Bun carrega o .env.development (que não existe aqui).

### Exercício 3

    // relatorio.ts
    import { produtos } from "@loja/produtos";
    import categorias from "./categorias.json";
    import config from "./loja.toml";

    console.log(`Stock mínimo da loja: ${config.stock_minimo}`);
    for (const c of categorias) {
        const da = produtos.filter((p) => p.categoria_id === c.id);
        const baixos = da.filter((p) => p.stock < config.stock_minimo);
        const valor = da.reduce((soma, p) => soma + p.preco * p.stock, 0);
        console.log(`${c.nome.padEnd(11)} ${da.length} produtos | valor em stock ${valor.toFixed(2)} EUR | a repor: ${baixos.map((p) => p.nome).join(", ") || "nenhum"}`);
    }

O tsconfig.json tem apenas compilerOptions com paths: "@loja/*": ["./src/*"].

    bun run relatorio.ts
    Stock mínimo da loja: 10
    Livros      3 produtos | valor em stock 1278.40 EUR | a repor: nenhum
    Eletrónica  3 produtos | valor em stock 2987.00 EUR | a repor: Teclado Mecânico
    Casa        4 produtos | valor em stock 3039.20 EUR | a repor: Conjunto de Panelas

Numa pasta sem tsconfig.json o alias deixa de existir: error: Cannot find module '@loja/produtos' from '.../relatorio.ts'. O Atlas Mundial (stock 10) não aparece como a repor porque a condição é estritamente menor do que 10. Os preços são de vírgula flutuante; arredondei só ao mostrar.

### Exercício 4

Parte A: stock.ts exporta abaixoDoMinimo e termina com if (import.meta.main) { ... process.exit(baixos.length > 0 ? 1 : 0); }.

    bun run stock.ts
    [stock.ts] main=true | abaixo de 10: Teclado Mecânico, Conjunto de Panelas
    (código 1)

    bun run stock.ts 5
    [stock.ts] main=true | abaixo de 5: Teclado Mecânico
    (código 1)

    bun run resumo.ts
    [resumo.ts] main=true | Bun.main = resumo.ts
    a repor (minimo 20): [ "Atlas Mundial", "Teclado Mecânico", "Conjunto de Panelas" ]
    (código 0)

Quando o resumo.ts importa o stock.ts, o bloco do import.meta.main do stock.ts não corre: lá dentro import.meta.main é false. O resumo.ts é que é o programa principal, e Bun.main aponta para ele.

Parte B: vigia.ts.

    import { VERSAO } from "./versao.ts";

    const g = globalThis as { aberturas?: number };
    g.aberturas = (g.aberturas ?? 0) + 1;
    console.log(`${VERSAO} | pid=${process.pid} | avaliações no mesmo processo=${g.aberturas}`);
    setTimeout(() => process.exit(0), 9000);

    bun --watch vigia.ts
    v1 | pid=13176 | avaliações no mesmo processo=1
    v2 | pid=39724 | avaliações no mesmo processo=1
    v3 | pid=25152 | avaliações no mesmo processo=1

    bun --hot vigia.ts
    v1 | pid=13432 | avaliações no mesmo processo=1
    v2 | pid=13432 | avaliações no mesmo processo=2
    v3 | pid=13432 | avaliações no mesmo processo=3

| Modo | PID | Contador |
|---|---|---|
| --watch | muda em cada alteração | volta sempre a 1 |
| --hot | fica igual | sobe 1, 2, 3 |

O --watch reinicia o processo (estado perdido); o --hot volta a avaliar os módulos no mesmo processo, e por isso o globalThis sobrevive. As alterações foram feitas no versao.ts, não no vigia.ts: o Bun vigia todos os ficheiros importados. Os PID variam de execução para execução. Em duas das minhas tentativas a primeira linha do --watch não apareceu (a máquina estava ocupada e a edição chegou antes do arranque): espera pela linha v1 antes de editar. Os processos em segundo plano terminam sozinhos ao fim de 9 segundos, e confirmei que não ficou nenhum processo bun meu.

## Módulo 02 · Ficheiros e sistema

### Exercício 5

    const sql = await Bun.file("00-Introducao/dados/loja.sql").text();
    const contagem = new Map<string, number>();
    for (const m of sql.matchAll(/^INSERT INTO (\w+)/gm)) {
      contagem.set(m[1], (contagem.get(m[1]) ?? 0) + 1);
    }
    const ordenado = [...contagem].sort((a, b) => b[1] - a[1]);
    for (const [tabela, n] of ordenado) console.log(tabela.padEnd(18), n);
    console.log("total".padEnd(18), ordenado.reduce((s, [, n]) => s + n, 0));

Saída (executado com bun, a partir da pasta do curso):

    linhas_encomenda   26
    encomendas         12
    produtos           10
    clientes           8
    categorias         3
    total              59

O flag m da expressão regular faz o ^ casar no início de cada linha, e o g permite percorrer todas com matchAll. O Map conta por tabela e o sort ordena do maior para o menor.

### Exercício 6

    import { mkdtemp, rm } from "node:fs/promises";
    import { tmpdir } from "node:os";
    import { join } from "node:path";

    const base = (await mkdtemp(join(tmpdir(), "bn02-ex06-"))).replaceAll("\\", "/");
    for (const f of ["dados/clientes.sql", "dados/produtos.sql", "extra/.oculto.sql", "notas.txt"]) {
      await Bun.write(`${base}/origem/${f}`, `-- ${f}\n`);
    }

    async function procurar(dot: boolean) {
      const r: string[] = [];
      for await (const rel of new Bun.Glob("**/*.sql").scan({ cwd: `${base}/origem`, dot })) {
        r.push(rel.replaceAll("\\", "/"));
      }
      return r.sort();
    }
    console.log("sem dot:", await procurar(false));
    const todos = await procurar(true);
    console.log("com dot:", todos);

    for (const rel of todos) {
      await Bun.write(`${base}/backup/${rel}`, Bun.file(`${base}/origem/${rel}`));
    }
    const copiados = await Array.fromAsync(new Bun.Glob("**/*.sql").scan({ cwd: `${base}/backup`, dot: true }));
    console.log("no backup:", copiados.map(f => f.replaceAll("\\", "/")).sort());
    console.log("sizes iguais:", todos.every(rel => Bun.file(`${base}/backup/${rel}`).size === Bun.file(`${base}/origem/${rel}`).size));
    await rm(base, { recursive: true });

Saída:

    sem dot: [ "dados/clientes.sql", "dados/produtos.sql" ]
    com dot: [ "dados/clientes.sql", "dados/produtos.sql", "extra/.oculto.sql" ]
    no backup: [ "dados/clientes.sql", "dados/produtos.sql", "extra/.oculto.sql" ]
    sizes iguais: true

Sem dot o scan ignora o ficheiro que começa por ponto. O Bun.write cria as subpastas do backup sozinho. As cópias têm o tamanho certo porque copiámos ficheiros inteiros (o caso do slice tem a armadilha descrita na aula).

### Exercício 7

    import { $ } from "bun";
    import { mkdtemp } from "node:fs/promises";
    import { tmpdir } from "node:os";
    import { join } from "node:path";

    const base = (await mkdtemp(join(tmpdir(), "bn02-ex07-"))).replaceAll("\\", "/");
    const nome = "relatorio; rm -rf x";

    await $`mkdir -p ${base}/saida`;
    await $`echo ${"Total: 7304.60"} > ${base}/saida/${nome}.txt`;
    console.log("ficheiros:", (await $`ls ${base}/saida`.text()).trim().split("\n"));
    console.log("conteúdo:", (await $`cat ${base}/saida/${nome}.txt`.text()).trim());

    const r = await $`cat ${base}/saida/nao-existe.txt`.nothrow().quiet();
    console.log("código de saída:", r.exitCode, "| erro:", r.stderr.toString().trim().replace(base, "<base>"));

    try {
      await $`cat ${base}/saida/nao-existe.txt`.quiet();
    } catch (e: any) {
      console.log("apanhado:", e.constructor.name, e.exitCode);
    }
    await $`rm -rf ${base}`;
    console.log("limpo:", (await $`ls ${base}`.nothrow().quiet()).exitCode !== 0);

Saída:

    ficheiros: [ "relatorio; rm -rf x.txt" ]
    conteúdo: Total: 7304.60
    código de saída: 1 | erro: cat: <base>/saida/nao-existe.txt: No such file or directory
    apanhado: ShellError 1
    limpo: true

Cada valor interpolado é um único argumento e o Bun escapa-o: o ponto e vírgula e o rm fazem parte do nome do ficheiro, não são comandos. Repara que o texto acentuado e os nomes vão por interpolação, o que também evita o problema dos acentos no texto literal do shell no Windows. Nota: os comandos mkdir, echo, ls, cat e rm são todos embutidos do Bun.

### Exercício 8

    import { mkdtemp, rm } from "node:fs/promises";
    import { tmpdir } from "node:os";
    import { join } from "node:path";

    const pasta = (await mkdtemp(join(tmpdir(), "bn02-ex08-"))).replaceAll("\\", "/");

    await Bun.write(`${pasta}/filtro.ts`, `
    let total = 0, n = 0;
    for await (const linha of console) {
      if (linha.trim() === "") continue;
      const [nome, preco] = linha.split(";");
      if (!nome || Number.isNaN(Number(preco))) { console.error("ignorada: " + linha); continue; }
      total += Number(preco); n++;
    }
    console.log(n + " produtos, total " + total.toFixed(2));
    `);

    const filho = Bun.spawn(["bun", "run", `${pasta}/filtro.ts`], { stdin: "pipe", stdout: "pipe", stderr: "pipe" });
    for (const l of ["Romance Policial;12.90", "Carregador USB-C;14.90", "sem preço", "Caneca de Cerâmica;6.50"]) {
      filho.stdin.write(l + "\n");
    }
    filho.stdin.end();
    const [saida, erros, codigo] = await Promise.all([filho.stdout.text(), filho.stderr.text(), filho.exited]);
    console.log("saída:", saida.trim());
    console.log("erros:", erros.trim());
    console.log("exitCode:", codigo);

    await Bun.write(`${pasta}/preso.ts`, "setInterval(() => {}, 1000);\n");
    const preso = Bun.spawn(["bun", "run", `${pasta}/preso.ts`]);
    console.log("preso arrancou com pid:", typeof preso.pid === "number");
    const resultado = await Promise.race([preso.exited, Bun.sleep(500).then(() => "tempo esgotado")]);
    console.log("race:", resultado);
    if (resultado === "tempo esgotado") {
      preso.kill();
      console.log("depois do kill:", await preso.exited, preso.signalCode);
    }
    await rm(pasta, { recursive: true });

Saída:

    saída: 3 produtos, total 34.30
    erros: ignorada: sem preço
    exitCode: 0
    preso arrancou com pid: true
    race: tempo esgotado
    depois do kill: 143 SIGTERM

Lemos stdout, stderr e exited em paralelo com Promise.all para o filho nunca bloquear a escrever. O kill é feito no objeto devolvido pelo Bun.spawn, o que termina só o processo que lançaste. No Windows o código de saída de um processo terminado assim é 143.

## Módulo 03 · Servidor HTTP

### Exercício 9

    const server = Bun.serve({
      port: 35032,
      hostname: "127.0.0.1",
      routes: {
        "/ola/:nome": (req) => {
          const nome = req.params.nome; // o Bun já descodifica os parâmetros
          const maiusculas = new URL(req.url).searchParams.get("maiusculas") === "1";
          return Response.json({ mensagem: `Olá, ${maiusculas ? nome.toUpperCase() : nome}!` });
        },
      },
      fetch: () => Response.json({ erro: "rota não existe" }, { status: 404 }),
    });

    for (const caminho of ["/ola/Ana", "/ola/Graça%20Nunes?maiusculas=1", "/adeus"]) {
      const r = await fetch(server.url.origin + caminho);
      console.log(r.status, r.headers.get("content-type"), await r.text());
    }
    await server.stop();

Saída real (bun run ex09.ts):

    200 application/json;charset=utf-8 {"mensagem":"Olá, Ana!"}
    200 application/json;charset=utf-8 {"mensagem":"Olá, GRAÇA NUNES!"}
    404 application/json;charset=utf-8 {"erro":"rota não existe"}

O Response.json trata do Content-Type. O req.params.nome já vem descodificado (Graça Nunes), por isso não se aplica decodeURIComponent outra vez. Os caminhos sem rota caem no fetch de reserva.

### Exercício 10

    class ErroHttp extends Error {
      constructor(public status: number, mensagem: string) {
        super(mensagem);
      }
    }

    const server = Bun.serve({
      port: 35033,
      hostname: "127.0.0.1",
      routes: {
        "/visitas": (req) => {
          const atual = req.cookies.get("visitas") ?? "0";
          const n = Number(atual);
          if (!Number.isInteger(n) || n < 0) throw new ErroHttp(400, `cookie visitas inválido: ${atual}`);
          req.cookies.set("visitas", String(n + 1), { maxAge: 3600, httpOnly: true });
          return Response.json({ visitas: n + 1 });
        },
      },
      error: (e) => Response.json({ erro: e.message }, { status: e instanceof ErroHttp ? e.status : 500 }),
    });

    let cookie = "";
    for (let i = 0; i < 3; i++) {
      const r = await fetch(server.url.origin + "/visitas", { headers: { Cookie: cookie } });
      cookie = r.headers.getSetCookie()[0].split(";")[0];
      console.log(r.status, await r.text(), "| Set-Cookie:", r.headers.getSetCookie()[0]);
    }
    const mau = await fetch(server.url.origin + "/visitas", { headers: { Cookie: "visitas=abc" } });
    console.log(mau.status, await mau.text());
    await server.stop();

Saída real:

    200 {"visitas":1} | Set-Cookie: visitas=1; Path=/; Max-Age=3600; HttpOnly; SameSite=Lax
    200 {"visitas":2} | Set-Cookie: visitas=2; Path=/; Max-Age=3600; HttpOnly; SameSite=Lax
    200 {"visitas":3} | Set-Cookie: visitas=3; Path=/; Max-Age=3600; HttpOnly; SameSite=Lax
    400 {"erro":"cookie visitas inválido: abc"}

As alterações ao req.cookies viram Set-Cookie sozinhas. O erro lançado na rota é apanhado pelo handler error, que decide o estado.

### Exercício 11

    const ESTADOS = ["pendente", "enviada", "entregue", "cancelada"];

    const server = Bun.serve({
      port: 35034,
      hostname: "127.0.0.1",
      routes: {
        "/ws": (req, srv) => (srv.upgrade(req) ? undefined : new Response("só WebSocket", { status: 426 })),
        "/avisos": {
          POST: async (req, srv) => {
            const { id, estado } = (await req.json()) as { id: number; estado: string };
            if (!ESTADOS.includes(estado)) return Response.json({ erro: "estado inválido" }, { status: 400 });
            srv.publish("encomendas", JSON.stringify({ id, estado }));
            return Response.json({ subscritores: srv.subscriberCount("encomendas") });
          },
        },
      },
      websocket: {
        open: (ws) => ws.subscribe("encomendas"),
        message() {}, // os clientes só ouvem
      },
    });

    async function ouvinte(nome: string) {
      const ws = new WebSocket(`ws://127.0.0.1:${server.port}/ws`);
      const recebidas: string[] = [];
      ws.onmessage = (e) => recebidas.push(`${nome}: ${e.data}`);
      await new Promise((ok) => (ws.onopen = ok));
      return { ws, recebidas };
    }

    const a = await ouvinte("A");
    const b = await ouvinte("B");
    await Bun.sleep(30);
    const post = (corpo: unknown) => fetch(server.url.origin + "/avisos", { method: "POST", body: JSON.stringify(corpo) });
    console.log((await post({ id: 8, estado: "enviada" })).status, await (await post({ id: 9, estado: "entregue" })).text());
    const mau = await post({ id: 9, estado: "perdida" });
    console.log(mau.status, await mau.text());
    await Bun.sleep(50);
    console.log(a.recebidas.join("\n"));
    console.log(b.recebidas.join("\n"));
    a.ws.close();
    b.ws.close();
    await server.stop(true);

Saída real:

    200 {"subscritores":2}
    400 {"erro":"estado inválido"}
    A: {"id":8,"estado":"enviada"}
    A: {"id":9,"estado":"entregue"}
    B: {"id":8,"estado":"enviada"}
    B: {"id":9,"estado":"entregue"}

Como a publicação parte de uma rota HTTP, usa-se server.publish (a rota recebe o servidor no segundo argumento). O aviso inválido foi recusado antes de publicar, por isso nenhum ouvinte o recebeu. O Bun.sleep dá tempo às mensagens de chegar.

### Exercício 12

Em rotas.ts acrescenta o esquema Cliente e a rota (o resto do ficheiro fica igual):

    Cliente: {
      type: "object",
      required: ["id", "nome", "cidade"],
      properties: {
        id: { type: "integer", example: 1 },
        nome: { type: "string", example: "Ana Ribeiro" },
        cidade: { type: "string", example: "Lisboa" },
      },
    },

    {
      metodo: "get",
      caminho: "/clientes",
      resumo: "Lista clientes, com filtro por cidade",
      parametros: [{ nome: "cidade", em: "query", esquema: { type: "string", minLength: 2 }, descricao: "Nome exato da cidade" }],
      respostas: {
        200: { descricao: "Clientes por ordem de id", esquema: { type: "array", items: ref("Cliente") } },
        400: { descricao: "Parâmetro inválido", esquema: ref("Erro") },
      },
      tratar: ({ db, query }) => ({
        status: 200,
        corpo: db.query("SELECT id, nome, cidade FROM clientes WHERE ($c IS NULL OR cidade = $c) ORDER BY id").all({ $c: (query.cidade as string) ?? null }),
      }),
    },

No loja.test.ts a lista de caminhos passa a incluir /clientes (segunda posição, porque a rota foi inserida depois de /categorias). Saída real de um script que arranca o servidor da cópia e faz pedidos (o servidor.ts e o openapi.ts ficaram intactos: confirmei com diff):

    caminhos: /categorias /clientes /produtos /produtos/{id} /encomendas /encomendas/{id}
    parâmetros: [{"name":"cidade","in":"query","required":false,"description":"Nome exato da cidade","schema":{"type":"string","minLength":2}}]
    GET /api/clientes?cidade=Lisboa 200 [{"id":1,"nome":"Ana Ribeiro","cidade":"Lisboa"},{"id":4,"nome":"Diogo Pires","cidade":"Lisboa"},{"id":8,...
    GET /api/clientes?cidade=L 400 {"erro":"parâmetros inválidos","detalhes":["cidade: comprimento mínimo 2"]}
    GET /api/clientes 200 [{"id":1,"nome":"Ana Ribeiro","cidade":"Lisboa"},{"id":2,"nome":"Bruno Costa","cidade":"Porto"},{"id":3,"nome...

    bun test loja.test.ts
     23 pass
     0 fail

Com o teste original (sem /clientes na lista) a execução dá 22 pass e 1 fail: o teste "tem a estrutura mínima" compara a lista exata de caminhos do documento e agora aparece /clientes a mais. Falhou por boas razões: o documento acompanhou a tabela, e o teste obriga-te a reconhecer a mudança. Os testes por rota (cada rota documentada existe e cumpre o esquema) e o do exemplo de cada esquema passaram sem alterações e já cobrem a rota nova (23 testes em vez de 21).

## Módulo 04 · Cliente e Web APIs

### Exercício 13

    import { iniciar } from "./servidor-loja.ts";

    const server = iniciar();
    const base = server.url.origin;

    async function obter<T>(caminho: string): Promise<{ dados: T; total: number }> {
      const r = await fetch(new URL(caminho, base));
      if (!r.ok) throw new Error(`HTTP ${r.status} em ${caminho}`);
      return { dados: (await r.json()) as T, total: Number(r.headers.get("x-total-count") ?? 1) };
    }

    type Produto = { id: number; nome: string; preco: number; stock: number };
    const { dados, total } = await obter<Produto[]>("/api/produtos?" + new URLSearchParams({ categoria: "3", max: "30" }));
    console.log(`${total} produtos encontrados`);
    for (const p of dados.sort((a, b) => b.preco - a.preco)) {
      console.log(p.nome.padEnd(22), p.preco.toFixed(2).padStart(6), "€", String(p.stock).padStart(4));
    }
    const valor = dados.reduce((s, p) => s + Math.round(p.preco * 100) * p.stock, 0) / 100;
    console.log("valor em stock:", valor.toFixed(2), "€");

    try {
      await obter("/api/produtos/99");
    } catch (e) {
      console.log("erro apanhado:", (e as Error).message);
    }
    try {
      await fetch("http://localhost:35049/", { signal: AbortSignal.timeout(500) });
    } catch (e: any) {
      console.log("sem servidor:", e.name, e.code);
    }
    await server.stop(true);

Saída (executado com bun 1.4.0, ao lado de servidor-loja.ts):

    2 produtos encontrados
    Candeeiro de Mesa       22.00 €   15
    Caneca de Cerâmica       6.50 €  200
    valor em stock: 1630.00 €
    erro apanhado: HTTP 404 em /api/produtos/99
    sem servidor: TypeError ConnectionRefused

A função obter lança quando r.ok é falso e devolve também o cabeçalho X-Total-Count. O dinheiro é somado em cêntimos inteiros (Math.round(preco * 100)). Sem servidor, o fetch rejeita com TypeError; na 1.4.0 o code é ConnectionRefused (e não ECONNREFUSED, como diz a documentação).

### Exercício 14

    import { mkdtemp, rm } from "node:fs/promises";
    import { tmpdir } from "node:os";
    import { join } from "node:path";
    import { iniciar } from "./servidor-loja.ts";

    const server = iniciar();
    const base = server.url.origin;
    const pasta = await mkdtemp(join(tmpdir(), "bn04-ex14-"));

    // 1. Conta linhas em streaming e comprime ao mesmo tempo, com tee()
    const resposta = await fetch(`${base}/api/linhas.ndjson`);
    const [paraContar, paraComprimir] = resposta.body!.tee();

    let linhas = 0, bruto = 0;
    const contar = (async () => {
      let resto = "";
      for await (const t of paraContar.pipeThrough(new TextDecoderStream())) {
        bruto += t.length;
        resto += t;
        const partes = resto.split("\n");
        resto = partes.pop()!;
        linhas += partes.length;
      }
      if (resto) linhas++;
    })();

    const destino = join(pasta, "linhas.ndjson.gz");
    // Bun.write(destino, new Response(stream criado em JS)) fica pendurado no Bun 1.4.0 (Windows):
    // por isso escrevo com o FileSink (file.writer()).
    let bytesGz = 0;
    const escrever = (async () => {
      const w = Bun.file(destino).writer();
      for await (const pedaco of paraComprimir.pipeThrough(new CompressionStream("gzip"))) w.write(pedaco);
      await w.end();
      bytesGz = Bun.file(destino).size; // o valor devolvido por end() foi 0 aqui
    })();
    await Promise.all([contar, escrever]);
    console.log(`linhas: ${linhas}, texto: ${bruto} caracteres, gzip: ${bytesGz} bytes`);

    // 2. Verifica o ficheiro: magic number e ida e volta
    const ficheiro = Bun.file(destino);
    const cab = (await ficheiro.slice(0, 2).bytes());
    console.log("magic:", [...cab].map(b => b.toString(16)).join(" "));
    const original = await Bun.file(destino).stream().pipeThrough(new DecompressionStream("gzip")).pipeThrough(new TextDecoderStream());
    const texto = (await Array.fromAsync(original)).join("");
    console.log("descomprimido:", texto.length, "caracteres, linhas:", texto.trim().split("\n").length, "| igual:", texto.length === bruto);
    console.log("primeira linha:", JSON.parse(texto.split("\n")[0]).nome);

    // 3. Descarregar o CSV direto para disco e comparar com o tamanho anunciado
    const csv = join(pasta, "relatorio.csv");
    const n = await Bun.write(csv, await fetch(`${base}/api/relatorio.csv`));
    console.log("csv:", n, "bytes =", Bun.file(csv).size, "bytes no disco");

    await rm(pasta, { recursive: true, force: true });
    await server.stop(true);

Saída (executado com bun 1.4.0, ao lado de servidor-loja.ts):

    linhas: 10, texto: 755 caracteres, gzip: 306 bytes
    magic: 1f 8b
    descomprimido: 755 caracteres, linhas: 10 | igual: true
    primeira linha: Romance Policial
    csv: 341 bytes = 341 bytes no disco

O tee() divide o corpo em dois ramos que avançam ao ritmo do mais lento: um conta linhas, o outro comprime. A escrita usa o FileSink porque, na 1.4.0 no Windows, Bun.write(destino, new Response(stream criado em JS)) ficou pendurado em todos os testes que fiz, e Bun.write(destino, stream) escreveu o texto [object ReadableStream]. O valor devolvido por w.end() foi 0, por isso o tamanho vem de Bun.file(destino).size. O Bun.write com a Response de um fetch funciona (341 bytes).

### Exercício 15

    import { iniciar } from "./servidor-loja.ts";

    const server = iniciar();
    const url = `ws://localhost:${server.port}/ws`;

    class ClienteWs {
      private ws!: WebSocket;
      private fila: string[] = [];
      private tentativas = 0;
      private fechadoDeProposito = false;
      recebidas: string[] = [];
      ligacoes = 0;

      constructor(private url: string, private maxTentativas = 4, private onMsg?: (m: string) => void) {
        this.abrir();
      }
      private abrir() {
        this.ws = new WebSocket(this.url);
        this.ws.addEventListener("open", () => {
          this.ligacoes++;
          this.tentativas = 0;
          for (const m of this.fila.splice(0)) this.ws.send(m);   // esvazia a fila
        });
        this.ws.addEventListener("message", ev => { this.recebidas.push(String(ev.data)); this.onMsg?.(String(ev.data)); });
        this.ws.addEventListener("close", ev => {
          if (this.fechadoDeProposito) return;
          if (this.tentativas >= this.maxTentativas) return console.log("desisti após", this.tentativas, "tentativas");
          const espera = Math.min(50 * 2 ** this.tentativas++, 400);
          console.log(`caiu (${ev.code} ${ev.reason}); nova tentativa em ${espera} ms`);
          setTimeout(() => this.abrir(), espera);
        });
      }
      enviar(m: string) {
        if (this.ws.readyState === WebSocket.OPEN) this.ws.send(m);
        else this.fila.push(m);
      }
      fechar() { this.fechadoDeProposito = true; this.ws.close(1000, "fim"); }
    }

    const c = new ClienteWs(url);
    c.enviar("encomenda 1");       // enviada antes de abrir: vai para a fila
    await Bun.sleep(100);
    c.enviar("cair");              // o servidor corta a ligação com 1011
    await Bun.sleep(20);           // dá tempo ao close chegar (sem isto a mensagem seguinte perde-se)
    c.enviar("encomenda 2");       // enviada durante a queda: fica na fila
    await Bun.sleep(500);
    c.enviar("encomenda 3");
    await Bun.sleep(100);
    console.log("ligações:", c.ligacoes);
    console.log(c.recebidas);
    c.fechar();

    // Servidor que desaparece: o cliente desiste ao fim de 3 tentativas
    const c2 = new ClienteWs("ws://localhost:35049/ws", 3);
    await Bun.sleep(700);
    c2.fechar();
    await Bun.sleep(50);
    await server.stop(true);

Saída (executado com bun 1.4.0, ao lado de servidor-loja.ts):

    caiu (1011 queda simulada); nova tentativa em 50 ms
    ligações: 2
    [ "bem-vindo à loja", "eco: encomenda 1", "bem-vindo à loja",
      "eco: encomenda 2", "eco: encomenda 3"
    ]
    caiu (1006 Failed to connect); nova tentativa em 50 ms
    caiu (1006 Failed to connect); nova tentativa em 100 ms
    caiu (1006 Failed to connect); nova tentativa em 200 ms
    desisti após 3 tentativas

A fila guarda as mensagens enquanto readyState não é OPEN e esvazia-se no evento open. Atenção à janela entre o servidor fechar e o cliente receber o close: uma mensagem enviada nesse intervalo vai para um socket morto e perde-se (sem o sleep de 20 ms, a encomenda 2 perdeu-se). Para garantias a sério é preciso confirmação (ack) de cada mensagem. A espera duplica a cada falha (50, 100, 200 ms) e o contador repõe-se no open.

### Exercício 16

    import { iniciar } from "./servidor-loja.ts";

    const server = iniciar();
    const base = server.url.origin;

    // 1. Descarrega a página e limpa-a: sem script, sem comentários, links absolutos
    const resposta = await fetch(`${base}/catalogo.html`);
    const nomes: string[] = [];
    let ligacoesAbsolutas = 0;

    const limpa = new HTMLRewriter()
      .on("script", { element: el => el.remove() })
      .onDocument({ comments: c => c.remove() })
      .on("a[href]", {
        element(a) {
          const href = a.getAttribute("href")!;
          if (href.startsWith("/")) { a.setAttribute("href", new URL(href, "https://loja.exemplo.pt").href); ligacoesAbsolutas++; }
        },
      })
      // 2. Para cada produto, vai à API buscar o stock e escreve-o num atributo e num selo
      .on("li.produto", {
        async element(li) {
          const id = li.getAttribute("data-id")!;
          const p = await (await fetch(`${base}/api/produtos/${id}`)).json();
          li.setAttribute("data-stock", String(p.stock));
          li.append(` <span class="stock">${p.stock > 0 ? p.stock + " em stock" : "esgotado"}</span>`, { html: true });
        },
      })
      .transform(resposta);                      // Response: handlers assíncronos permitidos

    const html = await limpa.text();
    console.log(html);
    console.log("script:", html.includes("<script"), "| comentário:", html.includes("nota interna"), "| links absolutos:", ligacoesAbsolutas);

    // 3. Segunda passagem só para extrair os nomes: o primeiro bloco de texto de cada li
    //    (o text() dos seletores apanha também o texto dos filhos, como o link e o selo)
    let primeiro = true, acc = "";
    new HTMLRewriter().on("li.produto", {
      element() { primeiro = true; acc = ""; },
      text(t) {
        if (!primeiro) return;
        acc += t.text;
        if (t.lastInTextNode) { nomes.push(acc.trim()); primeiro = false; }
      },
    }).transform(html);
    console.log("nomes:", nomes);

    // 4. Texto substituído: título em maiúsculas, sobre uma Response criada à mão
    const local = new HTMLRewriter()
      .on("title", { text(t) { t.replace(t.text.toUpperCase()); } })
      .transform(new Response(`<title>catálogo</title><p>x</p>`));
    console.log(await local.text());
    await server.stop(true);

Saída (executado com bun 1.4.0, ao lado de servidor-loja.ts):

    <!doctype html>
    <html><head><title>Catálogo</title></head>
    <body>
      <h1>Loja</h1>
      <ul>
        <li class="produto" data-id="1" data-stock="40">Romance Policial <a href="https://loja.exemplo.pt/api/produtos/1">ver</a> <span class="stock">40 em stock</span></li>
        <li class="produto" data-id="2" data-stock="25">Livro de Receitas <a href="https://loja.exemplo.pt/api/produtos/2">ver</a> <span class="stock">25 em stock</span></li>
        <li class="produto" data-id="3" data-stock="10">Atlas Mundial <a href="https://loja.exemplo.pt/api/produtos/3">ver</a> <span class="stock">10 em stock</span></li>
      </ul>


    </body></html>

    script: false | comentário: false | links absolutos: 3
    nomes: [ "Romance Policial", "Livro de Receitas", "Atlas Mundial" ]
    <title>CATÁLOGO</title><p>x</p>

Com uma Response na entrada, o handler async do li.produto pode esperar pelo fetch: com string daria TypeError. Os handlers correm um de cada vez, em ordem do documento. O text() de li.produto recebe também o texto dos filhos (link e selo), por isso a extração só guarda o primeiro bloco de texto de cada li, assinalado por lastInTextNode.

## Módulo 05 · Bases de dados

### Exercício 17

Ficheiro relatorio.ts (o loja.sql copiado para a mesma pasta):

    import { Database } from "bun:sqlite";
    import { join } from "node:path";

    const db = new Database(":memory:");
    db.exec(await Bun.file(join(import.meta.dir, "loja.sql")).text());

    const relatorio = db.query(`
        SELECT c.nome,
               count(DISTINCT e.id) AS encomendas,
               sum(CAST(round(l.quantidade * l.preco_unitario * 100) AS INTEGER)) AS centimos
        FROM clientes c
        JOIN encomendas e ON e.cliente_id = c.id AND e.estado <> $excluir
        JOIN linhas_encomenda l ON l.encomenda_id = e.id
        GROUP BY c.id
        ORDER BY centimos DESC, c.nome`);

    for (const l of relatorio.all({ $excluir: "cancelada" }) as any[]) {
        console.log(l.nome.padEnd(14), String(l.encomendas).padStart(2), (l.centimos / 100).toFixed(2).padStart(8));
    }
    console.log("sem prefixo:", relatorio.all({ excluir: "cancelada" }).length, "linhas");
    try {
        db.query("SELECT * FROM clientess").all();
    } catch (e: any) {
        console.log(e.name, e.code, e.errno, e.message);
    }

Saída real (bun run ex17.ts):

    Bruno Costa     3   296.69
    Diogo Pires     2   192.50
    Ana Ribeiro     3   185.00
    Carla Mendes    1   158.90
    Eva Martins     1    47.50
    Filipe Lopes    1    35.00
    sem prefixo: 0 linhas
    SQLiteError SQLITE_ERROR 1 no such table: clientess

O parâmetro nomeado leva o prefixo na chave ($excluir): sem ele o parâmetro fica NULL e o relatório vem vazio, sem erro. O dinheiro soma-se em cêntimos inteiros e só se divide por 100 à saída.

### Exercício 18

Ficheiro encomendar.ts:

    import { Database } from "bun:sqlite";
    import { join } from "node:path";

    const db = new Database(":memory:");
    db.exec(await Bun.file(join(import.meta.dir, "loja.sql")).text());
    db.run("PRAGMA foreign_keys = ON");

    const nova = db.prepare("INSERT INTO encomendas (cliente_id, data_encomenda, estado) VALUES ($c, '2025-06-15', 'pendente')");
    const produto = db.prepare("SELECT preco, stock FROM produtos WHERE id = $id");
    const abate = db.prepare("UPDATE produtos SET stock = stock - $qtd WHERE id = $id AND stock >= $qtd");
    const linha = db.prepare("INSERT INTO linhas_encomenda (encomenda_id, produto_id, quantidade, preco_unitario) VALUES ($e, $p, $q, $preco)");

    const encomendar = db.transaction((clienteId: number, itens: { produto: number; qtd: number }[]) => {
        const enc = Number(nova.run({ $c: clienteId }).lastInsertRowid);
        let centimos = 0;
        for (const it of itens) {
            const p = produto.get({ $id: it.produto }) as { preco: number; stock: number } | null;
            if (!p) throw new Error(`produto ${it.produto} não existe`);
            if (abate.run({ $id: it.produto, $qtd: it.qtd }).changes === 0) throw new Error(`stock insuficiente do produto ${it.produto} (há ${p.stock}, pedidos ${it.qtd})`);
            linha.run({ $e: enc, $p: it.produto, $q: it.qtd, $preco: p.preco });
            centimos += Math.round(p.preco * 100) * it.qtd;
        }
        return { encomenda: enc, total: centimos / 100 };
    });

    const estado = () => JSON.stringify(db.query("SELECT (SELECT count(*) FROM encomendas) AS encomendas, (SELECT count(*) FROM linhas_encomenda) AS linhas, (SELECT stock FROM produtos WHERE id = 5) AS stock5, (SELECT stock FROM produtos WHERE id = 6) AS stock6").get());
    console.log("inicial :", estado());
    console.log("ok      :", JSON.stringify(encomendar(1, [{ produto: 5, qtd: 2 }, { produto: 10, qtd: 3 }])), estado());
    for (const [nome, args] of [
        ["sem stock", [2, [{ produto: 5, qtd: 1 }, { produto: 6, qtd: 1 }]]],
        ["cliente 99", [99, [{ produto: 5, qtd: 1 }]]],
    ] as const) {
        try {
            encomendar(...(args as [number, { produto: number; qtd: number }[]]));
        } catch (e: any) {
            console.log(`${nome}:`.padEnd(11), e.code ?? "", e.message, "|", estado());
        }
    }

Saída real (bun run ex18.ts):

    inicial : {"encomendas":12,"linhas":26,"stock5":100,"stock6":0}
    ok      : {"encomenda":13,"total":49.3} {"encomendas":13,"linhas":28,"stock5":98,"stock6":0}
    sem stock:   stock insuficiente do produto 6 (há 0, pedidos 1) | {"encomendas":13,"linhas":28,"stock5":98,"stock6":0}
    cliente 99: SQLITE_CONSTRAINT_FOREIGNKEY FOREIGN KEY constraint failed | {"encomendas":13,"linhas":28,"stock5":98,"stock6":0}

A transação cria a encomenda, abate o stock e escreve as linhas. Se um passo lança um erro (stock insuficiente ou cliente inexistente; este só dá SQLITE_CONSTRAINT_FOREIGNKEY porque as chaves estrangeiras vêm desligadas por omissão e o PRAGMA as liga), o ROLLBACK desfaz tudo: o estado depois do erro é igual ao anterior (13 encomendas, 28 linhas, stock 98 do produto 5).

### Exercício 19

Ficheiro faturacao.ts (o mesmo ficheiro nos três motores; a palavra-passe fictícia vem da variável BN05_PW e os contentores est-bn05-pg e est-bn05-mysql têm de estar a correr):

    import { SQL } from "bun";
    import { join } from "node:path";

    const motor = process.argv[2] ?? "sqlite";
    const pw = encodeURIComponent(process.env.BN05_PW ?? "");
    const db =
        motor === "postgres" ? new SQL(`postgres://postgres:${pw}@127.0.0.1:35051/loja`)
        : motor === "mysql" ? new SQL(`mysql://root:${pw}@127.0.0.1:35052/loja`, { allowPublicKeyRetrieval: true })
        : new SQL(":memory:");
    for (const t of ["linhas_encomenda", "encomendas", "produtos", "clientes", "categorias"]) await db.unsafe(`DROP TABLE IF EXISTS ${t}`);
    await db.file(join(import.meta.dir, "loja.sql"));

    const estado = "cancelada";
    const bruto = await db`
        SELECT c.nome AS categoria, count(DISTINCT e.id) AS encomendas, sum(l.quantidade) AS unidades,
               sum(l.quantidade * l.preco_unitario) AS faturado
        FROM categorias c
        JOIN produtos p ON p.categoria_id = c.id
        JOIN linhas_encomenda l ON l.produto_id = p.id
        JOIN encomendas e ON e.id = l.encomenda_id AND e.estado <> ${estado}
        GROUP BY c.id, c.nome
        ORDER BY c.id`;

    const normalizado = bruto.map((l: any) => ({
        categoria: l.categoria,
        encomendas: Number(l.encomendas),
        unidades: Number(l.unidades),
        faturado: Math.round(Number(l.faturado) * 100) / 100,
    }));
    console.log(motor.padEnd(8), "tipos:", Object.entries(bruto[0]).map(([k, v]) => `${k}=${typeof v}`).join(" "));
    console.log(motor.padEnd(8), "valor bruto faturado:", JSON.stringify(bruto.map((l: any) => l.faturado)));
    console.log(motor.padEnd(8), "normalizado:", JSON.stringify(normalizado));
    console.log(motor.padEnd(8), "hash:", Bun.hash(JSON.stringify(normalizado)).toString(16));
    for (const t of ["linhas_encomenda", "encomendas", "produtos", "clientes", "categorias"]) await db.unsafe(`DROP TABLE IF EXISTS ${t}`);
    await db.close();

Saída real (bun run ex19.ts sqlite, depois postgres e mysql):

    sqlite   tipos: categoria=string encomendas=number unidades=number faturado=number
    sqlite   valor bruto faturado: [175.79,382.9,356.9]
    sqlite   normalizado: [{"categoria":"Livros","encomendas":5,"unidades":11,"faturado":175.79},{"categoria":"Eletrónica","encomendas":6,"unidades":12,"faturado":382.9},{"categoria":"Casa","encomendas":7,"unidades":22,"faturado":356.9}]
    sqlite   hash: f926293a27b6e0bf
    postgres tipos: categoria=string encomendas=string unidades=string faturado=string
    postgres valor bruto faturado: ["175.79","382.90","356.90"]
    postgres normalizado: [{"categoria":"Livros","encomendas":5,"unidades":11,"faturado":175.79},{"categoria":"Eletrónica","encomendas":6,"unidades":12,"faturado":382.9},{"categoria":"Casa","encomendas":7,"unidades":22,"faturado":356.9}]
    postgres hash: f926293a27b6e0bf
    mysql    tipos: categoria=string encomendas=number unidades=string faturado=string
    mysql    valor bruto faturado: ["175.79","382.90","356.90"]
    mysql    normalizado: [{"categoria":"Livros","encomendas":5,"unidades":11,"faturado":175.79},{"categoria":"Eletrónica","encomendas":6,"unidades":12,"faturado":382.9},{"categoria":"Casa","encomendas":7,"unidades":22,"faturado":356.9}]
    mysql    hash: f926293a27b6e0bf

Os tipos em bruto diferem (number no SQLite; string no PostgreSQL; no MySQL encomendas é number e as somas são string), e o valor bruto do PostgreSQL traz zeros finais ("382.90"). Depois da normalização com Number e arredondamento, os três dão o mesmo JSON e o mesmo hash (f926293a27b6e0bf). Sem allowPublicKeyRetrieval: true, a ligação ao MySQL 8.4 falhou com MySQLError ERR_MYSQL_PUBLIC_KEY_RETRIEVAL_NOT_ALLOWED (The server requested RSA public key retrieval to complete authentication, which is not allowed over an insecure connection); a alternativa é tls: "require".

### Exercício 20

Ficheiro encomendas-api.ts (porta 35053; o servidor pára no fim com servidor.stop):

    import { SQL } from "bun";
    import { join } from "node:path";

    const motor = process.argv[2] ?? "sqlite";
    const pw = encodeURIComponent(process.env.BN05_PW ?? "");
    const db =
        motor === "postgres" ? new SQL(`postgres://postgres:${pw}@127.0.0.1:35051/loja`)
        : motor === "mysql" ? new SQL(`mysql://root:${pw}@127.0.0.1:35052/loja`, { allowPublicKeyRetrieval: true })
        : new SQL(":memory:");
    for (const t of ["linhas_encomenda", "encomendas", "produtos", "clientes", "categorias"]) await db.unsafe(`DROP TABLE IF EXISTS ${t}`);
    await db.file(join(import.meta.dir, "loja.sql"));

    const ESTADOS = ["pendente", "enviada", "entregue", "cancelada"];
    const ORDENAVEIS = ["id", "data_encomenda", "cliente_id"];
    const Encomenda = {
        type: "object", required: ["id", "cliente_id", "data_encomenda", "estado"],
        properties: { id: "integer", cliente_id: "integer", data_encomenda: "string", estado: "string" },
    } as const;

    function conforme(linhas: any[]): string[] {
        return linhas.flatMap((l, i) => Encomenda.required.flatMap(c => {
            if (!(c in l)) return [`$[${i}].${c}: em falta`];
            const t = Encomenda.properties[c as keyof typeof Encomenda.properties];
            const ok = t === "integer" ? Number.isInteger(l[c]) : typeof l[c] === "string";
            return ok ? [] : [`$[${i}].${c}: devia ser ${t}, veio ${typeof l[c]}`];
        }));
    }

    const servidor = Bun.serve({
        port: 35053,
        hostname: "127.0.0.1",
        routes: {
            "/encomendas": async req => {
                const q = new URL(req.url).searchParams;
                const estado = q.get("estado");
                const ordem = q.get("ordem") ?? "id";
                const cliente = q.get("cliente");
                if (estado !== null && !ESTADOS.includes(estado)) return Response.json({ erro: `estado: um de ${ESTADOS.join(", ")}` }, { status: 400 });
                if (!ORDENAVEIS.includes(ordem)) return Response.json({ erro: `ordem: uma de ${ORDENAVEIS.join(", ")}` }, { status: 400 });
                if (cliente !== null && !(Number.isInteger(Number(cliente)) && Number(cliente) >= 1)) return Response.json({ erro: "cliente: inteiro >= 1" }, { status: 400 });
                const cond = [db`1 = 1`];
                if (estado !== null) cond.push(db`estado = ${estado}`);
                if (cliente !== null) cond.push(db`cliente_id = ${Number(cliente)}`);
                const onde = cond.reduce((a, c) => db`${a} AND ${c}`);
                const linhas = await db`SELECT id, cliente_id, data_encomenda, estado FROM encomendas WHERE ${onde} ORDER BY ${db(ordem)} DESC`;
                const normal = linhas.map((l: any) => ({ ...l, data_encomenda: l.data_encomenda instanceof Date ? l.data_encomenda.toISOString().slice(0, 10) : l.data_encomenda }));
                return Response.json(normal);
            },
        },
    });
    const base = `http://127.0.0.1:${servidor.port}/encomendas`;
    const casos = [
        "?estado=pendente",
        "?estado=entregue&cliente=1&ordem=data_encomenda",
        "?estado=" + encodeURIComponent("x' OR '1'='1"),
        "?ordem=" + encodeURIComponent("id; DROP TABLE encomendas"),
        "?cliente=0",
    ];
    for (const c of casos) {
        const r = await fetch(base + c);
        const corpo: any = await r.json();
        console.log(motor.padEnd(8), r.status, decodeURIComponent(c).padEnd(55), Array.isArray(corpo) ? `${corpo.length} linhas, ids ${corpo.map((l: any) => l.id).join(",")}, erros esquema ${conforme(corpo).length}` : JSON.stringify(corpo));
    }
    console.log(motor.padEnd(8), "encomendas na base depois dos testes:", JSON.stringify(await db`SELECT count(*) AS n FROM encomendas`));
    await servidor.stop(true);
    for (const t of ["linhas_encomenda", "encomendas", "produtos", "clientes", "categorias"]) await db.unsafe(`DROP TABLE IF EXISTS ${t}`);
    await db.close();

Saída real (bun run ex20.ts sqlite, depois postgres):

    sqlite   200 ?estado=pendente                                        3 linhas, ids 12,9,8, erros esquema 0
    sqlite   200 ?estado=entregue&cliente=1&ordem=data_encomenda         2 linhas, ids 3,1, erros esquema 0
    sqlite   400 ?estado=x' OR '1'='1                                    {"erro":"estado: um de pendente, enviada, entregue, cancelada"}
    sqlite   400 ?ordem=id; DROP TABLE encomendas                        {"erro":"ordem: uma de id, data_encomenda, cliente_id"}
    sqlite   400 ?cliente=0                                              {"erro":"cliente: inteiro >= 1"}
    sqlite   encomendas na base depois dos testes: [{"n":12}]
    postgres 200 ?estado=pendente                                        3 linhas, ids 12,9,8, erros esquema 0
    postgres 200 ?estado=entregue&cliente=1&ordem=data_encomenda         2 linhas, ids 3,1, erros esquema 0
    postgres 400 ?estado=x' OR '1'='1                                    {"erro":"estado: um de pendente, enviada, entregue, cancelada"}
    postgres 400 ?ordem=id; DROP TABLE encomendas                        {"erro":"ordem: uma de id, data_encomenda, cliente_id"}
    postgres 400 ?cliente=0                                              {"erro":"cliente: inteiro >= 1"}
    postgres encomendas na base depois dos testes: [{"n":"12"}]

A lista de estados e a lista de colunas ordenáveis recusam a entrada com 400 antes de chegar à base. Parte B: com a validação do estado desligada (testei com uma variável de ambiente temporária) o estado x' OR '1'='1 devolveu 200 com 0 linhas no SQLite e no PostgreSQL, porque vai como parâmetro. O ORDER BY não tem essa proteção: sql(coluna) só cita o nome, por isso a lista de colunas é obrigatória. No PostgreSQL a contagem final aparece como string ("12").

## Módulo 06 · Redis e S3

### Exercício 21

    import { redis } from "bun";
    import { abrirLoja } from "./loja-db.ts";

    // Limitador de janela fixa: incr + pexpire quando o contador é 1
    async function limitar(ip: string, limite: number, janelaMs: number) {
      const chave = `est:limite:${ip}`;
      const n = await redis.incr(chave);
      if (n === 1) await redis.pexpire(chave, janelaMs);
      return { permitido: n <= limite, restante: Math.max(0, limite - n) };
    }

    console.log("--- 8 pedidos do mesmo IP (limite 5 por 400 ms) ---");
    for (let i = 1; i <= 8; i++) {
      const r = await limitar("10.0.0.1", 5, 400);
      console.log(`pedido ${i}:`, r.permitido ? "permitido" : "NEGADO", "| restante", r.restante);
    }
    console.log("outro IP:", await limitar("10.0.0.2", 5, 400));
    console.log("pttl do contador:", await redis.pttl("est:limite:10.0.0.1"), "ms");
    await Bun.sleep(450);
    console.log("passada a janela:", await limitar("10.0.0.1", 5, 400));

    console.log("--- ranking de visitas ---");
    const db = await abrirLoja();
    const nomes = db.query("SELECT id, nome FROM produtos").all() as { id: number; nome: string }[];
    await redis.hset("est:nomes", Object.fromEntries(nomes.map(p => [String(p.id), p.nome])));
    for (const id of [3, 3, 5, 3, 10, 5, 5, 5]) await redis.zincrby("est:visitas", 1, String(id));
    const top = (await redis.zrevrange("est:visitas", 0, 2, "WITHSCORES")) as [string, number][];
    for (const [id, visitas] of top) console.log(`${visitas} visitas: ${await redis.hget("est:nomes", id)}`);

    await redis.del("est:limite:10.0.0.1", "est:limite:10.0.0.2", "est:nomes", "est:visitas");
    redis.close();
    db.close();

Saída (executado com bun 1.4.0, Redis 8.10.3 e RustFS 1.0.6 em contentores):

    --- 8 pedidos do mesmo IP (limite 5 por 400 ms) ---
    pedido 1: permitido | restante 4
    pedido 2: permitido | restante 3
    pedido 3: permitido | restante 2
    pedido 4: permitido | restante 1
    pedido 5: permitido | restante 0
    pedido 6: NEGADO | restante 0
    pedido 7: NEGADO | restante 0
    pedido 8: NEGADO | restante 0
    outro IP: {
      permitido: true,
      restante: 4,
    }
    pttl do contador: 391 ms
    passada a janela: {
      permitido: true,
      restante: 4,
    }
    --- ranking de visitas ---
    4 visitas: Carregador USB-C
    3 visitas: Atlas Mundial
    1 visitas: Caneca de Cerâmica

O INCR é atómico, por isso mesmo com pedidos em paralelo cada um recebe um número diferente; o PEXPIRE só é chamado quando o contador vale 1, para a janela contar a partir do primeiro pedido. Há uma pequena falha: se o processo morrer entre o INCR e o PEXPIRE, a chave fica sem expiração (a 1.ª linha de defesa é um script Lua ou SET NX PX antes do INCR). O zrevrange com WITHSCORES devolve pares [membro, pontuação].

### Exercício 22

    import { redis } from "bun";

    // Duas ligações subscritoras do canal loja:stock
    const alertas: string[] = [];
    const subA = await redis.duplicate();
    const subB = await redis.duplicate();
    await subA.subscribe("loja:stock", (m) => alertas.push(`A recebeu ${m}`));
    await subB.subscribe("loja:stock", (m) => alertas.push(`B recebeu ${m}`));

    await redis.hset("est:stock", { "3": 6 }); // Atlas Mundial: 6 unidades

    // Reserva com WATCH + MULTI/EXEC numa ligação própria; repete se o stock mudou entre o HGET e o EXEC
    async function reservar(produtoId: number, qtd: number): Promise<"ok" | "sem-stock"> {
      const tx = await redis.duplicate();
      try {
        while (true) {
          await tx.send("WATCH", ["est:stock"]);
          const atual = Number(await tx.hget("est:stock", String(produtoId)));
          if (atual < qtd) {
            await tx.send("UNWATCH", []);
            return "sem-stock";
          }
          await tx.send("MULTI", []);
          await tx.send("HINCRBY", ["est:stock", String(produtoId), String(-qtd)]);
          await tx.send("RPUSH", ["est:reservas", JSON.stringify({ produtoId, qtd })]);
          const resultado = await tx.send("EXEC", []); // null se alguém alterou a chave vigiada
          if (resultado !== null) {
            const restante = resultado[0] as number;
            if (restante <= 3) await redis.publish("loja:stock", JSON.stringify({ produtoId, restante }));
            return "ok";
          }
        }
      } finally {
        tx.close();
      }
    }

    const resultados = await Promise.all(Array.from({ length: 10 }, () => reservar(3, 1)));
    console.log("resultados:", resultados.filter(r => r === "ok").length, "ok,", resultados.filter(r => r === "sem-stock").length, "sem stock");
    console.log("stock final:", await redis.hget("est:stock", "3"), "| reservas registadas:", await redis.llen("est:reservas"));
    await Bun.sleep(100);
    console.log("alertas:", alertas.sort());

    await subB.unsubscribe("loja:stock");
    console.log("publish depois de B sair chegou a:", await redis.publish("loja:stock", "extra"), "subscritor");
    try { await subA.get("est:stock"); } catch (e: any) { console.log("erro no subscritor:", e.code); }

    await redis.del("est:stock", "est:reservas");
    await subA.unsubscribe("loja:stock"); // sem isto o processo não termina (1.4.0)
    subA.close(); subB.close(); redis.close();

Saída (executado com bun 1.4.0, Redis 8.10.3 e RustFS 1.0.6 em contentores):

    resultados: 6 ok, 4 sem stock
    stock final: 0 | reservas registadas: 6
    alertas: [ "A recebeu {\"produtoId\":3,\"restante\":0}", "A recebeu {\"produtoId\":3,\"restante\":1}",
      "A recebeu {\"produtoId\":3,\"restante\":2}", "A recebeu {\"produtoId\":3,\"restante\":3}",
      "B recebeu {\"produtoId\":3,\"restante\":0}", "B recebeu {\"produtoId\":3,\"restante\":1}",
      "B recebeu {\"produtoId\":3,\"restante\":2}", "B recebeu {\"produtoId\":3,\"restante\":3}"
    ]
    publish depois de B sair chegou a: 1 subscritor
    erro no subscritor: ERR_REDIS_INVALID_STATE

O WATCH vigia a chave: se outra ligação a alterar entre o HGET e o EXEC, o EXEC devolve null e a reserva repete-se, por isso 10 pedidos concorrentes dão exatamente 6 reservas, sem stock negativo. Cada transação tem a sua ligação (duplicate), senão os comandos de outros pedidos entrariam no MULTI. Os dois subscritores recebem os mesmos alertas, e o publish depois de B sair chegou só a 1. Sem o unsubscribe final o processo não terminava na 1.4.0.

### Exercício 23

    import { s3 } from "bun";
    import { abrirLoja } from "./loja-db.ts";

    const db = await abrirLoja();
    const encomendas = db.query("SELECT id, cliente_id, data_encomenda, estado FROM encomendas ORDER BY id").all() as any[];
    const total = db.query("SELECT ROUND(SUM(quantidade * preco_unitario), 2) AS t FROM linhas_encomenda WHERE encomenda_id = ?");
    const completas = encomendas.map(e => ({ ...e, total: (total.get(e.id) as any).t }));

    // 1. Guardar uma encomenda por objeto, em paralelo
    await Promise.all(completas.map(e => s3.write(`encomendas/2025/${String(e.id).padStart(3, "0")}.json`, JSON.stringify(e), { type: "application/json" })));
    await s3.write("encomendas/indice.txt", "indice");

    // 2. Listar em páginas de 5 com startAfter
    const chaves: string[] = [];
    let paginas = 0;
    let depoisDe: string | undefined;
    while (true) {
      const pag = await s3.list({ prefix: "encomendas/2025/", maxKeys: 5, startAfter: depoisDe });
      paginas++;
      chaves.push(...(pag.contents ?? []).map(o => o.key));
      if (!pag.isTruncated) break;
      depoisDe = pag.contents!.at(-1)!.key;
    }
    console.log(`${chaves.length} objetos em ${paginas} páginas; primeira ${chaves[0]}, última ${chaves.at(-1)}`);

    // 3. Ler tudo em paralelo e somar o que não foi cancelado
    const lidas = await Promise.all(chaves.map(k => s3.file(k).json()));
    const faturado = lidas.filter(e => e.estado !== "cancelada").reduce((soma, e) => soma + Math.round(e.total * 100), 0) / 100;
    console.log("faturado (sem canceladas):", faturado.toFixed(2), "| canceladas:", lidas.filter(e => e.estado === "cancelada").map(e => e.id));

    // 4. Pastas, stat e presign
    const nivel = await s3.list({ prefix: "encomendas/", delimiter: "/" });
    console.log("ficheiros:", nivel.contents?.map(o => o.key), "| pastas:", nivel.commonPrefixes?.map(p => p.prefix));
    const st = await s3.file(chaves[3]).stat();
    console.log("stat da 4.ª:", st.size, "bytes,", st.type);
    const url = s3.presign(chaves[3], { expiresIn: 30 });
    console.log("lido pelo URL pré-assinado:", (await (await fetch(url)).json()).id);

    // 5. Erro de chave inexistente
    try { await s3.file("encomendas/2025/999.json").json(); } catch (e: any) { console.log(e.name, e.code); }

    // 6. Limpar
    await Promise.all([...chaves, "encomendas/indice.txt"].map(k => s3.delete(k)));
    console.log("objetos que sobram:", (await s3.list({ prefix: "encomendas/" })).keyCount);
    db.close();

Saída (executado com bun 1.4.0, Redis 8.10.3 e RustFS 1.0.6 em contentores):

    12 objetos em 3 páginas; primeira encomendas/2025/001.json, última encomendas/2025/012.json
    faturado (sem canceladas): 915.59 | canceladas: [ 4 ]
    ficheiros: [ "encomendas/indice.txt" ] | pastas: [ "encomendas/2025/" ]
    stat da 4.ª: 87 bytes, application/json;charset=utf-8
    lido pelo URL pré-assinado: 4
    S3Error NoSuchKey
    objetos que sobram: 0

Cada página termina na última chave recebida, usada como startAfter da seguinte (12 chaves, páginas de 5, 5 e 2). A soma faz-se em cêntimos inteiros para evitar erros de vírgula flutuante. A pasta aparece em commonPrefixes porque o S3 só tem chaves com barras, e uma chave inexistente dá S3Error com code NoSuchKey.

### Exercício 24

    import { s3, redis } from "bun";

    const chave = "relatorios/movimentos.csv";

    // 1. Gerar ~6 MB de CSV em streaming com o writer (partes de 5 MB)
    const w = s3.file(chave).writer({ type: "text/csv", partSize: 5 * 1024 * 1024 });
    let bytes = 0;
    const cabecalho = "linha,produto_id,quantidade\n";
    w.write(cabecalho);
    bytes += cabecalho.length;
    for (let i = 1; i <= 700_000; i++) {
      const l = `${i},${(i % 10) + 1},${(i % 4) + 1}\n`;
      w.write(l);
      bytes += l.length;
      if (i % 70_000 === 0) await w.flush();
    }
    await w.end();
    const st = await s3.file(chave).stat();
    console.log("escritos:", bytes, "| no S3:", st.size, "| etag:", st.etag, "| tipo:", st.type);

    // 2. Servidor: o URL pré-assinado dura 3 s, e fica em cache no Redis só 2 s
    let assinados = 0;
    const servidor = Bun.serve({
      port: 35062,
      hostname: "127.0.0.1",
      routes: {
        "/api/movimentos/ligacao": async () => {
          let url = await redis.get("est:url:movimentos");
          const origem = url ? "cache" : "novo";
          if (!url) {
            assinados++;
            url = s3.presign(chave, { expiresIn: 3 });
            await redis.set("est:url:movimentos", url, "EX", 2);
          }
          return Response.json({ url, origem });
        },
      },
    });
    const pedir = async () => (await (await fetch(`http://127.0.0.1:${servidor.port}/api/movimentos/ligacao`)).json()) as { url: string; origem: string };

    const a = await pedir(), b = await pedir();
    console.log("pedido 1:", a.origem, "| pedido 2:", b.origem, "| URL igual:", a.url === b.url, "| assinaturas:", assinados);

    // 3. Usar o URL: HEAD para o tamanho e Range para os primeiros bytes
    const head = await fetch(a.url, { method: "HEAD" }); // o método faz parte da assinatura: o URL é só para GET
    console.log("HEAD com URL de GET:", head.status);
    const parte = await fetch(a.url, { headers: { range: "bytes=0-27" } });
    console.log("Range:", parte.status, JSON.stringify(await parte.text()), parte.headers.get("content-range"));

    // 4. Esperar que a cache expire (2 s) e depois o URL (3 s)
    await Bun.sleep(2200);
    const c = await pedir();
    console.log("depois de 2,2 s:", c.origem, "| URL novo:", c.url !== a.url, "| assinaturas:", assinados);
    await Bun.sleep(1000);
    const estado = async (url: string) => (await fetch(url, { headers: { range: "bytes=0-0" } })).status;
    console.log("URL antigo passados 3,2 s:", await estado(a.url), "| URL novo:", await estado(c.url));

    servidor.stop(true);
    await s3.delete(chave);
    await redis.del("est:url:movimentos");
    redis.close();

Saída (executado com bun 1.4.0, Redis 8.10.3 e RustFS 1.0.6 em contentores):

    escritos: 7658923 | no S3: 7658923 | etag: "25dbe8dba5c8307820ed95dcc4c59513-2" | tipo: text/csv
    pedido 1: novo | pedido 2: cache | URL igual: true | assinaturas: 1
    HEAD com URL de GET: 403
    Range: 206 "linha,produto_id,quantidade\n" bytes 0-27/7658923
    depois de 2,2 s: novo | URL novo: true | assinaturas: 2
    URL antigo passados 3,2 s: 403 | URL novo: 206

O writer envia a 1.ª parte de 5 MB assim que a enche e a última no end(): o etag termina em -2 (duas partes). O URL fica em cache 2 s mas é válido 3 s, por isso quem o recebe da cache ainda tem pelo menos 1 s de uso. O HEAD falha com 403 porque o método faz parte da assinatura; para espreitar o tamanho usa um GET com Range (o Content-Range traz o total).

## Módulo 07 · Segurança e utilitários

### Exercício 25

Ficheiro ex25.ts:

    // Exercício 25: custos e migração de palavras-passe
    const palavra = "Estudo_2026!";
    const configs = [
      { nome: "bcrypt 4", o: { algorithm: "bcrypt", cost: 4 } },
      { nome: "bcrypt 8", o: { algorithm: "bcrypt", cost: 8 } },
      { nome: "bcrypt 10", o: { algorithm: "bcrypt", cost: 10 } },
      { nome: "argon2id 19456/2", o: { algorithm: "argon2id", memoryCost: 19456, timeCost: 2 } },
      { nome: "argon2id 65536/2", o: { algorithm: "argon2id", memoryCost: 65536, timeCost: 2 } },
    ] as const;
    const linhas: { config: string; hash_ms: string; verify_ms: string }[] = [];
    for (const { nome, o } of configs) {
      const h = await Bun.password.hash(palavra, o);
      let hMin = Infinity, vMin = Infinity;
      for (let i = 0; i < 5; i++) {
        let t = Bun.nanoseconds(); await Bun.password.hash(palavra, o); hMin = Math.min(hMin, (Bun.nanoseconds() - t) / 1e6);
        t = Bun.nanoseconds(); await Bun.password.verify(palavra, h); vMin = Math.min(vMin, (Bun.nanoseconds() - t) / 1e6);
      }
      linhas.push({ config: nome, hash_ms: hMin.toFixed(1), verify_ms: vMin.toFixed(1) });
    }
    console.log(Bun.inspect.table(linhas));

    // Escolher o custo: o argon2id mais lento abaixo de 250 ms
    const alvo = 250;
    const escolhida = [...linhas].reverse().find((l) => Number(l.verify_ms) < alvo);
    console.log("escolhida para ~250 ms:", escolhida?.config);

    // Migração: base de clientes com hashes bcrypt de custo 4
    const base = new Map<string, string>();
    for (const email of ["ana@exemplo.pt", "bruno@exemplo.pt"]) base.set(email, await Bun.password.hash("Estudo_2026!", { algorithm: "bcrypt", cost: 4 }));
    const ALVO = { algorithm: "argon2id", memoryCost: 19456, timeCost: 2 } as const;
    async function login(email: string, pw: string) {
      const hash = base.get(email);
      if (!hash || !(await Bun.password.verify(pw, hash))) return false;
      if (!hash.startsWith("$argon2id$m=19456,t=2,")) base.set(email, await Bun.password.hash(pw, ALVO));
      return true;
    }
    const antes = [...base].map(([e, h]) => e + " " + h.split("$")[1]);
    console.log("antes     :", antes.join(" | "));
    console.log("login ana :", await login("ana@exemplo.pt", "Estudo_2026!"), "| errada:", await login("bruno@exemplo.pt", "errada"));
    console.log("depois    :", [...base].map(([e, h]) => e + " " + h.split("$")[1]).join(" | "));
    console.log("ana 2.º   :", await login("ana@exemplo.pt", "Estudo_2026!"), base.get("ana@exemplo.pt")!.split("$")[1]);

    bun ex25.ts
    ┌───┬──────────────────┬─────────┬───────────┐
    │   │ config           │ hash_ms │ verify_ms │
    ├───┼──────────────────┼─────────┼───────────┤
    │ 0 │ bcrypt 4         │ 1.2     │ 1.2       │
    │ 1 │ bcrypt 8         │ 17.7    │ 17.9      │
    │ 2 │ bcrypt 10        │ 71.0    │ 70.6      │
    │ 3 │ argon2id 19456/2 │ 34.0    │ 44.6      │
    │ 4 │ argon2id 65536/2 │ 170.3   │ 172.7     │
    └───┴──────────────────┴─────────┴───────────┘

    escolhida para ~250 ms: argon2id 65536/2
    antes     : ana@exemplo.pt 2b | bruno@exemplo.pt 2b
    login ana : true | errada: false
    depois    : ana@exemplo.pt argon2id | bruno@exemplo.pt 2b
    ana 2.º   : true argon2id

O hash e o verify custam o mesmo, e o bcrypt de custo 10 e o argon2id com a configuração por omissão ficam na mesma ordem de grandeza (dezenas a poucas centenas de milissegundos; os valores variam muito com a carga da máquina). A migração aproveita o único momento em que tens a palavra-passe em claro: o login bem-sucedido. Quem nunca volta a entrar fica com o hash antigo (o bruno, que falhou o login, continua em bcrypt).

### Exercício 26

Ficheiro ex26.ts:

    // Exercício 26: o mesmo hash por quatro vias, HMAC e deteção de alterações
    import { createHash, createHmac } from "node:crypto";

    const produtos = [
      { id: 1, nome: "Romance Policial", preco: 12.9, stock: 40 },
      { id: 2, nome: "Livro de Receitas", preco: 18.5, stock: 25 },
      { id: 3, nome: "Atlas Mundial", preco: 29.99, stock: 10 },
    ];
    const texto = JSON.stringify(produtos);
    const bytes = new TextEncoder().encode(texto);
    const hex = (b: ArrayBuffer) => Buffer.from(b).toString("hex");

    const v1 = new Bun.CryptoHasher("sha256").update(texto).digest("hex");
    const v2 = hex(await crypto.subtle.digest("SHA-256", bytes));
    const v3 = createHash("sha256").update(texto).digest("hex");
    const v4 = Bun.SHA256.hash(texto, "hex");
    console.log("CryptoHasher :", v1);
    console.log("subtle       :", v2 === v1, "| node:crypto:", v3 === v1, "| Bun.SHA256:", v4 === v1);

    const chave = "segredo-de-estudo";
    const h1 = new Bun.CryptoHasher("sha256", chave).update(texto).digest("hex");
    const h2 = createHmac("sha256", chave).update(texto).digest("hex");
    const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(chave), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const h3 = hex(await crypto.subtle.sign("HMAC", k, bytes));
    console.log("HMAC igual nas 3 vias:", h1 === h2 && h2 === h3, h1.slice(0, 16) + "...");

    const alterado = texto.replace('"stock":40', '"stock":41');
    const hashAlt = new Bun.CryptoHasher("sha256").update(alterado).digest("hex");
    console.log("1 caractere alterado muda o hash:", hashAlt !== v1, "| caracteres hex iguais na mesma posição:",
      [...v1].filter((c, i) => c === hashAlt[i]).length, "de 64");
    // Sem a chave, quem altera o texto não consegue recalcular o HMAC; com SHA-256 simples consegue
    const hmacAlt = new Bun.CryptoHasher("sha256", chave).update(alterado).digest("hex");
    console.log("o HMAC original ainda serve para o alterado?", h1 === hmacAlt);

    // ETag com hash não criptográfico: serve para cache, não para segurança
    const etag = (o: unknown) => '"' + Bun.hash.xxHash3(JSON.stringify(o)).toString(16) + '"';
    console.log("etag:", etag(produtos), etag(produtos) === etag(structuredClone(produtos)), etag(JSON.parse(alterado)) !== etag(produtos));

    // Velocidade relativa em 20 MB (melhor de 3)
    const grande = new Uint8Array(20_000_000).fill(7);
    const melhor = (f: () => unknown) => { let m = Infinity; for (let i = 0; i < 3; i++) { const t = Bun.nanoseconds(); f(); m = Math.min(m, (Bun.nanoseconds() - t) / 1e6); } return m.toFixed(1) + " ms"; };
    console.log("sha256 20 MB :", melhor(() => new Bun.CryptoHasher("sha256").update(grande).digest("hex")));
    console.log("md5 20 MB    :", melhor(() => new Bun.CryptoHasher("md5").update(grande).digest("hex")));
    console.log("xxHash3 20 MB:", melhor(() => Bun.hash.xxHash3(grande)));
    console.log("crc32 20 MB  :", melhor(() => Bun.hash.crc32(grande)));

    bun ex26.ts
    CryptoHasher : 7c3bd4263e42e5a0e87fbd8358d6f35cbda5f6e74d26a13894a326c38adb50d5
    subtle       : true | node:crypto: true | Bun.SHA256: true
    HMAC igual nas 3 vias: true 5d07c85073c535a5...
    1 caractere alterado muda o hash: true | caracteres hex iguais na mesma posição: 4 de 64
    o HMAC original ainda serve para o alterado? false
    etag: "9fb76d23983794ad" true true
    sha256 20 MB : 18.3 ms
    md5 20 MB    : 30.3 ms
    xxHash3 20 MB: 1.1 ms
    crc32 20 MB  : 1.1 ms

As quatro vias dão o mesmo SHA-256 e o mesmo HMAC. Um só caractere alterado muda o hash quase por completo (só 4 de 64 caracteres coincidiram por acaso), e o HMAC antigo deixa de servir para o texto alterado, ao contrário de um SHA-256 simples, que o atacante recalcularia. O xxHash3 e o crc32 são muito mais rápidos que o sha256 (1 ms contra 15 ms em 20 MB), mas só servem para ETags e deteção de erros.

### Exercício 27

Ficheiro ex27.ts:

    // Exercício 27: token com kid (rotação de chaves), jti revogável e CSRF com sessão
    const enc = new TextEncoder(), dec = new TextDecoder();
    const b64 = (b: Uint8Array) => b.toBase64({ alphabet: "base64url", omitPadding: true });
    const deB64 = (s: string) => Uint8Array.fromBase64(s, { alphabet: "base64url" });

    const chaves = new Map<string, CryptoKey>();
    async function novaChave(kid: string, segredo: string) {
      chaves.set(kid, await crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]));
    }
    await novaChave("k1", "segredo-um-de-estudo");
    await novaChave("k2", "segredo-dois-de-estudo");
    let kidAtual = "k1";
    const revogados = new Set<string>();

    async function emitir(sub: number, ms: number) {
      const cab = b64(enc.encode(JSON.stringify({ kid: kidAtual })));
      const corpo = b64(enc.encode(JSON.stringify({ sub, exp: Date.now() + ms, jti: Bun.randomUUIDv7() })));
      const assin = new Uint8Array(await crypto.subtle.sign("HMAC", chaves.get(kidAtual)!, enc.encode(cab + "." + corpo)));
      return `${cab}.${corpo}.${b64(assin)}`;
    }
    async function verificar(token: string) {
      const partes = token.split(".");
      if (partes.length !== 3) return "formato inválido";
      let kid: string, assin: Uint8Array;
      try { kid = JSON.parse(dec.decode(deB64(partes[0]))).kid; assin = deB64(partes[2]); } catch { return "ilegível"; }
      const chave = chaves.get(kid);
      if (!chave) return `chave ${kid} desconhecida`;
      if (!(await crypto.subtle.verify("HMAC", chave, assin, enc.encode(partes[0] + "." + partes[1])))) return "assinatura inválida";
      const c = JSON.parse(dec.decode(deB64(partes[1])));
      if (Date.now() > c.exp) return "expirado";
      if (revogados.has(c.jti)) return "revogado";
      return "ok sub=" + c.sub + " kid=" + kid;
    }

    const t1 = await emitir(1, 60_000);
    console.log("k1 emitido     :", await verificar(t1));
    kidAtual = "k2"; // rotação: novos tokens usam k2, os antigos continuam a validar até k1 sair
    const t2 = await emitir(2, 60_000);
    console.log("depois da rotação:", await verificar(t1), "|", await verificar(t2));
    chaves.delete("k1"); // k1 retirada
    console.log("k1 retirada    :", await verificar(t1), "|", await verificar(t2));
    const jti = JSON.parse(dec.decode(deB64(t2.split(".")[1]))).jti;
    revogados.add(jti);
    console.log("t2 revogado    :", await verificar(t2));
    const [c, p, s] = (await emitir(3, 60_000)).split(".");
    const falso = b64(enc.encode(JSON.stringify({ sub: 99, exp: Date.now() + 60_000, jti: "x" })));
    console.log("payload trocado:", await verificar(`${c}.${falso}.${s}`));
    const curto = await emitir(4, 50); await Bun.sleep(80);
    console.log("expirado       :", await verificar(curto));

    // CSRF ligado à sessão
    const SEG = "csrf-segredo-de-estudo";
    const csrf = Bun.CSRF.generate(SEG, { sessionId: "sessao-ana", expiresIn: 60_000 });
    console.log("csrf ana/ana   :", Bun.CSRF.verify(csrf, { secret: SEG, sessionId: "sessao-ana" }));
    console.log("csrf ana/bruno :", Bun.CSRF.verify(csrf, { secret: SEG, sessionId: "sessao-bruno" }));
    console.log("csrf sem sessão:", Bun.CSRF.verify(csrf, { secret: SEG }));

    bun ex27.ts
    k1 emitido     : ok sub=1 kid=k1
    depois da rotação: ok sub=1 kid=k1 | ok sub=2 kid=k2
    k1 retirada    : chave k1 desconhecida | ok sub=2 kid=k2
    t2 revogado    : revogado
    payload trocado: assinatura inválida
    expirado       : expirado
    csrf ana/ana   : true
    csrf ana/bruno : false
    csrf sem sessão: false

O kid no cabeçalho diz que chave verificar, e é isso que permite rodar chaves sem invalidar de repente todos os tokens: o t1 continuou válido enquanto a k1 existiu e deixou de o ser quando a retirei. O jti (UUID v7) identifica o token para o revogar, e a assinatura cobre cabeçalho e corpo, por isso trocar o payload dá assinatura inválida. O CSRF com sessionId só valida na sessão para a qual foi emitido.

### Exercício 28

Ficheiro ex28.ts:

    // Exercício 28: exportar a loja em vários formatos, comprimir e comparar
    const categorias = [{ id: 1, nome: "Livros" }, { id: 2, nome: "Eletrónica" }, { id: 3, nome: "Casa" }];
    const produtos = [
      { id: 1, nome: "Romance Policial", categoria_id: 1, preco: 12.9, stock: 40 },
      { id: 2, nome: "Livro de Receitas", categoria_id: 1, preco: 18.5, stock: 25 },
      { id: 3, nome: "Atlas Mundial", categoria_id: 1, preco: 29.99, stock: 10 },
      { id: 4, nome: "Auscultadores Bluetooth", categoria_id: 2, preco: 49.9, stock: 30 },
      { id: 5, nome: "Carregador USB-C", categoria_id: 2, preco: 14.9, stock: 100 },
      { id: 6, nome: "Teclado Mecânico", categoria_id: 2, preco: 79, stock: 0 },
      { id: 7, nome: "Candeeiro de Mesa", categoria_id: 3, preco: 22, stock: 15 },
      { id: 8, nome: "Conjunto de Panelas", categoria_id: 3, preco: 89.9, stock: 8 },
      { id: 9, nome: "Manta de Sofá", categoria_id: 3, preco: 34.5, stock: 20 },
      { id: 10, nome: "Caneca de Cerâmica", categoria_id: 3, preco: 6.5, stock: 200 },
    ];
    // TOML precisa de um objeto na raiz; YAML e JSON aceitam o objeto também
    const loja = { categorias, produtos };
    const formatos: Record<string, string> = {
      json: JSON.stringify(loja),
      "json (indentado)": JSON.stringify(loja, null, 2),
      yaml: Bun.YAML.stringify(loja, null, 2),
      toml: Bun.TOML.stringify(loja),
    };
    const volta: Record<string, unknown> = {
      json: JSON.parse(formatos.json),
      yaml: Bun.YAML.parse(formatos.yaml),
      toml: Bun.TOML.parse(formatos.toml),
    };
    for (const [f, v] of Object.entries(volta)) console.log("ida e volta", f.padEnd(5), Bun.deepEquals(v, loja, true));

    const linhas = Object.entries(formatos).map(([formato, texto]) => {
      const b = new TextEncoder().encode(texto);
      const gz = Bun.gzipSync(b).length, zs = Bun.zstdCompressSync(b).length;
      return { formato, bytes: b.length, gzip: gz, zstd: zs, "gzip %": (100 * gz / b.length).toFixed(0), largura_1_linha: Bun.stringWidth(texto.split("\n")[0]) };
    });
    console.log(Bun.inspect.table(linhas));
    console.log("toml (começo):\n" + formatos.toml.split("\n").slice(0, 7).join("\n"));

    // A tabela de produtos para o terminal: alinha-se sozinha, mesmo com acentos
    console.log(Bun.inspect.table(produtos.filter((p) => p.stock < 20), ["id", "nome", "stock"]));
    // Largura de coluna à mão, com stringWidth, para um relatório em texto
    const larg = Math.max(...produtos.map((p) => Bun.stringWidth(p.nome)));
    for (const p of produtos.slice(0, 3)) console.log(p.nome + " ".repeat(larg - Bun.stringWidth(p.nome)) + " | " + p.preco.toFixed(2).padStart(6));

    bun ex28.ts
    ida e volta json  true
    ida e volta yaml  true
    ida e volta toml  true
    ┌───┬──────────────────┬───────┬──────┬──────┬────────┬─────────────────┐
    │   │ formato          │ bytes │ gzip │ zstd │ gzip % │ largura_1_linha │
    ├───┼──────────────────┼───────┼──────┼──────┼────────┼─────────────────┤
    │ 0 │ json             │ 875   │ 343  │ 365  │ 39     │ 871             │
    │ 1 │ json (indentado) │ 1468  │ 381  │ 408  │ 26     │ 1               │
    │ 2 │ yaml             │ 985   │ 340  │ 353  │ 35     │ 12              │
    │ 3 │ toml             │ 1007  │ 345  │ 363  │ 34     │ 14              │
    └───┴──────────────────┴───────┴──────┴──────┴────────┴─────────────────┘

    toml (começo):
    [[categorias]]
    id = 1
    nome = "Livros"

    [[categorias]]
    id = 2
    nome = "Eletrónica"
    ┌───┬────┬─────────────────────┬───────┐
    │   │ id │ nome                │ stock │
    ├───┼────┼─────────────────────┼───────┤
    │ 0 │ 3  │ Atlas Mundial       │ 10    │
    │ 1 │ 6  │ Teclado Mecânico    │ 0     │
    │ 2 │ 7  │ Candeeiro de Mesa   │ 15    │
    │ 3 │ 8  │ Conjunto de Panelas │ 8     │
    └───┴────┴─────────────────────┴───────┘

    Romance Policial        |  12.90
    Livro de Receitas       |  18.50
    Atlas Mundial           |  29.99

O YAML e o TOML recuperaram os dados exatamente (deepEquals em modo estrito). O JSON indentado é o maior em bruto mas é o que mais ganha com o gzip (26 por cento do tamanho), e depois de comprimidos os quatro ficam em torno de 340 a 410 bytes: com ficheiros tão pequenos o zstd não ganha ao gzip. O TOML exige um objeto na raiz e escreve as listas de objetos como secções [[produtos]]. A largura da primeira linha mostra que o JSON compacto tem uma única linha de 871 colunas.

## Módulo 08 · Testes nativos

### Exercício 29

Ficheiros desconto.ts e desconto.test.ts (numa pasta ex/ ao lado de src/, para o import ../src/calculo.ts funcionar).

    // desconto.ts
    import { arredondar } from "../src/calculo.ts";

    export function totalComDesconto(quantidade: number, preco: number): number {
      if (!Number.isInteger(quantidade) || quantidade < 1) throw new RangeError(`quantidade inválida: ${quantidade}`);
      if (!(preco > 0)) throw new RangeError(`preço inválido: ${preco}`);
      const taxa = quantidade >= 50 ? 0.1 : quantidade >= 10 ? 0.05 : 0;
      return arredondar(quantidade * preco * (1 - taxa));
    }

    // desconto.test.ts
    import { describe, expect, test } from "bun:test";
    import { totalComDesconto } from "./desconto.ts";

    describe("totalComDesconto (caneca de 6.50)", () => {
      test.each([[1, 6.5], [9, 58.5], [10, 61.75], [49, 302.58], [50, 292.5], [200, 1170]])(
        "%d unidades custam %d",
        (quantidade, esperado) => {
          expect(totalComDesconto(quantidade, 6.5)).toBeCloseTo(esperado, 2);
        },
      );

      test.each([[0, 6.5], [1.5, 6.5], [-3, 6.5], [10, 0], [10, -1]])("recusa quantidade %d com preço %d", (q, p) => {
        expect(() => totalComDesconto(q, p)).toThrow(RangeError);
      });

      test("a mensagem diz o que está errado", () => {
        expect(() => totalComDesconto(0, 6.5)).toThrow("quantidade inválida: 0");
      });
    });

Saída real (bun test desconto e bun test --coverage desconto, a partir de exemplos/):

     12 pass
     0 fail
     12 expect() calls
    Ran 12 tests across 1 file. [17.00ms]

    File            | % Funcs | % Lines | Uncovered Line #s
    All files       |   62.50 |   52.78 |
     ex\desconto.ts |  100.00 |  100.00 |
     src\calculo.ts |   25.00 |    5.56 | 1-17

O desconto.ts fica com 100 por cento; o src/calculo.ts aparece com pouco porque este teste só usa o arredondar. Usei toBeCloseTo porque os valores passam por multiplicações em vírgula flutuante (49 vezes 6.50 vezes 0.95 dá 302.575, que arredonda para 302.58): a tolerância de duas casas evita que o teste dependa do último bit. Num dinheiro já arredondado, toBe também serve.

### Exercício 30

    // avisar.ts
    import { estaAtrasada, type EstadoEncomenda } from "../src/prazos.ts";

    export type EncomendaResumo = { id: number; cliente_id: number; data_encomenda: string; estado: EstadoEncomenda };
    export type Enviar = (cliente_id: number, texto: string) => Promise<void>;

    function comLimite<T>(p: Promise<T>, ms: number): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error(`sem resposta em ${ms} ms`)), ms);
        p.then(resolve, reject).finally(() => clearTimeout(t));
      });
    }

    export async function avisarAtrasadas(encomendas: EncomendaResumo[], enviar: Enviar) {
      const enviados: number[] = [];
      const falhados: number[] = [];
      for (const e of encomendas.filter((e) => estaAtrasada(e.data_encomenda, e.estado))) {
        try {
          await comLimite(enviar(e.cliente_id, `A encomenda ${e.id} está atrasada.`), 1000);
          enviados.push(e.id);
        } catch {
          falhados.push(e.id);
        }
      }
      return { enviados, falhados };
    }

Os testes (avisar.test.ts):

    afterEach(() => { setSystemTime(); jest.useRealTimers(); });

    test("a 5 de junho só a 8 e a 9 estão atrasadas", async () => {
      setSystemTime(new Date("2025-06-05T12:00:00Z"));
      const enviar = mock(async (_c: number, _t: string) => {});
      expect(await avisarAtrasadas(encomendas, enviar)).toEqual({ enviados: [8, 9], falhados: [] });
      expect(enviar).toHaveBeenNthCalledWith(1, 1, "A encomenda 8 está atrasada.");
      expect(enviar).toHaveBeenNthCalledWith(2, 6, "A encomenda 9 está atrasada.");
    });

    test("uma falha não impede os avisos seguintes", async () => {
      setSystemTime(new Date("2025-06-20T12:00:00Z"));
      const enviar = mock(async (_c: number, _t: string) => {}).mockRejectedValueOnce(new Error("sem rede"));
      expect(await avisarAtrasadas(encomendas, enviar)).toEqual({ enviados: [9, 12], falhados: [8] });
    });

    test("um envio que nunca responde falha ao fim de 1000 ms simulados", async () => {
      jest.useFakeTimers();
      setSystemTime(new Date("2025-06-05T12:00:00Z"));
      const enviar = mock(() => new Promise<void>(() => {}));
      const promessa = avisarAtrasadas(encomendas.slice(1, 2), enviar);
      await Promise.resolve();
      jest.advanceTimersByTime(1000);
      expect(await promessa).toEqual({ enviados: [], falhados: [8] });
    });

O quarto teste (20 de abril: ninguém é avisado e o enviar não é chamado) segue o mesmo molde. Saída real:

     4 pass
     0 fail
     8 expect() calls
    Ran 4 tests across 1 file. [19.00ms]

O setSystemTime fixa a data para o estaAtrasada, que usa Date.now(). No último teste, o await Promise.resolve() deixa o código arrancar o setTimeout antes de avançares o relógio simulado; sem isso o advanceTimersByTime podia correr antes de o temporizador existir.

### Exercício 31

    // cancelar.ts
    import type { Database } from "bun:sqlite";

    export function cancelarEncomenda(db: Database, id: number): void {
      const tx = db.transaction(() => {
        const e = db.query<{ estado: string }, [number]>("SELECT estado FROM encomendas WHERE id = ?").get(id);
        if (!e) throw new Error(`encomenda ${id} não existe`);
        if (e.estado !== "pendente") throw new Error(`encomenda ${id} está ${e.estado}: só se cancelam pendentes`);
        db.query(
          `UPDATE produtos SET stock = stock + (SELECT SUM(quantidade) FROM linhas_encomenda WHERE encomenda_id = ? AND produto_id = produtos.id)
           WHERE id IN (SELECT produto_id FROM linhas_encomenda WHERE encomenda_id = ?)`,
        ).run(id, id);
        db.query("UPDATE encomendas SET estado = 'cancelada' WHERE id = ?").run(id);
      });
      tx();
    }

Testes (cancelar.test.ts), com a base nova em cada teste:

    let db: Database;
    beforeEach(async () => { db = await abrirLojaEmMemoria(); });
    afterEach(() => db.close());

    const stock = () => db.query("SELECT id, stock FROM produtos WHERE id IN (1, 2, 4) ORDER BY id").all();

    test("a encomenda 8 pendente devolve o stock das 3 linhas", () => {
      expect(stock()).toEqual([{ id: 1, stock: 40 }, { id: 2, stock: 25 }, { id: 4, stock: 30 }]);
      cancelarEncomenda(db, 8);
      expect(stock()).toEqual([{ id: 1, stock: 41 }, { id: 2, stock: 27 }, { id: 4, stock: 31 }]);
    });

    test("a encomenda 1 já foi entregue: erro e nada muda", () => {
      const antes = stock();
      expect(() => cancelarEncomenda(db, 1)).toThrow("encomenda 1 está entregue: só se cancelam pendentes");
      expect(stock()).toEqual(antes);
    });

Os outros dois (cancelar duas vezes dá "está cancelada"; a 999 dá "não existe") são análogos. O teste do snapshot, depois de o Bun o preencher na primeira execução (snapshots: +1 added):

    cancelarEncomenda(db, 12);
    expect(db.query("SELECT id, stock FROM produtos WHERE id IN (1, 4, 10) ORDER BY id").all()).toMatchInlineSnapshot(`
      [
        { "id": 1, "stock": 43 },
        { "id": 4, "stock": 32 },
        { "id": 10, "stock": 201 },
      ]
    `);

(Na saída real o Bun escreveu cada objeto em várias linhas, uma propriedade por linha.) A encomenda 12 tinha 3 unidades do produto 1, 2 do 4 e 1 do 10, por isso 40+3, 30+2 e 200+1. A segunda execução: 5 pass, 0 fail, 1 snapshots, 9 expect() calls.

### Exercício 32

    // ci.ts
    import { tmpdir } from "node:os";
    import { join } from "node:path";

    const saida = join(tmpdir(), `ci-junit-${process.pid}.xml`);
    const proc = Bun.spawn([process.execPath, "test", ...Bun.argv.slice(2), "--reporter=junit", `--reporter-outfile=${saida}`], {
      stdout: "ignore",
      stderr: "ignore",
    });
    const codigo = await proc.exited;

    const ficheiro = Bun.file(saida);
    if (!(await ficheiro.exists())) {
      console.log(`sem relatório (código ${codigo}): o bun test falhou antes de escrever o XML`);
      process.exit(codigo || 1);
    }
    const xml = await ficheiro.text();
    await ficheiro.delete();

    const raiz = xml.match(/<testsuites [^>]*>/)![0];
    const atributo = (nome: string) => Number(raiz.match(new RegExp(`${nome}="([0-9]+)"`))?.[1] ?? 0);
    const total = atributo("tests"), falhas = atributo("failures"), saltados = atributo("skipped");

    const nomesFalhados = [...xml.matchAll(/<testcase name="([^"]*)"[^>]*>\s*<failure/g)].map((m) => m[1]);
    console.log(`testes: ${total}, falhas: ${falhas}, saltados: ${saltados}, passaram: ${total - falhas - saltados}`);
    for (const nome of nomesFalhados) console.log(`  FALHOU: ${nome}`);
    console.log(codigo === 0 ? "CI: verde" : `CI: vermelho (código ${codigo})`);
    process.exit(codigo);

Saída real (bun run ex/ci.ts 01-calc 06-tempo; depois ./bug-real/bug.ts; depois naoexiste):

    testes: 15, falhas: 0, saltados: 2, passaram: 13
    CI: verde                                                  (código de saída 0)

    testes: 3, falhas: 2, saltados: 0, passaram: 1
      FALHOU: V1: quantidades inválidas têm de ser recusadas
      FALHOU: V1: o resultado completo
    CI: vermelho (código 1)                                    (código de saída 1)

    sem relatório (código 1): o bun test falhou antes de escrever o XML    (código de saída 1)

O código de saída vem do process do bun test (proc.exited) e é o que o CI usa para decidir. O XML é mais fiável do que o texto porque tem um formato estável e documentado (atributos tests, failures e skipped, um testcase por teste), enquanto a saída de consola muda com a versão, com a cor e com o facto de estar ou não num terminal: na 1.4.0, com a saída redirecionada, nem sequer lista os testes que passam. Os nomes com acentos vieram intactos. Quando o XML não existe, o código do bun test (1) é o sinal certo.

## Módulo 09 · Bundler e executáveis

### Exercício 33

Ficheiro pacote.ts (corre com bun pacote.ts, sem escrever nada em disco: tudo em memória).

    // pacote.ts
    const entrada = {
      "./iva.ts": `
        export function comIva(valor: number, taxa: number): number {
          return Math.round(valor * (1 + taxa) * 100) / 100;
        }
        export function semIva(valor: number, taxa: number): number {
          return Math.round((valor / (1 + taxa)) * 100) / 100;
        }`,
      "./cliente.ts": `
        import { comIva } from "./iva.ts";
        declare const TAXA_IVA: number;
        const precos = [12.9, 6.5, 49.9];
        console.log(precos.map((p) => comIva(p, TAXA_IVA)));`,
    };

    const variantes: Record<string, Partial<Bun.BuildConfig>> = {
      desenvolvimento: {},
      minify: { minify: true },
      "minify+define+mapa": { minify: true, define: { TAXA_IVA: "0.23" }, sourcemap: "external" },
    };

    for (const [nome, extra] of Object.entries(variantes)) {
      const r = await Bun.build({ entrypoints: ["./cliente.ts"], files: entrada, target: "browser", ...extra });
      const js = r.outputs.find((o) => o.kind === "entry-point")!;
      const codigo = await js.text();
      const mapa = r.outputs.find((o) => o.kind === "sourcemap");
      console.log(nome.padEnd(20), String(js.size).padStart(4), "bytes de JS |",
        mapa ? mapa.size + " bytes de mapa" : "sem mapa",
        "| semIva no pacote?", codigo.includes("semIva"), "| 0.23 colado?", codigo.includes("0.23"));
    }

Saída real (Bun 1.4.0):

    desenvolvimento       359 bytes de JS | sem mapa | semIva no pacote? false | 0.23 colado? false
    minify                113 bytes de JS | sem mapa | semIva no pacote? false | 0.23 colado? false
    minify+define+mapa    155 bytes de JS | 796 bytes de mapa | semIva no pacote? false | 0.23 colado? true

O tree shaking tirou a semIva em todas as variantes (ninguém a importa). O define só aparece na terceira. O JavaScript da terceira é maior (155 contra 113 bytes) apesar de ter o mesmo minify: o define troca TAXA_IVA por 0.23 (4 carateres a menos), mas o sourcemap externo acrescenta ao fim do ficheiro uma linha de comentário //# debugId=... (cerca de 50 carateres), e o mapa em si fica num ficheiro à parte (796 bytes).

### Exercício 34

Quatro ficheiros numa pasta ex34/ ao lado de 00-Introducao/ (o plugin lê ../00-Introducao/dados/loja.sql).

    -- consultas.sql
    -- nome: stock-baixo
    -- Produtos com pouco stock (comentário que não vai para o pacote)
    SELECT nome, stock FROM produtos WHERE stock < 50 ORDER BY stock;

    -- nome: por-categoria
    SELECT c.nome AS categoria, COUNT(*) AS produtos
    FROM produtos p JOIN categorias c ON c.id = p.categoria_id
    GROUP BY c.nome ORDER BY c.nome;

    // plugin-sql.ts
    import type { BunPlugin } from "bun";

    export const pluginSql: BunPlugin = {
      name: "sql",
      setup(build) {
        build.onLoad({ filter: /[.]sql$/ }, async ({ path }) => {
          const texto = await Bun.file(path).text();
          // só trata os ficheiros neste formato; o resto (como o loja.sql) continua a ser texto
          if (!texto.includes("-- nome:")) return { contents: "export default " + JSON.stringify(texto), loader: "js" };
          const consultas = texto
            .split(/^-- nome:\s*/m)
            .slice(1)
            .map((bloco) => {
              const [nome, ...resto] = bloco.split("\n");
              const sql = resto.filter((l) => !l.trim().startsWith("--")).join(" ").replace(/\s+/g, " ").trim();
              return { nome: nome.trim(), sql };
            });
          return { contents: "export default " + JSON.stringify(consultas), loader: "js" };
        });

        build.onResolve({ filter: /^loja:esquema$/ }, ({ path }) => ({ path, namespace: "loja" }));
        build.onLoad({ filter: /.*/, namespace: "loja" }, async () => {
          const sql = await Bun.file(import.meta.dir + "/../00-Introducao/dados/loja.sql").text();
          const tabelas = [...sql.matchAll(/CREATE TABLE (\w+)/g)].map((m) => m[1]);
          return { contents: `export const tabelas = ${JSON.stringify(tabelas)};`, loader: "js" };
        });
      },
    };

    // usar.ts
    import { Database } from "bun:sqlite";
    import consultas from "./consultas.sql";
    import { tabelas } from "loja:esquema";
    import dados from "../00-Introducao/dados/loja.sql" with { type: "text" };

    const db = new Database(":memory:");
    db.exec(dados);
    console.log("tabelas no esquema:", tabelas.join(", "));
    for (const c of consultas) {
      console.log(`-- ${c.nome}: ${c.sql}`);
      console.log(db.query(c.sql).all());
    }

    // corrida.ts
    import { mkdtemp, rm } from "node:fs/promises";
    import { tmpdir } from "node:os";
    import { join } from "node:path";
    import { plugin } from "bun";
    import { pluginSql } from "./plugin-sql.ts";

    const dir = await mkdtemp(join(tmpdir(), "bn09-"));
    const r = await Bun.build({ entrypoints: ["./usar.ts"], plugins: [pluginSql], target: "bun", outdir: dir });
    console.log("build:", r.success, r.outputs.map((o) => o.kind + " " + o.size + "B").join(", "));
    const saida = await Bun.$`${process.execPath} ${join(dir, "usar.js")}`.text();
    console.log("--- resultado do pacote\n" + saida);
    await rm(dir, { recursive: true });

    plugin(pluginSql);
    console.log("--- importado em runtime");
    await import("./usar.ts");

Saída real (bun corrida.ts; encurtei as listas de objetos, mostro só o princípio de cada):

    build: true entry-point 8465B
    --- resultado do pacote
    tabelas no esquema: categorias, clientes, produtos, encomendas, linhas_encomenda
    -- stock-baixo: SELECT nome, stock FROM produtos WHERE stock < 50 ORDER BY stock;
    [ { nome: "Teclado Mecânico", stock: 0 }, { nome: "Conjunto de Panelas", stock: 8 }, ... 8 produtos no total ]
    -- por-categoria: SELECT c.nome AS categoria, COUNT(*) AS produtos FROM produtos p JOIN categorias c ON c.id = p.categoria_id GROUP BY c.nome ORDER BY c.nome;
    [ { categoria: "Casa", produtos: 4 }, { categoria: "Eletrónica", produtos: 3 }, { categoria: "Livros", produtos: 3 } ]

    --- importado em runtime
    tabelas no esquema: categorias, clientes, produtos, encomendas, linhas_encomenda
    -- stock-baixo: ... (as mesmas duas consultas e os mesmos resultados)

Sem a linha do if (versão ingénua do plugin, que reclama todos os .sql), o import do loja.sql com type text passou a ser o array de consultas e o bun:sqlite falhou: error: Expected SQL string, em at run (bun:sqlite). A primeira correção que tentei foi devolver undefined para os ficheiros que não são meus: funcionou no Bun.build, mas no runtime a 1.4.0 respondeu error: Expected module mock to return an object. A segunda foi devolver loader text, que o runtime também recusou (Expected loader to be one of "js", "jsx", "object", "ts", "tsx", "toml", "yaml", "json", "xml", or "md"). Devolver um módulo JavaScript com o texto (loader js) serve nos dois. O pacote tem 8465 bytes porque leva dentro o texto do loja.sql.

### Exercício 35

Ficheiros loja-cli.ts e ajuda.txt (numa pasta ex35/ ao lado de 00-Introducao/).

    // loja-cli.ts
    import { Database } from "bun:sqlite";
    import { parseArgs } from "node:util";
    import sql from "../00-Introducao/dados/loja.sql" with { type: "text" };
    import ajuda from "./ajuda.txt" with { type: "text" };

    const { positionals, values } = parseArgs({
      args: Bun.argv.slice(2),
      allowPositionals: true,
      options: { categoria: { type: "string" } },
    });
    const [comando, argumento] = positionals;

    const db = new Database(":memory:");
    db.exec(sql);
    const json = process.env.LOJA_FORMATO === "json";
    const mostrar = (linhas: object[]) => (json ? console.log(JSON.stringify(linhas)) : console.table(linhas));

    if (comando === "produtos") {
      const linhas = values.categoria
        ? db.query("SELECT id, nome, preco, stock FROM produtos WHERE categoria_id = ? ORDER BY id").all(Number(values.categoria))
        : db.query("SELECT id, nome, preco, stock FROM produtos ORDER BY id").all();
      mostrar(linhas as object[]);
    } else if (comando === "encomenda" && argumento) {
      const e = db.query("SELECT id, cliente_id, estado FROM encomendas WHERE id = ?").get(Number(argumento));
      if (!e) {
        console.error(`encomenda ${argumento} não existe`);
        process.exit(2);
      }
      const linhas = db
        .query("SELECT produto_id, quantidade, preco_unitario FROM linhas_encomenda WHERE encomenda_id = ? ORDER BY id")
        .all(Number(argumento));
      mostrar([e as object, ...(linhas as object[])]);
    } else {
      console.error(ajuda.trim());
      process.exit(1);
    }

Compilar e correr (a partir da pasta ex35/, com a saída numa pasta temporária minha):

    bun build --compile --minify loja-cli.ts --outfile=SAIDA/loja-cli.exe
    tamanho: 88824832 bytes

    > loja-cli.exe produtos --categoria 3          (código de saída 0)
    ┌───┬────┬─────────────────────┬───────┬───────┐
    │   │ id │ nome                │ preco │ stock │
    ├───┼────┼─────────────────────┼───────┼───────┤
    │ 0 │ 7  │ Candeeiro de Mesa   │ 22    │ 15    │
    │ 1 │ 8  │ Conjunto de Panelas │ 89.9  │ 8     │
    │ 2 │ 9  │ Manta de Sofá       │ 34.5  │ 20    │
    │ 3 │ 10 │ Caneca de Cerâmica  │ 6.5   │ 200   │
    └───┴────┴─────────────────────┴───────┴───────┘

    > LOJA_FORMATO=json loja-cli.exe encomenda 8   (código de saída 0)
    [{"id":8,"cliente_id":1,"estado":"pendente"},{"produto_id":1,"quantidade":1,"preco_unitario":12.9},{"produto_id":2,"quantidade":2,"preco_unitario":18.5},{"produto_id":4,"quantidade":1,"preco_unitario":49.9}]

    > loja-cli.exe encomenda 99                    (código de saída 2)
    encomenda 99 não existe

    > loja-cli.exe                                 (código de saída 1)
    uso: loja-cli produtos [--categoria N]
         loja-cli encomenda ID
    variável de ambiente: LOJA_FORMATO=json (por omissão: tabela)

Corri o executável a partir de uma pasta vazia (cd para outra pasta e ../ex35/loja-cli.exe produtos --categoria 2) e listou os produtos 4, 5 e 6 (os da categoria 2), por isso o loja.sql e o ajuda.txt estão mesmo lá dentro. O executável tem 88824832 bytes, 1112 a menos do que o bun.exe do anfitrião (88825944): o teu código e o texto do loja.sql não o tornaram maior do que o próprio Bun.

### Exercício 36

Ficheiros servidor.ts, macros.ts, verificar.ts e web/ (index.html, montra.ts, montra.css) numa pasta ex36/ ao lado de 00-Introducao/.

    // macros.ts
    import { readFileSync } from "node:fs";
    import { join } from "node:path";

    export function compiladoEm(): string {
      return new Date().toISOString();
    }

    export function produtosNoSql(): number {
      const sql = readFileSync(join(import.meta.dir, "../00-Introducao/dados/loja.sql"), "utf8");
      return (sql.match(/INSERT INTO produtos /g) ?? []).length;
    }

    // web/montra.ts
    import { compiladoEm, produtosNoSql } from "../macros.ts" with { type: "macro" };

    type Produto = { id: number; nome: string; preco: number; stock: number };

    document.querySelector("#rodape")!.textContent = `Pacote de ${compiladoEm()}; o loja.sql tem ${produtosNoSql()} produtos.`;
    const produtos: Produto[] = await (await fetch("/api/produtos")).json();
    document.querySelector("#lista")!.innerHTML = produtos
      .map((p) => `<li>${p.nome}: ${p.preco.toFixed(2)} € (${p.stock} em stock)</li>`)
      .join("");

    // servidor.ts
    import { Database } from "bun:sqlite";
    import sql from "../00-Introducao/dados/loja.sql" with { type: "text" };
    import { compiladoEm } from "./macros.ts" with { type: "macro" };
    import montra from "./web/index.html";

    const db = new Database(":memory:");
    db.exec(sql);

    const servidor = Bun.serve({
      port: Number(process.env.PORT ?? 3000),
      hostname: "127.0.0.1",
      routes: {
        "/": montra,
        "/api/produtos": () => Response.json(db.query("SELECT id, nome, preco, stock FROM produtos ORDER BY id").all()),
        "/api/versao": () => Response.json({ compiladoEm: compiladoEm() }),
      },
    });
    console.log("montra em", servidor.url.href);

O index.html tem um link para montra.css e um script de módulo para montra.ts. O verificar.ts arranca o exe com Bun.spawn (env com PORT=35092), lê a primeira linha, pede / e, para cada src ou href que acabe em js ou css, pede o ficheiro; depois pede /api/produtos e /api/versao e, num finally, faz filho.kill() e espera por filho.exited.

    bun build --compile --minify servidor.ts --outfile=SAIDA/montra.exe
    bun verificar.ts SAIDA/montra.exe

    pid 37356 | executável: 88826368 bytes
    montra em http://127.0.0.1:35092/
    /chunk-y74v3e6z.css 200 text/css;charset=utf-8 60 bytes
    /chunk-td7583sv.js 200 text/javascript;charset=utf-8 299 bytes
      JS: document.querySelector("#rodape").textContent=`Pacote de ${"2026-11-23T09:06:14.650Z"}; o loja.sql tem 10 produtos.`;var ...
    /api/produtos: 10 produtos
    /api/versao: {"compiladoEm":"2026-11-23T09:06:14.638Z"}
    terminado o pid 37356

As duas macros já estavam resolvidas no JavaScript servido (a data e o 10 estão escritos no código, e o import com type macro desapareceu). O valor de /api/versao é o mesmo em todas as execuções do mesmo executável porque a macro correu uma vez, durante a build: o que ficou no .exe foi a cadeia de texto da data e não a chamada à função (corri o verificar.ts duas vezes, com dois processos diferentes, e vi as duas vezes 2026-11-23T09:06:14.638Z; a data do rodapé, 09:06:14.650, é de outra chamada da macro, na mesma build, 12 ms depois). Depois terminei só esse PID e o netstat não mostrou nenhuma porta 35090 a 35099 em escuta. Não abri um browser: o desenho da página e o fetch do cliente não foram testados, só os ficheiros servidos.

## Módulo 10 · Pacotes e workspaces

### Exercício 37

Tudo com a cache própria (BUN_INSTALL_CACHE_DIR) e numa pasta fora do curso.

    bun pm cache
    (o caminho da tua cache, nunca ~/.bun/install/cache)

    bun add is-number@^5.0.0 is-odd
    installed is-number@5.0.0
    installed is-odd@3.0.1
    3 packages installed [175.00ms]

    bun why is-number
    is-number@5.0.0
      └─ ex37 (requires ^5.0.0)
    is-number@6.0.0
      └─ is-odd@3.0.1 (requires ^6.0.0)
         └─ ex37 (requires ^3.0.1)

    bun outdated
    | Package   | Current | Update | Latest |
    | is-number | 5.0.0   | 5.0.0  | 7.0.0  |

    bun update
    Checked 3 installs across 4 packages (no changes) [119.00ms]

    bun update --latest is-number
    ^ is-number 5.0.0 -> 7.0.0

    bun pm ls --all
    ├── is-number@7.0.0
    └── is-odd@3.0.1
        └── is-number@6.0.0

O package.json final tem "is-number": "^7.0.0" e "is-odd": "^3.0.1". (a) Houve duas versões do is-number: a 5.0.0, pedida por ti, e a 6.0.0, pedida pelo is-odd (^6.0.0). Depois do --latest ficaram a 7.0.0 e a 6.0.0. (b) O bun outdated mostra que o intervalo ^5.0.0 só permite a 5.0.0 (coluna Update) e que existe a 7.0.0. O bun update respeita o intervalo do package.json, por isso não mudou nada; o --latest reescreve o intervalo.

### Exercício 38

Pacote em exemplos/gancho (package.json com "postinstall": "node marca.js"; o marca.js escreve POSTINSTALL-CORREU.txt na pasta do pacote).

    cd pacote && bun pm pack --quiet --destination ..
    cd ../consumidor && bun add ../pacote-com-gancho-1.0.0.tgz
    installed pacote-com-gancho@../pacote-com-gancho-1.0.0.tgz
    Blocked 1 postinstall. Run `bun pm untrusted` for details.
    ls node_modules/pacote-com-gancho
    index.js  marca.js  package.json

    bun pm untrusted
    .\node_modules\pacote-com-gancho @../pacote-com-gancho-1.0.0.tgz
     » [postinstall]: node marca.js

    bun pm trust pacote-com-gancho
     ✓ [postinstall]: node marca.js
     1 script ran across 1 package [414.00ms]
    ls node_modules/pacote-com-gancho
    POSTINSTALL-CORREU.txt  index.js  marca.js  package.json

O package.json ganhou "trustedDependencies": ["pacote-com-gancho"]. Numa reinstalação limpa (apagar node_modules e bun install) o POSTINSTALL-CORREU.txt voltou a aparecer, porque agora o pacote é de confiança. Com bun install --ignore-scripts a pasta ficou só com index.js, marca.js e package.json: a opção desliga os scripts mesmo dos pacotes de confiança. O postinstall do próprio projeto é código teu, por isso corre (a menos que uses --ignore-scripts); o das dependências é código de terceiros, por isso o Bun só o corre se o nome estiver em trustedDependencies. O marca.js usa o node: o script corre com o Node instalado, não com o Bun.

### Exercício 39

Raiz (package.json): "workspaces": ["pacotes/*"] e "catalog": { "left-pad": "1.3.0" }.

    // pacotes/lib/package.json
    { "name": "@est/lib", "version": "2.1.0", "type": "module", "exports": "./index.ts",
      "dependencies": { "left-pad": "catalog:" }, "scripts": { "teste": "echo lib: testes ok" } }

    // pacotes/lib/index.ts
    import leftPad from "left-pad";
    export const codigo = (n: number): string => "ENC-" + leftPad(n, 5, "0");

    // pacotes/cli/package.json
    { "name": "@est/cli", "version": "1.0.0", "type": "module",
      "dependencies": { "@est/lib": "workspace:*" },
      "scripts": { "teste": "echo cli: testes ok", "start": "bun main.ts 42" } }

    // pacotes/cli/main.ts
    import { codigo } from "@est/lib";
    console.log(codigo(Number(process.argv[2] ?? 1)));

    bun install
    1 package installed [20.00ms]
    bun run --cwd pacotes/cli start
    ENC-00042

    bun run --filter '*' teste
    @est/lib teste: lib: testes ok
    @est/lib teste: Exited with code 0
    @est/cli teste: cli: testes ok
    @est/cli teste: Exited with code 0

    bun run --filter @est/cli teste
    @est/cli teste: cli: testes ok
    @est/cli teste: Exited with code 0

    bun pm pack --cwd pacotes/cli --destination (uma pasta tua)
    tar xzf est-cli-1.0.0.tgz   (e ler package/package.json)
    "dependencies": { "@est/lib": "2.1.0" }

    bun install --filter @est/lib   (depois de apagar node_modules)
    pacotes/lib/node_modules/left-pad  (e nada em pacotes/cli)

    bun why left-pad
    left-pad@1.3.0
      └─ @est/lib@workspace (requires catalog:)
         ├─ @est/cli@workspace (requires workspace:*)

O Bun troca o `workspace:*` pela versão do @est/lib (2.1.0) no tarball: quem instalar o @est/cli do registo vai buscar uma versão real. Com o linker isolated (o omissão num monorepo novo) o left-pad só aparece em pacotes/lib/node_modules, onde está declarado. O bun install --filter @est/lib instalou só o que esse pacote precisa.

### Exercício 40

    bun add ms@2.1.3
    bun teste.ts        (import ms from "ms"; console.log(ms("2 dias")))
    undefined

    bun patch ms@2.1.3
    To patch ms, edit the following folder:
      node_modules/ms

    // remendar.ts
    const f = "node_modules/ms/index.js";
    let t = await Bun.file(f).text();
    t = t.replace("|days?|d|", "|days?|dias?|d|");
    t = t.replace("    case 'days':", "    case 'dias':\n    case 'dia':\n    case 'days':");
    await Bun.write(f, t);

    bun remendar.ts && bun teste.ts
    172800000

    bun patch --commit node_modules/ms
    + ms@2.1.3

O package.json ganhou "patchedDependencies": { "ms@2.1.3": "patches/ms@2.1.3.patch" }. O patch é um diff de duas partes (a expressão regular ganhou dias? e o switch ganhou os casos dias e dia):

    -  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|...|days?|d|weeks?|...)?$/i.exec(
    +  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|...|days?|dias?|d|weeks?|...)?$/i.exec(
    +    case 'dias':
    +    case 'dia':
         case 'days':

Reinstalação a frio:

    rm -rf node_modules && bun install --frozen-lockfile
    + ms@2.1.3
    bun teste.ts
    172800000

A cache original não mudou: grep -c dias na cache ms@2.1.3@@@1/index.js deu 0, e a pasta da cache ganhou uma entrada separada ms@2.1.3@@@1_patch_hash=ab9c9889bce146cf com a versão remendada. Não se edita node_modules/ms/index.js à mão porque, com o backend por omissão no Windows (hardlink), esse ficheiro e o da cache são o mesmo (hardlink): a alteração iria para a cache partilhada por todos os projetos e não ficaria em nenhum ficheiro que o git guarde. O bun patch copia o pacote, regista o diff e aplica-o em cada instalação.

## Módulo 11 · Concorrência e interoperabilidade

### Exercício 41

Dois ficheiros em e41/.

    // iva-worker.ts
    declare var self: Worker;

    type Pedido = { nome: string; preco: number };

    self.onmessage = (e: MessageEvent<Pedido>) => {
      const { nome, preco } = e.data;
      if (preco < 0) throw new RangeError(`preço negativo: ${nome}`);
      self.postMessage({ nome, comIva: Math.round(preco * 1.23 * 100) / 100 });
    };

    // principal.ts
    const w = new Worker(new URL("./iva-worker.ts", import.meta.url));
    const respostas: string[] = [];

    w.addEventListener("message", (e) => {
      respostas.push(`${e.data.nome}: ${e.data.comIva.toFixed(2)}`);
      console.log("recebido:", respostas.at(-1));
    });
    w.addEventListener("error", (e) => console.log("erro no worker:", e.message.match(/\w*[Ee]rror: .*/)?.[0]));
    const fechado = new Promise<number>((ok) => w.addEventListener("close", (e) => ok((e as CloseEvent).code)));

    w.postMessage({ nome: "Romance Policial", preco: 12.9 });
    w.postMessage({ nome: "Caneca de Cerâmica", preco: 6.5 });
    w.postMessage({ nome: "Defeito", preco: -1 });   // faz o worker lançar uma exceção
    w.postMessage({ nome: "Nunca chega", preco: 5 }); // o worker já morreu

    console.log("código de close:", await fechado, "| respostas recebidas:", respostas.length);

Saída real (bun principal.ts):

    recebido: Romance Policial: 15.87
    recebido: Caneca de Cerâmica: 8.00
    erro no worker: RangeError: preço negativo: Defeito
    código de close: 1 | respostas recebidas: 2

O RangeError não tratado mata o worker: o principal recebe o evento error e depois o close com código 1. O quarto produto ficou na fila de mensagens de um worker que já tinha morrido e nunca foi processado. Para continuar depois de um erro, o worker teria de apanhar a exceção dentro do onmessage e responder com um objeto de erro.

### Exercício 42

Ficheiros em e42/: dados.ts, worker.ts e principal.ts.

    // dados.ts
    // (categoria, quantidade, preço em cêntimos) das linhas das encomendas não canceladas, repetidas 4000 vezes
    export const BASE: [number, number, number][] = [
      [1, 2, 1290], [2, 1, 1490], [2, 1, 4990], [1, 1, 1850], [3, 4, 650], [2, 1, 7900], [2, 2, 1490],
      [1, 1, 2999], [3, 2, 2200], [3, 1, 3450], [3, 2, 650], [1, 1, 1290], [1, 2, 1850], [2, 1, 4990],
      [3, 1, 2200], [2, 3, 1490], [3, 6, 650], [3, 1, 8990], [3, 2, 3450], [2, 2, 4990], [1, 3, 1290],
      [3, 1, 650], [2, 1, 1490], [3, 2, 650], [1, 1, 1290],
    ];
    export const REPETICOES = 4000;

    // worker.ts
    declare var self: Worker;

    self.onmessage = (e: MessageEvent) => {
      const { sab, linhas } = e.data as { sab: SharedArrayBuffer; linhas: [number, number, number][] };
      const totais = new Int32Array(sab); // posição = id da categoria, valor = cêntimos
      for (const [cat, qtd, preco] of linhas) Atomics.add(totais, cat, qtd * preco);
      self.postMessage("feito");
    };

    // principal.ts
    import { BASE, REPETICOES } from "./dados.ts";

    const todas = Array.from({ length: REPETICOES }, () => BASE).flat();
    const NW = 3;

    // versão sequencial (referência)
    const seq = new Int32Array(4);
    for (const [cat, qtd, preco] of todas) seq[cat] += qtd * preco;

    // versão com workers: cada um recebe uma fatia e soma na MESMA memória partilhada
    const sab = new SharedArrayBuffer(4 * 4);
    const parte = Math.ceil(todas.length / NW);
    const workers = Array.from({ length: NW }, () => new Worker(new URL("./worker.ts", import.meta.url)));
    await Promise.all(workers.map((w, i) => new Promise<void>((ok) => {
      w.onmessage = () => ok();
      w.postMessage({ sab, linhas: todas.slice(i * parte, (i + 1) * parte) });
    })));
    workers.forEach((w) => w.terminate());

    const par = new Int32Array(sab);
    const nomes = ["", "Livros", "Eletrónica", "Casa"];
    for (const c of [1, 2, 3]) console.log(`${nomes[c].padEnd(11)} sequencial ${seq[c]}  workers ${par[c]}  ${seq[c] === par[c] ? "igual" : "DIFERENTE"}`);
    console.log(`${todas.length} linhas, ${NW} workers`);

Saída real (bun principal.ts):

    Livros      sequencial 70316000  workers 70316000  igual
    Eletrónica  sequencial 153160000  workers 153160000  igual
    Casa        sequencial 142760000  workers 142760000  igual
    100000 linhas, 3 workers

Os valores são iguais. Atomics.add faz a leitura, a soma e a escrita numa só operação indivisível; com ++ duas threads leriam o mesmo valor e uma das somas perdia-se (no exemplo 03 do módulo, 400000 esperados deram cerca de 300000). O Int32Array chega para estes totais (o maior é 153160000 cêntimos, abaixo de 2147483647).

### Exercício 43

Ficheiros em e43/: cotacao.ts e principal.ts.

    // cotacao.ts
    // Processo filho: recebe pedidos por IPC e responde com o total com IVA
    const PRECOS: Record<string, number> = { "Romance Policial": 12.9, "Carregador USB-C": 14.9, "Caneca de Cerâmica": 6.5 };

    process.on("message", (m: any) => {
      if (m === "terminar") process.exit(0);
      const preco = PRECOS[m.produto];
      if (preco === undefined) return process.send!({ id: m.id, erro: `produto desconhecido: ${m.produto}` });
      process.send!({ id: m.id, total: Math.round(m.quantidade * preco * 1.23 * 100) / 100 });
    });
    process.send!({ pronto: true });

    // principal.ts
    const pedidos = [
      { id: 1, produto: "Romance Policial", quantidade: 2 },
      { id: 2, produto: "Caneca de Cerâmica", quantidade: 6 },
      { id: 3, produto: "Teclado Fantasma", quantidade: 1 },
    ];
    const respostas = new Map<number, any>();

    const filho = Bun.spawn([process.execPath, new URL("./cotacao.ts", import.meta.url).pathname.slice(1)], {
      ipc(m, sub) {
        if (m.pronto) return pedidos.forEach((p) => sub.send(p));
        respostas.set(m.id, m);
        console.log("resposta:", JSON.stringify(m));
        if (respostas.size === pedidos.length) sub.send("terminar");
      },
      stdout: "inherit",
    });

    const codigo = await filho.exited;
    console.log("filho saiu com código", codigo, "| respostas:", respostas.size);

Saída real (bun principal.ts):

    resposta: {"id":1,"total":31.73}
    resposta: {"id":2,"total":47.97}
    resposta: {"id":3,"erro":"produto desconhecido: Teclado Fantasma"}
    filho saiu com código 0 | respostas: 3

O handler ipc recebe cada mensagem e o subprocesso como segundo argumento, por isso responde com sub.send sem guardar a variável. O filho só sai quando recebe terminar, e o await filho.exited devolve o código 0. Nada fica a correr.

### Exercício 44

Ficheiros em e44/: iva-wasm.ts, dependencias.ts e amostra.ts.

    // iva-wasm.ts
    // iva(cent: i32) -> i32 = (cent * 123 + 50) / 100, em inteiros: arredonda 0,5 para cima
    const secao = (id: number, ...conteudo: number[]) => [id, conteudo.length, ...conteudo];
    const bytes = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
      ...secao(1, 1, 0x60, 0x01, 0x7f, 0x01, 0x7f),                  // um tipo: (i32) -> i32
      ...secao(3, 1, 0x00),                                           // uma função do tipo 0
      ...secao(7, 1, 3, ...new TextEncoder().encode("iva"), 0x00, 0x00), // exporta "iva"
      ...secao(10, 1,
        15, 0x00,                                                     // corpo de 15 bytes, 0 locais
        0x20, 0x00,                                                   // local.get 0
        0x41, 0xfb, 0x00, 0x6c,                                       // i32.const 123 (LEB128 com sinal: 2 bytes); i32.mul
        0x41, 0x32, 0x6a,                                             // i32.const 50; i32.add
        0x41, 0xe4, 0x00, 0x6d,                                       // i32.const 100 (2 bytes); i32.div_s
        0x0b),
    ]);

    const { instance } = await WebAssembly.instantiate(bytes);
    const iva = instance.exports.iva as (c: number) => number;

    const precos = [1290, 1850, 2999, 4990, 1490, 7900, 2200, 8990, 3450, 650]; // cêntimos
    let diferentes = 0;
    for (const p of precos) {
      const w = iva(p), j = Math.round(p * 1.23);
      if (w !== j) diferentes++;
      console.log(`${String(p).padStart(5)} -> wasm ${String(w).padStart(5)} | Math.round(p * 1.23) ${String(j).padStart(5)}${w === j ? "" : "  DIFERENTE"}`);
    }
    console.log("preços diferentes:", diferentes, "de", precos.length);

    // dependencias.ts
    import { readdirSync, readFileSync } from "node:fs";
    import { basename } from "node:path";

    const t = new Bun.Transpiler({ loader: "ts" });
    const ficheiros = readdirSync(import.meta.dir).filter((f) => f.endsWith(".ts"));
    const externos = new Map<string, string[]>();

    for (const f of ficheiros) {
      for (const imp of t.scanImports(readFileSync(import.meta.dir + "/" + f, "utf8"))) {
        if (imp.path.startsWith(".")) continue;                       // só módulos que não são ficheiros nossos
        externos.set(imp.path, [...(externos.get(imp.path) ?? []), basename(f)]);
      }
    }
    for (const [modulo, usadoEm] of [...externos].sort()) console.log(modulo.padEnd(12), "<-", usadoEm.join(", "));

    // amostra.ts
    // Ficheiro só para ser analisado (nunca executado)
    import { Database } from "bun:sqlite";
    import { createHash } from "node:crypto";
    import { readFileSync } from "node:fs";
    import { helper } from "./local.ts";
    export const lazy = () => import("node:zlib");

Saída real (bun iva-wasm.ts e bun dependencias.ts):

     1290 -> wasm  1587 | Math.round(p * 1.23)  1587
     1850 -> wasm  2276 | Math.round(p * 1.23)  2276
     2999 -> wasm  3689 | Math.round(p * 1.23)  3689
     4990 -> wasm  6138 | Math.round(p * 1.23)  6138
     1490 -> wasm  1833 | Math.round(p * 1.23)  1833
     7900 -> wasm  9717 | Math.round(p * 1.23)  9717
     2200 -> wasm  2706 | Math.round(p * 1.23)  2706
     8990 -> wasm 11058 | Math.round(p * 1.23) 11058
     3450 -> wasm  4244 | Math.round(p * 1.23)  4244
      650 -> wasm   800 | Math.round(p * 1.23)   800
    preços diferentes: 0 de 10

    bun:sqlite   <- amostra.ts
    node:crypto  <- amostra.ts
    node:fs      <- amostra.ts, dependencias.ts
    node:path    <- dependencias.ts
    node:zlib    <- amostra.ts

A minha primeira versão falhou com CompileError (parsing ended before the end of Code section) porque declarei 14 bytes para o corpo da função quando eram 15: o tamanho de cada corpo tem de ser exato. A divisão inteira com sinal (i32.div_s) trunca, por isso somar 50 antes de dividir por 100 arredonda 0,5 para cima; para estes 10 preços o resultado igualou o Math.round. O scanImports devolve também os imports dinâmicos (o node:zlib) e ignora os imports de tipos.

## Projeto final · Exercício 45

O projeto é aberto, por isso não há uma solução única. Usa a grelha do módulo 12 (9 critérios, de 0 a 3, máximo 27) e esta tabela para avaliares cada parte.

| Parte | Está bom quando... | Sinal de alerta |
|---|---|---|
| Sem dependências | Só Bun.*, bun:*, APIs Web e node:* embutidos, sem node_modules | Um pacote instalado por hábito |
| Dados | Consultas parametrizadas, PRAGMA foreign_keys ligado, dinheiro tratado com cuidado | Texto concatenado em SQL |
| API | As cinco rotas com códigos HTTP corretos e erros claros | Erros internos expostos |
| Transação | Encomenda e stock atualizados juntos, sem stock negativo | Atualizações soltas |
| Documentação | OpenAPI gerado da tabela de rotas, /docs a funcionar e teste que cobre todas as rotas | OpenAPI escrito à mão e desatualizado |
| Segurança | Palavras-passe com Bun.password, segredos fora do código, pedidos validados | Segredo no código |
| Testes e executável | Pelo menos 15 testes com cobertura e um executável que corre sozinho | Sem teste que falhe de propósito, ou executável nunca experimentado |

**DICA:** pede a um colega que corra, teste e construa o projeto só com o README.
