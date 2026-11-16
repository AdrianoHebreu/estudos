# 04 Modificar dados e transações

Até aqui só leste dados. Neste módulo passas a escrevê-los: inserir, alterar e apagar linhas da loja, e fazê-lo de forma segura com transações. Os exemplos correram em SQLite 3.45, PostgreSQL 17.12, MySQL 8.4.13 e SQL Server 2025, numa base chamada m04 com o ficheiro loja.sql carregado. Quando a saída é igual nos quatro, mostra-se uma só vez e indica-se qual foi.

## INSERT: uma linha e várias

Indica sempre as colunas, para o código não partir quando a tabela ganhar uma coluna nova. Para os exemplos criámos uma tabela de avaliações de produtos (a coluna de id gerado automaticamente é a única parte que muda de dialeto, ver mais abaixo).

    -- PostgreSQL: id SERIAL PRIMARY KEY
    CREATE TABLE avaliacoes (
        id SERIAL PRIMARY KEY,
        produto_id INTEGER NOT NULL,
        nota INTEGER NOT NULL,
        comentario VARCHAR(100)
    );
    INSERT INTO avaliacoes (produto_id, nota, comentario)
    VALUES (1, 5, 'Muito bom');
    INSERT INTO avaliacoes (produto_id, nota, comentario)
    VALUES (4, 3, 'Razoável'), (5, 4, NULL), (10, 5, 'Excelente');

A segunda forma (várias linhas num só INSERT) funcionou nos quatro motores. É um só comando (um só pedido ao servidor) em vez de três. Colunas omitidas ficam com o valor por omissão (aqui, o id gerado e NULL no comentário).

    SELECT * FROM avaliacoes ORDER BY id;
     id | produto_id | nota | comentario
    ----+------------+------+------------
      1 |          1 |    5 | Muito bom
      2 |          4 |    3 | Razoável
      3 |          5 |    4 |
      4 |         10 |    5 | Excelente

Os erros típicos, com a mensagem real de cada servidor:

    INSERT INTO avaliacoes (produto_id, comentario) VALUES (1, 'sem nota');
    -- PostgreSQL: null value in column "nota" of relation "avaliacoes" violates not-null constraint
    -- MySQL:      ERROR 1364: Field 'nota' doesn't have a default value
    -- SQL Server: Msg 515: Cannot insert the value NULL into column 'nota' ... INSERT fails.
    -- SQLite:     NOT NULL constraint failed: avaliacoes.nota

    INSERT INTO categorias (id, nome) VALUES (3, 'Jardim');      -- o id 3 já existe
    -- PostgreSQL: duplicate key value violates unique constraint "categorias_pkey"
    -- MySQL:      ERROR 1062: Duplicate entry '3' for key 'categorias.PRIMARY'
    -- SQL Server: Msg 2627: Violation of PRIMARY KEY constraint ... duplicate key value is (3)
    -- SQLite:     UNIQUE constraint failed: categorias.id

**ATENÇÃO:** no PostgreSQL, um INSERT que falha por violar uma restrição pode consumir um valor da sequência do SERIAL. No nosso teste o id 5 foi «queimado» pelo INSERT sem nota e a linha seguinte ficou com o id 6. Os ids gerados não são garantidamente seguidos, não os uses como contador.

## UPDATE e DELETE: o WHERE é tudo

`UPDATE tabela SET coluna = valor WHERE condição` altera as linhas que cumprem a condição. `DELETE FROM tabela WHERE condição` apaga-as. Podes usar a própria coluna na expressão.

    UPDATE produtos SET stock = stock - 2 WHERE id = 4;            -- 1 linha
    UPDATE produtos SET preco = ROUND(preco * 1.10, 2)
    WHERE categoria_id = 1;                                         -- 3 linhas
    DELETE FROM avaliacoes WHERE nota < 4;                          -- 1 linha

    SELECT id, nome, preco FROM produtos WHERE categoria_id = 1 ORDER BY id;
     id |       nome        | preco
    ----+-------------------+-------
      1 | Romance Policial  | 14.19
      2 | Livro de Receitas | 20.35
      3 | Atlas Mundial     | 32.99

Os preços eram 12.90, 18.50 e 29.99; o resultado foi igual nos quatro motores.

**ATENÇÃO:** sem WHERE, o UPDATE e o DELETE atingem todas as linhas da tabela, e nenhum motor pede confirmação. Repara: `UPDATE produtos SET preco = 0;` alterou 10 linhas, ou seja, a loja inteira ficou de borla. Esse foi o teste, e só correu bem porque o fizemos dentro de uma transação que desfizemos (ver adiante).

    BEGIN;                                      -- START TRANSACTION no MySQL
    UPDATE produtos SET preco = 0;              -- 10 linhas afetadas
    SELECT COUNT(*) FROM produtos WHERE preco = 0;    -- 10
    ROLLBACK;
    SELECT COUNT(*) FROM produtos WHERE preco = 0;    -- 0, tudo como dantes

