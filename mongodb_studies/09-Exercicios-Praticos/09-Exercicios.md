# 9 Exercícios práticos

28 exercícios, quatro por módulo, mais um projeto final. Cada aula indica com **PRATICAR** os exercícios que lhe correspondem. Resolve-os com o MongoDB em Docker (as aulas indicam como o arrancar) e o mongosh. Só consultas o módulo 11 depois de tentares.

## Módulo 01 · Conceitos e ambiente

### Exercício 1 · Montar o ambiente e importar a loja

**Nível:** Iniciante

Usando o ficheiro `01-Conceitos-e-Ambiente/exemplos/docker-compose.yml`, arranca o MongoDB com o nome de projeto `est-mg01` e a porta 31010 do anfitrião, esperando que o healthcheck passe. Importa as cinco coleções da loja para a base de dados `loja` com o `mongoimport` e confirma, no `mongosh`, quantos documentos tem cada coleção. Por fim, lista os volumes do projeto e indica se existe algum volume anónimo.

### Exercício 2 · Tipos BSON com $type

**Nível:** Intermédio

Na base de dados `exercicio`, insere na coleção `pedidos_teste` um documento com os campos `cliente` (texto), `total` (Decimal128 com o valor 19.90), `criado` (Date com 2026-11-13T09:30:00Z) e `itens` (array com dois textos). Sem indicares o `_id`, pede ao servidor o tipo de cada campo, incluindo o do `_id`. Depois escreve uma consulta que devolva só os documentos cujo `total` seja do tipo decimal e extrai a data de criação a partir do `_id`.

### Exercício 3 · O campo _id e os seus erros

**Nível:** Intermédio

Na coleção `cod` da base `exercicio`, insere um documento com `_id: "A1"`. Tenta (a) inserir outro com o mesmo `_id`, (b) alterar o `_id` do primeiro para "B2" com `updateOne` e `$set`, e (c) inserir um documento com `_id` igual a um array. Regista o código e a mensagem de cada erro. Depois insere um documento com um `_id` composto (um documento com `ano` e `seq`) e outro sem `_id`, e mostra a coleção inteira.

### Exercício 4 · Persistência e reimportação

**Nível:** Avançado

Com a loja importada, importa de novo a coleção `clientes` e verifica quantos documentos ficaram. Corrige o estado com a opção certa do `mongoimport` e confirma que voltaste a 8. Altera o stock do produto 6 para 15, faz `docker compose down` (sem `-v`) e sobe outra vez: o valor continua? Faz agora `down -v`, sobe de novo e mostra as bases de dados existentes. No fim, remove tudo e confirma com `docker ps -a`, `docker volume ls` e `docker network ls` que não sobrou nada do projeto.

## Módulo 02 · CRUD

### Exercício 5 · Filtrar a loja

**Nível:** Iniciante

Com a loja importada na base `m02`, escreve no `mongosh` as consultas seguintes. Em todas, mostra só os campos pedidos (sem o `_id`) e usa `sort` para a ordem ser previsível.

1. Nome e preço dos produtos da categoria 2 que têm stock, do mais caro para o mais barato.
2. Clientes do Porto ou de Faro que têm email (o campo não pode ser null). Mostra id, nome e cidade.
3. Encomendas pendentes ou enviadas feitas em abril de 2025 (usa `$gte` e `$lt` com `ISODate`). Mostra id e estado.
4. Produtos com stock inferior a 10 ou preço superior a 80.
5. Os três produtos mais baratos.
6. Quantos clientes não têm email e quantas encomendas estão canceladas.

### Exercício 6 · Arrays e documentos incorporados

**Nível:** Intermédio

Cria a coleção `receitas` com estes quatro documentos:

    db.receitas.insertMany([
      { nome: "Bacalhau com Natas", tags: ["peixe", "forno", "tradicional"], autor: { nome: "Rita", pais: "PT" },
        ingredientes: [{ item: "bacalhau", g: 600 }, { item: "natas", g: 200 }], dificuldade: 3 },
      { nome: "Salada Mista", tags: ["vegetariano", "rápido"], autor: { nome: "Tomás", pais: "PT" },
        ingredientes: [{ item: "alface", g: 150 }, { item: "tomate", g: 300 }], dificuldade: 1 },
      { nome: "Francesinha", tags: ["carne", "forno", "tradicional"], autor: { nome: "Rita", pais: "PT" },
        ingredientes: [{ item: "bife", g: 200 }, { item: "natas", g: 50 }, { item: "queijo", g: 120 }], dificuldade: 4 },
      { nome: "Tarte de Maçã", tags: ["doce", "forno"], autor: { nome: "Luc", pais: "FR" },
        ingredientes: [{ item: "maçã", g: 500 }], dificuldade: 2 }
    ])

