# 11 Concorrência e interoperabilidade

Neste módulo fazes o Bun trabalhar em várias threads e em vários processos, falas com código nativo (bun:ffi e WebAssembly), olhas para dentro do motor (event loop, memória, transpilador, plugins) e medes até onde vai a compatibilidade com o Node. Só usas o que o Bun traz: o Worker global, Bun.spawn, o módulo bun:ffi, o WebAssembly do motor e os módulos node:* embutidos.

Tudo foi executado com o Bun 1.4.0 no Windows 11 (Git Bash), com o Node 24.18.0 só para comparações pontuais. A documentação oficial já descreve a 1.4.5: o que ela diz e a 1.4.0 não faz está assinalado. Os exemplos estão em exemplos/ (ficheiros 01 a 26, mais as pastas cc, plugins-runtime e loja-workers). Usei as portas 35110 a 35115 de 127.0.0.1.

## O que substitui

| Biblioteca ou ferramenta npm habitual | O que o Bun já traz |
|---|---|
| workerpool, piscina, threads.js | Worker global (Web Workers) e node:worker_threads |
| execa, cross-spawn | Bun.spawn, Bun.spawnSync e node:child_process |
| pm2 cluster, throng | node:cluster (limitado no Windows, ver abaixo) |
| cls-hooked, continuation-local-storage | AsyncLocalStorage de node:async_hooks |
| ffi-napi, koffi | bun:ffi (dlopen e cc) |
| esbuild ou swc só para transpilar | Bun.Transpiler |
| ts-node, tsx, esbuild-register | nada: o Bun corre TypeScript; plugins com Bun.plugin |
| wasm-pack só para correr WASM | WebAssembly do motor (sem toolchain, escrevi bytes à mão) |

## Workers nativos

Um Worker corre outro módulo numa thread própria, com o seu heap e o seu event loop. O ficheiro do worker é um módulo normal, em TypeScript, sem passo de compilação. A API é a dos Web Workers, com extensões do Bun. A documentação marca-a como experimental, em particular o terminate.

    // 01-worker-basico.ts
    const w = new Worker(new URL("./01-worker-eco.ts", import.meta.url));
    w.onmessage = (ev) => { console.log("principal recebeu:", ev.data); if (ev.data.fim) w.terminate(); };
    w.postMessage({ nome: "Ana", n: 5 });
    w.postMessage("terminar");

    // 01-worker-eco.ts
    declare var self: Worker;          // dá o tipo certo a self
    self.onmessage = (ev: MessageEvent) => {
      if (ev.data === "terminar") return self.postMessage({ fim: true });
      self.postMessage({ ola: `olá, ${ev.data.nome}`, quadrado: ev.data.n ** 2 });
    };

    isMainThread (principal): true
    isMainThread (worker): false | threadId: 1
    principal recebeu: { ola: "olá, Ana", quadrado: 25 }
    principal recebeu: { fim: true }

As mensagens enviadas antes de o worker arrancar ficam em fila. Bun.isMainThread diz em que thread estás. **ATENÇÃO:** as mensagens só chegam ao handler instalado antes do primeiro await do topo do módulo do worker. Num worker que faz await Bun.sleep(100) antes de definir onmessage, a mensagem enviada logo à partida perdeu-se e a enviada 500 ms depois chegou (exemplo 07). Instala o handler na primeira linha. O node:worker_threads não tem este problema: o parentPort guarda as mensagens até haver um listener.

### Mensagens: clone e transferíveis

O postMessage usa o structured clone, o mesmo algoritmo do structuredClone global. Copia Date, Map, Set, bigint e objetos aninhados; recusa funções e símbolos com DataCloneError; perde o protótipo das classes (o objeto chega como Object simples, sem métodos).

    const buf = new ArrayBuffer(8 * 1024 * 1024);
    w.postMessage(buf, [buf]);        // transfere: o buffer muda de dono, não é copiado
    // antes: 8388608 bytes | depois: 0 bytes, detached: true
    structuredClone(b2, { transfer: [b2] });   // o original fica com 0 bytes, a cópia com 16

