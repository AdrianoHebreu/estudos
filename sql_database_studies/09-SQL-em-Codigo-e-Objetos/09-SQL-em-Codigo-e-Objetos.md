# 09 SQL em código e objetos

Até aqui escreveste SQL à mão, num cliente. Na vida real, quem fala com a base de dados é um programa. Neste módulo ligas o Python à loja, aprendes a passar valores sem abrir portas a atacantes (SQL injection), e conheces os objetos que vivem dentro da própria base: vistas, funções, procedimentos, triggers e permissões.

Tudo foi executado em SQLite 3.45.3 (biblioteca padrão do Python 3.13), PostgreSQL 17.12, MySQL 8.4.13 e SQL Server 2025, numa base chamada m09 com o ficheiro loja.sql carregado. Os drivers de terceiros correram num ambiente virtual: psycopg 3.3.9, PyMySQL 1.2.4, pyodbc 5.5.0 (com o ODBC Driver 18 for SQL Server) e SQLAlchemy 2.1.8.

## SQL a partir de Python: o ciclo ligação, cursor, resultados

Qualquer driver segue o mesmo desenho (a norma DB-API do Python): abres uma ligação, executas SQL (diretamente ou através de um cursor) e lês as linhas. O SQLite vem na biblioteca padrão, por isso não instalas nada.

    import sqlite3
    con = sqlite3.connect(":memory:")          # ou um caminho de ficheiro
    con.executescript(open("loja.sql", encoding="utf-8").read())
    cur = con.execute("SELECT nome, preco FROM produtos WHERE categoria_id = ? AND preco > ? ORDER BY preco", (3, 20))
    print(cur.fetchall())
    # [('Candeeiro de Mesa', 22), ('Manta de Sofá', 34.5), ('Conjunto de Panelas', 89.9)]

Repara que o SQLite devolve 22 e 34.5 (tipos int e float do Python), enquanto os outros três devolvem Decimal('22.00') e Decimal('34.50'). É a tipagem dinâmica do SQLite do módulo 05 a dar sinal.

Para os outros motores só muda a ligação: `psycopg.connect("host=localhost port=25432 dbname=m09 user=... password=...")`, `pymysql.connect(host=..., port=23306, database="m09", charset="utf8mb4")` e `pyodbc.connect("DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,21433;DATABASE=m09;UID=...;PWD=...;TrustServerCertificate=yes")`.

**NOTA:** o PyMySQL devolve tuplos de tuplos, os outros devolvem listas de tuplos. Se quiseres aceder por nome de coluna, no SQLite usa `con.row_factory = sqlite3.Row` (executado: `r["nome"]` e `tuple(r)` funcionam). Os restantes drivers têm mecanismos próprios (confirma na documentação de cada um).

**NOTA:** o driver mssql-python da Microsoft não foi instalado nem executado. O SQL Server é acedido com o pyodbc.

## Consultas parametrizadas e estilos de placeholder

Nunca coles valores dentro do texto SQL. Escreve marcadores no SQL e entrega os valores à parte: o driver trata do escape e o servidor nunca confunde dados com comandos. O problema é que cada driver usa um estilo de marcador diferente (o atributo `paramstyle` da DB-API).

| Driver | Posicional | Nomeado |
|---|---|---|
| sqlite3 | ? | :nome |
| psycopg 3 | %s | %(nome)s |
| PyMySQL | %s | %(nome)s |
| pyodbc | ? | não suporta |

Exemplos executados (o resultado é o mesmo em todos):

    con.execute("SELECT nome FROM clientes WHERE cidade = :cidade ORDER BY id", {"cidade": "Lisboa"})   # SQLite
    cur.execute("SELECT nome FROM clientes WHERE cidade = %(cidade)s ORDER BY id", {"cidade": "Lisboa"}) # psycopg e PyMySQL
    # [('Ana Ribeiro',), ('Diogo Pires',), ('Hugo Teixeira',)]

Se trocares o estilo, o driver protesta (mensagens reais):

    pyodbc  com :cidade -> ProgrammingError: The SQL contains 0 parameter markers, but 1 parameters were supplied
    PyMySQL com ?       -> ProgrammingError: not all arguments converted during string formatting
    psycopg com ?       -> ProgrammingError: the query has 0 placeholders but 1 parameters were passed
    sqlite3 com 1 valor para 2 ? -> ProgrammingError: Incorrect number of bindings supplied. The current statement uses 2, and there are 1 supplied.

