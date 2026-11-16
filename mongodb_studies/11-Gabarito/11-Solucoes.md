# 11 Soluções e critérios

Soluções dos exercícios do módulo 9. Todas foram executadas durante a escrita do curso e os resultados mostrados são reais. Há sempre mais de uma solução correta: compara o comportamento, não o código.

## Módulo 01 · Conceitos e ambiente

### Exercício 1

Executado em `01-Conceitos-e-Ambiente/exemplos`, no Git Bash:

    MONGO_PORT=31010 docker compose -p est-mg01 up -d --wait
    for c in categorias clientes produtos encomendas linhas_encomenda; do
      docker compose -p est-mg01 exec mongo mongoimport --db loja --collection $c --jsonArray --file /dados-loja/$c.json
    done
    docker compose -p est-mg01 exec mongo mongosh --quiet --eval 'db=db.getSiblingDB("loja"); db.getCollectionNames().sort().forEach(n => print(n, db[n].countDocuments()))'
    docker volume ls --format '{{.Name}}'

Resultado real (as importações responderam 3, 8, 10, 12 e 26 documentos importados, 0 falhados):

    categorias 3
    clientes 8
    encomendas 12
    linhas_encomenda 26
    produtos 10

Os volumes do projeto: `est-mg01_config` e `est-mg01_dados`, ambos nomeados. Não há volume anónimo porque o Compose também nomeia `/data/configdb`. O `--wait` só devolve o controlo depois de o healthcheck dar `Healthy`.

### Exercício 2

    db = db.getSiblingDB("exercicio")
    db.pedidos_teste.insertOne({ cliente: "Ana", total: Decimal128("19.90"),
      criado: new Date("2026-11-13T09:30:00Z"), itens: ["caneca", "livro"] })
    db.pedidos_teste.aggregate([{ $project: { _id: 0, t_id: { $type: "$_id" },
      total: { $type: "$total" }, criado: { $type: "$criado" }, itens: { $type: "$itens" } } }])
    db.pedidos_teste.find({ total: { $type: "decimal" } }, { _id: 0, cliente: 1 })
    db.pedidos_teste.findOne()._id.getTimestamp()

Resultado real:

    [ { t_id: 'objectId', total: 'decimal', criado: 'date', itens: 'array' } ]
    [ { cliente: 'Ana' } ]
    ISODate('2026-11-13T18:50:54.000Z')

O `$type` devolve o nome do tipo BSON; usado como filtro, seleciona por tipo. O `_id` foi gerado como ObjectId e o seu timestamp é o instante da inserção (o teu valor será outro).

### Exercício 3

    db = db.getSiblingDB("exercicio")
    db.cod.insertOne({ _id: "A1", n: 1 })
    try { db.cod.insertOne({ _id: "A1", n: 2 }) } catch (e) { print(e.code, e.message) }
    try { db.cod.updateOne({ _id: "A1" }, { $set: { _id: "B2" } }) } catch (e) { print(e.code, e.message) }
    try { db.cod.insertOne({ _id: [1, 2] }) } catch (e) { print(e.code, e.message) }
    db.cod.insertOne({ _id: { ano: 2026, seq: 1 }, n: 3 })
    db.cod.insertOne({ n: 4 })
    db.cod.find()

Resultado real:

    11000 E11000 duplicate key error collection: exercicio.cod index: _id_ dup key: { _id: "A1" }
    66 Plan executor error during update :: caused by :: Performing an update on the path '_id' would modify the immutable field '_id'
    53 The '_id' value cannot be of type array
    [ { _id: 'A1', n: 1 },
      { _id: { ano: 2026, seq: 1 }, n: 3 },
      { _id: ObjectId('6af75c0d129c5b70021256d4'), n: 4 } ]

O `_id` é único, imutável e não pode ser um array. Pode ser texto, documento ou ObjectId na mesma coleção, mas convém escolher um só tipo por coleção.

### Exercício 4

    docker compose -p est-mg01 exec mongo mongoimport --db loja --collection clientes --jsonArray --file /dados-loja/clientes.json
    docker compose -p est-mg01 exec mongo mongosh --quiet --eval 'db.getSiblingDB("loja").clientes.countDocuments()'
    docker compose -p est-mg01 exec mongo mongoimport --db loja --collection clientes --jsonArray --drop --file /dados-loja/clientes.json
    docker compose -p est-mg01 exec mongo mongosh --quiet --eval 'db.getSiblingDB("loja").produtos.updateOne({id:6},{$set:{stock:15}}).modifiedCount'
    docker compose -p est-mg01 down
    MONGO_PORT=31010 docker compose -p est-mg01 up -d --wait
    docker compose -p est-mg01 exec mongo mongosh --quiet --eval 'db.getSiblingDB("loja").produtos.findOne({id:6},{_id:0,nome:1,stock:1})'
    docker compose -p est-mg01 down -v
    MONGO_PORT=31010 docker compose -p est-mg01 up -d --wait
    docker compose -p est-mg01 exec mongo mongosh --quiet --eval 'db.getMongo().getDBNames()'
    docker compose -p est-mg01 down -v

Resultado real: depois da segunda importação, `16` clientes; com `--drop` (`dropping: loja.clientes`), `8`. Depois do `down` e `up`: `{ nome: 'Teclado Mecânico', stock: 15 }`. Depois do `down -v` e `up`: `[ 'admin', 'config', 'local' ]`.

Os ficheiros não têm `_id`, logo cada importação gera ObjectIds novos e duplica os documentos; o `--drop` apaga a coleção antes. O `down` mantém os volumes nomeados e por isso os dados sobrevivem; o `down -v` apaga-os. No fim, `docker ps -a`, `docker volume ls` e `docker network ls` não listaram nada com `est-mg01` (o `down -v` final removeu contentor, rede e os volumes `est-mg01_dados` e `est-mg01_config`).

## Módulo 02 · CRUD

