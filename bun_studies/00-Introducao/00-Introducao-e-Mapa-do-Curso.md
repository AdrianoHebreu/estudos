# 00 Introdução e mapa do curso

Este curso responde a uma pergunta repetida ao longo de 16 módulos: o que é que o Bun já traz de origem? Neste módulo 00 ficas a saber o que é o Bun, como se instala, o que faz o comando bun init, corres o primeiro programa em TypeScript e vês o mapa completo do que vem a seguir, incluindo o projeto fio condutor: a API da loja.

Todos os comandos e saídas foram executados com o Bun 1.4.0 (revisão 34cbb9a40) no Windows 11, em Git Bash. A documentação oficial já descreve a versão 1.4.5, por isso, onde há diferenças, digo qual é qual.

## O que é o Bun

Segundo a documentação oficial, o Bun é um toolkit completo para aplicações JavaScript e TypeScript, distribuído como um único executável chamado bun. Esse executável faz quatro trabalhos que normalmente exigem ferramentas separadas:

| Função | Comando | O que faz |
|---|---|---|
| Runtime | bun run | executa ficheiros JavaScript, TypeScript e JSX, e scripts do package.json |
| Gestor de pacotes | bun install, bun add | instala dependências do registo npm, com workspaces |
| Executor de testes | bun test | testes compatíveis com a API do Jest, escritos em TypeScript |
| Bundler | bun build | junta e compila código para o browser ou para o servidor |

A documentação diz que o runtime foi desenhado como substituto direto do Node.js e que usa o JavaScriptCore, o motor de JavaScript da Apple (o do Safari), em vez do V8 do Chrome e do Node. Sobre a linguagem em que o Bun é escrito: a página de introdução da versão 1.4.5 diz que está escrito em Rust. Muita bibliografia mais antiga fala em Zig; não verifiquei em que versão mudou, por isso não afirmo mais do que o que está na documentação atual. Para usares o Bun isto é indiferente.

**NOTA:** a documentação lista também um verificador de tipos (bun check), um linter (bun lint) e um formatador (bun fmt). Na versão 1.4.0 instalada aqui esses comandos não existem: bun check e bun fmt respondem Script not found. Assumem-se funcionalidades mais recentes, fora do alcance deste curso.

## Porquê explorar o que é nativo

Num projeto Node típico, um servidor com testes, base de dados e variáveis de ambiente começa com dezenas de dependências diretas, cada uma com as suas dependências. Cada pacote é código de terceiros: tem de ser atualizado, pode ter vulnerabilidades e pode ter scripts de instalação. O Bun traz de origem muitas dessas peças, e usá-las tem três vantagens que não dependem de nenhum benchmark:

- menos dependências: menos para instalar, atualizar e auditar, e um package.json mais curto;
- menos superfície de ataque: cada pacote que não instalas é um pacote que não pode ser comprometido;
- menos configuração: o que vem no executável já está integrado (por exemplo, o TypeScript corre sem passo de compilação).

Sobre o arranque rápido, a documentação afirma que os processos do Bun arrancam 4 vezes mais depressa do que os do Node.js. Tentei medir isto na minha máquina (abrir e fechar um processo com um ficheiro vazio, mediana de várias execuções) e o resultado foi inconclusivo: com a máquina ocupada os tempos variaram muito e o Bun até saiu mais lento. Por isso não cito números meus. Se quiseres medir, repete a experiência numa máquina parada e com muitas execuções.

**ATENÇÃO:** nativo não é sinónimo de melhor em todos os casos. Há pacotes npm maduros que fazem mais do que a versão embutida. O curso mostra o que o Bun já faz; a decisão no teu projeto é tua.

## Bun contra Node.js

O Bun quer ser compatível com o Node, não igual. A documentação diz que a compatibilidade é medida contra o Node.js v26 e que corre milhares de testes da suite do Node antes de cada versão. Marca cada módulo node: como totalmente implementado, parcial ou ausente. Alguns exemplos verificados nessa página:

| Módulo do Node | Estado segundo a documentação do Bun |
|---|---|
| node:fs, node:http, node:path, node:zlib, node:url | totalmente implementados |
| node:crypto, node:child_process, node:worker_threads | parcialmente implementados (faltam peças) |
| node:sqlite | totalmente implementado |
| node:sea (executáveis únicos do Node) | não implementado: usa bun build --compile |

Comparação lado a lado, com o Bun 1.4.0 e o Node 24.18.0 que tenho instalados:

