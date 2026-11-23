# 10 Pacotes e workspaces

Este é o módulo em que instalas pacotes do npm de propósito: o tema é o gestor de pacotes do Bun. Vês o que o bun install cria, como se lê o bun.lock, como se organiza um monorepo com workspaces, como se corrige um pacote com bun patch, como se defende a cadeia de fornecimento (scripts, intervalos de datas, auditoria) e, no fim, quando é que não precisas de pacote nenhum.

Tudo foi executado com o Bun 1.4.0 no Windows 11 (Git Bash). A documentação oficial já descreve a 1.4.5: onde ela diz algo que a 1.4.0 não fez, assinalo-o. Não usei portas nem servidores neste módulo. Os exemplos estão em exemplos/ (semver, leitura do lock, a dieta, a medição, o pacote com gancho, o monorepo e um patch).

## O ambiente seguro desta aula

Por omissão o Bun guarda tudo o que descarrega numa cache global em ~/.bun/install/cache, partilhada por todos os teus projetos. Para estudar sem lhe tocar, usa sempre uma cache própria. Verifiquei três maneiras, que mudam o caminho que o bun pm cache imprime:

    bun pm cache                                   (sem nada: ~/.bun/install/cache)
    BUN_INSTALL_CACHE_DIR=/a/minha/cache bun pm cache
    bun pm cache --cache-dir=/a/minha/cache        (a opção também existe em install e add)

A terceira é o bunfig.toml do projeto, com a secção install.cache e a chave dir (relativa à pasta do projeto, como em exemplos/bunfig-seguro.toml). Regras que segui, e que deves seguir:

- Instala sempre numa pasta de trabalho tua, fora da pasta do curso, e corre bun pm cache antes de instalar para confirmar o caminho.
- Nunca uses -g (instalação global). O bun link também escreve numa pasta global: com BUN_INSTALL apontado para uma pasta tua, a pasta global passa a ser essa.
- Nunca publiques. Instala só pacotes minúsculos e conhecidos. Usei is-number (7.0.0), is-odd (3.0.1, que depende só de is-number 6.0.0), ms (2.1.3), left-pad (1.3.0), kleur (4.1.5) e semver (7.8.6). O is-number, o ms, o left-pad e o kleur não têm dependências (confirmei no registo com curl).

**ATENÇÃO:** o bun pm cache rm apaga a cache e também os pacotes do bunx guardados na pasta temporária do sistema (a resposta foi «Cleared 1 cached bunx packages»). Corre-o só depois de confirmares, com bun pm cache, que o caminho é o teu.

## O que substitui

| Ferramenta do npm, yarn ou pnpm | O que o Bun já traz |
|---|---|
| npm install, yarn install, pnpm install | bun install (migra o lock de npm, yarn e pnpm sozinho) |
| npm ci | bun install --frozen-lockfile (e o comando bun ci) |
| npx, yarn dlx, pnpm dlx | bunx (ou bun x) |
| npm ls, npm explain | bun pm ls e bun why |
| npm outdated, npm-check-updates | bun outdated e bun update --latest |
| npm audit | bun audit (só leitura; o bun audit fix altera) |
| npm pack | bun pm pack |
| npm link | bun link |
| patch-package | bun patch |
| pnpm workspaces, pnpm catalogs | workspaces e catalogs no package.json |
| lerna run, pnpm --filter | bun run --filter |

## package.json: o que o Bun lê

| Campo | Para que serve |
|---|---|
| dependencies | o que o programa precisa em execução |
| devDependencies | só desenvolvimento (testes, ferramentas); fora com --production |
| peerDependencies | o que o pacote espera que quem o usa instale; o bun add --peer instalou-o no projeto |
| optionalDependencies | se falhar a instalação, o resto continua |
| scripts | bun run nome; o postinstall do próprio projeto corre depois de instalar |
| exports | os caminhos que outros podem importar |
| type | module ou commonjs: como se interpretam os .js |
| workspaces, catalog, catalogs | monorepo e versões partilhadas |
| overrides, resolutions | forçar a versão de dependências das dependências |
| trustedDependencies | quem pode correr scripts de instalação |
| patchedDependencies | patches guardados pelo bun patch |