### Exercício 5

    db.produtos.find({ categoria_id: 2, stock: { $gt: 0 } }, { _id: 0, nome: 1, preco: 1 }).sort({ preco: -1 })
    // { nome: 'Auscultadores Bluetooth', preco: 49.9 }, { nome: 'Carregador USB-C', preco: 14.9 }

    db.clientes.find({ cidade: { $in: ["Porto", "Faro"] }, email: { $ne: null } }, { _id: 0, id: 1, nome: 1, cidade: 1 }).sort({ id: 1 })
    // { id: 2, nome: 'Bruno Costa', cidade: 'Porto' }, { id: 6, nome: 'Filipe Lopes', cidade: 'Porto' },
    // { id: 7, nome: 'Graça Nunes', cidade: 'Faro' }

    db.encomendas.find({ estado: { $in: ["pendente", "enviada"] },
      data_encomenda: { $gte: ISODate("2025-04-01"), $lt: ISODate("2025-05-01") } }, { _id: 0, id: 1, estado: 1 }).sort({ id: 1 })
    // { id: 7, estado: 'enviada' }, { id: 8, estado: 'pendente' }, { id: 9, estado: 'pendente' }

    db.produtos.find({ $or: [{ stock: { $lt: 10 } }, { preco: { $gt: 80 } }] }, { _id: 0, nome: 1, preco: 1, stock: 1 }).sort({ id: 1 })
    // { nome: 'Teclado Mecânico', preco: 79, stock: 0 }, { nome: 'Conjunto de Panelas', preco: 89.9, stock: 8 }

    db.produtos.find({}, { _id: 0, nome: 1, preco: 1 }).sort({ preco: 1 }).limit(3)
    // Caneca de Cerâmica 6.5, Romance Policial 12.9, Carregador USB-C 14.9

    [db.clientes.countDocuments({ email: null }), db.encomendas.countDocuments({ estado: "cancelada" })]
    // [ 1, 1 ]

O `$gte` com `$lt` define um intervalo semiaberto, que apanha o mês inteiro sem depender da hora. O Teclado Mecânico aparece na alínea 4 por ter stock 0 (inferior a 10), embora custe menos de 80.

### Exercício 6

    // 1
    db.receitas.find({ tags: { $all: ["forno", "tradicional"] } }, { _id: 0, nome: 1 }).sort({ nome: 1 })
    // [ 'Bacalhau com Natas', 'Francesinha' ]

    // 2
    db.receitas.find({ "autor.pais": "PT", dificuldade: { $lte: 3 } }, { _id: 0, nome: 1 }).sort({ nome: 1 })
    // [ 'Bacalhau com Natas', 'Salada Mista' ]

    // 3
    db.receitas.find({ ingredientes: { $elemMatch: { item: "natas", g: { $gte: 100 } } } }, { _id: 0, nome: 1 })
    // [ 'Bacalhau com Natas' ]

    // 4
    db.receitas.find({ "ingredientes.item": "natas", "ingredientes.g": { $gte: 100 } }, { _id: 0, nome: 1 }).sort({ nome: 1 })
    // [ 'Bacalhau com Natas', 'Francesinha' ]

    // 5
    db.receitas.find({ tags: { $size: 2 } }, { _id: 0, nome: 1 }).sort({ nome: 1 })
    // [ 'Salada Mista', 'Tarte de Maçã' ]

    // 6
    db.receitas.find({ "autor.nome": "Rita" }, { _id: 0, nome: 1, "autor.nome": 1, tags: { $slice: 1 } }).sort({ nome: 1 })
    // { nome: 'Bacalhau com Natas', tags: [ 'peixe' ], autor: { nome: 'Rita' } }
    // { nome: 'Francesinha', tags: [ 'carne' ], autor: { nome: 'Rita' } }

    // 7
    db.receitas.find({ "ingredientes.1.item": "natas" }, { _id: 0, nome: 1 }).sort({ nome: 1 })
    // [ 'Bacalhau com Natas', 'Francesinha' ]

Na alínea 4 a Francesinha também aparece: tem natas (50 g) e, noutro elemento, o queijo com 120 g. As duas condições separadas podem ser cumpridas por elementos diferentes do array, o que o `$elemMatch` impede.

### Exercício 7

    // 1
    db.produtos.updateOne({ id: 6 }, { $inc: { stock: 50 } })
    // matchedCount 1, modifiedCount 1, upsertedCount 0; o Teclado Mecânico ficou com stock 50

    // 2
    db.clientes.updateOne({ id: 8 }, { $set: { email: "hugo.teixeira@exemplo.pt" } })
    // 1ª vez: matchedCount 1, modifiedCount 1, upsertedCount 0
    // 2ª vez: matchedCount 1, modifiedCount 0, upsertedCount 0

    // 3
    db.clientes.updateOne({ id: 9 }, { $set: { nome: "Inês Matos", cidade: "Faro" }, $setOnInsert: { email: null } }, { upsert: true })
    // 1ª vez: matchedCount 0, modifiedCount 0, upsertedCount 1
    // 2ª vez: matchedCount 1, modifiedCount 0, upsertedCount 0
    db.clientes.findOne({ id: 9 }, { _id: 0 })
    // { id: 9, cidade: 'Faro', email: null, nome: 'Inês Matos' }

    // 4
    db.receitas.updateOne({ nome: "Salada Mista" }, { $push: { tags: { $each: ["verão", "fresco"] } } })   // 1, 1, 0
    db.receitas.updateOne({ nome: "Salada Mista" }, { $pull: { tags: "rápido" } })                        // 1, 1, 0
    // tags finais: [ 'vegetariano', 'verão', 'fresco' ]

    // 5
    db.receitas.updateMany({ tags: "forno" }, { $addToSet: { tags: "quente" } })
    // matchedCount 3, modifiedCount 3, upsertedCount 0

    // 6
    db.receitas.updateMany({}, { $unset: { dificuldade: "" } })         // matchedCount 4, modifiedCount 4
    db.receitas.countDocuments({ dificuldade: { $exists: true } })      // 0

O `$setOnInsert` só entra na criação. Na segunda chamada do upsert o documento já existia e os valores eram iguais, por isso nada foi modificado. O `$addToSet` só altera os documentos onde a etiqueta ainda não existe (aqui os três eram novos para ela).