**ATENÇÃO:** os marcadores só substituem valores, nunca identificadores. `SELECT * FROM ?` dá `OperationalError: near "?": syntax error` no SQLite. Para nomes de tabelas ou colunas dinâmicos, escolhe o nome a partir de uma lista fixa no teu código (nunca do utilizador).

**ATENÇÃO:** nos drivers com `%s`, um `%` literal tem de ser passado como valor (por exemplo `LIKE %s` com o valor `"ana%"`), não escrito no SQL. Para inserir várias linhas usa `executemany`: `con.executemany("INSERT INTO categorias (id, nome) VALUES (?, ?)", [(4, "Jardim"), (5, "Brinquedos")])`.

## SQL injection: um ataque real e a correção

Imagina uma função que procura clientes por cidade, escrita com uma f-string:

    def procurar_mau(cidade):
        sql = f"SELECT nome, email FROM clientes WHERE cidade = '{cidade}'"
        return con.execute(sql).fetchall()

Com "Porto" funciona (devolve Bruno Costa e Filipe Lopes). Agora o atacante escreve no campo de pesquisa `x' OR '1'='1`. O SQL que chega à base é:

    SELECT nome, email FROM clientes WHERE cidade = 'x' OR '1'='1'

A condição passa a ser sempre verdadeira: o resultado foi 8 linhas, ou seja, todos os clientes e emails. Pior: com UNION lê-se outra tabela inteira. Com a entrada `x' UNION SELECT nome, CAST(stock AS TEXT) FROM produtos --` a função devolveu produtos e stocks no lugar de clientes: [('Atlas Mundial', '10'), ('Auscultadores Bluetooth', '30'), ('Candeeiro de Mesa', '15'), ...].

A correção é passar o valor como parâmetro:

    def procurar_bom(cidade):
        return con.execute("SELECT nome, email FROM clientes WHERE cidade = ?", (cidade,)).fetchall()

Com a mesma entrada maliciosa devolveu 0 linhas: o texto inteiro `x' OR '1'='1` é tratado como um nome de cidade que não existe.

Resta o ataque destrutivo, que empilha um segundo comando. Com `x'; DROP TABLE apagavel; --` (numa tabela de teste chamada apagavel, criada só para isto) o resultado depende do driver. Executado:

| Driver | O que aconteceu |
|---|---|
| sqlite3 com execute | ProgrammingError: You can only execute one statement at a time. Nada apagado |
| sqlite3 com executescript | Sem erro. A tabela foi apagada (executescript aceita vários comandos por desenho) |
| PyMySQL | ProgrammingError 1064 (erro de sintaxe). Nada apagado |
| psycopg | Sem erro. A tabela foi apagada |
| pyodbc (SQL Server) | Sem erro. A tabela foi apagada |

**ATENÇÃO:** não contes com o driver para te proteger. Dois dos quatro executaram o DROP. A defesa certa é sempre a mesma: parâmetros. Complementa com o princípio do menor privilégio (última secção): uma conta da aplicação sem permissão de DROP limita o estrago.

## Transações em código

O módulo 04 ensinou BEGIN, COMMIT e ROLLBACK. Em Python, o driver gere isso por ti, mas cada um à sua maneira (todos os comportamentos abaixo foram executados).

| Driver | Comportamento por defeito |
|---|---|
| sqlite3 | abre a transação ao primeiro INSERT, UPDATE ou DELETE. `with con:` faz commit no fim ou rollback se houver exceção, mas não fecha a ligação |
| psycopg 3 | transação implícita; `with pg.transaction():` faz commit ou rollback. `with psycopg.connect(...) as cx:` faz commit e fecha a ligação no fim |
| PyMySQL | autocommit desligado (get_autocommit() devolve False): tens de chamar commit() e rollback() |
| pyodbc | autocommit desligado (ms.autocommit devolve False): commit() e rollback() explícitos |