Sem a lista de transferíveis o buffer é copiado e o original mantém-se. Nos objetos simples só com valores primitivos e em strings, a documentação diz que o Bun tem caminhos rápidos que evitam o structured clone (confirma os números na documentação: não os medi).

### SharedArrayBuffer e Atomics

Com um SharedArrayBuffer as threads vêem a mesma memória, sem cópia. Quatro workers a somarem 100 mil vezes cada um (exemplo 03):

    esperado: 400000
    com Atomics.add: 400000
    com ++ normal:   300352 (perde incrementos)

O ++ normal é ler, somar e escrever: duas threads sobrepõem-se e perdem somas (nas duas execuções saiu um valor diferente: 300352 e 314574). Atomics.add faz a operação indivisível. Para esperar sem gastar CPU usa Atomics.wait no worker e Atomics.notify no outro lado (exemplo 04: o worker dormiu 197 ms e acordou com ok). Na 1.4.0 o Atomics.wait também correu na thread principal (devolveu timed-out); isso é permitido mas bloqueia o event loop, por isso prefere Atomics.waitAsync, que existe e devolve uma promessa.

### Erros, terminate e close

    1. error: falhou dentro do worker | ErrorEvent? true
    1. close, code = 1 (o erro não tratado mata o worker)
    2. DataCloneError                              (postMessage de uma função)
    3. rejeição no worker: error: promessa rejeitada
    4. terminate chamado; demorou 0 ms | close, code = 0
    5. close após process.exit(3), code = 3
    6. ficheiro inexistente: BuildMessage: ModuleNotFound resolving ...

Uma exceção não tratada (ou uma promessa rejeitada sem catch) chega ao principal como evento error e o worker fecha com código 1. O terminate() para o worker mesmo preso num while (true) (o close chegou com código 0). O process.exit(n) dentro do worker só fecha o worker e o n vai no CloseEvent. **DICA:** usa sempre terminate() nos workers que criares: um worker com onmessage mantém o processo vivo. Experimentei: sem terminate nem unref o processo ficou preso (cortei-o com um timeout); com worker.unref() terminou logo. O ref: false no construtor é equivalente ao unref().

### Opções e ciclo de vida

    new Worker(url, { smol: true, preload: [...], env: {...}, argv: [...], ref: false })

No exemplo 06 o preload correu antes do módulo do worker (definiu uma global), env chegou a process.env (MODO), argv chegou a process.argv.slice(2) e o workerData de node:worker_threads foi lido com sucesso. A opção name foi aceite, mas self.name no worker ficou undefined na 1.4.0. O smol é, segundo a documentação, o JSC::HeapSize Small em vez de Large: no exemplo 09 e com bun --smol não consegui medir diferença no pico do heap (41, 47 e 50 MB sem smol contra 41, 52 e 48 MB com smol), por isso não o prometo. Também testei: workers a partir de um Blob ou File com TypeScript em memória (URL.createObjectURL), o evento open (específico do Bun), o evento close, o process.on("worker") e setEnvironmentData/getEnvironmentData de node:worker_threads (exemplo 07). Um worker sem nada pendente termina sozinho.

### Quanto ganhas, a sério

O exemplo 08 conta primos até 6 milhões, em blocos de 50 mil pedidos aos workers por ordem de chegada. A máquina é partilhada, por isso cada número é a mediana de 5 execuções, com o pool já arrancado e aquecido (8 CPUs lógicos):

| Execução | Mediana | Ganho |
|---|---|---|
| sequencial | 1726 ms | 1,00 |
| 1 worker | 1555 ms | 1,11 |
| 2 workers | 930 ms | 1,86 |
| 4 workers | 554 ms | 3,11 |
| 8 workers | 409 ms | 4,22 |

O ganho cresce com os workers mas não é linear (8 workers deram 4,2 e não 8): o resto é arranque, mensagens e uma máquina que não é só tua. Para trabalho curto, o worker perde: criar um worker custou cerca de 4 ms, e somar as 25 linhas da loja custou 86 microssegundos.

### node:worker_threads e canais

