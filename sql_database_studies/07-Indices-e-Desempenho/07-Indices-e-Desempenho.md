# 07 Índices e desempenho

Com 8 clientes na loja, qualquer consulta é instantânea. Com 100 000 pedidos, a diferença entre uma consulta que lê tudo e uma que vai direta à linha certa passa de 8 milissegundos para 0,05. Neste módulo aprendes o que é um índice, quanto custa, como ler o plano que a base de dados escolhe e que consultas impedem o uso de um índice.

Todos os números vêm de execuções reais: SQLite 3.45.3, PostgreSQL 17, MySQL 8.4 e SQL Server 2025, numa máquina de estudo, com os dados já em memória. Os tempos absolutos mudam de máquina para máquina; o que interessa é a ordem de grandeza e a forma do plano.

## O que é um índice

Um índice é uma estrutura à parte, mantida pela base de dados, que guarda os valores de uma ou mais colunas ordenados, cada um com a indicação de onde está a linha. A estrutura habitual é a B-tree (árvore equilibrada): um índice por níveis, como o índice remissivo de um livro. Em vez de folhear as 100 000 linhas, a base desce 3 ou 4 níveis da árvore e chega à folha com o valor procurado. Como os valores estão ordenados, também serve para intervalos (BETWEEN, datas) e para devolver resultados já ordenados.

Sem índice, a base só tem uma opção: ler a tabela inteira e testar cada linha (varrimento completo, scan). Com índice, pode fazer uma procura (seek, search).

Para os exemplos usamos uma tabela grande, `pedidos`, ao lado da loja. Tem 100 000 linhas geradas por fórmula (sem aleatoriedade, por isso os resultados repetem-se): 5000 clientes com 20 pedidos cada, datas entre 2023-01-01 e 2024-12-30, quatro estados (cancelado em 2%) e um email único por pedido.

    CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER NOT NULL,
        data_pedido DATE NOT NULL, estado VARCHAR(20) NOT NULL,
        total DECIMAL(10,2) NOT NULL, email VARCHAR(100) NOT NULL);

    -- SQLite (CTE recursiva; o MySQL usa o mesmo WITH RECURSIVE, com SET SESSION cte_max_recursion_depth = 200000)
    WITH RECURSIVE s(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM s WHERE n < 100000)
    INSERT INTO pedidos SELECT n, (n*7919 % 5000)+1, date('2023-01-01', '+' || (n % 730) || ' days'),
        CASE WHEN n%50=0 THEN 'cancelado' WHEN n%3=0 THEN 'pendente' WHEN n%3=1 THEN 'enviado' ELSE 'entregue' END,
        ((n*37) % 50000)/100.0, 'user'||n||'@exemplo.pt' FROM s;

    -- PostgreSQL: mesma fórmula com FROM generate_series(1,100000) AS n e DATE '2023-01-01' + (n % 730)
    -- MySQL: DATE_ADD('2023-01-01', INTERVAL (n % 730) DAY) e CONCAT('user',n,'@exemplo.pt')
    -- SQL Server: DATEADD(day, n % 730, '2023-01-01'), CONCAT(...) e OPTION (MAXRECURSION 0) no fim

A chave primária já tem um índice automático (no SQL Server e no MySQL/InnoDB é o próprio armazenamento da tabela, o índice agrupado). Tudo o resto tens de criar tu.

## Planos de execução: ver o que a base vai fazer

O plano é o roteiro que o otimizador escolhe para a consulta. Cada motor tem o seu comando:

| Motor | Plano estimado (não executa) | Plano real (executa e mede) |
|---|---|---|
| SQLite 3.45 | `EXPLAIN QUERY PLAN consulta` | não existe; mede o tempo no teu código ou na shell |
| PostgreSQL 17 | `EXPLAIN consulta` | `EXPLAIN ANALYZE consulta` |
| MySQL 8.4 | `EXPLAIN consulta` | `EXPLAIN ANALYZE consulta` |
| SQL Server 2025 | `SET SHOWPLAN_TEXT ON` (lote à parte, seguido de GO) | `SET STATISTICS IO, TIME ON`, ou `SET STATISTICS PROFILE ON` |