O padrão que importa é o mesmo: agrupar as operações que têm de funcionar em conjunto e desfazer tudo se uma falhar. Exemplo no SQLite (abate stock e depois falha numa chave duplicada):

    try:
        with con:
            con.execute("UPDATE produtos SET stock = stock - 5 WHERE id = 1")
            print(con.execute("SELECT stock FROM produtos WHERE id = 1").fetchone())   # (35,) dentro da transação
            con.execute("INSERT INTO categorias (id, nome) VALUES (1, 'Duplicada')")
    except sqlite3.IntegrityError as e:
        print("erro:", e)                  # erro: UNIQUE constraint failed: categorias.id
    print(con.execute("SELECT stock FROM produtos WHERE id = 1").fetchone())           # (40,) o UPDATE foi desfeito

Nos três outros motores o padrão manual (execute, execute, commit; em caso de exceção, rollback e raise) deu o mesmo: o stock voltou a 40 depois do erro (psycopg: UniqueViolation; PyMySQL: IntegrityError 1062; pyodbc: IntegrityError 23000).

**DICA:** abre a transação o mais tarde possível e fecha-a o mais cedo possível. Uma transação aberta enquanto esperas por input do utilizador mantém bloqueios na base.

## Pool de ligações: visão geral

Abrir uma ligação a um servidor é caro (rede, autenticação). Uma aplicação web que abra uma ligação por pedido é lenta e pode esgotar o limite de ligações do servidor. A solução é um pool: um conjunto de ligações abertas e reutilizáveis. Pedes uma emprestada, usas e devolves.

Não vamos montar um pool à mão. O SQLAlchemy traz um (QueuePool) e o psycopg tem o pacote separado psycopg_pool (não instalado nem executado aqui). Com o SQLAlchemy, executado contra o PostgreSQL:

    eng = sa.create_engine("postgresql+psycopg://postgres:...@localhost:25432/m09", pool_size=2, max_overflow=0, pool_timeout=1)
    a = eng.connect(); b = eng.connect()      # eng.pool.status(): Connections in pool: 0 ... Checked out connections: 2
    eng.connect()   # TimeoutError: QueuePool limit of size 2 overflow 0 reached, connection timed out, timeout 1.00
    a.close(); b.close()   # voltam ao pool: Connections in pool: 2

**NOTA:** "fechar" uma ligação do pool devolve-a ao pool, não a fecha no servidor. Regra de ouro: devolve sempre a ligação (com `with` ou try/finally), senão o pool esgota-se e a aplicação bloqueia.

## ORMs: visão geral

Um ORM (Object-Relational Mapper) mapeia tabelas para classes Python e gera o SQL por ti. Vantagens: parâmetros sempre usados (menos risco de injection), código portável entre dialetos, menos texto SQL repetido. Custos: esconde o SQL que corre (podes gerar consultas péssimas sem notar) e não substitui perceber índices e joins.

O SQLAlchemy 2.x, executado contra o PostgreSQL, com a loja:

    # modelos Categoria e Produto (id, nome, preco, ForeignKey e relationship)
    with Session(engine) as s:
        for p in s.scalars(select(Produto).where(Produto.preco > 40).order_by(Produto.preco)):
            print(p.nome, p.preco, p.categoria.nome)   # Auscultadores Bluetooth, Teclado Mecânico, Conjunto de Panelas
        stmt = select(Categoria.nome, func.count(Produto.id)).join(Produto).group_by(Categoria.nome).order_by(Categoria.nome)
        print(s.execute(stmt).all())      # [('Casa', 4), ('Eletrónica', 3), ('Livros', 3)]

O `print(stmt)` mostra o SQL gerado: SELECT categorias.nome, count(produtos.id) AS count_1 FROM categorias JOIN produtos ON categorias.id = produtos.categoria_id GROUP BY categorias.nome ORDER BY categorias.nome. É o que aprendeste nos módulos 02 e 03, escrito em Python. Outros ORMs existem noutras linguagens (Entity Framework, Hibernate, Prisma): não foram executados.

**DICA:** mesmo com ORM, sabe ler o SQL que ele gera. Quando houver lentidão (módulo 07), é o EXPLAIN dessa consulta que te vai salvar.

## Vistas

