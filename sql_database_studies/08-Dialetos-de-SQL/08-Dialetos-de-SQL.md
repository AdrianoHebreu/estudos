# 08 Dialetos de SQL

Desde o módulo 01 que cada aula termina com uma secção «Nos outros dialetos». Este módulo reúne tudo num só sítio: percebes porque é que o SQL «portável» não existe a 100%, vês as mesmas 14 tarefas da loja resolvidas nos quatro motores, e ficas com uma tabela «tradutor» e uma lista de verificação para migrar queries.

Todas as afirmações abaixo foram executadas na base m08 (loja.sql carregado) em SQLite 3.45.3, PostgreSQL 17.12, MySQL 8.4.13 e SQL Server 2025 (RTM-CU6, versão 17.0.4055.5), salvo o que estiver marcado como não executado.

## O padrão SQL e os dialetos

O SQL é uma norma ISO/IEC (a família 9075, que é paga e não consultei aqui), mas nenhum motor a implementa por inteiro e todos acrescentam extensões próprias. A documentação do PostgreSQL, por exemplo, tem uma página só sobre a conformidade com o padrão (ver Fontes oficiais). O resultado prático:

- Um núcleo comum (SELECT, JOIN, GROUP BY, INSERT, UPDATE, DELETE, CREATE TABLE) corre quase igual em todos.
- Há funcionalidades padrão que cada motor escreve ao seu modo ou só implementou mais tarde (paginação, upsert, concatenação, datas).
- Há extensões que só existem num motor (TOP, IDENTITY, GROUP_CONCAT, ILIKE, OUTPUT).
- Mesmo a sintaxe igual pode dar resultados diferentes: divisão de inteiros, ordem dos NULL, maiúsculas e minúsculas.

**NOTA:** o terceiro ponto é o mais traiçoeiro. Uma sintaxe que não existe dá erro (e vês logo); um comportamento diferente dá um resultado errado em silêncio.

## Os sistemas

| Sistema | Versão usada | Como correu | Nota |
|---|---|---|---|
| SQLite | 3.45.3 | Python (módulo sqlite3), base em memória | Biblioteca embebida, sem servidor |
| PostgreSQL | 17.12 | contentor Docker, psql | Muito próximo do padrão |
| MySQL | 8.4.13 | contentor Docker, cliente mysql | Base de dados = schema |
| SQL Server | 2025 (RTM-CU6) | contentor Docker, sqlcmd | Dialeto T-SQL |

**Oracle e SAP HANA (NÃO executado: não há instância):** têm dialetos próprios (o Oracle tem MERGE, o HANA tem UPSERT, e cada um tem funções de texto e datas com nomes próprios). Nada deste módulo foi testado neles. Consulta a referência SQL oficial de cada um (ver Fontes oficiais) antes de assumires que uma linha das tabelas abaixo também vale lá.

## As 14 tarefas, lado a lado

Em cada tabela vês o que aconteceu quando executei a mesma tarefa nos quatro. A sintaxe exata de cada uma está na tabela «tradutor», mais abaixo.

### Tarefa 1: paginação (página 2, 3 produtos por página, do mais caro para o mais barato)

Resultado em todos os quatro, com a sua sintaxe: Manta de Sofá (34.50), Atlas Mundial (29.99), Candeeiro de Mesa (22.00). O que acontece com a sintaxe dos outros:

| Sintaxe | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| LIMIT 3 OFFSET 3 | funciona | funciona | funciona | Msg 102, Incorrect syntax near 'LIMIT' |
| OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY | near "OFFSET": syntax error | funciona | erro 1064 | funciona (exige ORDER BY) |
| SELECT TOP 3 | near "3": syntax error | syntax error at or near "3" | erro 1064 | funciona (sem saltar linhas) |

No SQL Server, OFFSET FETCH sem ORDER BY falha (Msg 102 e Msg 153).

### Tarefa 2: concatenação (nome, email entre sinais, onde o Hugo tem email NULL)

