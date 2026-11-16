# 04 Aggregation

No módulo 02 usaste `find` para ler documentos. Quando precisas de somas, médias, agrupamentos ou de juntar coleções, usas o aggregation framework: uma cadeia de estágios em que cada um transforma os documentos que recebe do anterior. Neste módulo calculas receita por categoria, os melhores clientes e as encomendas por mês na loja, e comparas tudo com GROUP BY e JOIN do SQL.

Tudo foi executado em MongoDB 8.3.17 (imagem `mongo:8`), no servidor de estudo partilhado, na base `m04`.

## Preparar os dados

Se ainda não tens a loja importada (módulo 01), importa os cinco ficheiros JSON para uma base própria. No Git Bash do Windows, o `MSYS_NO_PATHCONV` evita que o caminho `/tmp/...` seja convertido.

    export MSYS_NO_PATHCONV=1
    docker cp encomendas.json est-mongo:/tmp/encomendas.json     # repete para as 5 coleções
    docker exec est-mongo mongoimport --db m04 --collection encomendas --jsonArray --file /tmp/encomendas.json

Ficas com `categorias` (3), `clientes` (8), `produtos` (10), `encomendas` (12) e `linhas_encomenda` (26). O modelo é plano e cada documento tem o campo `id` (o das tabelas) além do `_id` do MongoDB, por isso as junções usam `id`. Onde a ordem natural dos documentos não é garantida, dizemo-lo.

## O conceito de pipeline

    db.colecao.aggregate([ estágio1, estágio2, estágio3 ])

Cada estágio é um documento com um único operador de estágio (`$match`, `$group`...). Os documentos entram no primeiro, o resultado passa ao segundo, e assim por diante, como o pipe do shell.

| Estágio | Para que serve | Equivalente SQL |
|---|---|---|
| `$match` | filtrar documentos | WHERE (ou HAVING depois de `$group`) |
| `$project` | escolher e calcular campos | lista do SELECT |
| `$group` | agrupar e agregar | GROUP BY |
| `$sort`, `$limit`, `$skip` | ordenar e paginar | ORDER BY, LIMIT, OFFSET |
| `$unwind` | desdobrar um array em vários documentos | JOIN que multiplica linhas |
| `$lookup` | juntar outra coleção | LEFT JOIN |
| `$addFields` ou `$set` | acrescentar campos calculados | colunas calculadas |

## $match, $project e $limit

`$match` usa a mesma sintaxe de filtros do `find`. `$project` escolhe os campos (1 inclui, 0 exclui) e cria campos novos com expressões.

    db.produtos.aggregate([
      { $match: { categoria_id: 2, stock: { $gt: 20 } } },
      { $project: { _id: 0, nome: 1, preco: 1, stock: 1 } }
    ])
    // { nome: 'Auscultadores Bluetooth', preco: 49.9, stock: 30 }
    // { nome: 'Carregador USB-C', preco: 14.9, stock: 100 }

Dentro das expressões, `"$preco"` (com `$` à frente e entre aspas) é o valor do campo `preco`. `$multiply` e `$round` são operadores de expressão: `{ $round: [{ $multiply: ["$preco", 1.23] }, 2] }` dá o preço com IVA (110.58 para o Conjunto de Panelas).

**ATENÇÃO:** não podes misturar inclusão e exclusão no mesmo `$project` (exceto `_id: 0`). `{ $project: { nome: 1, stock: 0 } }` dá o erro `Cannot do exclusion on field stock in inclusion projection`.

## $group: agrupar e agregar

`_id` é a chave de agrupamento. Os restantes campos são acumuladores. Clientes por cidade: `{ $group: { _id: "$cidade", total: { $sum: 1 } } }` devolveu Lisboa 3, Porto 2 e Braga, Coimbra e Faro com 1.

Com vários acumuladores (estatísticas dos produtos por categoria):

    db.produtos.aggregate([
      { $group: { _id: "$categoria_id", n: { $sum: 1 }, media: { $avg: "$preco" },
                  min: { $min: "$preco" }, max: { $max: "$preco" },
                  stock: { $sum: "$stock" }, nomes: { $push: "$nome" } } },
      { $sort: { _id: 1 } }
    ])
    // { _id: 1, n: 3, media: 20.463333333333335, min: 12.9, max: 29.99, stock: 75,
    //   nomes: [ 'Atlas Mundial', 'Livro de Receitas', 'Romance Policial' ] }   (e as categorias 2 e 3)

