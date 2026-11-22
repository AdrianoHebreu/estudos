# 02 Ficheiros e sistema

Neste módulo aprendes tudo o que o Bun traz para falar com o disco e com o sistema operativo: ler e escrever ficheiros, ler o teclado e os pipes, procurar ficheiros com padrões, correr comandos externos e perguntar ao sistema onde estás. Sem uma única biblioteca do npm. Todas as saídas foram obtidas com o Bun 1.4.0 no Windows 11 (Git Bash); onde o comportamento é do Windows ou parece um defeito desta versão, digo-o. A documentação oficial que consultei já mostra a versão 1.4.5, por isso confirma lá se algo mudou.

## O que substitui

| Biblioteca ou hábito do npm | Funcionalidade nativa |
|---|---|
| fs.readFile e fs.writeFile | Bun.file() e Bun.write() |
| fs.createWriteStream | file.writer() (FileSink) |
| glob, fast-glob, globby | Bun.Glob |
| execa, shelljs, zx | Bun.$ (shell nativo) |
| child_process.spawn | Bun.spawn e Bun.spawnSync |
| which, sleep, cross-env, rimraf | Bun.which, Bun.sleep, Bun.$ com env, rm embutido |
| mime-types | a propriedade type de Bun.file() |

**NOTA:** o Bun também traz node:fs, node:fs/promises, node:path, node:os e node:url, por isso o código que já tens continua a funcionar. As APIs Bun.* são mais curtas; as node:* cobrem o que as primeiras não fazem (pastas, stat, watch).

## Bun.file: ler ficheiros

Bun.file(caminho) devolve um BunFile: uma referência preguiçosa, que não abre nada até leres. É um Blob, por isso herda text(), arrayBuffer(), bytes(), stream() e slice(), e acrescenta json(), exists() e writer().

    const LOJA = import.meta.dir + "/../../00-Introducao/dados/loja.sql";
    const ficheiro = Bun.file(LOJA);

    console.log("size:", ficheiro.size, "bytes");            // 7665 bytes
    console.log("type:", ficheiro.type);                     // application/x-sql
    console.log("instanceof Blob:", ficheiro instanceof Blob); // true
    const texto = await ficheiro.text();                      // 104 linhas
    const bytes = await ficheiro.bytes();                     // Uint8Array de 7665
    console.log(JSON.stringify(await ficheiro.slice(0, 30).text()));
    // "CREATE TABLE categorias (\n    "

| Método ou propriedade | O que devolve |
|---|---|
| text() | o conteúdo como string UTF-8 |
| json() | o conteúdo interpretado como JSON |
| bytes() e arrayBuffer() | Uint8Array e ArrayBuffer |
| stream() | ReadableStream, para ficheiros grandes |
| slice(inicio, fim) | um BunFile só com esse intervalo, sem ler o resto |
| exists() | Promise com true ou false |
| size e lastModified | tamanho em bytes e data em milissegundos |
| type | tipo MIME deduzido da extensão |

O tipo MIME vem da extensão. Medi: .json dá application/json;charset=utf-8, .csv dá text/csv, .png dá image/png, .sql dá application/x-sql e uma extensão desconhecida dá chemical/x-xyz. Um ficheiro .ts dá text/javascript;charset=utf-8. Podes forçar o tipo: Bun.file("x.txt", { type: "text/markdown" }).

Ler um ficheiro que não existe só falha na leitura, não ao criar a referência:

    const falta = Bun.file(import.meta.dir + "/nao-existe.txt");
    console.log("exists:", await falta.exists(), "| size:", falta.size);  // false e 0
    try { await falta.text(); } catch (e: any) { console.log(e.code); }  // ENOENT

**ATENÇÃO:** o size e o lastModified ficam em cache na referência. Escrevi um ficheiro, li ref.size (4 bytes), apaguei-o com ref.delete() e a mesma referência continuou a dizer exists() igual a true, enquanto uma Bun.file nova dizia false. Para ver o estado atual, cria outra referência. Exemplo completo em exemplos/01-bun-file.ts.

## Bun.write: escrever quase tudo

