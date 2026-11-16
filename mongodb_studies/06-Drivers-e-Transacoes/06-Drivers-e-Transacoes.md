# 06 Drivers e transações

Até aqui falaste com o MongoDB pela shell. As aplicações falam através de um driver. Neste módulo usas o PyMongo para ligar, fazer CRUD, lidar com datas, ObjectId e erros, escrever em bloco, percorrer cursores e, por fim, usar transações multi-documento, que exigem um replica set. Versão do servidor: MongoDB 8.3.17 (imagem `mongo:8`). Versão do driver nos exemplos: PyMongo 4.20.0. Os scripts estão em `06-Drivers-e-Transacoes/exemplos/`.

## Preparar o ambiente

Instala o driver num ambiente virtual (nunca dentro da pasta do curso) e prepara a base `m06` no servidor partilhado de estudo, com as coleções `produtos` e `clientes` da loja.

    python -m venv .venv
    .venv\Scripts\activate
    pip install pymongo
    python 00_preparar_loja.py            # liga a mongodb://localhost:27117, base m06

## Ligar: MongoClient, connection string e pool

Um `MongoClient` representa a ligação a um servidor ou a um replica set. Cria um único por processo e reutiliza-o: ele gere um pool de ligações e monitoriza o estado dos servidores em segundo plano.

    from pymongo import MongoClient
    client = MongoClient(
        "mongodb://localhost:27117",
        maxPoolSize=20,                 # máximo de ligações no pool (omissão: 100)
        serverSelectionTimeoutMS=3000,  # quanto esperar por um servidor (omissão: 30000)
        appname="curso-mongodb-m06",    # aparece nos logs do servidor
    )
    print(client.admin.command("ping"))         # {'ok': 1.0}
    print(client.server_info()["version"])      # 8.3.17
    db = client["m06"]
    clientes = db["clientes"]

A connection string tem o formato `mongodb://[utilizador:palavra-passe@]anfitrião[:porta][/base][?opções]`. Para clusters Atlas usa-se `mongodb+srv://`. As opções (`maxPoolSize`, `serverSelectionTimeoutMS`, `replicaSet=rs0`, ...) podem ir na string ou como argumentos do construtor. Se o pool estiver cheio, os pedidos esperam por uma ligação livre.

O construtor não liga logo: a ligação acontece na primeira operação. Por isso o `ping` acima é uma boa verificação de arranque. Quando acabares, `client.close()` (ou `with MongoClient(...) as client:`) liberta o pool.

**ATENÇÃO:** criar um `MongoClient` por pedido (por exemplo, dentro de cada função de um servidor web) desperdiça ligações e abranda tudo. Cria-o uma vez, ao arrancar.

## CRUD em Python

As operações são métodos da coleção e os filtros e atualizações são os mesmos documentos da shell, escritos como dicionários.

    r = clientes.insert_one({"id": 9, "nome": "Inês Falcão", "cidade": "Aveiro"})
    print(r.inserted_id, r.acknowledged)           # 6af6e0b5... True
    r = clientes.insert_many([{"id": 10, "nome": "João Sousa", "cidade": "Porto"},
                              {"id": 11, "nome": "Marta Reis", "cidade": "Porto"}])   # 2 ids

    clientes.find_one({"id": 9}, {"_id": 0, "nome": 1})   # {'nome': 'Inês Falcão'}
    clientes.find_one({"id": 999})                        # None
    list(clientes.find({"cidade": "Porto"}, {"_id": 0, "nome": 1}).sort("nome", 1))   # 3 documentos
    clientes.count_documents({"cidade": "Lisboa"})        # 2

    r = clientes.update_one({"id": 9}, {"$set": {"cidade": "Coimbra"}})
    print(r.matched_count, r.modified_count)       # 1 1
    # repetido com o mesmo valor: matched_count 1, modified_count 0
    r = clientes.update_one({"id": 12}, {"$set": {"nome": "Rui Alves"}}, upsert=True)
    print(r.upserted_id)                           # ObjectId novo: criou o documento
    depois = clientes.find_one_and_update({"id": 12}, {"$set": {"cidade": "Viseu"}},
                                          return_document=pymongo.ReturnDocument.AFTER)
    clientes.delete_many({"id": {"$gte": 10}})     # .deleted_count

**DICA:** `find()` devolve um cursor, não uma lista. Usa `count_documents` para contar (conta no servidor) e `find_one_and_update` quando precisas de ler e escrever numa só operação atómica.