Escreve as consultas (devolve só o nome da receita, ordenado por nome):

1. Receitas com as etiquetas «forno» e «tradicional».
2. Receitas de autores de Portugal com dificuldade até 3.
3. Receitas que levam pelo menos 100 g de natas, com `$elemMatch`.
4. A mesma pergunta da alínea 3, mas com `"ingredientes.item"` e `"ingredientes.g"` em separado. O resultado é diferente? Explica porquê.
5. Receitas com exatamente 2 etiquetas.
6. As receitas da Rita, mostrando o nome, o nome do autor e só a primeira etiqueta.
7. Receitas em que o segundo ingrediente (posição 1) é «natas».

### Exercício 7 · Atualizar com operadores

**Nível:** Intermédio

Usa a loja e a coleção `receitas` do exercício anterior. Para cada operação, guarda o resultado e indica `matchedCount`, `modifiedCount` e `upsertedCount`.

1. Repõe 50 unidades de stock do Teclado Mecânico (produto 6) sem ler o valor antes.
2. Define o email do cliente 8 como `hugo.teixeira@exemplo.pt`. Repete a mesma instrução: o que muda nos contadores?
3. Com upsert, cria o cliente 9 (Inês Matos, Faro) e usa `$setOnInsert` para pôr `email: null`. Corre a instrução duas vezes e compara os contadores.
4. Na «Salada Mista», acrescenta as etiquetas «verão» e «fresco» numa só operação e depois remove «rápido».
5. Acrescenta a etiqueta «quente» às receitas que têm «forno», sem duplicar se já existir.
6. Remove o campo `dificuldade` de todas as receitas e confirma quantas ainda o têm.

### Exercício 8 · Substituir, reservar stock e apagar

**Nível:** Avançado

1. Escreve uma função `reservar(qt)` com `findOneAndUpdate` que retira `qt` unidades ao stock do produto 3 (Atlas Mundial) apenas se houver stock suficiente, e devolve o documento depois da alteração (só nome e stock). Quando não houver stock tem de devolver `null`. Chama-a com 4, 7, 6 e 1, por esta ordem, e explica cada resultado.
2. Tenta `updateOne({ id: 1 }, { nome: "Livros e BD" })` na coleção `categorias` e regista o erro. Depois faz a troca certa com `replaceOne` e mostra o documento. O que aconteceu ao `_id`?
3. Apaga a encomenda 4 (cancelada) e as suas linhas. Antes, conta o que vais apagar. No fim, indica quantas encomendas e linhas restam.
4. Executa `db.receitas.deleteMany({})`. A coleção continua a existir? Quantos índices tem? Mostra também que `{ preco: "12.9" }` não encontra nenhum produto, enquanto `{ preco: 12.9 }` encontra um.

## Módulo 03 · Modelação de dados

### Exercício 9 · Incorporar a categoria no produto
**Nível:** Iniciante

Na base `m03` (com as coleções planas da loja), cria a coleção `ex09_produtos` a partir de `produtos`: cada documento deixa de ter `categoria_id` e passa a ter um sub-documento `categoria` com `id` e `nome` (o nome vem da coleção `categorias`). Mostra o produto 4 no novo formato e lista, sem `$lookup`, os nomes dos produtos da categoria Eletrónica. Depois renomeia a categoria «Casa» para «Casa e Cozinha» nos dois modelos (na coleção `categorias` e em `ex09_produtos`) e imprime quantos documentos tiveste de alterar em cada um. Repõe o nome original e apaga `ex09_produtos`. Explica numa frase quando é que esta incorporação compensa.

### Exercício 10 · $lookup e o LEFT JOIN
**Nível:** Intermédio

