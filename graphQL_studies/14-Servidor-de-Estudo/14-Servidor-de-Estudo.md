# 14 Servidor de estudo

## O que vais ter

Um servidor GraphQL **completo e pronto a correr**, que junta o que aprendeste nos módulos 01 a 10, com os dados **guardados em memória**: existem enquanto o processo estiver ativo e voltam ao início quando o paras e arrancas de novo. Ao lado, um ficheiro `requests.http` com 26 pedidos para testares com a extensão **REST Client** do VS Code.

Tudo está na pasta `14-Servidor-de-Estudo/servidor/`:

| Ficheiro | Conteúdo |
|---|---|
| `package.json` | Dependências e scripts (`start`, `dev`, `test`) |
| `src/schema.mjs` | O schema em SDL |
| `src/dados.mjs` | Dados iniciais, armazenamento em memória e utilizadores de teste |
| `src/resolvers.mjs` | Resolvers, autorização, paginação e erros |
| `src/servidor.mjs` | Criação do Apollo Server e do contexto por pedido (com DataLoader) |
| `src/index.mjs` | Arranque e encerramento limpo |
| `test/api.test.mjs` | 11 testes automáticos com `executeOperation` |
| `requests.http` | Pedidos para o REST Client |

## Arrancar o servidor

Precisas de Node.js 20 ou superior. Na pasta `servidor`:

    npm install
    npm start

A consola mostra `Servidor GraphQL pronto em http://localhost:4000/`. Para parar, `Ctrl+C`. Se a porta 4000 estiver ocupada, usa outra:

    PORT=4010 npm start

No PowerShell:

    $env:PORT = 4010; npm start

Se mudares a porta, altera também a variável `@host` no topo do `requests.http`.

**DICA:** `npm run dev` arranca com `node --watch`, que reinicia o servidor quando gravas um ficheiro. Lembra-te de que, em cada reinício, os dados em memória voltam ao estado inicial.

**NOTA:** abrir `http://localhost:4000/` num browser mostra o Apollo Sandbox, onde também podes explorar o schema.

## O que o servidor faz

O schema segue o projeto fio condutor da biblioteca:

| Operação | Descrição | Quem pode |
|---|---|---|
| `livros(filtro, first, after)` | Lista paginada (connection) com filtro por género, ano mínimo e texto | Todos |
| `livro(id)`, `autores`, `autor(id)` | Leituras com relações | Todos |
| `eu` | O utilizador do token (ou `null`) | Todos |
| `criarAutor` | Cria um autor | `ADMIN` |
| `criarLivro` | Devolve `Livro` ou `ErroValidacao` (união) | `ADMIN` |
| `atualizarLivro`, `apagarLivro` | Altera ou apaga (apagar remove as críticas) | `ADMIN` |
| `criarCritica` | Nota de 1 a 5 | Autenticado |
| `reiniciarDados` | Repõe os dados iniciais | `ADMIN` |

Os dados iniciais são três autores (Saramago, Pessoa e Sophia), cinco livros e três críticas.

### Utilizadores de teste

A autenticação é simulada por uma tabela de tokens em `src/dados.mjs`:

| Cabeçalho `Authorization` | Utilizador | Papel |
|---|---|---|
| (nenhum) | Anónimo | Sem sessão |
| `Bearer tok-leitor` | Rui Leitor | `LEITOR` |
| `Bearer tok-admin` | Ana Admin | `ADMIN` |

**ATENÇÃO:** estes tokens são só para estudo. Num projeto real, valida-se um JWT ou uma sessão (módulo 08), e nunca se guardam tokens fixos no código.

## Onde está cada módulo do curso

| Conceito | Onde aparece |
|---|---|
| Schema, enums, inputs, união (módulo 02) | `schema.mjs` |
| Mutations com `input` (módulo 03) | `Mutation` em `resolvers.mjs` |
| Resolvers e contexto por pedido (módulo 04) | `resolvers.mjs` e `servidor.mjs` |
| Connection e cursores, limite de `first` (módulo 06) | função `paginar` |
| `GraphQLError` com `code`, erros como dados (módulo 07) | `erro()` e `criarLivro` |
| Autenticação e papéis (módulo 08) | `criarContexto` e `exigir` |
| DataLoader (módulo 09) | `loaders` em `criarContexto` |
| Testes com `executeOperation` (módulo 10) | `test/api.test.mjs` |

## Os dados em memória

O armazenamento é um objeto JavaScript (`store`) criado **uma vez** no arranque e partilhado por todos os pedidos. Isto tem consequências que convém conhecer:

- as alterações são vistas por **todos** os clientes, enquanto o servidor estiver a correr;
- ao parar o processo, **tudo se perde**. É o comportamento pretendido para estudo;
- não há concorrência a tratar: o Node executa os resolvers numa só *thread*;
- para repor o estado sem reiniciar, usa a mutation `reiniciarDados` (pedido 5.3).

O contexto e os DataLoaders, ao contrário do `store`, são criados **por pedido** (módulos 04 e 09).

## Testar com o REST Client

O **REST Client** é uma extensão do VS Code (identificador `humao.rest-client`) que envia pedidos HTTP escritos num ficheiro `.http` e mostra a resposta ao lado.

1. No VS Code, instala a extensão **REST Client**.
2. Abre `servidor/requests.http`.
3. Com o servidor a correr, clica em **Send Request** por cima de cada pedido (ou usa `Ctrl+Alt+R`).

### Como se escreve um pedido GraphQL