### Exercício 8

    // 1
    const reservar = qt => db.produtos.findOneAndUpdate(
      { id: 3, stock: { $gte: qt } }, { $inc: { stock: -qt } },
      { returnDocument: "after", projection: { _id: 0, nome: 1, stock: 1 } })
    reservar(4)   // { nome: 'Atlas Mundial', stock: 6 }
    reservar(7)   // null
    reservar(6)   // { nome: 'Atlas Mundial', stock: 0 }
    reservar(1)   // null

    // 2
    db.categorias.updateOne({ id: 1 }, { nome: "Livros e BD" })
    // MongoInvalidArgumentError: Update document requires atomic operators
    db.categorias.replaceOne({ id: 1 }, { id: 1, nome: "Livros e BD" })   // matchedCount 1, modifiedCount 1
    db.categorias.findOne({ id: 1 }, { nome: 1 })
    // { _id: ObjectId('6af75ca01ffe9ba6bd5d4478'), nome: 'Livros e BD' }

    // 3
    db.encomendas.countDocuments({ estado: "cancelada" })     // 1
    db.linhas_encomenda.countDocuments({ encomenda_id: 4 })   // 1
    db.linhas_encomenda.deleteMany({ encomenda_id: 4 })       // deletedCount: 1
    db.encomendas.deleteOne({ id: 4 })                        // deletedCount: 1
    [db.encomendas.countDocuments(), db.linhas_encomenda.countDocuments()]   // [ 11, 25 ]

    // 4
    db.receitas.deleteMany({})                     // deletedCount: 4
    db.receitas.countDocuments()                   // 0
    db.getCollectionNames().includes("receitas")   // true
    db.receitas.getIndexes().length                // 1 (o índice do _id)
    [db.produtos.countDocuments({ preco: "12.9" }), db.produtos.countDocuments({ preco: 12.9 })]   // [ 0, 1 ]

Com 4 unidades o stock passou de 10 para 6; as 7 pedidas excedem o stock, por isso o filtro não encontra nada e devolve `null`; as 6 esvaziam o stock; a última também falha. O filtro `stock: { $gte: qt }` faz parte do mesmo comando que o decremento, por isso a verificação e a alteração são atómicas. O `replaceOne` manteve o `_id` (o valor do `ObjectId` é o desta execução; no teu será outro). Num `deleteMany({})` a coleção e o índice do `_id` mantêm-se, e comparar o preço como texto não encontra nada, porque o tipo do valor conta.

## Módulo 03 · Modelação de dados

### Exercício 9

    db.ex09_produtos.drop()
    const cats = {}
    db.categorias.find().forEach(c => cats[c.id] = c.nome)
    db.ex09_produtos.insertMany(db.produtos.find({}, { _id: 0 }).sort({ id: 1 }).toArray().map(p => {
        const { categoria_id, ...resto } = p
        return { ...resto, categoria: { id: categoria_id, nome: cats[categoria_id] } }
    }))
    db.ex09_produtos.findOne({ id: 4 }, { _id: 0 })
    db.ex09_produtos.find({ "categoria.nome": "Eletrónica" }, { _id: 0, nome: 1 }).sort({ id: 1 })
    db.categorias.updateOne({ id: 3 }, { $set: { nome: "Casa e Cozinha" } }).modifiedCount
    db.ex09_produtos.updateMany({ "categoria.id": 3 }, { $set: { "categoria.nome": "Casa e Cozinha" } }).modifiedCount

Resultado real (MongoDB 8.3.17):

    { id: 4, nome: 'Auscultadores Bluetooth', preco: 49.9, stock: 30, categoria: { id: 2, nome: 'Eletrónica' } }
    Auscultadores Bluetooth, Carregador USB-C, Teclado Mecânico
    modelo plano, renomear 'Casa': modified=1
    modelo incorporado, renomear 'Casa': modified=4

Renomear a categoria altera 1 documento no modelo plano e 4 no incorporado. A incorporação compensa quando a categoria é lida com o produto em quase todas as consultas e quase nunca muda de nome.

### Exercício 10

    db.clientes.aggregate([
        { $lookup: { from: "encomendas_v2", localField: "id", foreignField: "cliente_id", as: "encs" } },
        { $project: { _id: 0, id: 1, nome: 1, n_encomendas: { $size: "$encs" } } },
        { $sort: { id: 1 } }
    ])

Resultado real:

    1 Ana Ribeiro: 3     2 Bruno Costa: 3     3 Carla Mendes: 2    4 Diogo Pires: 2
    5 Eva Martins: 1     6 Filipe Lopes: 1    7 Graça Nunes: 0     8 Hugo Teixeira: 0
    Ana Ribeiro: encomendas [ 1, 3, 8 ]
    Hugo Teixeira: encomendas []

Os clientes 7 e 8 (Graça Nunes e Hugo Teixeira) não têm encomendas e continuam no resultado, com um array vazio, porque o `$lookup` é um left outer join (a documentação descreve-o assim). SQL equivalente, escrito à mão e não executado:

    SELECT c.id, c.nome, COUNT(e.id) AS n_encomendas
    FROM clientes c LEFT JOIN encomendas e ON e.cliente_id = c.id
    GROUP BY c.id, c.nome ORDER BY c.id;

### Exercício 11

    const esquema = { bsonType: "object", required: ["_id", "cliente_id", "estado", "linhas"], properties: {
        cliente_id: { bsonType: "int" },
        estado: { enum: ["pendente", "enviada", "entregue", "cancelada"] },
        linhas: { bsonType: "array", minItems: 1, items: { bsonType: "object",
            required: ["produto_id", "quantidade", "preco_unitario"],
            properties: { produto_id: { bsonType: "int" }, quantidade: { bsonType: "int", minimum: 1 },
                          preco_unitario: { bsonType: "decimal" } } } } } }
    db.createCollection("ex11", { validator: { $jsonSchema: esquema } })
    // cada insertOne dentro de um try/catch; o detalhe lê-se em e.errInfo.details.schemaRulesNotSatisfied[0]
    // com NumberInt(...) nos inteiros e Decimal128("12.90") no preço
    db.encomendas_v2.countDocuments({ $nor: [{ $jsonSchema: esquema }] })

Resultado real:

    válida: aceite
    estado inválido: erro 121
       campo estado: enum (value was not found in enum)
    sem linhas: erro 121
       campo linhas: minItems (array did not match specified length)
    linha com quantidade 0 e preço double: erro 121
       campo linhas: items (At least one item did not match the sub-schema)
    sem cliente: erro 121
       required: cliente_id
    inválidas: 12 de 12

As 12 encomendas de `encomendas_v2` falham porque o `preco_unitario` está em double e o esquema exige decimal. Para migrar, converte os preços (exercício 12) ou usa `validationAction: "warn"` até estarem corrigidos.

### Exercício 12

    db.ex12.insertMany(db.encomendas_v2.find().toArray())
    db.ex12.updateMany({}, [
        { $set: { linhas: { $map: { input: "$linhas", as: "l", in: { $mergeObjects: ["$$l",
            { preco_unitario: { $toDecimal: { $toString: "$$l.preco_unitario" } } }] } } } } },
        { $set: { total: { $sum: { $map: { input: "$linhas", as: "l",
            in: { $multiply: ["$$l.quantidade", "$$l.preco_unitario"] } } } } } }
    ])
    db.ex12.aggregate([{ $sort: { _id: 1 } }, { $project: { d: { $multiply: ["$total", Decimal128("0.90")] },
        f: { $multiply: [{ $toDouble: "$total" }, 0.9] } } }])