**DICA:** antes de um UPDATE ou DELETE importante, escreve primeiro o SELECT com o mesmo WHERE e confirma as linhas. Faz-o dentro de uma transação, para veres as linhas afetadas antes do COMMIT.

## Ver o que foi gerado e o que foi afetado

Depois de gravar, quase sempre queres saber o id que o motor gerou e quantas linhas foram afetadas. É aqui que os dialetos mais se afastam.

    -- PostgreSQL e SQLite: RETURNING no fim do comando
    INSERT INTO avaliacoes (produto_id, nota, comentario)
    VALUES (7, 4, 'Bonito') RETURNING id;               -- 6 no PostgreSQL, 5 no SQLite

    UPDATE produtos SET stock = stock + 10 WHERE categoria_id = 3
    RETURNING id, nome, stock;     -- 4 linhas: (7, 25), (8, 18), (9, 30), (10, 210)

    -- SQL Server: OUTPUT, antes do VALUES ou do WHERE; tem inserted e deleted
    UPDATE produtos SET stock = stock + 10
    OUTPUT inserted.id, inserted.nome, deleted.stock AS antes, inserted.stock AS depois
    WHERE categoria_id = 3;                  -- devolve também o stock de antes (15, 8, 20, 200)

    -- MySQL: não tem RETURNING; usa funções
    INSERT INTO avaliacoes (produto_id, nota, comentario) VALUES (7, 4, 'Bonito');
    SELECT LAST_INSERT_ID();                 -- 5
    UPDATE produtos SET preco = ROUND(preco * 1.10, 2) WHERE categoria_id = 1;
    SELECT ROW_COUNT();                      -- 3

O DELETE também aceita RETURNING (PostgreSQL, SQLite) e OUTPUT deleted.* (SQL Server): devolve as linhas apagadas, útil para um registo de auditoria. Para o número de linhas afetadas, o SQL Server usa `@@ROWCOUNT` e o SQLite usa `changes()`. No PostgreSQL o psql mostra-o na própria resposta (UPDATE 3).

**ATENÇÃO:** no MySQL, num INSERT de várias linhas, LAST_INSERT_ID() devolve o id da primeira linha inserida. Ao inserir três avaliações num só comando, o valor devolvido foi 6, o id da primeira das três. Por outro lado, ROW_COUNT() num UPDATE conta só as linhas realmente alteradas: um UPDATE que escreve o mesmo valor dá 0.

**ATENÇÃO:** no SQL Server, `SCOPE_IDENTITY()` devolve o último id gerado na tua sessão e âmbito (6 no nosso teste). `@@IDENTITY` também deu 6, mas apanha ids gerados por triggers e, por isso, prefere SCOPE_IDENTITY() ou OUTPUT. Confirma o motivo na documentação do SQL Server.

## UPSERT: inserir ou atualizar

Um upsert insere a linha se não existir e atualiza se já existir, tudo num só comando e sem a corrida do «faz SELECT, depois decide». Precisa de uma chave única (aqui, o id da categoria). Não há sintaxe padrão que funcione em todos: cada motor tem a sua.

    -- PostgreSQL e SQLite
    INSERT INTO categorias (id, nome) VALUES (3, 'Casa e Jardim')
    ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;     -- SQLite: excluded.nome
    INSERT INTO categorias (id, nome) VALUES (3, 'Outro')
    ON CONFLICT (id) DO NOTHING;                              -- 0 linhas inseridas

    -- MySQL
    INSERT INTO categorias (id, nome) VALUES (3, 'Casa e Jardim')
    ON DUPLICATE KEY UPDATE nome = VALUES(nome);              -- ROW_COUNT() = 2
    INSERT INTO categorias (id, nome) VALUES (4, 'Brinquedos') AS novo
    ON DUPLICATE KEY UPDATE nome = novo.nome;                 -- alias, sem VALUES()

    -- SQL Server: MERGE
    MERGE categorias AS destino
    USING (VALUES (3, 'Casa e Jardim'), (4, 'Brinquedos')) AS origem (id, nome)
        ON destino.id = origem.id
    WHEN MATCHED THEN UPDATE SET nome = origem.nome
    WHEN NOT MATCHED THEN INSERT (id, nome) VALUES (origem.id, origem.nome)
    OUTPUT $action AS acao, inserted.id, inserted.nome;
    acao       id          nome
    UPDATE               3 Casa e Jardim
    INSERT               4 Brinquedos