## Datas e ObjectId

O MongoDB guarda datas em UTC com precisão de milissegundos. O PyMongo converte `datetime` para o tipo Date do BSON e de volta.

    agora = datetime(2026, 11, 13, 9, 30, 15, 123456, tzinfo=timezone.utc)
    db.registos.insert_one({"_id": "d1", "criado_em": agora})
    lido = db.registos.find_one({"_id": "d1"})["criado_em"]
    print(agora.isoformat())   # 2026-11-13T09:30:15.123456+00:00
    print(lido.isoformat())    # 2026-11-13T09:30:15.123000     (sem fuso; microssegundos perdidos)

Por omissão o `datetime` lido vem sem fuso (naive) e só com milissegundos. Para o receber com fuso UTC usa `db.get_collection("registos", codec_options=CodecOptions(tz_aware=True))` (de `bson.codec_options`); o valor vem então com `+00:00`.

Um `datetime` com fuso é convertido para UTC ao gravar (12:00+01:00 fica 11:00 UTC). Um `date` puro não é aceite: levanta `InvalidDocument: cannot encode object: datetime.date(2026, 11, 13)`. Converte para `datetime` (meia-noite UTC, por exemplo). Para filtrar por intervalo usa `$gte` e `$lt` com `datetime` do mesmo tipo.

O `_id` gerado pelo driver é um `ObjectId`: 12 bytes que se escrevem como 24 caracteres hexadecimais e que incluem o instante de criação.

    r = db.registos.insert_one({"nome": "teste"})
    oid = r.inserted_id
    print(oid, len(str(oid)), oid.generation_time)     # 6af6e0ba... 24 2026-11-13 10:04:42+00:00
    db.registos.find_one({"_id": str(oid)})            # None: texto não é ObjectId
    db.registos.find_one({"_id": ObjectId(str(oid))})  # encontra
    ObjectId("isto-nao-e-um-id")                       # bson.errors.InvalidId (ou ObjectId.is_valid)

**ATENÇÃO:** o erro clássico é procurar por `_id` com o texto vindo de um URL ou de JSON. Converte sempre com `ObjectId(texto)` (e apanha `InvalidId`). O `insert_one` também acrescenta o `_id` ao dicionário que lhe passaste.

## Tratamento de erros

Os erros do PyMongo vivem em `pymongo.errors`. Os que mais encontras (um operador inexistente num filtro, por exemplo, dá `OperationFailure` com código 2, BadValue):

| Exceção | Quando acontece | Como reagir |
|---|---|---|
| DuplicateKeyError | violação de índice único (código 11000) | dizer ao utilizador que já existe |
| BulkWriteError | falhas em insert_many ou bulk_write | ler details para saber quais falharam |
| OperationFailure | o servidor recusou a operação | ler code e codeName |
| ServerSelectionTimeoutError | nenhum servidor disponível no prazo | verificar rede, porta, replica set |

    db.clientes.create_index("email", unique=True)
    try:
        db.clientes.insert_one({"id": 20, "nome": "Duplicado", "email": "ana.ribeiro@exemplo.pt"})
    except DuplicateKeyError as e:
        print(e.code, e.details["keyValue"])           # 11000 {'email': 'ana.ribeiro@exemplo.pt'}


Com `insert_many` e o `ordered=True` por omissão, o primeiro erro pára o lote: os documentos anteriores ficam gravados, os seguintes não. Num lote de três em que o segundo duplica, ficou gravado o primeiro e `BulkWriteError.details` tinha `nInserted: 1` e um erro no índice 1.

Para o servidor inacessível, o erro só surge na primeira operação, e só depois de esgotado o `serverSelectionTimeoutMS`:

    mau = MongoClient("mongodb://localhost:31069", serverSelectionTimeoutMS=1500)  # não liga ainda
    try:
        mau.admin.command("ping")
    except ServerSelectionTimeoutError as e:
        print(str(e)[:50])    # No servers found yet, Timeout: 1.5s, Topology Description: ...

**DICA:** apanha a exceção mais específica primeiro. `DuplicateKeyError` é um caso especial de erro de escrita e merece uma mensagem amigável; as restantes deixa-as subir e regista-as.

## Operações em bloco: bulk_write

