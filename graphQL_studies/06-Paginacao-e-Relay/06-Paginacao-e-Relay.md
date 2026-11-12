# 06 Paginação e Relay

## Porquê paginar

Uma lista que cresce sem limite acaba por rebentar a rede, a memória e a base de dados. Qualquer campo que devolva uma lista potencialmente grande (`livros`, `criticas`) deve ser paginado desde o início: **acrescentar paginação mais tarde é uma alteração incompatível** do schema (módulo 02).

## Paginação por offset

A forma mais simples: `limite` e `deslocamento`.

    type Query {
      livros(limite: Int = 10, deslocamento: Int = 0): [Livro!]!
    }

    query {
      livros(limite: 10, deslocamento: 20) { id titulo }
    }

| Vantagem | Desvantagem |
|---|---|
| Fácil de implementar e de perceber | Salta ou repete itens se a lista mudar entre pedidos |
| Permite saltar para a página N | Lenta em offsets grandes (a base de dados percorre as linhas ignoradas) |

Serve para listas pequenas e estáveis, como um painel de administração.

## Paginação por cursor

Em vez de uma posição, o cliente envia um **cursor**: um marcador opaco para o último item que viu. O servidor devolve os itens **a seguir** a esse marcador.

    type Query {
      livros(primeiros: Int = 10, depois: String): PaginaLivros!
    }

    type PaginaLivros {
      itens: [Livro!]!
      proximoCursor: String
    }

Os cursores são estáveis perante inserções e eliminações, e funcionam bem com índices na base de dados. Não permitem saltar diretamente para a página 50.

**NOTA:** o cursor deve ser **opaco** para o cliente. Codifica-o (por exemplo, em base64) para ninguém depender do seu conteúdo.

## A especificação de connections (Relay)

A comunidade convergiu numa estrutura comum, a **Cursor Connections Specification**, criada para o Relay mas usada em muitas APIs (a do GitHub, por exemplo). Os nomes dos argumentos e campos são fixos:

    type Query {
      livros(first: Int, after: String, last: Int, before: String): LivroConnection!
    }

    type LivroConnection {
      edges: [LivroEdge!]!
      pageInfo: PageInfo!
      totalCount: Int
    }

    type LivroEdge {
      cursor: String!
      node: Livro!
    }

    type PageInfo {
      hasNextPage: Boolean!
      hasPreviousPage: Boolean!
      startCursor: String
      endCursor: String
    }

| Elemento | Função |
|---|---|
| `first` / `after` | Avançar: os primeiros N depois do cursor |
| `last` / `before` | Recuar: os últimos N antes do cursor |
| `edges` | Lista de ligações; cada uma tem `cursor` e `node` |
| `node` | O item em si (o `Livro`) |
| `pageInfo` | Informação para saber se há mais páginas |
| `totalCount` | Extra comum, não faz parte da especificação |

A consulta de uma página:

    query ($depois: String) {
      livros(first: 3, after: $depois) {
        edges { cursor node { id titulo } }
        pageInfo { hasNextPage endCursor }
      }
    }

O cliente pede a página seguinte reenviando `endCursor` como `after`, até `hasNextPage` ser `false`.

**DICA:** `edges` existe porque a ligação pode ter dados próprios (a data em que o livro entrou numa lista, por exemplo). Se nunca precisares disso, muitas APIs expõem também um atalho `nodes: [Livro!]!`.

## Implementar a paginação

Exemplo de resolver sobre um array em memória (executado e validado); numa base de dados real, o filtro vira uma cláusula `WHERE id > ?` com `LIMIT`:

    const codificar = (id) => Buffer.from(`livro:${id}`).toString('base64url')
    const descodificar = (c) => Buffer.from(c, 'base64url').toString().replace('livro:', '')

    function paginar(lista, { first = 3, after } = {}) {
      const inicio = after ? lista.findIndex((l) => l.id === descodificar(after)) + 1 : 0
      const fatia = lista.slice(inicio, inicio + first)
      return {
        edges: fatia.map((no) => ({ cursor: codificar(no.id), node: no })),
        pageInfo: {
          hasNextPage: inicio + first < lista.length,
          endCursor: fatia.length ? codificar(fatia.at(-1).id) : null,
        },
        totalCount: lista.length,
      }
    }

Com 7 livros, `first: 3` devolve os ids 1 a 3 e `hasNextPage: true`; com o `endCursor` obtém-se 4 a 6; a terceira página devolve só o 7 e `hasNextPage: false`.

**ATENÇÃO:** valida os argumentos. Um `first` negativo ou enorme (`first: 1000000`) tem de ser recusado ou limitado a um máximo (por exemplo, 100). Um cursor inválido deve gerar um erro claro, não uma exceção interna.

## Paginar com Apollo Client

O Apollo guarda cada página como resultado do mesmo campo com argumentos diferentes. Para **juntar** as páginas numa lista contínua (scroll infinito), configura uma política de cache para o campo `livros`:

    import { InMemoryCache } from '@apollo/client'
    import { relayStylePagination } from '@apollo/client/utilities'

    const cache = new InMemoryCache({
      typePolicies: {
        Query: { fields: { livros: relayStylePagination() } },
      },
    })

A função `relayStylePagination` já conhece `edges` e `pageInfo`. Depois usa `fetchMore` com o novo `after` para pedir a página seguinte.

**NOTA:** a configuração de cache acima segue a documentação do Apollo Client e não foi executada neste curso; confirma o caminho do import na versão que instalares.

## Escolher a estratégia

| Situação | Estratégia |
|---|---|
| Lista pequena, estável, com salto de página | Offset |
| Feed ou lista que cresce, scroll infinito | Cursor |
| Quer compatibilidade com Relay, GitHub ou ferramentas da comunidade | Connections |
| Precisas de dados na ligação (`cursor`, extras) | Connections |

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Itens repetidos ou em falta entre páginas | Offset com a lista a mudar entre pedidos |
| Página seguinte vazia sem `hasNextPage: false` | `hasNextPage` calculado sem olhar para o total |
| Ordem diferente a cada pedido | Falta uma ordenação estável (`ORDER BY` por um campo único) |
| Cursor deixa de funcionar | O cursor guarda um valor que mudou (por exemplo, o título) |
| `first: 100000` derruba o servidor | Sem limite máximo para `first` |
| `totalCount` muito lento | `COUNT(*)` numa tabela grande; calcula só quando pedido |

## Exercícios

**PRATICAR:** exercícios 23 a 26 do módulo 11 (offset, connection, `pageInfo`, limite máximo).

## Fontes oficiais

- [Paginação no GraphQL](https://graphql.org/learn/pagination/)
- [Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
- [Paginação no Apollo Client](https://www.apollographql.com/docs/react/pagination/overview)
