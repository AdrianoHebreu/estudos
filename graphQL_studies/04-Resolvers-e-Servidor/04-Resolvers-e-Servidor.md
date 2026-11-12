# 04 Resolvers e servidor

## O que é um resolver

O schema diz **o que** existe; os **resolvers** dizem **como obter** cada campo. Um resolver é uma função associada a um campo de um tipo. O servidor percorre a consulta e chama o resolver de cada campo pedido.

Os resolvers organizam-se num objeto com a mesma forma do schema:

    const resolvers = {
      Query: {
        livros: () => livros,
        livro: (_pai, { id }) => livros.find((l) => l.id === id) ?? null,
      },
      Mutation: {
        criarLivro: (_pai, { titulo, autorId }) => { /* ... */ },
      },
      Livro: {
        autor: (livro) => autores.find((a) => a.id === livro.autorId),
      },
    }

## Os quatro argumentos

Cada resolver recebe `(pai, args, contexto, info)`:

| Argumento | Conteúdo |
|---|---|
| `pai` | O valor devolvido pelo resolver do campo anterior (nos campos de topo é o valor raiz) |
| `args` | Os argumentos do campo, já validados e convertidos |
| `contexto` | Objeto partilhado por **todos** os resolvers do mesmo pedido |
| `info` | Metadados da execução: nome do campo, caminho, schema |

O `pai` é a chave para as relações. Em `Livro.autor`, o `pai` é o livro devolvido por `Query.livro`, e é dele que tiras o `autorId`.

## Resolvers por omissão

Se não escreveres resolver para um campo, o servidor usa o **resolver por omissão**: devolve `pai[nomeDoCampo]` (e, se for uma função, chama-a). Por isso `Livro.titulo` funciona sem código se o objeto tiver `titulo`.

Só precisas de resolvers explícitos para:

- campos de topo (`Query`, `Mutation`, `Subscription`);
- relações, onde o pai só guarda um identificador (`autorId`);
- campos calculados ou cujo nome difere do dado;
- campos que exigem permissões ou lógica especial.

## Apollo Server

O **Apollo Server** é um dos servidores mais usados para Node.js. Instalação:

    mkdir biblioteca-api && cd biblioteca-api
    npm init -y
    npm install @apollo/server graphql

Para usar `import`, acrescenta `"type": "module"` ao `package.json`. Servidor completo, num único ficheiro `index.mjs`:

    import { ApolloServer } from '@apollo/server'
    import { startStandaloneServer } from '@apollo/server/standalone'

    const typeDefs = `#graphql
      enum Genero { FICCAO POESIA }
      type Autor { id: ID! nome: String! livros: [Livro!]! }
      type Livro { id: ID! titulo: String! genero: Genero! autor: Autor! }
      type Query { livros: [Livro!]! livro(id: ID!): Livro }
      type Mutation { criarLivro(titulo: String!, autorId: ID!): Livro! }
    `

    const autores = [{ id: '1', nome: 'José Saramago' }]
    const livros = [{ id: '1', titulo: 'Ensaio sobre a Cegueira', genero: 'FICCAO', autorId: '1' }]

    const resolvers = {
      Query: {
        livros: () => livros,
        livro: (_p, { id }) => livros.find((l) => l.id === id) ?? null,
      },
      Mutation: {
        criarLivro: (_p, { titulo, autorId }) => {
          const livro = { id: String(livros.length + 1), titulo, genero: 'FICCAO', autorId }
          livros.push(livro)
          return livro
        },
      },
      Livro: { autor: (l) => autores.find((a) => a.id === l.autorId) },
      Autor: { livros: (a) => livros.filter((l) => l.autorId === a.id) },
    }

    const server = new ApolloServer({ typeDefs, resolvers })
    const { url } = await startStandaloneServer(server, { listen: { port: 4000 } })
    console.log(`Servidor pronto em ${url}`)

Arranca com `node index.mjs` e abre `http://localhost:4000/` no browser: aparece o Apollo Sandbox, onde podes escrever consultas com autocompletar.

**NOTA:** estes exemplos foram executados com Apollo Server 5 e `graphql` 16. O comentário `#graphql` antes do schema só serve para o editor colorir a SDL.

**ATENÇÃO:** o Apollo Server 4 chegou ao fim de vida. Em projetos novos usa a versão 5, que exige `graphql` 16.

## Relações e o `pai`

Na consulta abaixo, o servidor chama `Query.livros`, e para **cada** livro chama `Livro.autor`, e para cada autor `Autor.livros`:

    query {
      livros {
        titulo
        autor { nome livros { id } }
      }
    }