Bun.write(destino, dados) aceita string, Blob, Response, ArrayBuffer, Uint8Array ou outro BunFile, cria as pastas que faltarem e devolve uma Promise com o número de bytes escritos.

    await Bun.write(pasta + "/texto.txt", "Olá, loja!\n");                  // 12 bytes
    await Bun.write(pasta + "/bytes.bin", new Uint8Array([72, 105, 33]));    // 3 bytes
    await Bun.write(pasta + "/blob.txt", new Blob(["dentro de um Blob"]));   // 17 bytes
    await Bun.write(pasta + "/resposta.txt", new Response("corpo de uma Response")); // 21
    await Bun.write(pasta + "/copia.sql", Bun.file(LOJA));                   // copiar!

Copiar um ficheiro é escrever um BunFile noutro caminho. Escrever sobre um ficheiro que já existe substitui-o por inteiro. Podes também escrever para Bun.stdout e Bun.stderr.

**ATENÇÃO:** duas coisas que medi nesta versão, no Windows. Primeiro, quando a origem é um BunFile, Bun.write devolveu 0 em vez dos bytes copiados (o ficheiro ficou certo, com 7665 bytes). Segundo, copiar Bun.file(LOJA).slice(0, 10) copiou o ficheiro todo (7665 bytes) em vez de 10. Se precisas de um pedaço, lê-o primeiro e escreve o resultado: Bun.write(destino, await ficheiro.slice(0, 10).arrayBuffer()) deu os 10 bytes certos.

## Escrita incremental: file.writer()

Para escrever aos poucos (um log, um CSV de milhares de linhas) usa file.writer(), que devolve um FileSink com um buffer interno. write() acrescenta ao buffer, flush() manda-o para o disco e end() descarrega e fecha.

    const escritor = Bun.file(caminho).writer({ highWaterMark: 1024 });
    for (let i = 1; i <= 5; i++) escritor.write(`linha ${i}\n`);
    console.log(await escritor.flush());   // 32
    escritor.write("última linha\n");
    await escritor.end();

    tipo: FileSink
    write(1) devolveu 8
    write(2) devolveu Promise { <pending> }
    flush devolveu 32 | no disco: 40 bytes

O buffer descarrega sozinho quando chega ao highWaterMark. O valor devolvido por write() foi um número na primeira chamada e uma Promise nas seguintes: não dependas dele, usa flush() e end().

**ATENÇÃO:** o writer não apaga o conteúdo antigo. Num ficheiro com "AAAAAAAAAAAAAAAA" escrevi "curto" e o resultado foi "curto" seguido do resto dos A. Para começar de novo, esvazia primeiro com Bun.write(caminho, ""). Para acrescentar ao fim de um log, usa appendFile do node:fs/promises.

## Stdin, stdout e stderr

Bun.stdin, Bun.stdout e Bun.stderr são BunFile como os outros: lês e escreves com os mesmos métodos. Para ler linha a linha, o Bun deixa-te iterar o próprio console:

    let n = 0, soma = 0;
    for await (const linha of console) {
      const texto = linha.trim();
      if (texto === "") continue;
      n++;
      const preco = Number(texto.split(";")[1]);
      if (Number.isNaN(preco)) { console.error(`ignorada: ${texto}`); continue; }
      soma += preco;
      await Bun.write(Bun.stdout, `ok ${texto}\n`);
    }
    console.log(`linhas: ${n}, soma: ${soma.toFixed(2)}`);

Com um pipe a alimentar o programa (printf com cinco linhas, uma vazia e uma inválida):

    ok Romance Policial;12.90
    ok Carregador USB-C;14.90
    linha 3 ignorada (preço inválido): lixo;abc
    ok Caneca;6.50
    linhas: 4, soma dos preços: 34.30

Se redirecionares o stderr (2 maior que, ficheiro), as mensagens de erro vão para o ficheiro e o resto continua no terminal. Para ler tudo de uma vez usa await Bun.stdin.text(); com o stdin vazio devolve uma string vazia.

## Bun.Glob: procurar ficheiros por padrão

new Bun.Glob(padrao) tem scan() (ficheiros reais, assíncrono), scanSync() e match() (compara só texto). As opções de scan são cwd, dot, absolute, onlyFiles e followSymlinks. Numa árvore temporária com loja.sql, dados/clientes.sql, dados/produtos.sql, dados/.oculto.sql, src/main.ts e outros:

    new Bun.Glob("*.sql")         // loja.sql
    new Bun.Glob("**/*.sql")      // dados/clientes.sql  dados/produtos.sql  loja.sql
    // com { dot: true } aparece também dados/.oculto.sql
    new Bun.Glob("src/**/*.ts")   // src/api/rotas.ts  src/api/util.ts  src/main.ts
    new Bun.Glob("{src,dados}/*.*")  // chavetas: alternativas
    new Bun.Glob("dados/[cp]*.sql")  // clientes.sql e produtos.sql

    const g = new Bun.Glob("**/*.{ts,tsx}");
    g.match("src/ui/App.tsx");   // true
    g.match("src/main.js");      // false

