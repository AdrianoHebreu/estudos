# 01 Runtime e TypeScript

Neste módulo aprendes a correr código com o Bun: ficheiros e scripts do package.json, TypeScript, TSX, ESM e CommonJS sem compilar nada, as variáveis de ambiente e os ficheiros .env, a configuração (tsconfig.json e bunfig.toml), os argumentos e os códigos de saída, e como depurar. Tudo o que vês foi executado com o Bun 1.4.0 no Windows 11 (Git Bash). Os ficheiros estão na pasta exemplos/.

**NOTA:** a documentação em bun.com/docs já descreve funcionalidades que o 1.4.0 instalado não tem. Testei duas: bun check (verificação de tipos nativa) dá error: Script not found "check", e import.meta.glob dá TypeError: import.meta.glob is not a function. Por isso não as uso; confirma na documentação se a tua versão já as traz (bun --version e bun upgrade).

## O que substitui

| Biblioteca ou ferramenta npm habitual | O que o Bun já traz |
|---|---|
| ts-node, tsx, babel para executar TypeScript | bun run ficheiro.ts, sem passo de compilação |
| nodemon, ts-node-dev | bun --watch (reinício) e bun --hot (recarga a quente) |
| dotenv, cross-env | carregamento automático de .env e Bun.env |
| tsconfig-paths | paths do tsconfig.json respeitados em execução |
| js-yaml, toml | importar .yaml e .toml como módulos; Bun.YAML e Bun.TOML |
| raw-loader (importar texto) | importar .txt como string |

## bun run: ficheiros e scripts

bun run executa um ficheiro (.ts, .tsx, .js, .jsx, .mjs, .cjs) ou um script do package.json. A forma curta bun ficheiro.ts faz o mesmo.

    bun run 01-ola.ts            (ou só: bun 01-ola.ts)
    Romance Policial custa 12.90 EUR
    Bun 1.4.0 | revisão 34cbb9a40
    typeof Bun: object | typeof process: object

O ficheiro tem uma interface TypeScript e funciona logo: sem tsc, sem dist/, sem configuração. Os scripts vivem no package.json (exemplos/package.json).

    {
        "scripts": {
            "ola": "bun run 01-ola.ts",
            "predobro": "echo [pre] a preparar",
            "dobro": "echo [dobro] a executar",
            "postdobro": "echo [post] a limpar"
        }
    }

    bun run dobro
    $ echo [pre] a preparar
    [pre] a preparar
    $ echo [dobro] a executar
    [dobro] a executar
    (e o mesmo para o post)

O Bun imprime cada comando antes de o correr (precedido de $); bun run --silent esconde essa linha. Os scripts com prefixo pre e post correm antes e depois, como no npm. Um script inexistente dá error: Script not found e código 1; um ficheiro inexistente dá error: Module not found, também código 1; com --if-present o Bun sai com 0 sem queixas.

No Windows, os scripts do package.json correm no shell embutido do Bun (segundo a documentação), por isso $NODE_ENV funciona sem cross-env: bun run ambiente com NODE_ENV=production mostrou NODE_ENV=production. Com --shell=system forças o shell do sistema.

**DICA:** bun run sem argumentos imprime a ajuda e, no fim, a lista dos scripts do package.json.

## --watch e --hot

Os dois recarregam o programa quando um ficheiro importado muda, mas de maneira diferente: --watch reinicia o processo (um processo novo, estado perdido); --hot recarrega o código dentro do mesmo processo, sem o reiniciar. Para o ver, o exemplo 03-recarga.ts guarda um contador em globalThis e escreve o PID.

    const g = globalThis as any;
    g.recargas = (g.recargas ?? 0) + 1;
    const MENSAGEM = "versao A";
    console.log(`[${MENSAGEM}] pid=${process.pid} recargas=${g.recargas}`);

Corri-o duas vezes, editando MENSAGEM de A para B e C a cada 2,5 segundos.

    bun --watch 03-recarga.ts
    [versao A] pid=8164 recargas=1
    [versao B] pid=29276 recargas=1
    [versao C] pid=32616 recargas=1

    bun --hot 03-recarga.ts
    [versao A] pid=24140 recargas=1
    [versao B] pid=24140 recargas=2
    [versao C] pid=24140 recargas=3

