# 01 Conceitos e ambiente

No módulo 00 viste o que é o MongoDB e para que serve. Aqui aprofundas os conceitos que sustentam tudo o resto (documentos, coleções, bases de dados, BSON, tipos e o campo `_id`) e montas o ambiente de trabalho: um servidor MongoDB 8 num contentor, com Docker Compose, os dados num volume que sobrevive aos reinícios, e a loja importada. No fim tens uma base de dados pronta para os módulos seguintes e sabes destruí-la e recriá-la sem deixar lixo na máquina.

Todos os comandos desta aula foram executados contra o MongoDB 8.3.17 (imagem `mongo:8`), com o `mongosh` 2.14.2 e o `mongoimport` 100.20.1, que vêm dentro da imagem.

## Documentos, coleções e bases de dados

Um servidor MongoDB tem várias bases de dados; cada base de dados tem coleções; cada coleção tem documentos.

| Nível | O que é | Analogia SQL | Nota |
|---|---|---|---|
| Servidor | o processo `mongod` | servidor ou instância | uma ligação, um endereço e uma porta |
| Base de dados | conjunto de coleções | base de dados | na loja, chama-se `loja` |
| Coleção | conjunto de documentos | tabela | não tem colunas fixas |
| Documento | pares campo e valor | linha | tem estrutura própria, pode conter documentos e arrays |
| Campo | um par nome e valor dentro do documento | coluna | o tipo pertence ao valor, não à coleção |

A documentação diz que, se uma coleção não existe, o MongoDB cria-a quando guardas dados nela pela primeira vez. O mesmo se passa com as bases de dados: não há um `CREATE DATABASE`. Por isso um erro de digitação no nome cria, em silêncio, uma coleção nova e vazia ao lado da certa.

**ATENÇÃO:** `show dbs` só lista as bases de dados que têm dados. Uma base de dados que escolheste com `use` mas onde ainda não escreveste nada não aparece.

### O que um documento pode conter

Um documento é uma lista de campos com nome. Os valores podem ser simples, outros documentos ou arrays. Inserimos este documento numa base de dados descartável chamada `demo`:

    db.tipos.insertOne({
      nome: "Caneca",
      preco: Decimal128("9.99"),
      stock: NumberInt(7),
      visitas: NumberLong("9007199254740993"),
      criado: new Date("2026-11-13T10:00:00Z"),
      ativo: true,
      etiquetas: ["casa", "cozinha"],
      medidas: { altura: 9.5, largura: 8 },
      nada: null
    })

Lido de volta com `findOne`, o `mongosh` mostra os tipos em notação própria:

    {
      nome: 'Caneca',
      preco: Decimal128('9.99'),
      stock: 7,
      visitas: Long('9007199254740993'),
      criado: ISODate('2026-11-13T10:00:00.000Z'),
      ativo: true,
      etiquetas: [ 'casa', 'cozinha' ],
      medidas: { altura: 9.5, largura: 8 },
      nada: null
    }

## BSON e tipos

O que escreves parece JSON, mas o servidor guarda BSON. O BSON acrescenta tipos que o JSON não tem, e o `mongosh` distingue-os para ti. A documentação lista os tipos e os seus nomes; os que mais vais usar:

| Tipo | Nome em consultas ($type) | Como se escreve no mongosh | Para que serve |
|---|---|---|---|
| Double | double | 12.9 | números com vírgula flutuante (é o tipo por defeito dos números com decimais) |
| String | string | "texto" | texto em UTF-8 |
| Object | object | { a: 1 } | documento incorporado |
| Array | array | [1, 2] | lista de valores |
| ObjectId | objectId | ObjectId() | identificador gerado pelo MongoDB |
| Boolean | bool | true | verdadeiro ou falso |
| Date | date | new Date("2026-11-13") | data e hora |
| Null | null | null | valor nulo |
| 32-bit integer | int | NumberInt(7) | inteiro de 32 bits |
| 64-bit integer | long | NumberLong("9007199254740993") | inteiro de 64 bits |
| Decimal128 | decimal | Decimal128("9.99") | decimal exato, para dinheiro |

Pede ao servidor o tipo de cada campo com o operador `$type` (`aggregate` é matéria do módulo 04; por agora lê o resultado):

    db.tipos.aggregate([{ $project: { _id: 0,
      preco: { $type: "$preco" }, stock: { $type: "$stock" },
      visitas: { $type: "$visitas" }, criado: { $type: "$criado" },
      etiquetas: { $type: "$etiquetas" }, medidas: { $type: "$medidas" },
      nada: { $type: "$nada" }, id: { $type: "$_id" } } }])