| Aspeto | Bun 1.4.0 | Node 24.18.0 |
|---|---|---|
| Motor de JavaScript | JavaScriptCore | V8 |
| Executar TypeScript | direto, sem configuração | também direto: removeu os tipos do meu exemplo e correu (só testei código simples) |
| Verificação de tipos ao executar | não faz | não faz |
| Ficheiro .env | carregado automaticamente (testei) | só com a opção --env-file (testei) |
| Gestor de pacotes | bun install, no próprio executável | npm, distribuído com o Node (versão 12.0.2 aqui) |
| Executor de testes | bun test | node --test (testei) |
| Bundler | bun build | não tem |
| SQLite embutido | bun:sqlite | node:sqlite (existe nesta versão) |
| Executável único | bun build --compile | node:sea |

**NOTA:** a conclusão honesta é que a diferença já não é poder escrever TypeScript sem compilar. A diferença é a quantidade de funcionalidades que vêm juntas no mesmo executável, com uma API própria (Bun.serve, Bun.sql, Bun.password...) a juntar-se às APIs Web e do Node. O preço é que essas APIs próprias só existem no Bun: código que as use deixa de correr no Node.

## Instalação

Já tenho o Bun instalado; não instalei nada para este módulo. Estes são os métodos que a documentação oficial lista (página Installation).

macOS e Linux, com o script oficial (no Linux é preciso o pacote unzip):

    curl -fsSL https://bun.com/install | bash

Windows, em PowerShell (exige o Windows 10 versão 1809 ou posterior):

    powershell -c "irm bun.sh/install.ps1|iex"

Alternativas listadas: npm install -g bun, brew install oven-sh/bun/bun (macOS e Linux), scoop install bun (Windows) e a imagem Docker oven/bun. O instalador coloca o executável em .bun/bin dentro da pasta do utilizador; se aparecer command not found, acrescenta essa pasta ao PATH. Depois de instalar, verifica numa janela nova:

    bun --version
    bun --revision

O comando bun upgrade atualiza o Bun para a versão mais recente (se instalaste com Homebrew ou Scoop, usa antes brew upgrade bun ou scoop update bun, para não entrar em conflito).

## bun --version e bun --help

    $ bun --version
    1.4.0
    $ bun --revision
    1.4.0+34cbb9a40

O bun --help lista os comandos disponíveis. Esta é a secção Commands da versão 1.4.0, com os textos originais em inglês (retirei os nomes de exemplo que acompanham cada comando, juntei as duas linhas do run e omiti seis comandos de gestão de pacotes: dedupe, prune, link, unlink, patch e publish):

    run       Execute a file with Bun / Run a package.json script
    test      Run unit tests with Bun
    x         Execute a package binary (CLI), installing if needed (bunx)
    repl      Start a REPL session with Bun
    exec      Run a shell script directly with Bun
    install   Install dependencies for a package.json (bun i)
    add       Add a dependency to package.json (bun a)
    remove    Remove a dependency from package.json (bun rm)
    update    Update outdated dependencies
    audit     Check installed packages for vulnerabilities
    outdated  Display latest versions of outdated dependencies
    pm        Additional package management utilities
    info      Display package metadata from the registry
    why       Explain why a package is installed
    build     Bundle TypeScript and JavaScript into a single file
    init      Start an empty Bun project from a built-in template
    create    Create a new project from a template (bun c)
    upgrade   Upgrade to latest version of Bun.

Depois dos comandos vêm mais de uma centena de linhas de opções. As que vais usar mais cedo: --watch e --hot (reiniciar ou recarregar ao guardar), --env-file e --no-env-file, -e e -p (avaliar código na linha de comandos), --port e --inspect. Cada comando tem a sua ajuda, por exemplo bun test --help ou bun build --help.

## bun init

O bun init cria um projeto vazio na pasta atual. Corri-o numa pasta temporária fora do curso, com a opção -y (aceita todas as predefinições):

    mkdir init-demo
    cd init-demo
    bun init -y

     + .gitignore
     + index.ts
     + tsconfig.json (for editor autocomplete)
     + README.md

    To get started, run:

        bun run index.ts

    bun install v1.4.0 (34cbb9a40)
    + @types/bun@1.4.5
    + typescript@7.0.2
    7 packages installed [3.03s]

Repara que o bun init também correu bun install e foi buscar duas dependências ao registo npm (@types/bun e typescript). A pasta ficou com estes ficheiros:

| Ficheiro | Conteúdo |
|---|---|
| index.ts | uma linha: console.log("Hello via Bun!") |
| package.json | name, module (index.ts), type module, private, @types/bun em devDependencies e typescript em peerDependencies |
| tsconfig.json | opções pensadas para o Bun, só para o editor: strict ligado, moduleResolution bundler, noEmit |
| .gitignore | node_modules, out, dist, coverage, ficheiros .env e outros |
| bun.lock e node_modules | criados pela instalação |

A opção -m (minimal) cria só package.json e tsconfig.json e instala @types/bun. Há também as opções --react, --react=tailwind e --react=shadcn. Sem -y, as opções são perguntadas (não testei o modo interativo).

## O primeiro programa em TypeScript

O ficheiro exemplos/01-ola.ts define uma interface, uma função com parâmetro por omissão e usa duas coisas do Bun: o objeto global Bun e import.meta.file.

    interface Produto {
      nome: string;
      preco: number;
    }

    function comIva(produto: Produto, taxa = 0.23): number {
      return Math.round(produto.preco * (1 + taxa) * 100) / 100;
    }

    const atlas: Produto = { nome: "Atlas Mundial", preco: 29.99 };

    console.log(`Olá, Bun! Versão ${Bun.version} (${process.platform}/${process.arch})`);
    console.log(`${atlas.nome} com IVA: ${comIva(atlas)} EUR`);
    console.log("Ficheiro em execução:", import.meta.file);

Executa-o com bun run (a forma curta bun 01-ola.ts também funciona):

    $ bun run 01-ola.ts
    Olá, Bun! Versão 1.4.0 (win32/x64)
    Atlas Mundial com IVA: 36.89 EUR
    Ficheiro em execução: 01-ola.ts

Não houve compilação, nem tsconfig.json, nem node_modules: o Bun remove os tipos ao ler o ficheiro. Remover os tipos não é verificá-los. O exemplo 03 atribui um texto a uma variável declarada number:

    const quantidade: number = "isto não é um número";
    console.log(typeof quantidade, quantidade);

    $ bun run 03-sem-verificacao-de-tipos.ts
    string isto não é um número

**NOTA:** os erros de tipos só aparecem no editor ou com o compilador do TypeScript (tsc). O módulo 01 explica como fazer essa verificação e o que o Bun faz com tsconfig.json.

## O mapa das funcionalidades nativas

Esta é a tabela que organiza o curso: a necessidade, o pacote npm que costumas instalar e a funcionalidade que o Bun já traz. Verifiquei, na versão 1.4.0, que todas estas APIs existem (typeof no objeto Bun) e testei de facto o carregamento do .env, a leitura de YAML, o semver, a conversão de Markdown e o hash argon2id da palavra-passe. O comportamento detalhado é verificado nos módulos indicados.

| Necessidade | Pacote npm habitual | Nativo no Bun | Módulo |
|---|---|---|---|
| Executar TypeScript | ts-node, tsx | bun run ficheiro.ts | 01 |
| Variáveis de ambiente | dotenv | ficheiro .env carregado automaticamente | 01 |
| Reiniciar ao guardar | nodemon | opções --watch e --hot | 01 |
| Ficheiros | fs-extra | Bun.file e Bun.write, mais node:fs | 02 |
| Padrões de ficheiros | glob, fast-glob | Bun.Glob | 02 |
| Comandos de shell | execa, shelljs | Bun.$ e Bun.spawn | 02 |
| Servidor HTTP | express, fastify | Bun.serve | 03 |
| Cliente HTTP | node-fetch, axios | fetch (global) | 04 |
| WebSocket | ws | WebSocket (global) | 04 |
| SQLite | better-sqlite3 | bun:sqlite | 05 |
| PostgreSQL e MySQL | pg, mysql2 | Bun.sql | 05 |
| Redis | ioredis | Bun.redis | 06 |
| Armazenamento S3 | aws-sdk | Bun.s3 | 06 |
| Palavras-passe | bcrypt, argon2 | Bun.password | 07 |
| Proteção CSRF | csrf | Bun.CSRF | 07 |
| YAML | js-yaml | Bun.YAML | 07 |
| Versões semver | semver | Bun.semver | 07 |
| Markdown para HTML | marked | Bun.markdown | 07 |
| Testes | jest, vitest | bun test (módulo bun:test) | 08 |
| Bundler | esbuild, webpack | bun build | 09 |
| Executável único | pkg | bun build --compile | 09 |
| Instalar pacotes | npm, yarn, pnpm | bun install | 10 |