| Sintaxe | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| duas barras verticais, Ana | texto completo | texto completo | 0 | texto completo (aceite na 2025) |
| duas barras verticais, Hugo | NULL | NULL | NULL | NULL |
| CONCAT, Hugo | Hugo Teixeira <> | Hugo Teixeira <> | NULL | Hugo Teixeira <> |
| sinal mais, Ana | 0 | erro: operator does not exist | 0 | texto completo |

No MySQL as duas barras são o operador OR (daí o 0). Com SET sql_mode = CONCAT(@@sql_mode, ',PIPES_AS_CONCAT') passam a concatenar (executado), mas isso muda o comportamento da sessão inteira. No MySQL, CONCAT_WS('', nome, ' <', email, '>') ignora o NULL e devolve Hugo Teixeira <> (executado).

### Tarefa 3: data atual e aritmética de datas

Nos quatro, a data atual deu 2026-11-13, somar 30 dias a 2025-01-10 deu 2025-02-09 e a distância até 2025-06-01 deu 142 dias. Muda a sintaxe e o que falha:

| Teste | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| CURRENT_DATE | funciona | funciona | funciona | funciona (2025) |
| GETDATE() | no such function | does not exist | erro 1305 | funciona (devolve data e hora) |
| DATEDIFF(day, a, b) | no such column: day | column "day" does not exist | erro 1582 (parâmetros) | funciona |
| data + 1 | não executado | funciona (soma dias) | não executado | Msg 206, operand type clash |

No SQL Server, DATEADD(day, 30, '2025-01-10') sobre um literal de texto devolveu 2025-02-09 00:00:00.000 (tipo datetime, com horas).

### Tarefa 4: auto-incremento

Tabela com id gerado e dois INSERT: ids 1 e 2 nos quatro. SQLite: INTEGER PRIMARY KEY AUTOINCREMENT; PostgreSQL: GENERATED ALWAYS AS IDENTITY; MySQL: AUTO_INCREMENT; SQL Server: IDENTITY(1,1). Todas as outras formas são erro de sintaxe noutro motor (ver módulos 04 e 05).

### Tarefa 5: upsert (inserir ou somar a um contador)

Duas execuções sobre a chave visitas: valor final 2 nos quatro.

| Sintaxe | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| ON CONFLICT (chave) DO UPDATE | funciona | funciona | erro 1064 | Msg 156, near the keyword 'ON' |
| ON DUPLICATE KEY UPDATE | near "DUPLICATE": syntax error | syntax error at or near "DUPLICATE" | funciona | não executado |
| MERGE com HOLDLOCK | não executado | não executado | não existe | funciona |

No MySQL, o VALUES(valor) dentro do UPDATE deu 1 aviso (warning); a forma com alias (VALUES (...) AS novo ... novo.valor) correu sem avisos. O MySQL reporta 1 linha afetada na inserção e 2 na atualização.

### Tarefa 6: agregar texto (nomes dos produtos por categoria, por ordem alfabética)

Resultado igual nos quatro: categoria 1 é Atlas Mundial, Livro de Receitas, Romance Policial.

| Sintaxe | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| GROUP_CONCAT | funciona (também com ORDER BY dentro) | function group_concat does not exist | funciona (ORDER BY e SEPARATOR) | Msg 195, not a recognized function |
| STRING_AGG | funciona (3.45, com ORDER BY dentro) | funciona | erro 1305, does not exist | funciona (WITHIN GROUP) |

### Tarefa 7: valor por omissão para NULL

| Função | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| COALESCE(email, 'sem email') | sem email | sem email | sem email | sem email |
| IFNULL(a, b) | funciona | function ifnull does not exist | funciona | Msg 195 |
| ISNULL(a, b) | near "ISNULL": syntax error | function isnull does not exist | erro 1582 (só aceita 1 argumento) | funciona |