**ATENÇÃO:** `EXPLAIN ANALYZE` executa mesmo a consulta. Num INSERT, UPDATE ou DELETE isso altera dados: envolve-o numa transação e faz ROLLBACK (módulo 04).

Primeira consulta, sem nenhum índice além da chave primária:

    SELECT * FROM pedidos WHERE cliente_id = 1234;   -- 20 linhas

    SQLite:      SCAN pedidos                                               8,15 ms
    PostgreSQL:  Seq Scan on pedidos  (actual time=0.239..6.672 rows=20)
                   Filter: (cliente_id = 1234)   Rows Removed by Filter: 99980   6,7 ms
    MySQL:       Filter: (pedidos.cliente_id = 1234) (actual time=1.01..32.5 rows=20)
                   -> Table scan on pedidos (rows=100000)                    32,5 ms
    SQL Server:  Clustered Index Scan (... WHERE cliente_id = ...)           778 leituras lógicas, 4 ms

Os quatro fazem o mesmo: leem as 100 000 linhas para devolver 20. O vocabulário muda, a ideia não: SCAN, Seq Scan, Table scan e Clustered Index Scan são varrimentos completos. O PostgreSQL até conta as linhas descartadas (99 980).

## CREATE INDEX

    CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);

Criar o índice demorou 58 ms no SQLite, 42 ms no PostgreSQL e 66 ms no SQL Server: é trabalho feito uma vez, para poupar em cada consulta. Repetimos a consulta:

    SQLite:      SEARCH pedidos USING INDEX idx_pedidos_cliente (cliente_id=?)     0,06 ms
    PostgreSQL:  Bitmap Heap Scan sobre Bitmap Index Scan on idx_pedidos_cliente   0,13 ms
    MySQL:       Index lookup on pedidos using idx_pedidos_cliente (rows=20)       0,04 ms
    SQL Server:  Index Seek (idx_pedidos_cliente) + Clustered Index Seek (LOOKUP)   62 leituras, 0 ms

De 8, 7, 32 e 4 ms para centésimas de milésimo: SEARCH, Bitmap Index Scan, Index lookup e Index Seek são procuras. No SQL Server, as leituras lógicas (páginas lidas) desceram de 778 para 62. Esta métrica é mais estável do que o tempo.

### Scan contra seek

- Scan (varrimento): lê tudo, ou todo um índice. O custo cresce com o tamanho da tabela.
- Seek (procura): desce a árvore até ao valor. O custo cresce muito devagar.
- Um scan de um índice pequeno (que só tem as colunas pedidas) ainda é mais barato do que um scan da tabela, mas continua a ser um scan.
- Depois de achar a entrada no índice, a base tem de ir buscar as restantes colunas à tabela: no SQL Server chama-se Key Lookup (aparece como Clustered Index Seek com LOOKUP no plano).

**DICA:** quando um plano tem tempo alto, procura primeiro Scan em tabelas grandes e uma diferença grande entre linhas estimadas e linhas reais.

## O custo nas escritas

Cada índice tem de ser atualizado em cada INSERT, UPDATE da coluna e DELETE. Comparação: copiar as 100 000 linhas para uma tabela sem índices e para outra com cinco índices (cliente_id, data_pedido, estado, email e o composto cliente_id + data_pedido; no MySQL ficaram quatro, sem o índice só em cliente_id):

| Motor | Sem índices | Com índices | Factor |
|---|---|---|---|
| SQLite | 97 ms | 2148 ms | cerca de 22 vezes |
| PostgreSQL | 89 ms | 1064 ms | cerca de 12 vezes |
| MySQL (só a chave primária contra mais 4 índices) | 1033 ms | 3037 ms | cerca de 3 vezes |
| SQL Server | 174 ms | 2235 ms | cerca de 13 vezes |

(MySQL e SQL Server medidos numa execução cada; o factor exato varia, mas a direção não.) Índices aceleram a leitura e abrandam a escrita, e ocupam espaço em disco e em memória. Um índice que nenhuma consulta usa só tem custo.

## Índices compostos e a ordem das colunas

Um índice composto ordena por a primeira coluna e, dentro de valores iguais, pela segunda. É como uma lista telefónica por apelido e depois nome próprio: encontras todos os Silva, e dentro deles o João; mas não encontras todos os João sem ler a lista inteira.

