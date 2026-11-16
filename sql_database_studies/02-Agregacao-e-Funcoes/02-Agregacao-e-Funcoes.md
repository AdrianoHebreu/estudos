# 02 Agregação e funções

Até agora cada linha do resultado correspondia a uma linha da tabela. Neste módulo aprendes a resumir muitas linhas numa só (totais, médias, contagens por grupo) e a transformar valores com funções de texto, números e datas. É aqui que os dialetos começam a divergir a sério: todos os exemplos foram executados em SQLite 3.45, PostgreSQL 17, MySQL 8.4 e SQL Server 2025. Usamos a loja: 8 clientes, 10 produtos, 12 encomendas e 26 linhas de encomenda.

## Funções de agregação

Uma função de agregação recebe várias linhas e devolve um único valor.

| Função | O que devolve |
|---|---|
| COUNT(*) | número de linhas |
| COUNT(coluna) | número de linhas em que a coluna não é NULL |
| COUNT(DISTINCT coluna) | número de valores distintos não NULL |
| SUM(coluna) e AVG(coluna) | soma e média |
| MIN(coluna) e MAX(coluna) | menor e maior valor |

    SELECT COUNT(*) AS clientes, COUNT(email) AS com_email, COUNT(DISTINCT cidade) AS cidades
    FROM clientes;

    clientes | com_email | cidades
    ---------+-----------+--------
           8 |         7 |       5

O Hugo Teixeira não tem email (NULL): por isso COUNT(*) dá 8 e COUNT(email) dá 7. Todas as agregações ignoram os NULL, exceto COUNT(*).

    SELECT COUNT(*) AS n, SUM(stock) AS stock_total, AVG(preco) AS preco_medio,
           MIN(preco) AS minimo, MAX(preco) AS maximo
    FROM produtos;

    n  | stock_total | preco_medio | minimo | maximo
    ---+-------------+-------------+--------+-------
    10 |         448 |      35.809 |   6.50 |  89.90

**ATENÇÃO:** sobre um conjunto vazio, COUNT devolve 0, mas SUM, AVG, MIN e MAX devolvem NULL (testado com WHERE preco > 1000: os quatro servidores devolvem NULL no SUM). Usa COALESCE (mais abaixo) se precisares de 0.

**NOTA:** a mesma média aparece como 35.809000000000005 no SQLite (vírgula flutuante), 35.8090000000000000 no PostgreSQL e 35.809000 no MySQL e no SQL Server. Para valores limpos usa ROUND.

## GROUP BY: uma linha por grupo

GROUP BY divide as linhas em grupos e aplica a agregação a cada grupo.

    SELECT cidade, COUNT(*) AS n
    FROM clientes
    GROUP BY cidade
    ORDER BY n DESC, cidade;

    cidade  | n
    --------+--
    Lisboa  | 3
    Porto   | 2
    Braga   | 1
    Coimbra | 1
    Faro    | 1

Podes agrupar por várias colunas e agregar expressões, como a receita por produto (SUM(quantidade * preco_unitario), no exemplo de HAVING abaixo).

A regra de ouro: tudo o que está no SELECT e não está dentro de uma agregação tem de estar no GROUP BY. Se a quebrares, cada servidor reage à sua maneira:

    SELECT cidade, nome, COUNT(*) FROM clientes GROUP BY cidade;

    PostgreSQL: ERROR:  column "clientes.nome" must appear in the GROUP BY clause or be used in an aggregate function
    MySQL:      ERROR 1055 (42000): Expression #2 of SELECT list is not in GROUP BY clause and contains
                nonaggregated column 'm02.clientes.nome' ... incompatible with sql_mode=only_full_group_by
    SQL Server: Msg 8120: Column 'clientes.nome' is invalid in the select list because it is not contained
                in either an aggregate function or the GROUP BY clause.
    SQLite:     sem erro. Devolve uma linha por cidade com um nome escolhido pelo motor.

**ATENÇÃO:** o comportamento do SQLite é uma armadilha: o resultado parece certo, mas o nome escolhido é arbitrário. Não dependas disso.

## WHERE e HAVING

WHERE filtra linhas antes de agrupar; HAVING filtra grupos depois de agregar. Uma agregação no WHERE não é permitida:

    SELECT produto_id FROM linhas_encomenda WHERE SUM(quantidade) > 5 GROUP BY produto_id;

    PostgreSQL: ERROR:  aggregate functions are not allowed in WHERE
    MySQL:      ERROR 1111 (HY000): Invalid use of group function
    SQLite:     OperationalError: misuse of aggregate: SUM()