Uma vista é uma consulta guardada com um nome. Usa-se como se fosse uma tabela, mas não guarda dados: corre a consulta de cada vez. Serve para esconder joins repetidos, simplificar o acesso e restringir o que um utilizador vê.

    CREATE VIEW v_totais_encomenda AS
    SELECT e.id AS encomenda_id, c.nome AS cliente, e.estado,
           SUM(l.quantidade * l.preco_unitario) AS total
    FROM encomendas e
    JOIN clientes c ON c.id = e.cliente_id
    JOIN linhas_encomenda l ON l.encomenda_id = e.id
    GROUP BY e.id, c.nome, e.estado;

    SELECT * FROM v_totais_encomenda WHERE estado = 'pendente' ORDER BY encomenda_id;

Resultado igual nos quatro motores: encomendas 8 (Ana Ribeiro, 99.80), 9 (Filipe Lopes, 35.00) e 12 (Bruno Costa, 145.00); o SQLite mostra 99.8, 35.0 e 145.0 sem zeros finais.

Para alterar uma vista: PostgreSQL e MySQL têm `CREATE OR REPLACE VIEW`; o SQL Server tem `CREATE OR ALTER VIEW`; o SQLite não tem nenhum dos dois e obriga a `DROP VIEW IF EXISTS` seguido de `CREATE VIEW`.

### Vistas materializadas (só no PostgreSQL)

Uma vista materializada guarda o resultado da consulta em disco. Fica rápida a ler, mas desatualizada até a refrescares. Executado no PostgreSQL:

    CREATE MATERIALIZED VIEW mv_vendas_categoria AS
    SELECT ca.nome AS categoria, SUM(l.quantidade * l.preco_unitario) AS receita
    FROM linhas_encomenda l JOIN produtos p ON p.id = l.produto_id JOIN categorias ca ON ca.id = p.categoria_id
    JOIN encomendas e ON e.id = l.encomenda_id WHERE e.estado <> 'cancelada' GROUP BY ca.nome;

    -- Casa: 356.90. Depois de INSERT de uma linha nova de 10 canecas (65.00), a vista continua a mostrar 356.90
    REFRESH MATERIALIZED VIEW mv_vendas_categoria;   -- agora mostra 421.90

**ATENÇÃO:** `CREATE MATERIALIZED VIEW` não existe nos outros três. SQLite: `near "MATERIALIZED": syntax error`. MySQL: ERROR 1064 (42000) a apontar para MATERIALIZED VIEW. SQL Server: Msg 102, Incorrect syntax near. O equivalente do SQL Server chama-se vista indexada (confirma na documentação; não foi executado).

## Funções e procedimentos armazenados

São código que vive e corre dentro da base de dados. A diferença clássica: uma função devolve um valor e usa-se dentro de um SELECT; um procedimento executa ações (pode alterar dados) e chama-se à parte. O SQLite não tem nenhum dos dois: `CREATE FUNCTION` e `CREATE PROCEDURE` dão `near "FUNCTION": syntax error` e `near "PROCEDURE": syntax error`. Cada um dos outros três tem a sua linguagem.

### PostgreSQL (PL/pgSQL)

    CREATE OR REPLACE FUNCTION total_encomenda(p_id INTEGER) RETURNS NUMERIC AS $$
    BEGIN
        RETURN COALESCE((SELECT SUM(quantidade * preco_unitario) FROM linhas_encomenda WHERE encomenda_id = p_id), 0);
    END;
    $$ LANGUAGE plpgsql STABLE;

    SELECT id, total_encomenda(id) AS total FROM encomendas WHERE estado = 'enviada' ORDER BY id;
    --  6 |  86.89,  7 |  47.50, 11 | 158.90

    CREATE OR REPLACE PROCEDURE cancelar_encomenda(p_id INTEGER) AS $$
    DECLARE v_estado TEXT;
    BEGIN
        SELECT estado INTO v_estado FROM encomendas WHERE id = p_id;
        IF v_estado IS NULL THEN
            RAISE EXCEPTION 'Encomenda % não existe', p_id;
        ELSIF v_estado <> 'pendente' THEN
            RAISE EXCEPTION 'Só se cancelam encomendas pendentes (estado atual: %)', v_estado;
        END IF;
        UPDATE encomendas SET estado = 'cancelada' WHERE id = p_id;
    END;
    $$ LANGUAGE plpgsql;

    CALL cancelar_encomenda(9);     -- OK: a encomenda 9 passa a cancelada
    CALL cancelar_encomenda(1);     -- ERROR:  Só se cancelam encomendas pendentes (estado atual: entregue)
    CALL cancelar_encomenda(999);   -- ERROR:  Encomenda 999 não existe

