# 14 Consulta rápida

Uma página para consultar no dia a dia. Tudo o que aparece foi executado no curso com o **Bun 1.4.0 no Windows 11**. A documentação oficial já descreve a 1.4.5, por isso algumas opções documentadas não existem na 1.4.0 (as diferenças estão no fim). Para o detalhe, vê o módulo indicado.

## Executar (módulo 01)

| Tarefa | Comando ou nota |
|---|---|
| Executar um ficheiro | bun run ficheiro.ts (ou bun ficheiro.ts) |
| Reiniciar ao guardar | bun --watch ficheiro.ts |
| Recarregar sem reiniciar o processo | bun --hot ficheiro.ts |
| Variáveis de ambiente | .env, .env.local e .env.production são carregados sozinhos; --env-file substitui esse carregamento |
| Aceder às variáveis | Bun.env ou process.env |
| Pasta e ficheiro atuais | import.meta.dir e import.meta.file |
| Argumentos | Bun.argv |

**ATENÇÃO:** o Bun executa TypeScript mas **não verifica tipos**: um erro de tipos não impede a execução. O bunfig.toml é lido da pasta atual, e não da pasta do ficheiro.

## Ficheiros e sistema (módulo 02)

| Tarefa | API |
|---|---|
| Ler | await Bun.file(caminho).text(), .json(), .exists() |
| Escrever | await Bun.write(caminho, conteúdo) |
| Escrever aos poucos | Bun.file(caminho).writer() (não trunca um ficheiro existente: escreve primeiro um texto vazio) |
| Procurar ficheiros | new Bun.Glob("**/*.ts").scan() |
| Executar comandos | await Bun.$ com o comando num template, ou Bun.spawn |
| Esperar | await Bun.sleep(ms) |

**ATENÇÃO (Windows, 1.4.0):** `Bun.write(destino, ficheiroFatia)` copia o ficheiro inteiro. O `Bun.$` estraga acentos escritos literalmente no template: passa-os por interpolação. Termina processos só pelo PID que lançaste.

## Servidor HTTP (módulo 03)

| Tarefa | API |
|---|---|
| Servidor | Bun.serve({ port, routes, fetch }) |
| Rota com parâmetro | "/api/produtos/:id", com req.params já descodificado |
| Resposta JSON | Response.json(dados, { status }) |
| Ficheiro com Content-Type e Range | new Response(Bun.file(caminho)) |
| WebSocket | server.upgrade(req) e os handlers open, message e close |
| Parar | server.stop() |

| Comportamento medido | Nota |
|---|---|
| Método não definido numa rota | Cai no fetch de reserva (404): não há 405 automático |
| Barra final | Não casa com a rota |
| idleTimeout | Tratar como mínimo: as ligações foram cortadas ao fim de 2 a 4 vezes o valor |
| req.json() que lança sem handler de erro | Resposta 500 e o processo termina com código 1 |

## Documentar com OpenAPI e Swagger UI (módulo 03)

| Peça | Como |
|---|---|
| Documento | Objeto TypeScript servido em /openapi.json |
| Sem desatualizar | Uma só tabela de rotas gera as rotas do servidor e o OpenAPI |
| Interface | Página HTML em /docs que carrega o Swagger UI de uma CDN, com SRI |
| Validar pedidos | O Bun não traz validador de JSON Schema: o curso usa um mini validador escrito à mão |
| Offline | swagger-ui-dist do npm é uma dependência: só serve para comparar |

## Cliente e Web APIs (módulo 04)

| Tarefa | API |
|---|---|
| Pedido HTTP | await fetch(url, { method, headers, body }) |
| Tempo limite | AbortSignal.timeout(ms) |
| Cliente WebSocket | new WebSocket(url) |
| Transformar HTML em streaming | new HTMLRewriter().on(seletor, handler).transform(resposta) |
| Eventos do servidor (SSE) | EventSource não existe no 1.4.0: ler com fetch em streaming |

## Bases de dados (módulo 05)

| Tarefa | API |
|---|---|
| SQLite embutido | import { Database } from "bun:sqlite" |
| Consulta | db.query(sql).all(parametros) |
| Transação | db.transaction(função) |
| Uma API para SQLite, PostgreSQL e MySQL | Bun.sql com tagged templates: await sql com a consulta e os valores interpolados |

**ATENÇÃO:** o bun:sqlite abre com `PRAGMA foreign_keys` desligado. No MySQL 8.4 por TCP é preciso allowPublicKeyRetrieval: true. No PostgreSQL, um array só funciona com sql.array(valores, "INT"). Para o número de linhas escritas usa affectedRows ?? count. O bun:sqlite foi muito mais rápido do que Bun.sql sobre SQLite (20 a 39 ms contra 307 a 343 ms em 20000 leituras).

## Redis e S3 (módulo 06)

| Tarefa | API |
|---|---|
| Redis (e Valkey) | Bun.redis ou new RedisClient(url) |
| Ler e escrever | await redis.get(chave) e await redis.set(chave, valor) |
| Cliente S3 | new S3Client({ endpoint, bucket, ... }) |
| Ficheiro no S3 | s3.file(chave): text(), write(), delete() |
| URL pré-assinado | s3.file(chave).presign({ expiresIn }) |

**ATENÇÃO:** o Bun 1.4.0 não cria buckets: usa a ferramenta do servidor. Antes de fechar um cliente Redis em modo subscritor, faz unsubscribe. Uma porta fechada demora cerca de 31 s a falhar com a configuração por omissão.