O correto é HAVING. Produtos com receita acima de 100:

    SELECT produto_id, SUM(quantidade) AS unidades, SUM(quantidade * preco_unitario) AS receita
    FROM linhas_encomenda
    GROUP BY produto_id
    HAVING SUM(quantidade * preco_unitario) > 100
    ORDER BY receita DESC, produto_id;

    produto_id | unidades | receita
    -----------+----------+--------
             4 |        4 |  199.60
             8 |        2 |  179.80
             5 |        7 |  104.30
             9 |        3 |  103.50

Num mesmo comando, o WHERE corta linhas primeiro (por exemplo, WHERE data_encomenda >= '2025-02-01') e o HAVING corta grupos depois (HAVING COUNT(*) >= 2).

## A ordem lógica de execução

Escreves o SELECT primeiro, mas o servidor avalia por esta ordem:

| Passo | Cláusula | O que faz |
|---|---|---|
| 1 | FROM | escolhe a tabela |
| 2 | WHERE | filtra linhas |
| 3 | GROUP BY | forma os grupos |
| 4 | HAVING | filtra grupos |
| 5 | SELECT | calcula as colunas e os alias |
| 6 | ORDER BY | ordena o resultado |
| 7 | LIMIT, TOP ou FETCH | corta linhas (sintaxe por dialeto: módulo 01) |

Consequência: o alias nasce no passo 5, por isso o WHERE (passo 2) ainda não o conhece, mas o ORDER BY (passo 6) já.

    SELECT preco * stock AS valor FROM produtos WHERE valor > 1000;

    PostgreSQL: ERROR:  column "valor" does not exist
    MySQL:      ERROR 1054 (42S22): Unknown column 'valor' in 'where clause'
    SQL Server: Msg 207: Invalid column name 'valor'.
    SQLite:     funciona (devolve 1497.0, 1490.0 e 1300.0): extensão do SQLite fora do padrão.

O mesmo acontece no HAVING: HAVING n > 1 (com n = COUNT(*)) funciona no SQLite e no MySQL, mas falha no PostgreSQL (column "n" does not exist) e no SQL Server (Invalid column name 'n'). Para correr em todos, repete a expressão: HAVING COUNT(*) > 1.

## CASE: condições dentro da consulta

CASE é o if do SQL e é igual nos quatro dialetos: devolve o valor do primeiro WHEN verdadeiro, ou o ELSE.

    SELECT nome, preco,
           CASE WHEN preco < 15 THEN 'barato'
                WHEN preco < 50 THEN 'medio'
                ELSE 'caro' END AS escalao
    FROM produtos
    WHERE id IN (1, 4, 6)
    ORDER BY id;

    nome                    | preco | escalao
    ------------------------+-------+--------
    Romance Policial        | 12.90 | barato
    Auscultadores Bluetooth | 49.90 | medio
    Teclado Mecânico        | 79.00 | caro

Dentro de uma agregação, CASE dá contagens condicionais: SUM(CASE WHEN estado = 'entregue' THEN 1 ELSE 0 END) conta 5 encomendas entregues (e 3 pendentes com a condição equivalente).

## COALESCE e NULLIF

COALESCE(a, b, ...) devolve o primeiro valor que não é NULL. NULLIF(a, b) devolve NULL quando a é igual a b, e a caso contrário. Ambas existem nos quatro.

    SELECT nome, COALESCE(email, 'sem email') AS contacto FROM clientes WHERE id IN (7, 8) ORDER BY id;

    nome          | contacto
    --------------+-----------------------
    Graça Nunes   | graca.nunes@exemplo.pt
    Hugo Teixeira | sem email

O uso clássico de NULLIF é evitar divisões por zero: o Teclado Mecânico (id 6) tem stock 0, e 100 / NULLIF(stock, 0) devolve NULL em vez de erro. Como as agregações ignoram NULL, também serve para excluir zeros de uma média:

    SELECT AVG(stock) AS media, AVG(NULLIF(stock, 0)) AS media_sem_zero FROM produtos;

    SQLite:      44.8     | 49.77777777777778
    PostgreSQL:  44.8000000000000000 | 49.7777777777777778
    MySQL:       44.8000  | 49.7778
    SQL Server:  44       | 49

