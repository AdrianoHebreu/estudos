# 01 Primeiras consultas

Neste módulo fazes as tuas primeiras perguntas à base de dados da loja: escolher colunas, filtrar linhas, ordenar e limitar resultados. Primeiro aprendes o SQL padrão, que corre em todos os motores; depois vês onde o SQLite 3.45, o PostgreSQL 17, o MySQL 8.4 e o SQL Server 2025 (T-SQL) divergem, com os erros reais que cada um devolve.

## A base da loja

Os exemplos usam a «loja»: categorias (3 linhas), clientes (8), produtos (10), encomendas (12) e linhas de encomenda (26). Todas as saídas deste módulo foram obtidas numa base chamada m01, criada com o mesmo ficheiro de dados nos quatro motores. Quando a saída é igual nos quatro, mostro-a uma vez; quando difere, digo qual é qual.

**NOTA:** sem ORDER BY a ordem das linhas não é garantida. Por isso todos os exemplos com resultado visível têm ORDER BY.

## SELECT: escolher colunas e calcular

Uma consulta lê dados, não os altera. A forma mínima é SELECT colunas FROM tabela.

    SELECT id, nome FROM categorias ORDER BY id;
    -- 1 Livros, 2 Eletrónica, 3 Casa

O asterisco devolve todas as colunas (SELECT * FROM categorias). É cómodo para explorar, mas em código a sério lista as colunas: o resultado deixa de mudar quando alguém acrescenta uma coluna à tabela.

Podes calcular no próprio SELECT. As expressões usam as colunas da linha e os operadores habituais (+, -, *, /).

    SELECT nome, preco, preco * stock AS valor_stock
    FROM produtos
    WHERE categoria_id = 2
    ORDER BY id;

    nome                      preco   valor_stock
    Auscultadores Bluetooth   49.90   1497.00
    Carregador USB-C          14.90   1490.00
    Teclado Mecânico          79.00      0.00

**ATENÇÃO:** a divisão de inteiros não é igual em todo o lado. Executei SELECT 7 / 2 e SELECT 7 / 2.0 nos quatro: SQLite, PostgreSQL e SQL Server dão 3 e 3.5 (com mais ou menos casas decimais: 3.5, 3.5000000000000000, 3.500000); o MySQL dá 3.5000 nos dois casos e tem o operador DIV (7 DIV 2 dá 3) para a divisão inteira. Se queres um resultado decimal em todos, escreve um dos operandos como decimal (2.0).

## Aliases

Um alias dá um nome à coluna do resultado (AS nome) e é praticamente obrigatório numa expressão, para o resultado ter um nome legível. Escreve sempre o AS: fica mais claro.

    SELECT nome AS produto, preco * 1.23 AS com_iva FROM produtos WHERE id IN (1, 3) ORDER BY id;
    -- Romance Policial 15.8670, Atlas Mundial 36.8877

O alias existe só no resultado. O ORDER BY aceita-o nos quatro motores (ORDER BY dobro DESC funcionou em todos). No WHERE não: SELECT id, preco * 2 AS dobro FROM produtos WHERE dobro > 50 dá erro no PostgreSQL (column "dobro" does not exist), no MySQL (ERROR 1054: Unknown column 'dobro' in 'where clause') e no SQL Server (Msg 207: Invalid column name 'dobro'), porque o WHERE é avaliado antes de o SELECT dar nomes. O SQLite aceita-o, por tolerância; não dependas disso, repete a expressão.

**NOTA:** no SQLite o mesmo cálculo com 1.23 mostrou 15.867 e 36.887699999999995: o SQLite guarda os decimais como números de vírgula flutuante, os outros três mostraram 15.8670 e 36.8877. Os tipos numéricos ficam para o módulo da modelação.

## DISTINCT: sem repetidos

DISTINCT remove linhas repetidas do resultado, comparando a linha inteira.

    SELECT DISTINCT cidade FROM clientes ORDER BY cidade;
    -- Braga, Coimbra, Faro, Lisboa, Porto

Com várias colunas, DISTINCT avalia a combinação inteira: aplica-se a todas as colunas do SELECT, não só à primeira.

## WHERE: filtrar linhas