| Aspeto | --watch | --hot |
|---|---|---|
| O que faz | mata e volta a lançar o processo | volta a avaliar os módulos no mesmo processo |
| PID | muda em cada alteração | mantém-se |
| Estado em globalThis | perde-se | mantém-se |
| Serve bem para | scripts, CLIs, testes | servidores HTTP (módulo 03) |

Os dois aceitam --no-clear-screen. O --watch também funciona com bun test e bun build (módulos 08 e 09).

**ATENÇÃO:** com --hot o código de topo corre outra vez e o estado que guardaste fora dele sobrevive: sem cuidado, abres duas vezes o mesmo recurso. Por isso o contador acima usa ??= e não uma atribuição simples.

## TypeScript sem compilar, e o que o Bun não faz

O Bun transpila TypeScript, não o verifica. O exemplo 02-sem-verificacao.ts tem um erro de tipos óbvio e corre na mesma.

    const preco: number = "doze euros e noventa";
    const stock: number = preco * 2;
    console.log("preco =", preco, "| stock =", stock);

    bun run 02-sem-verificacao.ts
    preco = doze euros e noventa | stock = NaN
    typeof preco: string

Código de saída 0. O tsc (o compilador oficial) diria Type 'string' is not assignable to type 'number' e falharia; o Bun apenas apaga as anotações. Não instalei o typescript: para verificar tipos usas o tsc à parte (tsc --noEmit num script do package.json) ou o teu editor, que corre a sua própria cópia. Para o editor reconhecer o global Bun e os módulos bun:*, a documentação manda instalar o pacote @types/bun (não o instalei; ver módulo 10).

**ATENÇÃO:** como o Bun não verifica tipos, a integração contínua tem de correr o tsc (ou, nas versões que o tiverem, bun check).

Comparação medida: o Node 24.18 também executou este mesmo ficheiro (apaga os tipos, sem os verificar). A diferença está no resto: o Node falhou com SyntaxError no ficheiro .tsx abaixo, e falhou com os imports de .toml, .yaml e aliases mais adiante.

## TSX e JSX

JSX funciona em .tsx e .jsx sem Babel. Por omissão (jsx automático) o Bun gera imports de react/jsx-dev-runtime, que exige o pacote react. Como o curso não usa npm, o exemplo 05-jsx.tsx diz ao Bun para usar a nossa função h, no tsconfig.json:

    {
        "compilerOptions": {
            "jsx": "react",
            "jsxFactory": "h",
            "jsxFragmentFactory": "Fragment"
        }
    }

    // 05-jsx.tsx (excerto)
    const Produto = ({ nome, preco }: { nome: string; preco: number }) => (
        <li class="produto">{nome}: {preco.toFixed(2)} EUR</li>
    );

    bun run 05-jsx.tsx
    <ul><li class="produto">Romance Policial: 12.90 EUR</li><li class="produto">Caneca de Cerâmica: 6.50 EUR</li></ul>

O ficheiro define h (cria os nós) e html (serializa). Sem o tsconfig.json, o mesmo ficheiro falha com error: Cannot find module 'react/jsx-dev-runtime', que é o que confirma o runtime automático. Podes passar as opções por flag (--jsx-runtime=classic --jsx-factory=h) ou no bunfig.toml.

**ATENÇÃO:** com o jsx automático e o auto-install ativo (por omissão, sem node_modules), o Bun pode resolver o react sozinho a partir da rede. Numa das minhas experiências foi o que aconteceu, e o resultado foi um erro estranho. Define o jsx no tsconfig.json antes de correr; --no-install impede a instalação automática.

## ESM e CommonJS no mesmo programa

