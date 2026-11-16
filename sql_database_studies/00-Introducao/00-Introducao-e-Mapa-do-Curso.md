# 00 Introdução e mapa do curso

Este curso leva-te do primeiro SELECT às consultas avançadas, sempre com um olho nas diferenças entre os sistemas reais: o que escreves num funciona noutro, e quando não funciona, qual é o erro e como se contorna. Neste módulo não escreves consultas a sério: percebes o terreno, montas o ambiente e conheces a «loja», a base de dados que serve de fio condutor ao curso inteiro.

## O que é uma base de dados relacional

Uma base de dados é um conjunto organizado de dados guardado de forma persistente e acedido por um programa chamado sistema de gestão de bases de dados (SGBD). Num SGBD relacional, os dados vivem em tabelas ligadas entre si por valores em comum. Ao contrário de um ficheiro de texto ou de uma folha de cálculo, o SGBD garante regras de integridade, aceita muitos utilizadores em simultâneo e consegue responder a perguntas sobre milhões de linhas em milissegundos.

O SQL (Structured Query Language) é a linguagem para falar com um SGBD relacional. É declarativa: dizes o que queres (por exemplo, «os clientes de Lisboa») e o sistema decide como o obter, incluindo que índices usar e em que ordem juntar as tabelas. É por isso que a mesma consulta pode ser rápida ou lenta consoante o plano que o sistema escolhe (módulo 07).

O SQL divide-se informalmente em famílias de instruções:

| Família | Para quê | Exemplos | Módulo |
|---|---|---|---|
| Consulta (DQL) | Ler dados | SELECT | 01 a 03 e 06 |
| Manipulação (DML) | Inserir, alterar, apagar | INSERT, UPDATE, DELETE | 04 |
| Definição (DDL) | Criar e alterar a estrutura | CREATE, ALTER, DROP | 05 |
| Controlo de transações (TCL) | Agrupar alterações | COMMIT, ROLLBACK | 04 |

## Tabelas, linhas, colunas e chaves

Uma tabela representa um tipo de coisa do mundo real (clientes, produtos). Cada coluna é uma propriedade com um tipo (texto, inteiro, data, decimal) e cada linha é uma ocorrência concreta. Na tabela clientes da loja, a primeira linha é a cliente Ana Ribeiro, de Lisboa, registada em 2024-01-15.

| Conceito | Significado | Exemplo na loja |
|---|---|---|
| Tabela | Conjunto de linhas com a mesma estrutura | clientes |
| Coluna | Uma propriedade, com tipo | cidade (texto) |
| Linha | Uma ocorrência | Ana Ribeiro, Lisboa |
| Chave primária | Coluna (ou conjunto) que identifica cada linha de forma única | clientes.id |
| Chave estrangeira | Coluna que aponta para a chave primária de outra tabela | encomendas.cliente_id |
| NULL | Ausência de valor (não é zero nem texto vazio) | email do Hugo Teixeira |

**NOTA:** a ordem das linhas numa tabela não existe: o modelo relacional trabalha com conjuntos. Sem ORDER BY, nenhum sistema te garante uma ordem de resultados, mesmo que hoje pareça sempre a mesma. Neste curso, todo o exemplo cujo resultado é mostrado usa ORDER BY.

As chaves são o que torna os dados «relacionais». Em vez de repetires o nome e a cidade do cliente em cada encomenda, guardas só o id do cliente e a chave estrangeira garante que esse id existe. Se o cliente mudar de cidade, alteras uma linha num único sítio.

## O padrão SQL e os dialetos

O SQL é normalizado pela ISO e pela IEC com o número ISO/IEC 9075. O padrão é revisto de poucos em poucos anos (versões conhecidas como SQL-92, SQL:1999, SQL:2003, SQL:2011, SQL:2016 e SQL:2023) e está dividido em partes: o núcleo da linguagem, mais partes para JSON, grafos e outros temas. O texto oficial é pago e não o citamos como fonte neste curso; para estudar, a documentação de cada sistema indica o que segue do padrão.

Porque existem dialetos? Porque o padrão deixa lacunas e chegou depois de os sistemas já existirem. Cada fabricante acrescentou extensões úteis aos seus clientes (tipos próprios, funções de datas, formas de limitar linhas, linguagens de programação internas) e não pode quebrar quem já as usa. Resultado: o núcleo (SELECT, WHERE, JOIN, GROUP BY, INSERT) é praticamente igual em todo o lado, e as diferenças concentram-se nas margens.

**DICA:** aprende primeiro o SQL padrão, que corre em todos os sistemas. Em cada aula do curso há uma secção «Nos outros dialetos» com as diferenças, sempre assinaladas como executadas ou lidas na documentação.

