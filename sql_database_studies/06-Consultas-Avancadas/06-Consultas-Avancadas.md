# 06 Consultas avançadas

Até aqui cada consulta fazia uma coisa de cada vez. Neste módulo aprendes a dar nome a passos intermédios (CTE), a percorrer hierarquias, a calcular rankings e totais acumulados sem perder linhas (funções de janela) e a transformar linhas em colunas. Tudo na loja, e com as diferenças entre SQLite 3.45, PostgreSQL 17, MySQL 8.4 e SQL Server 2025 mostradas com os erros reais.

Os exemplos assumem a base da loja carregada; a hierarquia e o JSON usam mais duas tabelas.

## CTE: dar nome a uma subconsulta

Uma CTE (common table expression) é uma subconsulta com nome, declarada com WITH antes do SELECT principal. Lê-se de cima para baixo e podes reutilizá-la. Exemplo: gasto por cliente, sem encomendas canceladas.

    WITH total_por_encomenda AS (
        SELECT encomenda_id, SUM(quantidade * preco_unitario) AS total
        FROM linhas_encomenda
        GROUP BY encomenda_id
    )
    SELECT c.nome, COUNT(*) AS n_enc, SUM(t.total) AS gasto
    FROM encomendas e
    JOIN total_por_encomenda t ON t.encomenda_id = e.id
    JOIN clientes c ON c.id = e.cliente_id
    WHERE e.estado <> 'cancelada'
    GROUP BY c.nome
    ORDER BY gasto DESC, c.nome;

    nome          n_enc  gasto
    Bruno Costa   3      296.69
    Diogo Pires   2      192.50
    Ana Ribeiro   3      185.00
    Carla Mendes  1      158.90
    Eva Martins   1      47.50
    Filipe Lopes  1      35.00

Correu sem alterações nos quatro motores. Podes encadear várias CTE separadas por vírgula, e cada uma pode usar as anteriores.



**NOTA:** no SQLite o tipo DECIMAL não é exato: somas podem mostrar resíduos como 242.60000000000002 em vez de 242.60. Nos outros três motores o resultado vem exato.

## CTE recursiva: hierarquias

Uma CTE recursiva tem duas partes unidas por UNION ALL: o âncora (o ponto de partida) e o passo recursivo, que se refere à própria CTE. Repete-se até o passo não devolver linhas. Serve para organogramas, categorias dentro de categorias, árvores de pastas. Cria uma tabela com a equipa da loja:

    CREATE TABLE funcionarios (
        id INTEGER PRIMARY KEY,
        nome VARCHAR(50) NOT NULL,
        chefe_id INTEGER REFERENCES funcionarios (id)
    );
    INSERT INTO funcionarios (id, nome, chefe_id) VALUES (1, 'Marta Silva', NULL);
    INSERT INTO funcionarios (id, nome, chefe_id) VALUES (2, 'Rui Santos', 1);
    INSERT INTO funcionarios (id, nome, chefe_id) VALUES (3, 'Sofia Reis', 1);
    INSERT INTO funcionarios (id, nome, chefe_id) VALUES (4, 'Tiago Alves', 2);
    INSERT INTO funcionarios (id, nome, chefe_id) VALUES (5, 'Inês Matos', 2);
    INSERT INTO funcionarios (id, nome, chefe_id) VALUES (6, 'Paulo Dias', 4);

A consulta percorre a árvore a partir de quem não tem chefe, guardando o nível e o caminho:

    WITH RECURSIVE equipa (id, nome, nivel, caminho) AS (
        SELECT id, nome, 0, CAST(nome AS VARCHAR(200)) FROM funcionarios WHERE chefe_id IS NULL
        UNION ALL
        SELECT f.id, f.nome, e.nivel + 1, CAST(e.caminho || ' > ' || f.nome AS VARCHAR(200))
        FROM funcionarios f JOIN equipa e ON f.chefe_id = e.id
    )
    SELECT nivel, nome, caminho FROM equipa ORDER BY caminho;

    nivel  nome         caminho
    0      Marta Silva  Marta Silva
    1      Rui Santos   Marta Silva > Rui Santos
    2      Inês Matos   Marta Silva > Rui Santos > Inês Matos
    2      Tiago Alves  Marta Silva > Rui Santos > Tiago Alves
    3      Paulo Dias   Marta Silva > Rui Santos > Tiago Alves > Paulo Dias
    1      Sofia Reis   Marta Silva > Sofia Reis

