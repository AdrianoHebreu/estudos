# 01 Linguagem de consulta

## Anatomia de uma query

Uma operação tem um **tipo** (`query`), um **nome** opcional e um **conjunto de seleção** entre chavetas.

    query ListarLivros {
      livros {
        id
        titulo
        ano
      }
    }

- `query` pode ser omitido na forma abreviada (`{ livros { id } }`), mas só quando não há nome, variáveis nem diretivas.
- O **nome** (`ListarLivros`) não altera o resultado, mas facilita depuração e métricas. Usa-o sempre fora de testes rápidos.
- Cada campo escalar (`id`, `titulo`) é uma folha. Campos que devolvem objetos **têm** de ter sub-seleção.

**ATENÇÃO:** pedir um campo de objeto sem sub-seleção (`livros`) é erro de validação. Pedir sub-seleção num escalar (`titulo { x }`) também.

## Campos e relações

O poder do GraphQL está em navegar relações num só pedido:

    query {
      livros {
        titulo
        autor {
          nome
          livros { titulo }
        }
        criticas { nota }
      }
    }

Não há limite teórico de profundidade na linguagem. Na prática, os servidores impõem limites (módulo 09), porque consultas muito profundas são caras.

## Argumentos

Os campos aceitam argumentos, que podem ser literais:

    query {
      livro(id: "1") { titulo }
      livros(genero: FICCAO, limite: 5) { titulo }
    }

Os valores seguem a sintaxe da linguagem: strings entre aspas, inteiros, floats, booleanos (`true`/`false`), `null`, enums **sem aspas** (`FICCAO`), listas `[1, 2]` e objetos `{ chave: valor }`.

## Aliases

Se pedires o mesmo campo duas vezes com argumentos diferentes, os resultados colidiriam. O **alias** dá um nome de resposta distinto:

    query {
      primeiro: livro(id: "1") { titulo }
      segundo: livro(id: "2") { titulo }
    }

A resposta usa as chaves `primeiro` e `segundo`:

    {
      "data": {
        "primeiro": { "titulo": "Ensaio sobre a Cegueira" },
        "segundo": { "titulo": "Memorial do Convento" }
      }
    }

## Variáveis

Nunca concatenes valores dentro do texto da query. Usa **variáveis**: a query fica fixa e os valores seguem à parte, em JSON.

    query LivroPorId($id: ID!, $comCriticas: Boolean = false) {
      livro(id: $id) {
        titulo
        criticas @include(if: $comCriticas) { nota }
      }
    }

    // variáveis enviadas com o pedido
    { "id": "1", "comCriticas": true }

Pontos a reter:

- Cada variável tem um **tipo** declarado (`ID!`, `Boolean`) que tem de ser compatível com o do argumento onde é usada.
- `!` significa **não nulo**: `ID!` é obrigatório; `Boolean` aceita `null` ou ausência.
- O valor por omissão (`= false`) aplica-se quando a variável não é enviada.

**ATENÇÃO:** montar a query com template strings (`` `livro(id: "${id}")` ``) abre a porta a injeção e impede o servidor de reutilizar a query analisada. As variáveis resolvem as duas coisas.

## Pedido HTTP

Por convenção, o pedido é um `POST` para `/graphql` com corpo JSON:

    curl -X POST http://localhost:4000/graphql \
      -H "Content-Type: application/json" \
      -d '{"query":"query($id: ID!){ livro(id:$id){ titulo } }","variables":{"id":"1"}}'

Em JavaScript, com `fetch`:

    const resposta = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'query($id: ID!) { livro(id: $id) { titulo } }',
        variables: { id: '1' },
      }),
    })
    const { data, errors } = await resposta.json()

**NOTA:** um servidor GraphQL pode devolver estado HTTP 200 mesmo quando há erros: verifica sempre o campo `errors` na resposta (ver módulo 07).

## Fragments

Quando os mesmos campos se repetem, extrai-os para um **fragment**:

    query {
      livros {
        ...ResumoLivro
        autor { nome }
      }
      maisVendido: livro(id: "7") { ...ResumoLivro }
    }

    fragment ResumoLivro on Livro {
      id
      titulo
      ano
    }

O fragment é declarado `on` um tipo e pode ser usado em qualquer sítio onde esse tipo apareça. Os clientes como o Apollo e o Relay usam fragments para que cada componente declare os dados de que precisa.

### Fragments inline e tipos abstratos

Quando um campo devolve uma interface ou união (módulo 02), usa-se um **inline fragment** para pedir campos de um tipo concreto:

    query {
      pesquisa(texto: "Saramago") {
        __typename
        ... on Livro { titulo }
        ... on Autor { nome }
      }
    }

O campo especial `__typename` devolve o nome do tipo concreto e é muito usado pelos clientes para saber que tipo recebeu.

## Diretivas

As diretivas alteram a execução. As duas standard para consultas são:

| Diretiva | Efeito |
|---|---|
| `@include(if: Boolean!)` | Inclui o campo só se a condição for verdadeira |
| `@skip(if: Boolean!)` | Omite o campo se a condição for verdadeira |

    query ($detalhe: Boolean!) {
      livro(id: "1") {
        titulo
        sinopse @include(if: $detalhe)
        criticas @skip(if: $detalhe) { nota }
      }
    }

Os servidores podem definir diretivas próprias (por exemplo `@auth`, módulo 08).

## Introspeção

Um schema GraphQL pode ser consultado a si próprio, e é daí que vêm a documentação automática e o autocompletar dos clientes:

    query {
      __schema {
        queryType { name }
        types { name kind }
      }
      __type(name: "Livro") {
        fields { name type { name kind } }
      }
    }

**ATENÇÃO:** em produção, muitas equipas desativam a introspeção em APIs privadas para não expor o schema a terceiros. Não é uma medida de segurança por si só (ver módulo 08).

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Cannot query field "x" on type "Y"` | O campo não existe nesse tipo (erro de escrita ou schema desatualizado) |
| `Field "autor" of type "Autor!" must have a selection of subfields` | Faltou a sub-seleção num campo de objeto |
| `Variable "$id" of type "String" used in position expecting type "ID!"` | Tipo da variável incompatível com o do argumento |
| `Unknown argument "x" on field "Query.livros"` | Argumento inexistente ou mal escrito |
| `Fragment "X" is never used` | Fragment declarado e não usado (erro de validação) |

## Exercícios

**PRATICAR:** exercícios 2 a 6 do módulo 11 (consultas simples, aliases, variáveis, fragments e diretivas).

## Fontes oficiais

- [Queries e mutations](https://graphql.org/learn/queries/)
- [Execução](https://graphql.org/learn/execution/)
- [Introspeção](https://graphql.org/learn/introspection/)
- [Servir sobre HTTP](https://graphql.org/learn/serving-over-http/)