Resultado real:

    [ { preco: 'decimal', stock: 'int', visitas: 'long', criado: 'date',
        etiquetas: 'array', medidas: 'object', nada: 'null', id: 'objectId' } ]

### Datas

O tipo Date é, segundo a documentação, um inteiro de 64 bits com os milissegundos desde 1 de janeiro de 1970 (UTC). Guarda sempre datas como Date e não como texto: só assim se ordenam e comparam bem.

### Números: double, int, long e Decimal128

Um número escrito sem mais nada no `mongosh` é um double. Os doubles têm a imprecisão habitual da vírgula flutuante binária. Na nossa execução, guardámos `0.1 + 0.2` e um `Decimal128("0.1")`:

    { a: 0.30000000000000004, b: Decimal128('0.1') }

A documentação descreve o Decimal128 como uma representação decimal de 128 bits para números muito grandes ou muito precisos, quando o arredondamento importa. Para dinheiro, é o tipo certo. A loja usa double nos preços por simplicidade; o módulo 03 volta a isto.

### Arrays e documentos incorporados

Um campo pode ser um array (`etiquetas`) ou um documento (`medidas`). Filtras dentro deles com o valor ou com um caminho com pontos: `{ etiquetas: "casa" }` e `{ "medidas.altura": { $gt: 9 } }` encontraram ambos a Caneca. As consultas em detalhe ficam para o módulo 02.

## O campo _id

Cada documento de uma coleção normal precisa de um `_id` único, que funciona como chave primária. Se o omitires, o driver gera um ObjectId. As regras que a documentação indica: o valor tem de ser único na coleção, é imutável e pode ter qualquer tipo exceto array (e expressão regular).

O ObjectId tem 12 bytes. Segundo a documentação, começa com um timestamp de 4 bytes (segundos desde a época Unix), seguido de um valor aleatório de 5 bytes gerado uma vez por processo cliente e de um contador. Como o timestamp vem primeiro, os ObjectId ordenam-se aproximadamente pela criação, e consegues extrair a data:

    db.pedidos_teste.findOne()._id.getTimestamp()
    // ISODate('2026-11-13T18:50:54.000Z')

Como a loja foi importada de ficheiros sem `_id`, cada documento ganhou o seu: o `ObjectId` do cliente 1 foi `ObjectId('6af75b99164e55eb8a3ba99f')` na nossa máquina; na tua será outro.

Podes escolher o teu `_id`, de qualquer tipo permitido, incluindo um documento composto. O que tentámos e o que o servidor respondeu:

    db.cod.insertOne({ _id: "A1", n: 1 })
    db.cod.insertOne({ _id: "A1", n: 2 })
    // 11000 E11000 duplicate key error collection: exercicio.cod index: _id_ dup key: { _id: "A1" }

    db.cod.updateOne({ _id: "A1" }, { $set: { _id: "B2" } })
    // 66 ... would modify the immutable field '_id'

    db.cod.insertOne({ _id: [1, 2] })
    // 53 The '_id' value cannot be of type array

O índice `_id_` existe sempre e é o que garante a unicidade (`db.sku.getIndexes()` mostra-o). Índices são o tema do módulo 05.

**ATENÇÃO:** o `_id` não se altera. Se te enganaste, apagas o documento e inseres outro. E não confundas o `_id` com o campo `id` da loja, que é só um campo normal vindo dos dados originais.

## O ambiente: MongoDB com Docker Compose

Vais usar um ficheiro Compose com um serviço `mongo`. Está em `01-Conceitos-e-Ambiente/exemplos/docker-compose.yml`, e é este, na íntegra:

    services:
      mongo:
        image: mongo:8
        ports:
          - "127.0.0.1:${MONGO_PORT:-27017}:27017"
        volumes:
          - dados:/data/db
          - config:/data/configdb
          - ./loja_json:/dados-loja:ro
        healthcheck:
          test: ["CMD-SHELL", "mongosh --quiet --eval \"db.adminCommand('ping').ok\" | grep -q 1"]
          interval: 5s
          timeout: 5s
          retries: 12
          start_period: 10s

    volumes:
      dados:
      config:

(no ficheiro real há comentários a explicar cada linha). Peça a peça:

| Linha | O que faz |
|---|---|
| image: mongo:8 | imagem oficial, série 8. Em produção fixa a versão completa |
| ports com 127.0.0.1 | publica a porta só no teu computador, não na rede. A variável MONGO_PORT escolhe a porta do anfitrião, com 27017 por defeito |
| dados:/data/db | volume nomeado onde o mongod guarda os ficheiros de dados |
| config:/data/configdb | a imagem declara este caminho como volume; nomeá-lo evita que o Docker crie um volume anónimo com nome aleatório |
| ./loja_json:/dados-loja:ro | pasta do teu computador, montada só de leitura, com os JSON da loja |
| healthcheck | corre um ping ao servidor; o Compose só o considera saudável quando responde |

