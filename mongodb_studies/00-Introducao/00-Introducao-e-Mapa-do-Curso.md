# 00 Introdução e mapa do curso

Este curso ensina MongoDB do zero até ao nível de quem desenha, consulta, otimiza e opera uma base de dados de documentos. Neste módulo percebes o que é o MongoDB, quando faz sentido usá-lo (e quando não), como vais trabalhar, qual é o projeto que atravessa o curso e como está organizado o caminho.

## O que é o MongoDB

O MongoDB é uma base de dados de documentos. A documentação oficial descreve-o como uma base de dados que guarda os dados em «documentos flexíveis, parecidos com JSON», para modelares os dados da mesma forma que o teu código os usa.

- **Documento:** uma estrutura de pares campo e valor. Um valor pode ser um número, texto, data, outro documento (incorporado) ou uma lista (array) de qualquer destes.
- **Coleção:** um conjunto de documentos. É o equivalente aproximado de uma tabela, mas não impõe um esquema rígido definido de antemão.
- **Base de dados:** um conjunto de coleções.

Um documento da loja que vais usar ao longo do curso, tal como o `mongosh` o mostra:

    {
      _id: ObjectId('6af6da990c4fa256e134171b'),
      id: 1,
      nome: 'Ana Ribeiro',
      email: 'ana.ribeiro@exemplo.pt',
      cidade: 'Lisboa',
      data_registo: ISODate('2024-01-15T00:00:00.000Z')
    }

O campo `_id` existe em todos os documentos e é a chave primária da coleção. Se não o indicares, o MongoDB cria-o por ti com um `ObjectId` (o valor acima será diferente na tua máquina). O campo `id` é um número que vem dos dados originais da loja, e é só um campo normal.

### JSON por fora, BSON por dentro

Escreves e lês documentos com aspeto de JSON, mas o MongoDB guarda-os em BSON, um formato binário. A documentação define o BSON como «um formato de serialização binário usado para guardar documentos e fazer chamadas remotas no MongoDB». A vantagem prática é que o BSON tem mais tipos do que o JSON. O JSON não tem datas, nem inteiros distintos de decimais, nem identificadores.

| Tipo BSON | Alias usado em consultas | Exemplo na loja |
|---|---|---|
| Double | double | preco de um produto (12.9) |
| String | string | nome de um cliente |
| Object | object | documento incorporado |
| Array | array | lista de valores |
| ObjectId | objectId | _id gerado automaticamente |
| Date | date | data_registo de um cliente |
| 32-bit integer | int | stock de um produto |
| 64-bit integer | long | números inteiros grandes |
| Decimal128 | decimal | valores monetários exatos |

Podes pedir ao próprio servidor o tipo de cada campo. Este resultado vem do produto 1 e do cliente 8 da loja:

    // produto 1: tipos dos campos id, preco e stock
    { id: 'int', preco: 'double', stock: 'int' }

    // cliente 8: o email é null, a data é um tipo próprio
    { id: 'int', nome: 'string', email: 'null', data_registo: 'date' }

**NOTA:** o tipo `double` guarda decimais em vírgula flutuante binária, tal como em quase todas as linguagens. Para dinheiro, a documentação oferece o `Decimal128`. A loja usa `double` para ser simples; voltas a este ponto na modelação.

### Esquema flexível

Documentos da mesma coleção podem ter campos diferentes. Executámos isto numa coleção temporária:

    db.demo.insertMany([
      { id: 1, nome: "Romance Policial", preco: 12.9 },
      { id: 2, nome: "Camisola", preco: 25,
        tamanhos: ["S", "M", "L"], marca: { nome: "Exemplo", pais: "PT" } }
    ])

Os dois documentos ficaram na mesma coleção, sem nenhuma alteração prévia à estrutura. Em SQL, acrescentar a coluna `tamanhos` e uma estrutura para a marca exigiria alterar a tabela.

**ATENÇÃO:** flexível não quer dizer «sem regras». Se cada programa escrever os campos à sua maneira, acabas com `preco` como número num documento e como texto noutro. O MongoDB permite impor regras de validação, que vês no curso, e a disciplina de modelação é tua.

### Tamanho e limites