Uma dependência opcional impossível (is-number ^99.0.0) foi ignorada e o install terminou com código 0; uma obrigatória impossível falha com «No version matching ... (but package exists)», e um nome que não existe dá «GET .../pacote - 404».

## bun install: o que cria

Com o projeto de exemplo (is-odd, ms e left-pad em dependencies; kleur e semver em devDependencies) e a cache vazia:

    bun install
    Resolving dependencies
    Resolved, downloaded and extracted [24]
    Saved lockfile
    + kleur@4.1.5
    + semver@7.8.6
    + is-odd@3.0.1
    + left-pad@1.3.0
    + ms@2.1.3
    6 packages installed [598.00ms]

Criou três coisas: a pasta node_modules (os 6 pacotes, 37 KB), o ficheiro bun.lock e, na cache, uma pasta por versão (is-odd@3.0.1@@@1) mais ficheiros .npm com os metadados. Em node_modules/.bin ficaram semver.exe e semver.bunx: no Windows o Bun cria estes atalhos em vez de scripts de shell. O is-number não é dependência direta: veio com o is-odd.

O bun.lock é texto (JSONC: JSON com vírgulas finais e sem comentários obrigatórios). Parte do real:

    {
      "lockfileVersion": 2,
      "configVersion": 1,
      "workspaces": {
        "": { "name": "demo-pacotes", "dependencies": { "is-odd": "^3.0.1", ... } }
      },
      "packages": {
        "is-number": ["is-number@6.0.0", "", {}, "sha512-Wu1VHe..."],
        "is-odd": ["is-odd@3.0.1", "", { "dependencies": { "is-number": "^6.0.0" } }, "sha512-CQpnWP..."],
        "semver": ["semver@7.8.6", "", { "bin": { "semver": "bin/semver.js" } }, "sha512-9lpSSU..."]
      }
    }

Cada pacote tem quatro posições: o identificador exato, o registo (vazio para o npm), os metadados (dependências, bin) e o hash de integridade sha512. Como é texto, vê-se numa revisão de código. O exemplos/02-lock-resumo.ts lê-o com Bun.JSONC.parse e imprime uma tabela (existe Bun.JSONC na 1.4.0).

**NOTA:** o node_modules usa hardlinks para a cache (no Windows e no Linux; o macOS usa clonefile). Um ficheiro de node_modules mostrou 5 ligações, e com --backend copyfile mostrou 1: com hardlinks, editar um ficheiro à mão em node_modules altera a cache. Por isso o bun patch (mais abaixo) existe.

## Opções de instalação que verifiquei

| Opção | O que vi |
|---|---|
| --frozen-lockfile | falha se o package.json e o lock divergem: «lockfile had changes, but lockfile is frozen» (código 1) |
| --production | sem devDependencies (ficaram 4 pastas em vez de 6) e, como o --frozen-lockfile, recusa lock desatualizado |
| --omit=dev | o mesmo resultado de --production, sem a regra do lock |
| --dry-run | lista o que instalaria; não escreveu node_modules nem bun.lock |
| --no-save | instala sem alterar o bun.lock (ficou igual) |
| --lockfile-only | só escreve o bun.lock |
| --ignore-scripts | ignora os scripts do próprio projeto; os das dependências nunca correm sem confiança |
| --linker hoisted ou isolated | a forma do node_modules (ver workspaces) |

O bun ci existe e deu «Checked 5 installs ... (no changes)»: é o equivalente de --frozen-lockfile. Num projeto com tudo já instalado o bun install só verifica («Checked 6 installs across 7 packages (no changes) [7.00ms]»).