O node:worker_threads é a mesma tecnologia com a API do Node: Worker com on("message"), parentPort, workerData, threadId, MessageChannel e receiveMessageOnPort, que lê uma mensagem de forma síncrona (exemplo 10). Não é a mesma classe do Worker global (Worker === globalThis.Worker deu false). O exemplo 26 passa uma MessagePort, como transferível, entre dois workers para falarem sem passar pelo principal, e usa um BroadcastChannel de um para todos.

## Processos: Bun.spawn com IPC

Bun.spawn lança um processo. Com a opção ipc ganha um canal de mensagens bidirecional: o pai recebe no handler ipc, envia com sub.send(), e o filho usa process.send e process.on("message").

    const filho = Bun.spawn([process.execPath, "11-filho-ipc.ts"], {
      ipc(mensagem, sub) {
        if (mensagem.pronto) sub.send({ tarefa: "somar", valores: [1, 2, 3, 4] });
        if (mensagem.resultado !== undefined) sub.send("terminar");
      },
    });
    await filho.exited;      // pai recebeu { pronto: true } e depois { resultado: 10, data: 1970-01-01T00:00:00.000Z }

A serialização por omissão é "advanced" (structured clone): a Date chegou como Date. Com serialization: "json" chegou como string, e é obrigatório para falar com um filho Node (exemplo 12: o Node 24.18.0 respondeu com o runtime dele). Com Bun a falar com Bun, process.execPath é o executável do próprio Bun.

## child_process e cluster no Windows

O node:child_process funcionou todo no exemplo 13: spawnSync, execSync, spawn com streams, execFile e exec promisificados e fork com IPC (o filho também correu no Bun). Um comando inexistente dá erro de PATH sem exceção em spawnSync. O node:cluster tem diferenças sérias entre sistemas:

| Cenário | Windows (1.4.0) |
|---|---|
| cluster.fork, mensagens primário e worker, kill | funciona (exemplo 14) |
| servidor net nos workers | partilhado pelo primário: 40 ligações repartidas 20 + 20 (14b) |
| servidor node:http nos workers | os dois escutam a mesma porta mas só um processo respondeu aos 40 pedidos (14) |
| Bun.serve com reusePort: true em dois processos | os dois arrancam sem erro, só um responde (15) |

Isto concorda com a documentação: os servidores http nos workers ligam cada um o seu socket e o balanceamento entre processos só é suportado no Linux (SO_REUSEPORT). No Windows, para repartir carga HTTP usa um processo à frente ou workers dentro de um só servidor. Não testei Linux nem macOS.

## AsyncLocalStorage

O AsyncLocalStorage guarda um contexto que acompanha o fluxo assíncrono, sem o passares por parâmetro: ideal para o id do pedido nos logs.

    const als = new AsyncLocalStorage<{ pedido: number; utilizador: string }>();
    await Promise.all([als.run({ pedido: 1, utilizador: "ana" }, servico), als.run({ pedido: 2, utilizador: "bruno" }, servico)]);

No exemplo 16 o contexto sobreviveu a await, Promise.all, setTimeout e queueMicrotask (cada linha de log mostrou o pedido certo, mesmo com os dois pedidos misturados), a getStore() fora do run devolveu undefined, enterWith ligou o contexto ao fluxo atual, exit correu sem contexto e AsyncLocalStorage.bind reteve o contexto para uma callback chamada depois. Dentro de um Bun.serve, com als.run no fetch, três pedidos em simultâneo (porta 35112) viram cada um o seu n.

## O event loop do Bun

A ordem de execução importa. O exemplo 17 mistura tudo e a saída no Bun 1.4.0 foi sempre esta (4 execuções iguais):

    1 síncrono (início)   2 async (parte síncrona)   3 síncrono (fim)
    4 process.nextTick    5 queueMicrotask   6 promise.then   7 async depois do await
    8 setImmediate        9 setTimeout 0     10 setTimeout 1