O Bun aceita import e require em qualquer ficheiro, e importa CommonJS a partir de ESM e vice-versa. O exemplo 04-esm-e-cjs.ts mistura três tipos de módulo: um .ts (ESM), um .cjs (CommonJS) e um .mjs (ESM explícito).

    import { comIva, IVA } from "./modulos/moeda.cjs";
    import etiqueta, { formatar } from "./modulos/formato.mjs";

    const moeda = require("./modulos/moeda.cjs");      // require num ficheiro ESM
    const dados = await Promise.resolve({ categorias: 3 });   // top-level await

    bun run 04-esm-e-cjs.ts
    [moeda.cjs] __filename: moeda.cjs
    IVA: 0.23 | 12,90 com IVA: 15,87 EUR
    Atlas Mundial -> 29,99 EUR
    require em ESM: true
    top-level await: { categorias: 3 }
    typeof require: function | typeof module: undefined | typeof __dirname: string

A reter: o top-level await funciona sem função async; require e __dirname existem num ficheiro ESM, mas o objeto module deu undefined; e o Node 24.18, com o mesmo ficheiro, devolveu ReferenceError: Cannot determine intended module format because both 'require' and top-level await are present.

## Importar JSON, TOML, texto e YAML

O Bun trata estes ficheiros como módulos, escolhendo o carregador pela extensão (exemplo 06-importar-dados.ts).

    import categorias from "./dados/categorias.json";
    import config, { envio } from "./dados/loja.toml";
    import aviso from "./dados/aviso.txt";
    import definicoes from "./dados/loja.yaml";

    JSON : Livros, Eletrónica, Casa
    TOML : Loja Estudo | envio grátis acima de 50 EUR | CTT/DPD
    TOML horário: seg-sex 09:00; sab 10:00
    texto: 59 caracteres | começa por: Entregas gratuitas acima de 50...
    YAML : { nome: "Loja Estudo", iva: 0.23, categorias: [ "Livros", "Eletrónica" ] }

O TOML suporta import nomeado de chaves de topo (envio) e o objeto inteiro como default. O YAML funciona no 1.4.0 (executado): importas .yaml ou .yml diretamente e há também Bun.YAML.parse para texto em memória, tal como Bun.TOML.parse. O atributo with { type: "json" } é opcional para estas extensões, mas serve para forçar um carregador num ficheiro com outra extensão (a documentação mostra with { type: "yaml" } num .txt). Um ficheiro de extensão desconhecida, como .tpl, devolve o caminho do ficheiro como string, a menos que o bunfig.toml lhe atribua um carregador (secção abaixo).

## tsconfig.json e aliases de importação

O Bun lê o tsconfig.json do projeto para os campos que afetam a execução: paths, jsx e opções semelhantes (o resto é para o tsc). Com paths evitas caminhos como ../../lib/preco.ts. O exemplo 07-aliases.ts usa três aliases.

    "paths": {
        "@loja/*": ["./src/lib/*"],
        "@dados": ["./src/catalogo/index.ts"]
    }

    import { comIva } from "@loja/preco";          // paths do tsconfig.json
    import { produtos } from "@dados";             // paths para um ficheiro concreto
    import { comIva as mesmaFuncao } from "#preco"; // campo imports do package.json

    Romance Policial      12.90 ->  15.87
    Teclado Mecânico      79.00 ->  97.17
    Caneca de Cerâmica     6.50 ->   8.00
    #preco e @loja/preco são a mesma função: true
    resolvido para: src/lib/preco.ts

O alias #preco vem do campo imports do package.json (padrão do Node: o nome começa por #). Copiado o mesmo código para uma pasta sem tsconfig.json, o resultado foi error: Cannot find module '@loja/preco': os aliases de paths dependem do tsconfig.json. Escrevi os caminhos com ./ e sem baseUrl, porque a documentação do Bun diz que o TypeScript 6 e 7 removeram o baseUrl; no 1.4.0 funcionou.

## bunfig.toml

O bunfig.toml guarda só o que é específico do Bun (o resto vive no package.json e no tsconfig.json). Chaves que executei (exemplos/bunfig/):

    preload = ["./preload.ts"]

    [define]
    "process.env.LOJA_VERSAO" = "'2026.1'"

    [loader]
    ".tpl" = "text"

    [console]
    depth = 4

    [env]
    file = false

    cd bunfig
    bun run bunfig-demo.ts
    [preload] corre antes do ficheiro principal
    global do preload : Loja Estudo
    define            : 2026.1
    loader .tpl       : Olá, {{cliente}}! A tua encomenda ...

