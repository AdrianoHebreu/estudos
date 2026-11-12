# 13 Soluções

## Como usar

Confirma o teu trabalho **só depois de tentares**. Muitas soluções têm mais de uma forma correta: o importante é o resultado e a razão. As soluções de código usam o servidor e o schema do módulo 04.

## Módulos 00 e 01

**Exercício 1.** A resposta tem sempre a mesma forma da consulta: se pedires `{ paises { nome } }` recebes `{"data":{"paises":[{"nome":"..."}]}}`. Os campos de `Query` aparecem no explorador (`Docs`).

**Exercício 2.**

    query ListarLivros {
      livros { id titulo autor { nome } }
    }

**Exercício 3.**

    query {
      primeiro: livro(id: "1") { titulo }
      segundo: livro(id: "2") { titulo }
    }

**Exercício 4.** Uma só query com a variável `$id`, enviada à parte:

    query LivroPorId($id: ID!) { livro(id: $id) { titulo } }

    // variáveis
    { "id": "1" }

    curl -X POST http://localhost:4000/ -H "Content-Type: application/json" \
      -d '{"query":"query($id: ID!){ livro(id:$id){ titulo } }","variables":{"id":"1"}}'

**Exercício 5.**

    query {
      livros { ...ResumoLivro }
      maisVendido: livro(id: "1") { ...ResumoLivro }
    }
    fragment ResumoLivro on Livro { id titulo ano }

**Exercício 6.**

    query ($comCriticas: Boolean!) {
      livro(id: "1") {
        titulo
        criticas @include(if: $comCriticas) { nota }
      }
    }

Para `@skip` basta inverter a lógica: `@skip(if: $semCriticas)`.

## Módulo 02

**Exercício 7.** Usa o schema completo do módulo 02. As listas são `[Livro!]!` porque nem a lista nem os itens devem ser `null`: uma lista vazia é `[]`, e um item `null` seria um erro de dados.

**Exercício 8.**

    enum Genero { FICCAO NAO_FICCAO POESIA TEATRO }
    input FiltroLivros { genero: Genero anoMinimo: Int }
    type Query { livros(filtro: FiltroLivros): [Livro!]! }

**Exercício 9.**

    interface Publicacao { id: ID! titulo: String! }
    type Livro implements Publicacao { id: ID! titulo: String! autor: Autor! }
    type Revista implements Publicacao { id: ID! titulo: String! edicao: Int! }
    union ResultadoPesquisa = Livro | Autor

    query {
      publicacoes {
        titulo
        ... on Livro { autor { nome } }
        ... on Revista { edicao }
      }
    }

**Exercício 10.**

    type Livro {
      titulo: String!
      nome: String @deprecated(reason: "Usa o campo titulo.")
    }

## Módulo 03

**Exercício 11.**

    mutation CriarLivro($input: NovoLivro!) {
      criarLivro(input: $input) { id titulo autor { nome } }
    }
    // { "input": { "titulo": "X", "genero": "FICCAO", "autorId": "1" } }

**Exercício 12.**

    mutation {
      criarLivro(input: { titulo: "", genero: FICCAO, autorId: "1" }) {
        livro { id }
        erros { campo mensagem }
      }
    }

O cliente verifica primeiro `erros` e só depois usa `livro`.

**Exercício 13.** Os campos de topo de uma mutation executam **em série, pela ordem escrita**: `a` termina antes de `b` começar.

**Exercício 14.**

    type Subscription { criticaAdicionada(livroId: ID!): Critica! }

    subscription ($livroId: ID!) {
      criticaAdicionada(livroId: $livroId) { id nota }
    }

Transporte: WebSocket com `graphql-ws`, o mais usado. SSE é uma alternativa mais simples quando só o servidor envia.

## Módulos 04 e 05

**Exercício 15.** É o servidor do módulo 04. `node index.mjs` e abre `http://localhost:4000/`.

**Exercício 16.** Os resolvers de relação são `Livro.autor` e `Autor.livros`. Uma consulta `livros { autor { livros { id } } }` devolve, para cada livro, o autor e depois todos os livros desse autor (não existem ciclos infinitos porque a consulta é finita).

**Exercício 17.**

    // schema: type Query { cabecalho: String }
    context: async ({ req }) => ({ token: req.headers.authorization ?? null }),
    // resolver
    cabecalho: (_p, _a, ctx) => ctx.token,

