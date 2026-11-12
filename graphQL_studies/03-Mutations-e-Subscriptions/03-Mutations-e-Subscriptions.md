# 03 Mutations e subscriptions

## Mutations: escrever dados

As queries leem. Para criar, alterar ou apagar, usa-se uma **mutation**. Sintaticamente é igual a uma query, mas declarada no tipo `Mutation`:

    type Mutation {
      criarLivro(input: NovoLivro!): Livro!
      atualizarLivro(id: ID!, input: AtualizacaoLivro!): Livro
      apagarLivro(id: ID!): Boolean!
    }

    mutation CriarLivro($input: NovoLivro!) {
      criarLivro(input: $input) {
        id
        titulo
        autor { nome }
      }
    }

    // variáveis
    {
      "input": {
        "titulo": "Memorial do Convento",
        "ano": 1982,
        "genero": "FICCAO",
        "autorId": "1"
      }
    }

Repara que a mutation também tem **conjunto de seleção**: pedes de volta os campos de que precisas, e o cliente atualiza a interface sem novo pedido.

## Execução em série

Numa query, os campos de topo podem executar em paralelo. Numa mutation, os campos de topo executam **um de cada vez, pela ordem escrita**:

    mutation {
      a: criarLivro(input: { titulo: "A", genero: POESIA, autorId: "1" }) { id }
      b: criarLivro(input: { titulo: "B", genero: POESIA, autorId: "1" }) { id }
    }

O primeiro termina antes de o segundo começar. A garantia aplica-se só ao nível de topo; os campos dentro de cada seleção seguem as regras normais.

**NOTA:** a diferença entre query e mutation é uma convenção reforçada pela execução em série. O servidor não impede que uma query escreva dados, mas não o faças: clientes, caches e proxies assumem que as queries não têm efeitos.

## Um só argumento `input`

A convenção mais usada é receber **um único argumento `input`** do tipo `input`. Facilita a evolução (acrescentar campos opcionais não parte ninguém) e simplifica o cliente:

    input NovoLivro {
      titulo: String!
      ano: Int
      genero: Genero!
      autorId: ID!
    }

    input AtualizacaoLivro {
      titulo: String
      ano: Int
      genero: Genero
    }

**ATENÇÃO:** numa atualização parcial, distingue "campo ausente" de "campo `null`". Se o cliente enviar `"ano": null`, quer limpar o valor; se omitir `ano`, quer mantê-lo. O servidor tem de tratar os dois casos de forma diferente.

## Payloads de mutation

Em vez de devolver só o objeto, muitas APIs devolvem um **payload** dedicado, que permite acrescentar metadados e erros de negócio sem partir o contrato:

    type CriarLivroPayload {
      livro: Livro
      erros: [ErroUtilizador!]!
    }

    type ErroUtilizador {
      campo: String
      mensagem: String!
    }

    type Mutation {
      criarLivro(input: NovoLivro!): CriarLivroPayload!
    }

    mutation {
      criarLivro(input: { titulo: "", genero: FICCAO, autorId: "1" }) {
        livro { id }
        erros { campo mensagem }
      }
    }

Esta abordagem é aprofundada no módulo 07, onde se compara com os erros do campo `errors`.

## Subscriptions: tempo real

Uma **subscription** mantém a ligação aberta e o servidor envia um resultado cada vez que ocorre um evento:

    type Subscription {
      criticaAdicionada(livroId: ID!): Critica!
    }

    subscription ($livroId: ID!) {
      criticaAdicionada(livroId: $livroId) {
        id
        nota
        comentario
      }
    }

Regras importantes:

- Uma subscription operation tem **exatamente um campo de topo**.
- Cada evento produz uma resposta com a forma da seleção, tal como numa query.
- A ligação mantém-se até o cliente ou o servidor a fechar.

## Transporte

A especificação do GraphQL **não define** o transporte das subscriptions. Os dois mais usados:

| Transporte | Notas |
|---|---|
| WebSocket com o protocolo `graphql-ws` | Mais comum; é o que usam a biblioteca `graphql-ws` e o Apollo Client |
| Server-Sent Events (SSE) | Mais simples, passa melhor por proxies, só servidor para cliente |

**ATENÇÃO:** o protocolo antigo `subscriptions-transport-ws` está obsoleto. Em projetos novos usa `graphql-ws` (ou SSE).

Ao contrário de queries e mutations, que são pedidos curtos, uma subscription ocupa uma ligação por cliente. Isto tem custo em memória e obriga a pensar em escala (por exemplo, um broker como Redis para distribuir eventos entre instâncias do servidor).

## Publicar eventos (visão geral)

O servidor liga mutations a subscriptions com um mecanismo de publicação e subscrição (*pub/sub*). Esquema do fluxo:

    // resolver da mutation: depois de gravar, publica o evento
    pubsub.publish('CRITICA_ADICIONADA', { criticaAdicionada: critica })

    // resolver da subscription: devolve um iterador assíncrono
    criticaAdicionada: {
      subscribe: () => pubsub.asyncIterableIterator(['CRITICA_ADICIONADA']),
    }

O objeto `pubsub` não vem no GraphQL: em desenvolvimento pode ser em memória; em produção, um broker externo. A implementação completa fica para o módulo 04.

## Quando escolher cada uma

| Necessidade | Escolha |
|---|---|
| Carregar uma lista ou uma página | Query |
| Gravar, alterar ou apagar | Mutation |
| Notificar o cliente de um evento | Subscription |
| Atualização pouco frequente (a cada minuto) | Query com *polling* é muitas vezes mais simples |

**DICA:** antes de recorrer a uma subscription, pergunta se *polling* ou um refresco manual bastam. As subscriptions são poderosas mas custam mais a operar.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Schema is not configured for mutations` | O schema não declara o tipo `Mutation` |
| Duas mutations executam fora de ordem | Foram enviadas em pedidos separados; só ficam em série dentro do mesmo pedido |
| Subscription não recebe eventos | Evento publicado com outro nome ou ligação WebSocket sem o protocolo correto |
| `Subscription must select only one top level field` | Pediste mais de um campo de topo numa subscription |
| Atualização apaga um valor sem querer | `null` e ausente tratados como o mesmo caso |

## Exercícios

**PRATICAR:** exercícios 11 a 14 do módulo 11 (mutation com variáveis, payload com erros, mutations em série, subscription).

## Fontes oficiais

- [Mutations](https://graphql.org/learn/mutations/)
- [Subscriptions](https://graphql.org/learn/subscriptions/)
- [Execução em série das mutations (especificação)](https://spec.graphql.org/October2021/#sec-Mutation)
- [Biblioteca graphql-ws](https://the-guild.dev/graphql/ws)
