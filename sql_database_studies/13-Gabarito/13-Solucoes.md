# 13 Soluções e critérios

Soluções dos exercícios do módulo 11. Todas foram executadas durante a escrita do curso e os resultados mostrados são reais. Há sempre mais de uma solução correta: compara o comportamento, não o código.

## Módulo 01 · Primeiras consultas

# Soluções do módulo 01 (exercícios 1 a 4)

Todas executadas na base m01 nos quatro motores (SQLite 3.45.3, PostgreSQL 17, MySQL 8.4, SQL Server 2025).

### Exercício 1

    SELECT nome, preco, preco * 1.23 AS preco_com_iva
    FROM produtos
    WHERE preco BETWEEN 10 AND 30
    ORDER BY preco_com_iva DESC;

Resultado no PostgreSQL, MySQL e SQL Server (iguais; o SQL Server mostra os mesmos valores):

    nome                preco   preco_com_iva
    Atlas Mundial       29.99   36.8877
    Candeeiro de Mesa   22.00   27.0600
    Livro de Receitas   18.50   22.7550
    Carregador USB-C    14.90   18.3270
    Romance Policial    12.90   15.8670

No SQLite as mesmas cinco linhas, na mesma ordem, mas com os decimais em vírgula flutuante: 36.887699999999995, 27.06, 22.755, 18.327, 15.867, e os preços aparecem como 22 e 18.5.

O BETWEEN inclui os dois extremos, e o ORDER BY aceita o alias.

### Exercício 2

a)

    SELECT DISTINCT estado FROM encomendas ORDER BY estado;

    cancelada
    entregue
    enviada
    pendente

b)

    SELECT id, nome, cidade, data_registo
    FROM clientes
    WHERE cidade IN ('Lisboa', 'Porto') AND data_registo > '2024-02-01'
    ORDER BY data_registo;

    id  nome            cidade   data_registo
    2   Bruno Costa     Porto    2024-02-03
    4   Diogo Pires     Lisboa   2024-05-09
    6   Filipe Lopes    Porto    2024-08-12
    8   Hugo Teixeira   Lisboa   2024-11-20

Resultado igual nos quatro motores. A Ana (Lisboa, 2024-01-15) fica de fora pela data.

### Exercício 3

a) O Hugo tem email NULL. A comparação NULL <> 'ana.ribeiro@exemplo.pt' não é verdadeira nem falsa, é desconhecida, e o WHERE só deixa passar as linhas em que a condição é verdadeira.

b)

    SELECT id, nome, email
    FROM clientes
    WHERE email <> 'ana.ribeiro@exemplo.pt' OR email IS NULL
    ORDER BY CASE WHEN email IS NULL THEN 1 ELSE 0 END, id;

    id  nome            email
    2   Bruno Costa     bruno.costa@exemplo.pt
    3   Carla Mendes    carla.mendes@exemplo.pt
    4   Diogo Pires     diogo.pires@exemplo.pt
    5   Eva Martins     eva.martins@exemplo.pt
    6   Filipe Lopes    filipe.lopes@exemplo.pt
    7   Graça Nunes     graca.nunes@exemplo.pt
    8   Hugo Teixeira   NULL

Sete linhas, igual nos quatro motores. O CASE dá 1 aos NULL e 0 aos restantes, por isso o Hugo fica no fim em qualquer motor.

### Exercício 4

a) SQLite, PostgreSQL e MySQL:

    SELECT id, nome, preco FROM produtos ORDER BY preco DESC, id LIMIT 3 OFFSET 3;

SQL Server (e também PostgreSQL):

    SELECT id, nome, preco FROM produtos ORDER BY preco DESC, id OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY;

Resultado (ids 9, 3 e 7):

    id  nome                preco
    9   Manta de Sofá       34.50
    3   Atlas Mundial       29.99
    7   Candeeiro de Mesa   22.00

No SQL Server a primeira forma dá Msg 102: Incorrect syntax near 'LIMIT'; no SQLite e no MySQL a segunda dá erro de sintaxe perto de OFFSET.

b) SQLite e PostgreSQL (barras duplas), MySQL (só CONCAT) e SQL Server (CONCAT, sinal mais ou, no 2025, barras duplas):

    SELECT nome || ' (' || preco || ')' AS ficha FROM produtos WHERE id IN (3, 7, 9) ORDER BY id;
    SELECT CONCAT(nome, ' (', preco, ')') AS ficha FROM produtos WHERE id IN (3, 7, 9) ORDER BY id;

Resultado no PostgreSQL, MySQL e SQL Server (com CONCAT, e com as barras duplas no PostgreSQL e no SQL Server):

    Atlas Mundial (29.99)
    Candeeiro de Mesa (22.00)
    Manta de Sofá (34.50)

No SQLite (com as barras duplas e com CONCAT): Atlas Mundial (29.99), Candeeiro de Mesa (22), Manta de Sofá (34.5). A diferença vem do tipo: nos outros três a coluna é DECIMAL(10,2) e mantém as duas casas; o SQLite guarda o valor como número de vírgula flutuante e converte-o para texto sem zeros à direita. No MySQL, as barras duplas dariam 1 (operador OR) em vez de texto, como se vê ao executá-las: devolveu 1 nas três linhas.

## Módulo 02 · Agregação e funções

### Exercício 5

    SELECT COUNT(*) AS total,
           COUNT(CASE WHEN estado <> 'cancelada' THEN 1 END) AS validas
    FROM encomendas;

    SELECT SUM(preco * stock) AS valor_stock FROM produtos;

Resultado real (igual nos quatro): total 12, validas 11 e valor_stock 7304.60 (no SQLite aparece 7304.6).

COUNT ignora os NULL e o CASE sem ELSE devolve NULL para as canceladas, por isso só conta as restantes. É a mesma técnica de SUM(CASE ...), mas com COUNT.

### Exercício 6

    SELECT cliente_id, COUNT(*) AS n
    FROM encomendas
    WHERE estado <> 'cancelada'
    GROUP BY cliente_id
    HAVING COUNT(*) >= 2
    ORDER BY n DESC, cliente_id;

Resultado real (igual nos quatro): (1, 3), (2, 3), (4, 2).

O WHERE retira a encomenda cancelada da Carla (cliente 3) antes de agrupar; o HAVING elimina depois os clientes 3, 5 e 6, que ficam com uma só encomenda.

### Exercício 7

    SELECT CASE WHEN stock = 0 THEN 'esgotado' WHEN stock < 20 THEN 'baixo' ELSE 'normal' END AS nivel,
           COUNT(*) AS n
    FROM produtos
    GROUP BY CASE WHEN stock = 0 THEN 'esgotado' WHEN stock < 20 THEN 'baixo' ELSE 'normal' END
    ORDER BY n;

    SELECT nome, COALESCE(email, '(sem email)') AS contacto
    FROM clientes
    WHERE cidade = 'Lisboa'
    ORDER BY id;

Resultado real (igual nos quatro): esgotado 1, baixo 3, normal 6. E os clientes de Lisboa: Ana Ribeiro (ana.ribeiro@exemplo.pt), Diogo Pires (diogo.pires@exemplo.pt) e Hugo Teixeira ((sem email)).