preload corre ficheiros antes do principal (flag: --preload ou -r), define substitui expressões por constantes, loader liga uma extensão a um carregador, console.depth fixa a profundidade do console.log (com 4 viste cinco níveis; por omissão são 2) e env com file = false desliga o carregamento de .env (o que passares em --env-file continua a ser lido). A documentação lista também jsx, smol, logLevel e telemetry, que não testei.

O bunfig.toml é lido do diretório atual, não do diretório do ficheiro: bun run bunfig/bunfig-demo.ts, a partir de exemplos/, não aplicou nada (global undefined, define undefined, e o .tpl devolveu um caminho). As secções [test], [install] e [serve] ficam para os módulos 08, 10 e 03.

## Variáveis de ambiente e .env

O Bun lê os ficheiros .env sozinho, antes de o teu código correr: não há dotenv. Pela documentação, a ordem de precedência (do menos para o mais forte) é:

1. .env
2. .env.development, .env.production ou .env.test (conforme o NODE_ENV)
3. .env.local (não é lido quando NODE_ENV=test)
4. .env.development.local, .env.production.local, .env.test.local
5. e, acima de tudo, as variáveis já definidas no shell

Executei-o. O exemplo env/criar-env.ts cria os ficheiros (o .gitignore do repositório ignora .env*, por isso não vão no Git), cada variável ORIGEM_x está em vários ficheiros, e env/precedencia.ts mostra quem ganhou.

    cd env
    bun run criar-env.ts
    bun run precedencia.ts

    NODE_ENV = (não definido)
    LOJA_NOME  = Loja Estudo
    SAUDACAO   = Bem-vindo a Loja Estudo
    MODO       = development
    ORIGEM_A   = env
    ORIGEM_B   = env.development
    ORIGEM_C   = env.local
    ORIGEM_D   = env.local

| Como corri | MODO | ORIGEM_B | ORIGEM_C | ORIGEM_D |
|---|---|---|---|---|
| NODE_ENV=production | production | env.production | env.local | env.local |
| NODE_ENV=test | test | env.test | env.test | env.test |
| NODE_ENV=production e ORIGEM_D=shell | production | env.production | env.local | shell |

Conclusões medidas: sem NODE_ENV o Bun carrega o .env.development (com process.env.NODE_ENV por definir); em test o .env.local é ignorado; um .env.development.local ganha ao .env.local; o shell vence tudo; e SAUDACAO mostra que o .env suporta expansão ($LOJA_NOME).

**ATENÇÃO:** o Bun procura os .env na pasta de trabalho (cwd), não na pasta do script. Corri bun run env/precedencia.ts a partir de exemplos/ e todas as variáveis vieram indefinidas.

Outras formas, todas executadas: --env-file=outra.env carrega esse ficheiro e deixa de carregar o .env por omissão (LOJA_MOEDA ficou indefinido); com várias --env-file, ganha o último se repetirem uma chave; --no-env-file desliga o carregamento (como env = false no bunfig.toml).

Bun.env, process.env e import.meta.env são o mesmo objeto (verifiquei com ===). Só guardam texto: por isso Boolean(LOJA_DEBUG) é true mesmo com o valor false.

Na loja, o exemplo env/config-loja.ts lê o IVA, o stock mínimo e o modo de depuração do .env, e o escalão de envio do loja.toml. Converte e valida à entrada, e falha com código 1 se faltar algo.

    bun run config-loja.ts
    Loja Estudo (Loja Estudo no .toml) | IVA 23% | debug=false
    Romance Policial       15.87 EUR  envio 3.90
    Atlas Mundial          36.89 EUR  envio 3.90
    Teclado Mecânico       97.17 EUR  envio 0.00  <- repor stock
    Conjunto de Panelas   110.58 EUR  envio 0.00  <- repor stock
    categorias: Livros, Eletrónica, Casa

    STOCK_MINIMO=abc bun run config-loja.ts
    variável STOCK_MINIMO em falta ou inválida (valor: abc)        (código de saída 1)