Esta forma correu no SQLite, no PostgreSQL e (com as adaptações abaixo) no MySQL e no SQL Server.

**ATENÇÃO:** o CAST do âncora para VARCHAR(200) não é decoração. Sem ele, o tipo do caminho fica com a largura de nome, e o motor reclama quando o passo recursivo o alarga. Erros reais obtidos:

    PostgreSQL:  ERROR:  recursive query "equipa" column 4 has type character varying(50)
                 in non-recursive term but type character varying overall
    SQL Server:  Msg 240: Types don't match between the anchor and the recursive part
                 in column "caminho" of recursive query "equipa".
    MySQL:       ERROR 1406 (22001): Data too long for column 'caminho' at row 1

### WITH RECURSIVE ou só WITH

A palavra RECURSIVE é obrigatória no PostgreSQL e no MySQL, e proibida no SQL Server. O SQLite aceita as duas formas. Sem RECURSIVE:

    PostgreSQL:  ERROR:  relation "equipa" does not exist
                 HINT:  Use WITH RECURSIVE, or re-order the WITH items to remove forward references.
    MySQL:       ERROR 1146 (42S02): Table 'm06.equipa' doesn't exist

Com RECURSIVE no SQL Server:

    Msg 102, Level 15, State 1: Incorrect syntax near 'equipa'.

Por isso o SQL Server escreve apenas WITH equipa (...) AS (...) e concatena texto com + em vez de ||. No MySQL o operador || é um OU lógico, por isso usa CONCAT. O erro real de usar || aqui foi ERROR 1292 (22007): Truncated incorrect DOUBLE value: 'Marta Silva'.

## Funções de janela

Uma função de janela calcula sobre um conjunto de linhas relacionadas com a linha atual, mas sem as juntar (ao contrário do GROUP BY). A cláusula OVER define a janela: PARTITION BY divide em grupos, ORDER BY ordena dentro do grupo e a moldura (frame) limita as linhas consideradas.

### Rankings: ROW_NUMBER, RANK, DENSE_RANK

Ranking de clientes pelo número de encomendas não canceladas. Há empates de propósito:

    WITH gasto AS (
        SELECT c.nome, COUNT(*) AS n_enc
        FROM encomendas e
        JOIN clientes c ON c.id = e.cliente_id
        WHERE e.estado <> 'cancelada'
        GROUP BY c.nome
    )
    SELECT nome, n_enc,
           ROW_NUMBER() OVER (ORDER BY n_enc DESC, nome) AS rn,
           RANK()       OVER (ORDER BY n_enc DESC) AS rk,
           DENSE_RANK() OVER (ORDER BY n_enc DESC) AS drk
    FROM gasto
    ORDER BY rn;

    nome          n_enc  rn  rk  drk
    Ana Ribeiro   3      1   1   1
    Bruno Costa   3      2   1   1
    Diogo Pires   2      3   3   2
    Carla Mendes  1      4   4   3
    Eva Martins   1      5   4   3
    Filipe Lopes  1      6   4   3

ROW_NUMBER dá sempre 1, 2, 3... e desempata arbitrariamente (acrescenta critérios ao ORDER BY, como fizemos com o nome). RANK dá o mesmo número aos empatados e salta a seguir (1, 1, 3). DENSE_RANK dá o mesmo número e não salta (1, 1, 2).

### Totais acumulados, LAG e LEAD