## bun add, remove, update e outdated

    bun add is-number@5        (guardou "is-number": "5")
    bun add -d ms              (devDependencies, "^2.1.3")
    bun add -E left-pad        (exata: "1.3.0")
    bun add --optional kleur@~4.1.0
    bun add --peer semver      (peerDependencies, "^7.8.6", e instalou-o)
    bun add is-number@6.0.0    (guardou "6.0.0", sem ^)

Atenção ao que cada forma escreve: sem versão fica ^versão; com uma versão exata (6.0.0) ou um intervalo curto (5) o Bun guarda o que escreveste. O bun remove tira do package.json, do lock e de node_modules.

A diferença que mais se paga a conhecer é a de update contra update --latest. Com is-number ^5.0.0:

    bun outdated
    | Package   | Current | Update | Latest |
    | is-number | 5.0.0   | 5.0.0  | 7.0.0  |

    bun update                   (nada muda: dentro de ^5 não há mais nada)
    bun update --latest is-number
    ^ is-number 5.0.0 -> 7.0.0   (e o package.json passou a "^7.0.0")

O bun outdated mostra a versão atual, a que o intervalo permite (Update) e a mais recente (Latest). O bun update respeita o intervalo; o --latest reescreve-o. Também tem --dry-run (mostrou «1 package would be updated» sem escrever) e -i (interativo, que não testei).

## Versões e intervalos (semver)

Uma versão tem a forma maior.menor.correção. O exemplos/01-semver.ts usa Bun.semver.satisfies:

| Intervalo | Aceita | Rejeita |
|---|---|---|
| ^1.2.3 | 1.9.0 | 2.0.0 |
| ~1.2.3 | 1.2.9 | 1.3.0 |
| ^0.2.3 | 0.2.9 | 0.3.0 (antes do 1.0.0 o ^ é mais apertado) |
| ^0.0.3 | só 0.0.3 | 0.0.4 |
| 1.2.3 | só 1.2.3 | tudo o resto |
| >=1.0.0 e abaixo de 2.0.0 | 1.5.0 | 2.0.0 |

Uma pré-versão (1.5.0-beta.1) não satisfaz ^1.0.0, e Bun.semver.order("1.10.0", "1.9.0") dá 1 (compara números, não texto). Para além dos números há dist-tags, nomes que apontam para uma versão. Em bun info typescript dist-tags (lido a 2026-11-23) apareceram latest 7.0.2, rc 7.0.1-rc, beta 7.1.0-beta, next 7.1.0-dev.20261123.1, dev, insiders e tag-for-publishing-older-releases. Instala-se com bun add pacote@next. O is-number, o is-odd e o left-pad só têm latest.

O bun info typescript optionalDependencies lista pacotes por sistema (@typescript/typescript-win32-x64, linux-x64, darwin-arm64 e outros): é o uso típico de optionalDependencies, cada máquina instala só o seu. Não instalei o typescript.

## bun why e bun pm

    bun why is-number
    is-number@7.0.0
      └─ demo2 (requires ^7.0.0)
    is-number@6.0.0
      └─ is-odd@3.0.1 (requires ^6.0.0)
         └─ demo2 (requires ^3.0.1)

O bun why mostra quem pede cada versão (aceita padrões como "is-*", --top e --depth). O bun pm tem muitos subcomandos; estes funcionaram:

| Comando | O que deu |
|---|---|
| bun pm ls e bun pm ls --all | a árvore de node_modules (com --all vê-se o is-number 6.0.0 dentro do is-odd) |
| bun pm bin | a pasta node_modules/.bin |
| bun pm cache | o caminho da cache |
| bun pm hash | um hash do lock (com bun.lock em texto, o hash-print deu zeros) |
| bun pm pack --dry-run | lista os ficheiros do tarball, sem escrever |
| bun pm view ou bun info | metadados do registo (dist-tags, tarball, integridade) |
| bun pm licenses, pkg get e set | licenças por pacote; ler e escrever o package.json |
| bun pm untrusted, trust, default-trusted | ver segurança |