O corpo vai entre `$$ ... $$` (dollar quoting) para não teres de escapar as aspas. Sem a cláusula LANGUAGE, o servidor recusa: `ERROR:  no language specified`.

### MySQL

    DELIMITER //
    CREATE PROCEDURE cancelar_encomenda(IN p_id INT)
    BEGIN
        DECLARE v_estado VARCHAR(20);
        SELECT estado INTO v_estado FROM encomendas WHERE id = p_id;
        IF v_estado IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Encomenda não existe';
        ELSEIF v_estado <> 'pendente' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Só se cancelam encomendas pendentes';
        END IF;
        UPDATE encomendas SET estado = 'cancelada' WHERE id = p_id;
    END//
    DELIMITER ;

    CALL cancelar_encomenda(1);   -- ERROR 1644 (45000): Só se cancelam encomendas pendentes

`DELIMITER //` é um comando do cliente mysql (não do servidor): muda o terminador para o cliente não cortar o corpo no primeiro `;`. A cláusula `READS SQL DATA` declara que a função só lê dados. As funções também foram criadas e executadas no MySQL (`SELECT total_encomenda(1)` devolveu 40.70 e `total_encomenda(99)` devolveu 0.00) e no SQL Server (`CREATE OR ALTER FUNCTION dbo.total_encomenda(@p_id INT) RETURNS DECIMAL(12,2) AS BEGIN RETURN ... END`, chamada como `dbo.total_encomenda(1)`).

### SQL Server (T-SQL)

    CREATE OR ALTER PROCEDURE dbo.cancelar_encomenda @p_id INT
    AS
    BEGIN
        DECLARE @estado VARCHAR(20);
        SELECT @estado = estado FROM encomendas WHERE id = @p_id;
        IF @estado IS NULL
            THROW 50001, 'Encomenda não existe', 1;
        IF @estado <> 'pendente'
            THROW 50002, 'Só se cancelam encomendas pendentes', 1;
        UPDATE encomendas SET estado = 'cancelada' WHERE id = @p_id;
    END;
    GO
    EXEC dbo.cancelar_encomenda 1;
    -- Msg 50002, Level 16, State 1 ... Só se cancelam encomendas pendentes

Em T-SQL as variáveis levam @ e o procedimento chama-se com `EXEC`. `GO` é um separador de lotes do sqlcmd, não SQL. `CREATE OR ALTER` evita o erro de "já existe".

## Triggers

Um trigger é código que corre sozinho quando há INSERT, UPDATE ou DELETE numa tabela. Útil para auditoria e regras que nunca podem ser contornadas. Exemplo na loja: ao inserir uma linha de encomenda, abater o stock do produto. Antes: o produto 5 (Carregador USB-C) tinha stock 100; inserida uma linha de 3 unidades, ficou com 97 (SQLite, PostgreSQL e MySQL).

SQLite (só tem triggers e vistas; o corpo vai entre BEGIN e END e usa NEW):

    CREATE TRIGGER trg_abater_stock AFTER INSERT ON linhas_encomenda
    BEGIN
        UPDATE produtos SET stock = stock - NEW.quantidade WHERE id = NEW.produto_id;
    END;

    CREATE TRIGGER trg_validar_stock BEFORE INSERT ON linhas_encomenda
    WHEN (SELECT stock FROM produtos WHERE id = NEW.produto_id) < NEW.quantidade
    BEGIN
        SELECT RAISE(ABORT, 'Stock insuficiente');
    END;
    -- INSERT do Teclado Mecânico (stock 0): IntegrityError: Stock insuficiente

