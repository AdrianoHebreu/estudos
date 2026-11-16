# 02 CRUD: inserir, consultar, atualizar e apagar

CRUD é o conjunto das quatro operações de todos os dias: Create, Read, Update, Delete. Neste módulo aprendes a fazê-las no `mongosh` com os dados da loja, vês o que o servidor devolve em cada caso e conheces as armadilhas que apanham quem vem de SQL. Todos os exemplos foram executados no MongoDB 8.3.17 (mongosh 2.14.2), numa base de dados chamada `m02` onde importámos os ficheiros da loja. Confirma primeiro que a loja está importada (`use m02` e `db.clientes.countDocuments()` deve dar 8). As consultas que mostram vários documentos levam `.sort(...)` porque, sem ordenação, o MongoDB não garante a ordem dos resultados. O SQL das comparações foi escrito à mão e não foi executado.

## Create: insertOne e insertMany

`insertOne` insere um documento e `insertMany` insere uma lista. Ambos devolvem o `_id` gerado quando não o indicas:

    db.categorias.insertOne({ id: 4, nome: "Jardim" })
    // { acknowledged: true, insertedId: ObjectId('6af75baf8b238072b0436f9b') }

    db.categorias.insertMany([{ id: 5, nome: "Desporto" }, { id: 6, nome: "Brinquedos" }])
    // { acknowledged: true,
    //   insertedIds: { '0': ObjectId('6af75baf8b238072b0436f9c'),
    //                  '1': ObjectId('6af75baf8b238072b0436f9d') } }

A coleção é criada na primeira inserção, sem `CREATE TABLE`. Se o `_id` já existir, o servidor recusa com o código 11000 (chave duplicada). Num `insertMany` com o segundo documento a repetir o `_id` do primeiro, a opção `ordered` decide o resto:

    db.categorias.insertMany([{_id: 100, nome:"a"}, {_id: 100, nome:"b"}, {_id: 101, nome:"c"}])
    // ordered (por defeito): erro 11000, inseridos: 1 (o terceiro nem foi tentado)

    db.categorias.insertMany([{_id: 100, nome:"a"}, {_id: 102, nome:"b"}], { ordered: false })
    // erro 11000 no 100 (já existia), mas o 102 foi inserido

Usa `ordered: false` quando os documentos são independentes entre si.

## Read: find com filtros

O primeiro argumento de `find` é o filtro (o equivalente do WHERE), o segundo é a projeção (o equivalente das colunas do SELECT). `findOne` devolve só o primeiro documento que corresponde, ou `null`.

    db.clientes.find({ cidade: "Lisboa" }, { _id: 0, id: 1, nome: 1 }).sort({ id: 1 })
    // [ { id: 1, nome: 'Ana Ribeiro' }, { id: 4, nome: 'Diogo Pires' },
    //   { id: 8, nome: 'Hugo Teixeira' } ]

    db.clientes.findOne({ id: 3 }, { _id: 0 })
    // { id: 3, nome: 'Carla Mendes', email: 'carla.mendes@exemplo.pt',
    //   cidade: 'Braga', data_registo: ISODate('2024-03-21T00:00:00.000Z') }

Vários campos no mesmo filtro são combinados com AND implícito.

### Operadores de comparação

| Operador | Significado | Equivalente SQL |
|---|---|---|
| $eq | igual (é o que `{ campo: valor }` faz) | campo = valor |
| $ne | diferente | campo <> valor |
| $gt, $gte | maior, maior ou igual | campo > valor, campo >= valor |
| $lt, $lte | menor, menor ou igual | campo < valor, campo <= valor |
| $in | igual a um dos valores da lista | campo IN (...) |
| $nin | não igual a nenhum da lista | campo NOT IN (...) |

Os operadores de um mesmo campo combinam-se dentro do mesmo documento de condições:

    db.produtos.find({ preco: { $gt: 20, $lte: 50 } }, { _id: 0, nome: 1, preco: 1 }).sort({ preco: 1 })
    // Candeeiro de Mesa 22, Atlas Mundial 29.99, Manta de Sofá 34.5, Auscultadores Bluetooth 49.9

    db.encomendas.find({ estado: { $in: ["pendente", "enviada"] } }, { _id: 0, id: 1, estado: 1 }).sort({ id: 1 })
    // ids 6, 7, 11 (enviada) e 8, 9, 12 (pendente)

    db.encomendas.countDocuments({ estado: { $ne: "entregue" } })   // 7

### Operadores lógicos