Não corri o bun pm version (altera o package.json e cria uma etiqueta git) nem o bun prune.

## bun.lock contra o antigo bun.lockb

Antes da 1.2 o lock era um ficheiro binário, bun.lockb (rápido, mas ilegível numa revisão); desde então o omissão é o bun.lock de texto (segundo a documentação). Na 1.4.0 consegui os dois: com saveTextLockfile = false no bunfig.toml, o bun install escreveu bun.lockb. Para migrar:

    bun install --save-text-lockfile --frozen-lockfile --lockfile-only

Escreveu o bun.lock e o bun.lockb desapareceu. Com um package-lock.json e sem bun.lock, o bun install migrou-o («migrated lockfile from package-lock.json») e o package-lock.json ficou lá. O bun install -y escreve também um yarn.lock. Faz commit do bun.lock.

## Workspaces: um monorepo com dois pacotes

O exemplos/monorepo tem a raiz e três pacotes: @loja/core (usa is-odd e ms), @loja/app (depende do core) e @loja/utils (sem dependências). A raiz declara os caminhos; a app liga ao core com o protocolo workspace:

    "workspaces": ["packages/*"]                   (package.json da raiz)
    "@loja/core": "workspace:*"                    (package.json da app)

Copia a pasta para fora do curso e corre bun install: «4 packages installed». O Bun não descarrega o @loja/core, liga a pasta local. O bun run --cwd packages/app start imprimiu «encomenda 7 é ímpar? true» e «preço: 49,90 €».

Uma lição: o node_modules desta pasta não ficou como nos outros projetos. Num projeto com workspaces novo o Bun usa o linker isolated (configVersion 1 no bun.lock): a raiz só tem node_modules/.bun (a loja de pacotes) e cada pacote tem o seu node_modules com ligações simbólicas só para o que declarou. Num projeto de um só pacote o omissão é hoisted (tudo em node_modules). Um projeto migrado de package-lock.json ficou com configVersion 0 (hoisted). O isolated apanha dependências esquecidas: um import "ms" na app, que nunca o declarou, deu «Cannot find package 'ms'»; com --linker hoisted funcionou (dependência fantasma). Apaguei o node_modules antes de mudar de linker.

    bun run --filter '*' build        (corre o script build de todos)
    @loja/core build: Exited with code 0
    @loja/utils build: Exited with code 0
    @loja/app build: Exited with code 0

Os scripts correm pela ordem das dependências (o core antes da app). Com --filter @loja/app corre só um. O bun install --filter @loja/app instalou só a app e as dependências do core (5 pacotes); o bun add ms@2.1.3 --filter @loja/utils põe a dependência no pacote certo. O campo exports do core deixou importar @loja/core/preco, e @loja/core/src/preco.ts falhou com «Cannot find module»: o que não está em exports não se importa.

**DICA:** o bun pm pack --cwd packages/app mostrou o package.json que seria publicado: "@loja/core": "workspace:*" passou a "1.0.0". O Bun troca o protocolo (e o catalog:) pelas versões reais.

## Catálogos

Os catálogos põem a versão de uma dependência num só lugar. O exemplo usa um catálogo por omissão e um com nome na raiz, e os pacotes referem-nos:

    "catalog": { "ms": "^2.1.3" },
    "catalogs": { "ferramentas": { "kleur": "^4.1.5" } }       (raiz)
    "ms": "catalog:"   e   "kleur": "catalog:ferramentas"      (nos pacotes)

O bun.lock regista os dois blocos. Se pedires catalog: para um nome que não está no catálogo, o install falha com «left-pad@catalog: is not in the catalog». O bun add --catalog left-pad --filter @loja/utils acrescentou left-pad ao catálogo da raiz e escreveu "catalog:" no pacote. Com um catálogo, atualizar o ms em todo o monorepo é mudar uma linha.