A expressão CASE repete-se no GROUP BY porque o alias nivel ainda não existe nesse passo (PostgreSQL, MySQL e SQL Server recusariam o alias).

### Exercício 8

    -- SQLite
    SELECT STRFTIME('%Y-%m', data_encomenda) AS mes, COUNT(*) AS n FROM encomendas
    GROUP BY STRFTIME('%Y-%m', data_encomenda) HAVING COUNT(*) >= 2 ORDER BY mes;
    SELECT MIN(data_encomenda) AS primeira, MAX(data_encomenda) AS ultima,
           CAST(JULIANDAY(MAX(data_encomenda)) - JULIANDAY(MIN(data_encomenda)) AS INTEGER) AS dias FROM encomendas;

    -- PostgreSQL
    SELECT TO_CHAR(data_encomenda, 'YYYY-MM') AS mes, COUNT(*) AS n FROM encomendas
    GROUP BY TO_CHAR(data_encomenda, 'YYYY-MM') HAVING COUNT(*) >= 2 ORDER BY mes;
    SELECT MIN(data_encomenda) AS primeira, MAX(data_encomenda) AS ultima,
           MAX(data_encomenda) - MIN(data_encomenda) AS dias FROM encomendas;

    -- MySQL
    SELECT DATE_FORMAT(data_encomenda, '%Y-%m') AS mes, COUNT(*) AS n FROM encomendas
    GROUP BY DATE_FORMAT(data_encomenda, '%Y-%m') HAVING COUNT(*) >= 2 ORDER BY mes;
    SELECT MIN(data_encomenda) AS primeira, MAX(data_encomenda) AS ultima,
           DATEDIFF(MAX(data_encomenda), MIN(data_encomenda)) AS dias FROM encomendas;

    -- SQL Server
    SELECT FORMAT(data_encomenda, 'yyyy-MM') AS mes, COUNT(*) AS n FROM encomendas
    GROUP BY FORMAT(data_encomenda, 'yyyy-MM') HAVING COUNT(*) >= 2 ORDER BY mes;
    SELECT MIN(data_encomenda) AS primeira, MAX(data_encomenda) AS ultima,
           DATEDIFF(day, MIN(data_encomenda), MAX(data_encomenda)) AS dias FROM encomendas;

Resultado real (igual nos quatro): (a) 2025-01 2, 2025-02 2, 2025-03 2, 2025-04 3, 2025-05 2 (o mês 2025-06 tem só 1 encomenda e fica de fora); (b) primeira 2025-01-10, ultima 2025-06-01, dias 142.

Só a função muda: STRFTIME, TO_CHAR, DATE_FORMAT e FORMAT para formatar; JULIANDAY, subtração direta, DATEDIFF com duas datas e DATEDIFF com unidade para a diferença. O CAST AS INTEGER no SQLite evita o 142.0.

## Módulo 03 · Joins e subconsultas

### Exercício 9

    SELECT c.nome, c.cidade, COUNT(e.id) AS pendentes
    FROM clientes c
    LEFT JOIN encomendas e ON e.cliente_id = c.id AND e.estado = 'pendente'
    GROUP BY c.id, c.nome, c.cidade
    ORDER BY c.nome;

Resultado igual no SQLite, PostgreSQL, MySQL e SQL Server:

    nome           cidade   pendentes
    Ana Ribeiro    Lisboa   1
    Bruno Costa    Porto    1
    Carla Mendes   Braga    0
    Diogo Pires    Lisboa   0
    Eva Martins    Coimbra  0
    Filipe Lopes   Porto    1
    Graça Nunes    Faro     0
    Hugo Teixeira  Lisboa   0

A condição do estado vai para o ON: no WHERE eliminaria as linhas sem par e os zeros desapareceriam. COUNT(e.id) ignora os NULL, por isso conta 0 para quem não tem par.

### Exercício 10

    SELECT k.nome AS categoria, SUM(l.quantidade * l.preco_unitario) AS receita
    FROM categorias k
    INNER JOIN produtos p ON p.categoria_id = k.id
    INNER JOIN linhas_encomenda l ON l.produto_id = p.id
    INNER JOIN encomendas e ON e.id = l.encomenda_id
    WHERE e.estado <> 'cancelada'
    GROUP BY k.id, k.nome
    ORDER BY receita DESC;

Resultado (PostgreSQL, MySQL e SQL Server; o SQLite mostra 382.9 e 356.9 sem o zero final):

    categoria   receita
    Eletrónica  382.90
    Casa        356.90
    Livros      175.79

Cada linha de encomenda aparece uma só vez no join, por isso a soma não é inflacionada. A encomenda 4 (cancelada, Conjunto de Panelas, 89.90) fica de fora.

### Exercício 11

    -- NOT EXISTS
    SELECT p.nome FROM produtos p
    WHERE NOT EXISTS (SELECT 1 FROM linhas_encomenda l
                      INNER JOIN encomendas e ON e.id = l.encomenda_id
                      INNER JOIN clientes c ON c.id = e.cliente_id
                      WHERE l.produto_id = p.id AND c.cidade = 'Lisboa')
    ORDER BY p.nome;

    -- NOT IN
    SELECT p.nome FROM produtos p
    WHERE p.id NOT IN (SELECT l.produto_id FROM linhas_encomenda l
                       INNER JOIN encomendas e ON e.id = l.encomenda_id
                       INNER JOIN clientes c ON c.id = e.cliente_id
                       WHERE c.cidade = 'Lisboa')
    ORDER BY p.nome;

    -- LEFT JOIN com derived table
    SELECT p.nome FROM produtos p
    LEFT JOIN (SELECT DISTINCT l.produto_id FROM linhas_encomenda l
               INNER JOIN encomendas e ON e.id = l.encomenda_id
               INNER JOIN clientes c ON c.id = e.cliente_id
               WHERE c.cidade = 'Lisboa') v ON v.produto_id = p.id
    WHERE v.produto_id IS NULL
    ORDER BY p.nome;

As três consultas devolvem, nos quatro motores, o mesmo resultado: Atlas Mundial, Candeeiro de Mesa, Conjunto de Panelas, Manta de Sofá.

Aqui o NOT IN funciona porque produto_id é NOT NULL. Se aceitasse NULL, uma só linha com NULL na lista faria o NOT IN devolver zero linhas (x NOT IN (..., NULL) nunca é verdadeiro); o NOT EXISTS não tem esse problema.

### Exercício 12

    SELECT c.nome, MAX(t.total) AS maior_encomenda
    FROM clientes c
    INNER JOIN (SELECT e.id, e.cliente_id, SUM(l.quantidade * l.preco_unitario) AS total
                FROM encomendas e
                INNER JOIN linhas_encomenda l ON l.encomenda_id = e.id
                GROUP BY e.id, e.cliente_id) t ON t.cliente_id = c.id
    GROUP BY c.id, c.nome
    HAVING MAX(t.total) > (SELECT AVG(x.total)
                           FROM (SELECT SUM(l.quantidade * l.preco_unitario) AS total
                                 FROM linhas_encomenda l GROUP BY l.encomenda_id) x)
    ORDER BY maior_encomenda DESC;