Cada `insert_one` ou `update_one` é uma ida ao servidor. O `bulk_write` agrupa várias operações de tipos diferentes num só pedido.

    from pymongo import DeleteOne, InsertOne, ReplaceOne, UpdateOne
    r = produtos.bulk_write([
        InsertOne({"id": 11, "nome": "Mochila", "categoria_id": 3, "preco": 39.9, "stock": 12}),
        UpdateOne({"id": 1}, {"$inc": {"stock": -2}}),
        UpdateOne({"id": 6}, {"$set": {"stock": 25}}),
        ReplaceOne({"id": 10}, {"id": 10, "nome": "Caneca de Cerâmica", "categoria_id": 3,
                                "preco": 7.0, "stock": 200}),
        DeleteOne({"id": 11}),
    ])
    print(r.inserted_count, r.matched_count, r.modified_count, r.deleted_count)   # 1 3 3 1

A diferença entre `ordered=True` (omissão) e `ordered=False` vê-se com um índice único em `id` e um lote em que o segundo documento repete um id:

    lote = [InsertOne({"id": 13}), InsertOne({"id": 1}), InsertOne({"id": 14})]
    # ordered=True : inseridos=1, erros nos índices [1]   (pára no primeiro erro)
    # ordered=False: inseridos=2, erros nos índices [1]   (continua e relata no fim)

**NOTA:** o lote não é uma transação. Se falhar a meio, o que já foi aplicado fica aplicado. Para tudo-ou-nada precisas de uma transação (mais abaixo). Com `UpdateOne(..., upsert=True)` num ciclo obténs um «atualiza ou cria» em bloco.

## Cursores e paginação

Um cursor traz os resultados por lotes (`batch_size`) e o servidor mantém-no aberto entre pedidos.

    cursor = produtos.find({}, {"_id": 0, "id": 1, "nome": 1}).sort("id", 1).batch_size(4)
    primeiro = next(cursor)         # só aqui o 1.º lote é pedido
    print(primeiro, cursor.alive)   # {'id': 1, 'nome': 'Romance Policial'} True
    restantes = list(cursor)        # consome o resto
    print(len(restantes), cursor.alive)   # 10 False   (1 + 10 = 11 produtos nesse momento)

Usa `with produtos.find(...) as c:` para garantir o fecho do cursor mesmo com `break` ou exceção.

Para paginar há duas estratégias. Com `skip` e `limit` o servidor tem de percorrer e descartar os documentos saltados, por isso páginas fundas ficam cada vez mais lentas. A paginação por intervalo continua a partir do último valor visto e aproveita um índice.

    # skip/limit
    produtos.find({}, {"_id": 0, "id": 1}).sort("id", 1).skip(pagina * TAMANHO).limit(TAMANHO)
    # por intervalo
    produtos.find({"id": {"$gt": ultimo}}, {"_id": 0, "id": 1}).sort("id", 1).limit(TAMANHO)

Ambas devolveram as mesmas páginas (4 por página): [1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 12].

**DICA:** ordena sempre antes de paginar. Sem `sort` a ordem não é garantida. Se ordenares por um campo com valores repetidos, junta o `_id` como desempate.

## Transações multi-documento

Uma escrita num único documento já é atómica no MongoDB, mesmo que o documento tenha subdocumentos e arrays. As transações multi-documento servem quando precisas de tudo-ou-nada em vários documentos ou coleções (por exemplo, criar a encomenda, as linhas e baixar o stock).

Elas exigem um replica set. Num servidor isolado, como o `est-mongo`, o erro é este (executado):

    with solto.start_session() as s:
        with s.start_transaction():
            solto["m06"].produtos.update_one({"id": 1}, {"$inc": {"stock": -1}}, session=s)
    # (a sessão cria-se sem problema; o erro surge na primeira operação)
    # OperationFailure code = 20 | IllegalOperation
    # Transaction numbers are only allowed on a replica set member or mongos

### Replica set de 1 nó com Compose

Um replica set de um só nó chega para estudar transações. O `compose-replset.yml` (em `exemplos/`) usa o prefixo `est-mg06`, a porta 31060 e um volume nomeado.

Pontos-chave do ficheiro: `command` arranca o mongod com `--replSet rs0 --port 31060`, `ports` expõe `31060:31060`, `volumes` usa o volume nomeado `dados` (em `/data/db`) e o `healthcheck` inicia o replica set com `rs.initiate` na primeira vez e só passa a healthy quando o nó é primário.

Arranca e espera pelo estado healthy:

    docker compose -f compose-replset.yml up -d
    docker compose -f compose-replset.yml ps      # Up (healthy)
    docker compose -f compose-replset.yml down -v # limpeza (apaga também o volume)

