# 12 Consulta rápida

## Operações

| Operação | Exemplo |
|---|---|
| Query | `query Nome($id: ID!) { livro(id: $id) { titulo } }` |
| Mutation | `mutation Nome($input: NovoLivro!) { criarLivro(input: $input) { id } }` |
| Subscription | `subscription ($id: ID!) { criticaAdicionada(livroId: $id) { nota } }` |
| Forma abreviada | `{ livros { id } }` (sem nome, variáveis nem diretivas) |

## Consulta

| Elemento | Sintaxe |
|---|---|
| Argumento | `livros(genero: FICCAO, limite: 5)` |
| Alias | `primeiro: livro(id: "1") { titulo }` |
| Variável | `$id: ID!`, `$ativo: Boolean = true` |
| Fragment | `fragment F on Livro { id titulo }` e `...F` |
| Inline fragment | `... on Livro { titulo }` |
| Tipo concreto | `__typename` |
| Incluir ou omitir | `@include(if: $x)` e `@skip(if: $x)` |

## Schema (SDL)

| Elemento | Sintaxe |
|---|---|
| Objeto | `type Livro { id: ID! titulo: String! }` |
| Enum | `enum Genero { FICCAO POESIA }` |
| Input | `input NovoLivro { titulo: String! }` |
| Interface | `interface Publicacao { id: ID! }` e `type Livro implements Publicacao` |
| União | `union R = Livro` seguido dos restantes membros separados por barra vertical (ver módulo 02) |
| Escalar próprio | `scalar DateTime` |
| Obsoleto | `campo: String @deprecated(reason: "...")` |
| Descrição | `"""Texto"""` antes do tipo ou campo |

## Escalares e nulidade

| Declaração | Significado |
|---|---|
| `Int`, `Float`, `String`, `Boolean`, `ID` | Os cinco escalares standard |
| `String` | Pode ser `null` |
| `String!` | Nunca `null` |
| `[T]` | Lista e itens podem ser `null` |
| `[T!]!` | Lista e itens obrigatórios (o mais comum) |

## Resolvers

| Elemento | Detalhe |
|---|---|
| Assinatura | `(pai, args, contexto, info)` |
| Resolver por omissão | Devolve `pai[campo]` |
| Contexto | Criado por pedido (utilizador, `db`, loaders) |
| Erro | `throw new GraphQLError('msg', { extensions: { code } })` |

## Apollo Server

| Tarefa | Código |
|---|---|
| Instalar | `npm i @apollo/server graphql` |
| Criar | `new ApolloServer({ typeDefs, resolvers })` |
| Arrancar | `startStandaloneServer(server, { listen: { port: 4000 }, context })` |
| Testar sem HTTP | `server.executeOperation({ query, variables }, { contextValue })` |
| Esconder detalhes | `formatError` e `NODE_ENV=production` |
| Parar | `await server.stop()` |

## Cliente (Apollo Client)

| Tarefa | Código |
|---|---|
| Criar | `new ApolloClient({ link: new HttpLink({ uri }), cache: new InMemoryCache() })` |
| Query | `client.query({ query: gql\`...\` })` |
| Mutation | `client.mutate({ mutation, variables })` |
| Erros parciais | `errorPolicy: 'all'` |
| Política de cache | `fetchPolicy: 'network-only'` |
| React | `useQuery`, `useMutation`, `ApolloProvider` (de `@apollo/client/react`) |

## Pedido HTTP

    curl -X POST http://localhost:4000/ \
      -H "Content-Type: application/json" \
      -d '{"query":"{ livros { id } }"}'

## Códigos de erro habituais

| Código | Quando |
|---|---|
| `GRAPHQL_VALIDATION_FAILED` | Consulta inválida contra o schema |
| `UNAUTHENTICATED` | Sem sessão ou token inválido |
| `FORBIDDEN` | Sem permissão |
| `NOT_FOUND` | Recurso inexistente |
| `BAD_USER_INPUT` | Valor inválido do utilizador |
| `INTERNAL_SERVER_ERROR` | Erro inesperado |

## Padrões

| Padrão | Regra |
|---|---|
| Mutation | Um argumento `input` e um payload |
| Paginação | Connection com `first`, `after`, `pageInfo` |
| N+1 | `DataLoader` no contexto, por pedido |
| Segurança | Identidade no contexto, regras junto dos dados |
| Evolução | Acrescentar e `@deprecated`, nunca remover de repente |
| Erros esperados | Como dados (união); inesperados em `errors` |

## Regras de ouro

1. Dá nome a todas as operações e usa sempre variáveis.
2. Pagina qualquer lista que possa crescer.
3. Usa `!` com moderação em campos que podem falhar.
4. Cria o contexto e os loaders por pedido.
5. Nunca confies na identidade enviada pelo cliente.
6. Limita profundidade, complexidade e tamanho de página.
7. Lê sempre `errors`, mesmo com estado HTTP 200.
8. Mede antes de otimizar.

## Fontes oficiais

- [graphql.org/learn](https://graphql.org/learn/)
- [Especificação](https://spec.graphql.org/)
- [Documentação do Apollo](https://www.apollographql.com/docs)