O REST Client reconhece o cabeçalho `X-REQUEST-TYPE: GraphQL`: o corpo passa a ser a operação, uma **linha em branco** e as **variáveis em JSON**, e a extensão monta o JSON do pedido por ti.

    ### Um livro por id
    POST {{host}}
    Content-Type: application/json
    Authorization: {{admin}}
    X-REQUEST-TYPE: GraphQL

    query LivroPorId($id: ID!) {
      livro(id: $id) { titulo autor { nome } }
    }

    { "id": "1" }

Pontos a reter:

- `@host`, `@admin` e `@leitor` são **variáveis do ficheiro**, definidas no topo e usadas com `{{nome}}`;
- `###` separa os pedidos;
- sem o cabeçalho `X-REQUEST-TYPE`, o corpo é enviado tal e qual. O último pedido do ficheiro mostra o mesmo pedido em JSON puro, útil para veres o que viaja na rede.

**NOTA:** os 26 pedidos foram executados contra o servidor a correr, por um pequeno programa que reproduz este formato, e todos responderam como descrito. Não foram abertos dentro da extensão do VS Code; se algum não se comportar como esperado aí, confirma a versão da extensão.

### Roteiro de pedidos

| Grupo | Pedidos | O que mostra |
|---|---|---|
| 1. Leitura | 1.1 a 1.6 | Relações, variáveis, filtros, paginação por cursor, fragments e aliases |
| 2. Autenticação | 2.1 e 2.2 | `eu` sem token e com token |
| 3. Escrita | 3.1 a 3.7 | Criar, atualizar, apagar, união de resultados, mutations em série |
| 4. Erros | 4.1 a 4.7 | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_USER_INPUT`, validação |
| 5. Utilidades | 5.1 a 5.3 | Introspeção e reposição dos dados |
| 6. JSON puro | 6.1 | O mesmo pedido sem o modo GraphQL |

**ATENÇÃO:** o pedido **1.5** (página seguinte) tem de levar o `endCursor` que recebeste no 1.4. Copia o valor para o campo `after`: com o texto de exemplo, o servidor responde `BAD_USER_INPUT` (cursor inválido), que é o comportamento correto.

**DICA:** experimenta por esta ordem: 1.1, 3.2 (cria um livro, mas antes cria o autor com o 3.1, porque o 3.2 usa o autor `4`), 1.1 outra vez para veres o livro novo, 2.2, 4.1, 4.2 e, no fim, 5.3 para repor tudo.

## Respostas e estado HTTP

Alguns resultados que vais ver no REST Client:

| Pedido | Estado HTTP | Resposta |
|---|---|---|
| Leitura normal | 200 | `data` com os campos pedidos |
| Erro num resolver (`FORBIDDEN`, `NOT_FOUND`) | 200 | `errors` com `extensions.code` e `data` parcial ou `null` |
| Campo inexistente | 400 | `GRAPHQL_VALIDATION_FAILED` |
| Variável obrigatória em falta | 400 | `BAD_USER_INPUT` |
| Erro de domínio em `criarLivro` | 200 | `data.criarLivro.__typename` igual a `ErroValidacao` |

Confirma assim o que viste no módulo 07: erros de execução vêm com estado 200, e só os erros de validação do pedido têm 400.

## Correr os testes

    npm test

São 11 testes, com `node --test`, que usam `executeOperation` e um `store` novo em cada teste, para não dependerem uns dos outros. Cobrem listagem, filtros, paginação até ao fim, limites, autorização por papel, erros de domínio, validação da nota, remoção em cascata, reposição de dados e agrupamento do DataLoader.

## Ideias para evoluir

1. Acrescentar `criticas` paginadas, como `livros`.
2. Criar a subscription `criticaAdicionada` (módulo 03): requer trocar o `startStandaloneServer` por um servidor HTTP com WebSocket (`graphql-ws`), conforme a documentação do Apollo.
3. Gravar os dados num ficheiro JSON ao parar e lê-los ao arrancar, para sobreviverem a reinícios.
4. Trocar os tokens fixos por JWT com a biblioteca `jose`.
5. Acrescentar a regra de profundidade do exercício 38.
6. Resolver os exercícios 15 a 43 do módulo 11 sobre este servidor.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `EADDRINUSE` ao arrancar | A porta já está ocupada: pára o outro processo ou usa `PORT` |
| O REST Client não liga | O servidor não está a correr ou o `@host` tem outra porta |
| `Cannot use import statement outside a module` | Estás fora da pasta `servidor`, onde `"type": "module"` está definido |
| Os dados desapareceram | O servidor foi reiniciado (`npm run dev` reinicia a cada gravação) |
| `UNAUTHENTICATED` com o token certo | Falta o prefixo `Bearer ` no cabeçalho |
| A resposta vem como texto, não como GraphQL | Falta o cabeçalho `X-REQUEST-TYPE: GraphQL` ou a linha em branco antes das variáveis |
| `Cursor inválido` na paginação | O `after` não é o `endCursor` devolvido pela página anterior |

## Fontes oficiais

- [Apollo Server: primeiros passos](https://www.apollographql.com/docs/apollo-server/getting-started)
- [Testar com Apollo Server](https://www.apollographql.com/docs/apollo-server/testing/testing)
- [REST Client: pedidos GraphQL](https://github.com/Huachao/vscode-restclient#making-graphql-request)
- [Servir sobre HTTP](https://graphql.org/learn/serving-over-http/)