**NOTA:** o curso não promete cobrir tudo o que existe. O Bun tem mais APIs (por exemplo, Bun.cron, Bun.secrets e Bun.WebView existem na 1.4.0, mas não são tema deste curso). Se a tabela diz que algo existe, os módulos indicados mostram-no a funcionar; onde uma função for recente ou experimental, a aula assinala.

## O projeto fio condutor: a API da loja

Ao longo do curso constróis a API de uma loja. Os dados são os mesmos dos cursos de SQL, MongoDB e COBOL e estão num único script, 00-Introducao/dados/loja.sql, que cria cinco tabelas:

| Tabela | Linhas | Conteúdo |
|---|---|---|
| categorias | 3 | Livros, Eletrónica, Casa |
| clientes | 8 | nome, email (o cliente 8 não tem), cidade, data de registo |
| produtos | 10 | nome, categoria, preço, stock |
| encomendas | 12 | cliente, data, estado (entregue, enviada, pendente, cancelada) |
| linhas_encomenda | 26 | encomenda, produto, quantidade, preço unitário |

Para veres os dados já, o exemplo 02 usa o SQLite embutido (bun:sqlite) numa base em memória. Em cerca de 30 linhas importa Database de bun:sqlite, lê o script com Bun.file, executa-o com db.exec e faz consultas com db.query(...).all(), mostradas com console.table. Não tens de perceber a API agora (o módulo 05 ensina-a); serve só para provar que os dados existem e que o Bun os lê sem instalar nada.

O resultado (contagens, cinco produtos e totais de três encomendas):

    categorias: 3 linhas
    clientes: 8 linhas
    produtos: 10 linhas
    encomendas: 12 linhas
    linhas_encomenda: 26 linhas

    ┌───┬────┬─────────────────────────┬────────────┬───────┬───────┐
    │   │ id │ produto                 │ categoria  │ preco │ stock │
    ├───┼────┼─────────────────────────┼────────────┼───────┼───────┤
    │ 0 │ 1  │ Romance Policial        │ Livros     │ 12.9  │ 40    │
    │ 1 │ 2  │ Livro de Receitas       │ Livros     │ 18.5  │ 25    │
    │ 2 │ 3  │ Atlas Mundial           │ Livros     │ 29.99 │ 10    │
    │ 3 │ 4  │ Auscultadores Bluetooth │ Eletrónica │ 49.9  │ 30    │
    │ 4 │ 5  │ Carregador USB-C        │ Eletrónica │ 14.9  │ 100   │
    └───┴────┴─────────────────────────┴────────────┴───────┴───────┘

    Totais de três encomendas:
    ┌───┬────┬─────────────┬──────────┬───────┐
    │   │ id │ cliente     │ estado   │ total │
    ├───┼────┼─────────────┼──────────┼───────┤
    │ 0 │ 1  │ Ana Ribeiro │ entregue │ 40.7  │
    │ 1 │ 3  │ Ana Ribeiro │ entregue │ 44.5  │
    │ 2 │ 12 │ Bruno Costa │ pendente │ 145   │
    └───┴────┴─────────────┴──────────┴───────┘

**ATENÇÃO:** o dinheiro aparece em vírgula flutuante. As colunas são declaradas DECIMAL(10,2), mas no SQLite isso dá afinidade numérica e o valor guardado é um número real (a função typeof do SQLite devolveu real para o preço). Por isso há somas com erro de arredondamento: SELECT SUM(preco) FROM produtos devolveu 358.09000000000003 (o valor certo é 358.09). Numa aplicação a sério, guarda o dinheiro em cêntimos inteiros ou arredonda ao apresentar; o módulo 05 volta a isto.

## Mapa dos módulos