| Acumulador | Resultado |
|---|---|
| `$sum` | soma (`$sum: 1` conta documentos) |
| `$avg`, `$min`, `$max` | média, mínimo, máximo |
| `$push` | array com todos os valores (repetidos incluídos) |
| `$addToSet` | array sem repetidos, em ordem não garantida |
| `$first`, `$last` | primeiro e último do grupo (depois de um `$sort`) |

Com `$addToSet` nos estados das encomendas do cliente 2 saiu `["enviada","pendente","entregue"]`: não assumas a ordem. Total geral com `_id: null`:

    db.linhas_encomenda.aggregate([
      { $group: { _id: null, linhas: { $sum: 1 }, unidades: { $sum: "$quantidade" },
                  receita: { $sum: { $multiply: ["$quantidade", "$preco_unitario"] } } } }
    ])
    // [ { _id: null, linhas: 26, unidades: 46, receita: 1005.49 } ]

**DICA:** as médias saem com muitas casas decimais (`20.463333333333335`): arredonda no fim com `$round`.

## $sort, $skip, $limit e $count

    db.produtos.aggregate([ { $sort: { preco: -1, _id: 1 } }, { $skip: 3 }, { $limit: 3 },
                            { $project: { _id: 0, nome: 1, preco: 1 } } ])
    // Manta de Sofá 34.5, Atlas Mundial 29.99, Candeeiro de Mesa 22   (a "página 2" de 3 em 3)

`$match` seguido de `{ $count: "entregues" }` conta documentos (5 encomendas entregues). `{ $sortByCount: "$estado" }` é um atalho de `$group` com `$sum: 1` mais `$sort` descendente (devolveu entregue 5, pendente 3, enviada 3, cancelada 1).

**ATENÇÃO:** a ordem importa. `$limit: 3` antes de `$sort` ordena apenas três documentos quaisquer (deu Conjunto de Panelas, Auscultadores Bluetooth e Manta de Sofá); o top 3 verdadeiro é Conjunto de Panelas 89.9, Teclado Mecânico 79 e Auscultadores 49.9. Acrescenta um desempate (`_id: 1`): valores iguais podem sair em qualquer ordem.

## $addFields ou $set e expressões

`$set` (sinónimo de `$addFields`) acrescenta ou substitui campos sem tocar nos restantes.

    { $addFields: { valor_stock: { $multiply: ["$preco", "$stock"] } } }
    // Auscultadores Bluetooth: 1497, Carregador USB-C: 1490 (os dois maiores valores em stock)

As expressões que mais vais usar:

| Expressão | Exemplo | Resultado real |
|---|---|---|
| `$multiply`, `$round` | `{ $round: [{ $multiply: ["$preco", 1.23] }, 2] }` | 110.58 (Conjunto de Panelas) |
| `$cond` | `{ $cond: { if: { $lt: ["$stock", 20] }, then: "repor", else: "ok" } }` | Teclado Mecânico (stock 0): "repor"; dentro de `$sum`, `$cond: [{ $eq: ["$estado", "entregue"] }, 1, 0]` conta só as entregues |
| `$dateToString` | `{ $dateToString: { format: "%Y-%m", date: "$data_encomenda" } }` | "2025-01" (encomenda 1) |
| `$arrayElemAt` | `{ $arrayElemAt: ["$c.nome", 0] }` | primeiro nome do array `c` (top clientes) |
| `$switch` | `branches: [ { case: ..., then: ... } ], default: "caro"` | Panelas "caro", Auscultadores "medio", Caneca "barato" |

**ATENÇÃO:** `$switch` sem `default` dá erro quando nenhum ramo serve (`$switch could not find a matching branch for an input, and no default was specified`). Define sempre o `default`.

## $lookup: juntar coleções

`$lookup` faz o equivalente a um LEFT JOIN: acrescenta a cada documento um array com as correspondências da outra coleção.

    db.encomendas.aggregate([
      { $match: { id: 1 } },
      { $lookup: { from: "clientes", localField: "cliente_id", foreignField: "id", as: "cliente" } },
      { $project: { _id: 0, id: 1, estado: 1, "cliente.nome": 1, "cliente.cidade": 1 } }
    ])
    // [ { id: 1, estado: 'entregue', cliente: [ { nome: 'Ana Ribeiro', cidade: 'Lisboa' } ] } ]

O resultado é sempre um array. Desembrulha-o com `$arrayElemAt` ou `$unwind`.

### Left join e o efeito do $unwind