Parte da coleção `encomendas_v2` criada pelo script `01_remodelar_loja.js` (corre-o antes). Usa `$lookup` para listar todos os clientes com o número de encomendas de cada um (id, nome e contagem), ordenados por id. Mostra os números das encomendas da Ana Ribeiro e do Hugo Teixeira. Responde: que clientes não têm encomendas e porque é que continuam a aparecer no resultado? Escreve (sem executar) a consulta SQL equivalente sobre `loja.sql` e diz que tipo de JOIN corresponde ao `$lookup`.

### Exercício 11 · Validar encomendas com $jsonSchema
**Nível:** Intermédio

Cria a coleção `ex11` com um validador `$jsonSchema` que exige `cliente_id` (int), `estado` (um de `pendente`, `enviada`, `entregue`, `cancelada`) e `linhas` (array com pelo menos um elemento, cada um com `produto_id` int, `quantidade` int maior ou igual a 1 e `preco_unitario` decimal). Insere cinco documentos: um válido, um com estado `perdido`, um sem linhas, um com uma linha de quantidade 0 e preço double e um sem `cliente_id`. Para cada recusa, imprime o código de erro e o campo e a regra que falharam, lidos de `errInfo`. Por fim, conta quantas encomendas de `encomendas_v2` cumpririam o mesmo esquema (usa `$nor` com `$jsonSchema`) e explica porque é que o resultado é tão baixo.

### Exercício 12 · Totais exatos com Decimal128
**Nível:** Avançado

Copia `encomendas_v2` para `ex12`. Com uma única atualização por pipeline (`updateMany` com array de fases), converte o `preco_unitario` de cada linha para Decimal128 (passando pelo texto, com `$toString` e `$toDecimal`) e guarda em `total` a soma de `quantidade * preco_unitario`. Mostra a encomenda 1 e os tipos BSON guardados. Compara o total das encomendas entregues em Decimal128 com a mesma soma feita em double. Aplica 10 por cento de desconto (multiplica por 0.9) aos totais, uma vez em Decimal128 e outra em double, e mostra as encomendas onde o resultado em double traz ruído. Apaga `ex12` no fim.

## Módulo 04 · Aggregation

### Exercício 13 · Estatísticas por categoria
**Nível:** Iniciante

Na base `m04` (loja importada), usa `aggregate` sobre `produtos` para mostrar, por categoria, o nome da categoria, o número de produtos, o preço médio arredondado a 2 casas e o valor total em stock (soma de preço vezes stock, arredondado a 2 casas). Ordena da categoria com mais valor em stock para a que tem menos. Explica porque é que o `$group` vem antes do `$lookup` e não depois.

### Exercício 14 · Receita mensal
**Nível:** Intermédio

Calcula, para cada mês de 2025 (formato `2025-01`), o número de encomendas e a receita (soma de quantidade vezes preço unitário das linhas), excluindo as encomendas canceladas. Mostra o mês, o número de encomendas distintas e a receita arredondada a 2 casas, ordenados por mês. Explica porque é que contar com `$sum: 1` depois do `$unwind` daria um número errado de encomendas.

### Exercício 15 · Produtos mais vendidos
**Nível:** Intermédio

Parte de `linhas_encomenda` e encontra os 3 produtos mais vendidos em unidades (sem contar encomendas canceladas). Mostra o nome do produto, as unidades e a receita arredondada a 2 casas. Desempata por `id` do produto. Depois do `$sort` e do `$limit`, faz o `$lookup` dos nomes: explica porque é que essa ordem é melhor do que juntar os nomes antes de ordenar.

### Exercício 16 · Relatório numa só passagem com $facet
**Nível:** Avançado

Sobre `produtos`, escreve um único pipeline com `$facet` que devolva um documento com três campos: `escaloes` (produtos por escalão de preço com `$bucket`, limites 0, 15, 30 e 60, e um escalão por omissão para o resto, com a contagem e a lista de nomes), `a_repor` (nome e stock dos produtos com stock inferior a 20) e `resumo` (número de produtos e valor total em stock arredondado a 2 casas). Diz o que acontece ao `$bucket` se retirares o `default` e houver produtos com preço fora dos limites.

## Módulo 05 · Índices e desempenho

### Exercício 17 · Do COLLSCAN ao IXSCAN
**Nível:** Iniciante