**ATENÇÃO:** o mongod escuta na mesma porta que expões (31060) porque o replica set anuncia ao driver o endereço dos seus membros (aqui `localhost:31060`) e o anfitrião tem de conseguir chegar-lhe. Liga com `mongodb://localhost:31060/?replicaSet=rs0`.

### with_transaction

A forma recomendada é `with_transaction`: executa a função, faz commit e repete automaticamente em erros transitórios.

    def criar_encomenda(session, cliente_id, itens, numero):
        db.encomendas.insert_one({"id": numero, "cliente_id": cliente_id,
                                  "estado": "pendente"}, session=session)
        for linha, (produto_id, quantidade) in enumerate(itens, start=1):
            p = db.produtos.find_one({"id": produto_id}, session=session)
            r = db.produtos.update_one({"id": produto_id, "stock": {"$gte": quantidade}},
                                       {"$inc": {"stock": -quantidade}}, session=session)
            if r.matched_count == 0:
                raise ValueError(f"stock insuficiente para o produto {produto_id}")
            db.linhas_encomenda.insert_one({"id": numero * 10 + linha, "encomenda_id": numero,
                                            "produto_id": produto_id, "quantidade": quantidade,
                                            "preco_unitario": p["preco"]}, session=session)

    with client.start_session() as s:
        s.with_transaction(lambda sess: criar_encomenda(sess, 1, [(1, 2), (5, 1)], 100))

Resultado real: o stock do produto 1 passou de 40 para 38, o do 5 de 100 para 99 e ficaram 2 linhas. Com a encomenda 101, em que a segunda linha pede o produto 6 (stock 0), a exceção sai do `with_transaction`, a transação é abortada e nada fica gravado: o stock continua 38 e 0 e a encomenda 101 não existe.

Regras de ouro do corpo da transação:

- Passa `session=session` em TODAS as operações; sem isso a operação corre fora da transação.
- Pode ser executado mais do que uma vez (a documentação do PyMongo avisa que o callback pode ser chamado várias vezes). Não metas lá efeitos que não se desfazem, como enviar emails.
- O `with_transaction` pára de repetir ao fim de 120 segundos (confirmado no código-fonte do PyMongo 4.20.0).

### Isolamento, conflitos e repetição

Com `ReadConcern("snapshot")` a transação vê sempre o mesmo retrato: leu o stock do produto 10 como 200, outra escrita fora da transação baixou-o para 150, e dentro da transação continuou a ver 200.

Duas transações a mexer no mesmo documento geram um conflito: a segunda recebe `OperationFailure code = 112 | WriteConflict`, com a etiqueta `TransientTransactionError`. É essa etiqueta que o `with_transaction` usa para repetir. No teste, uma transação segurava o documento e outra, via `with_transaction`, correu o corpo 9 vezes até a primeira terminar. O número de repetições varia de execução para execução.

### Quando usar e quando evitar

| Situação | Abordagem |
|---|---|
| Baixar stock se houver quantidade suficiente | update_one condicional: um documento, sem transação |
| Encomenda com as linhas incorporadas num só documento | uma só escrita atómica |
| Encomenda, linhas e stock em 3 coleções (modelo plano) | transação |

Exemplo de operação atómica sem transação, com o produto 8 (stock 8): `update_one({"id": 8, "stock": {"$gte": 5}}, {"$inc": {"stock": -5}})` modificou 1 documento; repetida, não encontrou stock suficiente e `modified_count` foi 0.

**NOTA:** a documentação do MongoDB avisa que uma transação distribuída custa normalmente mais do que uma escrita num só documento e que a sua existência não substitui um bom desenho do esquema. O módulo 03 mostrou como o modelo (incorporar) reduz a necessidade de transações. Por omissão uma transação tem de durar menos de um minuto (`transactionLifetimeLimitSeconds`). Mantém-nas curtas. Não testei sharding nem Atlas: nesses clusters as transações têm limites próprios (consulta a documentação).

## Read concern e write concern

São dois botões de garantia que podes definir no cliente, na base, na coleção ou na operação. O write concern diz quantos nós têm de confirmar a escrita; o read concern diz que dados uma leitura pode ver.

    from pymongo.read_concern import ReadConcern
    from pymongo.write_concern import WriteConcern
    forte = db.get_collection("produtos", write_concern=WriteConcern(w="majority", j=True),
                              read_concern=ReadConcern("majority"))
    forte.update_one({"id": 5}, {"$set": {"stock": 100}})     # acknowledged = True