PostgreSQL (o trigger chama uma função que devolve TRIGGER):

    CREATE FUNCTION abater_stock() RETURNS TRIGGER AS $$
    BEGIN UPDATE produtos SET stock = stock - NEW.quantidade WHERE id = NEW.produto_id; RETURN NEW; END;
    $$ LANGUAGE plpgsql;
    CREATE TRIGGER trg_abater_stock AFTER INSERT ON linhas_encomenda FOR EACH ROW EXECUTE FUNCTION abater_stock();
    -- BEFORE INSERT com RAISE EXCEPTION 'Stock insuficiente para o produto %', NEW.produto_id
    -- ERROR:  Stock insuficiente para o produto 6

MySQL (mesma ideia, com DELIMITER no cliente): `CREATE TRIGGER trg_abater_stock AFTER INSERT ON linhas_encomenda FOR EACH ROW BEGIN UPDATE produtos SET stock = stock - NEW.quantidade WHERE id = NEW.produto_id; END`. A validação faz-se num BEFORE INSERT com `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente'` (ERROR 1644 (45000): Stock insuficiente).

SQL Server (não tem BEFORE nem FOR EACH ROW; o trigger corre uma vez por instrução e vê as linhas na tabela virtual inserted):

    CREATE OR ALTER TRIGGER trg_abater_stock ON linhas_encomenda AFTER INSERT
    AS
    BEGIN
        UPDATE p SET p.stock = p.stock - i.quantidade
        FROM produtos p
        JOIN (SELECT produto_id, SUM(quantidade) AS quantidade FROM inserted GROUP BY produto_id) i ON i.produto_id = p.id;
        IF EXISTS (SELECT 1 FROM produtos p JOIN inserted i ON i.produto_id = p.id WHERE p.stock < 0)
            THROW 50003, 'Stock insuficiente', 1;
    END;

Um INSERT de duas linhas (3 e 2 unidades do produto 5) numa só instrução baixou o stock de 100 para 95: o trigger correu uma vez e tratou as duas linhas em conjunto. Sem BEFORE, a validação faz-se depois do UPDATE; o THROW dentro do trigger desfaz a instrução. Com o Teclado Mecânico (stock 0): `Msg 50003 ... Stock insuficiente`, o stock continuou 0 e a linha não ficou gravada.

| Tema | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| BEFORE | sim | sim | sim | não (usa INSTEAD OF ou valida no AFTER) |
| Por linha ou por instrução | por linha | por linha (FOR EACH ROW) | por linha | por instrução (tabela inserted) |
| Acesso aos valores | NEW e OLD | NEW e OLD | NEW e OLD | inserted e deleted |
| Erro de validação | RAISE(ABORT, msg) | RAISE EXCEPTION | SIGNAL SQLSTATE | THROW |

**ATENÇÃO:** triggers são lógica escondida: quem faz um INSERT não vê o UPDATE que se segue. Usa-os com moderação e documenta-os.

## Permissões básicas e privilégios mínimos

Uma aplicação nunca deve ligar-se como administrador (postgres, root, sa). Cria uma conta própria e dá-lhe só o que precisa (princípio do menor privilégio). Os comandos são GRANT (dar) e REVOKE (retirar). O SQLite não tem utilizadores nem permissões: `GRANT SELECT ON clientes TO alguem` dá `near "GRANT": syntax error` e `CREATE USER` também. A segurança é a do ficheiro no disco.

Cenário: uma conta só de leitura que vê os totais por encomenda (a vista) mas não os dados dos clientes.

PostgreSQL:

    CREATE ROLE leitor_m09 LOGIN PASSWORD '...';
    GRANT SELECT ON v_totais_encomenda TO leitor_m09;
    -- como leitor_m09: SELECT na vista funciona (encomenda 1, total 40.70)
    -- SELECT * FROM clientes       -> ERROR:  permission denied for table clientes
    -- UPDATE encomendas SET ...    -> ERROR:  permission denied for table encomendas
    REVOKE SELECT ON clientes FROM leitor_m09;   -- retira um privilégio dado antes

MySQL: `CREATE USER 'leitor_m09'@'%' IDENTIFIED BY '...'` e `GRANT SELECT ON m09.v_totais_encomenda TO 'leitor_m09'@'%'`. Resultado: `SELECT * FROM clientes` dá ERROR 1142 (42000): SELECT command denied to user 'leitor_m09'@'localhost' for table 'clientes'.