No MySQL, ISNULL(email) com um argumento devolve 1 ou 0 (é um teste, não uma substituição). No SQL Server, ISNULL usa o tipo do primeiro argumento: ISNULL(CAST(NULL AS VARCHAR(3)), 'sem email') devolveu sem (truncado), e COALESCE devolveu sem email.

### Tarefa 8: divisão e divisão por zero

| Expressão | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| 7 / 2 | 3 | 3 | 3.5000 | 3 |
| 7.0 / 2 | 3.5 | 3.5000000000000000 | 3.50000 | 3.500000 |
| CAST(7 AS DECIMAL(10,2)) / 2 | 3 | 3.5000000000000000 | 3.500000 | 3.500000 |
| 7 % 2 | 1 | 1 | 1 | 1 |
| 7 DIV 2 | erro de sintaxe | erro de sintaxe (existe a função div(7, 2), deu 3) | 3 | erro de sintaxe |
| 1 / 0 | NULL | ERROR: division by zero | NULL | Msg 8134, Divide by zero error |

**ATENÇÃO:** no SQLite o CAST para DECIMAL não produziu decimais (o resultado foi 3). Para forçar decimais de forma portável, usa um literal com ponto (7.0), que deu decimais nos quatro.

### Tarefa 9: maiúsculas e minúsculas na comparação (cliente Ana Ribeiro, procurada com minúsculas)

| Teste | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| nome = 'ana ribeiro' (linhas) | 0 | 0 | 1 | 1 |
| nome LIKE 'ana%' | 1 | 0 | 1 | não executado |
| LIKE 'GRAÇA%' (nome é Graça Nunes) | 0 | não executado | 1 | 1 |
| ILIKE 'ana%' | near "ILIKE": syntax error | 1 | erro 1064 | Msg 4145 |

O SQLite só ignora maiúsculas no LIKE para letras ASCII: 'graça%' encontrou, 'GRAÇA%' não. A collation de omissão no MySQL é utf8mb4_0900_ai_ci e no SQL Server SQL_Latin1_General_CP1_CI_AS (ambas ignoram maiúsculas). Para distinguir: MySQL nome = BINARY 'ana ribeiro' deu 0; SQL Server nome = 'ana ribeiro' COLLATE Latin1_General_CS_AS deu 0.

### Tarefa 10: aspas nos identificadores

Alias com espaços, AS "nome do cliente", AS acento grave e AS parênteses retos:

| Forma | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| aspas duplas | funciona | funciona | funciona (como alias de texto) | funciona |
| acento grave | funciona | syntax error (no acento grave) | funciona | Msg 102 |
| parênteses retos | funciona | syntax error at or near "[" | erro 1064 | funciona |
| SELECT "abc" | devolve o texto abc | column "abc" does not exist | devolve o texto abc | Msg 207, Invalid column name (com QUOTED_IDENTIFIER ON) |

O PostgreSQL passa os identificadores sem aspas para minúsculas: AS Texto2 apareceu como texto2, enquanto AS "Texto" manteve a maiúscula. Texto vai sempre entre aspas simples.

**ATENÇÃO:** no sqlcmd, SELECT "abc" devolveu abc porque o sqlcmd liga QUOTED_IDENTIFIER OFF por omissão; com a opção -I deu Msg 207. O resultado depende da definição da sessão.

### Tarefa 11: booleanos

| Teste | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| SELECT TRUE, FALSE | 1 e 0 | t e f | 1 e 0 | Msg 207, Invalid column name 'TRUE' |
| SELECT 1 < 2 | 1 | t | 1 | Msg 102, near '<' |
| stock = 0 AS esgotado | 1 (Teclado) | t | 1 | Msg 156 |

No SQL Server uma condição não é um valor; usa CASE WHEN stock = 0 THEN 1 ELSE 0 END (executado, deu 1 e 0). O tipo de coluna do SQL Server é BIT (módulo 05).

### Tarefa 12: ordenação de NULL (email do Hugo, id 8)