No MySQL, ROW_COUNT() de um upsert é 1 se inseriu, 2 se atualizou e 0 se a linha ficou igual (valores confirmados no teste). Se usares a sintaxe de outro motor, o erro é de sintaxe:

    ON CONFLICT no MySQL:               ERROR 1064 (42000): ... near 'CONFLICT (id) DO NOTHING'
    ON CONFLICT no SQL Server:          Msg 156: Incorrect syntax near the keyword 'ON'.
    ON DUPLICATE KEY no SQL Server:     Msg 156: Incorrect syntax near the keyword 'ON'.
    ON DUPLICATE KEY no PostgreSQL:     ERROR:  syntax error at or near "DUPLICATE"
    ON DUPLICATE KEY ou MERGE no SQLite: near "DUPLICATE": syntax error / near "MERGE": syntax error

**NOTA:** o SQLite tem ainda `INSERT OR REPLACE`, que apaga a linha antiga e insere uma nova. Funciona (trocou a categoria 4 por «Jogos»), mas apagar e reinserir pode disparar apagamentos em cascata e perder colunas que não indicaste. Para um upsert a sério usa ON CONFLICT.

**NOTA:** o PostgreSQL 17 também tem um comando MERGE; não o testámos. Se fores usar o MERGE do SQL Server com muitos acessos simultâneos, lê primeiro as observações da documentação.

## TRUNCATE e DELETE

`DELETE FROM tabela` sem WHERE apaga linha a linha, regista cada uma e pode ser desfeito. `TRUNCATE TABLE` esvazia a tabela de uma vez, é muito mais rápido em tabelas grandes e não aceita WHERE.

    CREATE TABLE registo (id INTEGER, msg VARCHAR(20));
    INSERT INTO registo VALUES (1,'a'), (2,'b'), (3,'c');
    DELETE FROM registo;            -- 3 linhas apagadas
    TRUNCATE TABLE registo;         -- esvazia (PostgreSQL, MySQL, SQL Server)

    TRUNCATE TABLE categorias;      -- tabela referenciada por chave estrangeira
    -- PostgreSQL: cannot truncate a table referenced in a foreign key constraint (HINT: ... TRUNCATE ... CASCADE)
    -- MySQL:      ERROR 1701: Cannot truncate a table referenced in a foreign key constraint
    -- SQL Server: Msg 4712: Cannot truncate table 'categorias' because it is being referenced by a FOREIGN KEY constraint.
    -- SQLite:     near "TRUNCATE": syntax error (usa DELETE FROM registo)

Se o TRUNCATE correr dentro de uma transação, o comportamento difere. No PostgreSQL e no SQL Server o ROLLBACK desfez-o (a linha continuou lá). No MySQL, TRUNCATE (e todo o DDL) faz COMMIT implícito: depois do ROLLBACK a tabela continuou vazia.

**ATENÇÃO:** no PostgreSQL, TRUNCATE ... CASCADE esvazia também todas as tabelas que referenciam a tua. Não o uses sem veres a lista no HINT.

## Transações

Uma transação agrupa comandos numa unidade: ou todos valem, ou nenhum. Imagina que uma venda retira stock e regista a linha de encomenda; se só um dos passos ficasse gravado, os dados ficavam incoerentes.

    BEGIN;                                  -- MySQL: START TRANSACTION; SQL Server: BEGIN TRANSACTION
    UPDATE produtos SET stock = stock - 1 WHERE id = 1;
    SELECT stock FROM produtos WHERE id = 1;    -- 39: tu já vês a alteração
    ROLLBACK;                               -- desfaz
    SELECT stock FROM produtos WHERE id = 1;    -- 40: como se nada fosse

    BEGIN;
    UPDATE produtos SET stock = stock - 1 WHERE id = 1;
    COMMIT;                                 -- confirma
    SELECT stock FROM produtos WHERE id = 1;    -- 39, e agora é definitivo

O resultado foi o mesmo nos quatro. O SQL Server tem `@@TRANCOUNT` para saberes se estás dentro de uma transação (1 dentro, 0 fora).

### Autocommit

Fora de um BEGIN, cada comando é a sua própria transação, confirmada logo (autocommit): um UPDATE solto é imediato e irreversível. O MySQL tem `@@autocommit = 1`; com `SET autocommit = 0` os comandos ficam numa transação aberta até COMMIT ou ROLLBACK (testado). No SQL Server, `SET IMPLICIT_TRANSACTIONS ON` faz o mesmo (o `@@TRANCOUNT` passou a 1 após o UPDATE e o ROLLBACK reverteu). Nos drivers e clientes gráficos o autocommit depende da configuração: confirma sempre.