O WHERE mantém só as linhas para as quais a condição é verdadeira. Os operadores de comparação são =, <> (diferente), <, <=, >, >=. Combina condições com AND, OR e NOT; o AND tem precedência sobre o OR, por isso usa parênteses quando misturas.

    SELECT id, nome FROM produtos WHERE preco >= 30 AND stock > 0 ORDER BY id;
    -- 4 Auscultadores Bluetooth, 8 Conjunto de Panelas, 9 Manta de Sofá

    SELECT id, nome FROM produtos WHERE categoria_id = 1 OR preco < 10 ORDER BY id;
    -- 1 Romance Policial, 2 Livro de Receitas, 3 Atlas Mundial, 10 Caneca de Cerâmica


## IN, BETWEEN e LIKE

IN testa pertença a uma lista, BETWEEN testa um intervalo com os dois extremos incluídos, e LIKE compara texto com um padrão: o sinal de percentagem substitui qualquer sequência de caracteres e o sublinhado substitui exatamente um.

    SELECT id, nome FROM produtos
    WHERE categoria_id IN (1, 2) AND preco BETWEEN 14 AND 30
    ORDER BY id;
    -- 2 Livro de Receitas, 3 Atlas Mundial, 5 Carregador USB-C

    SELECT id, nome FROM produtos WHERE nome LIKE 'C%' ORDER BY id;
    -- 5 Carregador USB-C, 7 Candeeiro de Mesa, 8 Conjunto de Panelas, 10 Caneca de Cerâmica

    SELECT id, nome FROM produtos WHERE nome LIKE '_a%' ORDER BY id;
    -- 5 Carregador USB-C, 7 Candeeiro de Mesa, 9 Manta de Sofá, 10 Caneca de Cerâmica

Estas três consultas deram o mesmo nos quatro motores. A diferença está nas maiúsculas e minúsculas. Executei, nos quatro:

    SELECT id, nome FROM clientes WHERE cidade = 'lisboa' ORDER BY id;
    SELECT id, nome FROM clientes WHERE nome LIKE 'ana%' ORDER BY id;

| Motor | cidade = 'lisboa' | nome LIKE 'ana%' |
|---|---|---|
| SQLite 3.45 | 0 linhas | 1 linha (Ana Ribeiro) |
| PostgreSQL 17 | 0 linhas | 0 linhas |
| MySQL 8.4 | 3 linhas (ids 1, 4, 8) | 1 linha |
| SQL Server 2025 | 3 linhas (ids 1, 4, 8) | 1 linha |

Ou seja: no PostgreSQL o texto distingue maiúsculas de minúsculas sempre; no MySQL e no SQL Server isso depende da ordenação (collation) da base, e as predefinições que testei não distinguem; no SQLite o igual distingue mas o LIKE não (para letras ASCII). O PostgreSQL tem ILIKE para comparar sem distinguir; no SQLite, MySQL e SQL Server dá erro (mostrado mais abaixo).

## NULL e a lógica de três valores

NULL significa «valor desconhecido ou em falta», não zero nem texto vazio. Na loja, o cliente 8 (Hugo Teixeira) não tem email. Qualquer comparação com NULL não dá verdadeiro nem falso: dá desconhecido (UNKNOWN), e o WHERE só deixa passar o verdadeiro.

    SELECT 1 + NULL AS soma;     -- NULL nos quatro
    SELECT id, nome FROM clientes WHERE email = NULL;     -- 0 linhas

A segunda consulta devolve zero linhas nos quatro motores: email = NULL nunca é verdadeiro, nem para o Hugo. A pergunta certa usa IS NULL (ou IS NOT NULL):

    SELECT id, nome FROM clientes WHERE email IS NULL;    -- 8 Hugo Teixeira

A mesma lógica apanha-te em silêncio com o diferente. Quem tem email diferente de ana.ribeiro@exemplo.pt?

    SELECT id, nome FROM clientes WHERE email <> 'ana.ribeiro@exemplo.pt' ORDER BY id;
    -- 2 Bruno Costa, 3 Carla Mendes, 4 Diogo Pires, 5 Eva Martins, 6 Filipe Lopes, 7 Graça Nunes

O Hugo não aparece: NULL <> 'texto' é desconhecido. Se o queres, escreve explicitamente (email <> '...' OR email IS NULL).

As regras da lógica de três valores explicam o resto: TRUE AND UNKNOWN é UNKNOWN, FALSE AND UNKNOWN é FALSE, TRUE OR UNKNOWN é TRUE, e NOT UNKNOWN continua UNKNOWN.