Enviando pedidos com cabeçalhos diferentes, cada resposta traz o seu valor, pelo que o contexto é de facto por pedido.

**Exercício 18.** A mutation do módulo 04 (`criarLivro`) devolve o livro criado e `livros` passa a incluí-lo.

**Exercício 19.** A função `gql` está no módulo 05. Para uma consulta inexistente, o servidor responde com `GRAPHQL_VALIDATION_FAILED` e a função lança um `Error` com a mensagem `Cannot query field "..."`.

**Exercício 20.**

    const client = new ApolloClient({
      link: new HttpLink({ uri: 'http://localhost:4000/' }),
      cache: new InMemoryCache(),
    })
    await client.query({ query: gql`{ livros { id titulo } }` })
    await client.mutate({
      mutation: gql`mutation ($t: String!) { criarLivro(titulo: $t, autorId: "1") { id } }`,
      variables: { t: 'Y' },
    })

**Exercício 21.** Com a política por omissão, a chamada **rejeita** com o erro. Com `errorPolicy: 'all'`, a promessa resolve e devolve `{ data, error }`, podendo haver dados parciais. O erro de validação é do tipo `CombinedGraphQLErrors`.

**Exercício 22.** Duas formas corretas:

    useMutation(CRIAR, { refetchQueries: [{ query: LIVROS }] })
    // ou, na leitura:
    client.query({ query: LIVROS, fetchPolicy: 'network-only' })

A primeira atualiza a lista depois da mutation; a segunda ignora a cache na leitura seguinte.

## Módulos 06 e 07

**Exercício 23.**

    livros(limite: Int = 10, deslocamento: Int = 0): [Livro!]!

Se um livro for **inserido no início** entre o pedido da página 1 e o da página 2, tudo se desloca uma posição e o último item da página 1 reaparece no início da página 2.

**Exercício 24.** O schema é o `LivroConnection` do módulo 06; o resolver é `paginar` (validado). Os cursores são opacos, codificados em base64.

**Exercício 25.**

    let depois = null
    do {
      const { livros } = await gql(
        'query ($d: String) { livros(first: 3, after: $d) { edges { node { id } } pageInfo { hasNextPage endCursor } } }',
        { d: depois },
      )
      livros.edges.forEach((e) => console.log(e.node.id))
      depois = livros.pageInfo.hasNextPage ? livros.pageInfo.endCursor : null
    } while (depois)