## import.meta e Bun.main

Cada módulo sabe onde está e se é o programa principal (exemplo 08-meta.ts).

    import.meta.file : 08-meta.ts
    import.meta.dir  : exemplos (só a última pasta)
    import.meta.path : 08-meta.ts            (aqui só com o nome)
    import.meta.main : true
    Bun.main         : 08-meta.ts
    Corri como programa principal (não fui importado).

| Propriedade | O que é |
|---|---|
| import.meta.dir (e dirname) | pasta do ficheiro (o __dirname dos módulos CommonJS) |
| import.meta.file | só o nome do ficheiro |
| import.meta.path (e filename) | caminho absoluto (o __filename); import.meta.url é o mesmo em formato file:/// |
| import.meta.main | true se este ficheiro foi lançado com bun run |
| Bun.main | caminho absoluto do ficheiro de entrada, igual em todos os módulos |
| import.meta.resolve | resolve um especificador para um URL |

Quando outro ficheiro importa o 08-meta.ts, import.meta.main fica false e Bun.main passa a ser o ficheiro importador. Por isso o padrão if (import.meta.main) { ... } serve para um ficheiro que é, ao mesmo tempo, biblioteca e programa (o que o exercício 4 pede). É o equivalente do if __name__ == "__main__" do Python.

## Argumentos e códigos de saída

Bun.argv e process.argv são o mesmo array (executei JSON.stringify nos dois): o executável, o ficheiro, e depois os teus argumentos (exemplo 09-argv.ts).

    const [, , categoria, limite = "3"] = Bun.argv;
    if (!categoria) {
        console.error("uso: bun run 09-argv.ts <categoria> [limite]");
        process.exit(2);
    }
    process.exitCode = categoria === "Livros" ? 0 : 3;

    bun run 09-argv.ts Livros 5
    Bun.argv    : [ "bun.exe", "09-argv.ts", "Livros", "5" ]
    categoria=Livros limite=5                  (código 0)

    bun run 09-argv.ts                         (código 2)
    bun run 09-argv.ts Casa                    (código 3)

Mostrei só os nomes dos ficheiros (Bun.argv[0] é o caminho completo do bun.exe). Tudo o que vem depois do nome do ficheiro vai para o teu programa (passei --watch e chegou ao array); as flags do Bun escrevem-se antes.

Os códigos de saída: 0 é sucesso, qualquer outro valor é falha. process.exit(n) termina logo (os eventos exit ainda correm); process.exitCode = n define o código sem cortar o que ainda está a decorrer. Uma exceção não tratada dá código 1, e uma rejeição que chega ao topo (um await que falha) também. O exemplo 10-erros.ts lança um ErroStock, e a consola do Bun mostra o excerto do código, a coluna e a mensagem.

    bun run 10-erros.ts
    reserva 1 ok; stock do 1 = 38
    13 |     if (quantidade > disponivel) throw new ErroStock(produtoId, quantidade, disponivel);
                                                ^
    ErroStock: Stock insuficiente para o produto 6: pedido 1, disponível 0
      produtoId: 6,
         pedido: 1,
     disponivel: 0,

          at reservar (.../exemplos/10-erros.ts:13:40)
          at .../exemplos/10-erros.ts:23:26
    [exit] código = 1

Com o argumento rejeicao o código de saída também é 1; com tratado, o programa captura o erro e sai com o código 4 que escolhemos; com ok sai com 0. Os números de linha são os do ficheiro TypeScript original, e as propriedades extra do erro (produtoId, pedido, disponivel) aparecem na saída. Mostrei só as linhas relevantes do excerto.

**DICA:** num script do package.json, o código de saída do teu programa é o código de saída do bun run. Executei bun run sem-args (o programa sai com 2) e o bun run terminou com 2.

## Globais do Bun