Regra prática: colunas comparadas com igualdade primeiro, a coluna do ORDER BY ou do intervalo a seguir. Pergunta típica, as 3 últimas encomendas de um cliente:

    SELECT * FROM pedidos WHERE cliente_id = 1234 ORDER BY data_pedido DESC LIMIT 3;
    -- SQL Server: SELECT TOP 3 * ... ORDER BY data_pedido DESC

Com o índice só em cliente_id, os quatro motores encontram as 20 linhas do cliente e depois ordenam-nas: SQLite mostra `USE TEMP B-TREE FOR ORDER BY`, PostgreSQL `Sort  Sort Method: top-N heapsort`, MySQL `Sort: pedidos.data_pedido DESC, limit input to 3 row(s)`, SQL Server `Sort(TOP 3, ORDER BY ...)` (62 leituras lógicas). Com o composto:

    CREATE INDEX idx_pedidos_cli_data ON pedidos (cliente_id, data_pedido);

    SQLite:      SEARCH pedidos USING INDEX idx_pedidos_cli_data (cliente_id=?)      (sem ordenação)
    PostgreSQL:  Limit -> Index Scan Backward using idx_pedidos_cli_data              0,022 ms
    MySQL:       Limit: 3 row(s) -> Index lookup ... (reverse)                         sem Sort
    SQL Server:  Top -> Index Seek (idx_pedidos_cli_data) ORDERED BACKWARD             11 leituras (antes 62)

O índice já está por ordem, por isso a ordenação desaparece e a base pára ao fim de 3 linhas. (No PostgreSQL, sem o LIMIT e com o composto presente, o otimizador escolheu na mesma Bitmap + Sort para apenas 20 linhas: o plano depende das estimativas, não só dos índices que existem.)

A segunda coluna sozinha não aproveita o composto:

    SELECT * FROM pedidos WHERE data_pedido = '2024-03-15';   -- 137 linhas

    SQLite: SCAN pedidos        PostgreSQL: Seq Scan (7,0 ms)        MySQL: Table scan (29 ms)
    SQL Server: Index Scan (idx_pedidos_cli_data)    645 leituras lógicas

Quem não começa pelo prefixo do índice obriga a varrer. Para pesquisar só por data é preciso outro índice (data_pedido).

## Índices únicos

Um índice único impede valores repetidos e serve de procura rápida. É assim que funcionam UNIQUE e PRIMARY KEY (módulo 05). Duplicar o email do pedido 1234 dá em cada motor:

    CREATE UNIQUE INDEX uq_pedidos_email ON pedidos (email);
    INSERT INTO pedidos VALUES (100001, 1, '2024-01-01', 'pendente', 10.00, 'user1234@exemplo.pt');

    SQLite:      UNIQUE constraint failed: pedidos.email
    PostgreSQL:  ERROR:  duplicate key value violates unique constraint "uq_pedidos_email"
    MySQL:       ERROR 1062 (23000): Duplicate entry 'user1234@exemplo.pt' for key 'pedidos.uq_pedidos_email'
    SQL Server:  Msg 2601: Cannot insert duplicate key row in object 'dbo.pedidos' with unique index 'uq_pedidos_email'.

**NOTA:** com NULL há diferença. Num índice único, o SQLite, o PostgreSQL e o MySQL aceitaram duas linhas com NULL; o SQL Server rejeitou a segunda com o mesmo Msg 2601, porque trata os NULL como iguais entre si (testado com uma tabela de uma coluna).

## Índices cobertos

Se o índice contém todas as colunas que a consulta pede, a base nem precisa de visitar a tabela. Chama-se índice coberto.

    SELECT data_pedido, total FROM pedidos WHERE cliente_id = 1234;

    -- SQLite e MySQL: acrescenta a coluna ao fim do índice
    CREATE INDEX idx_pedidos_cobre ON pedidos (cliente_id, data_pedido, total);
    -- PostgreSQL (11+) e SQL Server: INCLUDE guarda a coluna sem a ordenar
    CREATE INDEX idx_pedidos_cobre ON pedidos (cliente_id, data_pedido) INCLUDE (total);

    SQLite:      SEARCH pedidos USING COVERING INDEX idx_pedidos_cobre (cliente_id=?)
    PostgreSQL:  Index Only Scan using idx_pedidos_cobre ... Heap Fetches: 0
    MySQL:       Covering index lookup on pedidos using idx_pedidos_cobre            0,01 ms
    SQL Server:  Index Seek (idx_pedidos_cobre) sozinho: 2 leituras lógicas (antes 62)