**ATENÇÃO:** a armadilha clássica é o NOT IN com NULL na lista. x NOT IN (a, b, NULL) é o mesmo que x <> a AND x <> b AND x <> NULL, e o último termo é desconhecido, por isso o resultado nunca é verdadeiro. Os clientes cujo email não pertence aos emails dos clientes de Lisboa (o Hugo é de Lisboa e tem email NULL):

    SELECT id, nome FROM clientes
    WHERE email NOT IN (SELECT email FROM clientes WHERE cidade = 'Lisboa')
    ORDER BY id;                                          -- 0 linhas

Zero linhas nos quatro motores, quando esperavas Bruno, Carla, Eva, Filipe e Graça. A correção é excluir os NULL da subconsulta:

    SELECT id, nome FROM clientes
    WHERE email NOT IN (SELECT email FROM clientes WHERE cidade = 'Lisboa' AND email IS NOT NULL)
    ORDER BY id;
    -- 2 Bruno Costa, 3 Carla Mendes, 5 Eva Martins, 6 Filipe Lopes, 7 Graça Nunes

A Ana e o Diogo (Lisboa) ficam de fora, como esperado. Repara que o Hugo também não aparece: o seu email é NULL e NULL NOT IN (...) é desconhecido. Voltarás a ver esta questão com NOT EXISTS no módulo das subconsultas.

## ORDER BY

ORDER BY ordena o resultado por uma ou mais colunas ou expressões, ASC (por omissão) ou DESC. Com várias chaves, as seguintes só desempatam as anteriores.

    SELECT nome, preco FROM produtos WHERE preco > 20 ORDER BY preco DESC;
    -- Conjunto de Panelas 89.90, Teclado Mecânico 79.00, Auscultadores Bluetooth 49.90,
    -- Manta de Sofá 34.50, Atlas Mundial 29.99, Candeeiro de Mesa 22.00

Onde ficam os NULL? O padrão SQL deixa isso ao critério de cada motor, e eles escolheram de forma diferente. Executei ORDER BY email e ORDER BY email DESC nos quatro:

| Motor | ORDER BY email (ASC) | ORDER BY email DESC |
|---|---|---|
| SQLite 3.45 | NULL primeiro | NULL no fim |
| PostgreSQL 17 | NULL no fim | NULL primeiro |
| MySQL 8.4 | NULL primeiro | NULL no fim |
| SQL Server 2025 | NULL primeiro | NULL no fim |

O PostgreSQL trata NULL como o maior valor; os outros três tratam-no como o menor. Para um resultado igual em todos, usa uma expressão que funciona nos quatro (mostrei o resultado: Hugo no fim, os restantes por ordem de email):

    SELECT nome, email FROM clientes
    ORDER BY CASE WHEN email IS NULL THEN 1 ELSE 0 END, email;

Há atalhos que não são portáveis: ORDER BY email NULLS LAST (SQLite, PostgreSQL) dá erro no MySQL e no SQL Server (erros na secção seguinte).

## Limitar resultados

Mostrar só as primeiras linhas é pedido a toda a hora (páginas, «top 3»). Aqui o SQL mais divergiu: cada motor tem a sua sintaxe. Executei estas variantes nos quatro, sempre com ORDER BY id:

    SELECT id, nome FROM produtos ORDER BY id LIMIT 3 OFFSET 2;
    SELECT TOP 3 id, nome FROM produtos ORDER BY id;
    SELECT id, nome FROM produtos ORDER BY id OFFSET 2 ROWS FETCH NEXT 3 ROWS ONLY;
    SELECT id, nome FROM produtos ORDER BY id FETCH FIRST 3 ROWS ONLY;

Onde funcionam, o resultado é o esperado: LIMIT 3 OFFSET 2 e OFFSET 2 ROWS FETCH NEXT 3 ROWS ONLY dão os ids 3, 4 e 5 (Atlas Mundial, Auscultadores Bluetooth, Carregador USB-C); TOP 3 e FETCH FIRST 3 ROWS ONLY dão os ids 1, 2 e 3. O que interessa é quem aceita o quê, com as mensagens de erro reais:

| Sintaxe | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| LIMIT n OFFSET m | funciona | funciona | funciona | erro |
| TOP n | erro | erro | erro | funciona |
| OFFSET m ROWS FETCH NEXT n ROWS ONLY | erro | funciona | erro | funciona |
| FETCH FIRST n ROWS ONLY | erro | funciona | erro | erro |