| Operador | Significado | Equivalente SQL |
|---|---|---|
| $and | todas as condições | cond1 AND cond2 |
| $or | pelo menos uma | cond1 OR cond2 |
| $not | nega uma condição de um campo | campo NOT ... |

    db.produtos.find({ $or: [{ stock: 0 }, { preco: { $lt: 10 } }] }, { _id: 0, nome: 1, preco: 1, stock: 1 }).sort({ id: 1 })
    // { nome: 'Teclado Mecânico', preco: 79, stock: 0 }
    // { nome: 'Caneca de Cerâmica', preco: 6.5, stock: 200 }

    db.produtos.find({ preco: { $not: { $gt: 20 } } }, { _id: 0, nome: 1 }).sort({ id: 1 })   // 4 produtos com preço até 20

**DICA:** o `$and` explícito só é necessário quando precisas da mesma chave duas vezes (por exemplo dois `$or`). Para duas condições no mesmo campo, usa `{ preco: { $gt: 10, $lt: 20 } }`, que deu o mesmo resultado que `{ $and: [{ preco: { $gt: 10 } }, { preco: { $lt: 20 } }] }`: Romance Policial, Livro de Receitas e Carregador USB-C.

### $exists e null

O cliente 8 tem `email: null`. Atenção à diferença entre «o campo existe com o valor null» e «o campo não existe»:

    db.clientes.find({ email: null }, { _id: 0, id: 1, nome: 1 })       // [ { id: 8, nome: 'Hugo Teixeira' } ]
    db.clientes.countDocuments({ email: { $exists: true } })            // 8 (o null conta como existir; um campo inexistente como telefone também dá 8 com null e com $exists: false)

`{ campo: null }` apanha os documentos em que o campo é null e também aqueles em que não existe. Para separar os dois casos usa `$exists` ou `$type: "null"` (esta última devolveu só o cliente 8).

### Expressões regulares

    db.clientes.find({ nome: { $regex: "^[A-C]" } }, { _id: 0, nome: 1 }).sort({ id: 1 })
    // Ana Ribeiro, Bruno Costa, Carla Mendes

**ATENÇÃO:** um `$regex` sem âncora (`^`) obriga a ler todos os valores do campo e não aproveita bem os índices. O módulo 05 explica porquê.

## Arrays e documentos incorporados

No modelo plano da loja as encomendas e as linhas estão em coleções separadas, por isso não há arrays nos dados importados. Para ver estas consultas criámos uma coleção `catalogo` com três documentos, com etiquetas (array de textos), uma marca (documento incorporado) e avaliações (array de documentos):

    db.catalogo.insertMany([
      { sku: "CAN-01", nome: "Caneca de Cerâmica", preco: 6.5, etiquetas: ["cozinha", "presente"],
        marca: { nome: "Barro", pais: "PT" },
        avaliacoes: [{ autor: "Ana", nota: 5 }, { autor: "Rui", nota: 3 }] },
      { sku: "LIV-01", nome: "Romance Policial", preco: 12.9, etiquetas: ["livro", "presente", "policial"],
        marca: { nome: "Letra", pais: "PT" },
        avaliacoes: [{ autor: "Eva", nota: 4 }, { autor: "Rui", nota: 5 }] },
      { sku: "TEC-01", nome: "Teclado Mecânico", preco: 79, etiquetas: ["informática"],
        marca: { nome: "Clack", pais: "DE" }, avaliacoes: [] }
    ])

| Consulta | O que faz | Resultado (sku) |
|---|---|---|
| `{ etiquetas: "presente" }` | o array contém o valor | CAN-01, LIV-01 |
| `{ etiquetas: { $all: ["presente", "livro"] } }` | contém todos os valores | LIV-01 |
| `{ etiquetas: { $in: ["informática", "cozinha"] } }` | contém algum dos valores | CAN-01, TEC-01 |
| `{ etiquetas: { $size: 1 } }` | o array tem exatamente 1 elemento | TEC-01 |
| `{ "etiquetas.0": "livro" }` | o primeiro elemento é «livro» | LIV-01 |
| `{ "marca.pais": "PT" }` | campo dentro do documento incorporado | CAN-01, LIV-01 |

Para entrar num documento incorporado usa a notação de ponto, entre aspas. Há uma armadilha: comparar o documento inteiro exige a mesma ordem dos campos.

    db.catalogo.find({ marca: { nome: "Barro", pais: "PT" } })   // CAN-01
    db.catalogo.find({ marca: { pais: "PT", nome: "Barro" } })   // nenhum resultado