O Index Only Scan do PostgreSQL só evita a tabela para páginas marcadas como visíveis: neste teste fiz primeiro `VACUUM ANALYZE pedidos`, e `Heap Fetches: 0` confirma isso. Não testei sem o VACUUM: confirma na documentação indicada.

**ATENÇÃO:** não cries um índice coberto para cada consulta: ele é grande e é mantido em cada escrita.

## Consultas não sargáveis

Uma condição é sargável (do inglês search-argument-able) quando a base consegue usá-la para procurar na árvore. Perde-se isso quando se transforma a coluna antes de a comparar, ou quando o início do valor é desconhecido. O índice está ordenado pelo valor da coluna, não pelo resultado da tua função.

Função sobre a coluna: todos os pedidos de 2024, com índice em data_pedido.

    SELECT COUNT(*) FROM pedidos WHERE YEAR(data_pedido) = 2024;      -- PostgreSQL: EXTRACT(YEAR FROM data_pedido); SQLite: strftime('%Y', data_pedido) = '2024'
    SELECT COUNT(*) FROM pedidos WHERE data_pedido >= '2024-01-01' AND data_pedido < '2025-01-01';

    SQLite:      SCAN ... COVERING INDEX (20,1 ms)    contra  SEARCH ... (data_pedido>? AND data_pedido<?)  1,2 ms
    PostgreSQL:  Index Only Scan com Filter (17,3 ms) contra  Index Cond no intervalo  5,7 ms
    MySQL:       Filter: year(data_pedido) = 2024, Covering index scan (25 ms)  contra  Covering index range scan  11 ms
    SQL Server:  Index Scan (WHERE datepart(year,...)) 165 leituras  contra  Index Seek (SEEK: data_pedido >= ... AND < ...)  84 leituras

Em todos o índice foi lido inteiro (os 100 000 valores) e filtrado, em vez de ir direto ao intervalo. Regra: escreve o intervalo (extremo inferior incluído, superior excluído), não a função. Se tiveres mesmo de filtrar pela função, cria um índice sobre a expressão: `CREATE INDEX ... ON pedidos (strftime('%Y', data_pedido))` no SQLite, `((EXTRACT(YEAR FROM data_pedido)))` no PostgreSQL (com parênteses duplos) e `((YEAR(data_pedido)))` no MySQL; todos testados e usados nos planos. No SQL Server cria-se uma coluna calculada (`ALTER TABLE pedidos ADD ano AS YEAR(data_pedido)`) e um índice sobre ela, que dá Index Seek (em sqlcmd é preciso a opção -I para os SET QUOTED_IDENTIFIER corretos).

LIKE com % à frente: `WHERE email LIKE '%1234@exemplo.pt'` faz varrimento nos quatro, com ou sem índice no email (SQLite e PostgreSQL: SCAN/Seq Scan; MySQL: Table scan; SQL Server: Index Scan ou Clustered Index Scan com `like`). Sem o início do texto não há por onde descer na árvore. Já a igualdade `email = 'user1234@exemplo.pt'` dá uma procura (0,04 ms no SQLite, 0,05 no PostgreSQL, 0,01 no MySQL, 6 leituras no SQL Server). E LIKE com prefixo fixo, `LIKE 'user1234@%'`:

| Motor | Usa o índice do email? |
|---|---|
| SQLite | não (SCAN); segundo a documentação, o LIKE ignora maiúsculas por omissão e o índice normal não |
| PostgreSQL | não com o índice normal (Seq Scan); sim com `CREATE INDEX ... ON pedidos (email text_pattern_ops)` (Index Scan, 0,04 ms) |
| MySQL | sim (Index range scan, colação por omissão) |
| SQL Server | sim (Index Seek com intervalo) |

**DICA:** para pesquisa por palavras no meio do texto, os índices B-tree não servem; existem índices de texto integral, fora do âmbito deste módulo.

## O problema N+1