### O que acontece quando um comando falha

Aqui os motores são diferentes. Fizemos, em cada um, `BEGIN; UPDATE (ok); INSERT duplicado (erro); COMMIT;`.

    PostgreSQL: a transação fica abortada; o COMMIT acaba em ROLLBACK e o UPDATE perdeu-se
                (stock ficou 10, não 6). Os comandos seguintes dão: current transaction is aborted,
                commands ignored until end of transaction block
    MySQL, SQLite, SQL Server: só o comando falhado é desfeito; o UPDATE ficou gravado no COMMIT.
    SQL Server com SET XACT_ABORT ON: o erro desfaz a transação toda (@@TRANCOUNT voltou a 0).

**DICA:** não dependas do comportamento por omissão. No código aplicacional, apanha o erro e faz ROLLBACK explicitamente. No SQL Server, liga o `SET XACT_ABORT ON` nos procedimentos que fazem várias escritas.

### Propriedades ACID

Uma transação fiável garante quatro propriedades:

| Letra | Nome | O que garante |
|---|---|---|
| A | Atomicidade | Tudo ou nada: se falha a meio, desfaz-se tudo |
| C | Consistência | Passa-se de um estado válido para outro: as restrições mantêm-se |
| I | Isolamento | Transações em simultâneo não se atrapalham |
| D | Durabilidade | Depois do COMMIT, os dados sobrevivem a uma falha |

### Níveis de isolamento (visão geral)

Quanto mais forte o isolamento, menos anomalias (ler dados não confirmados, ver valores mudar a meio, ver linhas «aparecer») mas mais bloqueios ou conflitos. O padrão SQL define READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ e SERIALIZABLE. O nível por omissão:

| Motor | Nível por omissão | Como ver ou mudar |
|---|---|---|
| PostgreSQL 17 | read committed | SHOW transaction_isolation; BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE |
| MySQL 8.4 | REPEATABLE-READ | SELECT @@transaction_isolation; SET TRANSACTION ISOLATION LEVEL ... |
| SQL Server 2025 | read committed | DBCC USEROPTIONS; SET TRANSACTION ISOLATION LEVEL ... |
| SQLite 3.45 | serializable, segundo a documentação (não executado) | ver sqlite.org/isolation.html |

Basta saberes que o comportamento por omissão não é igual em todo o lado.

## Bloqueios e deadlocks

Quando duas transações querem alterar a mesma linha, a segunda espera pela primeira. Isto é um bloqueio (lock), e é normal. Demonstração real no PostgreSQL com duas ligações (A e B):

    -- A: abre transação, altera a linha 1 e fica 6 segundos parada
    BEGIN; UPDATE produtos SET stock = stock - 1 WHERE id = 1; SELECT pg_sleep(6); COMMIT;

    -- B (2 segundos depois): tenta alterar a mesma linha
    UPDATE produtos SET stock = stock - 1 WHERE id = 1;
    Time: 3867.738 ms             -- ficou pendurada até A fazer COMMIT

    -- C (terceira ligação, durante a espera): quem espera por quem
    SELECT pid, wait_event_type, wait_event, query FROM pg_stat_activity WHERE datname = 'm04';
     897 | Timeout | PgSleep       | SELECT pg_sleep(6);          (A, a dormir)
     911 | Lock    | transactionid | UPDATE produtos SET stock... (B, à espera de A)

Para não esperar indefinidamente, define `SET lock_timeout = '1s'` (a espera acaba com ERROR: canceling statement due to lock timeout) ou usa `SELECT ... FOR UPDATE NOWAIT` (erro imediato: could not obtain lock on row). Testámos ambos.

Um deadlock é pior: A espera por B e B espera por A, e nenhuma pode avançar. Provocámo-lo com A a alterar as linhas 1 e depois 2, e B a alterar 2 e depois 1:

    ERROR:  deadlock detected
    DETAIL:  Process 967 waits for ShareLock on transaction 1109; blocked by process 960.
    Process 960 waits for ShareLock on transaction 1110; blocked by process 967.

O PostgreSQL detetou o ciclo, cancelou uma das transações (B, que fez ROLLBACK) e deixou a outra (A) terminar com COMMIT. A regra para os evitar: todas as transações alteram as linhas pela mesma ordem, e mantêm-se curtas. Não executámos a demonstração no MySQL nem no SQL Server; ambos também detetam deadlocks e cancelam uma das transações (confirma o código de erro na documentação).