Resultado (PostgreSQL, MySQL e SQL Server; o SQLite mostra 158.9, 145.0, 108.8 e 99.8):

    nome          maior_encomenda
    Carla Mendes  158.90
    Bruno Costa   145.00
    Diogo Pires   108.80
    Ana Ribeiro   99.80

O total por encomenda é calculado primeiro numa derived table (uma linha por encomenda), e só depois juntado ao cliente, por isso não há multiplicação de linhas. Ambas as derived tables têm alias (t e x), obrigatório no MySQL e no SQL Server.

## Módulo 04 · Modificar dados e transações

### Exercício 13

    INSERT INTO produtos (id, nome, categoria_id, preco, stock)
    VALUES (11, 'Mochila Urbana', 3, 39.90, 12), (12, 'Rato Sem Fios', 2, 19.90, 50);
    UPDATE produtos SET preco = ROUND(preco * 0.90, 2) WHERE stock >= 100;
    DELETE FROM produtos WHERE id = 12;
    SELECT id, nome, preco, stock FROM produtos WHERE id IN (5, 10, 11, 12) ORDER BY id;

Resultado (igual nos quatro motores; o PostgreSQL respondeu INSERT 0 2, UPDATE 2 e DELETE 1):

     id |        nome        | preco | stock
    ----+--------------------+-------+-------
      5 | Carregador USB-C   | 13.41 |   100
     10 | Caneca de Cerâmica |  5.85 |   200
     11 | Mochila Urbana     | 39.90 |    12

São três linhas: o produto 12 foi apagado e já não existe. Os preços 14.90 e 6.50 passaram a 13.41 e 5.85. O UPDATE afetou 2 linhas (produtos 5 e 10, os únicos com stock a partir de 100).

### Exercício 14

    -- PostgreSQL
    CREATE TABLE lista_espera (id SERIAL PRIMARY KEY, produto_id INTEGER NOT NULL, email VARCHAR(100) NOT NULL);
    INSERT INTO lista_espera (produto_id, email) VALUES (6, 'ana.ribeiro@exemplo.pt') RETURNING id;          -- 1
    INSERT INTO lista_espera (produto_id, email)
    VALUES (6, 'bruno.costa@exemplo.pt'), (6, 'carla.mendes@exemplo.pt'), (3, 'diogo.pires@exemplo.pt')
    RETURNING id;                                                                                            -- 2, 3, 4
    DELETE FROM lista_espera WHERE produto_id = 6 RETURNING id, email;                                       -- 3 linhas (ids 1, 2, 3)

    -- SQLite: igual ao PostgreSQL, mudando só a coluna para id INTEGER PRIMARY KEY AUTOINCREMENT
    -- resultados: 1; depois 2, 3, 4; DELETE ... RETURNING devolveu os ids 1, 2 e 3

    -- MySQL: id INT AUTO_INCREMENT PRIMARY KEY
    INSERT INTO lista_espera (produto_id, email) VALUES (6, 'ana.ribeiro@exemplo.pt');
    SELECT LAST_INSERT_ID();       -- 1
    INSERT INTO lista_espera (produto_id, email)
    VALUES (6, 'bruno.costa@exemplo.pt'), (6, 'carla.mendes@exemplo.pt'), (3, 'diogo.pires@exemplo.pt');
    SELECT LAST_INSERT_ID();       -- 2 (o id da PRIMEIRA linha do lote; os inseridos foram 2, 3 e 4)
    DELETE FROM lista_espera WHERE produto_id = 6;
    SELECT ROW_COUNT();            -- 3

    -- SQL Server: id INT IDENTITY(1,1) PRIMARY KEY
    INSERT INTO lista_espera (produto_id, email) OUTPUT inserted.id VALUES (6, 'ana.ribeiro@exemplo.pt');   -- 1
    INSERT INTO lista_espera (produto_id, email) OUTPUT inserted.id
    VALUES (6, 'bruno.costa@exemplo.pt'), (6, 'carla.mendes@exemplo.pt'), (3, 'diogo.pires@exemplo.pt');   -- 2, 3, 4
    SELECT SCOPE_IDENTITY() AS ultimo;                                                                       -- 4 (o último)
    DELETE FROM lista_espera OUTPUT deleted.id, deleted.email WHERE produto_id = 6;                          -- ids 1, 2, 3
    SELECT @@ROWCOUNT AS afetadas;                                                                           -- 3

No fim, em todos os motores, a tabela só tem a linha (4, produto 3, diogo.pires@exemplo.pt). Nota: o PostgreSQL, o SQLite e o SQL Server devolvem todos os ids novos (RETURNING ou OUTPUT). O mecanismo do «último id» dá resultados diferentes num lote: LAST_INSERT_ID() do MySQL dá o primeiro (2), SCOPE_IDENTITY() do SQL Server dá o último (4). No SQLite, executei também um lote de duas linhas e last_insert_rowid() devolveu a última (6, depois de os ids 5 e 6 serem atribuídos).

### Exercício 15

    -- PostgreSQL (SQLite: igual, com excluded em minúsculas)
    INSERT INTO produtos (id, nome, categoria_id, preco, stock)
    VALUES (3, 'Atlas Mundial', 1, 29.99, 15), (21, 'Cadeira de Escritório', 3, 119.00, 6)
    ON CONFLICT (id) DO UPDATE SET stock = EXCLUDED.stock, preco = EXCLUDED.preco;

    -- MySQL
    INSERT INTO produtos (id, nome, categoria_id, preco, stock)
    VALUES (3, 'Atlas Mundial', 1, 29.99, 15), (21, 'Cadeira de Escritório', 3, 119.00, 6) AS novo
    ON DUPLICATE KEY UPDATE stock = novo.stock, preco = novo.preco;

    -- SQL Server
    MERGE produtos AS destino
    USING (VALUES (3, 'Atlas Mundial', 1, 29.99, 15), (21, 'Cadeira de Escritório', 3, 119.00, 6))
        AS origem (id, nome, categoria_id, preco, stock)
        ON destino.id = origem.id
    WHEN MATCHED THEN UPDATE SET stock = origem.stock, preco = origem.preco
    WHEN NOT MATCHED THEN INSERT (id, nome, categoria_id, preco, stock)
        VALUES (origem.id, origem.nome, origem.categoria_id, origem.preco, origem.stock);

Resultado de SELECT id, nome, preco, stock FROM produtos WHERE id IN (3, 21) ORDER BY id (igual nos quatro; o SQLite mostra o preço 119 sem casas decimais por causa da afinidade numérica do tipo DECIMAL):

     id |         nome          | preco  | stock
    ----+-----------------------+--------+-------
      3 | Atlas Mundial         |  29.99 |    15
     21 | Cadeira de Escritório | 119.00 |     6

O produto 3 existia (stock 10 passou a 15) e o 21 foi inserido. No MySQL, ROW_COUNT() deu 3: 1 pela inserção mais 2 pela atualização.

Erros da alínea b (executados no módulo; ver a aula): ON DUPLICATE KEY no PostgreSQL dá syntax error at or near "DUPLICATE"; ON CONFLICT no SQL Server dá Msg 156, Incorrect syntax near the keyword 'ON'.