N+1 é um padrão no código da aplicação: 1 consulta para obter uma lista e mais N, uma por elemento. Exemplo em Python com SQLite, para os clientes 1 a 500 (índice em cliente_id existente):

    for c in range(1, 501):                       # 500 consultas
        for (t,) in db.execute("SELECT total FROM pedidos WHERE cliente_id = ?", (c,)): soma += t
    # contra uma só consulta
    db.execute("SELECT SUM(total) FROM pedidos WHERE cliente_id BETWEEN 1 AND 500")

    500 consultas com índice:       28,1 ms (soma 2499850.00)
    1 consulta com índice:           0,7 ms (mesma soma)
    500 consultas sem índice:     4558 ms   (cada uma varre os 100 000 pedidos)

Aqui a base está no mesmo processo. Num servidor, cada uma das 500 idas e voltas ainda paga latência de rede (o que não medi). A cura: pedir tudo de uma vez com JOIN, IN ou GROUP BY (módulos 02 e 03), e garantir índice na coluna da junção. Em ORMs, procura a opção de carregamento antecipado (eager loading).

## Estatísticas

O otimizador escolhe o plano com base em estatísticas: quantas linhas tem a tabela, quantos valores distintos tem cada coluna, a distribuição dos valores. Estatísticas velhas dão planos maus.

| Motor | Atualizar | Ver |
|---|---|---|
| SQLite | `ANALYZE;` | tabela `sqlite_stat1` |
| PostgreSQL | `ANALYZE tabela;` (o autovacuum também o faz) | `pg_stats`, linhas estimadas no EXPLAIN |
| MySQL | `ANALYZE TABLE tabela;` | `SHOW INDEX FROM tabela` (coluna Cardinality) |
| SQL Server | `UPDATE STATISTICS tabela;` | `DBCC SHOW_STATISTICS ('tabela', 'índice')` |

Demonstração no PostgreSQL: depois de um ANALYZE, mudei 20 000 linhas para o estado 'reembolsado' e perguntei por elas:

    Seq Scan on pedidos_sem  (cost=0.00..2709.05 rows=1 width=46) (actual time=5.715..7.450 rows=20000)
    -- depois de ANALYZE pedidos_sem:
    Seq Scan on pedidos_sem  (cost=0.00..2450.00 rows=20217 width=47) (actual time=4.526..6.193 rows=20000)

A estimativa passou de 1 linha para 20 217, perto das 20 000 reais. Uma estimativa errada em ordens de grandeza pode levar o otimizador a escolher um mau método de junção. Os histogramas também mostram a distribuição: no SQL Server, `DBCC SHOW_STATISTICS ... WITH HISTOGRAM` listou cancelado 2000, entregue 32 666, enviado 32 667, pendente 32 667. No SQLite, `sqlite_stat1` guardou `100000 25000` para o índice do estado (100 000 linhas, em média 25 000 por valor).

## Quando não indexar

- Tabelas pequenas: um varrimento de 8 linhas é mais rápido do que descer uma árvore.
- Colunas com poucos valores distintos (estado, sexo, booleanos): o índice no estado devolveria 32 666 de 100 000 linhas (33%). No SQLite medi 28,5 ms com o índice contra 21,6 ms com varrimento; depois de ANALYZE continuou a usar o índice (36,6 ms). No MySQL o índice foi usado e demorou 40 ms. O SQL Server decidiu varrer tudo (778 leituras lógicas, 27 ms), mesmo para 'cancelado' (2%), porque o índice não cobre `total`. Escolher bem é função do otimizador, mas um índice assim só gasta espaço.
- Tabelas com muitas escritas e poucas leituras (registos de log).
- Índices redundantes: o composto (cliente_id, data_pedido) já serve para procurar só por cliente_id. Um índice só em cliente_id passa a ser desperdício.
- Condições que devolvem grande parte da tabela, ou que transformam a coluna (secção anterior).

Existem índices parciais, só para um subconjunto: `CREATE INDEX ... ON pedidos (estado) WHERE estado = 'cancelado'` funciona no SQLite, PostgreSQL e SQL Server (índice filtrado). No MySQL 8.4 dá erro 1064 (syntax error near 'WHERE').

## Nos outros dialetos