A documentação indica que o tamanho máximo de um documento BSON é de 16 MiB e que há no máximo 100 níveis de incorporação. Para ficheiros maiores recomenda o GridFS. Um produto da loja ocupa bem menos: o documento do produto 1 tem 101 bytes (medido com `bsonsize` no `mongosh`, incluindo o `_id`).

## Relacional vs documentos

Nem um nem outro é «melhor». São modelos com pontos fortes diferentes, e muitas aplicações usam os dois.

| Aspeto | Relacional (SQL) | MongoDB (documentos) |
|---|---|---|
| Unidade de dados | linha numa tabela | documento numa coleção |
| Esquema | definido antes, igual para todas as linhas | flexível por defeito, validação opcional |
| Relações | chaves estrangeiras e JOIN, com integridade garantida pelo motor | referências por valor ou documentos incorporados; o motor não impõe chaves estrangeiras |
| Dados que se lêem juntos | vários JOIN | podem viver num só documento |
| Linguagem | SQL, padronizada e muito difundida | consultas em documentos e aggregation pipeline, específicas do MongoDB |
| Transações | maduras e centrais | existem transações multidocumento ACID, mas o modelo incentiva a evitá-las quando um documento chega |
| Consultas ad hoc com muitas junções | muito naturais | possíveis com aggregation, mas menos naturais |
| Evolução da estrutura | alteração do esquema (migração) | campos novos aparecem sem migração, mas dados antigos continuam com a forma antiga |
| Escala horizontal | possível, mas depende do sistema | sharding faz parte do MongoDB |

Um exemplo do dia a dia. A mesma encomenda na loja pode estar partida por duas coleções (como nos dados de arranque) ou num só documento com as linhas incorporadas. Este segundo formato foi inserido e lido de volta numa coleção temporária:

    {
      id: 1,
      cliente_id: 1,
      estado: 'entregue',
      linhas: [
        { produto_id: 1, quantidade: 2, preco_unitario: 12.9 },
        { produto_id: 5, quantidade: 1, preco_unitario: 14.9 }
      ]
    }

Ler a encomenda com as suas linhas passa a ser uma única leitura. O custo é duplicar ou repetir dados quando a mesma informação aparece em muitos sítios. Decidir entre incorporar e referenciar é o tema do módulo 03.

### Quando não usar o MongoDB

- **Dados fortemente relacionais com muitas junções entre entidades**, como contabilidade ou faturação, onde a integridade referencial imposta pelo motor é uma garantia que queres ter de graça.
- **Relatórios analíticos ad hoc** escritos por muita gente em SQL, sobre um esquema bem conhecido. Ferramentas e competências de SQL são muito mais comuns.
- **A equipa já domina SQL e os dados cabem bem em tabelas.** Trocar de tecnologia sem um problema concreto tem custo e pouco benefício.
- **Dados que são naturalmente um grafo** (relações de amizade com percursos de muitos saltos). Uma base de dados de grafos serve melhor.
- **Uma única ficheiro ou um caso muito pequeno:** para dados locais e simples, o SQLite pode chegar.

**ATENÇÃO:** «MongoDB não tem esquema» e «MongoDB não tem JOIN» são meias verdades que levam a más decisões. Há validação de esquema opcional e o aggregation pipeline consegue juntar coleções. Em compensação, juntar coleções é mais trabalhoso do que um JOIN, e por isso a modelação conta mais do que em SQL.

**NOTA:** a mesma consulta nos dois mundos. Para «clientes de Lisboa» escreves, em SQL, `SELECT nome FROM clientes WHERE cidade = 'Lisboa'` (escrito à mão, não executado aqui) e, no MongoDB:

    db.clientes.find({ cidade: "Lisboa" }, { _id: 0, nome: 1 }).sort({ id: 1 })
    // [ { nome: 'Ana Ribeiro' }, { nome: 'Diogo Pires' }, { nome: 'Hugo Teixeira' } ]

Sem o `sort`, o MongoDB não garante a ordem dos resultados: na nossa execução sem `sort` o Hugo apareceu primeiro.

## Onde se usa

A documentação apresenta o MongoDB como uma base de dados operacional, isto é, a que serve diretamente as aplicações, com suporte para transações multidocumento, agregações, pesquisa de texto, pesquisa vetorial, consultas geoespaciais e séries temporais. Os casos em que o modelo de documentos costuma encaixar bem:

- catálogos de produtos, em que cada tipo de produto tem atributos diferentes;
- perfis de utilizadores e conteúdos com estrutura variável;
- aplicações em que o objeto da base de dados corresponde ao objeto do código e se lê sempre de uma vez;
- dados de eventos e métricas, quando o volume cresce e a estrutura muda ao longo do tempo.

Não citamos empresas nem números de adoção: não os verificámos. O teu critério deve ser a forma dos teus dados e das tuas consultas.

## Versões e edições

O que a documentação oficial diz e o que usamos:

- Os números de versão têm a forma X.Y.Z (maior, menor, correção). Os drivers, a shell `mongosh` e as ferramentas de base de dados têm versões independentes das do servidor.
- Cada versão maior é suportada durante cinco anos, e há um período opcional de dois anos de suporte alargado para clientes Enterprise Advanced.
- Na consulta que fizemos à documentação em 13 de novembro de 2026, a série 9.0 aparece como a versão estável atual, e as 8.3, 8.0 e 7.0 como versões estáveis anteriores. **Este curso corre na versão 8.3.17**, obtida com a imagem Docker `mongo:8`. A documentação dá sempre a versão a escolher no canto da página; quando uma funcionalidade depender da versão, diz-se na aula.
- Em produção deves fixar a versão exata e planear as atualizações, em vez de usar uma etiqueta que muda.

| Edição | O que é | Nota |
|---|---|---|
| Community | servidor autogerido; a documentação descreve-o como «desenvolver localmente, sem custo» | é o que usas neste curso, via Docker |
| Enterprise Advanced | servidor autogerido, na tua infraestrutura | edição comercial; confirma na documentação as funcionalidades e as condições |
| Atlas | serviço de base de dados na nuvem que corre em AWS, Azure e Google Cloud e trata de provisionar, atualizar, copiar e monitorizar | a documentação refere clusters Free e Flex; confirma limites e preços no site |

A documentação diz que as versões chegam primeiro ao Atlas e só depois ao servidor autogerido, e que as mesmas interfaces, drivers e ferramentas funcionam nos dois.

**NOTA:** a página da imagem Docker oficial indica que o MongoDB é publicado sob uma combinação da Server Side Public License (SSPL) e da licença Apache, e que a mudança de AGPL para SSPL foi para as versões posteriores a 16 de outubro de 2018. Para usar o servidor numa empresa ou num produto, lê a licença com quem decide: este curso não é aconselhamento jurídico.

## Como vais trabalhar

Três ferramentas, todas gratuitas:

| Ferramenta | Para quê | Versão usada na escrita do curso |
|---|---|---|
| Docker Desktop com Compose | correr o servidor MongoDB sem instalar nada no sistema | Docker 29.9.3 e Compose v5.7.0 |
| mongosh | shell interativa do MongoDB, em JavaScript | 2.14.2 (vem na imagem oficial) |
| Python com pymongo | usar o MongoDB a partir de um programa | Python 3.13.0 e pymongo 4.20.0 |

O servidor corre num contentor (módulo 01 mostra o ficheiro `docker-compose.yml` completo). Os dados ficam num volume Docker, por isso sobrevivem a reinícios do contentor e podes apagá-los quando quiseres recomeçar.

O mesmo documento visto no Python (resultado real, contra o servidor 8.3.17):

    from pymongo import MongoClient
    client = MongoClient("mongodb://localhost:27117")
    db = client["m00"]
    print(db.clientes.find_one({"id": 1}, {"_id": 0}))
    # {'id': 1, 'nome': 'Ana Ribeiro', 'email': 'ana.ribeiro@exemplo.pt',
    #  'cidade': 'Lisboa', 'data_registo': datetime.datetime(2024, 1, 15, 0, 0)}

Repara que o tipo `date` do BSON chega ao Python como `datetime`. O porto 27117 é o do servidor usado para escrever esta aula; o teu será o que definires no Compose. O pymongo instala-se com `pip install pymongo`, de preferência num ambiente virtual.

**NOTA:** o curso usa Python como linguagem principal dos exemplos de programação. Existem drivers oficiais para outras linguagens (por exemplo Node.js); consulta a documentação do driver da tua linguagem. Aqui não os executámos.

### Pré-requisitos