### Exercício 16

    BEGIN;                          -- MySQL: START TRANSACTION; SQL Server: BEGIN TRANSACTION
    INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (13, 5, '2025-06-10', 'pendente');
    INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (27, 13, 4, 1, 49.90);
    UPDATE produtos SET stock = stock - 1 WHERE id = 4;
    SAVEPOINT antes_teclado;        -- SQL Server: SAVE TRANSACTION antes_teclado;
    INSERT INTO linhas_encomenda (id, encomenda_id, produto_id, quantidade, preco_unitario) VALUES (28, 13, 6, 1, 79.00);
    UPDATE produtos SET stock = stock - 1 WHERE id = 6;
    SELECT id, stock FROM produtos WHERE id IN (4, 6) ORDER BY id;
    ROLLBACK TO SAVEPOINT antes_teclado;    -- SQL Server: ROLLBACK TRANSACTION antes_teclado;
    COMMIT;
    SELECT id, stock FROM produtos WHERE id IN (4, 6) ORDER BY id;
    SELECT encomenda_id, produto_id, quantidade FROM linhas_encomenda WHERE encomenda_id = 13 ORDER BY id;

Resultados (iguais nos quatro motores). Na alínea b, antes do ROLLBACK TO:

     id | stock
    ----+-------
      4 |    29
      6 |    -1

O produto 6 (Teclado Mecânico) tinha stock 0, por isso ficou a -1: vendemos algo que não existe (a tabela não tem nenhuma restrição que o impedisse). Depois do ROLLBACK TO SAVEPOINT e do COMMIT:

     id | stock
    ----+-------
      4 |    29
      6 |     0

     encomenda_id | produto_id | quantidade
    --------------+------------+------------
               13 |          4 |          1

Ficou gravada a encomenda 13 com a primeira linha e o stock do produto 4 baixado; a parte depois do savepoint foi desfeita. Com um ROLLBACK simples (alínea d) não ficava nada: nem a encomenda 13, nem a linha 27, nem a baixa de stock do produto 4.

## Módulo 05 · Modelação e DDL

# Soluções do módulo 05 (exercícios 17 a 20)

Todas executadas na base m05 nos quatro motores (SQLite 3.45.3, PostgreSQL 17, MySQL 8.4, SQL Server 2025).

### Exercício 17

    CREATE TABLE lista_desejos (
        cliente_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        adicionado_em DATE NOT NULL,
        PRIMARY KEY (cliente_id, produto_id),
        FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE,
        FOREIGN KEY (produto_id) REFERENCES produtos (id) ON DELETE CASCADE
    );
    INSERT INTO lista_desejos (cliente_id, produto_id, adicionado_em) VALUES (1, 6, '2026-11-01');
    INSERT INTO lista_desejos (cliente_id, produto_id, adicionado_em) VALUES (1, 4, '2026-11-02');
    INSERT INTO lista_desejos (cliente_id, produto_id, adicionado_em) VALUES (2, 6, '2026-11-03');
    INSERT INTO lista_desejos (cliente_id, produto_id, adicionado_em) VALUES (1, 6, '2026-11-04');
    SELECT c.nome AS cliente, p.nome AS produto
    FROM lista_desejos l
    JOIN clientes c ON c.id = l.cliente_id
    JOIN produtos p ON p.id = l.produto_id
    ORDER BY c.nome, p.nome;
    DROP TABLE lista_desejos;

O mesmo script correu sem alterações nos quatro. O quarto INSERT falha em todos por chave primária duplicada:

    SQLite:     UNIQUE constraint failed: lista_desejos.cliente_id, lista_desejos.produto_id
    PostgreSQL: duplicate key value violates unique constraint "lista_desejos_pkey"
    MySQL:      ERROR 1062: Duplicate entry '1-6' for key 'lista_desejos.PRIMARY'
    SQL Server: Msg 2627: Violation of PRIMARY KEY constraint ...

Resultado (igual nos quatro):

    cliente      produto
    Ana Ribeiro  Auscultadores Bluetooth
    Ana Ribeiro  Teclado Mecânico
    Bruno Costa  Teclado Mecânico

A chave composta impede o par repetido, e o ON DELETE CASCADE limpa a lista quando o cliente ou o produto desaparece. No SQLite o CASCADE só atua com PRAGMA foreign_keys = ON (neste exercício não foi testado o apagamento).

### Exercício 18

a) Só mudam o id e o booleano:

    SQLite:      id INTEGER PRIMARY KEY AUTOINCREMENT,                       ativo BOOLEAN NOT NULL DEFAULT 1
    PostgreSQL:  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,        ativo BOOLEAN NOT NULL DEFAULT TRUE
    MySQL:       id INTEGER AUTO_INCREMENT PRIMARY KEY,                      ativo BOOLEAN NOT NULL DEFAULT TRUE
    SQL Server:  id INT IDENTITY(1,1) PRIMARY KEY,                           ativo BIT NOT NULL DEFAULT 1

O resto é igual nos quatro:

    CREATE TABLE cupoes (
        id ...,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        desconto_pct INTEGER NOT NULL CHECK (desconto_pct BETWEEN 1 AND 90),
        valido_ate DATE NOT NULL,
        ativo ...
    );

b)

    INSERT INTO cupoes (codigo, desconto_pct, valido_ate) VALUES ('NATAL10', 10, '2026-12-31');
    INSERT INTO cupoes (codigo, desconto_pct, valido_ate) VALUES ('NATAL10', 15, '2026-12-31');
    INSERT INTO cupoes (codigo, desconto_pct, valido_ate) VALUES ('GRATIS', 100, '2026-12-31');
    INSERT INTO cupoes (codigo, desconto_pct, valido_ate) VALUES ('SEMDATA', 5, NULL);
    SELECT id, codigo, desconto_pct, valido_ate, ativo FROM cupoes ORDER BY id;

Falham os três últimos, por UNIQUE, CHECK e NOT NULL respetivamente:

    SQLite:     UNIQUE constraint failed: cupoes.codigo / CHECK constraint failed: desconto_pct BETWEEN 1 AND 90 / NOT NULL constraint failed: cupoes.valido_ate
    PostgreSQL: duplicate key ... "cupoes_codigo_key" / violates check constraint "cupoes_desconto_pct_check" / null value in column "valido_ate" ... violates not-null constraint
    MySQL:      ERROR 1062 Duplicate entry 'NATAL10' / ERROR 3819 Check constraint 'cupoes_chk_1' is violated / ERROR 1048 Column 'valido_ate' cannot be null
    SQL Server: Msg 2627 (UNIQUE KEY) / Msg 547 (CHECK) / Msg 515 (NULL)

Fica uma linha: id 1, NATAL10, 10, 2026-12-31, ativo verdadeiro (mostrado como 1 no SQLite, MySQL e SQL Server e como t no PostgreSQL).

No PostgreSQL as linhas recusadas consumiram valores da identidade: o erro do CHECK mostrou «Failing row contains (3, GRATIS, ...)» e o do NOT NULL mostrou o id 4. Os ids não são reaproveitados, por isso as sequências têm «buracos».