| Teste | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| ORDER BY email (ASC) | id 8 primeiro | id 8 no fim | id 8 primeiro | id 8 primeiro |
| ORDER BY email DESC | id 8 no fim | id 8 primeiro | id 8 no fim | id 8 no fim |
| NULLS LAST | funciona | funciona (também NULLS FIRST) | erro 1064 | Msg 102 |
| CASE WHEN email IS NULL THEN 1 ELSE 0 END, email | id 8 no fim | id 8 no fim | id 8 no fim | id 8 no fim |

### Tarefa 13: FULL OUTER JOIN (clientes e encomendas)

SQLite 3.45, PostgreSQL e SQL Server: 14 linhas, 2 sem encomenda (Graça e Hugo). MySQL: erro 1064 no FULL OUTER JOIN. A emulação com LEFT JOIN UNION ALL RIGHT JOIN WHERE c.id IS NULL deu o mesmo, 14 e 2.

### Tarefa 14: devolver as linhas alteradas

UPDATE produtos SET stock = stock + 5 WHERE id = 6 devolveu id 6, Teclado Mecânico, stock 5 com RETURNING (SQLite e PostgreSQL) e com OUTPUT inserted (SQL Server). No MySQL, RETURNING e OUTPUT dão erro 1064, também no INSERT. Alternativa: SELECT LAST_INSERT_ID() (devolveu 1, o primeiro id gerado pelo último INSERT com sucesso) ou voltar a fazer um SELECT. No SQLite OUTPUT dá near "OUTPUT": syntax error, no PostgreSQL syntax error at or near "OUTPUT", no SQL Server RETURNING dá Msg 102.

## O tradutor

Tabela de consulta rápida: a mesma tarefa em cada dialeto (as formas indicadas foram executadas nesta sessão ou nos módulos 01 a 05).

| Tarefa | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| Paginar | LIMIT n OFFSET m | LIMIT n OFFSET m ou OFFSET m ROWS FETCH NEXT n ROWS ONLY | LIMIT n OFFSET m | ORDER BY ... OFFSET m ROWS FETCH NEXT n ROWS ONLY |
| Concatenar | a duas barras b, CONCAT | a duas barras b, CONCAT | CONCAT(a, b) | a + b, CONCAT, duas barras (2025) |
| Data atual | CURRENT_DATE | CURRENT_DATE | CURRENT_DATE | CURRENT_DATE, CAST(GETDATE() AS DATE) |
| Somar 30 dias | DATE(d, '+30 days') | d + 30 | DATE_ADD(d, INTERVAL 30 DAY) | DATEADD(day, 30, d) |
| Dias entre a e b | JULIANDAY(b) - JULIANDAY(a) | b - a | DATEDIFF(b, a) | DATEDIFF(day, a, b) |
| Id automático | INTEGER PRIMARY KEY AUTOINCREMENT | GENERATED ALWAYS AS IDENTITY | AUTO_INCREMENT | IDENTITY(1,1) |
| Upsert | ON CONFLICT (k) DO UPDATE SET v = t.v + excluded.v | ON CONFLICT (k) DO UPDATE SET v = t.v + EXCLUDED.v | ON DUPLICATE KEY UPDATE (com alias da linha nova) | MERGE ... WITH (HOLDLOCK) |
| Agregar texto | GROUP_CONCAT ou STRING_AGG | STRING_AGG(x, ', ' ORDER BY x) | GROUP_CONCAT(x ORDER BY x SEPARATOR ', ') | STRING_AGG(x, ', ') WITHIN GROUP (ORDER BY x) |
| NULL por valor | COALESCE, IFNULL | COALESCE | COALESCE, IFNULL | COALESCE, ISNULL |
| Divisão decimal | 7.0 / 2 | 7.0 / 2 | 7.0 / 2 (ou 7 / 2) | 7.0 / 2 |
| Ignorar maiúsculas | LIKE (só ASCII) | ILIKE | comparação normal | comparação normal |
| Identificador com espaços | aspas duplas, acento grave, retos | aspas duplas | acento grave | parênteses retos, aspas duplas |
| Booleano como valor | TRUE ou 1 | TRUE | TRUE ou 1 | CASE WHEN ... THEN 1 ELSE 0 END |
| NULL no fim | NULLS LAST | NULLS LAST | CASE WHEN x IS NULL THEN 1 ELSE 0 END | o mesmo CASE |
| FULL OUTER JOIN | FULL OUTER JOIN | FULL OUTER JOIN | LEFT JOIN UNION ALL RIGHT JOIN WHERE nulo | FULL OUTER JOIN |
| Devolver linhas | RETURNING | RETURNING | SELECT depois (LAST_INSERT_ID) | OUTPUT inserted.col |