## Segurança e utilitários (módulo 07)

| Necessidade | Nativo |
|---|---|
| Hash de palavra-passe | Bun.password.hash e Bun.password.verify (argon2id ou bcrypt) |
| Hashes | new Bun.CryptoHasher("sha256"), Bun.hash |
| Criptografia | crypto.subtle (HMAC, AES-GCM, ECDSA, Ed25519, PBKDF2) |
| Identificadores | crypto.randomUUID(), Bun.randomUUIDv7() |
| CSRF | Bun.CSRF |
| Credenciais do sistema | Bun.secrets (Credential Manager no Windows) |
| Compressão | Bun.gzipSync, Bun.deflateSync, zstd |
| Versões | Bun.semver |

**ATENÇÃO:** não há JWT no Bun. `Bun.markdown.html` não sanitiza (deixa passar scripts). O bcrypt acima de 72 bytes faz um SHA-512 prévio.

## Testes (módulo 08)

| Tarefa | Comando ou API |
|---|---|
| Correr os testes | bun test |
| Filtrar por nome | bun test -t "texto" |
| Cobertura | bun test --coverage |
| Mocks | mock(), spyOn, mock.module |
| Snapshots | toMatchSnapshot e bun test -u |
| Relatórios | --reporter=junit (ou dots) |

**ATENÇÃO:** o mock.module vale para o ficheiro inteiro e escapa para os seguintes, e o mock.restore() não o desfaz (usa --isolate). O coverageThreshold aplica-se por ficheiro e, quando falha, o código de saída é 1 sem mensagem. Com CI=true o Bun recusa test.only.

## Bundler e executáveis (módulo 09)

| Tarefa | Comando |
|---|---|
| Empacotar | bun build entrada.ts --outdir dist |
| API | await Bun.build({ entrypoints, outdir }) |
| Executável único | bun build --compile entrada.ts --outfile loja |
| Outra plataforma | bun build --compile --target=bun-windows-arm64 ... (descarrega o runtime para a cache do Bun) |
| Página HTML com scripts e CSS | Bun.serve a servir um HTML importado |
| Embutir ficheiros | import com type file, e Bun.embeddedFiles |

**ATENÇÃO:** `--aot` e `--trim` são aceites mas não têm efeito na 1.4.0. Com Bun.build e compile, o outfile é ignorado. O executável da loja ficou com cerca de 88 MB e não arrancou mais depressa do que bun run.

## Pacotes e workspaces (módulo 10)

| Tarefa | Comando |
|---|---|
| Instalar | bun install (cria o bun.lock, em texto) |
| Reproduzir | bun install --frozen-lockfile |
| Adicionar ou remover | bun add pacote e bun remove pacote |
| Porquê este pacote | bun why pacote |
| Executar sem instalar | bunx pacote |
| Corrigir um pacote | bun patch |
| Cache própria | --cache-dir, para não tocar na cache global |
| Scripts de dependências | Não correm por omissão: só os de trustedDependencies |

**ATENÇÃO:** `bun pm cache rm` também apaga os pacotes do bunx na pasta TEMP do sistema. `bun publish --dry-run` lista os ficheiros mas termina com «missing authentication». Num workspace novo, o linker isolated é o que vem por omissão, e um import «fantasma» falha.

## Concorrência e interoperabilidade (módulo 11)

| Tarefa | API |
|---|---|
| Paralelismo | new Worker(url), postMessage, terminate() |
| Memória partilhada | SharedArrayBuffer com Atomics |
| Processos | Bun.spawn com a opção ipc |
| C e bibliotecas do sistema | bun:ffi (dlopen); cc usa um TinyCC embutido |
| WebAssembly | WebAssembly.instantiate |
| Transpilar | new Bun.Transpiler() |

**ATENÇÃO:** o cluster com HTTP só balanceia no Linux. Com um filho Node, o IPC exige serialization json. Com 25 linhas reais o cálculo sequencial ganha aos Workers; com 2 milhões de linhas o ganho foi de 3 a 4 vezes.

## Diferenças entre a 1.4.0 e a documentação (1.4.5)

| Documentado | Na 1.4.0 |
|---|---|
| bun check e bun fmt | Não existem |
| import.meta.glob | Não existe |
| EventSource | Não existe |
| jest.mock | Não existe (existem vi.mock e jest.fn) |
| db.function e db.aggregate no bun:sqlite | Não existem |

## Regras ao experimentar

1. Dá a cada servidor a sua porta e termina **só** o processo que lançaste, pelo PID. O utilizador tem os seus próprios processos bun e node.
2. Não instales nada globalmente, e usa uma cache própria quando testas pacotes.
3. Nunca deixes node_modules, bun.lock, ficheiros SQLite nem executáveis na pasta do curso.
4. Confirma sempre na versão que tens instalada: a documentação anda à frente.

## Exercícios

**PRATICAR:** usa esta página para resolver os exercícios do módulo 13 sem abrir a documentação.

## Fontes oficiais

- [Documentação do Bun](https://bun.com/docs)
- [Bun.serve](https://bun.com/docs/api/http)
- [bun:sqlite](https://bun.com/docs/api/sqlite)
- [bun test](https://bun.com/docs/test)
- [Bundler](https://bun.com/docs/bundler)