Os ficheiros com nome a começar por ponto só aparecem com dot: true. Com onlyFiles: false o padrão estrela também devolve as pastas (dados, src, vazia).

**ATENÇÃO:** no Windows o scan devolve caminhos com barra invertida (dados, barra, clientes.sql), mas o match() só reconhece barras normais: g.match com a barra invertida deu false e com a normal deu true. Normaliza com replaceAll antes de comparar.

## node:fs, node:path e caminhos no Windows

O Bun não tem equivalente nativo para listar pastas, criar pastas ou vigiar alterações, e não precisa: os módulos node:fs e node:fs/promises vêm com ele.

| Tarefa | O que usar |
|---|---|
| ler ou escrever o conteúdo de um ficheiro | Bun.file e Bun.write |
| acrescentar ao fim | appendFile |
| listar uma pasta | readdir (com withFileTypes ou recursive) |
| criar pastas | mkdir com recursive: true |
| apagar ficheiros e pastas | rm com recursive e force |
| tamanho, tipo e datas | stat (ou file.stat()) |
| mudar o nome ou mover | rename |
| vigiar alterações | watch (async iterator) |

    await mkdir(path.join(base, "a/b/c"), { recursive: true });
    await readdir(base, { recursive: true });   // [ "a", "a\\b", "a\\b\\c", "a\\ficheiro.txt" ]
    await appendFile(log, "linha 2\n");
    for await (const ev of watch(base, { signal: ac.signal })) { /* rename:novo.txt, change:novo.txt */ }

No watch, escrever um ficheiro novo gerou dois eventos: rename (criado) e change (conteúdo escrito). Pára o watch com um AbortController, senão o programa nunca termina.

Os caminhos no Windows têm duas armadilhas. A barra invertida é o separador de path.sep (e o delimitador do PATH é o ponto e vírgula), mas o Windows aceita também a barra normal. Usa barras normais no código e path.join, path.resolve e path.relative para construir e comparar caminhos. Se precisas de um formato fixo, path.posix.join dá dados/loja.sql e path.win32.join dá dados com barra invertida e loja.sql.

    import.meta.dir      // pasta do ficheiro atual
    import.meta.file     // 06-node-fs-path.ts
    import.meta.path     // caminho completo
    Bun.pathToFileURL("C:/temp/loja.sql").href   // file:///C:/temp/loja.sql
    Bun.fileURLToPath("file:///C:/temp/loja.sql")  // caminho do Windows, com C: e barras invertidas
    pathToFileURL("C:/temp/minha loja.sql").href   // file:///C:/temp/minha%20loja.sql

**DICA:** usa import.meta.dir (e não process.cwd()) para localizar ficheiros ao lado do script: o cwd depende de onde corres o comando.

## Bun.$: o shell nativo

Bun.$ corre comandos num shell implementado pelo próprio Bun, igual no Windows, Linux e macOS. Não precisas de bash nem de PowerShell. Cada valor que interpolas com a sintaxe dolar e chavetas é um único argumento, escapado automaticamente.

    import { $ } from "bun";
    await $`cat ${sql}`.text();                       // texto
    await $`echo ${'{"produto": "Caneca"}'}`.json();  // objeto
    for await (const l of $`cat ${sql}`.lines()) { }  // linha a linha
    const perigoso = "loja.sql; echo PERIGO";
    await $`echo ${perigoso}`.text();                 // "loja.sql; echo PERIGO\n"

O texto perigoso foi tratado como um só argumento: o echo escreveu-o inteiro e não executou nada. O $.escape mostra o escape: $.escape(perigoso) deu "loja.sql; echo PERIGO", entre aspas.