`$lookup` não perde documentos sem correspondência: os clientes Hugo Teixeira e Graça Nunes não têm encomendas e ficam com `enc: []`.

    db.clientes.aggregate([
      { $lookup: { from: "encomendas", localField: "id", foreignField: "cliente_id", as: "enc" } },
      { $match: { enc: { $size: 0 } } },
      { $project: { _id: 0, nome: 1, cidade: 1 } }
    ])
    // { nome: 'Hugo Teixeira', cidade: 'Lisboa' }, { nome: 'Graça Nunes', cidade: 'Faro' }

Já o `$unwind` desdobra o array num documento por elemento e deita fora os que têm o array vazio: sobre o Hugo, `{ $unwind: "$enc" }` devolveu `[]` (INNER JOIN). Com `{ $unwind: { path: "$enc", preserveNullAndEmptyArrays: true } }` mantém-no, sem o campo `enc`.

### $lookup com sub-pipeline

Quando precisas de filtrar ou projetar a coleção de destino, ou de condições mais ricas que a igualdade, usa `let` e `pipeline`:

    { $lookup: { from: "linhas_encomenda", let: { eid: "$id" },
                 pipeline: [ { $match: { $expr: { $eq: ["$encomenda_id", "$$eid"] } } },
                             { $project: { _id: 0, produto_id: 1, quantidade: 1 } } ],
                 as: "linhas" } }
    // encomenda 1, linhas: [ { produto_id: 5, quantidade: 1 }, { produto_id: 1, quantidade: 2 } ]   (ordem não garantida)

## Exemplos de negócio na loja

Receita por categoria, sem encomendas canceladas. Partimos das encomendas para filtrar logo, juntamos as linhas, os produtos e as categorias, e agrupamos:

    db.encomendas.aggregate([
      { $match: { estado: { $ne: "cancelada" } } },
      { $lookup: { from: "linhas_encomenda", localField: "id", foreignField: "encomenda_id", as: "linha" } },
      { $unwind: "$linha" },
      { $lookup: { from: "produtos", localField: "linha.produto_id", foreignField: "id", as: "produto" } },
      { $unwind: "$produto" },
      { $lookup: { from: "categorias", localField: "produto.categoria_id", foreignField: "id", as: "categoria" } },
      { $unwind: "$categoria" },
      { $group: { _id: "$categoria.nome", unidades: { $sum: "$linha.quantidade" },
                  receita: { $sum: { $multiply: ["$linha.quantidade", "$linha.preco_unitario"] } } } },
      { $set: { receita: { $round: ["$receita", 2] } } },
      { $sort: { receita: -1 } }
    ])
    // { _id: 'Eletrónica', unidades: 12, receita: 382.9 }
    // { _id: 'Casa', unidades: 22, receita: 356.9 }
    // { _id: 'Livros', unidades: 11, receita: 175.79 }

Top 3 clientes por valor gasto (sem canceladas):

    db.encomendas.aggregate([
      { $match: { estado: { $ne: "cancelada" } } },
      { $lookup: { from: "linhas_encomenda", localField: "id", foreignField: "encomenda_id", as: "linhas" } },
      { $unwind: "$linhas" },
      { $group: { _id: "$cliente_id", encomendas: { $addToSet: "$id" },
                  gasto: { $sum: { $multiply: ["$linhas.quantidade", "$linhas.preco_unitario"] } } } },
      { $lookup: { from: "clientes", localField: "_id", foreignField: "id", as: "c" } },
      { $project: { _id: 0, cliente: { $arrayElemAt: ["$c.nome", 0] },
                    n_encomendas: { $size: "$encomendas" }, gasto: { $round: ["$gasto", 2] } } },
      { $sort: { gasto: -1 } }, { $limit: 3 }
    ])
    // { cliente: 'Bruno Costa', n_encomendas: 3, gasto: 296.69 }
    // { cliente: 'Diogo Pires', n_encomendas: 2, gasto: 192.5 }
    // { cliente: 'Ana Ribeiro', n_encomendas: 3, gasto: 185 }

Encomendas por mês: `{ $group: { _id: { $dateToString: { format: "%Y-%m", date: "$data_encomenda" } }, encomendas: { $sum: 1 } } }` seguido de `{ $sort: { _id: 1 } }` deu 2025-01: 2, 2025-02: 2, 2025-03: 2, 2025-04: 3, 2025-05: 2, 2025-06: 1. **NOTA:** `$dateToString` formata em UTC por omissão. Para o fuso de Lisboa acrescenta `timezone: "Europe/Lisbon"` ao documento do operador.

## $facet e $bucket: vários resultados de uma só passagem