- **Docker a funcionar.** Confirma no terminal que ambos os comandos respondem. No nosso computador deram Docker version 29.9.3 (build 5457199) e Docker Compose version v5.7.0. A instalação do Docker Desktop está descrita em https://docs.docker.com/desktop/. Se o Docker não arrancar, o resto do curso não corre:

        docker --version
        docker compose version

- **Noções de bases de dados:** o que é uma tabela, uma chave primária, um filtro e uma ordenação. Saber SQL ajuda nas comparações, mas não é obrigatório.
- **Python básico** (variáveis, ciclos, funções, dicionários) para os módulos 06 e 08. Se precisares, faz primeiro o curso de Python.
- **Um editor de texto** e um terminal. No Windows, o Git Bash ou o PowerShell servem.

**DICA:** se o terminal mostrar acentos errados (por exemplo `Eletr├│nica`), é a consola do Windows e não os dados. Confirma com o Python ou com o `mongosh` num terminal em UTF-8 antes de procurares um erro nos dados.

## O projeto fio condutor: a loja

Todos os módulos usam a mesma «loja» online, os mesmos dados do curso de SQL. Isto permite comparar, módulo a módulo, a mesma pergunta nos dois mundos. Nos dados de arranque, o modelo é «plano»: uma coleção por tabela. No módulo 03 vais remodelá-lo para tirar partido dos documentos.

| Coleção | Documentos | Campos principais |
|---|---|---|
| categorias | 3 | id, nome |
| clientes | 8 | id, nome, email, cidade, data_registo |
| produtos | 10 | id, nome, categoria_id, preco, stock |
| encomendas | 12 | id, cliente_id, data_encomenda, estado |
| linhas_encomenda | 26 | id, encomenda_id, produto_id, quantidade, preco_unitario |

Os números foram contados no servidor, depois de importar os ficheiros JSON da loja. As ligações entre coleções são feitas por campos como `cliente_id` e `produto_id`, que guardam o valor do `id` da outra coleção. O MongoDB não verifica estas referências: a integridade fica por tua conta.

Os dados têm de propósito alguns casos para explorar mais tarde: um cliente sem email (o cliente 8 tem `email: null`), um produto sem stock (o 6, Teclado Mecânico) e encomendas em quatro estados (`pendente`, `enviada`, `entregue` e `cancelada`). Exemplo de uma encomenda e das suas linhas, tal como estão nas coleções planas:

    // db.encomendas.findOne({ id: 1 }, { _id: 0 })
    { id: 1, cliente_id: 1, data_encomenda: ISODate('2025-01-10T00:00:00.000Z'), estado: 'entregue' }

    // db.linhas_encomenda.find({ encomenda_id: 1 }, { _id: 0 })
    { id: 1, encomenda_id: 1, produto_id: 1, quantidade: 2, preco_unitario: 12.9 }
    { id: 2, encomenda_id: 1, produto_id: 5, quantidade: 1, preco_unitario: 14.9 }

Para saber o nome do produto de uma linha precisas de ir à coleção `produtos`. Em SQL farias um JOIN; em MongoDB há duas respostas, incorporar ou juntar com aggregation, e os módulos 03 e 04 mostram ambas.

## Mapa dos módulos

| Módulo | Tema | O que fazes |
|---|---|---|
| 00 | Introdução e mapa do curso | percebes o modelo e o plano (este módulo) |
| 01 | Conceitos e ambiente | montas o servidor com Docker Compose, ligas-te com mongosh e importas a loja |
| 02 | CRUD | inserir, consultar, atualizar e apagar documentos, com filtros e operadores |
| 03 | Modelação de dados | incorporar ou referenciar, padrões de modelação, validação de esquema |
| 04 | Aggregation | pipelines de agregação: filtrar, agrupar, juntar coleções e calcular |
| 05 | Índices e desempenho | criar índices, ler planos de execução, perceber o que torna uma consulta lenta |
| 06 | Drivers e transações | usar o pymongo e executar transações multidocumento |
| 07 | Operação e segurança | autenticação, cópias de segurança, replica sets |
| 08 | Projeto final | juntas tudo numa aplicação sobre a loja |
| 09 | Exercícios práticos | exercícios dos módulos 01 a 08, reunidos |
| 10 | Cheat sheet | consulta rápida de comandos e operadores |
| 11 | Gabarito | soluções comentadas dos exercícios |