Prepara a base `m05` com `gerar_dados.js` (100 000 encomendas) e carrega o `plano.js` com `load("plano.js")`. Apaga os índices da coleção `encomendas` (exceto `_id`) com `dropIndexes()`. Mede a consulta das encomendas com `estado` igual a `"enviada"` e `cidade` igual a `"Porto"` com `plano()` e regista o tipo de fase, o `nReturned` e o `totalDocsExamined`. Cria um índice composto que sirva a consulta, mede outra vez e explica a diferença. Depois mede só `cidade: "Porto"` e verifica se o teu índice a serve. Se não serve, cria o índice que falta e mostra que passa a servir.

### Exercício 18 · ESR com limit e com intervalo estreito
**Nível:** Intermédio

Na coleção `encomendas` (sem outros índices), considera a consulta: encomendas com `estado` igual a `"paga"` e `total` entre 100 e 200, ordenadas por `data_encomenda` descendente, só as 10 primeiras. Cria dois índices compostos com os mesmos três campos mas em ordens diferentes, um com a ordem ESR (igualdade, ordenação, intervalo) e outro com igualdade, intervalo, ordenação. Compara-os com `hint` e com a escolha do planeador. Repete com um intervalo estreito (`total` entre 100 e 110) e sem `limit`. Escreve uma conclusão: a regra ESR ganha sempre?

### Exercício 19 · Índices parciais e únicos
**Nível:** Intermédio

Quando um cliente consulta o histórico, vê quase sempre todas as encomendas, mas o suporte procura muito as canceladas. Cria na coleção `encomendas` o índice `{ cliente_id: 1, data_encomenda: -1 }` completo e uma versão parcial só para as encomendas com `estado` igual a `"cancelada"`. Compara o tamanho dos dois (`stats().indexSizes`) e o `explain` da procura das canceladas do cliente 5047 com cada um. Verifica qual índice o planeador usa quando procuras todas as encomendas do cliente 5047. Cria ainda um índice único em `sku` na coleção `produtos` e mostra o erro ao inserir um produto com um `sku` repetido (usa `SKU-000001`).

### Exercício 20 · Perfilador, regex e consulta coberta
**Nível:** Avançado

Na coleção `clientes` deixa só os índices `_id` e um índice único em `email`. Liga o perfilador ao nível 2 na base `m05`, executa três consultas (`nome` a terminar em `23` com regex, um `email` concreto e `cidade` igual a `"Faro"` com projeção de `nome` e `limit(3)`), desliga-o e lê `system.profile` para descobrir quais usaram `COLLSCAN`. Cria o índice `{ nome: 1 }` e compara uma regex ancorada (`/^Cliente 12/`) com uma sem âncora (`/12/`) através das chaves examinadas. Mostra uma consulta coberta sobre o nome e outra sobre `cidade` e `nome`, criando para esta o índice que for preciso.

## Módulo 06 · Drivers e transações

### Exercício 21 · Primeiro CRUD com pymongo
**Nível:** Iniciante

Liga-te com `MongoClient("mongodb://localhost:27117")` à base `m06` e usa uma coleção nova chamada `ex21`. Insere um produto com `insert_one` e mais dois com `insert_many` (campos `id`, `nome`, `preco`, `stock`; um deles com stock 0). Lista os nomes dos produtos com stock, por ordem alfabética. Põe o stock do produto sem stock a 30 com `update_one`, duplica o preço de todos com `update_many` e apaga os que têm stock inferior a 10. Imprime o `matched_count`, o `modified_count` e o `deleted_count` quando existirem, e termina com `drop()` da coleção.

### Exercício 22 · Datas, ObjectId e erros
**Nível:** Intermédio

Escreve uma função `ligar(uri)` que faz `ping` e, se levantar `ServerSelectionTimeoutError`, imprime uma mensagem amigável e devolve `None` (usa `serverSelectionTimeoutMS=1000` e testa com a porta 31069, onde não há nada). Depois, numa coleção `tickets` com índice único em `codigo`, grava tickets com um campo `aberto_em` (`datetime` em UTC): T-1 (2 de novembro de 2026), T-1 outra vez, T-2 (20 de novembro) e T-3 (3 de dezembro). Apanha o `DuplicateKeyError` e imprime uma mensagem. Lista os códigos abertos em novembro de 2026. Por fim, converte o `_id` do T-1 em texto, mostra que procurar pelo texto não encontra nada e que `ObjectId(texto)` encontra, e imprime a data de criação do `ObjectId`.