As mensagens, copiadas das execuções:

    SQLite       near "3": syntax error                (TOP 3)
    PostgreSQL   ERROR:  syntax error at or near "3"   (TOP 3)
    MySQL        ERROR 1064 (42000): ... near 'OFFSET 2 ROWS FETCH NEXT 3 ROWS ONLY'
    SQL Server   Msg 102, Level 15: Incorrect syntax near 'LIMIT'.
    SQL Server   Msg 153, Level 15: Invalid usage of the option FIRST in the FETCH statement.   (FETCH FIRST sem OFFSET)

O SQL Server só aceita FETCH depois de OFFSET (para as primeiras 3 escreve ORDER BY id OFFSET 0 ROWS FETCH NEXT 3 ROWS ONLY, que executei e deu os ids 1, 2 e 3), e exige ORDER BY com OFFSET: sem ORDER BY, a mesma instrução dá Msg 102 e Msg 153 nesse motor. O PostgreSQL aceita OFFSET e FETCH mesmo sem ORDER BY (executei: devolveu 3 linhas), mas sem ORDER BY quais são as linhas é arbitrário.

**ATENÇÃO:** LIMIT e TOP sem ORDER BY dão «três linhas quaisquer». Pagina sempre sobre uma ordenação total (uma chave única, como o id, como último critério).

## Concatenação de texto

Juntar texto é outro ponto de divergência. Executei, para os clientes 1 e 8 (o 8 não tem email), três formas:

    SELECT nome || ' <' || email || '>' AS contacto FROM clientes WHERE id IN (1, 8) ORDER BY id;
    SELECT CONCAT(nome, ' <', email, '>') AS contacto FROM clientes WHERE id IN (1, 8) ORDER BY id;
    SELECT nome + ' <' + email + '>' AS contacto FROM clientes WHERE id IN (1, 8) ORDER BY id;

| Forma | SQLite | PostgreSQL | MySQL | SQL Server 2025 |
|---|---|---|---|---|
| Barras duplas | junta; NULL dá NULL | junta; NULL dá NULL | devolveu 0 e NULL, sem erro | junta; NULL dá NULL |
| CONCAT(...) | junta; NULL conta como vazio | junta; NULL conta como vazio | junta; NULL dá NULL | junta; NULL conta como vazio |
| Sinal mais | devolveu 0 e NULL, sem erro | erro | devolveu 0 e NULL, sem erro | junta; NULL dá NULL |

Em concreto: no MySQL, as barras duplas são o operador OR, por isso a consulta corre e dá resultados sem sentido; o sinal mais é aritmético e converte o texto em número (daí o 0). O mesmo no SQLite com o sinal mais. No PostgreSQL o erro é operator does not exist: character varying + unknown. O SQL Server 2025 aceitou as barras duplas; não testei versões anteriores.

**ATENÇÃO:** um único NULL faz o resultado inteiro ser NULL em quase todas as formas. Para o Hugo, CONCAT dá «Hugo Teixeira <>» em SQLite, PostgreSQL e SQL Server, e NULL no MySQL. Quando o NULL for possível, usa COALESCE(email, 'sem email'), que vês com mais detalhe no módulo das funções.

## Aspas: texto e identificadores

Texto (strings) leva sempre aspas simples, nos quatro; uma plica dentro do texto escreve-se duplicada: 'O''Brien' dá O'Brien em todos.

Identificadores (nomes de tabelas, colunas e aliases) citam-se quando têm espaços ou coincidem com palavras reservadas. Aí cada motor tem a sua forma. Executei com a coluna nome da tabela categorias:

| Consulta | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| SELECT "nome" ... | coluna | coluna | devolve o texto nome, não a coluna | coluna se QUOTED_IDENTIFIER estiver ON |
| SELECT `nome` ... | coluna | erro | coluna | erro |
| SELECT [nome] ... | coluna | erro | erro | coluna |
| WHERE nome = "Livros" | funciona | erro: column "Livros" does not exist | funciona | erro: Invalid column name 'Livros' (com QUOTED_IDENTIFIER ON) |
| AS 'Nome da categoria' | funciona | erro | funciona | funciona |