### Exercício 19

    PRAGMA foreign_keys;
    INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (900, 999, '2026-11-13', 'nova');
    SELECT e.id, e.cliente_id
    FROM encomendas e LEFT JOIN clientes c ON c.id = e.cliente_id
    WHERE c.id IS NULL;
    DELETE FROM encomendas WHERE id = 900;
    PRAGMA foreign_keys = ON;
    PRAGMA foreign_keys;
    INSERT INTO encomendas (id, cliente_id, data_encomenda, estado) VALUES (901, 999, '2026-11-13', 'nova');
    SELECT COUNT(*) AS orfas
    FROM encomendas e LEFT JOIN clientes c ON c.id = e.cliente_id
    WHERE c.id IS NULL;

Resultado real:

    a) foreign_keys = 0
    b) INSERT aceite; o LEFT JOIN devolve a linha id 900, cliente_id 999
    c) foreign_keys = 1; o INSERT falha com «FOREIGN KEY constraint failed»; orfas = 0

d) Nesses três sistemas as chaves estrangeiras estão sempre ativas (no MySQL, com o motor InnoDB, que é o predefinido); o SQLite, por compatibilidade histórica, deixa-as desligadas até cada ligação executar o PRAGMA. A explicação histórica não foi verificada: confirma na documentação do SQLite.

### Exercício 20

PostgreSQL:

    ALTER TABLE fornecedores ADD COLUMN pais VARCHAR(30) NOT NULL DEFAULT 'PT';
    ALTER TABLE fornecedores RENAME COLUMN nome TO designacao;
    ALTER TABLE fornecedores ALTER COLUMN designacao TYPE VARCHAR(100);

MySQL:

    ALTER TABLE fornecedores ADD COLUMN pais VARCHAR(30) NOT NULL DEFAULT 'PT';
    ALTER TABLE fornecedores RENAME COLUMN nome TO designacao;
    ALTER TABLE fornecedores MODIFY COLUMN designacao VARCHAR(100) NOT NULL;

SQL Server:

    ALTER TABLE fornecedores ADD pais VARCHAR(30) NOT NULL DEFAULT 'PT';
    EXEC sp_rename 'fornecedores.nome', 'designacao', 'COLUMN';
    ALTER TABLE fornecedores ALTER COLUMN designacao VARCHAR(100) NOT NULL;

Nos três, SELECT * FROM fornecedores ORDER BY id devolve:

    id  designacao         pais
    1   Papelaria Central  PT
    2   Tech Norte         PT

No PostgreSQL e no SQL Server, INFORMATION_SCHEMA.COLUMNS confirmou designacao como varchar com comprimento 100 e pais como varchar(30). O sp_rename avisa «Caution: Changing any part of an object name could break scripts and stored procedures.» (aviso normal).

SQLite: as alíneas a) e b) funcionam (ADD COLUMN e RENAME COLUMN); a c) dá o erro abaixo e resolve-se reconstruindo a tabela:

    ALTER TABLE fornecedores ALTER COLUMN designacao TYPE VARCHAR(100);
    -- near "ALTER": syntax error
    CREATE TABLE fornecedores_nova (id INTEGER PRIMARY KEY, designacao VARCHAR(100) NOT NULL, pais VARCHAR(30) NOT NULL DEFAULT 'PT');
    INSERT INTO fornecedores_nova (id, designacao, pais) SELECT id, designacao, pais FROM fornecedores;
    DROP TABLE fornecedores;
    ALTER TABLE fornecedores_nova RENAME TO fornecedores;
    SELECT * FROM fornecedores ORDER BY id;

Resultado: as mesmas duas linhas, com pais igual a PT. Em tabelas reais, faz a reconstrução dentro de uma transação e lembra-te de recriar índices e chaves estrangeiras que apontem para a tabela.

## Módulo 06 · Consultas avançadas

# Soluções do módulo 06 (21 a 24)

Todas executadas na base m06 (SQLite 3.45.3, PostgreSQL 17.12, MySQL 8.4.13, SQL Server 2025).

### Exercício 21

    WITH total_cliente AS (
        SELECT e.cliente_id, SUM(l.quantidade * l.preco_unitario) AS gasto
        FROM encomendas e
        JOIN linhas_encomenda l ON l.encomenda_id = e.id
        WHERE e.estado <> 'cancelada'
        GROUP BY e.cliente_id
    )
    SELECT c.nome, t.gasto
    FROM total_cliente t
    JOIN clientes c ON c.id = t.cliente_id
    WHERE t.gasto > 150
    ORDER BY t.gasto DESC;

Resultado (igual nos quatro motores; o SQLite mostra 192.5, 185.0 e 158.9 sem zeros finais):

    nome          gasto
    Bruno Costa   296.69
    Diogo Pires   192.50
    Ana Ribeiro   185.00
    Carla Mendes  158.90

A CTE agrega por cliente; o filtro de 150 fica fora, na consulta principal (também podia usar HAVING dentro da CTE).

### Exercício 22

    WITH RECURSIVE equipa (id, nome, nivel) AS (
        SELECT id, nome, 0 FROM funcionarios WHERE id = 2
        UNION ALL
        SELECT f.id, f.nome, e.nivel + 1
        FROM funcionarios f JOIN equipa e ON f.chefe_id = e.id
    )
    SELECT nome, nivel FROM equipa WHERE nivel > 0 ORDER BY nivel, nome;

Resultado (igual nos quatro motores):

    nome         nivel
    Inês Matos   1
    Tiago Alves  1
    Paulo Dias   2

No SQL Server tira a palavra RECURSIVE (WITH equipa (...) AS (...)); o resto ficou igual e deu o mesmo resultado. O âncora é o próprio Rui (nível 0), que o filtro final exclui.

### Exercício 23

    WITH ordenadas AS (
        SELECT c.nome, e.id AS encomenda, e.data_encomenda, e.estado,
               ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY e.data_encomenda DESC, e.id DESC) AS pos
        FROM clientes c
        JOIN encomendas e ON e.cliente_id = c.id
    )
    SELECT nome, encomenda, data_encomenda, estado
    FROM ordenadas
    WHERE pos = 1
    ORDER BY nome;

Resultado (igual nos quatro motores):

    nome          encomenda  data_encomenda  estado
    Ana Ribeiro   8          2025-04-15      pendente
    Bruno Costa   12         2025-06-01      pendente
    Carla Mendes  11         2025-05-12      enviada
    Diogo Pires   10         2025-05-03      entregue
    Eva Martins   7          2025-04-01      enviada
    Filipe Lopes  9          2025-04-20      pendente

O Hugo Teixeira não aparece porque não tem encomendas (o JOIN interno elimina-o). A janela numera por cliente e fica-se com a posição 1.

### Exercício 24