**Exercício 26.**

    const MAX = 50
    if (first < 0 || first > MAX) {
      throw new GraphQLError(`first tem de estar entre 0 e ${MAX}`, {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }

**Exercício 27.**

    throw new GraphQLError('Livro não encontrado', { extensions: { code: 'NOT_FOUND' } })

Resposta: `data: { livro: null }` e um item em `errors` com `path: ["livro"]` e `extensions.code: "NOT_FOUND"`.

**Exercício 28.** Com `Livro.autor: Autor!`, um `null` apaga **toda** a resposta se `livros: [Livro!]!` não tiver ancestral nulável (`data: null`). Para limitar o estrago, torna o campo nulável (`autor: Autor`) ou a lista de itens (`[Livro]`), consoante o que o negócio aceita.

**Exercício 29.**

    union CriarLivroResultado = Livro | TituloInvalido
    type TituloInvalido { mensagem: String! }

    CriarLivroResultado: {
      __resolveType: (o) => (o.titulo !== undefined ? 'Livro' : 'TituloInvalido'),
    },

    mutation { criarLivro(...) { __typename ... on Livro { id } ... on TituloInvalido { mensagem } } }

**Exercício 30.**

    formatError: (f) => {
      const { stacktrace, ...ext } = f.extensions ?? {}
      return { ...f, extensions: ext }
    }

## Módulos 08 e 09

**Exercício 31.**

    const utilizadores = { 'tok-admin': { id: 'u1', papel: 'ADMIN' }, 'tok-user': { id: 'u2', papel: 'LEITOR' } }
    context: async ({ req }) => {
      const tok = (req.headers.authorization ?? '').replace('Bearer ', '')
      return { utilizador: utilizadores[tok] ?? null }
    }

**Exercício 32.** `exigir` é a função do módulo 08. Resultados: sem token, `UNAUTHENTICATED`; com `tok-user`, `FORBIDDEN`; com `tok-admin`, `true`.

**Exercício 33.** Ver `minhasCriticas` e `Critica.emailAutor` no módulo 08. A regra por campo permite o dono ou o `ADMIN` e rejeita os outros com `FORBIDDEN`.

**Exercício 34.**

    new HttpLink({ uri: 'http://localhost:4000/', headers: { authorization: `Bearer ${token}` } })

O servidor passa a ver o token em `ctx`, como no exercício 17.

**Exercício 35.** Com 10 livros, `Livro.autor` é chamado **10 vezes**, uma por livro. É o N+1: o servidor não sabe que podia agrupar.

**Exercício 36.**

    autores: new DataLoader(async (ids) => {
      const m = new Map((await db.autores.porIds(ids)).map((a) => [a.id, a]))
      return ids.map((id) => m.get(id))
    })
    Livro: { autor: (l, _a, ctx) => ctx.autores.load(l.autorId) }

A função de lote corre uma só vez, com os ids únicos (verificado: `['1','2']`).

**Exercício 37.** Se devolveres a ordem da base de dados, o autor `2` pode ir parar ao livro do autor `1`. A correção é a do exercício anterior: `ids.map((id) => m.get(id))`, mapeando por `id`.

**Exercício 38.**

    function limiteProfundidade(max) {
      return (context) => {
        let atual = 0
        return {
          Field: {
            enter() {
              atual++
              if (atual > max) context.reportError(new GraphQLError(`Profundidade máxima ${max} excedida`))
            },
            leave() { atual-- },
          },
        }
      }
    }
    new ApolloServer({ typeDefs, resolvers, validationRules: [limiteProfundidade(6)] })

A regra foi executada e verificada com limite 3: `{ livro { autor { id } } }` passa, `{ livro { autor { livros { titulo } } } }` é rejeitado. O Apollo devolve estes erros com o código `GRAPHQL_VALIDATION_FAILED`.

## Módulo 10

**Exercício 39.**

    import test from 'node:test'
    import assert from 'node:assert/strict'

    const exec = async (query, variables, contextValue) =>
      (await server.executeOperation({ query, variables }, { contextValue })).body.singleResult

    test('feliz', async () => {
      const r = await exec('{ livro(id:"1"){ titulo } }')
      assert.ok(r.data.livro.titulo)
    })
    test('not found', async () => {
      const r = await exec('{ livro(id:"9"){ titulo } }')
      assert.equal(r.errors[0].extensions.code, 'NOT_FOUND')
    })
    test('forbidden', async () => {
      const r = await exec('{ apagar }', undefined, { utilizador: { papel: 'LEITOR' } })
      assert.equal(r.errors[0].extensions.code, 'FORBIDDEN')
    })

Os seis testes de um conjunto equivalente passaram com `node --test`.

**Exercício 40.** Usa a configuração do módulo 10, ajusta `schema` e `documents`, corre `npx graphql-codegen` e importa os tipos de `./src/gql/`.

**Exercício 41.** Partem clientes: remover ou renomear um campo, tornar um argumento obrigatório, mudar o tipo de um campo, tornar nulo em não nulo um **input**, e remover um valor de enum. Não partem: acrescentar um campo, um tipo, um argumento opcional, um valor de enum (com cuidado) ou uma mutation. Para remover um campo: `@deprecated` com motivo, medir o uso por operação, avisar os clientes e só então remover.

**Exercício 42.** Percorre a lista do módulo 10 e anota, para cada item, "feito", "falta" ou "não se aplica". O resultado depende do teu projeto.

## Projeto final (exercício 43)

Não há solução única. Verifica estes critérios:

| Critério | Como verificar |
|---|---|
| Schema completo | Tipos, enum, inputs e connections coerentes |
| N+1 resolvido | Contador de consultas: duas para 50 livros e os respetivos autores |
| Sem stacktrace | `NODE_ENV=production` e resposta sem `stacktrace` |
| Autorização | Testes para anónimo, leitor e `ADMIN` |
| Paginação | Testes de página vazia, intermédia e última |
| Erros | `extensions.code` consistentes e união de erros de domínio |
| Testes | Pelo menos dez, a passar com `node --test` |

## Fontes oficiais

- [graphql.org/learn](https://graphql.org/learn/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server)
- [DataLoader](https://github.com/graphql/dataloader)