A imagem corre o servidor na porta 27017 e guarda os dados em `/data/db` (foi o que usámos e funcionou; confirma os detalhes na página da imagem). Usamos um volume nomeado, gerido pelo Docker, em vez de uma pasta do teu computador, porque assim o Docker trata do local de armazenamento e `down -v` limpa tudo.

**NOTA:** neste curso usamos só o `mongosh` na linha de comandos. Existe o MongoDB Compass, uma interface gráfica oficial (ligação nas fontes). Não o instalámos nem testámos, e não pusemos nenhuma interface web no Compose porque não verificámos nenhuma imagem para o efeito.

### Arrancar: docker compose up

Entra na pasta e arranca. A opção `-p` dá um nome ao projeto, que prefixa os contentores, redes e volumes; `--wait` espera pelo healthcheck. No Git Bash:

    cd 01-Conceitos-e-Ambiente/exemplos
    MONGO_PORT=31010 docker compose -p est-mg01 up -d --wait

No PowerShell, define a variável antes: `$env:MONGO_PORT=31010`. O resultado real, no fim:

     Volume est-mg01_dados Created
     Network est-mg01_default Created
     Container est-mg01-mongo-1 Created
     Container est-mg01-mongo-1 Healthy

    docker compose -p est-mg01 ps
    est-mg01-mongo-1   mongo:8   mongo   Up 6 seconds (healthy)   127.0.0.1:31010->27017/tcp

Confirma que os dados estão em volumes nomeados e que não nasceu nenhum volume anónimo. Listámos os volumes do projeto com `docker volume ls`: apareceram só `est-mg01_config` e `est-mg01_dados`. E `docker inspect` mostrou três montagens: o bind só de leitura `/dados-loja`, o volume `est-mg01_config` em `/data/configdb` e o volume `est-mg01_dados` em `/data/db`.

**ATENÇÃO:** sem a linha `config:/data/configdb`, a imagem cria um volume anónimo (nome hexadecimal) que o `docker compose down -v` até remove, mas que `docker rm` de um contentor solto deixa para trás. Ao remover contentores soltos usa `docker rm -v`.

## mongosh: ligar e comandos básicos

O `mongosh` está dentro da imagem. Abre uma sessão interativa no serviço:

    docker compose -p est-mg01 exec mongo mongosh

Fora do Docker, instalas o `mongosh` à parte (ligação nas fontes) e ligas-te com `mongosh "mongodb://localhost:31010"`. Neste curso ligamos-nos sempre dentro do contentor. Os comandos básicos:

| Comando | O que faz |
|---|---|
| show dbs | lista as bases de dados com dados |
| use loja | passa a trabalhar na base de dados loja (só na sessão interativa) |
| show collections | lista as coleções da base atual |
| db | mostra o nome da base atual |
| db.clientes.countDocuments() | conta os documentos da coleção |
| db.clientes.findOne() | devolve um documento |
| db.version() | versão do servidor (8.3.17) |
| exit | sai |

Em scripts e em `--eval`, `use` não funciona; escreve `db = db.getSiblingDB("loja")`. Num servidor acabado de arrancar, `show dbs` dá `admin`, `config` e `local`. São internas do MongoDB; não as uses para os teus dados.

## Importar a loja com mongoimport

Os ficheiros da loja estão em `exemplos/loja_json/` (e em `00-Introducao/dados/loja_json/`). São arrays JSON, e as datas usam Extended JSON, uma convenção que permite escrever tipos BSON em JSON:

    { "id": 1, "nome": "Ana Ribeiro", "email": "ana.ribeiro@exemplo.pt",
      "cidade": "Lisboa", "data_registo": { "$date": "2024-01-15T00:00:00Z" } }

O `mongoimport` converte `{ "$date": ... }` num Date de verdade. Como o Compose montou a pasta em `/dados-loja`, importas direto:

    for c in categorias clientes produtos encomendas linhas_encomenda; do
      docker compose -p est-mg01 exec mongo mongoimport --db loja --collection $c --jsonArray --file /dados-loja/$c.json
    done

Cada importação respondeu `N document(s) imported successfully. 0 document(s) failed to import.`, com N igual a 3, 8, 10, 12 e 26 (as cinco coleções, pela ordem do ciclo). A opção `--jsonArray` diz que o ficheiro é um único array JSON. Sem ela o `mongoimport` espera um documento por linha. No PowerShell troca o ciclo por um `foreach ($c in 'categorias','clientes',...)`.