**DICA:** prefere sempre a notação de ponto (`"marca.pais"`), que não depende da ordem nem de os outros campos serem iguais.

### Arrays de documentos e $elemMatch

Queremos os produtos que o Rui avaliou com nota 5 ou mais. Com dois campos separados, cada condição pode ser satisfeita por elementos diferentes do array:

    db.catalogo.find({ "avaliacoes.autor": "Rui", "avaliacoes.nota": { $gte: 5 } })
    // CAN-01 e LIV-01  (errado para o que queremos)

    db.catalogo.find({ avaliacoes: { $elemMatch: { autor: "Rui", nota: { $gte: 5 } } } })
    // LIV-01  (certo)

O CAN-01 apareceu na primeira porque a Ana deu 5 e o Rui deu 3: as duas condições foram satisfeitas por elementos diferentes. O `$elemMatch` exige que o mesmo elemento cumpra tudo.

## Projeção, sort, limit, skip e contagens

A projeção escolhe os campos devolvidos. Com 1 incluis, com 0 excluis. O `_id` vem sempre, a não ser que o excluas.

    db.categorias.findOne({ id: 1 }, { _id: 0 })     // { id: 1, nome: 'Livros' }

    db.catalogo.findOne({ sku: "LIV-01" }, { _id: 0, nome: 1, "marca.nome": 1, etiquetas: { $slice: 2 } })
    // { nome: 'Romance Policial', etiquetas: [ 'livro', 'presente' ], marca: { nome: 'Letra' } }

Não podes misturar inclusão e exclusão (exceto o `_id`):

    db.categorias.findOne({}, { nome: 1, id: 0 })
    // Location31254: Cannot do exclusion on field id in inclusion projection

`sort`, `skip` e `limit` encadeiam-se no cursor. Os três produtos a seguir aos dois mais caros:

    db.produtos.find({}, { _id: 0, nome: 1, preco: 1 }).sort({ preco: -1 }).skip(2).limit(3)
    // Auscultadores Bluetooth 49.9, Manta de Sofá 34.5, Atlas Mundial 29.99

**ATENÇÃO:** `skip` com valores grandes é lento, porque o servidor tem de percorrer e deitar fora todos os documentos saltados. Para listas grandes, pagina com um filtro sobre o último valor visto (por exemplo `{ id: { $gt: ultimo_id } }`). O módulo 05 volta a isto.

Contagens e valores distintos:

    db.produtos.countDocuments({ stock: { $gt: 0 } })  // 9 (sem filtro dá 10)
    db.encomendas.distinct("estado")                   // [ 'cancelada', 'entregue', 'enviada', 'pendente' ]

## Update: updateOne, updateMany e operadores

Um update recebe um filtro e um documento de operadores. Cada operador diz como alterar os campos:

| Operador | O que faz |
|---|---|
| $set | define o valor de um campo (cria-o se não existir) |
| $inc | soma (ou subtrai, com valor negativo) a um campo numérico |
| $unset | remove o campo |
| $push | acrescenta um elemento ao fim de um array (`$each` para vários) |
| $addToSet | acrescenta só se ainda não existir |
| $pull | remove do array os elementos que cumprem a condição |

    db.catalogo.updateOne({ sku: "CAN-01" }, { $set: { preco: 7.5, "marca.pais": "ES" } })
    db.catalogo.updateMany({ etiquetas: "presente" }, { $inc: { preco: 1 } })
    db.catalogo.updateOne({ sku: "TEC-01" }, { $unset: { marca: "" } })
    db.catalogo.updateOne({ sku: "TEC-01" }, { $push: { etiquetas: "gaming" } })
    db.catalogo.updateOne({ sku: "TEC-01" }, { $push: { etiquetas: { $each: ["usb", "rgb"] } } })
    db.catalogo.updateOne({ sku: "TEC-01" }, { $pull: { etiquetas: "rgb" } })
    db.catalogo.updateOne({ sku: "CAN-01" }, { $pull: { avaliacoes: { nota: { $lt: 4 } } } })

Depois destas operações o CAN-01 ficou com `preco: 8.5` (subiu de 6.5 para 7.5 com o `$set` e para 8.5 com o `$inc`, por ter a etiqueta «presente»), `marca.pais: 'ES'` e só a avaliação da Ana. O TEC-01 perdeu o campo `marca` e ficou com as etiquetas `[ 'informática', 'gaming', 'usb' ]`.

### Ler o resultado de um update

Todos os updates devolvem um resumo. Os campos que interessam:

| Campo | Significado |
|---|---|
| acknowledged | o servidor confirmou a operação |
| matchedCount | quantos documentos cumpriram o filtro |
| modifiedCount | quantos documentos foram realmente alterados |
| upsertedCount | quantos documentos foram criados por um upsert |

    updateOne({ sku: "CAN-01" }, { $set: { preco: 7.5 } })   // 1ª vez: matchedCount 1, modifiedCount 1
    updateOne({ sku: "CAN-01" }, { $set: { preco: 7.5 } })   // repetido: matchedCount 1, modifiedCount 0
    updateOne({ sku: "XXX" }, { $set: { preco: 1 } })        // matchedCount 0, modifiedCount 0
    updateMany({ etiquetas: "presente" }, { $inc: { preco: 1 } })   // matchedCount 2, modifiedCount 2

**NOTA:** um update que não encontra nada não é um erro: devolve `matchedCount: 0`, por isso confere-o quando precisas de saber se o documento existia. Se o valor já era igual, `modifiedCount` fica a 0 mesmo com `matchedCount: 1`.

### Upsert

Com `upsert: true`, se nenhum documento cumprir o filtro, o servidor cria um novo a partir do filtro e do update. O `$setOnInsert` só se aplica quando há criação:

    db.catalogo.updateOne({ sku: "LAM-01" },
      { $set: { nome: "Candeeiro" }, $setOnInsert: { criado: "agora" } }, { upsert: true })
    // matchedCount: 0, modifiedCount: 0, upsertedCount: 1, insertedId: ObjectId('6af75bdcd9ee66e4311eef5b')

    // repetida com outro nome: matchedCount 1, modifiedCount 1, upsertedCount 0
    // resultado: { sku: 'LAM-01', criado: 'agora', nome: 'Candeeiro de Mesa' } (o sku veio do filtro)


### replaceOne

O `replaceOne` troca o documento inteiro (exceto o `_id`) pelo que indicas. Os campos que não escreveres desaparecem:

    db.catalogo.replaceOne({ sku: "LAM-01" }, { sku: "LAM-01", nome: "Candeeiro LED" })
    db.catalogo.findOne({ sku: "LAM-01" }, { _id: 0 })    // { sku: 'LAM-01', nome: 'Candeeiro LED' }

O campo `criado` desapareceu: usa `replaceOne` só quando queres mesmo substituir.

### findOneAndUpdate

Atualiza e devolve o documento numa só operação atómica. Por defeito devolve o documento antes da alteração; com `returnDocument: "after"` devolve o resultado:

    db.catalogo.findOneAndUpdate({ sku: "LAM-01" }, { $set: { preco: 22 } }, { projection: { _id: 0 } })
    // { sku: 'LAM-01', nome: 'Candeeiro LED' }                   (antes: ainda sem preço)

    db.catalogo.findOneAndUpdate({ sku: "LAM-01" }, { $inc: { preco: 3 } },
      { returnDocument: "after", projection: { _id: 0 } })
    // { sku: 'LAM-01', nome: 'Candeeiro LED', preco: 25 }

É a ferramenta certa para contadores e filas («apanha o próximo trabalho pendente e marca-o como em curso»), porque ler e alterar não podem ser interrompidos por outro cliente.

## Delete: deleteOne e deleteMany

    db.catalogo.deleteOne({ sku: "LAM-01" })       // { acknowledged: true, deletedCount: 1 }
    db.catalogo.deleteOne({ sku: "LAM-01" })       // { acknowledged: true, deletedCount: 0 }
    db.catalogo.deleteMany({ preco: { $lt: 10 } }) // deletedCount: 1

Apagar o que já não existe também não é um erro: `deletedCount: 0`. O `deleteOne` apaga o primeiro documento que encontrar, por isso garante que o filtro identifica o documento certo (de preferência pelo `_id` ou por um campo único).

## Armadilhas

**ATENÇÃO:** update sem operador. Em SQL escreves `UPDATE ... SET nome = 'X'`. No MongoDB, passar um documento sem operadores a `updateOne` é recusado pelo driver (no mongosh 2.14.2 que usámos, o documento não é trocado em silêncio):

    db.catalogo.updateOne({ sku: "LAM-01" }, { nome: "X" })
    // MongoInvalidArgumentError: Update document requires atomic operators

    // (e o inverso: replaceOne com $set dá MongoInvalidArgumentError: Replacement document must not contain atomic operators)

Se queres substituir, usa `replaceOne`; se queres alterar campos, usa `$set`.