Os resolvers são independentes: `Livro.autor` não sabe quem pediu o livro. Isto é elegante, mas esconde um custo: se `Livro.autor` fizer uma ida à base de dados, uma lista de 100 livros faz 100 idas. É o **problema N+1**, tratado no módulo 09.

## O contexto

O **contexto** é criado **uma vez por pedido** e passado a todos os resolvers. É o sítio certo para:

- o utilizador autenticado (módulo 08);
- ligações a base de dados e serviços;
- *loaders* de dados (módulo 09).

    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
      context: async ({ req }) => ({
        token: req.headers.authorization ?? null,
        db,
      }),
    })

    // um resolver usa o contexto no 3.º argumento
    livros: (_p, _args, { db }) => db.livros.todos(),

**ATENÇÃO:** cria o contexto **por pedido**, nunca como objeto global partilhado. Dados de um utilizador num objeto global vazariam para o pedido do utilizador seguinte.

## Resolvers assíncronos

Um resolver pode devolver um valor ou uma `Promise`, e o servidor espera por ela. Por isso o `async/await` encaixa naturalmente:

    Query: {
      livro: async (_p, { id }, { db }) => {
        const livro = await db.livros.porId(id)
        return livro ?? null
      },
    }

Campos irmãos executam em paralelo, e cada resolver só começa quando o pai termina.

## Devolver `null` e lançar erros

- Devolver `null` num campo **nulável** é normal (por exemplo, livro não encontrado).
- Devolver `null` num campo `!` gera um erro e propaga o `null` ao pai (módulo 02).
- Lançar uma exceção é registado em `errors` e o campo fica `null`:

    import { GraphQLError } from 'graphql'

    livro: async (_p, { id }, { db }) => {
      const livro = await db.livros.porId(id)
      if (!livro) {
        throw new GraphQLError('Livro não encontrado', {
          extensions: { code: 'NOT_FOUND', id },
        })
      }
      return livro
    }

A resposta fica com `data: { livro: null }` e um item em `errors` com `extensions.code`. O módulo 07 aprofunda o tratamento de erros.

**NOTA:** com `NODE_ENV` diferente de `production`, o Apollo inclui o `stacktrace` nas extensões de cada erro. Em produção, define `NODE_ENV=production` para não expor detalhes internos.

## Estrutura de projeto sugerida

Quando o ficheiro único crescer, separa por responsabilidade:

    src/
      schema/
        livro.graphql
        autor.graphql
      resolvers/
        query.js
        mutation.js
        livro.js
      context.js
      index.js

Mantém os resolvers **finos**: validam entradas, chamam uma camada de serviço ou de dados e devolvem o resultado. A lógica de negócio fica fora, onde pode ser testada sem GraphQL.

## Subscriptions no servidor

O `startStandaloneServer` **não** suporta subscriptions. Para as usar, o Apollo recomenda montar o servidor HTTP e um servidor WebSocket (`ws` com a biblioteca `graphql-ws`) à mão, com o schema construído por `makeExecutableSchema`. A configuração completa tem vários passos e está descrita na documentação do Apollo (ver fontes).

Do lado do schema, a subscription tem um resolver com `subscribe`, que devolve um iterador assíncrono, e opcionalmente `resolve`, que transforma o evento:

    Subscription: {
      criticaAdicionada: {
        subscribe: () => pubsub.asyncIterableIterator(['CRITICA_ADICIONADA']),
      },
    }

**NOTA:** esta parte não foi executada neste curso; segue a documentação oficial para o arranque do servidor WebSocket.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Cannot return null for non-nullable field Livro.autor` | O resolver não encontrou o autor, mas o campo é `Autor!` |
| Campo devolve `null` sem erro | Resolver sem `return` (por exemplo, chavetas numa arrow function) |
| `Cannot use import statement outside a module` | Falta `"type": "module"` no `package.json` ou o ficheiro não é `.mjs` |
| Resolver de relação nunca é chamado | O resolver está sob o tipo errado (`Autor` em vez de `Livro`) |
| `Query root type must be provided` | O schema não tem `type Query` |
| Dados de outro utilizador aparecem | Contexto criado fora da função por pedido |

## Exercícios

**PRATICAR:** exercícios 15 a 18 do módulo 11 (servidor com `livros`, relação autor, contexto, mutation).

## Fontes oficiais

- [Apollo Server: primeiros passos](https://www.apollographql.com/docs/apollo-server/getting-started)
- [Resolvers](https://www.apollographql.com/docs/apollo-server/data/resolvers)
- [Contexto](https://www.apollographql.com/docs/apollo-server/data/context)
- [Subscriptions no Apollo Server](https://www.apollographql.com/docs/apollo-server/data/subscriptions)
- [Execução no GraphQL](https://graphql.org/learn/execution/)