Resultado real:

    { linhas: [ { produto_id: 1, nome: 'Romance Policial', quantidade: 2, preco_unitario: Decimal128('12.9') },
                { produto_id: 5, nome: 'Carregador USB-C', quantidade: 1, preco_unitario: Decimal128('14.9') } ],
      total: Decimal128('40.7') }
    tipos: {"t":"decimal","p":"decimal"}
    total entregue (Decimal128): 342.5
    total entregue (double, soma no cliente): 342.5
    encomenda 3: decimal 40.050 | double 40.050000000000004
    encomenda 4: decimal 80.910 | double 80.91000000000001
    encomenda 6: decimal 78.2010 | double 78.20100000000001
    encomenda 11: decimal 143.010 | double 143.01000000000002

Os totais simples coincidem (342.5 nos dois casos), mas ao multiplicar por 0.9 o double traz ruído e o decimal dá o valor exato, com os zeros finais do Decimal128 (`40.050`). Para mostrar dinheiro, arredonda com `$round` a 2 casas.

## Módulo 04 · Aggregation

### Exercício 13

    db.produtos.aggregate([
        { $group: { _id: "$categoria_id", produtos: { $sum: 1 }, preco_medio: { $avg: "$preco" },
                    valor_stock: { $sum: { $multiply: ["$preco", "$stock"] } } } },
        { $lookup: { from: "categorias", localField: "_id", foreignField: "id", as: "cat" } },
        { $project: { _id: 0, categoria: { $arrayElemAt: ["$cat.nome", 0] }, produtos: 1,
                      preco_medio: { $round: ["$preco_medio", 2] }, valor_stock: { $round: ["$valor_stock", 2] } } },
        { $sort: { valor_stock: -1 } }
    ])

Resultado real (MongoDB 8.3.17):

    { produtos: 4, categoria: 'Casa', preco_medio: 38.23, valor_stock: 3039.2 }
    { produtos: 3, categoria: 'Eletrónica', preco_medio: 47.93, valor_stock: 2987 }
    { produtos: 3, categoria: 'Livros', preco_medio: 20.46, valor_stock: 1278.4 }

O `$group` reduz 10 produtos a 3 grupos, por isso o `$lookup` corre 3 vezes em vez de 10. Juntar depois de agrupar é mais barato.

### Exercício 14

    db.encomendas.aggregate([
        { $match: { estado: { $ne: "cancelada" } } },
        { $lookup: { from: "linhas_encomenda", localField: "id", foreignField: "encomenda_id", as: "l" } },
        { $unwind: "$l" },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$data_encomenda" } },
                    encomendas: { $addToSet: "$id" },
                    receita: { $sum: { $multiply: ["$l.quantidade", "$l.preco_unitario"] } } } },
        { $project: { _id: 0, mes: "$_id", encomendas: { $size: "$encomendas" }, receita: { $round: ["$receita", 2] } } },
        { $sort: { mes: 1 } }
    ])

Resultado real:

    { mes: '2025-01', encomendas: 2, receita: 105.5 }
    { mes: '2025-02', encomendas: 1, receita: 44.5 }
    { mes: '2025-03', encomendas: 2, receita: 195.69 }
    { mes: '2025-04', encomendas: 3, receita: 182.3 }
    { mes: '2025-05', encomendas: 2, receita: 242.6 }
    { mes: '2025-06', encomendas: 1, receita: 145 }

Depois do `$unwind` há um documento por linha de encomenda, por isso `$sum: 1` contaria linhas e não encomendas; o `$addToSet` do `id` conta as encomendas distintas. Fevereiro tem 1 porque a encomenda 4 está cancelada.

### Exercício 15

    db.linhas_encomenda.aggregate([
        { $lookup: { from: "encomendas", localField: "encomenda_id", foreignField: "id", as: "e" } },
        { $unwind: "$e" },
        { $match: { "e.estado": { $ne: "cancelada" } } },
        { $group: { _id: "$produto_id", unidades: { $sum: "$quantidade" },
                    receita: { $sum: { $multiply: ["$quantidade", "$preco_unitario"] } } } },
        { $sort: { unidades: -1, _id: 1 } }, { $limit: 3 },
        { $lookup: { from: "produtos", localField: "_id", foreignField: "id", as: "p" } },
        { $project: { _id: 0, produto: { $arrayElemAt: ["$p.nome", 0] }, unidades: 1, receita: { $round: ["$receita", 2] } } }
    ])

Resultado real:

    { unidades: 15, produto: 'Caneca de Cerâmica', receita: 97.5 }
    { unidades: 7, produto: 'Romance Policial', receita: 90.3 }
    { unidades: 7, produto: 'Carregador USB-C', receita: 104.3 }

Romance Policial (id 1) e Carregador USB-C (id 5) empatam nas 7 unidades e o desempate por id decide. Fazer o segundo `$lookup` depois do `$limit` junta o nome a 3 documentos em vez de a todos os produtos.

### Exercício 16

    db.produtos.aggregate([{ $facet: {
        escaloes: [ { $bucket: { groupBy: "$preco", boundaries: [0, 15, 30, 60], default: "60 ou mais",
                                 output: { n: { $sum: 1 }, nomes: { $push: "$nome" } } } } ],
        a_repor: [ { $match: { stock: { $lt: 20 } } }, { $project: { _id: 0, nome: 1, stock: 1 } } ],
        resumo: [ { $group: { _id: null, produtos: { $sum: 1 }, valor_stock: { $sum: { $multiply: ["$preco", "$stock"] } } } },
                  { $project: { _id: 0, produtos: 1, valor_stock: { $round: ["$valor_stock", 2] } } } ]
    } }])

Resultado real (um único documento):

    escaloes: [ { _id: 0, n: 3, nomes: ['Caneca de Cerâmica','Carregador USB-C','Romance Policial'] },
                { _id: 15, n: 3, nomes: ['Atlas Mundial','Candeeiro de Mesa','Livro de Receitas'] },
                { _id: 30, n: 2, nomes: ['Auscultadores Bluetooth','Manta de Sofá'] },
                { _id: '60 ou mais', n: 2, nomes: ['Conjunto de Panelas','Teclado Mecânico'] } ]
    a_repor: [ { nome: 'Conjunto de Panelas', stock: 8 }, { nome: 'Teclado Mecânico', stock: 0 },
               { nome: 'Atlas Mundial', stock: 10 }, { nome: 'Candeeiro de Mesa', stock: 15 } ]
    resumo: [ { produtos: 10, valor_stock: 7304.6 } ]