**ATENÇÃO:** no SQL Server, AVG de uma coluna inteira devolve um inteiro (44, não 44.8), porque stock é INTEGER. Para decimais converte primeiro: AVG(CAST(stock AS DECIMAL(10,2))). Os outros três já devolvem decimais.

## Funções de texto

Resultados para a Graça Nunes (id 7), com o nome da função em cada dialeto:

| Operação | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| Tamanho em caracteres | LENGTH (11) | LENGTH ou CHAR_LENGTH (11) | CHAR_LENGTH (11) | LEN (11) |
| Maiúsculas e minúsculas | UPPER, LOWER | UPPER, LOWER | UPPER, LOWER | UPPER, LOWER |
| Substring | SUBSTR ou SUBSTRING | SUBSTR ou SUBSTRING | SUBSTR ou SUBSTRING | SUBSTRING |
| Concatenar | duas barras verticais ou CONCAT | duas barras verticais ou CONCAT | CONCAT | operador +, CONCAT ou duas barras verticais |
| Aparar e substituir | TRIM, REPLACE | TRIM, REPLACE | TRIM, REPLACE | TRIM, REPLACE |

    SELECT UPPER(nome) AS maiusc, SUBSTRING(nome, 1, 3) AS tres FROM clientes WHERE id = 7;

    maiusc      | tres
    ------------+-----
    GRAÇA NUNES | Gra

Em SUBSTRING(texto, inicio, comprimento) a primeira posição é 1, não 0. Quando uma função não existe, cada servidor responde à sua maneira:

    SQLite:     LEN(nome)          -> no such function: LEN
    PostgreSQL: LEN(nome)          -> function len(character varying) does not exist
    MySQL:      LEN(nome)          -> FUNCTION m02.LEN does not exist
    SQL Server: LENGTH(nome)       -> 'LENGTH' is not a recognized built-in function name.
    SQL Server: SUBSTR(nome, 1, 3) -> 'SUBSTR' is not a recognized built-in function name.

**ATENÇÃO:** no MySQL, LENGTH conta bytes e não caracteres: para 'Graça Nunes' devolve 12 (o «ç» ocupa 2 bytes em UTF-8), enquanto CHAR_LENGTH devolve 11. No SQL Server, LEN ignora espaços finais ('ola   ' dá 3) e DATALENGTH devolve bytes.

Concatenar com NULL é onde os dialetos mais divergem. Para o Hugo (email NULL):

| Expressão | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| nome, duas barras verticais, email | NULL | NULL | 0 (sem erro) | NULL |
| CONCAT(nome, email) | Hugo Teixeira | Hugo Teixeira | NULL | Hugo Teixeira |

**ATENÇÃO:** no MySQL as duas barras verticais são o operador OR por omissão: 'a' com duas barras e 'b' devolve 0 sem avisar. Usa CONCAT. E repara que CONCAT ignora os NULL em SQLite 3.45, PostgreSQL e SQL Server, mas devolve NULL no MySQL. Se o valor pode ser NULL, protege-o: CONCAT(nome, COALESCE(email, '')).

**NOTA:** no SQL Server 2025 as duas barras verticais funcionaram (testado). Em versões anteriores confirma na documentação; o operador + (nome + email dá NULL com email NULL) é o tradicional.

## Funções de números

    SELECT ROUND(AVG(preco), 2) AS media2, CEILING(4.2) AS teto, FLOOR(4.8) AS chao, ABS(-5) AS absoluto FROM produtos;

    media2 | teto | chao | absoluto
    -------+------+------+---------
     35.81 |    5 |    4 |        5

ROUND, CEILING, FLOOR e ABS existem nos quatro (o SQLite 3.45 usado aqui tem CEILING e FLOOR). Mudam os pormenores: o SQLite mostra 5.0 e 4.0 em CEILING e FLOOR, e o SQL Server preserva a escala do tipo (35.810000). Com casas negativas, ROUND(1234.567, -2) dá 1200 no PostgreSQL e no MySQL, 1200.000 no SQL Server e 1235.0 no SQLite, que ignora as casas negativas.

### Divisão inteira: 7/2 não dá o mesmo em todo o lado

    SELECT 7/2 AS inteiros, 7/2.0 AS com_decimal, -7/2 AS negativo, 7 % 2 AS resto;