## overrides e resolutions

Forçam a versão de uma dependência de dependência. O is-odd 3.0.1 pede is-number ^6.0.0. Com "overrides": {"is-number": "7.0.0"} na raiz, bun why is-number passou a mostrar 7.0.0 sob o is-odd e o bun.lock ganhou um bloco overrides. Com "resolutions": {"is-number": "5.0.0"} (a forma do Yarn) ficou a 5.0.0. Segundo a documentação, quando há os dois campos o Bun só lê overrides, e só lê os da raiz. Serve para tapar uma vulnerabilidade sem esperar pelo autor, com o risco de forçar uma versão que o pacote nunca testou.

## bun patch: corrigir um pacote localmente

Para alterar um pacote (um bug, uma opção que falta), sem fazer fork. O is-number 7.0.0 devolve false para "1,5". O fluxo:

    bun patch is-number@7.0.0
    (edita node_modules/is-number/index.js)
    bun patch --commit node_modules/is-number

O primeiro comando prepara a pasta; depois de editares (acrescentei uma linha que troca a vírgula por ponto), o --commit gerou patches/is-number@7.0.0.patch (um diff) e acrescentou ao package.json:

    "patchedDependencies": { "is-number@7.0.0": "patches/is-number@7.0.0.patch" }

Antes n("1,5") dava false, depois true. Apaguei node_modules, voltei a instalar (inclusive com --frozen-lockfile) e o patch continuou aplicado. A cache ficou intacta (o original não tem a minha linha) e o Bun criou uma entrada separada com patch_hash no nome. Está em exemplos/patch. Faz commit da pasta patches e do package.json.

## Segurança da cadeia de fornecimento

Instalar é executar código de terceiros. Os riscos e o que o Bun faz:

| Risco | Defesa |
|---|---|
| Scripts de instalação (preinstall, postinstall) | o Bun não os corre nas dependências, salvo se forem de confiança |
| Typosquatting (um nome quase igual ao verdadeiro) | confirma o nome e o autor com bun info antes de instalar |
| Versão acabada de publicar e envenenada | minimumReleaseAge (segundos) e minimumReleaseAgeExcludes |
| Vulnerabilidade conhecida | bun audit (só leitura) |
| Um scanner à tua medida | bunfig install.security scanner e bun pm scan |

Os scripts: fiz um pacote só meu (exemplos/gancho) com um postinstall inofensivo que escreve um ficheiro. Empacotei-o com bun pm pack e instalei-o noutro projeto com bun add ./pacote-com-gancho-1.0.0.tgz. Resultado: «Blocked 1 postinstall», o ficheiro não existiu, e o bun pm untrusted listou-o com «[postinstall]: node marca.js». O postinstall do próprio projeto raiz correu, o da dependência não. Depois:

    bun pm trust pacote-com-gancho
    ✓ [postinstall]: node marca.js

O script correu, e o nome foi para "trustedDependencies" no package.json. Numa reinstalação limpa voltou a correr; com --ignore-scripts não. Há ainda uma lista embutida de 367 pacotes de confiança (bun pm default-trusted); segundo a documentação, ela só vale para pacotes do npm (um file: ou git: tem de ser listado) e, se definires trustedDependencies, a lista substitui a embutida em vez de a estender.

O typosquatting verificou-se com um caso conhecido: o registo mostra o pacote crossenv (parecido com cross-env) criado em 2017-07-19, e hoje o npm substituiu-o por um «security holding package». Não o instalei.

O minimumReleaseAge funcionou na linha de comandos e no bunfig.toml (exemplos/bunfig-seguro.toml). O is-number 7.0.0 saiu em 2018: com 86400 segundos instalou; com 1000000000 falhou com «No version matching ... (blocked by minimum-release-age: 1000000000 seconds)»; com minimumReleaseAgeExcludes = ["is-number"] voltou a passar.