Dentro de um callback de I/O (fs.readFile) saiu: microtask, nextTick, setImmediate, setTimeout 0. Executei o mesmo ficheiro no Node 24.18.0 e há diferenças: no Node as microtasks (5, 6, 7) correm antes do nextTick (4) no módulo ESM, e no callback de I/O o nextTick precede a microtask; e, nessa execução, no Node o setTimeout 0 correu antes do setImmediate (no Node essa ordem não é garantida). **ATENÇÃO:** não escrevas código que dependa da ordem entre process.nextTick, microtasks e setImmediate: difere entre o Bun e o Node. Um ciclo de 200 mil microtasks seguidas (cada uma agenda a seguinte) adiou um setTimeout 0 até acabar: as microtasks esvaziam-se por completo antes de voltar aos timers.

## bun:ffi: chamar código nativo

O bun:ffi liga a bibliotecas partilhadas sem escreveres C. Usei só DLLs que existem em qualquer Windows: kernel32.dll e ucrtbase.dll (a extensão da plataforma vem em suffix, aqui dll).

    const k32 = dlopen("kernel32.dll", { GetCurrentProcessId: { args: [], returns: FFIType.u32 }, GetTickCount64: { args: [], returns: FFIType.u64 } });
    const crt = dlopen("ucrtbase.dll", {
      strlen: { args: [FFIType.ptr], returns: FFIType.u64 },
      qsort: { args: [FFIType.ptr, FFIType.u64, FFIType.u64, FFIType.function], returns: FFIType.void },
      getenv: { args: [FFIType.ptr], returns: FFIType.cstring },
    });
    crt.symbols.strlen(ptr(Buffer.from("loja da Ana\0")));   // 11n

Observei (exemplo 18): GetCurrentProcessId() === process.pid deu true; os tipos de 64 bits voltam como bigint (u64 dá 11n); os argumentos ponteiro levam ptr(buffer) e as strings C têm de terminar em NUL; com returns cstring o Bun devolveu logo uma string JavaScript (e null quando o getenv não encontra), com returns ptr devolveu um número que lês com new CString(endereco). O getenv da CRT só vê o ambiente com que o processo arrancou: uma variável criada com process.env depois deu null. Um JSCallback passa uma função JavaScript ao C: o qsort chamou o comparador e ordenou [42, 7, 19, 3, 88, 1] para [1, 3, 7, 19, 42, 88] (read.i32 lê os ponteiros). Uma DLL ou símbolo inexistente lança erro legível (error code 126; Symbol not found). **ATENÇÃO:** o FFI chama código nativo sem rede: um tipo errado ou um ponteiro inválido derruba o processo; fecha com close() e usa-o só quando não houver alternativa.

### bun:ffi com cc

Não há nenhum compilador de C instalado nesta máquina (gcc, cl, clang e tcc não existem no PATH), mas o cc de bun:ffi funcionou: traz o TinyCC embutido e compila C em tempo de execução.

    const { symbols, close } = cc({ source: "./cc/loja.c", symbols: { receita_cent: { args: ["ptr", "ptr", "i32"], returns: "i64" } } });
    symbols.receita_cent(ptr(q), ptr(p), q.length);   // 14500n, os 145,00 EUR da encomenda 12

Dois achados da 1.4.0 (exemplo 19): o TinyCC não encontrou stdint.h (include file not found), por isso o C usa int e long long; e o C compilado não foi mais rápido do que o JavaScript no mesmo cálculo (contar primos até 2 milhões: 342 ms em C e 371 ms em JavaScript, o TinyCC quase não otimiza e o motor tem JIT). O FFI compensa para aceder a bibliotecas do sistema, não para acelerar ciclos.

## WebAssembly à mão

O WebAssembly vem no motor, sem toolchain. O exemplo 20 monta, em bytes, um módulo com soma e fatorial (recursivo): cabeçalho 00 61 73 6d 01 00 00 00 e secções de tipos, funções, exportações e código; um ajudante calcula o tamanho de cada secção.

    WebAssembly.validate(bytes)  // true, 83 bytes
    soma(20, 22) = 42 | fatorial(10) = 3628800 | fatorial(13) = 1932053504 (overflow de i32)
    soma(2**31 - 1, 1) = -2147483648       (i32 dá a volta)
    fatorial(12) x 2 milhões: wasm 12 ms | js 34 ms (mediana de 5)

