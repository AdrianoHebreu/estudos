# 05 Cliente GraphQL

## Opções para consumir uma API GraphQL

Um servidor GraphQL é só HTTP, por isso há três níveis de ferramentas:

| Opção | Quando usar |
|---|---|
| `fetch` | Scripts, testes, um ou dois pedidos |
| Cliente leve (`graphql-request`, `urql`) | Pedidos tipados com pouca infraestrutura |
| Cliente completo (Apollo Client, Relay) | Aplicações com muitas vistas, cache normalizada e estado partilhado |

## Com `fetch`

O formato do pedido já foi visto no módulo 01. Uma função reutilizável:

    async function gql(query, variables) {
      const res = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      })
      const corpo = await res.json()
      if (corpo.errors?.length) {
        throw new Error(corpo.errors.map((e) => e.message).join('; '))
      }
      return corpo.data
    }

    const { livros } = await gql('query { livros { id titulo } }')

**ATENÇÃO:** `res.ok` não chega. Erros de execução vêm com estado 200 e o texto em `errors`. Erros de validação costumam vir com 400, mas com corpo JSON igualmente em `errors`. Lê sempre o corpo.

## Apollo Client

O **Apollo Client** envia os pedidos e mantém uma **cache normalizada** com os resultados. Instalação:

    npm install @apollo/client graphql rxjs

Criar o cliente e fazer uma query:

    import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client'

    const client = new ApolloClient({
      link: new HttpLink({ uri: 'http://localhost:4000/' }),
      cache: new InMemoryCache(),
    })

    const { data } = await client.query({
      query: gql`
        query { livros { id titulo } }
      `,
    })

Uma mutation com variáveis:

    const { data } = await client.mutate({
      mutation: gql`
        mutation ($titulo: String!, $autorId: ID!) {
          criarLivro(titulo: $titulo, autorId: $autorId) { id titulo }
        }
      `,
      variables: { titulo: 'Memorial do Convento', autorId: '1' },
    })

**NOTA:** estes exemplos foram executados contra o servidor do módulo 04 com `@apollo/client` 4. Nesta versão o `HttpLink` tem de ser indicado de forma explícita, e os resultados trazem `__typename` em cada objeto (o cliente acrescenta-o sozinho).

## A cache normalizada

O Apollo guarda cada objeto pelo par `__typename` + `id`. Se duas consultas devolvem o `Livro` com id `1`, partilham a **mesma entrada** na cache:

    Livro:1 → { id: "1", titulo: "Ensaio sobre a Cegueira" }

Consequências práticas:

- uma mutation que devolve `{ id titulo }` de um livro **atualiza automaticamente** todas as vistas que o mostram;
- por isso se pede `id` (e `__typename`) nos objetos: sem eles, não há como normalizar;
- a primeira vez que o dado é pedido vai à rede, e as seguintes podem vir da cache.

### Políticas de obtenção

| `fetchPolicy` | Comportamento |
|---|---|
| `cache-first` (por omissão) | Usa a cache; só vai à rede se faltar algo |
| `cache-and-network` | Mostra a cache e atualiza em simultâneo pela rede |
| `network-only` | Vai sempre à rede e guarda o resultado |
| `no-cache` | Vai à rede e não guarda |

    await client.query({ query: LIVROS, fetchPolicy: 'network-only' })

## Tratar erros no cliente

No Apollo Client 4, por omissão `client.query` **rejeita** quando a resposta traz erros. Podes pedir que devolva `data` parcial e o erro juntos com `errorPolicy: 'all'`:

    const { data, error } = await client.query({
      query: gql`{ livros { id titulo } }`,
      errorPolicy: 'all',
    })
    if (error) console.error(error.message)

Quando falha a validação, o erro é do tipo `CombinedGraphQLErrors`, com a lista original em `error.errors` e o `extensions.code` do servidor (por exemplo, `GRAPHQL_VALIDATION_FAILED`).

**DICA:** distingue erros de **rede** (servidor em baixo, sem resposta) de erros **GraphQL** (resposta com `errors`). Cada um pede uma reação diferente: tentar de novo ou mostrar a mensagem ao utilizador.

## Usar com React

No React, os *hooks* tratam do ciclo de vida do pedido. Na versão 4 os exports de React vêm de `@apollo/client/react`:

    import { ApolloProvider, useQuery, useMutation } from '@apollo/client/react'
    import { gql } from '@apollo/client'

    const LIVROS = gql`
      query { livros { id titulo } }
    `

    function Lista() {
      const { data, loading, error } = useQuery(LIVROS)
      if (loading) return <p>A carregar…</p>
      if (error) return <p>Erro: {error.message}</p>
      return <ul>{data.livros.map((l) => <li key={l.id}>{l.titulo}</li>)}</ul>
    }

    // na raiz da aplicação
    <ApolloProvider client={client}>
      <Lista />
    </ApolloProvider>

`useMutation` devolve uma função para chamar e o estado do pedido:

    const CRIAR = gql`
      mutation ($titulo: String!, $autorId: ID!) {
        criarLivro(titulo: $titulo, autorId: $autorId) { id titulo }
      }
    `
    const [criar, { loading }] = useMutation(CRIAR, {
      refetchQueries: [{ query: LIVROS }],
    })
    await criar({ variables: { titulo: 'Novo', autorId: '1' } })

**NOTA:** os exemplos de React seguem a documentação do Apollo Client 4 e não foram executados neste curso, ao contrário dos de Node acima.

### Atualizar a lista depois de uma mutation

Uma mutation que **altera** um objeto existente atualiza a cache sozinha, graças ao `id`. Uma mutation que **cria** não sabe em que listas o novo objeto deve entrar. Há duas soluções:

| Abordagem | Custo | Notas |
|---|---|---|
| `refetchQueries` | Novo pedido de rede | Simples e sempre correta |
| Atualizar a cache à mão (`update`) | Sem pedido extra | Mais código; é fácil errar |

Começa por `refetchQueries` e só otimiza quando for necessário.

## Segurança no cliente

- Nunca coloques segredos (chaves de serviço) no código do browser.
- Envia o token de autenticação num cabeçalho, por exemplo `Authorization`, configurado no `HttpLink` (módulo 08).
- Usa variáveis, não concatenação de strings, para os valores vindos do utilizador.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| A lista não atualiza depois de criar | A mutation criou um objeto novo e nenhuma query foi atualizada |
| Objeto nunca é normalizado | Falta `id` (ou o campo identificador) na seleção |
| `res.ok` verdadeiro mas há erros | Estado 200 com `errors` no corpo |
| CORS no browser | O servidor não permite a origem do cliente |
| `HttpLink` em falta | Na versão 4 o `link` tem de ser indicado de forma explícita |
| Dados antigos no ecrã | `cache-first` a servir cache; usa `network-only` ou `refetch` |

## Exercícios

**PRATICAR:** exercícios 19 a 22 do módulo 11 (função `gql` com `fetch`, cliente Apollo, `errorPolicy`, atualização após mutation).

## Fontes oficiais

- [Apollo Client: introdução](https://www.apollographql.com/docs/react)
- [Cache e normalização](https://www.apollographql.com/docs/react/caching/overview)
- [Tratamento de erros](https://www.apollographql.com/docs/react/data/error-handling)
- [Servir sobre HTTP](https://graphql.org/learn/serving-over-http/)