**DICA:** a aplicação deve estar preparada para repetir a transação quando o motor a cancelar por deadlock.

## SAVEPOINT

Um savepoint marca um ponto dentro da transação a que podes voltar sem desfazer tudo.

    BEGIN;
    INSERT INTO avaliacoes (produto_id, nota) VALUES (1, 9);
    SAVEPOINT depois_do_primeiro;
    INSERT INTO avaliacoes (produto_id, nota) VALUES (2, 8);
    ROLLBACK TO SAVEPOINT depois_do_primeiro;     -- desfaz só o segundo INSERT
    COMMIT;
    SELECT produto_id, nota FROM avaliacoes WHERE nota >= 8;
     produto_id | nota
              1 |    9

PostgreSQL, MySQL e SQLite aceitam esta sintaxe. No SQL Server escreve-se `SAVE TRANSACTION depois_do_primeiro;` e `ROLLBACK TRANSACTION depois_do_primeiro;`; o resultado foi o mesmo.

## Nos outros dialetos

Todas as linhas abaixo foram executadas, exceto as marcadas.

| Tema | SQLite 3.45 | PostgreSQL 17 | MySQL 8.4 | SQL Server 2025 |
|---|---|---|---|---|
| Id automático | INTEGER PRIMARY KEY AUTOINCREMENT | SERIAL | AUTO_INCREMENT | IDENTITY(1,1) |
| Último id gerado | RETURNING id ou last_insert_rowid() | RETURNING id | LAST_INSERT_ID() | OUTPUT inserted.id ou SCOPE_IDENTITY() |
| Devolver linhas alteradas | RETURNING | RETURNING | não existe (erro 1064) | OUTPUT inserted.x, deleted.x |
| Linhas afetadas | changes() | contagem na resposta (UPDATE 3) | ROW_COUNT() | @@ROWCOUNT |
| Upsert | ON CONFLICT (excluded.col) | ON CONFLICT (EXCLUDED.col) | ON DUPLICATE KEY UPDATE | MERGE |
| Esvaziar tabela | DELETE FROM (sem TRUNCATE) | TRUNCATE, transacional | TRUNCATE, faz COMMIT implícito | TRUNCATE, transacional |
| Iniciar transação | BEGIN | BEGIN | START TRANSACTION | BEGIN TRANSACTION |
| Autocommit | ligado | ligado | @@autocommit = 1 | ligado (IMPLICIT_TRANSACTIONS OFF) |
| Erro dentro da transação | só o comando falha | aborta a transação toda | só o comando falha | só o comando falha (com XACT_ABORT ON, tudo) |
| DDL dentro da transação | desfaz-se (CREATE TABLE testado) | desfaz-se (DROP TABLE testado) | COMMIT implícito (testado com CREATE TABLE) | desfaz-se (CREATE TABLE testado) |
| Savepoint | SAVEPOINT | SAVEPOINT | SAVEPOINT | SAVE TRANSACTION |
| Isolamento por omissão | serializable (não executado) | read committed | REPEATABLE-READ | read committed |

**Oracle e SAP HANA (NÃO executado: não há instância):** o Oracle tem MERGE (https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/MERGE.html). O SAP HANA tem o comando UPSERT (https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-sql-reference-guide/upsert-statement). Confirma o resto na documentação respetiva.

## Exercícios

**PRATICAR:** faz os exercícios 13 a 16 do módulo de exercícios (11), na base m04. Resolve-os primeiro sem consultar o gabarito (módulo 13).

## Fontes oficiais

- PostgreSQL, INSERT (ON CONFLICT, RETURNING): https://www.postgresql.org/docs/17/sql-insert.html
- PostgreSQL, isolamento de transações: https://www.postgresql.org/docs/17/transaction-iso.html
- PostgreSQL, bloqueios explícitos e deadlocks: https://www.postgresql.org/docs/17/explicit-locking.html
- MySQL, INSERT ... ON DUPLICATE KEY UPDATE: https://dev.mysql.com/doc/refman/8.4/en/insert-on-duplicate.html
- MySQL, níveis de isolamento do InnoDB: https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html
- MySQL, instruções que provocam COMMIT implícito: https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html
- SQL Server, MERGE: https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17
- SQL Server, cláusula OUTPUT: https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17
- SQLite, UPSERT: https://www.sqlite.org/lang_upsert.html
- SQLite, transações: https://www.sqlite.org/lang_transaction.html
- SQLite, isolamento: https://www.sqlite.org/isolation.html
- Oracle, MERGE (não executado): https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/MERGE.html
- SAP HANA, UPSERT (não executado): https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-sql-reference-guide/upsert-statement