Também funcionam WebAssembly.compile, instantiate, o par Module e Instance síncrono, e Module.exports() descreve os tipos. Uns bytes errados dão CompileError com a posição (a minha primeira versão falhou no byte 21, porque somei mal o tamanho da secção). Na prática compilas Rust, C ou Zig para WASM e carregas o ficheiro; aqui o objetivo era perceber o formato.

## Memória, GC e bun:jsc

Exemplo 21. O process.memoryUsage() dá rss, heapTotal, heapUsed, external e arrayBuffers (rss de cerca de 19 MB num script vazio) e process.memoryUsage.rss() existe. O bun:jsc dá heapStats() (heapSize, heapCapacity, objectCount, ...) e memoryUsage(). Com 500 mil objetos o heapSize subiu de 0,2 para 25,7 MB (797 mil objetos); depois de largar a referência e chamar Bun.gc(true) (síncrono; Bun.gc(false) só pede a coleta e devolve um número) voltou a 0,2 MB. fullGC, edenGC e gcAndSweep também existem. Um WeakRef ficou vazio e o FinalizationRegistry disparou depois do GC. Uma cache Map sem limite de 300 mil entradas custou 28 MB de heap, mesmo depois do GC: é assim que nascem as fugas.

**NOTA:** o bun:jsc expõe internos do JavaScriptCore e não é uma API estável. No exemplo 22 funcionaram serialize e deserialize (structured clone para um buffer: devolveu um SharedArrayBuffer de 84 bytes), numberOfDFGCompiles (0 antes e 1 depois de 100 mil chamadas, o JIT a trabalhar), optimizeNextInvocation e profile. Também existe estimateShallowMemoryUsageOf (uma string de 1 MB deu 1000016 bytes; o array de 1000 objetos deu só 16: é superficial).

## Bun.Transpiler

O transpilador do próprio Bun, como API (exemplo 23). Tem só quatro métodos: transform (assíncrono), transformSync, scan e scanImports.

    const t = new Bun.Transpiler({ loader: "ts" });
    t.transformSync(fonte);      // remove interfaces e tipos, converte o enum, mantém os imports usados
    t.scanImports(fonte);        // [{ kind: "import-statement", path: "./validador.ts" }, ..., { kind: "dynamic-import", path: "./extra.ts" }]
    t.scan(fonte);               // { exports: ["Estado", "default", "total"], imports: [...] }

O import type desapareceu sem deixar rasto, a classe com private no construtor passou a ter o campo declarado, e o enum virou o ciclo Estado[Estado["Pendente"] = 0] = "Pendente". Com tsconfig: { compilerOptions: { jsx: "react", jsxFactory: "h" } } o loader tsx deu h("li", { key: 1 }, nome). Opções que usei: minifyWhitespace, define e trimUnusedImports (este último apagou o import que não era usado). Um erro de sintaxe lança AggregateError com Parse error.

## Plugins de runtime e preload

Um plugin muda a forma como o Bun resolve e carrega módulos, mesmo a correr com bun run. O detalhe dos plugins de build é do módulo 09. A pasta exemplos/plugins-runtime regista, num ficheiro de preload, um loader de .csv, um módulo virtual e um espaço de nomes próprio.

    # bunfig.toml
    preload = ["./registar.ts"]

    build.onLoad({ filter: /\.csv$/ }, async ({ path }) => ({ exports: { default: linhas }, loader: "object" }));
    build.module("loja:config", () => ({ exports: { NOME: "Papelaria do Bun", IVA: 0.23 }, loader: "object" }));
    build.onResolve({ filter: /.*/, namespace: "gerado" }, (a) => ({ path: a.path, namespace: "gerado" }));

    [preload] plugin registado
    Papelaria do Bun | colunas: [ "id", "nome", "preco" ] | relogio 1970-01-01
    1 Romance Policial: 12.9 -> 15.87 com IVA

