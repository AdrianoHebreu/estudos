# 02 Schema e SDL

## O schema é o contrato

O **schema** descreve tudo o que a API aceita e devolve. Escreve-se na **SDL** (Schema Definition Language), independente da linguagem do servidor. Clientes e servidor trabalham contra o mesmo contrato, e a validação das consultas (módulo 01) é feita com base nele.

Um schema mínimo para a biblioteca:

    type Query {
      livros: [Livro!]!
      livro(id: ID!): Livro
    }

    type Livro {
      id: ID!
      titulo: String!
      ano: Int
    }

`Query` é o **tipo raiz** de leitura: cada campo dele é um ponto de entrada da API.

## Tipos de objeto e campos

Um `type` agrupa campos, cada um com um tipo de retorno. Os campos podem ter argumentos:

    type Autor {
      id: ID!
      nome: String!
      nascimento: String
      livros(genero: Genero, limite: Int = 10): [Livro!]!
    }

    type Critica {
      id: ID!
      nota: Int!
      comentario: String
      livro: Livro!
    }

Podes documentar com descrições entre aspas triplas ou simples. Aparecem no GraphiQL e no Sandbox:

    """
    Obra publicada na biblioteca.
    """
    type Livro {
      id: ID!
      "Título tal como aparece na capa"
      titulo: String!
    }

## Escalares

Os escalares são as folhas da consulta. O GraphQL traz cinco:

| Escalar | Descrição |
|---|---|
| `Int` | Inteiro de 32 bits com sinal |
| `Float` | Número de vírgula flutuante de dupla precisão |
| `String` | Texto UTF-8 |
| `Boolean` | `true` ou `false` |
| `ID` | Identificador único, serializado como string |

**ATENÇÃO:** não existe tipo `Date` nativo. Datas costumam ser `String` em formato ISO 8601 ou um **escalar personalizado**:

    scalar DateTime

    type Livro {
      publicadoEm: DateTime
    }

Um escalar personalizado precisa de lógica de serialização no servidor (módulo 04). Bibliotecas como `graphql-scalars` trazem implementações prontas (`DateTime`, `EmailAddress`, `JSON`, etc.).

## Não nulos e listas

Por omissão, **qualquer campo pode ser `null`**. O `!` torna-o obrigatório. Nas listas há dois níveis:

| Declaração | Lista pode ser null? | Itens podem ser null? |
|---|---|---|
| `[Livro]` | Sim | Sim |
| `[Livro!]` | Sim | Não |
| `[Livro]!` | Não | Sim |
| `[Livro!]!` | Não | Não |

Na prática, `[Livro!]!` é a forma mais comum para listas.

**DICA:** sê conservador com `!` em campos que dependem de serviços externos ou de permissões. Se um campo `String!` falhar, o `null` **propaga-se** para o objeto pai mais próximo que aceite null, e pode apagar uma parte grande da resposta (ver módulo 07).

## Enums

Um `enum` limita um campo a um conjunto fixo de valores:

    enum Genero {
      FICCAO
      NAO_FICCAO
      POESIA
      TEATRO
    }

    type Livro {
      genero: Genero!
    }

Na consulta, os valores de enum escrevem-se **sem aspas**: `livros(genero: FICCAO)`. Na resposta JSON, aparecem como strings.

## Input types

Os argumentos complexos usam `input`, que só pode conter escalares, enums e outros inputs (nunca tipos de objeto):

    input NovoLivro {
      titulo: String!
      ano: Int
      genero: Genero!
      autorId: ID!
    }

    input FiltroLivros {
      genero: Genero
      anoMinimo: Int
      texto: String
    }

    type Query {
      livros(filtro: FiltroLivros): [Livro!]!
    }

**NOTA:** `type` é para saídas e `input` para entradas. Não podes reutilizar um `type` como argumento, mesmo que os campos sejam iguais.

## Interfaces