| Tema | SQLite 3.45 | PostgreSQL 17 | MySQL 8.4 | SQL Server 2025 |
|---|---|---|---|---|
| Ver o plano | `EXPLAIN QUERY PLAN` | `EXPLAIN` | `EXPLAIN` | `SET SHOWPLAN_TEXT ON` |
| Plano com execução real | não tem: `EXPLAIN ANALYZE` dá syntax error near "SELECT" | `EXPLAIN ANALYZE` | `EXPLAIN ANALYZE` | `SET STATISTICS IO, TIME ON` |
| Varrimento / procura | SCAN / SEARCH | Seq Scan / Index Scan | Table scan / Index lookup | Clustered Index Scan / Index Seek |
| Coluna extra no índice | acrescentar ao fim (INCLUDE dá syntax error) | `INCLUDE (...)` | acrescentar ao fim (INCLUDE dá erro 1064) | `INCLUDE (...)` |
| Índice parcial | `WHERE` | `WHERE` | não (erro 1064) | `WHERE` (índice filtrado) |
| Índice sobre expressão | direto | `((expressão))` | `((expressão))` | coluna calculada com índice |
| Prefixo de LIKE usa o índice | não | só com `text_pattern_ops` | sim | sim |
| Atualizar estatísticas | `ANALYZE` | `ANALYZE` | `ANALYZE TABLE` | `UPDATE STATISTICS` |
| Chave primária | índice sobre a tabela (rowid) | índice à parte | índice agrupado | índice agrupado |

Erros reais por sintaxe inexistente: `SET SHOWPLAN_TEXT ON` no PostgreSQL dá `syntax error at or near "ON"`; `EXPLAIN SELECT 1` no SQL Server dá `Could not find stored procedure 'EXPLAIN'`; `INCLUDE` no SQLite dá `near "INCLUDE": syntax error`.

Oracle: `EXPLAIN PLAN FOR ...` e `DBMS_XPLAN.DISPLAY`, mais índices de tipo bitmap e baseados em funções. SAP HANA: `EXPLAIN PLAN FOR`. NÃO executei nenhum dos dois (não há instância): confirma na documentação indicada abaixo.

## Exercícios

**PRATICAR:** faz os exercícios 25 a 28 no módulo de exercícios (11-Exercicios-Praticos). Usa a tabela pedidos desta aula e compara sempre o plano e o tempo antes e depois de cada índice.

## Fontes oficiais

- SQLite, planificador de consultas: https://www.sqlite.org/queryplanner.html
- SQLite, EXPLAIN QUERY PLAN: https://www.sqlite.org/eqp.html
- SQLite, CREATE INDEX: https://www.sqlite.org/lang_createindex.html
- SQLite, otimizações: https://www.sqlite.org/optoverview.html
- SQLite, ANALYZE: https://www.sqlite.org/lang_analyze.html
- PostgreSQL, índices: https://www.postgresql.org/docs/17/indexes.html
- PostgreSQL, usar o EXPLAIN: https://www.postgresql.org/docs/17/using-explain.html
- PostgreSQL, Index Only Scan: https://www.postgresql.org/docs/17/indexes-index-only-scans.html
- PostgreSQL, classes de operadores: https://www.postgresql.org/docs/17/indexes-opclass.html
- PostgreSQL, ANALYZE: https://www.postgresql.org/docs/17/sql-analyze.html
- MySQL 8.4, índices: https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html
- MySQL 8.4, índices de várias colunas: https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html
- MySQL 8.4, EXPLAIN: https://dev.mysql.com/doc/refman/8.4/en/explain.html
- MySQL 8.4, ANALYZE TABLE: https://dev.mysql.com/doc/refman/8.4/en/analyze-table.html
- SQL Server, guia de desenho de índices: https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide
- SQL Server, SET STATISTICS IO: https://learn.microsoft.com/en-us/sql/t-sql/statements/set-statistics-io-transact-sql
- SQL Server, SET SHOWPLAN_TEXT: https://learn.microsoft.com/en-us/sql/t-sql/statements/set-showplan-text-transact-sql
- SQL Server, estatísticas: https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics
- Oracle, ajuste de SQL: https://docs.oracle.com/en/database/oracle/oracle-database/23/tgsql/index.html
- SAP HANA Cloud, EXPLAIN PLAN: https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-sql-reference-guide/explain-plan-statement-data-manipulation