### Exercício 23 · bulk_write e paginação por intervalo
**Nível:** Intermédio

Com a coleção `produtos` da base `m06`, constrói uma lista de `UpdateOne` que aumenta 10% ao preço (arredondado a 2 casas) de todos os produtos da categoria 2 e aplica-a com um único `bulk_write`. Imprime os valores de `matched_count` e `modified_count` e o preço antes e depois de cada produto, e repõe os preços originais. Em seguida, percorre todos os produtos em páginas de 3, ordenados por `_id`, sem usar `skip`: cada pesquisa continua a partir do `_id` do último documento da página anterior.

### Exercício 24 · Transação com rollback
**Nível:** Avançado

Arranca o replica set do `compose-replset.yml` (porta 31060) e prepara a base `m06` com `00_preparar_loja.py`. Cria a encomenda 200 (cliente 3, estado `pendente`) com duas linhas (2 unidades do produto 4 e 3 do produto 5) e baixa o stock correspondente. Escreve `cancelar(sess, numero, falhar=False)`, executada com `with_transaction`, que passa o estado para `cancelada` (só se estiver `pendente`) e repõe o stock de cada linha; se `falhar` for verdadeiro, levanta uma exceção depois de repor a primeira linha. Mostra o stock e o estado antes, depois da execução que falha (rollback), depois da que tem sucesso e numa terceira tentativa, que deve dar erro.

## Módulo 07 · Operação e segurança

### Exercício 25 · Utilizador só de leitura

**Nível:** Iniciante

Arranca o `compose-auth.yml` do módulo 07 (projeto `est-mg07`). Com o utilizador root, cria na base `loja` o utilizador `analista` com o papel mínimo para apenas ler dados dessa base. Depois: (a) liga-te como `analista` e lista os nomes dos produtos; (b) tenta apagar produtos e regista o erro; (c) cria um utilizador temporário `temp` com `readWrite`, troca-lhe o papel para `read` e apaga-o. No fim, mostra os utilizadores da base `loja`. Limpa com `down -v`.

### Exercício 26 · Cópia com gzip e restauro para outra base

**Nível:** Intermédio

Com a mesma stack, corre o `03_utilizador_backup.js` para criares o utilizador de cópias. Faz uma cópia comprimida da base `loja` para um único ficheiro no volume `copias`, e restaura-a para uma base nova chamada `loja_copia` (sem tocar em `loja`). Mostra o número de documentos nas duas bases, altera um preço na cópia e prova que o original não mudou. Responde: o utilizador de cópias consegue ler a base `loja`? Porquê?

### Exercício 27 · Quando o replica set perde a maioria

**Nível:** Avançado

Arranca o `compose-replset-auth.yml` (3 nós). Pára um secundário e confirma que uma escrita com write concern majority continua a funcionar. Pára também o segundo secundário e observa o que acontece ao antigo primário: estado dos membros, se aceita escritas e se aceita leituras com read preference secondaryPreferred. Volta a arrancar os dois nós e confirma que o conjunto recupera. Explica porque é que 3 nós toleram a perda de 1 mas não de 2.

### Exercício 28 · Ver uma consulta lenta com o profiler

**Nível:** Intermédio

Com a stack de autenticação, insere 20000 encomendas (`id`, `cliente_id` entre 0 e 49, `estado`, `total`) em `loja.encomendas`. Liga o profiler no nível 1 com `slowms` a 0, procura as encomendas do cliente 7, cria um índice em `cliente_id`, repete a procura e compara o `planSummary`, os documentos examinados e as chaves examinadas nas duas entradas de `system.profile`. Desliga o profiler. Mostra ainda que não há operações a correr em `loja` (`currentOp`).

## Projeto final

### Exercício 29 · Catálogo e encomendas da loja em MongoDB

**Nível:** Avançado

Constrói o catálogo e as encomendas da loja em MongoDB, num stack de Docker Compose com replica set e autenticação, com uma aplicação em Python, cinco relatórios por agregação, índices medidos, cópia de segurança restaurada e eleição demonstrada, seguindo o módulo 08.

**PRATICAR:** faz o projeto por fases e usa a grelha do módulo 8 e a consulta rápida do módulo 10.