| Servidor | 7/2 | 7/2.0 | -7/2 | 7 % 2 |
|---|---|---|---|---|
| SQLite | 3 | 3.5 | -3 | 1 |
| PostgreSQL | 3 | 3.5000000000000000 | -3 | 1 |
| MySQL | 3.5000 | 3.5000 | -3.5000 | 1 |
| SQL Server | 3 | 3.500000 | -3 | 1 |

Em SQLite, PostgreSQL e SQL Server, dois inteiros dão um inteiro, truncado em direção a zero (-7/2 = -3). No MySQL o operador / devolve sempre decimal e a divisão inteira é o operador DIV (7 DIV 2 = 3 e -7 DIV 2 = -3). No PostgreSQL também existe a função div(7, 2), que dá 3. Para obter decimais nos outros, torna um dos operandos decimal (7/2.0).

**ATENÇÃO:** é um erro silencioso: a mesma média ou percentagem pode sair truncada num servidor e certa noutro, sem qualquer aviso. Testa sempre divisões entre inteiros.

**DICA:** no MySQL, decimal é palavra reservada: SELECT 7/2.0 AS decimal dá ERROR 1064 (42000): You have an error in your SQL syntax. Escolhe outro alias.

## Funções de datas

As datas são o tema com mais diferenças. O SQLite não tem tipo de data verdadeiro: guardas texto ISO (AAAA-MM-DD) e usas funções que o interpretam. Os exemplos usam a encomenda 1 (10 de janeiro de 2025) e comparam com 1 de junho de 2025.

| Operação | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| Data atual | DATE('now') | CURRENT_DATE | CURDATE() ou CURRENT_DATE | CAST(GETDATE() AS date) |
| Data e hora atuais | DATETIME('now') | NOW() | NOW() | GETDATE() ou SYSDATETIME() |
| Ano | STRFTIME('%Y', d) | EXTRACT(YEAR FROM d) | EXTRACT(YEAR FROM d) | YEAR(d) |
| Mês | STRFTIME('%m', d) | EXTRACT(MONTH FROM d) | MONTH(d) | DATEPART(month, d) |
| Diferença em dias | JULIANDAY(a) - JULIANDAY(b) | a - b | DATEDIFF(a, b) | DATEDIFF(day, b, a) |
| Somar 30 dias | DATE(d, '+30 days') | d + 30 | DATE_ADD(d, INTERVAL 30 DAY) | DATEADD(day, 30, d) |
| Formatar dd/mm/aaaa | STRFTIME('%d/%m/%Y', d) | TO_CHAR(d, 'DD/MM/YYYY') | DATE_FORMAT(d, '%d/%m/%Y') | FORMAT(d, 'dd/MM/yyyy') |

Resultado para a encomenda 1 nos quatro: ano 2025, mês 1, 142 dias até 1 de junho, mais 30 dias = 2025-02-09, formatada 10/01/2025. A data atual saiu 2026-11-13: é a do teu computador, o teu valor será outro.

Pormenores que surpreendem:

- PostgreSQL: EXTRACT devolve numeric (testado com pg_typeof). A subtração de datas dá um inteiro (142). AGE(DATE '2025-06-01', DATE '2025-01-10') devolve um intervalo: 4 mons 22 days.
- SQLite: STRFTIME devolve texto ('01' no mês), JULIANDAY dá decimal (142.0) e a sintaxe EXTRACT não existe (near "FROM": syntax error).
- MySQL: DATEDIFF leva duas datas e dá a primeira menos a segunda (DATEDIFF('2025-01-10', '2025-06-01') = -142). Para meses usa TIMESTAMPDIFF(MONTH, a, b) (4).
- SQL Server: DATEDIFF(unidade, inicio, fim) conta fronteiras ultrapassadas, não períodos completos: DATEDIFF(year, '2024-12-31', '2025-01-01') dá 1, apesar de ser um só dia.

Erros reais ao usar a função de outro dialeto:

    SQLite:     DATEDIFF(day, '2025-01-10', '2025-06-01')  -> no such column: day
    PostgreSQL: GETDATE()                                  -> function getdate() does not exist
    MySQL:      TO_CHAR(data_encomenda, 'DD/MM/YYYY')      -> FUNCTION m02.TO_CHAR does not exist
    SQL Server: CURDATE()                                  -> 'CURDATE' is not a recognized built-in function name.
    SQL Server: EXTRACT(YEAR FROM data_encomenda)          -> 'EXTRACT' is not a recognized built-in function name.