Redirecionamentos e pipes funcionam como no bash:

    await $`cat ${sql} > ${pasta}/copia.sql`;
    await $`echo "-- fim" >> ${pasta}/copia.sql`;
    await $`echo a b c | cat`.text();                 // "a b c\n"
    await $`false || echo plano B`.text();            // plano B
    await $`echo $PRODUTO`.env({ PRODUTO: "Teclado Mecânico" }).text();
    await $`pwd`.cwd(pasta).text();

Podes redirecionar de e para objetos JavaScript: Buffer, Response e Bun.file (confirmei os três).

**ATENÇÃO:** no Windows, cwd() quer um caminho do Windows (C:/temp). Com /c/temp, o Bun lançou ENOENT.

| Opção | Efeito |
|---|---|
| .quiet() | não imprime a saída no terminal |
| .nothrow() | não lança erro com código de saída diferente de zero |
| .text(), .json(), .lines(), .blob() | lê o resultado nesse formato |
| .env({...}) e .cwd(caminho) | ambiente e pasta do comando |

Por omissão, um comando que falha lança um ShellError e imprime o stderr. Com nothrow() inspecionas tu o resultado:

    try { await $`ls ${pasta}/nao-existe`.quiet(); }
    catch (e: any) { console.log(e.constructor.name, e.exitCode, e.stderr.toString()); }
    // ShellError 1 ls: <pasta>/nao-existe: No such file or directory
    const r = await $`ls ${pasta}/nao-existe`.nothrow().quiet();
    console.log(r.exitCode, r.stdout.length === 0);   // 1 true

Os comandos embutidos, que funcionam em qualquer sistema porque são do Bun, são: cd, ls, rm, echo, pwd, bun, cat, touch, mkdir, which, mv, exit, true, false, yes, seq, dirname e basename. Esta é a lista da documentação. Para provar que são embutidos, corri com o PATH vazio ls, cat, echo, mkdir, rm, cp, mv, touch, pwd, seq, dirname, basename, true, false, exit, cd e bun, e todos funcionaram. O which e o yes não os validei como embutidos (o yes nunca acaba: um teste meu com yes e a opção de ajuda acabou em falta de memória). Já wc, grep, head, sort, find, sed e date deram bun: command not found: wc. Em Windows com Git instalado, o wc e o grep funcionam no PATH normal, mas só porque o Git os trouxe: num Windows sem Git, o teu script falha.

**ATENÇÃO:** no Windows, com o Bun 1.4.0, texto com acentos escrito diretamente no template literal sai estragado: echo olá imprimiu olu00E1. O mesmo texto passado por interpolação, echo com o valor olá entre chavetas, imprimiu olá. Passa sempre o texto acentuado como variável.

## Bun.spawn e Bun.spawnSync

Quando precisas de controlo fino (stdin, kill, pid, timeout), usa Bun.spawn(["comando", ...argumentos]). Os argumentos vão numa lista: não há shell nem escapes. Bun.spawnSync espera e devolve tudo de uma vez.

    const s = Bun.spawnSync(["bun", "-e", "console.log('saída'); console.error('aviso'); process.exit(3)"]);
    // exitCode 3, success false, stdout "saída\n", stderr "aviso\n"

    const filtro = Bun.spawn(["bun", "-e", "const t = await Bun.stdin.text(); console.log(t.toUpperCase().trim())"],
                             { stdin: "pipe", stdout: "pipe" });
    filtro.stdin.write("romance policial\n");
    filtro.stdin.end();
    await filtro.stdout.text();   // "ROMANCE POLICIAL"
    await filtro.exited;          // 0

O objeto devolvido tem pid, stdin, stdout e stderr (streams), exited (Promise com o código), exitCode, signalCode, killed e kill(). Sem stdout: "pipe" não podes ler a saída; com stdout: "inherit" ela vai direta para o terminal. As opções cwd, env, timeout, signal (AbortSignal) e onExit também funcionam: com cwd "C:/temp" o processo viu essa pasta como diretório atual; com timeout de 500 ms o processo foi morto (exitCode null, signalCode SIGTERM).

    const longo = Bun.spawn(["bun", "-e", "setTimeout(() => {}, 60000)"]);
    longo.kill();
    await longo.exited;   // 143, signalCode SIGTERM, killed true

Um executável que não existe lança logo no spawn: ENOENT, Executable not found in $PATH.

| Preciso de | Usa |
|---|---|
| um comando curto, texto, pipes e redirecionamentos | Bun.$ |
| comandos que têm de funcionar em qualquer sistema | Bun.$ (embutidos) |
| enviar dados ao stdin, ler em fluxo, pid, kill, timeout | Bun.spawn |
| esperar bloqueando o programa | Bun.spawnSync |