Exemplo completo de tradução, a paginação:

    -- SQLite, PostgreSQL, MySQL
    SELECT id, nome, preco FROM produtos ORDER BY preco DESC, id LIMIT 3 OFFSET 3;
    -- SQL Server (e também PostgreSQL)
    SELECT id, nome, preco FROM produtos ORDER BY preco DESC, id
    OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY;

## Escrever SQL portável

1. Fica no núcleo: SELECT, JOIN, GROUP BY, COALESCE, CASE, CAST, CURRENT_DATE, subconsultas, UNION.
2. Reconhece que nem a paginação é portável: LIMIT corre em três motores e OFFSET FETCH em dois (PostgreSQL e SQL Server), ver tarefa 1. Isola-a (ver a camada de acesso a dados).
3. Escreve sempre ORDER BY completo, com desempate (por id), e trata os NULL de forma explícita com CASE.
4. Usa literais decimais (7.0) e CAST explícito; testa a divisão de inteiros em cada motor.
5. Usa aspas simples para texto e evita identificadores que precisem de aspas (nomes em minúsculas, sem espaços, sem palavras reservadas; recorda que div foi rejeitado como alias no MySQL).
6. Não contes com a ordem sem ORDER BY, nem com a collation: comparações com maiúsculas dependem da base.
7. Evita o que é exclusivo: TOP, IDENTITY, ILIKE, GROUP_CONCAT, OUTPUT, RETURNING, MERGE, ON DUPLICATE KEY.

**DICA:** testa as queries em pelo menos dois motores diferentes (por exemplo PostgreSQL e MySQL) desde cedo. Um erro de sintaxe vê-se na hora; um resultado diferente só aparece com dados reais.

## Isolar o que muda: a camada de acesso a dados

Quando não dá para ser portável, concentra a diferença num único sítio da aplicação (um módulo, um repositório, um ficheiro SQL por dialeto) em vez de espalhar a sintaxe por todo o código. As tarefas que normalmente vão para essa camada:

- paginação e ordenação com NULL;
- inserir e devolver o id gerado (RETURNING, OUTPUT, LAST_INSERT_ID);
- upsert;
- datas (hoje, somar, diferenças, formatar);
- agregar texto;
- aspas e nomes de identificadores;
- DDL: tipos, auto-incremento e criação de bases.

O resto da aplicação chama funções como proximos_produtos(pagina) e não sabe qual é o motor.

### ORMs e query builders (visão geral)

Um ORM (SQLAlchemy, Django ORM, Prisma) ou um query builder (Knex) escreve o SQL do dialeto por ti: tu descreves a operação e a biblioteca escolhe LIMIT, TOP, IDENTITY ou RETURNING conforme o motor configurado. Não os executei neste módulo: confirma na documentação de cada um (ver Fontes oficiais) quais motores e versões suportam.

**ATENÇÃO:** isto resolve a sintaxe, não o comportamento. Collation, ordem dos NULL, divisão de inteiros e precisão decimal são do motor e continuam a mostrar-se. Quando uma query nativa for inevitável, escreve-a na camada de acesso a dados e testa-a nos motores suportados.