`$facet` corre vários sub-pipelines sobre os mesmos documentos de entrada e devolve um único documento com um campo por sub-pipeline:

    db.encomendas.aggregate([
      { $facet: { por_estado: [ { $group: { _id: "$estado", n: { $sum: 1 } } }, { $sort: { _id: 1 } } ],
                  total: [ { $count: "n" } ] } }
    ])
    // por_estado: cancelada 1, entregue 5, enviada 3, pendente 3   total: [ { n: 12 } ]

`$bucket` agrupa por intervalos. Os limites (`boundaries`) são fechados à esquerda e abertos à direita:

    db.produtos.aggregate([
      { $bucket: { groupBy: "$preco", boundaries: [0, 15, 30, 60], default: "acima",
                   output: { n: { $sum: 1 } } } }
    ])
    // { _id: 0, n: 3 }, { _id: 15, n: 3 }, { _id: 30, n: 2 }, { _id: 'acima', n: 2 }

Sem `default`, um preço fora dos limites provoca erro (a mensagem refere `$switch`). `$bucketAuto: { groupBy: "$preco", buckets: 3 }` escolhe os limites: 6.5 a 18.5, 18.5 a 34.5 e 34.5 a 89.9, com 3, 3 e 4 produtos.

## $out e $merge: guardar o resultado

`$out` escreve o resultado numa coleção, substituindo-a se já existir. Serve para materializar o modelo incorporado do módulo 03:

    db.encomendas.aggregate([
      { $lookup: { from: "linhas_encomenda", localField: "id", foreignField: "encomenda_id", as: "linhas" } },
      { $project: { _id: 0, id: 1, cliente_id: 1, estado: 1, data_encomenda: 1,
                    "linhas.produto_id": 1, "linhas.quantidade": 1, "linhas.preco_unitario": 1 } },
      { $out: "encomendas_completas" }
    ])
    // encomenda 1: { id: 1, ..., estado: 'entregue', linhas: [ { produto_id: 5, quantidade: 1, preco_unitario: 14.9 }, ... ] }

Agora o `$unwind` trabalha sobre um array real, e `includeArrayIndex: "pos"` guarda a posição de cada linha. Com os dados já incorporados, o total da encomenda calcula-se sem `$unwind`: `$sum` sobre um `$map` dos `linhas` deu `{ id: 1, n_linhas: 2, total: 40.7 }`. Confirma a sintaxe de `$map` na documentação.

`$merge` é mais fino: junta o resultado a uma coleção existente, atualizando ou inserindo documentos pela chave `on` (por omissão `_id`). Guardei a receita mensal assim:

    { $merge: { into: "receita_mensal", whenMatched: "replace", whenNotMatched: "insert" } }
    // receita_mensal: 2025-01 105.5, 2025-02 134.4, 2025-03 195.69, 2025-04 182.3, 2025-05 242.6, 2025-06 145

Depois cancelei as encomendas 11 e 12 e voltei a correr o pipeline sem canceladas: maio passou a 83.7 e fevereiro a 44.5 (a encomenda 4 já estava cancelada), mas junho ficou com 145 embora o pipeline já não o produza. O `$merge` nunca apaga documentos que deixaram de aparecer no resultado.

**ATENÇÃO:** se usares `on` com um campo que não tem índice único, o `$merge` falha (`Cannot find index to verify that join fields will be unique`, código 51183). O `$out` não tem este problema, mas apaga e recria a coleção de destino.

## Ordem dos estágios e desempenho

Regra de ouro: filtra cedo e reduz o volume antes dos estágios caros (`$lookup`, `$unwind`, `$group`). Medi com `explain` nesta versão. O otimizador já reordena o que é seguro: um `$match` escrito depois de um `$project`, de um `$sort` ou de um `$lookup` independente foi movido para o início (o filtro apareceu no plano de leitura da coleção). Um `$match` sobre a chave do `$group` também foi empurrado para trás do `$group`. Mas não move um `$match` sobre um campo criado no próprio pipeline:

| Pipeline | O `$match` foi para o início? |
|---|---|
| `$project` e depois `$match` em `estado` | sim |
| `$group` e depois `$match` na chave `_id` | sim |
| `$group` e depois `$match` num total (`n`) | não |
| `$addFields` (ano) e depois `$match` em `ano` | não |

**DICA:** não dependas do otimizador. Escreve o `$match` no início sempre que o filtro usar campos originais. Só um `$match` no início consegue usar um índice. Com um índice em `estado` (`db.encomendas.createIndex({ estado: 1 })`, tema do módulo 05), o pipeline `$match` mais `$lookup` passou de COLLSCAN (38 documentos examinados) para IXSCAN: 5 chaves do índice e 31 documentos examinados.