**ATENÇÃO:** só termines processos que tu lançaste, pelo objeto devolvido (proc.kill()) ou pelo pid que guardaste. Nunca por nome (taskkill de bun.exe, pkill): matas também os processos dos teus colegas, do editor e de outros programas Bun.

## Bun.which, sleep, process e node:os

    Bun.which("bun");                  // caminho do executável (aqui termina em bin/bun.exe)
    Bun.which("comando-xyz");          // null
    Bun.which("bun", { PATH: "" });    // null
    await Bun.sleep(200);              // espera sem bloquear (aceita ms ou um Date)
    Bun.sleepSync(100);                // bloqueia tudo
    process.platform                   // win32
    process.cwd()                      // pasta de onde correste o comando
    os.type()                          // Windows_NT
    os.EOL === "\r\n"                  // true no Windows
    os.availableParallelism()          // 8 nesta máquina

Também medi Bun.version (1.4.0), Bun.main (o ficheiro de entrada), Bun.env (é o mesmo objeto que process.env) e os.tmpdir(), os.homedir() e os.totalmem(). O resultado de platform decide o comando certo: no exemplo, em win32 corri cmd com /c e echo, nos outros sistemas apenas echo.

**NOTA:** Bun.sleepSync bloqueia o event loop inteiro (nenhum timer, nenhum pedido corre). Usa-o só em scripts simples.

## A loja: exportar produtos para CSV e JSON

O ficheiro loja.sql guarda cada produto numa linha INSERT. Lemos o ficheiro com Bun.file, extraímos os produtos com uma expressão regular, escrevemos o JSON com Bun.write e o CSV com um FileSink (ponto e vírgula e vírgula decimal, que o Excel português abre bem).

    const linha = /INSERT INTO produtos \([^)]*\) VALUES \((\d+), '([^']*)', (\d+), ([\d.]+), (\d+)\);/g;
    const produtos = [...sql.matchAll(linha)].map(m => ({ id: Number(m[1]), nome: m[2],
      categoriaId: Number(m[3]), preco: Number(m[4]), stock: Number(m[5]) }));
    await Bun.write(join(pasta, "produtos.json"), JSON.stringify(produtos, null, 2));
    const csv = Bun.file(join(pasta, "produtos.csv")).writer();
    csv.write("id;nome;categoria_id;preco;stock\n");
    for (const p of produtos) csv.write(`${p.id};${p.nome};${p.categoriaId};${p.preco.toFixed(2).replace(".", ",")};${p.stock}\n`);
    await csv.end();

    produtos lidos: 10
    produtos.json: 1120 bytes
    produtos.csv : 344 bytes, 11 linhas
    1;Romance Policial;1;12,90;40
    valor total em stock: 7304.60 euros
    sem stock: [ 'Teclado Mecânico' ]

O valor em stock (preço vezes stock, somado) dá 7304,60 euros. Um programa à parte procura os ficheiros .sql com Glob, conta tabelas e inserts e chama um comando externo se existir:

    dados/loja.sql: 7665 bytes, 5 tabelas, 59 inserts
    git encontrado: git version 2.38.1.windows.1
    git com opção inválida -> exitCode: 129 | stderr: unknown option: --no-such-flag

As contas batem com o modelo da loja: 3 + 8 + 10 + 12 + 26 inserts dão 59, em 5 tabelas. Os exemplos completos estão em exemplos/10-exportar-produtos.ts e exemplos/11-procurar-sql.ts.

## Exercícios

**PRATICAR:** faz os exercícios 5 a 8 do módulo 13 (Exercícios), que consolidam este módulo: contar os inserts por tabela, fazer um backup com Glob, escrever um mini-script com Bun.$ e orquestrar um processo filho com Bun.spawn.

## Fontes oficiais

- File I/O: https://bun.sh/docs/runtime/file-io
- Shell: https://bun.sh/docs/runtime/shell
- Spawn: https://bun.sh/docs/runtime/child-process
- Glob: https://bun.sh/docs/api/glob
- Utilitários (sleep, which, pathToFileURL): https://bun.sh/docs/runtime/utils
- Compatibilidade com o Node: https://bun.sh/docs/runtime/nodejs-compat