**ATENÇÃO:** filtro vazio. `{}` corresponde a todos os documentos, tal como um UPDATE ou DELETE sem WHERE:

    db.catalogo.updateMany({}, { $set: { revisto: true } })   // matchedCount: 3, modifiedCount: 3
    db.catalogo.deleteMany({})                                // apagou todos os documentos que restavam

O `deleteMany({})` esvazia a coleção mas mantém-na (e os índices); `db.catalogo.drop()` apaga-a por inteiro.

**DICA:** antes de um `updateMany` ou `deleteMany`, corre o mesmo filtro num `countDocuments` ou `find` e vê se o número faz sentido.

**ATENÇÃO:** o tipo conta: `{ preco: "12.9" }` (texto) não encontra `preco: 12.9` (número), e `$set: { stock: "10" }` grava texto sem protestar. Só a validação de esquema (módulo 03) te protege.

## MongoDB e SQL lado a lado

| Operação | SQL (escrito à mão, não executado) | MongoDB (mongosh) |
|---|---|---|
| Inserir uma linha | INSERT INTO categorias (id, nome) VALUES (4, 'Jardim') | db.categorias.insertOne({ id: 4, nome: "Jardim" }) |
| Filtrar | SELECT nome FROM clientes WHERE cidade = 'Lisboa' | db.clientes.find({ cidade: "Lisboa" }, { nome: 1 }) |
| Nulos | WHERE email IS NULL | find({ email: null }) (apanha também campo em falta) |
| Texto com padrão | WHERE nome LIKE 'C%' | find({ nome: { $regex: "^C" } }) |
| Ordenar e paginar | ORDER BY preco DESC OFFSET 2 ROWS FETCH NEXT 3 ROWS ONLY | find().sort({ preco: -1 }).skip(2).limit(3) |
| Contar | SELECT COUNT(*) FROM produtos WHERE stock > 0 | db.produtos.countDocuments({ stock: { $gt: 0 } }) |
| Atualizar | UPDATE produtos SET preco = 7.5 WHERE id = 10 | updateOne({ id: 10 }, { $set: { preco: 7.5 } }) |
| Somar a um valor | UPDATE produtos SET stock = stock + 5 WHERE id = 1 | updateOne({ id: 1 }, { $inc: { stock: 5 } }) |
| Apagar | DELETE FROM encomendas WHERE estado = 'cancelada' | deleteMany({ estado: "cancelada" }) |
| Inserir ou atualizar | MERGE (sintaxe varia consoante o SQL) | updateOne(filtro, update, { upsert: true }) |

Diferenças que convém reter: os arrays e os documentos incorporados consultam-se com notação de ponto, `$all` e `$elemMatch`, sem tabelas auxiliares nem JOIN; cada operação sobre um único documento é atómica, mas um `updateMany` não é uma transação (módulo 06); e o resultado traz `matchedCount` e `modifiedCount`, que podem ser diferentes. A página oficial de comparação está nas fontes.

## Exercícios

**PRATICAR:** faz os exercícios 5 a 8 do módulo de exercícios (09), que cobrem consultas com filtros e operadores, arrays e documentos incorporados, updates com operadores e upsert, e as operações de apagar. Só consultes o gabarito depois de tentares.

## Fontes oficiais

- CRUD, visão geral: https://www.mongodb.com/docs/manual/crud/
- Inserir documentos: https://www.mongodb.com/docs/manual/tutorial/insert-documents/
- Consultar documentos: https://www.mongodb.com/docs/manual/tutorial/query-documents/
- Operadores de consulta: https://www.mongodb.com/docs/manual/reference/mql/query-predicates/
- Consultar arrays de documentos: https://www.mongodb.com/docs/manual/tutorial/query-array-of-documents/
- $elemMatch: https://www.mongodb.com/docs/manual/reference/operator/query/elemMatch/
- Projeção: https://www.mongodb.com/docs/manual/tutorial/project-fields-from-query-results/
- countDocuments: https://www.mongodb.com/docs/manual/reference/method/db.collection.countDocuments/
- Atualizar documentos: https://www.mongodb.com/docs/manual/tutorial/update-documents/
- Operadores de atualização: https://www.mongodb.com/docs/manual/reference/mql/update/
- updateOne: https://www.mongodb.com/docs/manual/reference/method/db.collection.updateOne/
- findOneAndUpdate: https://www.mongodb.com/docs/manual/reference/method/db.collection.findOneAndUpdate/
- Apagar documentos: https://www.mongodb.com/docs/manual/tutorial/remove-documents/
- Comparação SQL e MongoDB: https://www.mongodb.com/docs/manual/reference/sql-comparison/
