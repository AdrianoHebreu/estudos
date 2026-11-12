# 07 Erros e validação

## Onde falha um pedido

Um pedido GraphQL passa por fases, e cada uma tem o seu tipo de erro:

| Fase | Erro | Resultado |
|---|---|---|
| Análise (parse) | Sintaxe inválida | Sem `data`, só `errors` |
| Validação | Campo inexistente, tipo errado, fragment não usado | Sem `data`, só `errors` (código `GRAPHQL_VALIDATION_FAILED`) |
| Execução | Exceção num resolver, `null` num campo `!` | `data` (parcial) e `errors` |

Só na execução existe a **resposta parcial**: parte dos dados chega e parte falha.

## A forma de `errors`

Cada erro é um objeto com campos previstos pela especificação:

    {
      "errors": [
        {
          "message": "Proibido",
          "locations": [{ "line": 1, "column": 31 }],
          "path": ["x"],
          "extensions": { "code": "FORBIDDEN" }
        }
      ],
      "data": { "x": null }
    }

| Campo | Significado |
|---|---|
| `message` | Texto para humanos |
| `locations` | Linha e coluna na consulta |
| `path` | Caminho do campo que falhou (inclui índices de listas) |
| `extensions` | Livre; é onde se coloca o `code` e outros metadados |

**NOTA:** um pedido pode ter estado HTTP 200 e conter `errors`. Os clientes têm de ler o corpo, não só o estado (módulo 05).

## Lançar erros com `GraphQLError`

Num resolver, lança um `GraphQLError` com um `code` próprio para o cliente decidir como reagir:

    import { GraphQLError } from 'graphql'

    throw new GraphQLError('Proibido', {
      extensions: { code: 'FORBIDDEN' },
    })

O campo falha, vale `null` e o resto da consulta continua (executado e confirmado: o campo `x` fica `null` e os campos irmãos são devolvidos).

Códigos úteis e consistentes entre a equipa:

| Código | Quando |
|---|---|
| `UNAUTHENTICATED` | Falta identificação ou o token é inválido |
| `FORBIDDEN` | Identificado, mas sem permissão |
| `NOT_FOUND` | O recurso não existe |
| `BAD_USER_INPUT` | Valor recebido não é válido |
| `INTERNAL_SERVER_ERROR` | Erro inesperado no servidor (o Apollo atribui-o por omissão) |

## A propagação de `null`

Se um campo `!` falha ou devolve `null`, o `null` sobe até ao primeiro ancestral **nulável**. Executado com `livros: [Livro!]!` e `Livro.autor: Autor!`, quando o autor do segundo livro é `null`:

    { "data": null, "errors": [{
        "message": "Cannot return null for non-nullable field Livro.autor.",
        "path": ["livros", 1, "autor"] }] }

O erro de **um** autor apagou **toda** a resposta, porque `Livro!`, `[Livro!]!` e `Query.livros` são todos não nulos e não há onde parar o `null`. Se `Livro.autor` fosse nulável (`Autor`), só esse campo ficava `null`.

**DICA:** usa `!` apenas em campos que nunca falham. Em campos que dependem de outros serviços, o nulável é mais robusto.

## Dois modelos de erros de negócio

| Modelo | Como funciona | Vantagem | Desvantagem |
|---|---|---|---|
| **`errors` do GraphQL** | Lança-se uma exceção com um `code` | Simples, pouco código | O cliente tem de interpretar `extensions.code` |
| **Erros como dados** | O tipo de retorno inclui os erros possíveis | Tipado: o cliente é obrigado a tratar cada caso | Mais schema |

Erros como dados com uma união:

    union CriarLivroResultado = Livro | TituloInvalido | AutorNaoEncontrado

    type TituloInvalido { mensagem: String! }
    type AutorNaoEncontrado { autorId: ID! }

    type Mutation {
      criarLivro(input: NovoLivro!): CriarLivroResultado!
    }

    mutation {
      criarLivro(input: { titulo: "", genero: FICCAO, autorId: "9" }) {
        __typename
        ... on Livro { id }
        ... on TituloInvalido { mensagem }
        ... on AutorNaoEncontrado { autorId }
      }
    }

Para uniões, o servidor precisa de `__resolveType` (ou equivalente) para dizer qual é o tipo concreto:

    CriarLivroResultado: {
      __resolveType: (obj) => (obj.titulo !== undefined ? 'Livro' : obj.mensagem ? 'TituloInvalido' : 'AutorNaoEncontrado'),
    },

**DICA:** regra prática: erros **esperados** do domínio (validação, regra de negócio) como dados; erros **inesperados** (falha de base de dados, bug) como `errors`.

## Validar entradas

O GraphQL valida **tipos** (um `Int` não aceita texto, um `ID!` não aceita `null`), mas não valida **regras de negócio**: um `titulo` vazio ou uma `nota` de 7 são valores `String` e `Int` válidos. Essas regras são tuas:

    criarCritica: (_p, { input }) => {
      if (input.nota < 1 || input.nota > 5) {
        throw new GraphQLError('A nota tem de estar entre 1 e 5', {
          extensions: { code: 'BAD_USER_INPUT', campo: 'nota' },
        })
      }
      // gravar...
    }

Duas formas de reforçar o contrato:

- um **escalar personalizado** (`Nota`, `Email`) que valida no `parseValue`;
- bibliotecas de validação (como Zod) chamadas à entrada do resolver.

## Esconder detalhes internos

O Apollo Server inclui o `stacktrace` nas extensões fora de produção. Em produção, define `NODE_ENV=production`. Para controlar o que sai, usa `formatError` (executado e confirmado):

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      formatError: (formatado, erroOriginal) => {
        const { stacktrace, ...extensoes } = formatado.extensions ?? {}
        return { ...formatado, extensions: extensoes }
      },
    })

**ATENÇÃO:** nunca devolvas a mensagem de uma exceção interna (SQL, caminhos, nomes de tabelas) ao cliente. Regista-a no servidor e devolve uma mensagem genérica com `INTERNAL_SERVER_ERROR`.

## Registo e observação

Cada erro inesperado deve ficar nos registos com o contexto necessário para o diagnosticar: o nome da operação, o `path`, o identificador do pedido e o utilizador (quando existir). Usa o **nome da operação** (módulo 01): sem nome, os registos mostram apenas pedidos anónimos.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Toda a resposta vem `null` | Um `!` sem pai nulável a absorver o erro |
| Cliente trata 200 como sucesso | Não verifica o campo `errors` |
| Stacktrace visível no cliente | Sem `NODE_ENV=production` nem `formatError` |
| `Abstract type must resolve to an Object type` | Falta ou está errado o `__resolveType` da união |
| Valor inválido passa na validação | O tipo (`Int`) aceita-o; falta validação de negócio |
| Mensagens de erro diferentes para o mesmo caso | Sem lista combinada de códigos `extensions.code` |

## Exercícios

**PRATICAR:** exercícios 27 a 30 do módulo 11 (erro com `code`, propagação de `null`, união de resultados, `formatError`).

## Fontes oficiais

- [Erros no Apollo Server](https://www.apollographql.com/docs/apollo-server/data/errors)
- [Erros na especificação](https://spec.graphql.org/October2021/#sec-Errors)
- [Listas e não nulos](https://graphql.org/learn/schema/)
- [Validação](https://graphql.org/learn/validation/)
