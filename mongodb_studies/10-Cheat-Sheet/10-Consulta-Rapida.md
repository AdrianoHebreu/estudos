# 10 Consulta rápida

Uma página para consultar no dia a dia. Os comandos foram executados no curso contra o MongoDB 8.3.17 com o mongosh 2.14.2. Para o detalhe, vê o módulo indicado.

## Ambiente (módulo 01)

| Tarefa | Comando |
|---|---|
| Arrancar e parar o Compose | docker compose -p nome up -d e docker compose -p nome down |
| Parar e apagar os dados | docker compose -p nome down -v (apaga o volume) |
| Abrir o mongosh no contentor | docker exec -it contentor mongosh |
| Importar JSON | mongoimport --db base --collection coleção --jsonArray --file ficheiro.json |
| Reimportar sem duplicar | acrescenta --drop (sem ele os documentos duplicam) |

**ATENÇÃO:** usa sempre volumes nomeados. Um volume anónimo fica órfão quando o contentor é removido.

## Tipos BSON e _id (módulo 01)

| Tipo | Nota |
|---|---|
| ObjectId | 12 bytes: data, valor aleatório e contador |
| Date | Inteiro de 64 bits em milissegundos |
| Decimal128 | Para dinheiro, sem o ruído do double |
| _id | Único, imutável e não pode ser um array |

## CRUD (módulo 02)

| Operação | Exemplo |
|---|---|
| Inserir | db.produtos.insertOne({ nome: "Caneca" }) |
| Procurar | db.produtos.find({ preco: { $gt: 10 } }, { nome: 1, _id: 0 }) |
| Ordenar e limitar | .sort({ preco: -1 }).limit(3) |
| Atualizar | db.produtos.updateOne({ id: 1 }, { $set: { stock: 5 } }) |
| Incrementar | { $inc: { stock: -1 } } |
| Upsert | updateOne(filtro, alteração, { upsert: true }) |
| Apagar | db.produtos.deleteOne({ id: 1 }) |

| Operadores de consulta | Significado |
|---|---|
| $eq, $ne, $gt, $gte, $lt, $lte | Comparação |
| $in e $nin | Pertence ou não a uma lista |
| $and, $or, $not | Lógicos |
| $exists e $type | Existência e tipo do campo |
| $regex | Expressão regular |
| $all, $size, $elemMatch | Arrays |

**ATENÇÃO:** um update sem operador substitui ou falha, e um filtro vazio em deleteMany apaga tudo. Confirma sempre o filtro com um find primeiro.

## Modelação (módulo 03)

| Pergunta | Se a resposta é sim |
|---|---|
| Os dados são lidos sempre em conjunto? | Incorpora |
| A relação é um para poucos e estável? | Incorpora |
| O subdocumento cresce sem limite? | Referencia, ou usa o padrão bucket |
| Vários documentos partilham os dados? | Referencia |
| Precisas do valor no momento da compra? | Guarda uma cópia (snapshot) |

| Regra | Nota |
|---|---|
| Limite de um documento | 16 MiB |
| Validação | $jsonSchema com collMod, validationLevel strict ou moderate, validationAction warn ou error |
| Join | $lookup, mas o modelo deve evitá-lo nos casos frequentes |

## Aggregation (módulo 04)

| Estágio | Para quê |
|---|---|
| $match | Filtrar (põe-no o mais cedo possível) |
| $project, $addFields | Escolher ou calcular campos |
| $group | Agrupar, com $sum, $avg, $min, $max, $push, $addToSet |
| $sort, $limit, $skip | Ordenar e paginar (cuidado com $limit antes de $sort) |
| $unwind | Desdobrar um array |
| $lookup | Juntar outra coleção |
| $facet e $bucket | Vários resultados e escalões numa só passagem |
| $merge e $out | Gravar o resultado numa coleção |

| SQL | MongoDB |
|---|---|
| WHERE | $match |
| GROUP BY | $group |
| JOIN | $lookup |
| ORDER BY | $sort |
| HAVING | $match depois do $group |

## Índices e desempenho (módulo 05)

| Tarefa | Comando |
|---|---|
| Criar | db.col.createIndex({ campo: 1 }) |
| Listar e apagar | getIndexes() e dropIndex("nome") |
| Ver o plano | find(...).explain("executionStats") |
| Ler o plano | COLLSCAN é leitura total; IXSCAN usa índice; compara totalDocsExamined com nReturned |

| Tipo de índice | Nota |
|---|---|
| Composto | Regra ESR: igualdade, ordenação, intervalo. Não ganha sempre: mede |
| Multikey, texto, único | Arrays, pesquisa de texto, sem repetidos |
| Parcial e esparso | Só indexam parte dos documentos |
| TTL | Apaga documentos antigos em segundo plano |
| Coberto | A consulta é respondida só pelo índice |

**Regra:** cada índice custa nas escritas. Mede antes e depois, e remove os que não ajudam.

## Python com pymongo (módulo 06)

| Tarefa | Nota |
|---|---|
| Ligar | MongoClient com a connection string |
| Erros comuns | DuplicateKeyError, ServerSelectionTimeoutError, DocumentTooLarge |
| Operações em bloco | bulk_write |
| Transações | Exigem replica set: sem ele o servidor responde com IllegalOperation (código 20) |
| Padrão | session.with_transaction(função), que repete em caso de conflito |

## Operação e segurança (módulo 07)

| Tarefa | Nota |
|---|---|
| Autenticação | Utilizador root só para administrar; a aplicação usa um utilizador com papéis mínimos |
| Replica set | keyFile quando há autenticação; rs.initiate() e rs.status() |
| Eleição | Se o primário parar, um secundário assume |
| Cópia de segurança | mongodump (com --gzip, e --oplog para um ponto consistente) |
| Restauro | mongorestore |
| Monitorização | serverStatus, currentOp (com killOp) e o profiler |
| Sharding e TLS | Só em visão geral no curso: confirma na documentação |

**ATENÇÃO:** uma cópia de segurança que nunca foi restaurada não é uma cópia. Testa o restauro.

## Quando NÃO usar MongoDB

| Situação | Alternativa |
|---|---|
| Muitas relações e junções entre entidades | Uma base relacional |
| Transações complexas em todo o lado | Uma base relacional |
| Dados com esquema muito rígido e relatórios SQL | Uma base relacional |

## Exercícios

**PRATICAR:** usa esta página para resolver os exercícios do módulo 09 sem abrir a documentação.

## Fontes oficiais

- [Documentação do MongoDB](https://www.mongodb.com/docs/manual/)
- [Referência do mongosh](https://www.mongodb.com/docs/mongodb-shell/)
- [Aggregation](https://www.mongodb.com/docs/manual/aggregation/)
- [Índices](https://www.mongodb.com/docs/manual/indexes/)
- [PyMongo](https://pymongo.readthedocs.io/)