O bun audit deu «No vulnerabilities found (checked 6 packages)»; envia a lista de nomes e versões ao registo (ver a documentação) e não altera nada (o audit fix altera: não o corri). O bun pm scan sem scanner configurado só pede que configures um. O bun publish --dry-run, sem credenciais, listou os ficheiros mas terminou com «missing authentication» (código 1): para ver o que publicarias usa o bun pm pack --dry-run.

## bunx: executar sem instalar

    bunx semver 1.2.3 --increment minor      (imprimiu 1.3.0)

Instalou o semver e correu-o; a segunda execução levou 0,49 s contra 1,0 s. Com --no-install e um pacote que não estava instalado deu «Could not find an existing 'is-odd' binary». Com semver@7.6.0 instalou outra cópia. Onde ficou? A documentação diz que o bunx guarda os pacotes na cache global; na 1.4.0 no Windows vi uma pasta bunx-NÚMERO-semver@latest dentro da pasta temporária do sistema (TEMP). Para ficar na tua pasta, aponta TEMP e TMP para lá antes do bunx. Se o pacote já está em node_modules, o bunx usa-o (a documentação diz-o; na minha execução não apareceu o passo de instalação).

## bun link

    (na pasta do pacote)  bun link                      Registered "pacote-com-gancho"
    (noutro projeto)      bun link pacote-com-gancho    liga node_modules/pacote-com-gancho à pasta de origem
    (na pasta do pacote)  bun unlink

Com BUN_INSTALL numa pasta minha, o registo foi para essa pasta e não para ~/.bun. A origem fica ligada (editar nela vê-se no consumidor). Na 1.4.0 no Windows o bun link pacote não escreveu nada no package.json do consumidor, ao contrário do que a mensagem sugere («link:pacote»).

## Registos privados e com âmbito

Só descrevo (não usei credenciais). No bunfig.toml as secções install e install.scopes dizem onde ir buscar os pacotes de uma organização; os segredos vêm de variáveis de ambiente:

    [install.scopes]
    "@empresa" = { token = "$NPM_TOKEN", url = "https://registo.exemplo.invalid/" }

Verifiquei o encaminhamento: um bun add @empresa/modelo foi ao anfitrião da secção (falhou com «DNSResolveFailed», porque o domínio .invalid não existe) e um pacote sem âmbito continuou a ir ao npm. O Bun lê também o .npmrc. Nunca ponhas um token em claro num ficheiro que vá para o git (exemplos/bunfig-registos.toml).

O bun create cria projetos a partir de um componente React, de um pacote create-nome do npm, de um repositório do GitHub ou de um modelo local. Não o executei (descarregaria pacotes e escreveria ficheiros); o bun init (módulo 00) cria um projeto vazio.

## A «dieta»: quando não precisas de pacote

| Pacote npm comum | O que o Bun ou o JavaScript já traz | Módulo |
|---|---|---|
| is-number | Number.isFinite (exemplos/dieta.ts) | 01 |
| is-odd | n % 2 | 01 |
| left-pad | padStart (com um só carácter: com «xy» o left-pad repete o padrão a mais) | 01 |
| semver (satisfies e order) | Bun.semver | 07 |
| dotenv | .env carregado sozinho | 01 |
| nodemon, ts-node | bun --watch, bun run ficheiro.ts | 01 |
| glob, execa, rimraf | Bun.Glob, Bun.$, Bun.spawn | 02 |
| express, serve-static, swagger-ui-express | Bun.serve com routes, Bun.file, OpenAPI | 03 |
| axios, node-fetch, ws | fetch, WebSocket | 04 |
| better-sqlite3, pg, mysql2 | bun:sqlite, Bun.sql | 05 |
| ioredis, aws-sdk (S3) | RedisClient, S3Client | 06 |
| bcrypt, uuid, js-yaml, pako | Bun.password, randomUUIDv7, Bun.YAML, gzip | 07 |
| jest, vitest, supertest | bun test | 08 |