O Bun tem um objeto global, Bun, e módulos prefixados bun: para o que não é standard. O exemplo 11-globais.ts mostra o que existe.

    import { env, version } from "bun";   // "bun" é o mesmo objeto
    import { Database } from "bun:sqlite";

    import { version } from 'bun': true
    Bun tem 110 propriedades; amostra: $, Archive, ArrayBufferSink, Cookie, CookieMap, CryptoHasher, ...
    módulos bun:* nativos: bun:sqlite=object bun:ffi=object bun:test=object bun:jsc=object
    globais Web: fetch:function Request:function Response:function Headers:function URL:function ...

Contei 110 propriedades de Bun no 1.4.0 (muda de versão para versão): Bun.file, Bun.write, Bun.serve, Bun.spawn, Bun.sql, Bun.redis, Bun.S3Client, Bun.password, Bun.build, Bun.sleep, Bun.TOML, Bun.YAML e outras, que vês nos módulos seguintes. Carreguei os módulos bun:sqlite, bun:ffi, bun:test e bun:jsc. As APIs Web (fetch, Request, WebSocket, crypto, Worker...) são globais, e os módulos node:* embutidos continuam disponíveis.

## bun run, bun x e bunx

Três coisas parecidas, três papéis. Aqui só a introdução; o detalhe é do módulo 10.

| Comando | O que faz |
|---|---|
| bun run ficheiro.ts ou bun run nome | executa o teu ficheiro ou um script do package.json |
| bun x pacote ou bunx pacote | executa o binário de um pacote npm, instalando-o numa cache global se for preciso |

bun x --help mostrou o texto de utilização do bunx, e o executável está em ~/.bun/bin/bunx.exe. Não executei nenhum pacote com ele, porque isso descarrega código da rede. Não confundas: bun x corre código de terceiros, bun run corre o teu.

## Depuração

Quando algo falha, o Bun já ajuda: o excerto de código e a seta na coluna certa (secção anterior) mostram onde. Para depurar passo a passo há três flags, que usam o protocolo WebKit Inspector: --inspect abre o depurador e corre logo, --inspect-wait espera que um cliente se ligue antes de executar e --inspect-brk faz o mesmo e pára na primeira linha.

Executei bun --inspect=127.0.0.1:35010/loja 12-depurar.ts (o programa termina sozinho) e o Bun imprimiu:

    --------------------- Bun Inspector ---------------------
    Listening:
      ws://127.0.0.1:35010/loja
    Inspect in browser:
      https://debug.bun.sh/#127.0.0.1:35010/loja
    --------------------- Bun Inspector ---------------------

Não abri o depurador: só descrevo. Segundo a documentação, podes abrir o endereço debug.bun.sh no browser, ou usar a extensão do Bun para o Visual Studio Code, e pôr breakpoints no TypeScript original.

## Exercícios

**PRATICAR:** faz os exercícios 1 a 4 do módulo de exercícios (13-Exercicios-Praticos), com o Bun 1.4.0 e sem instalar nenhum pacote.

## Fontes oficiais

- Bun, executar ficheiros e scripts (bun run): https://bun.com/docs/cli/run
- Bun, TypeScript: https://bun.com/docs/runtime/typescript
- Bun, JSX: https://bun.com/docs/runtime/jsx
- Bun, variáveis de ambiente: https://bun.com/docs/runtime/environment-variables
- Bun, bunfig.toml: https://bun.com/docs/runtime/bunfig
- Bun, modo watch (--watch e --hot): https://bun.com/docs/runtime/watch-mode
- Bun, resolução de módulos e import.meta: https://bun.com/docs/runtime/module-resolution
- Bun, tipos de ficheiros importáveis: https://bun.com/docs/runtime/file-types
- Bun, TOML: https://bun.com/docs/runtime/toml
- Bun, YAML: https://bun.com/docs/runtime/yaml
- Bun, APIs globais: https://bun.com/docs/runtime/bun-apis
- Bun, compatibilidade com Node.js: https://bun.com/docs/runtime/nodejs-compat
- Bun, depuração: https://bun.com/docs/runtime/debugger
- Bun, bunx: https://bun.com/docs/cli/bunx
- TypeScript, referência do tsconfig.json: https://www.typescriptlang.org/tsconfig/