Uma `interface` define campos que vários tipos têm de implementar:

    interface Publicacao {
      id: ID!
      titulo: String!
    }

    type Livro implements Publicacao {
      id: ID!
      titulo: String!
      autor: Autor!
    }

    type Revista implements Publicacao {
      id: ID!
      titulo: String!
      edicao: Int!
    }

    type Query {
      publicacoes: [Publicacao!]!
    }

Um tipo que implementa a interface tem de repetir todos os campos dela. Ao consultar, usa inline fragments para os campos específicos:

    query {
      publicacoes {
        titulo
        ... on Livro { autor { nome } }
        ... on Revista { edicao }
      }
    }

## Uniões

Uma `union` agrupa tipos **sem campos em comum obrigatórios**:

    union ResultadoPesquisa = Livro | Autor | Critica

    type Query {
      pesquisa(texto: String!): [ResultadoPesquisa!]!
    }

Como não há campos partilhados, quase só se pode pedir `__typename` diretamente. Tudo o resto tem de passar por inline fragments.

| Quando usar | Interface | União |
|---|---|---|
| Os tipos partilham campos | Sim | Desnecessário |
| Os tipos são totalmente distintos | Não | Sim |
| Membros podem ser interfaces | n/a | Não, só tipos de objeto |

## Os tipos raiz

Um schema tem até três tipos raiz:

    schema {
      query: Query
      mutation: Mutation
      subscription: Subscription
    }

A declaração `schema { ... }` só é necessária se usares nomes diferentes dos por omissão (`Query`, `Mutation`, `Subscription`). `Query` é obrigatório; os outros dois são opcionais (módulo 03).

## Evoluir sem versões

O GraphQL evita `/v2`: acrescentar campos e tipos não parte clientes antigos. Para retirar algo, marca-o como obsoleto primeiro:

    type Livro {
      titulo: String!
      nome: String @deprecated(reason: "Usa o campo titulo.")
    }

Os clientes veem o aviso nas ferramentas. Só depois de verificares (por métricas) que ninguém usa o campo o removes.

**ATENÇÃO:** são alterações **incompatíveis** remover ou renomear campos, tornar um argumento obrigatório, mudar `String` para `Int` e tornar um campo nulo em não nulo (ou o inverso nos inputs). Estas exigem coordenação com os clientes.

## Schema completo do projeto

    enum Genero { FICCAO NAO_FICCAO POESIA TEATRO }

    type Autor {
      id: ID!
      nome: String!
      nascimento: String
      livros: [Livro!]!
    }

    type Livro {
      id: ID!
      titulo: String!
      ano: Int
      genero: Genero!
      autor: Autor!
      criticas: [Critica!]!
    }

    type Critica {
      id: ID!
      nota: Int!
      comentario: String
      livro: Livro!
    }

    type Query {
      livros(filtro: FiltroLivros): [Livro!]!
      livro(id: ID!): Livro
      autores: [Autor!]!
    }

    input FiltroLivros {
      genero: Genero
      anoMinimo: Int
    }

Este schema é a base dos módulos seguintes.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Unknown type "X"` | Tipo usado mas nunca declarado, ou erro de escrita |
| `Interface field Publicacao.id expected but Livro does not provide it` | O tipo não repete todos os campos da interface |
| `The type of X.y must be Input Type but got: Livro` | Usaste um `type` como argumento em vez de `input` |
| `Cannot return null for non-nullable field` | Um resolver devolveu `null` num campo com `!` |
| Enum rejeitado na consulta | Escreveste o valor entre aspas ou com minúsculas diferentes |

## Exercícios

**PRATICAR:** exercícios 7 a 10 do módulo 11 (escrever tipos, enums e inputs, interface e união, marcar campo como obsoleto).

## Fontes oficiais

- [Schemas e tipos](https://graphql.org/learn/schema/)
- [Esquemas, listas e não nulos](https://graphql.org/learn/schema/)
- [Especificação: sistema de tipos](https://spec.graphql.org/October2021/#sec-Type-System)