| Opção | Efeito | Resultado observado |
|---|---|---|
| w majority, j True | maioria dos nós confirma e o diário é escrito em disco | acknowledged True |
| w 0 | o servidor não confirma | acknowledged False; ler matched_count levanta InvalidOperation |
| w 2 num nó único | impossível de cumprir | WriteConcernError, code 100, UnsatisfiableWriteConcern |

No cliente de teste, `client.write_concern.document` veio vazio: o cliente não impõe nada e aplica-se o predefinido do servidor (confirma o valor na documentação da tua versão). O read concern predefinido para leituras no primário é "local" (documentação de read concern). Numa transação, o nível de leitura e escrita define-se na própria transação (`start_transaction(read_concern=..., write_concern=...)`).

## Change streams: visão geral

Um change stream deixa a aplicação ouvir as alterações de uma coleção em tempo real. Também exige replica set (executado na porta 31060).

    with db.alertas.watch([{"$match": {"operationType": {"$in": ["insert", "update"]}}}],
                          full_document="updateLookup", max_await_time_ms=500) as stream:
        alteracao = stream.try_next()      # None se não houver novidades
        token = stream.resume_token        # guarda para retomar mais tarde

Com um insert, um update e outro insert seguidos de um delete (que o filtro exclui), o ouvinte recebeu:

    insert | {'_id': 1} | {'_id': 1, 'produto_id': 6, 'mensagem': 'stock a zero', 'visto': False}
    update | {'_id': 1} | {'_id': 1, 'produto_id': 6, 'mensagem': 'stock a zero', 'visto': True}
    insert | {'_id': 2} | {'_id': 2, 'produto_id': 8, 'mensagem': 'stock baixo', 'visto': False}

O filtro corre no servidor, `full_document="updateLookup"` devolve o documento completo também nos updates, e o resume token permite retomar depois de uma interrupção. Retoma e gestão de erros ficam para a documentação.

## Nota sobre Node e Bun

O driver oficial para JavaScript é o pacote npm `mongodb` (executado aqui com a versão 7.9.0). O mesmo programa de leitura correu com o Node 24.18.0 e com o Bun 1.4.0 contra o servidor partilhado e devolveu os dois clientes de Lisboa:

    find({ cidade: "Lisboa" }).project({ _id: 0, nome: 1 }).toArray()   // [ { nome: 'Ana Ribeiro' }, { nome: 'Diogo Pires' } ]

Só testei esta leitura. Não testei transações, change streams nem o pool em Node ou Bun: para isso consulta a documentação do driver.

## Exercícios

**PRATICAR:** exercícios 21 a 24 do módulo de exercícios (CRUD com pymongo, datas, ObjectId e erros, operações em bloco com paginação, transação com rollback).

## Fontes oficiais

- Driver PyMongo (MongoDB): https://www.mongodb.com/docs/languages/python/pymongo-driver/current/
- PyMongo, MongoClient: https://pymongo.readthedocs.io/en/stable/api/pymongo/mongo_client.html
- PyMongo, ClientSession e with_transaction: https://pymongo.readthedocs.io/en/stable/api/pymongo/client_session.html
- PyMongo, Collection: https://pymongo.readthedocs.io/en/stable/api/pymongo/collection.html
- PyMongo, erros: https://pymongo.readthedocs.io/en/stable/api/pymongo/errors.html
- PyMongo, datas e fusos horários: https://pymongo.readthedocs.io/en/stable/examples/datetimes.html
- Connection string: https://www.mongodb.com/docs/manual/reference/connection-string/
- Transações: https://www.mongodb.com/docs/manual/core/transactions/
- Transações, considerações de produção: https://www.mongodb.com/docs/manual/core/transactions-production-consideration/
- Read concern: https://www.mongodb.com/docs/manual/reference/read-concern/
- Write concern: https://www.mongodb.com/docs/manual/reference/write-concern/
- Change streams: https://www.mongodb.com/docs/manual/changeStreams/
- Tipos BSON (ObjectId, Date): https://www.mongodb.com/docs/manual/reference/bson-types/
- Driver Node.js: https://www.mongodb.com/docs/drivers/node/current/
- Bun: https://bun.sh/docs
- Imagem Docker oficial: https://hub.docker.com/_/mongo
- Docker Compose: https://docs.docker.com/compose/