Agrupar por mês junta funções de data e GROUP BY. Repete a expressão no SELECT e no GROUP BY (aqui em SQLite):

    SELECT STRFTIME('%Y-%m', data_encomenda) AS mes, COUNT(*) AS n
    FROM encomendas
    GROUP BY STRFTIME('%Y-%m', data_encomenda)
    ORDER BY mes;

    mes     | n          mes     | n
    --------+--          --------+--
    2025-01 | 2          2025-04 | 3
    2025-02 | 2          2025-05 | 2
    2025-03 | 2          2025-06 | 1

Nos outros troca só a expressão: TO_CHAR(data_encomenda, 'YYYY-MM') no PostgreSQL, DATE_FORMAT(data_encomenda, '%Y-%m') no MySQL e FORMAT(data_encomenda, 'yyyy-MM') no SQL Server. O resultado foi idêntico nos quatro.

**DICA:** guarda e compara datas no formato ISO (AAAA-MM-DD) e formata para dd/mm/aaaa só ao mostrar.

## Nos outros dialetos

Resumo das diferenças deste módulo, todas executadas nos quatro servidores:

| Tema | SQLite 3.45 | PostgreSQL 17 | MySQL 8.4 | SQL Server 2025 |
|---|---|---|---|---|
| Coluna fora do GROUP BY | aceita (valor arbitrário) | erro | erro 1055 | erro 8120 |
| Alias no WHERE | aceita | erro | erro 1054 | erro 207 |
| Alias no HAVING | aceita | erro | aceita | erro |
| AVG de inteiros | decimal | decimal | decimal | inteiro (44) |
| 7/2 | 3 | 3 | 3.5000 | 3 |
| Tamanho do texto | LENGTH | LENGTH | CHAR_LENGTH | LEN |
| Duas barras verticais | concatena | concatena | operador OR (0) | concatena |
| CONCAT com NULL | ignora o NULL | ignora o NULL | devolve NULL | ignora o NULL |
| Diferença de datas | JULIANDAY(a) - JULIANDAY(b) | a - b | DATEDIFF(a, b) | DATEDIFF(day, b, a) |
| Formatar datas | STRFTIME | TO_CHAR | DATE_FORMAT | FORMAT |

Oracle e SAP HANA (NÃO executado, não há instância): têm as suas próprias funções de texto, números e datas, com nomes e comportamentos próprios. Consulta a referência SQL de cada um antes de assumires que uma função dos outros quatro existe ou se comporta da mesma forma.

## Exercícios

**PRATICAR:** faz os exercícios 5 a 8 no módulo de exercícios (11): contagens com COUNT(*) e COUNT(coluna), agrupamentos com HAVING, CASE com COALESCE e funções de datas nos quatro dialetos. As soluções estão no gabarito (13).

## Fontes oficiais

- SQLite, agregação: https://www.sqlite.org/lang_aggfunc.html
- SQLite, datas e horas: https://www.sqlite.org/lang_datefunc.html
- PostgreSQL 17, datas e horas: https://www.postgresql.org/docs/17/functions-datetime.html
- PostgreSQL 17, texto: https://www.postgresql.org/docs/17/functions-string.html
- PostgreSQL 17, CASE, COALESCE e NULLIF: https://www.postgresql.org/docs/17/functions-conditional.html
- MySQL 8.4, GROUP BY e ONLY_FULL_GROUP_BY: https://dev.mysql.com/doc/refman/8.4/en/group-by-handling.html
- MySQL 8.4, datas e horas: https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html
- MySQL 8.4, texto: https://dev.mysql.com/doc/refman/8.4/en/string-functions.html
- SQL Server, datas e horas: https://learn.microsoft.com/en-us/sql/t-sql/functions/date-and-time-data-types-and-functions-transact-sql?view=sql-server-ver17
- SQL Server, DATEDIFF: https://learn.microsoft.com/en-us/sql/t-sql/functions/datediff-transact-sql?view=sql-server-ver17
- SQL Server, texto: https://learn.microsoft.com/en-us/sql/t-sql/functions/string-functions-transact-sql?view=sql-server-ver17
- Oracle Database, SQL Language Reference (não executado): https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/
- SAP HANA, documentação (não executado): https://help.sap.com/docs/SAP_HANA_PLATFORM