O padrão SQL define aspas duplas para identificadores e aspas simples para texto: é o que o PostgreSQL faz à risca. O MySQL usa o acento grave e, por omissão, trata aspas duplas como texto. O SQLite aceita tudo por tolerância: se «Livros» entre aspas duplas não for uma coluna, trata-o como texto, o que esconde erros. No SQL Server, na sqlcmd que usei, "nome" devolveu o texto; com a opção -I (QUOTED_IDENTIFIER ON) já cita o identificador e WHERE nome = "Livros" dá Invalid column name 'Livros'. Não testei o SSMS; confirma na documentação a predefinição de cada cliente.

Maiúsculas e minúsculas nos nomes: sem aspas, SELECT NOME FROM categorias funciona nos quatro. No PostgreSQL, os nomes sem aspas são convertidos para minúsculas; com aspas respeitam-se: "NOME" dá erro (column "NOME" does not exist), enquanto no SQLite funciona.

## Nos outros dialetos

Resumo do que é específico, tudo executado nos quatro motores, salvo indicação.

| Tema | SQLite 3.45 | PostgreSQL 17 | MySQL 8.4 | SQL Server 2025 |
|---|---|---|---|---|
| Limitar linhas | LIMIT e OFFSET | LIMIT, OFFSET FETCH, FETCH FIRST | LIMIT e OFFSET | TOP, OFFSET FETCH (exige ORDER BY) |
| NULL na ordenação (ASC) | primeiro | no fim | primeiro | primeiro |
| NULLS LAST | aceita | aceita | erro 1064 | erro Msg 102 |
| Texto vs maiúsculas | igual distingue; LIKE não | tudo distingue; existe ILIKE | não distingue (collation) | não distingue (collation) |
| Concatenar | barras duplas, CONCAT | barras duplas, CONCAT | CONCAT (barras duplas são OR) | sinal mais, CONCAT, barras duplas (2025) |
| Identificadores | aspas duplas, acento grave, parênteses retos | aspas duplas | acento grave | parênteses retos, aspas duplas |
| Divisão 7 / 2 | 3 | 3 | 3.5000 | 3 |
| Alias no WHERE | aceita | erro | erro 1054 | erro Msg 207 |
| Condição como valor (SELECT 1 < 2) | 1 | t | 1 | erro Msg 102 |

ILIKE também o executei: erro no SQLite (near "ILIKE": syntax error), no MySQL (ERROR 1064) e no SQL Server (Msg 4145, near 'ILIKE').

**Oracle e SAP HANA (NÃO executado, sem instância):** o Oracle usa FETCH FIRST n ROWS ONLY (a partir da versão 12c) em vez de LIMIT, trata a string vazia como NULL e tem as barras duplas para concatenar; consulta a documentação do SELECT para confirmar. O SAP HANA aceita LIMIT; confirma os detalhes na documentação oficial.

## Exercícios

**PRATICAR:** faz os exercícios 1 a 4 do módulo de exercícios (11-Exercicios-Praticos), na base m01 de cada motor que tiveres.

## Fontes oficiais

- SQLite, instrução SELECT: https://www.sqlite.org/lang_select.html
- SQLite, NULL e lógica de três valores: https://www.sqlite.org/nulls.html
- SQLite, expressões (LIKE, operadores): https://www.sqlite.org/lang_expr.html
- SQLite, palavras-chave e citação de identificadores: https://www.sqlite.org/lang_keywords.html
- PostgreSQL 17, LIMIT e OFFSET: https://www.postgresql.org/docs/17/queries-limit.html
- PostgreSQL 17, ordenação de linhas: https://www.postgresql.org/docs/17/queries-order.html
- PostgreSQL 17, correspondência de padrões (LIKE, ILIKE): https://www.postgresql.org/docs/17/functions-matching.html
- PostgreSQL 17, funções e operadores de comparação: https://www.postgresql.org/docs/17/functions-comparison.html
- MySQL 8.4, instrução SELECT: https://dev.mysql.com/doc/refman/8.4/en/select.html
- MySQL 8.4, problemas com NULL: https://dev.mysql.com/doc/refman/8.4/en/problems-with-null.html
- MySQL 8.4, funções de texto (CONCAT): https://dev.mysql.com/doc/refman/8.4/en/string-functions.html
- SQL Server, ORDER BY com OFFSET e FETCH: https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17
- SQL Server, TOP: https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17
- SQL Server, NULL e UNKNOWN: https://learn.microsoft.com/en-us/sql/t-sql/language-elements/null-and-unknown-transact-sql?view=sql-server-ver17
- Oracle Database 23, SELECT (não executado): https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/SELECT.html