Versão com CASE (SQLite, PostgreSQL, MySQL e SQL Server):

    WITH linhas AS (
        SELECT SUBSTRING(CAST(e.data_encomenda AS CHAR(10)), 1, 7) AS mes,
               cat.nome AS categoria,
               l.quantidade * l.preco_unitario AS valor
        FROM linhas_encomenda l
        JOIN encomendas e ON e.id = l.encomenda_id
        JOIN produtos p ON p.id = l.produto_id
        JOIN categorias cat ON cat.id = p.categoria_id
        WHERE e.estado <> 'cancelada'
    )
    SELECT mes,
           SUM(CASE WHEN categoria = 'Livros'     THEN valor ELSE 0 END) AS livros,
           SUM(CASE WHEN categoria = 'Eletrónica' THEN valor ELSE 0 END) AS eletronica,
           SUM(CASE WHEN categoria = 'Casa'       THEN valor ELSE 0 END) AS casa,
           SUM(valor) AS total
    FROM linhas
    GROUP BY mes
    ORDER BY mes;

    mes      livros  eletronica  casa    total
    2025-01  25.80   79.70       0.00    105.50
    2025-02  18.50   0.00        26.00   44.50
    2025-03  42.89   108.80      44.00   195.69
    2025-04  49.90   49.90       82.50   182.30
    2025-05  0.00    44.70       197.90  242.60
    2025-06  38.70   99.80       6.50    145.00

(Valores do PostgreSQL/MySQL/SQL Server; o SQLite mostra 0, 25.8 e 242.60000000000002 por não ter DECIMAL exato.) Versão com PIVOT, só SQL Server:

    SELECT mes, [Livros], [Eletrónica], [Casa]
    FROM (
        SELECT SUBSTRING(CAST(e.data_encomenda AS CHAR(10)), 1, 7) AS mes,
               cat.nome AS categoria,
               l.quantidade * l.preco_unitario AS valor
        FROM linhas_encomenda l
        JOIN encomendas e ON e.id = l.encomenda_id
        JOIN produtos p ON p.id = l.produto_id
        JOIN categorias cat ON cat.id = p.categoria_id
        WHERE e.estado <> 'cancelada'
    ) AS origem
    PIVOT (SUM(valor) FOR categoria IN ([Livros], [Eletrónica], [Casa])) AS p
    ORDER BY mes;

    mes      Livros  Eletrónica  Casa
    2025-01  25.80   79.70       NULL
    2025-02  18.50   NULL        26.00
    2025-03  42.89   108.80      44.00
    2025-04  49.90   49.90       82.50
    2025-05  NULL    44.70       197.90
    2025-06  38.70   99.80       6.50

Com CASE e ELSE 0 as células vazias saem 0; com PIVOT saem NULL, porque simplesmente não há linhas para essa combinação. O PIVOT não tem coluna de total: teria de ser somada à parte.

## Módulo 07 · Índices e desempenho

# Soluções do módulo 07 (exercícios 25 a 28)

Executadas no SQLite 3.45.3 (Python 3.13) com a tabela pedidos de 100 000 linhas; o exercício 27 e o 28 também foram executados no PostgreSQL 17. Os tempos variam de máquina para máquina.

### Exercício 25

    SELECT * FROM pedidos WHERE email = 'user77777@exemplo.pt';
    CREATE INDEX idx_pedidos_email ON pedidos (email);

Resultado real:

    sem índice:  SCAN pedidos                                                     9,62 ms   1 linha
    CREATE INDEX demorou 75,7 ms
    com índice:  SEARCH pedidos USING INDEX idx_pedidos_email (email=?)           0,06 ms   1 linha

SCAN passou a SEARCH: de varrimento das 100 000 linhas a procura direta no índice (cerca de 160 vezes mais rápido). O índice demorou 76 ms a criar, uma vez.

### Exercício 26

    CREATE INDEX idx_estado_cliente ON pedidos (estado, cliente_id);
    -- depois: DROP INDEX idx_estado_cliente; CREATE INDEX idx_cliente_estado ON pedidos (cliente_id, estado);

Resultado real:

    Índice (estado, cliente_id):
      A  SCAN pedidos                                                         6,49 ms  (20 linhas)
      B  SEARCH ... USING INDEX idx_estado_cliente (estado=? AND cliente_id=?) 0,04 ms  (7 linhas)
      C  SEARCH ... USING COVERING INDEX idx_estado_cliente (estado=?)         0,60 ms  (2000 linhas)
    Índice (cliente_id, estado):
      A  SEARCH ... USING INDEX idx_cliente_estado (cliente_id=?)              0,05 ms
      B  SEARCH ... USING INDEX idx_cliente_estado (cliente_id=? AND estado=?) 0,04 ms
      C  SCAN pedidos USING COVERING INDEX idx_cliente_estado                  3,46 ms

Um índice composto só serve para procurar a partir do prefixo. Com (estado, cliente_id) a consulta A não encontra o prefixo e varre. Só com A e B, a melhor ordem é (cliente_id, estado), que serve as duas. Com a C a decisão depende da frequência: com (estado, cliente_id) a C é procura (0,60 ms) mas a A varre (6,49 ms); com (cliente_id, estado) é a C que varre (3,46 ms, ainda assim num índice mais pequeno do que a tabela). Se as três forem frequentes, são precisos dois índices.

### Exercício 27

    SELECT COUNT(*) FROM pedidos WHERE strftime('%Y-%m', data_pedido) = '2024-03';
    SELECT COUNT(*) FROM pedidos WHERE data_pedido >= '2024-03-01' AND data_pedido < '2024-04-01';

Resultado real no SQLite (o plano e os tempos; sem o índice em data_pedido a função dá SCAN pedidos, 28,2 ms):

    com função:   SCAN pedidos USING COVERING INDEX idx_pedidos_data                    21,60 ms
    com intervalo: SEARCH pedidos USING COVERING INDEX idx_pedidos_data (data_pedido>? AND data_pedido<?)  0,19 ms

No PostgreSQL (TO_CHAR(data_pedido, 'YYYY-MM') = '2024-03' contra o mesmo intervalo):

    com função:    Index Only Scan using ex_data, Filter: (to_char(...) = '2024-03'), Rows Removed by Filter: 95753   31,4 ms
    com intervalo: Index Only Scan using ex_data, Index Cond: (data_pedido >= ... AND data_pedido < ...)            0,46 ms

O índice está ordenado pelo valor de data_pedido, não pelo resultado de strftime ou de TO_CHAR; com a função a base tem de a calcular em cada uma das 100 000 entradas. O intervalo deixa-a ir direta às entradas de março (4247 linhas, nos dois motores).

### Exercício 28

a)

    SELECT data_pedido, total FROM pedidos WHERE cliente_id = 77 AND estado = 'entregue' ORDER BY data_pedido;

    sem índice:           SCAN pedidos + USE TEMP B-TREE FOR ORDER BY                            6,45 ms
    índice (cliente_id):  SEARCH ... USING INDEX (cliente_id=?) + USE TEMP B-TREE FOR ORDER BY   0,04 ms

b) Igualdade primeiro (cliente_id, estado), depois a coluna do ORDER BY (data_pedido), depois a coluna só lida (total):

    CREATE INDEX idx_otimo ON pedidos (cliente_id, estado, data_pedido, total);

    SEARCH pedidos USING COVERING INDEX idx_otimo (cliente_id=? AND estado=?)    0,04 ms   (6 linhas, sem TEMP B-TREE)