Outras regras: começa pela coleção que o filtro reduz mais (por isso a receita por categoria parte de `encomendas`) e usa `$project` para levar menos campos adiante. Estágios que precisam de mais de 100 MB de memória escrevem em disco quando `allowDiskUseByDefault` é verdadeiro, valor que confirmei neste servidor (`true`; confirma na documentação a partir de que versão existe). Com muitos dados, pensa em modelar para evitar `$lookup`, como viste no módulo 03.

## Comparação com SQL

| Pergunta | SQL | Aggregation |
|---|---|---|
| Filtrar linhas | WHERE estado diferente de cancelada | `$match` no início |
| Filtrar grupos | HAVING SUM(...) maior que 100 | `$match` depois do `$group` |
| Agrupar | GROUP BY categoria | `$group` com `_id` |
| Inner join | JOIN ... ON | `$lookup` e `$unwind` (descarta os vazios) |
| Left join | LEFT JOIN | `$lookup` sozinho |

A receita por categoria em SQL, para comparares (corrida em SQLite sobre os mesmos dados, devolve os mesmos 382.9, 356.9 e 175.79):

    SELECT c.nome, SUM(l.quantidade) AS unidades,
           ROUND(SUM(l.quantidade * l.preco_unitario), 2) AS receita
    FROM linhas_encomenda l
    JOIN encomendas e ON e.id = l.encomenda_id
    JOIN produtos p ON p.id = l.produto_id
    JOIN categorias c ON c.id = p.categoria_id
    WHERE e.estado <> 'cancelada'
    GROUP BY c.nome ORDER BY receita DESC;

Diferenças honestas: o SQL é declarativo e o planeador escolhe a ordem das junções; o pipeline é uma receita passo a passo (mais controlo, mais trabalho). As junções são o ponto fraco do MongoDB: se o relatório precisa de três por pergunta, talvez o modelo certo seja incorporar (módulo 03) ou usar uma base relacional. Em contrapartida, os pipelines tratam documentos aninhados e arrays com naturalidade.

## Usar a partir do Python

Em Python o pipeline é uma lista de dicionários e `aggregate` devolve um cursor (testado com pymongo 4.20.0). O ficheiro `exemplos/aggregation_pymongo.py` corre a receita por categoria e um pipeline com data:

    desde = datetime(2025, 4, 1, tzinfo=timezone.utc)
    db.encomendas.aggregate([ {"$match": {"data_encomenda": {"$gte": desde}}},
                              {"$group": {"_id": "$estado", "n": {"$sum": 1}}}, {"$sort": {"n": -1, "_id": 1}} ])
    # [{'_id': 'pendente', 'n': 3}, {'_id': 'enviada', 'n': 2}, {'_id': 'entregue', 'n': 1}]

**ATENÇÃO:** passa datas como `datetime`, não como texto. Com a string `"2025-04-01"` o `$match` não devolveu nada (comparou datas com texto).

## Exercícios

**PRATICAR:** faz os exercícios 13 a 16 (estatísticas por categoria, receita mensal, produtos mais vendidos e relatório com `$facet`). As soluções estão no módulo 11.

## Fontes oficiais

- Aggregation: https://www.mongodb.com/docs/manual/aggregation/
- Pipeline: https://www.mongodb.com/docs/manual/core/aggregation-pipeline/
- Otimização do pipeline: https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/
- Limites do pipeline: https://www.mongodb.com/docs/manual/core/aggregation-pipeline-limits/
- Referência dos estágios: https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/
- $group: https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
- $lookup: https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/
- $unwind: https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
- $bucket: https://www.mongodb.com/docs/manual/reference/operator/aggregation/bucket/
- $facet: https://www.mongodb.com/docs/manual/reference/operator/aggregation/facet/
- $merge: https://www.mongodb.com/docs/manual/reference/operator/aggregation/merge/
- $out: https://www.mongodb.com/docs/manual/reference/operator/aggregation/out/
- $dateToString: https://www.mongodb.com/docs/manual/reference/operator/aggregation/dateToString/
- $cond: https://www.mongodb.com/docs/manual/reference/operator/aggregation/cond/
- SQL para aggregation: https://www.mongodb.com/docs/manual/reference/sql-aggregation-comparison/
- Collection.aggregate no PyMongo: https://pymongo.readthedocs.io/en/stable/api/pymongo/collection.html