Os três sub-pipelines leem os mesmos 10 produtos numa só passagem. Sem `default`, um preço fora dos limites faz o `$bucket` falhar (executado na aula: erro 7158303, cuja mensagem refere `$switch`).

## Módulo 05 · Índices e desempenho

### Exercício 17

    load("plano.js")
    const e = db.getSiblingDB("m05").encomendas
    e.dropIndexes()
    const q = () => e.find({ estado: "enviada", cidade: "Porto" })
    plano("antes", q())
    e.createIndex({ estado: 1, cidade: 1 })
    plano("depois", q())
    plano("só cidade", e.find({ cidade: "Porto" }))
    e.createIndex({ cidade: 1, estado: 1 })
    plano("só cidade, com {cidade, estado}", e.find({ cidade: "Porto" }))

Resultado real:

    antes
        COLLSCAN  índice=null  nReturned=1169  keys=0  docs=100000  ms=25
    depois
        FETCH > IXSCAN  índice=estado_1_cidade_1  nReturned=1169  keys=1169  docs=1169  ms=1
    só cidade
        COLLSCAN  índice=null  nReturned=12463  keys=0  docs=100000  ms=34
    só cidade, com {cidade, estado}
        FETCH > IXSCAN  índice=cidade_1_estado_1  nReturned=12463  keys=12463  docs=12463  ms=9

O índice `{ estado, cidade }` passou os documentos examinados de 100 000 para 1 169, os mesmos que a consulta devolve. Como `cidade` não é o prefixo, esse índice não serve a consulta só por cidade (volta o COLLSCAN); para isso foi preciso um índice com `cidade` à frente.

### Exercício 18

    const e = db.getSiblingDB("m05").encomendas
    e.dropIndexes()
    const q = () => e.find({ estado: "paga", total: { $gte: 100, $lte: 200 } }).sort({ data_encomenda: -1 }).limit(10)
    const qs = () => e.find({ estado: "paga", total: { $gte: 100, $lte: 110 } }).sort({ data_encomenda: -1 })
    e.createIndex({ estado: 1, total: 1, data_encomenda: -1 }, { name: "ERS" })
    e.createIndex({ estado: 1, data_encomenda: -1, total: 1 }, { name: "ESR" })
    plano("limit 10, ERS", q().hint("ERS"))
    plano("limit 10, ESR", q().hint("ESR"))
    plano("limit 10, planeador", q())
    plano("intervalo estreito sem limit, ERS", qs().hint("ERS"))
    plano("intervalo estreito sem limit, ESR", qs().hint("ESR"))
    plano("intervalo estreito, planeador", qs())

Resultado real:

    limit 10, ERS
        FETCH > SORT > IXSCAN  índice=ERS  nReturned=10  keys=1812  docs=10  ms=1
    limit 10, ESR
        LIMIT > FETCH > IXSCAN  índice=ESR  nReturned=10  keys=45  docs=10  ms=0
    limit 10, planeador
        LIMIT > FETCH > IXSCAN  índice=ESR  nReturned=10  keys=45  docs=10  ms=0
    intervalo estreito sem limit, ERS
        FETCH > SORT > IXSCAN  índice=ERS  nReturned=193  keys=193  docs=193  ms=0
    intervalo estreito sem limit, ESR
        FETCH > IXSCAN  índice=ESR  nReturned=193  keys=9103  docs=193  ms=8
    intervalo estreito, planeador
        FETCH > SORT > IXSCAN  índice=ERS  nReturned=193  keys=193  docs=193  ms=0

Não ganha sempre. Com `limit 10`, o ESR devolve as 10 primeiras já ordenadas e pára ao fim de 45 chaves, enquanto o outro lê 1 812 e ordena. Com um intervalo estreito e sem `limit`, o ESR percorre 9 103 chaves para devolver 193, e o índice com o intervalo antes da ordenação (193 chaves e uma fase SORT) é melhor; o planeador escolheu-o. Confirma sempre com `explain`.

### Exercício 19

    load("plano.js")
    const bd = db.getSiblingDB("m05")
    const e = bd.encomendas, p = bd.produtos
    e.dropIndexes()
    e.createIndex({ cliente_id: 1, data_encomenda: -1 }, { name: "cli_data_todos" })
    e.createIndex({ cliente_id: 1, data_encomenda: -1 }, { name: "cli_data_canceladas", partialFilterExpression: { estado: "cancelada" } })
    const t = e.stats().indexSizes
    print("completo: " + (t.cli_data_todos / 1024).toFixed(0) + " KiB; parcial: " + (t.cli_data_canceladas / 1024).toFixed(0) + " KiB")
    plano("canceladas do cliente 5047, parcial", e.find({ cliente_id: 5047, estado: "cancelada" }).hint("cli_data_canceladas"))
    plano("canceladas do cliente 5047, completo", e.find({ cliente_id: 5047, estado: "cancelada" }).hint("cli_data_todos"))
    plano("todas do cliente 5047 (planeador)", e.find({ cliente_id: 5047 }))
    p.createIndex({ sku: 1 }, { unique: true })
    p.insertOne({ sku: "SKU-000001", nome: "repetido" })

Resultado real:

    completo: 1340 KiB; parcial: 172 KiB
    canceladas do cliente 5047, parcial
        FETCH > IXSCAN  índice=cli_data_canceladas  nReturned=1  keys=1  docs=1  ms=0
    canceladas do cliente 5047, completo
        FETCH > IXSCAN  índice=cli_data_todos  nReturned=1  keys=7  docs=7  ms=0
    todas do cliente 5047 (planeador)
        FETCH > IXSCAN  índice=cli_data_todos  nReturned=7  keys=7  docs=7  ms=0
    código 11000: E11000 duplicate key error collection: m05.produtos index: sku_1 dup key: { sku: "SKU-000001" }

O índice parcial é cerca de 8 vezes mais pequeno e, para as canceladas, examina 1 documento em vez de 7. Para «todas as encomendas do cliente», o planeador usa o completo, porque o parcial não contém as outras. O índice único recusa o `sku` repetido com o erro 11000.