Não há ordenação (o índice já está por data dentro de cada par cliente/estado) nem visita à tabela. No PostgreSQL: `CREATE INDEX ex_otimo ON ex (cliente_id, estado, data_pedido) INCLUDE (total);` deu `Index Only Scan using ex_otimo ... Heap Fetches: 0`, 0,033 ms (antes: Seq Scan + Sort, 5,9 ms).

c) Cópia de 100 000 linhas, no SQLite:

    sem índice: 85 ms
    com idx_otimo: 391 ms

A escrita ficou cerca de 4,6 vezes mais lenta por causa de um único índice largo. Compensa se a consulta for frequente e a tabela for sobretudo lida.

## Módulo 08 · Dialetos de SQL

# Soluções do módulo 08 (exercícios 29 a 32)

Todas executadas na base m08 nos quatro motores (SQLite 3.45.3, PostgreSQL 17.12, MySQL 8.4.13, SQL Server 2025).

### Exercício 29

SQLite, PostgreSQL e MySQL (LIMIT e OFFSET):

    SELECT CONCAT(nome, ' <', COALESCE(email, 'sem email'), '>') AS cliente
    FROM clientes ORDER BY nome LIMIT 3 OFFSET 6;

SQL Server (OFFSET FETCH, que exige ORDER BY):

    SELECT CONCAT(nome, ' <', COALESCE(email, 'sem email'), '>') AS cliente
    FROM clientes ORDER BY nome OFFSET 6 ROWS FETCH NEXT 3 ROWS ONLY;

Resultado igual nos quatro (a página 3 só tem 2 clientes, os oito clientes dão 3 + 3 + 2):

    Graça Nunes <graca.nunes@exemplo.pt>
    Hugo Teixeira <sem email>

O CONCAT trata o NULL como texto vazio, mas aqui o COALESCE já o substituiu. O CONCAT e o COALESCE são portáveis; só a paginação muda.

### Exercício 30

| Query | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| a) nome = 'ana ribeiro' | 0 | 0 | 1 | 1 |
| b) primeiro id ORDER BY email | 8 | 1 | 8 | 8 |
| c) 10 / 4 e 10.0 / 4 | 2 e 2.5 | 2 e 2.5000000000000000 | 2.5000 e 2.50000 | 2 e 2.500000 |

Divergências: a) o SQLite e o PostgreSQL distinguem maiúsculas na comparação; o MySQL e o SQL Server (collations por omissão utf8mb4_0900_ai_ci e SQL_Latin1_General_CP1_CI_AS) não. b) o PostgreSQL põe os NULL no fim em ordem ascendente, os outros no início (o Hugo, id 8, tem email NULL). c) o MySQL devolve decimal na divisão de dois inteiros; os outros três devolvem inteiro. Em todos, 10.0 / 4 dá decimal, só muda o número de casas.

Reescritas (executadas nos quatro, com TOP 1 ou LIMIT 1 conforme o sistema na alínea b):

    SELECT COUNT(*) FROM clientes WHERE LOWER(nome) = 'ana ribeiro';
    SELECT id FROM clientes
    ORDER BY CASE WHEN email IS NULL THEN 1 ELSE 0 END, email, id LIMIT 1;
    SELECT 10.0 / 4 AS b;

Resultados: a) 1 em todos; b) 1 em todos; c) 2.5 (com mais ou menos casas decimais conforme o motor, ver tabela).

### Exercício 31

a) SQLite (no PostgreSQL é igual, com EXCLUDED em vez de excluded):

    CREATE TABLE m08_alertas (produto_id INTEGER PRIMARY KEY, minimo INTEGER NOT NULL);
    INSERT INTO m08_alertas (produto_id, minimo) VALUES (6, 10)
    ON CONFLICT (produto_id) DO UPDATE SET minimo = excluded.minimo;

(repetido para (6, 20) e (4, 5)). MySQL:

    INSERT INTO m08_alertas (produto_id, minimo) VALUES (6, 10) AS novo
    ON DUPLICATE KEY UPDATE minimo = novo.minimo;

SQL Server (um MERGE por linha):

    MERGE m08_alertas WITH (HOLDLOCK) AS alvo
    USING (VALUES (6, 10)) AS novo (produto_id, minimo)
    ON alvo.produto_id = novo.produto_id
    WHEN MATCHED THEN UPDATE SET minimo = novo.minimo
    WHEN NOT MATCHED THEN INSERT (produto_id, minimo) VALUES (novo.produto_id, novo.minimo);

Resultado nos quatro, depois de ordenar por produto_id:

    produto_id | minimo
    4          | 5
    6          | 20

b) SQLite e PostgreSQL: STRING_AGG(nome, ', ' ORDER BY nome); MySQL: GROUP_CONCAT(nome ORDER BY nome SEPARATOR ', '); SQL Server: STRING_AGG(nome, ', ') WITHIN GROUP (ORDER BY nome). Em todos, com WHERE stock < 20 GROUP BY categoria_id ORDER BY categoria_id:

    1 | Atlas Mundial
    2 | Teclado Mecânico
    3 | Candeeiro de Mesa, Conjunto de Panelas

c) ON CONFLICT no MySQL: ERROR 1064, a sintaxe falha em CONFLICT; no SQL Server: Msg 156, Incorrect syntax near the keyword 'ON' (ambos executados na preparação do módulo).

### Exercício 32

Versão para SQLite:

    SELECT CONCAT(nome, ' (', cidade, ')') AS cliente,
           CAST(JULIANDAY('2025-01-01') - JULIANDAY(data_registo) AS INTEGER) AS dias,
           CASE WHEN email IS NULL THEN 1 ELSE 0 END AS sem_email
    FROM clientes WHERE LOWER(cidade) = 'lisboa'
    ORDER BY CASE WHEN email IS NULL THEN 1 ELSE 0 END, email DESC
    LIMIT 2 OFFSET 1;

MySQL: igual, com DATEDIFF('2025-01-01', data_registo) AS dias. SQL Server: igual, com DATEDIFF(day, data_registo, '2025-01-01') AS dias e a paginação OFFSET 1 ROWS FETCH NEXT 2 ROWS ONLY em vez de LIMIT. O PostgreSQL aceita a versão do SQLite com dias = DATE '2025-01-01' - data_registo.

Resultado (igual nos quatro, e igual ao da query original no PostgreSQL):

    cliente                 | dias | sem_email
    Ana Ribeiro (Lisboa)    | 352  | 0
    Hugo Teixeira (Lisboa)  | 42   | 1

O que é comum: CONCAT (as duas barras seriam OR no MySQL), LOWER(cidade) = 'lisboa' em vez de ILIKE (que dá erro nos outros três), o CASE para o booleano (SQL Server não tem condições como valor, ver Msg 156) e o CASE na ordenação em vez de NULLS LAST (erro no MySQL e no SQL Server). O que ficou por dialeto: a diferença de datas e a paginação (LIMIT no SQLite, MySQL e PostgreSQL; OFFSET FETCH no SQL Server).

## Módulo 09 · SQL em código e objetos

# Soluções do módulo 09 (33 a 36)

Executadas em SQLite 3.45.3 (Python 3.13) e PostgreSQL 17.12 (psql, ligação como o role de teste).