**ATENÇÃO:** o `mongoimport` não é idempotente. Os ficheiros não têm `_id`, por isso importar duas vezes cria 16 clientes em vez de 8 (foi o que vimos). Para recomeçar uma coleção usa `--drop`, que a apaga antes de importar: depois ficam 8.

Confere o resultado dentro do `mongosh`:

    db = db.getSiblingDB("loja")
    db.getCollectionNames().sort().forEach(n => print(n, db[n].countDocuments()))
    categorias 3
    clientes 8
    encomendas 12
    linhas_encomenda 26
    produtos 10

### Ver um documento real

    db.clientes.findOne({ id: 8 })
    {
      _id: ObjectId('6af75b99164e55eb8a3ba9a1'),
      id: 8,
      nome: 'Hugo Teixeira',
      email: null,
      cidade: 'Lisboa',
      data_registo: ISODate('2024-11-20T00:00:00.000Z')
    }

Repara no `_id` gerado, no `email` nulo (de propósito) e na data como `ISODate`. O tamanho do documento do produto 1 medido com `bsonsize(db.produtos.findOne({ id: 1 }))` foi de 101 bytes, como no módulo 00.

## Persistência: o volume sobrevive ao down

O ponto principal do volume nomeado: apagar o contentor não apaga os dados. Alterámos o stock do produto 6 (Teclado Mecânico, que estava a 0):

    db.getSiblingDB("loja").produtos.updateOne({ id: 6 }, { $set: { stock: 15 } })

Depois derrubámos o ambiente sem `-v`:

    docker compose -p est-mg01 down
     Container est-mg01-mongo-1 Removed
     Network est-mg01_default Removed

O contentor e a rede desapareceram, mas `docker volume ls` continuou a mostrar `est-mg01_config` e `est-mg01_dados`. Ao subir de novo com `up -d --wait`:

    db.getSiblingDB("loja").produtos.findOne({ id: 6 }, { _id: 0, nome: 1, stock: 1 })
    { nome: 'Teclado Mecânico', stock: 15 }

Os dados estavam lá, com a alteração. Sem volume nomeado teriam desaparecido com o contentor.

Resumindo: `docker compose stop` pára e mantém tudo; `docker compose down` remove contentor e rede mas mantém os volumes; `docker compose down -v` remove também os volumes.

**DICA:** `down -v` é o teu botão de recomeçar do zero. Foi o que fizemos no fim: `docker compose -p est-mg01 down -v` removeu os dois volumes e a rede, e ao subir outra vez `show dbs` mostrou só `admin`, `config` e `local`, sem a loja.

**ATENÇÃO:** `down -v` apaga os dados sem perguntar. Num ambiente com dados que importam, faz antes uma cópia (módulo 07).

## Exercícios

**PRATICAR:** faz os exercícios 1 a 4 do módulo 09 (ambiente Compose e importação, tipos BSON, o campo _id, persistência do volume). Resolve-os na tua máquina e só depois consultas o gabarito.

## Fontes oficiais

- Documentos: https://www.mongodb.com/docs/manual/core/document/
- Bases de dados e coleções: https://www.mongodb.com/docs/manual/core/databases-and-collections/
- Tipos BSON: https://www.mongodb.com/docs/manual/reference/bson-types/
- ObjectId: https://www.mongodb.com/docs/manual/reference/method/ObjectId/
- Operador $type: https://www.mongodb.com/docs/manual/reference/operator/query/type/
- Extended JSON: https://www.mongodb.com/docs/manual/reference/mongodb-extended-json/
- Índices únicos: https://www.mongodb.com/docs/manual/core/index-unique/
- Limites do MongoDB: https://www.mongodb.com/docs/manual/reference/limits/
- Especificação BSON: https://bsonspec.org/
- MongoDB Shell (mongosh): https://www.mongodb.com/docs/mongodb-shell/
- mongoimport: https://www.mongodb.com/docs/database-tools/mongoimport/
- MongoDB Compass: https://www.mongodb.com/docs/compass/
- Imagem Docker oficial do MongoDB: https://hub.docker.com/_/mongo
- Docker Compose: https://docs.docker.com/compose/
- Volumes no ficheiro Compose: https://docs.docker.com/reference/compose-file/volumes/
- docker compose up: https://docs.docker.com/reference/cli/docker/compose/up/
- docker compose down: https://docs.docker.com/reference/cli/docker/compose/down/