### Exercício 20

    load("plano.js")
    const bd = db.getSiblingDB("m05")
    const c = bd.clientes
    c.dropIndexes(); c.createIndex({ email: 1 }, { unique: true })
    bd.setProfilingLevel(2)
    c.find({ nome: /23$/ }).toArray()
    c.find({ email: "cliente42@exemplo.pt" }).toArray()
    c.find({ cidade: "Faro" }, { nome: 1 }).limit(3).toArray()
    bd.setProfilingLevel(0)
    bd.system.profile.find({ ns: "m05.clientes", op: "query" },
        { _id: 0, planSummary: 1, docsExamined: 1, nreturned: 1, millis: 1 }).sort({ ts: 1 })
    c.createIndex({ nome: 1 })
    plano("regex ancorada /^Cliente 12/", c.find({ nome: /^Cliente 12/ }))
    plano("regex sem âncora /12/", c.find({ nome: /12/ }))
    plano("coberta {_id:0, nome:1}", c.find({ nome: /^Cliente 12/ }, { _id: 0, nome: 1 }))
    c.createIndex({ cidade: 1, nome: 1 })
    plano("cidade Faro, nome, coberta", c.find({ cidade: "Faro" }, { _id: 0, cidade: 1, nome: 1 }))

Resultado real:

    { docsExamined: 10023, nreturned: 101, millis: 3, planSummary: 'COLLSCAN' }
    { docsExamined: 1, nreturned: 1, millis: 0, planSummary: 'EXPRESS_IXSCAN { email: 1 }' }
    { docsExamined: 54, nreturned: 3, millis: 0, planSummary: 'COLLSCAN' }
    regex ancorada /^Cliente 12/
        FETCH > IXSCAN  índice=nome_1  nReturned=1111  keys=1112  docs=1111  ms=0
    regex sem âncora /12/
        FETCH > IXSCAN  índice=nome_1  nReturned=1578  keys=20000  docs=1578  ms=7
    coberta {_id:0, nome:1}
        PROJECTION_COVERED > IXSCAN  índice=nome_1  nReturned=1111  keys=1112  docs=0  ms=1
    cidade Faro, nome, coberta
        PROJECTION_COVERED > IXSCAN  índice=cidade_1_nome_1  nReturned=2525  keys=2525  docs=0  ms=1

A primeira e a terceira consulta fizeram COLLSCAN (a regex e a procura por cidade). O perfilador regista o primeiro lote (101 documentos), por isso `docsExamined` é inferior ao total da coleção. A regex ancorada lê 1 112 chaves e a sem âncora lê as 20 000. Com a projeção só de `nome` (sem `_id`) e depois de `cidade` e `nome` com o índice composto, `docs=0`: a consulta é coberta.

## Módulo 06 · Drivers e transações

### Exercício 21

    from pymongo import MongoClient

    with MongoClient("mongodb://localhost:27117", serverSelectionTimeoutMS=3000) as client:
        ex = client["m06"]["ex21"]
        ex.drop()
        r = ex.insert_one({"id": 1, "nome": "Mouse Óptico", "preco": 9.9, "stock": 7})
        print("inserido:", r.acknowledged)
        ex.insert_many([{"id": 2, "nome": "Tapete de Rato", "preco": 4.5, "stock": 0},
                        {"id": 3, "nome": "Hub USB", "preco": 19.0, "stock": 12}])
        print("em stock:", [d["nome"] for d in ex.find({"stock": {"$gt": 0}}, {"_id": 0, "nome": 1}).sort("nome", 1)])
        r = ex.update_one({"id": 2}, {"$set": {"stock": 30}})
        print("update:", r.matched_count, r.modified_count)
        r = ex.update_many({}, {"$mul": {"preco": 2}})
        print("update_many:", r.matched_count, r.modified_count)
        print("depois:", [(d["id"], d["preco"]) for d in ex.find({}, {"_id": 0, "id": 1, "preco": 1}).sort("id", 1)])
        print("apagados:", ex.delete_many({"stock": {"$lt": 10}}).deleted_count)
        print("restam:", ex.count_documents({}))
        ex.drop()

Resultado real:

    inserido: True
    em stock: ['Hub USB', 'Mouse Óptico']
    update: 1 1
    update_many: 3 3
    depois: [(1, 19.8), (2, 9.0), (3, 38.0)]
    apagados: 1
    restam: 2

`insert_one` e `insert_many` devolvem objetos com os ids; `update_many` com filtro vazio apanha todos os documentos; `delete_many` devolve `deleted_count`. O Tapete de Rato (stock 30 depois do update, preço 9.0) sobrevive; só o Mouse Óptico (stock 7) é apagado.

### Exercício 22

    from datetime import datetime, timezone
    from bson import ObjectId
    from pymongo import MongoClient
    from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError

    def ligar(uri):
        client = MongoClient(uri, serverSelectionTimeoutMS=1000)
        try:
            client.admin.command("ping")
        except ServerSelectionTimeoutError:
            print("Sem ligação ao servidor em", uri)
            return None
        return client

    print(ligar("mongodb://localhost:31069") is None)
    client = ligar("mongodb://localhost:27117")
    tickets = client["m06"]["tickets"]
    tickets.drop()
    tickets.create_index("codigo", unique=True)

    def abrir(codigo, quando):
        try:
            return tickets.insert_one({"codigo": codigo, "aberto_em": quando}).inserted_id
        except DuplicateKeyError:
            print("já existe um ticket", codigo)

    a = abrir("T-1", datetime(2026, 11, 2, 10, 0, tzinfo=timezone.utc))
    abrir("T-1", datetime(2026, 11, 2, 11, 0, tzinfo=timezone.utc))
    abrir("T-2", datetime(2026, 11, 20, 9, 0, tzinfo=timezone.utc))
    abrir("T-3", datetime(2026, 12, 3, 9, 0, tzinfo=timezone.utc))

    desde = datetime(2026, 11, 1, tzinfo=timezone.utc)
    ate = datetime(2026, 12, 1, tzinfo=timezone.utc)
    print("novembro:", [t["codigo"] for t in tickets.find({"aberto_em": {"$gte": desde, "$lt": ate}}).sort("aberto_em", 1)])

    texto = str(a)                     # o que chegaria, por exemplo, num URL
    print("sem converter:", tickets.find_one({"_id": texto}))
    print("convertido   :", tickets.find_one({"_id": ObjectId(texto)})["codigo"])
    print("criado em    :", ObjectId(texto).generation_time.isoformat())
    tickets.drop()
    client.close()

Resultado real:

    Sem ligação ao servidor em mongodb://localhost:31069
    True
    já existe um ticket T-1
    novembro: ['T-1', 'T-2']
    sem converter: None
    convertido   : T-1
    criado em    : 2026-11-13T10:09:21+00:00