O caminho é cumulativo: não saltes os módulos 01 a 03, porque os seguintes assumem que tens o ambiente a funcionar e que percebes o modelo de documentos.

## Glossário

| Termo | Significado |
|---|---|
| Documento | registo do MongoDB: pares campo e valor, com aspeto de JSON |
| Coleção | conjunto de documentos, parecido com uma tabela |
| Base de dados | conjunto de coleções |
| BSON | formato binário em que os documentos são guardados, com mais tipos do que o JSON |
| _id | campo obrigatório que identifica o documento na coleção; é único |
| ObjectId | tipo de 12 bytes usado por defeito para o _id |
| Documento incorporado | documento guardado dentro de outro documento |
| Array | lista de valores dentro de um campo |
| Referência | campo que guarda o identificador de um documento de outra coleção |
| Esquema | a estrutura esperada dos documentos; no MongoDB é flexível, com validação opcional |
| Aggregation pipeline | sequência de passos que transforma e agrega documentos |
| Índice | estrutura que acelera consultas sobre certos campos |
| Replica set | grupo de servidores que mantêm cópias dos mesmos dados, com eleição de novo primário se o atual falhar |
| Sharding | distribuição dos dados por vários servidores com base numa chave de partilha |
| Atlas | serviço MongoDB na nuvem |
| mongosh | shell interativa do MongoDB |
| Driver | biblioteca que liga a tua linguagem ao servidor (no curso, pymongo) |

**NOTA:** o `ObjectId` tem 12 bytes. Esta definição não foi confirmada na documentação durante a escrita desta aula; confirma na página de tipos BSON, nas fontes abaixo.

## Como estudar

1. **Segue a ordem.** Cada módulo parte do anterior.
2. **Escreve os comandos em vez de os copiar.** Errar e ler a mensagem do servidor ensina mais do que colar.
3. **Corre sempre o exemplo na tua máquina** e compara com o resultado que aparece na aula. Os valores como o `_id` serão diferentes.
4. **Usa a mesma pergunta nos dois mundos.** Se sabes SQL, escreve primeiro a consulta em SQL e depois em MongoDB.
5. **Faz os exercícios do módulo 09** à medida que terminas cada módulo, e só consultas o gabarito (módulo 11) depois de tentares.
6. **Lê a documentação oficial** no fim de cada aula: as ligações estão em «Fontes oficiais» e a documentação é o árbitro quando uma versão diferir.
7. **Apaga e recomeça.** Como o ambiente corre em Docker, podes destruir o volume e reimportar a loja sempre que quiseres um estado limpo.

**PRATICAR:** antes de passares ao módulo 01, confirma que `docker --version` e `docker compose version` respondem no teu terminal e que sabes explicar, por palavras tuas, a diferença entre um documento, uma coleção e uma tabela.

## Fontes oficiais

- Introdução ao MongoDB: https://www.mongodb.com/docs/manual/introduction/
- Tipos BSON: https://www.mongodb.com/docs/manual/reference/bson-types/
- Especificação BSON: https://bsonspec.org/
- Limites do MongoDB (tamanho do documento): https://www.mongodb.com/docs/manual/reference/limits/
- Modelação de dados, introdução: https://www.mongodb.com/docs/manual/core/data-modeling-introduction/
- Transações: https://www.mongodb.com/docs/manual/core/transactions/
- Versões e caminhos de atualização: https://www.mongodb.com/docs/mongodb-versions/
- Notas de versão: https://www.mongodb.com/docs/manual/release-notes/
- Instalar o MongoDB Community: https://www.mongodb.com/docs/manual/administration/install-community/
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Imagem Docker oficial: https://hub.docker.com/_/mongo
- MongoDB Shell (mongosh): https://www.mongodb.com/docs/mongodb-shell/
- Driver PyMongo (MongoDB): https://www.mongodb.com/docs/languages/python/pymongo-driver/current/
- PyMongo: https://pymongo.readthedocs.io/
- mongoimport: https://www.mongodb.com/docs/database-tools/mongoimport/
- Docker Desktop: https://docs.docker.com/desktop/
- Docker Compose: https://docs.docker.com/compose/