### Exercício 33

    sql = """SELECT p.nome, p.preco FROM produtos p JOIN categorias c ON c.id = p.categoria_id
             WHERE c.nome = :categoria AND p.stock > :minimo ORDER BY p.preco"""
    print(con.execute(sql, {"categoria": "Eletrónica", "minimo": 0}).fetchall())
    sql2 = sql.replace(":categoria", "?").replace(":minimo", "?")
    print(con.execute(sql2, ("Eletrónica", 0)).fetchall())
    print(con.execute(sql, {"categoria": "Casa", "minimo": 10}).fetchall())

Resultado:

    [('Carregador USB-C', 14.9), ('Auscultadores Bluetooth', 49.9)]
    [('Carregador USB-C', 14.9), ('Auscultadores Bluetooth', 49.9)]
    [('Caneca de Cerâmica', 6.5), ('Candeeiro de Mesa', 22), ('Manta de Sofá', 34.5)]

O Teclado Mecânico (Eletrónica) fica de fora porque o stock é 0. Com marcadores nomeados passa-se um dicionário; com ? passa-se um tuplo pela ordem em que os ? aparecem.

### Exercício 34

    def por_estado_mau(estado):
        return con.execute(f"SELECT id, cliente_id, estado FROM encomendas WHERE estado = '{estado}' ORDER BY id").fetchall()
    def por_estado_bom(estado):
        return con.execute("SELECT id, cliente_id, estado FROM encomendas WHERE estado = ? ORDER BY id", (estado,)).fetchall()

    a1 = "x' OR '1'='1"
    a2 = "x' UNION SELECT id, 0, email FROM clientes WHERE email IS NOT NULL --"

Resultado:

    por_estado_mau("pendente")  -> [(8, 1, 'pendente'), (9, 6, 'pendente'), (12, 2, 'pendente')]
    len(por_estado_mau(a1))     -> 12   (todas as encomendas)
    por_estado_mau(a2)[:3]      -> [(1, 0, 'ana.ribeiro@exemplo.pt'), (2, 0, 'bruno.costa@exemplo.pt'), (3, 0, 'carla.mendes@exemplo.pt')]
    len(por_estado_mau(a2))     -> 7    (os 7 emails existentes)
    por_estado_bom(a1), por_estado_bom(a2), por_estado_bom("pendente") -> [] [] [(8, 1, 'pendente'), (9, 6, 'pendente'), (12, 2, 'pendente')]

O primeiro ataque torna a condição sempre verdadeira; o segundo acrescenta os emails de outra tabela e o comentário -- elimina o resto do SQL. Com o parâmetro, a entrada inteira é só um valor de estado que não existe.

### Exercício 35

    def registar_encomenda(con, cliente_id, itens):
        with con:
            cur = con.execute("INSERT INTO encomendas (cliente_id, data_encomenda, estado) VALUES (?, '2025-07-01', 'pendente')", (cliente_id,))
            enc = cur.lastrowid
            for produto_id, qtd in itens:
                preco, stock = con.execute("SELECT preco, stock FROM produtos WHERE id = ?", (produto_id,)).fetchone()
                if stock < qtd:
                    raise ValueError(f"Stock insuficiente para o produto {produto_id}")
                con.execute("INSERT INTO linhas_encomenda (encomenda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)", (enc, produto_id, qtd, preco))
                con.execute("UPDATE produtos SET stock = stock - ? WHERE id = ?", (qtd, produto_id))
            return enc

Chamadas (contagens: encomendas, linhas, stock dos produtos 5 e 6):

    antes             (12, 26, [(100,), (0,)])
    registar_encomenda(con, 1, [(5, 2), (10, 1)])  -> 13, contagens (13, 28, [(98,), (0,)])
    registar_encomenda(con, 2, [(5, 1), (6, 1)])   -> ValueError: Stock insuficiente para o produto 6
    depois do erro    (13, 28, [(98,), (0,)])

Na segunda chamada já se tinha inserido a encomenda, a linha do produto 5 e abatido o stock; o with con fez rollback quando a exceção saiu, por isso os números ficaram iguais aos de antes.

### Exercício 36

    CREATE VIEW v_resumo_cliente AS
    SELECT c.id, c.cidade, COUNT(DISTINCT e.id) AS n_encomendas,
           COALESCE(SUM(l.quantidade * l.preco_unitario), 0) AS gasto
    FROM clientes c
    LEFT JOIN encomendas e ON e.cliente_id = c.id AND e.estado <> 'cancelada'
    LEFT JOIN linhas_encomenda l ON l.encomenda_id = e.id
    GROUP BY c.id, c.cidade;
    CREATE ROLE analista_m09 LOGIN PASSWORD 'Analista_2026!';
    GRANT SELECT ON v_resumo_cliente TO analista_m09;

Como analista_m09:

    SELECT * FROM v_resumo_cliente ORDER BY gasto DESC, id LIMIT 4;
     id | cidade | n_encomendas | gasto
      2 | Porto  |            3 | 296.69
      4 | Lisboa |            2 | 192.50
      1 | Lisboa |            3 | 185.00
      3 | Braga  |            1 | 158.90

    SELECT nome, email FROM clientes;
    ERROR:  permission denied for table clientes

Limpeza (como postgres): REVOKE SELECT ON v_resumo_cliente FROM analista_m09; DROP OWNED BY analista_m09; DROP ROLE analista_m09; DROP VIEW v_resumo_cliente. Todos devolveram sucesso.

Equivalentes (não executados neste exercício; a mesma ideia foi executada na aula): MySQL com CREATE USER 'analista_m09'@'%' IDENTIFIED BY '...' e GRANT SELECT ON m09.v_resumo_cliente TO 'analista_m09'@'%'; SQL Server com CREATE LOGIN analista_m09 WITH PASSWORD = '...', CREATE USER analista_m09 FOR LOGIN analista_m09 e GRANT SELECT ON dbo.v_resumo_cliente TO analista_m09.

## Projeto final · Exercício 37

O projeto é aberto, por isso não há uma solução única. Usa a grelha do módulo 10 (9 critérios, de 0 a 3, máximo 27) e esta tabela para avaliares cada parte.

| Parte | Está bom quando... | Sinal de alerta |
|---|---|---|
| Modelo | Chaves e restrições corretas, CHECK na nota, relação 1:N justificada | Sem chaves estrangeiras ou sem restrições |
| Relatórios | Cada um confirmado à mão sobre o loja.sql | Resultados nunca conferidos |
| NULL e junções | Produtos sem avaliações e clientes sem encomendas aparecem | INNER JOIN onde era preciso LEFT JOIN |
| Transação | Encomenda e stock atualizados juntos, com ROLLBACK testado | Atualizações soltas, sem teste de falha |
| Desempenho | Plano e tempo antes e depois, nos dois dialetos | Só uma medição, sem plano |
| Segurança | Todas as consultas parametrizadas | Qualquer f-string com dados do utilizador |
| Portabilidade | Diferenças isoladas numa camada, com tabela no README | SQL específico espalhado pelo código |

**DICA:** pede a um colega que corra o projeto só com o README. Se não conseguir, falta documentação.