O `ServerSelectionTimeoutError` só aparece no `ping`, por isso é aí que o apanhas. O `$lt` no limite superior exclui o ticket de 3 de dezembro. Procurar pelo texto devolve `None` porque `_id` é um ObjectId; com `ObjectId(texto)` encontra.

### Exercício 23

    from pymongo import MongoClient, UpdateOne
    from pymongo.errors import BulkWriteError

    client = MongoClient("mongodb://localhost:27117", serverSelectionTimeoutMS=3000)
    p = client["m06"]["produtos"]
    ops = [UpdateOne({"id": d["id"]}, {"$set": {"preco": round(d["preco"] * 1.10, 2)}})
           for d in p.find({"categoria_id": 2})]
    antes = {d["id"]: d["preco"] for d in p.find({"categoria_id": 2})}
    r = p.bulk_write(ops)
    print("encontrados:", r.matched_count, "| modificados:", r.modified_count)
    for d in p.find({"categoria_id": 2}).sort("id", 1):
        print(d["id"], antes[d["id"]], "->", d["preco"])
    # repor
    p.bulk_write([UpdateOne({"id": i}, {"$set": {"preco": v}}) for i, v in antes.items()])

    print("-- paginação por _id, 3 por página")
    ultimo, pagina = None, 1
    while True:
        filtro = {} if ultimo is None else {"_id": {"$gt": ultimo}}
        docs = list(p.find(filtro, {"nome": 1}).sort("_id", 1).limit(3))
        if not docs:
            break
        print("página", pagina, [d["nome"] for d in docs])
        ultimo, pagina = docs[-1]["_id"], pagina + 1
    client.close()

Resultado real:

    encontrados: 3 | modificados: 3
    4 49.9 -> 54.89
    5 14.9 -> 16.39
    6 79.0 -> 86.9
    -- paginação por _id, 3 por página
    página 1 ['Romance Policial', 'Livro de Receitas', 'Atlas Mundial']
    página 2 ['Auscultadores Bluetooth', 'Carregador USB-C', 'Teclado Mecânico']
    página 3 ['Candeeiro de Mesa', 'Conjunto de Panelas', 'Manta de Sofá']
    página 4 ['Caneca de Cerâmica']

O `bulk_write` fez 3 atualizações num só pedido (os preços foram repostos no fim). Na paginação, cada página continua depois do `_id` do último documento da anterior e pára quando a lista vem vazia: 10 produtos dão páginas de 3, 3, 3 e 1.

### Exercício 24

    from datetime import datetime, timezone
    from pymongo import MongoClient

    client = MongoClient("mongodb://localhost:31060/?replicaSet=rs0", serverSelectionTimeoutMS=5000)
    db = client["m06"]
    db.encomendas.drop(); db.linhas_encomenda.drop()
    db.produtos.update_one({"id": 4}, {"$set": {"stock": 30}})
    db.encomendas.insert_one({"id": 200, "cliente_id": 3, "estado": "pendente",
                              "data_encomenda": datetime.now(timezone.utc)})
    db.linhas_encomenda.insert_many([
        {"id": 2001, "encomenda_id": 200, "produto_id": 4, "quantidade": 2},
        {"id": 2002, "encomenda_id": 200, "produto_id": 5, "quantidade": 3}])
    db.produtos.update_one({"id": 4}, {"$inc": {"stock": -2}})
    db.produtos.update_one({"id": 5}, {"$inc": {"stock": -3}})

    def stocks():
        return [db.produtos.find_one({"id": i})["stock"] for i in (4, 5)]

    def cancelar(sess, numero, falhar=False):
        r = db.encomendas.update_one({"id": numero, "estado": "pendente"},
                                     {"$set": {"estado": "cancelada"}}, session=sess)
        if r.matched_count == 0:
            raise ValueError("encomenda inexistente ou já tratada")
        for linha in db.linhas_encomenda.find({"encomenda_id": numero}, session=sess):
            db.produtos.update_one({"id": linha["produto_id"]},
                                   {"$inc": {"stock": linha["quantidade"]}}, session=sess)
            if falhar:
                raise RuntimeError("falha simulada a meio")

    print("stock inicial (4 e 5):", stocks())
    try:
        with client.start_session() as s:
            s.with_transaction(lambda sess: cancelar(sess, 200, falhar=True))
    except RuntimeError as e:
        print("erro:", e)
    print("após rollback:", stocks(), "| estado:", db.encomendas.find_one({"id": 200})["estado"])
    with client.start_session() as s:
        s.with_transaction(lambda sess: cancelar(sess, 200))
    print("após commit  :", stocks(), "| estado:", db.encomendas.find_one({"id": 200})["estado"])
    try:
        with client.start_session() as s:
            s.with_transaction(lambda sess: cancelar(sess, 200))
    except ValueError as e:
        print("segunda tentativa:", e)
    db.encomendas.drop(); db.linhas_encomenda.drop()
    client.close()

Resultado real:

    stock inicial (4 e 5): [28, 97]
    erro: falha simulada a meio
    após rollback: [28, 97] | estado: pendente
    após commit  : [30, 100] | estado: cancelada
    segunda tentativa: encomenda inexistente ou já tratada

Com o rollback, nem o estado da encomenda nem o stock mudam, apesar de a primeira linha já ter reposto stock dentro da transação. No commit os dois ficam coerentes. O filtro `estado: pendente` torna a operação segura contra cancelamentos duplicados. Corre contra o replica set (porta 31060).

## Módulo 07 · Operação e segurança

### Exercício 25

    export MONGO_ROOT_PASSWORD='...' MONGO_LEITOR_PASSWORD='...' MONGO_APP_PASSWORD='...'
    docker compose -p est-mg07 -f compose-auth.yml up -d
    A='mongodb://admin:PALAVRA@localhost:27017/?authSource=admin'
    docker exec est-mg07-auth mongosh --quiet "$A" --eval '
      const l = db.getSiblingDB("loja");
      l.createUser({user: "analista", pwd: "...", roles: [{role: "read", db: "loja"}]});
      l.createUser({user: "temp", pwd: "...", roles: [{role: "readWrite", db: "loja"}]});
      l.revokeRolesFromUser("temp", [{role: "readWrite", db: "loja"}]);
      l.grantRolesToUser("temp", [{role: "read", db: "loja"}]);
      printjson(l.getUser("temp").roles); l.dropUser("temp");
      print(l.getUsers().users.map(u => u.user).join(","))'
    # [ { role: 'read', db: 'loja' } ]
    # analista,app_loja,leitor_loja

    docker exec est-mg07-auth mongosh --quiet "mongodb://analista:...@localhost:27017/loja?authSource=loja" --eval '
      print(db.produtos.find({}, {_id: 0, nome: 1}).toArray().map(p => p.nome).join(" | "));
      try { db.produtos.deleteMany({}) } catch (e) { print(e.codeName) }'
    # Romance Policial | Livro de Receitas
    # Unauthorized