## Migrar queries entre dialetos: lista de verificação

1. Troca a sintaxe de paginação (LIMIT, TOP, OFFSET FETCH) e confirma que o ORDER BY existe (obrigatório no SQL Server).
2. Substitui concatenação (duas barras no MySQL são OR) e confirma o que acontece com NULL.
3. Reescreve funções de datas: hoje, somar, diferença, formatar.
4. Reescreve auto-incremento, upsert e a forma de obter o id gerado.
5. Troca IFNULL, ISNULL, GROUP_CONCAT, STRING_AGG pela versão do destino (ou por COALESCE).
6. Verifica divisões de inteiros e divisões por zero (erro ou NULL).
7. Verifica a comparação de texto: collation do destino e LIKE contra ILIKE.
8. Verifica as aspas dos identificadores e a caixa dos nomes (o PostgreSQL passa para minúsculas).
9. Verifica booleanos (TRUE existe? o resultado é 1 ou t?).
10. Verifica a ordem dos NULL e junta o ORDER BY com CASE.
11. Substitui FULL OUTER JOIN (MySQL) e RETURNING ou OUTPUT.
12. Corre as queries com dados reais e compara contagens e totais com a origem (não só a sintaxe).

**NOTA:** esta lista cobre o que foi executado neste módulo. Para Oracle e SAP HANA (não executados), confirma cada ponto na documentação oficial.

## Exercícios

**PRATICAR:** faz os exercícios 29 a 32 do módulo de exercícios (traduzir uma query entre os quatro, descobrir e explicar um comportamento silencioso, escrever o mesmo upsert e o mesmo agregado de texto em todos, e preparar uma query portável com fallback por dialeto).

## Fontes oficiais

- SQLite, SELECT: https://www.sqlite.org/lang_select.html
- SQLite, upsert: https://www.sqlite.org/lang_upsert.html
- SQLite, RETURNING: https://www.sqlite.org/lang_returning.html
- SQLite, funções de data: https://www.sqlite.org/lang_datefunc.html
- SQLite, funções de agregação: https://www.sqlite.org/lang_aggfunc.html
- SQLite, peculiaridades (quirks): https://www.sqlite.org/quirks.html
- PostgreSQL, SELECT: https://www.postgresql.org/docs/17/sql-select.html
- PostgreSQL, INSERT: https://www.postgresql.org/docs/17/sql-insert.html
- PostgreSQL, funções de agregação: https://www.postgresql.org/docs/17/functions-aggregate.html
- PostgreSQL, conformidade com o padrão SQL: https://www.postgresql.org/docs/17/features.html
- MySQL, compatibilidade: https://dev.mysql.com/doc/refman/8.4/en/compatibility.html
- MySQL, modos SQL: https://dev.mysql.com/doc/refman/8.4/en/sql-mode.html
- MySQL, INSERT ON DUPLICATE KEY UPDATE: https://dev.mysql.com/doc/refman/8.4/en/insert-on-duplicate.html
- MySQL, funções de agregação: https://dev.mysql.com/doc/refman/8.4/en/aggregate-functions.html
- SQL Server, ORDER BY (OFFSET FETCH): https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql
- SQL Server, STRING_AGG: https://learn.microsoft.com/en-us/sql/t-sql/functions/string-agg-transact-sql
- SQL Server, MERGE: https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql
- SQL Server, OUTPUT: https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql
- SQL Server, ISNULL: https://learn.microsoft.com/en-us/sql/t-sql/functions/isnull-transact-sql
- Oracle, referência SQL (MERGE): https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/MERGE.html
- SAP HANA, UPSERT: https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-sql-reference-guide/upsert-statement
- SQLAlchemy: https://docs.sqlalchemy.org/en/20/
- Django, bases de dados suportadas: https://docs.djangoproject.com/en/5.1/ref/databases/
- Prisma: https://www.prisma.io/docs
- Knex: https://knexjs.org/