O preload corre antes de tudo, em bun run e em bun test. O mesmo efeito vem da opção --preload na linha de comandos. Sem preload (sem o bunfig), o mesmo app.ts falhou com Cannot find package loja:config: **ATENÇÃO:** os imports estáticos correm antes de o plugin() existir, por isso ou usas preload ou registas o plugin e importas o módulo depois, com import() dinâmico (sem-preload.ts). Achado da 1.4.0: a documentação diz que o onResolve corre para qualquer import, incluindo pacotes e aliases como "@/utils", mas na 1.4.0 só o vi correr para caminhos relativos e absolutos e para especificadores com espaço de nomes (gerado:relogio). Um alias do tipo @loja/util não chegou ao onResolve: resolvi-o com compilerOptions.paths no tsconfig.json, que é nativo.

## Compatibilidade com o Node

O exemplo 24 importa cada módulo node:* e usa-o de forma mínima. Só marco como usado o que executou e devolveu o valor esperado; "importa" quer dizer que o import resultou e o símbolo principal existe, sem mais testes.

| Módulo | Estado na 1.4.0 | O que executei |
|---|---|---|
| fs, path, os, url, buffer, querystring | usado | escrever e ler ficheiro, join, plataforma e CPUs, fileURLToPath, base64, parse |
| crypto, zlib | usado | sha256 e randomUUID, gzip e gunzip de 1000 bytes (30 bytes comprimidos) |
| events, stream, util, readline | usado | once, pipeline de Readable para Writable, format, ler linhas de um Readable |
| http, net | usado | servidor e cliente em 127.0.0.1 (portas 35113 e 35114) |
| dns | usado | lookup de localhost (devolveu ::1) |
| child_process, worker_threads | usado | execFileSync, Worker com eval |
| perf_hooks, vm, assert, timers | usado | performance.mark, runInNewContext, deepEqual e AssertionError, timers/promises |
| string_decoder, async_hooks, tty, module | usado | decodificar UTF-8 em duas partes, AsyncLocalStorage, isatty, createRequire |
| sqlite, test, cluster, v8 | usado | existência dos símbolos principais (DatabaseSync, test) e getHeapStatistics |
| http2, https, tls, dgram, inspector, diagnostics_channel | só importa | typeof da função principal |

Todos os 35 módulos da lista importaram sem erro. A documentação classifica alguns como parciais: o cluster (ver acima), o worker_threads (ignora resourceLimits), o node:test (só dentro do bun test, sem mock.module nem cobertura) e o node:sea (não existe: usa bun build --compile). Para sinais de runtime, o exemplo 25 mostra o que um pacote Node costuma testar: process.versions.bun existe; process.version devolveu v26.3.0 e process.versions.node 26.3.0 (um número fingido para compatibilidade, não a versão do Node instalado); __dirname e __filename existem em ESM e require também; import.meta.main é true no ficheiro de entrada.

## Quando migrar um projeto Node para o Bun

Lista de verificação honesta, por ordem:

1. Corre bun install e compara o resultado. O Bun lê o package.json e escreve o bun.lock; apaga o package-lock.json só depois de tudo passar.
2. Procura dependências nativas (node-gyp, .node, N-API). Não testei nenhuma: confirma na documentação e executa uma a uma.
3. Substitui nos scripts: node por bun, ts-node e tsx por bun (o executor corre TypeScript direto), jest ou vitest por bun test se os testes forem simples (módulo 08).
4. Procura módulos node:* parciais na tabela de cima e a página de compatibilidade da documentação (cluster, worker_threads, inspector, v8, node:test).
5. Não dependas da ordem de nextTick, microtasks e setImmediate (ver o event loop) nem de process.version.
6. Atenção às diferenças de plataforma: no Windows o balanceamento de HTTP por cluster não funciona.
7. Mede antes e depois com os teus dados: o Bun não é sempre mais rápido (o ciclo em C e em JavaScript deu quase igual).
8. Faz a troca em passos: primeiro só o gestor de pacotes, depois o executor, por fim as APIs Bun.*. Mantém a CI a correr o Node em paralelo até estares seguro.
9. As funcionalidades recentes mudam depressa: a documentação descrevia a 1.4.5 e eu usei a 1.4.0; fixa a versão do Bun no CI.