O papel `read` na base `loja` dá leitura e mais nada. O utilizador existe na base `loja`, por isso o `authSource` é `loja` (executei também só com `/loja` no caminho, sem `authSource`, e funcionou).

### Exercício 26

    docker exec est-mg07-auth mongosh --quiet "$A" /exemplos/03_utilizador_backup.js
    U='mongodb://copias:PALAVRA@localhost:27017/?authSource=admin'
    docker exec est-mg07-auth mongodump --uri="$U" --db=loja --gzip --archive=/copias/ex26.gz
    # done dumping `loja.produtos` (2 documents)
    docker exec est-mg07-auth mongorestore --uri="$U" --gzip --archive=/copias/ex26.gz --nsFrom='loja.*' --nsTo='loja_copia.*'
    # 2 document(s) restored successfully. 0 document(s) failed to restore.

    // no mongosh, como admin
    for (const d of ["loja", "loja_copia"]) print(d, db.getSiblingDB(d).produtos.countDocuments())
    // loja 2
    // loja_copia 2
    db.getSiblingDB("loja_copia").produtos.updateOne({id: 1}, {$set: {preco: 99}})
    // preço no original e na cópia: [ 12.9, 99 ]

O `--nsFrom` e o `--nsTo` mudam o espaço de nomes no restore, por isso o original fica intacto. O utilizador de cópias consegue ler `loja` (executei um `find` com ele e devolveu os 2 documentos): o papel `backup` inclui leitura dos dados, porque o mongodump tem de os ler. Guarda estas credenciais com o mesmo cuidado que as de um leitor.

### Exercício 27

    export KEYFILE_PATH="$HOME/segredos/est-mg07.key"; openssl rand -base64 756 > "$KEYFILE_PATH"
    export MONGO_ROOT_PASSWORD='...'
    docker compose -p est-mg07 -f compose-replset-auth.yml up -d       # esperar cerca de 25 s
    # mongo1 PRIMARY, mongo2 SECONDARY, mongo3 SECONDARY

    docker stop est-mg07-mongo2
    # connection string com os 3 membros e replicaSet=rs0
    db.getSiblingDB("loja").ex27.insertOne({a: 1}, {writeConcern: {w: "majority", wtimeout: 5000}}).acknowledged   // true

    docker stop est-mg07-mongo3
    # ligação direta ao mongo1 (directConnection=true), dentro do contentor:
    # mongo1:27017 SECONDARY / mongo2 e mongo3: (not reachable/healthy)
    db.hello().isWritablePrimary                                  // false
    db.getSiblingDB("loja").ex27.insertOne({a: 2})                // NotWritablePrimary
    db.getMongo().setReadPref("secondaryPreferred")
    db.getSiblingDB("loja").ex27.countDocuments()                 // 1  (a leitura continua a funcionar)

    docker start est-mg07-mongo2 est-mg07-mongo3                  # esperar cerca de 20 s
    # mongo1 PRIMARY, mongo2 SECONDARY, mongo3 SECONDARY
    insertOne({a: 3}, {writeConcern: {w: "majority"}}).acknowledged   // true ; countDocuments() = 2

Com 3 votos a maioria é 2. Com um nó parado, os outros dois fazem maioria e há primário. Com dois parados, o nó restante só tem 1 voto: desce para secundário (para não haver dois primários em partições diferentes), recusa escritas e continua a servir leituras, possivelmente desatualizadas.

### Exercício 28

    docker exec est-mg07-auth mongosh --quiet "$A" --eval '
      const l = db.getSiblingDB("loja");
      l.encomendas.insertMany(Array.from({length: 20000}, (_, i) =>
        ({id: i, cliente_id: i % 50, estado: i % 7 == 0 ? "pendente" : "paga", total: i % 100})));
      l.setProfilingLevel(1, {slowms: 0});
      l.encomendas.find({cliente_id: 7}).toArray();
      l.encomendas.createIndex({cliente_id: 1});
      l.encomendas.find({cliente_id: 7}).toArray();
      l.setProfilingLevel(0);
      l.system.profile.find({ns: "loja.encomendas", op: "query"},
        {_id: 0, planSummary: 1, keysExamined: 1, docsExamined: 1, nreturned: 1, millis: 1}).sort({ts: 1}).forEach(printjson)'
    # { keysExamined: 0,   docsExamined: 5008, nreturned: 101, millis: 1, planSummary: 'COLLSCAN' }
    # { keysExamined: 101, docsExamined: 101,  nreturned: 101, millis: 0, planSummary: 'IXSCAN { cliente_id: 1 }' }

    db.currentOp({active: true}).inprog.filter(o => o.ns && o.ns.startsWith("loja")).length   // 0

O 101 é o primeiro lote do cursor (o profiler regista cada lote), por isso a primeira entrada mostra um COLLSCAN que leu 5008 documentos para devolver 101, e a segunda um IXSCAN que leu só 101 chaves e 101 documentos. O profiler regista cada operação e deve ficar desligado fora do diagnóstico.

## Projeto final · Exercício 29

O projeto é aberto, por isso não há uma solução única. Usa a grelha do módulo 08 (9 critérios, de 0 a 3, máximo 27) e esta tabela para avaliares cada parte.

| Parte | Está bom quando... | Sinal de alerta |
|---|---|---|
| Ambiente | Replica set de 3 nós com autenticação, volumes nomeados e segredos fora do repositório | Credenciais no compose ou sem autenticação |
| Modelo | Decisões de incorporar e referenciar justificadas, com snapshot do preço | Modelo copiado do relacional sem justificação |
| Validação | $jsonSchema em pelo menos duas coleções, com erros testados | Sem validação |
| Transações | Criar e cancelar encomenda atómicos, com teste de falha | Atualizações soltas do stock |
| Relatórios | Cinco pipelines confirmados à mão | Resultados nunca conferidos |
| Índices | Cada um justificado com explain, e os inúteis removidos | Índices a mais ou sem medição |
| Operação | Cópia restaurada noutra base e eleição demonstrada | Cópia nunca restaurada |

**DICA:** pede a um colega que arranque o projeto só com o README. Se não conseguir, falta documentação.