Os sistemas usados no curso:

| Sistema | Versão usada | Perfil | Como o corres |
|---|---|---|---|
| SQLite | 3.45 | Motor embutido, uma biblioteca e um ficheiro, sem servidor | Python (módulo sqlite3) |
| PostgreSQL | 17 | Servidor de código aberto, muito fiel ao padrão e extensível | Docker |
| MySQL | 8.4 | Servidor de código aberto, muito usado na web | Docker |
| SQL Server | 2025 | Servidor da Microsoft, dialeto T-SQL | Docker |

**NOTA:** o Oracle Database (dialeto PL/SQL) e o SAP HANA são também muito usados em empresas, mas não há instâncias deles neste curso. Quando surgirem, aparecem só como nota, claramente marcada como não executada, com ligação à documentação oficial.

## Como vais trabalhar

### SQLite com Python

O Python já traz o SQLite incluído, por isso não instalas nada. Com o ficheiro loja.sql, que acompanha o curso e cria e povoa a loja, bastam três linhas para teres a base de dados em memória:

    import sqlite3
    con = sqlite3.connect(":memory:")
    con.executescript(open("loja.sql", encoding="utf-8").read())

Para fazer uma pergunta à base de dados (executado com SQLite 3.45.3):

    print(sqlite3.sqlite_version)
    for linha in con.execute("SELECT nome, cidade FROM clientes WHERE id <= 3 ORDER BY id"):
        print(linha)

Resultado obtido:

    3.45.3
    ('Ana Ribeiro', 'Lisboa')
    ('Bruno Costa', 'Porto')
    ('Carla Mendes', 'Braga')

Com ":memory:" a base de dados desaparece quando o programa termina, o que é ótimo para estudar: recomeças sempre do zero. Para guardares num ficheiro, troca ":memory:" por um nome, como "loja.db".

**DICA:** abre sempre o ficheiro com encoding="utf-8". O loja.sql tem acentos (Eletrónica, Graça) e, no Windows, a codificação por omissão pode não ser UTF-8.

### Servidores em Docker

PostgreSQL, MySQL e SQL Server correm em contentores Docker. Com o Docker Desktop instalado e a correr, cria os três servidores (as portas do anfitrião foram escolhidas altas para não colidirem com instalações que já tenhas; as palavras-passe são fictícias, só para estudo local):

    docker run -d --name est-pg -e POSTGRES_PASSWORD=Estudo_2026! -p 25432:5432 postgres:17
    docker run -d --name est-mysql -e MYSQL_ROOT_PASSWORD=Estudo_2026! -p 23306:3306 mysql:8.4
    docker run -d --name est-mssql -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD=Estudo_2026! -p 21433:1433 mcr.microsoft.com/mssql/server:2025-latest

Sem volumes nomeados, os dados desaparecem quando removes o contentor. Para este curso é uma vantagem. Espera alguns segundos até os servidores arrancarem e confirma:

    docker ps --format "{{.Names}} {{.Status}}"

Cada servidor traz o seu cliente de linha de comandos, que usas com docker exec:

| Sistema | Cliente | Notas |
|---|---|---|
| PostgreSQL | psql | Utilizador postgres |
| MySQL | mysql | Utilizador root; usa --default-character-set=utf8mb4 |
| SQL Server | /opt/mssql-tools18/bin/sqlcmd | Usa -C (confiar no certificado) e -f 65001 (UTF-8) |

**ATENÇÃO:** no Git Bash do Windows, caminhos que começam por barra (como /opt/...) são reescritos pelo shell antes de chegarem ao docker. Faz export MSYS_NO_PATHCONV=1 antes de docker exec. Se vires acentos trocados no terminal do Windows, o problema costuma ser da consola e não da base de dados.

### Carregar o loja.sql em cada servidor

Cada sistema recebe uma base de dados m00 para este módulo (comandos executados nos três servidores):

    docker exec est-pg psql -U postgres -c "CREATE DATABASE m00"
    docker exec est-mysql mysql -uroot -pEstudo_2026! -e "CREATE DATABASE m00"
    docker exec est-mssql /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P "Estudo_2026!" -Q "CREATE DATABASE m00"

Copia o ficheiro para dentro de cada contentor e executa-o:

    docker cp loja.sql est-pg:/tmp/loja.sql
    docker exec est-pg psql -U postgres -d m00 -q -f /tmp/loja.sql

    docker cp loja.sql est-mysql:/tmp/loja.sql
    docker exec est-mysql sh -c "mysql -uroot -pEstudo_2026! --default-character-set=utf8mb4 m00 < /tmp/loja.sql"

    docker cp loja.sql est-mssql:/tmp/loja.sql
    docker exec est-mssql /opt/mssql-tools18/bin/sqlcmd -C -f 65001 -S localhost -U sa -P "Estudo_2026!" -d m00 -i /tmp/loja.sql