Comparei o is-number, o is-odd, o left-pad e o semver reais com as versões nativas do exemplo: deram o mesmo resultado em todos os casos que tentei (inclui " 7 ", "0x10", NaN, Infinity), com a exceção do left-pad e do enchimento de dois carateres. O que a dieta não cobre: o jsonwebtoken, as bibliotecas de interface, os drivers de bases de dados que o Bun não traz e tudo o que é mais do que uma função de duas linhas. Cada dependência é código que atualizas, auditas e a que dás confiança: pergunta primeiro o que o Bun já traz.

## Medir a instalação

O exemplos/medir-instalacao.ts cria uma pasta temporária com projeto e cache próprios, mede o bun install e apaga tudo. Mediana de 5 execuções, em milissegundos, com o arranque do processo incluído (um bun --version levou 430 a 470 ms nesta máquina):

| Situação | Tempo |
|---|---|
| Cache vazia (descarrega 6 pacotes) | 846 |
| Cache cheia, sem node_modules | 765 |
| node_modules completo (só verifica) | 404 |

Em repetições soltas a cache vazia deu 805 a 1173 ms e a cache cheia 721 a 848 ms. Valores indicativos: dependem de rede, antivírus e disco, e não os comparei com o npm. O ganho da cache é pequeno com pacotes minúsculos.

## Diferenças entre a 1.4.0 e a documentação atual

- A documentação (1.4.5) lista a loja virtual global, as extensões de pacotes e o bun prune; não os testei. Existiam na 1.4.0: bun ci, why, info, audit, dedupe, pm scan, minimumReleaseAge, --catalog, --linker e Bun.JSONC.
- Peculiaridades do Windows e da 1.4.0 que vi: o bun link pacote não escreve no package.json; o bun publish --dry-run exige credenciais; o bunx guarda em TEMP; um bun -e com Bun.stdin.text() sobre um JSON grande vindo de um pipe falhou uma vez com EUNKNOWN (não o repeti).
- Um .tsx sem tsconfig fez o auto-install instalar o react sozinho na cache global: com BUN_INSTALL_CACHE_DIR definida, isso fica na tua cache.

## Exercícios

**PRATICAR:** faz os exercícios 37 a 40 do módulo 13 (da versão ao intervalo com update e update --latest, um gancho de instalação sob vigilância, um monorepo de dois pacotes com catálogo e um patch persistente). As soluções estão no módulo 15.

## Fontes oficiais

- [Bun: bun install](https://bun.com/docs/cli/install)
- [Bun: bunx](https://bun.com/docs/cli/bunx)
- [Bun: bun pm](https://bun.com/docs/cli/pm)
- [Bun: bun link](https://bun.com/docs/cli/link)
- [Bun: workspaces](https://bun.com/docs/install/workspaces)
- [Bun: catálogos](https://bun.com/docs/install/catalogs)
- [Bun: overrides e resolutions](https://bun.com/docs/install/overrides)
- [Bun: bun patch](https://bun.com/docs/install/patch)
- [Bun: lockfile](https://bun.com/docs/install/lockfile)
- [Bun: scripts de ciclo de vida](https://bun.com/docs/install/lifecycle)
- [Bun: registos e âmbitos](https://bun.com/docs/install/registries)
- [Bun: cache global](https://bun.com/docs/install/cache)
- [Bun: bun audit](https://bun.com/docs/install/audit)
- [Bun: bun create](https://bun.com/docs/runtime/templating/create)
- [Bun: bunfig.toml](https://bun.com/docs/runtime/bunfig)
- [npm: package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [Node.js: pacotes e exports](https://nodejs.org/api/packages.html)
- [semver.org](https://semver.org/lang/pt-BR/)