SQL Server (duas camadas: o LOGIN existe no servidor, o USER dentro da base de dados):

    CREATE LOGIN leitor_m09 WITH PASSWORD = '...';     -- no master
    CREATE USER leitor_m09 FOR LOGIN leitor_m09;       -- na base m09
    GRANT SELECT ON dbo.v_totais_encomenda TO leitor_m09;
    -- SELECT * FROM clientes -> Msg 229: The SELECT permission was denied on the object 'clientes'

Nos três, a vista funcionou para o leitor mesmo sem acesso às tabelas de baixo. É o que torna as vistas uma ferramenta de segurança: expõem só as colunas e linhas que queres.

**DICA:** limpa sempre as contas de teste. Executado no fim: DROP OWNED BY e DROP ROLE (PostgreSQL), DROP USER (MySQL), DROP USER e DROP LOGIN (SQL Server). No PostgreSQL, um role com privilégios não se apaga sem antes retirar os privilégios (DROP OWNED BY).

## Nos outros dialetos

| Tema | SQLite 3.45 | PostgreSQL 17 | MySQL 8.4 | SQL Server 2025 |
|---|---|---|---|---|
| DROP empilhado via injection (driver) | bloqueado em execute, executou em executescript | executou | bloqueado (erro de sintaxe) | executou |
| Alterar vista | DROP + CREATE | CREATE OR REPLACE VIEW | CREATE OR REPLACE VIEW | CREATE OR ALTER VIEW |
| Vista materializada | não existe | CREATE MATERIALIZED VIEW | não existe | não existe (vista indexada) |
| Função e procedimento | não existem | PL/pgSQL, CALL | SQL do MySQL, CALL | T-SQL, EXEC |
| Trigger | sim, por linha | sim, por linha | sim, por linha | sim, por instrução, sem BEFORE |
| Utilizadores e GRANT | não existem | CREATE ROLE, GRANT | CREATE USER, GRANT | CREATE LOGIN, CREATE USER, GRANT |

Oracle e SAP HANA: ambos suportam vistas, vistas materializadas (no Oracle), procedimentos, triggers e GRANT, com sintaxe própria (PL/SQL e SQLScript). Não foram executados: consulta a documentação oficial de cada um.

**ATENÇÃO:** o driver mssql-python não foi executado e o SQLAlchemy só foi executado contra PostgreSQL (o mesmo código muda de dialeto trocando o URL da ligação; não foi executado nos outros).

## Exercícios

**PRATICAR:** faz os exercícios 33 a 36 do módulo de exercícios (11-Exercicios-Praticos): consulta parametrizada em SQLite, injection e correção, transação em código e vista com permissões.

## Fontes oficiais

- sqlite3 (Python): https://docs.python.org/3/library/sqlite3.html
- psycopg 3, parâmetros: https://www.psycopg.org/psycopg3/docs/basic/params.html
- PyMySQL: https://pymysql.readthedocs.io/en/latest/
- pyodbc: https://github.com/mkleehammer/pyodbc/wiki
- SQLAlchemy 2.0: https://docs.sqlalchemy.org/en/20/
- SQLAlchemy, pool de ligações: https://docs.sqlalchemy.org/en/20/core/pooling.html
- OWASP, SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection
- PostgreSQL, PL/pgSQL: https://www.postgresql.org/docs/17/plpgsql.html
- PostgreSQL, CREATE MATERIALIZED VIEW: https://www.postgresql.org/docs/17/sql-creatematerializedview.html
- PostgreSQL, GRANT: https://www.postgresql.org/docs/17/sql-grant.html
- MySQL, procedimentos e funções: https://dev.mysql.com/doc/refman/8.4/en/stored-routines.html
- MySQL, GRANT: https://dev.mysql.com/doc/refman/8.4/en/grant.html
- SQL Server, CREATE TRIGGER: https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql
- SQL Server, GRANT: https://learn.microsoft.com/en-us/sql/t-sql/statements/grant-transact-sql
- SQLite, CREATE TRIGGER: https://sqlite.org/lang_createtrigger.html
- Oracle, PL/SQL: https://docs.oracle.com/en/database/oracle/oracle-database/23/lnpls/