O mesmo ficheiro corre sem alterações nos quatro sistemas, porque só usa SQL comum. Para confirmar, conta as linhas de cada tabela (consulta que ainda não precisas de perceber; no módulo 02 aprendes a agregar):

    SELECT (SELECT COUNT(*) FROM categorias) AS c, (SELECT COUNT(*) FROM clientes) AS cl,
           (SELECT COUNT(*) FROM produtos) AS p, (SELECT COUNT(*) FROM encomendas) AS e,
           (SELECT COUNT(*) FROM linhas_encomenda) AS l

Resultado obtido nos quatro sistemas (SQLite 3.45.3, PostgreSQL 17.12, MySQL 8.4.13 e SQL Server 2025):

| c | cl | p | e | l |
|---|---|---|---|---|
| 3 | 8 | 10 | 12 | 26 |

**DICA:** para experimentares sem escreveres tudo na linha de comandos, podes usar um cliente gráfico (por exemplo o DBeaver), ligando a localhost e às portas 25432 (PostgreSQL), 23306 (MySQL) e 21433 (SQL Server). Confirma na documentação da ferramenta como configurar a ligação; não a testei.

**ATENÇÃO:** quando acabares de estudar, remove só os contentores que criaste (docker rm -fv est-pg est-mysql est-mssql). Nunca uses comandos de limpeza global do Docker (como docker system prune): podes apagar coisas que não são do curso.

## O projeto fio condutor: a loja

Todos os módulos usam a mesma base de dados: a loja online de um pequeno negócio com livros, eletrónica e artigos para a casa. Assim, de módulo para módulo, só muda a pergunta, não os dados.

| Tabela | Linhas | O que guarda | Colunas |
|---|---|---|---|
| categorias | 3 | Famílias de produtos: Livros, Eletrónica, Casa | id, nome |
| clientes | 8 | Quem compra | id, nome, email, cidade, data_registo |
| produtos | 10 | O catálogo | id, nome, categoria_id, preco, stock |
| encomendas | 12 | Um pedido de um cliente numa data | id, cliente_id, data_encomenda, estado |
| linhas_encomenda | 26 | Os produtos de cada encomenda | id, encomenda_id, produto_id, quantidade, preco_unitario |

As relações entre as tabelas, tal como estão declaradas no loja.sql com chaves estrangeiras (cada ligação vai da chave estrangeira para a chave primária que referencia; 1 é o lado «um» e N o lado «muitos»):

    categorias (id PK, nome)
         | 1
         | categoria_id
         | N
    produtos (id PK, nome, categoria_id FK, preco, stock)
         | 1
         | produto_id
         | N
    linhas_encomenda (id PK, encomenda_id FK, produto_id FK, quantidade, preco_unitario)
         | N
         | encomenda_id
         | 1
    encomendas (id PK, cliente_id FK, data_encomenda, estado)
         | N
         | cliente_id
         | 1
    clientes (id PK, nome, email, cidade, data_registo)

Lido em voz alta: uma categoria tem muitos produtos; um cliente faz muitas encomendas; uma encomenda tem muitas linhas; cada linha refere um produto. A tabela linhas_encomenda é o elo entre encomendas e produtos: uma encomenda tem vários produtos e um produto aparece em várias encomendas (relação de muitos para muitos, resolvida por uma tabela intermédia).

Alguns factos dos dados que vais encontrar mais tarde, e que são de propósito:

- O cliente Hugo Teixeira tem email NULL e nunca fez encomendas.
- O produto Teclado Mecânico tem stock 0.
- As encomendas têm quatro estados: entregue, enviada, pendente e cancelada.
- A coluna preco_unitario da linha guarda o preço no momento da compra, que pode diferir do preço atual do produto.

**NOTA:** os valores monetários usam DECIMAL(10,2), e não números de vírgula flutuante, porque os decimais exatos evitam erros de arredondamento em dinheiro. O tema volta no módulo 05.

## Mapa dos módulos