| Módulo | Tema | Pergunta que responde |
|---|---|---|
| 00 | Introdução | o que é o Bun e o que vem a seguir |
| 01 | Runtime e TypeScript | como se executa código, o que são módulos, .env, watch |
| 02 | Ficheiros e sistema | ler, escrever, procurar ficheiros e correr comandos |
| 03 | Servidor HTTP | Bun.serve, rotas, respostas, a API da loja a nascer |
| 04 | Cliente e Web APIs | fetch, WebSocket, streams e outras APIs Web |
| 05 | Bases de dados | bun:sqlite e Bun.sql (PostgreSQL e MySQL) |
| 06 | Redis e S3 | cache e armazenamento de objetos |
| 07 | Segurança e utilitários | palavras-passe, CSRF, hash, YAML, semver, Markdown |
| 08 | Testes nativos | bun test sem Jest |
| 09 | Bundler e executáveis | bun build e executáveis únicos |
| 10 | Pacotes e workspaces | bun install, lockfile, monorepos |
| 11 | Concorrência e interoperabilidade | workers, processos, ligação a outras linguagens |
| 12 | Projeto final | a API da loja completa, só com o que é nativo |
| 13 | Exercícios | todos os exercícios, numerados de 1 a 45 |
| 14 | Cheat sheet | resumo de comandos e APIs |
| 15 | Gabarito | soluções dos exercícios |

## Glossário

| Termo | Significado |
|---|---|
| Runtime | programa que executa JavaScript e oferece APIs para o exterior (ficheiros, rede). Node.js e Bun são runtimes |
| Motor de JavaScript | a parte que interpreta e compila o código: V8 (Chrome, Node), JavaScriptCore (Safari, Bun) |
| Bundler | ferramenta que junta muitos ficheiros e dependências em poucos ficheiros |
| API Web | interface padrão dos browsers, como fetch, Request, Response, URL, WebSocket |
| Módulo node: | módulo embutido do Node.js (node:fs, node:path) que o Bun também implementa |
| Módulo bun: | módulo embutido só do Bun (bun:sqlite, bun:test) |
| Script de instalação | comando que um pacote executa ao ser instalado (por exemplo postinstall) |

## Como estudar este curso

- Faz os módulos por ordem: o fio condutor da loja é cumulativo e cada módulo usa o anterior.
- Escreve e executa cada exemplo: cada aula tem uma pasta exemplos com os ficheiros prontos a correr com bun run.
- Confirma a versão com bun --version. O Bun muda depressa e este curso foi escrito com a 1.4.0; funcionalidades recentes aparecem assinaladas.

## Avisos antes de começares

**ATENÇÃO:** nunca uses bun add -g (nem bun install -g, nem npm install -g) para experimentar pacotes. Um pacote global fica instalado na tua conta e não fica registado no package.json nem no lockfile de nenhum projeto, por isso deixas de ter um projeto reproduzível. Instala dentro da pasta do projeto, onde o package.json e o lockfile registam o que lá está. Repara que mesmo o bun init instala pacotes (viste isso acima): corre-o sempre numa pasta descartável.

**ATENÇÃO:** cuidado com os scripts de instalação. Um pacote pode declarar scripts como postinstall, que são comandos arbitrários executados ao instalar. A documentação do Bun diz que, por omissão, o Bun não executa scripts de instalação das dependências, exceto as que estão em trustedDependencies no package.json e numa lista de pacotes populares que o Bun já considera de confiança (só para pacotes vindos do npm). Acrescenta a trustedDependencies só o que conheces e em que confias. O comando bun pm ls --trusted lista as dependências confiáveis.

**ATENÇÃO:** o Bun também pode instalar pacotes enquanto executa código. A ajuda mostra a opção --install, com o valor por omissão auto: instala automaticamente quando não existe node_modules. Se não quiseres isso, usa a opção --no-install. Da mesma forma, bunx (ou bun x) descarrega e executa um pacote: só o uses com pacotes em que confias.

**NOTA:** neste curso nenhum exemplo depende de pacotes do npm; se um exemplo te pedir bun install, algo está errado.

**PRATICAR:** abre um terminal, corre bun --version e bun --help, depois cria uma pasta temporária fora do curso, corre bun init -y lá e executa o index.ts que foi criado. Por fim, corre os três exemplos de 00-Introducao/exemplos e compara a saída com a deste texto.

## Fontes oficiais

- Documentação do Bun: https://bun.com/docs
- Instalação: https://bun.com/docs/installation
- Compatibilidade com o Node.js: https://bun.com/docs/runtime/nodejs-compat
- TypeScript no Bun: https://bun.com/docs/runtime/typescript
- Variáveis de ambiente: https://bun.com/docs/runtime/env
- SQLite no Bun: https://bun.com/docs/runtime/sqlite
- Scripts de instalação (lifecycle): https://bun.com/docs/pm/lifecycle
- Modo de observação (watch): https://bun.com/docs/runtime/watch-mode