## Caso da loja: o relatório de receita com Workers

A exemplos/loja-workers calcula a receita por categoria (com IVA de 23 por cento, 5 por cento de desconto a partir de 5 unidades, encomendas canceladas fora, valores em cêntimos inteiros) de duas formas. Primeiro as 25 linhas reais (lidas do loja.sql com bun:sqlite): Livros 216,23 EUR, Eletrónica 470,97 EUR e Casa 436,60 EUR, valores que confirmei com uma consulta SQL. Depois um conjunto sintético de 2 milhões de linhas, gerado com uma semente fixa, em arrays tipados sobre SharedArrayBuffer: os workers recebem os buffers uma vez e cada um soma o seu intervalo.

    bun loja-workers/relatorio.ts 2000000 4 200
    25 linhas: sequencial 86 microssegundos | só arrancar um worker 5.1 ms
    arranque do pool de 4 workers (criar + receber as colunas): 9 ms
      Livros      39748118,62 EUR
      Eletrónica  96810669,17 EUR
      Casa        79051659,19 EUR
    resultados iguais: true
    sequencial: 353 ms | 4 workers: 111 ms | ganho x3.18
    4 workers com cópia das fatias: 118 ms | ganho x3.00

Os resultados dos workers são idênticos aos do sequencial. O argumento final é o custo por linha (um ciclo que simula uma regra cara, sem mudar o resultado). Mediana de 5 execuções, 2 milhões de linhas, pool aquecido:

| Custo por linha | Sequencial | 4 workers (partilhado) | 4 workers (cópia) | 8 workers |
|---|---|---|---|---|
| 0 | 26 ms | 8 ms (x3,17) | 26 ms (x1,02) | não medido |
| 20 | 63 ms | 20 ms (x3,12) | 35 ms (x1,80) | não medido |
| 200 | 395 ms | 111 ms (x3,56) | 130 ms (x3,04) | 88 ms (x4,33) |
| 2000 | 3658 ms | 1033 ms (x3,54) | 1062 ms (x3,45) | não medido |

Conclusões: com poucas linhas (as 25 reais) o sequencial ganha por larga margem, porque só arrancar um worker custa milhares de vezes mais do que o cálculo. Com milhões de linhas os workers dão cerca de 3 a 4 vezes mais com 4 workers. Copiar as fatias (postMessage) só custa caro quando o trabalho por linha é pequeno; com a memória partilhada a cópia desaparece. Os ganhos de uma máquina partilhada variam de execução para execução: repete sempre e usa a mediana. Os valores em cêntimos inteiros evitam os erros de vírgula flutuante que o SQLite mostra com DECIMAL.

## Exercícios

**PRATICAR:** faz os exercícios 41 a 44 do módulo 13 (um worker com erros e close, um pool com SharedArrayBuffer e Atomics para a receita por categoria, cotações por IPC entre processos Bun e um módulo WebAssembly escrito à mão com o Bun.Transpiler). As soluções estão no módulo 15.

## Fontes oficiais

- [Bun: Workers](https://bun.sh/docs/runtime/workers)
- [Bun: Spawn e IPC](https://bun.sh/docs/api/spawn)
- [Bun: FFI](https://bun.sh/docs/runtime/ffi)
- [Bun: compilador de C](https://bun.sh/docs/runtime/c-compiler)
- [Bun: Transpiler](https://bun.sh/docs/runtime/transpiler)
- [Bun: plugins](https://bun.sh/docs/runtime/plugins)
- [Bun: bunfig.toml](https://bun.sh/docs/runtime/bunfig)
- [Bun: compatibilidade com o Node.js](https://bun.sh/docs/runtime/nodejs-compat)
- [MDN: WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly)
- [MDN: Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- [Node.js: AsyncLocalStorage](https://nodejs.org/api/async_context.html)
- [Node.js: o event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Node.js: worker_threads](https://nodejs.org/api/worker_threads.html)
- [Node.js: cluster](https://nodejs.org/api/cluster.html)
- [WebAssembly: formato binário](https://webassembly.github.io/spec/core/binary/index.html)