Receita por mês (sem canceladas), com o acumulado, o mês anterior e a média móvel de dois meses:

    WITH mensal AS (
        SELECT SUBSTRING(CAST(e.data_encomenda AS CHAR(10)), 1, 7) AS mes,
               SUM(l.quantidade * l.preco_unitario) AS receita
        FROM encomendas e
        JOIN linhas_encomenda l ON l.encomenda_id = e.id
        WHERE e.estado <> 'cancelada'
        GROUP BY SUBSTRING(CAST(e.data_encomenda AS CHAR(10)), 1, 7)
    )
    SELECT mes, receita,
           SUM(receita) OVER (ORDER BY mes ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS acumulada,
           LAG(receita)  OVER (ORDER BY mes) AS mes_anterior,
           LEAD(receita) OVER (ORDER BY mes) AS mes_seguinte,
           AVG(receita)  OVER (ORDER BY mes ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS media_2m
    FROM mensal
    ORDER BY mes;

    mes      receita  acumulada  mes_anterior  mes_seguinte  media_2m
    2025-01  105.50   105.50     NULL          44.50         105.50
    2025-02  44.50    150.00     105.50        195.69        75.00
    2025-03  195.69   345.69     44.50         182.30        120.095
    2025-04  182.30   527.99     195.69        242.60        188.995
    2025-05  242.60   770.59     182.30        145.00        212.45
    2025-06  145.00   915.59     242.60        NULL          193.80

LAG vai buscar o valor da linha anterior e LEAD o da seguinte (NULL nas pontas; aceitam um segundo argumento para recuar mais linhas). A moldura ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW soma da primeira linha à atual. O mês foi extraído com SUBSTRING(CAST(data AS CHAR(10)), 1, 7), que correu nos quatro motores; cada um tem funções de data próprias, vistas no módulo 08.

### Top-N por grupo

Os dois produtos com mais receita em cada categoria: numera dentro de cada grupo com PARTITION BY e filtra na consulta de fora (não podes filtrar a função de janela no WHERE do mesmo nível).

    WITH por_produto AS (
        SELECT cat.nome AS categoria, p.nome AS produto,
               SUM(l.quantidade * l.preco_unitario) AS receita
        FROM linhas_encomenda l
        JOIN encomendas e ON e.id = l.encomenda_id
        JOIN produtos p ON p.id = l.produto_id
        JOIN categorias cat ON cat.id = p.categoria_id
        WHERE e.estado <> 'cancelada'
        GROUP BY cat.nome, p.nome
    ), ordenado AS (
        SELECT categoria, produto, receita,
               ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY receita DESC) AS pos
        FROM por_produto
    )
    SELECT categoria, pos, produto, receita FROM ordenado WHERE pos <= 2 ORDER BY categoria, pos;

    categoria   pos  produto                  receita
    Casa        1    Manta de Sofá            103.50
    Casa        2    Caneca de Cerâmica       97.50
    Eletrónica  1    Auscultadores Bluetooth  199.60
    Eletrónica  2    Carregador USB-C         104.30
    Livros      1    Romance Policial         90.30
    Livros      2    Livro de Receitas        55.50

## Paginação: OFFSET contra keyset

Paginar com OFFSET é simples, mas o motor tem de percorrer e deitar fora as linhas saltadas; quanto mais fundo a página, mais lento. Além disso, se entrarem linhas novas entre pedidos, uma linha pode aparecer duas vezes ou desaparecer. A paginação por keyset (ou seek) guarda o último valor visto e pede o que vem depois, aproveitando um índice. Sem ORDER BY a paginação não tem sentido, e a chave de ordenação deve ser única (junta o id).

Página 2 com páginas de 3 (OFFSET), em PostgreSQL, MySQL e SQLite:

    SELECT id, data_encomenda, estado FROM encomendas ORDER BY id LIMIT 3 OFFSET 3;

    id  data_encomenda  estado
    4   2025-02-14      cancelada
    5   2025-03-05      entregue
    6   2025-03-22      enviada

Keyset: a página seguinte à encomenda com data 2025-03-05 e id 5, ordenando por data e id. A forma com OR é a mais portátil:

    SELECT id, data_encomenda, estado FROM encomendas
    WHERE data_encomenda > '2025-03-05' OR (data_encomenda = '2025-03-05' AND id > 5)
    ORDER BY data_encomenda, id LIMIT 3;

    id  data_encomenda  estado
    6   2025-03-22      enviada
    7   2025-04-01      enviada
    8   2025-04-15      pendente

**DICA:** WHERE (data_encomenda, id) > ('2025-03-05', 5) é mais curto e deu o mesmo resultado no SQLite, PostgreSQL e MySQL; no SQL Server falha.

## Pivot: linhas para colunas

O pivot portátil usa SUM(CASE WHEN ...). Número de encomendas de cada cliente por estado:

    SELECT c.nome,
           SUM(CASE WHEN e.estado = 'entregue'  THEN 1 ELSE 0 END) AS entregue,
           SUM(CASE WHEN e.estado = 'enviada'   THEN 1 ELSE 0 END) AS enviada,
           SUM(CASE WHEN e.estado = 'pendente'  THEN 1 ELSE 0 END) AS pendente,
           SUM(CASE WHEN e.estado = 'cancelada' THEN 1 ELSE 0 END) AS cancelada
    FROM clientes c
    JOIN encomendas e ON e.cliente_id = c.id
    GROUP BY c.nome
    ORDER BY c.nome;

    nome          entregue  enviada  pendente  cancelada
    Ana Ribeiro   2         0        1         0
    Bruno Costa   1         1        1         0
    Carla Mendes  0         1        0         1

Correu nos quatro motores. O limite do pivot com CASE é que as colunas são fixas: se aparecer um estado novo, tens de editar a consulta. Isto vale também para o PIVOT do SQL Server, que exige a lista de valores à cabeça.

## Agregação de texto

Juntar os nomes dos produtos de cada encomenda numa só linha é diferente em cada motor. A forma padrão (STRING_AGG) existe no PostgreSQL e no SQL Server:

    SELECT e.id, STRING_AGG(p.nome, ', ') AS produtos
    FROM encomendas e
    JOIN linhas_encomenda l ON l.encomenda_id = e.id
    JOIN produtos p ON p.id = l.produto_id
    WHERE e.id IN (1, 2, 8)
    GROUP BY e.id
    ORDER BY e.id;

Para fixar a ordem dos nomes dentro do texto: no PostgreSQL STRING_AGG(p.nome, ', ' ORDER BY p.nome); no SQL Server STRING_AGG(p.nome, ', ') WITHIN GROUP (ORDER BY p.nome); no MySQL GROUP_CONCAT(p.nome ORDER BY p.nome SEPARATOR ', '). Resultado com a ordem fixa:

    id  produtos
    1   Carregador USB-C, Romance Policial
    2   Auscultadores Bluetooth, Carregador USB-C
    8   Auscultadores Bluetooth, Livro de Receitas, Romance Policial

**ATENÇÃO:** sem ORDER BY dentro do agregado a ordem dos nomes não é garantida (no SQLite saiu pela ordem das linhas: Romance Policial, Carregador USB-C). No MySQL o GROUP_CONCAT corta o resultado em group_concat_max_len, que neste servidor vale 1024 bytes.

## JSON básico: extrair um campo

Os quatro motores guardam JSON e extraem campos, cada um à sua maneira. Tabela de teste:

    INSERT INTO eventos (id, payload) VALUES (1, '{"cliente": "Ana Ribeiro", "canal": "web", "itens": [1, 5]}');
    INSERT INTO eventos (id, payload) VALUES (2, '{"cliente": "Bruno Costa", "canal": "loja", "itens": [4]}');
    INSERT INTO eventos (id, payload) VALUES (3, '{"cliente": "Eva Martins", "itens": []}');

A coluna payload foi criada como TEXT no SQLite, JSONB no PostgreSQL, JSON no MySQL e NVARCHAR(500) no SQL Server. O campo canal em falta (evento 3) dá NULL em todos. Para o campo canal:

    SQLite:      SELECT payload ->> '$.canal' FROM eventos;
    PostgreSQL:  SELECT payload ->> 'canal' FROM eventos;
    MySQL:       SELECT payload ->> '$.canal' FROM eventos;
    SQL Server:  SELECT JSON_VALUE(payload, '$.canal') FROM eventos;

Todos devolvem web, loja e NULL. A seta simples -> devolve JSON (com aspas: "web"), a dupla ->> devolve texto. O SQL Server não tem setas: ->> dá Msg 102, Incorrect syntax near '>>'.

## Nos outros dialetos

| Tema | SQLite 3.45 | PostgreSQL 17 | MySQL 8.4 | SQL Server 2025 |
|---|---|---|---|---|
| CTE recursiva | WITH RECURSIVE (aceita também só WITH) | WITH RECURSIVE obrigatório | WITH RECURSIVE obrigatório | só WITH; com RECURSIVE dá erro 102 |
| Concatenar texto | operador de barras verticais duplas | operador de barras verticais duplas | CONCAT (as barras são OU lógico) | + |
| Funções de janela | sim, desde 3.25 | sim | sim | sim |
| Comparação de tuplos | sim | sim | sim | não: erro 4145, usa a forma com OR |
| Paginação | LIMIT n OFFSET m | LIMIT/OFFSET ou OFFSET m ROWS FETCH NEXT n ROWS ONLY | LIMIT n OFFSET m (FETCH dá erro 1064) | OFFSET m ROWS FETCH NEXT n ROWS ONLY com ORDER BY; TOP n; LIMIT dá erro 102 |
| Pivot | só com CASE | CASE ou COUNT com FILTER | só com CASE (FILTER dá erro 1064) | CASE ou PIVOT |
| Agregar texto | GROUP_CONCAT(x, sep) ou STRING_AGG(x, sep) | STRING_AGG com ORDER BY dentro | GROUP_CONCAT (STRING_AGG não existe: erro 1305) | STRING_AGG com WITHIN GROUP |
| Extrair campo JSON | json_extract ou setas ->, ->> | setas ->, ->> em JSON/JSONB; JSON_VALUE (também funcionou no 17.12) | JSON_EXTRACT, JSON_UNQUOTE, setas | JSON_VALUE (campo simples), JSON_QUERY (objeto/array) |

Verificado por execução: o SQLite 3.45 aceitou RIGHT e FULL OUTER JOIN (o MySQL só aceitou RIGHT; FULL OUTER JOIN deu ERROR 1064), STRING_AGG, GROUP_CONCAT e FILTER; rejeitou OFFSET ... FETCH, PIVOT e JSON_VALUE (no such function). O PostgreSQL rejeitou PIVOT e GROUP_CONCAT, e, com a coluna em TEXT em vez de JSONB, o operador ->> (operator does not exist: text ->> unknown). O SQL Server rejeitou FILTER (Msg 156), ORDER BY dentro de STRING_AGG (Msg 102) e GROUP_CONCAT (Msg 195). Versões em que cada função apareceu: confirma na documentação (só a do SQLite, 3.25 para janelas, foi lida).

Oracle e SAP HANA (NÃO executado, não há instância): o Oracle tem CONNECT BY para hierarquias, além de CTE recursiva, e PIVOT próprio; confirma tudo na documentação oficial. O SAP HANA tem as suas próprias funções de janela e de agregação de texto; consulta a documentação.

## Exercícios

**PRATICAR:** faz os exercícios 21 a 24 do módulo de exercícios. Recria sempre a tabela funcionarios antes do 22.

## Fontes oficiais

- SQLite, WITH: https://www.sqlite.org/lang_with.html
- SQLite, funções de janela: https://www.sqlite.org/windowfunctions.html
- SQLite, JSON: https://www.sqlite.org/json1.html
- PostgreSQL 17, WITH: https://www.postgresql.org/docs/17/queries-with.html
- PostgreSQL 17, funções de janela: https://www.postgresql.org/docs/17/tutorial-window.html
- PostgreSQL 17, funções JSON: https://www.postgresql.org/docs/17/functions-json.html
- MySQL 8.4, WITH: https://dev.mysql.com/doc/refman/8.4/en/with.html
- MySQL 8.4, funções de janela: https://dev.mysql.com/doc/refman/8.4/en/window-functions.html
- MySQL 8.4, agregados (GROUP_CONCAT): https://dev.mysql.com/doc/refman/8.4/en/aggregate-functions.html
- MySQL 8.4, funções JSON de pesquisa: https://dev.mysql.com/doc/refman/8.4/en/json-search-functions.html
- SQL Server, WITH (CTE): https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql
- SQL Server, PIVOT e UNPIVOT: https://learn.microsoft.com/en-us/sql/t-sql/queries/from-using-pivot-and-unpivot
- SQL Server, STRING_AGG: https://learn.microsoft.com/en-us/sql/t-sql/functions/string-agg-transact-sql
- SQL Server, JSON_VALUE: https://learn.microsoft.com/en-us/sql/t-sql/functions/json-value-transact-sql
- Oracle (não executado): https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/
- SAP HANA (não executado): https://help.sap.com/docs/SAP_HANA_PLATFORM