| Módulo | Tema | O que aprendes |
|---|---|---|
| 00 | Introdução e mapa do curso | Conceitos, dialetos, ambiente e a loja (este módulo) |
| 01 | Primeiras consultas | SELECT, WHERE, ORDER BY, limitar linhas, NULL |
| 02 | Agregação e funções | COUNT, SUM, AVG, GROUP BY, HAVING, funções de texto, datas e números |
| 03 | Joins e subconsultas | Juntar tabelas, INNER, LEFT, subconsultas |
| 04 | Modificar dados e transações | INSERT, UPDATE, DELETE, COMMIT, ROLLBACK |
| 05 | Modelação e DDL | Tipos, CREATE TABLE, restrições, normalização |
| 06 | Consultas avançadas | CTE, funções de janela, consultas recursivas |
| 07 | Índices e desempenho | Índices, planos de execução, boas práticas |
| 08 | Dialetos de SQL | Quadro comparativo completo entre os sistemas |
| 09 | SQL em código e objetos | SQL a partir de programas, vistas, procedimentos, gatilhos |
| 10 | Projeto final | Modelar e consultar um caso completo |
| 11 | Exercícios | Todos os exercícios do curso, numerados |
| 12 | Cheat sheet | Resumo de consulta rápida |
| 13 | Gabarito | Soluções dos exercícios |

Os módulos 01 a 09 acabam com quatro exercícios cada; o projeto final tem o seu próprio exercício. Todos estão reunidos no módulo 11 e resolvidos no 13.

## Glossário

| Termo | Significado |
|---|---|
| SGBD | Sistema de gestão de bases de dados: o programa que guarda e serve os dados |
| Servidor | SGBD que corre como processo separado e aceita ligações (PostgreSQL, MySQL, SQL Server) |
| Motor embutido | SGBD que vive dentro do programa, sem servidor (SQLite) |
| Esquema | Conjunto de tabelas e outros objetos de uma base de dados; também designa um espaço de nomes dentro dela |
| Consulta (query) | Uma instrução SQL que lê dados |
| Resultado (result set) | A tabela devolvida por uma consulta |
| Chave primária (PK) | Identifica cada linha de forma única |
| Chave estrangeira (FK) | Referência à chave primária de outra tabela |
| Restrição (constraint) | Regra que a base de dados faz cumprir (NOT NULL, PRIMARY KEY, FOREIGN KEY) |
| NULL | Valor em falta ou desconhecido |
| Transação | Grupo de alterações que ou todas se aplicam ou nenhuma |
| Índice | Estrutura auxiliar que acelera pesquisas |
| Dialeto | Variante do SQL própria de um sistema |
| DDL, DML, DQL | Instruções de definição, manipulação e consulta |

## Como estudar

1. Corre tudo. Copia cada exemplo para o Python ou para o cliente do servidor e confirma que obténs o mesmo resultado. Ler SQL sem o executar ensina metade.
2. Altera um pormenor de cada vez: muda a condição, tira uma coluna, troca a ordem. Perceber porque o resultado mudou vale mais do que decorar sintaxe.
3. Prevê antes de correr. Pensa quantas linhas esperas e quais. Se erraste, descobriste algo.
4. Lê as mensagens de erro. Cada sistema diz o que não percebeu, e as mensagens são diferentes entre dialetos; o curso mostra erros reais de propósito.
5. Faz os exercícios no fim de cada módulo antes de espreitares o gabarito.
6. Começa pelo SQLite, que é mais rápido de arrancar, e experimenta nos servidores quando a aula mostrar diferenças.
7. Recomeça do zero sempre que estragares os dados: com o loja.sql e a base em memória, é questão de segundos.

**PRATICAR:** carrega o loja.sql no SQLite com as três linhas de Python e, no mesmo programa, corre SELECT nome, preco FROM produtos ORDER BY preco. Confirma que o produto mais barato é a Caneca de Cerâmica (6.50). Depois carrega o ficheiro também num dos servidores Docker e compara.

## Fontes oficiais

- SQLite, linguagem SQL suportada: https://www.sqlite.org/lang.html
- SQLite, diferenças face a outros motores de SQL: https://www.sqlite.org/different.html
- Python, módulo sqlite3: https://docs.python.org/3/library/sqlite3.html
- PostgreSQL 17, o que é o PostgreSQL: https://www.postgresql.org/docs/17/intro-whatis.html
- PostgreSQL 17, conformidade com o padrão SQL: https://www.postgresql.org/docs/17/features.html
- MySQL 8.4, compatibilidade com outros sistemas: https://dev.mysql.com/doc/refman/8.4/en/compatibility.html
- SQL Server, referência de Transact-SQL: https://learn.microsoft.com/en-us/sql/t-sql/language-reference
- Docker, referência do docker run: https://docs.docker.com/engine/containers/run/
- Oracle Database (nota, não executado): https://docs.oracle.com/en/database/oracle/oracle-database/
- SAP HANA (nota, não executado): https://help.sap.com/docs/SAP_HANA_PLATFORM
