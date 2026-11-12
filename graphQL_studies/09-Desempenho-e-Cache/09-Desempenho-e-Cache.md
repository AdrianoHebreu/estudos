# 09 Desempenho e cache

## Onde costuma doer

Os problemas de desempenho em GraphQL raramente estão no GraphQL em si. Vêm de:

1. **N+1**: demasiadas idas à base de dados por causa dos resolvers independentes.
2. **Consultas caras**: pedidos muito profundos ou muito largos.
3. **Falta de cache**: o mesmo dado calculado vezes sem conta.

## O problema N+1

Com os resolvers do módulo 04, a consulta:

    query {
      livros {
        titulo
        autor { nome }
      }
    }

executa `Query.livros` **uma vez** (1) e `Livro.autor` **uma vez por livro** (N). Com 100 livros são 101 consultas à base de dados, quando duas bastariam: uma para os livros e outra para todos os autores de uma vez.

    Livro: {
      autor: (livro, _a, { db }) => db.autores.porId(livro.autorId), // N consultas
    },

## DataLoader

O **DataLoader** resolve o N+1 com dois mecanismos:

- **Agrupamento (*batching*)**: reúne todas as chaves pedidas no mesmo ciclo do event loop e chama a função de carregamento **uma só vez**, com a lista completa.
- **Cache por pedido**: se a mesma chave for pedida duas vezes, reutiliza o resultado.

    npm install dataloader

    import DataLoader from 'dataloader'

    const autores = new DataLoader(async (ids) => {
      const linhas = await db.autores.porIds(ids) // UMA consulta: WHERE id IN (...)
      const porId = new Map(linhas.map((a) => [a.id, a]))
      return ids.map((id) => porId.get(id)) // mesma ordem das chaves
    })

Executado e verificado: com 10 livros de 2 autores, a função de carregamento foi chamada **uma só vez**, com as chaves `['1', '2']` (duplicados removidos).

### Regras da função de lote

| Regra | Porquê |
|---|---|
| Devolver um array com **o mesmo tamanho** das chaves | O DataLoader associa resultados por posição |
| Manter a **mesma ordem** das chaves | Senão o resultado vai para o pedido errado |
| Devolver `undefined` ou um `Error` na posição de uma chave que falhou | Falha só essa chave, não todas |

**ATENÇÃO:** o erro mais comum é devolver os resultados na ordem em que a base de dados os devolve. Mapeia sempre por `id`, como acima.

## Um loader por pedido

Cria os loaders **no contexto**, de modo a existirem por pedido:

    context: async ({ req }) => ({
      utilizador: await autenticar(req),
      autores: new DataLoader(carregarAutores),
    }),

    Livro: {
      autor: (livro, _a, ctx) => ctx.autores.load(livro.autorId),
    },

**ATENÇÃO:** nunca guardes um DataLoader numa variável global. A cache dele vive enquanto o objeto existir, e dados de um utilizador seriam servidos a outro (ou ficariam desatualizados para sempre).

## Limitar consultas caras

Mesmo sem N+1, um pedido pode custar muito. Defesas habituais:

| Medida | Como |
|---|---|
| Profundidade máxima | Regra de validação (por exemplo, `graphql-depth-limit`) |
| Complexidade máxima | Custo por campo, soma limitada (bibliotecas dedicadas) |
| Limite em listas | `first` com máximo fixo (módulo 06) |
| Tempo limite | Cancelar resolvers demorados |
| Documentos persistidos | Só aceitar consultas previamente registadas (ver adiante) |

Uma consulta como `autor { livros { autor { livros { autor { ... } } } } }` só é possível porque os tipos se referenciam em círculo. Limitar a profundidade é a primeira defesa.

## Cache

Há várias camadas, cada uma resolve um problema diferente:

| Camada | O que guarda | Exemplo |
|---|---|---|
| **Cliente** | Resultados por objeto | Cache normalizada do Apollo Client (módulo 05) |
| **Pedido** | Chaves já carregadas | DataLoader |
| **Servidor, por campo ou resultado** | Respostas de dados lentos | Redis, memória |
| **CDN / HTTP** | Respostas completas | Só com GET e documentos persistidos |

### Cache HTTP

Em REST, `GET /livros/1` é cacheável por URL. Em GraphQL, o pedido habitual é `POST /graphql` com a consulta no corpo, e os `POST` não são cacheados por CDNs. Para usar cache HTTP é preciso:

1. enviar as consultas por `GET`;
2. usar **documentos persistidos**, em que o cliente envia só um identificador (hash) da consulta, e não o texto completo;
3. dar dicas de cache pelo servidor (`Cache-Control`), por exemplo com `@cacheControl`.

**NOTA:** estes mecanismos dependem da stack (Apollo Server, gateway ou CDN). Ao escolher, consulta a documentação oficial da versão que usas.

## Documentos persistidos

Em vez de enviar `query { livros { id titulo } }` em cada pedido, o cliente envia um identificador:

    {"extensions":{"persistedQuery":{"version":1,"sha256Hash":"ecf4edb4..."}}}

| Vantagem | Nota |
|---|---|
| Pedidos mais pequenos | Útil em redes móveis |
| Permite cache em CDN com `GET` | Combina com `Cache-Control` |
| Pode **recusar** consultas desconhecidas | Reforço de segurança forte (lista de permissões) |

## Medir antes de otimizar

Não otimizes por palpite. Passos:

1. **Medir**: tempo por operação e por resolver (traces, métricas, registos com o nome da operação).
2. **Encontrar** o maior custo: normalmente a base de dados, não o GraphQL.
3. **Corrigir** primeiro N+1 e índices; só depois cache.
4. **Medir de novo**.

**DICA:** conta as consultas à base de dados por pedido durante o desenvolvimento. Um pedido simples a fazer dezenas de consultas é o sinal clássico de N+1.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Muitas consultas SQL para uma lista | N+1: falta um DataLoader na relação |
| Resultados trocados entre registos | A função de lote não respeita a ordem das chaves |
| Dados desatualizados entre pedidos | DataLoader criado fora do contexto |
| `DataLoader must be constructed with a function` | Foi passado outro valor em vez da função de lote |
| Pedidos muito lentos só para alguns clientes | Consultas profundas sem limite de profundidade |
| CDN nunca devolve da cache | Pedidos `POST` sem documentos persistidos |

## Exercícios

**PRATICAR:** exercícios 35 a 38 do módulo 11 (contar consultas N+1, DataLoader, ordem das chaves, limite de profundidade).

## Fontes oficiais

- [Boas práticas: o problema N+1](https://graphql.org/learn/performance/)
- [DataLoader](https://github.com/graphql/dataloader)
- [Cache no Apollo Server](https://www.apollographql.com/docs/apollo-server/performance/caching)
- [Persisted queries no Apollo Server](https://www.apollographql.com/docs/apollo-server/performance/apq)
