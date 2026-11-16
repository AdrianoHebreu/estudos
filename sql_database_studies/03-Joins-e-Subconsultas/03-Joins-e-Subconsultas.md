# 03 Joins e subconsultas

Até aqui trabalhaste com uma tabela de cada vez. Na loja, os dados estão repartidos: o nome do cliente está em clientes, as encomendas noutra tabela, os produtos noutra. Neste módulo aprendes a juntar tabelas (joins), a pôr uma consulta dentro de outra (subconsultas) e a combinar resultados (UNION e companhia). Todos os exemplos foram executados em SQLite 3.45.3, PostgreSQL 17, MySQL 8.4 e SQL Server 2025; quando o resultado é igual nos quatro, mostro-o uma só vez.

A chave estrangeira liga as tabelas: encomendas.cliente_id aponta para clientes.id, e o join diz como emparelhar as linhas com a condição depois de ON. Usa aliases curtos (c, e, p) e qualifica as colunas (c.nome), sobretudo as que se chamam igual, como id.

## INNER JOIN

Devolve só as linhas que têm par nos dois lados. Um cliente sem encomendas desaparece.

    SELECT c.nome, e.id AS encomenda, e.estado
    FROM clientes c
    INNER JOIN encomendas e ON e.cliente_id = c.id
    ORDER BY e.id;

Resultado (12 linhas; mostro as primeiras 4):

    nome          encomenda  estado
    Ana Ribeiro   1          entregue
    Bruno Costa   2          entregue
    Ana Ribeiro   3          entregue
    Carla Mendes  4          cancelada

A palavra INNER é opcional.

## LEFT JOIN: clientes sem encomendas

O LEFT JOIN mantém todas as linhas da tabela da esquerda; onde não há par, as colunas da direita vêm a NULL. O truque clássico para encontrar quem não tem correspondência é filtrar por esse NULL.

    SELECT c.nome, e.id AS encomenda FROM clientes c
    LEFT JOIN encomendas e ON e.cliente_id = c.id WHERE e.id IS NULL ORDER BY c.id;

Resultado: Graça Nunes e Hugo Teixeira, com a encomenda a NULL.

**ATENÇÃO:** filtra pelo NULL de uma coluna que nunca é NULL nas linhas com par (a chave primária e.id). Se escreveres a condição do lado direito no WHERE (por exemplo e.estado = 'pendente'), as linhas sem par desaparecem e o LEFT JOIN comporta-se como INNER JOIN. Para filtrar o lado direito sem perder linhas, põe a condição no ON.

LEFT JOIN também serve para contar incluindo zeros: COUNT(e.id) conta só as encomendas existentes (a Graça e o Hugo têm 0; com COUNT(*) teriam 1, porque a linha com NULL conta como uma).

## RIGHT JOIN

É o espelho do LEFT: mantém tudo o que está na tabela da direita. Quase sempre se troca a ordem das tabelas e usa-se LEFT, que se lê melhor.

    SELECT e.id AS encomenda, c.nome FROM encomendas e
    RIGHT JOIN clientes c ON e.cliente_id = c.id WHERE e.id IS NULL ORDER BY c.id;

Dá as mesmas duas linhas (Graça Nunes e Hugo Teixeira) nos quatro motores.

## FULL OUTER JOIN

Mantém as linhas sem par dos dois lados. Na loja a chave estrangeira impede encomendas sem cliente, por isso uso subconsultas para criar um caso com órfãos nos dois lados: clientes de Lisboa contra encomendas pendentes.

    SELECT l.nome AS cliente, p.id AS encomenda
    FROM (SELECT id, nome FROM clientes WHERE cidade = 'Lisboa') l
    FULL OUTER JOIN (SELECT id, cliente_id FROM encomendas WHERE estado = 'pendente') p
        ON p.cliente_id = l.id
    ORDER BY COALESCE(l.id, 99), p.id;

Resultado (SQLite, PostgreSQL e SQL Server):

    cliente        encomenda
    Ana Ribeiro    8
    Diogo Pires    NULL
    Hugo Teixeira  NULL
    NULL           9
    NULL           12

A Ana tem a encomenda 8 (par nos dois lados); Diogo e Hugo vivem em Lisboa mas não têm encomendas pendentes; as encomendas 9 e 12 são pendentes mas de clientes de outras cidades. No MySQL 8.4 o mesmo comando falha:

    ERROR 1064 (42000): You have an error in your SQL syntax; ... near 'FULL OUTER JOIN (SELECT ...'

**Contorno no MySQL:** une um LEFT JOIN com um RIGHT JOIN. O UNION (sem ALL) elimina as linhas duplicadas, que são as que têm par e aparecem nos dois.

    SELECT l.nome AS cliente, p.id AS encomenda
    FROM (SELECT id, nome FROM clientes WHERE cidade = 'Lisboa') l
    LEFT JOIN (SELECT id, cliente_id FROM encomendas WHERE estado = 'pendente') p ON p.cliente_id = l.id
    UNION
    SELECT l.nome, p.id
    FROM (SELECT id, nome FROM clientes WHERE cidade = 'Lisboa') l
    RIGHT JOIN (SELECT id, cliente_id FROM encomendas WHERE estado = 'pendente') p ON p.cliente_id = l.id
    ORDER BY 2;

Devolve as mesmas 5 linhas.

**NOTA:** o SQLite só suporta RIGHT e FULL OUTER JOIN desde a versão 3.39.0 (as notas de versão dizem «Add (long overdue) support for RIGHT and FULL OUTER JOIN»). Na 3.45.3 que usei funcionam; em versões mais antigas precisas do mesmo contorno do MySQL.

## CROSS JOIN: o produto cartesiano

Emparelha cada linha de uma tabela com todas as da outra, sem condição. Com 8 clientes e 10 produtos dá 80 linhas.

    SELECT COUNT(*) AS combinacoes FROM clientes CROSS JOIN produtos;   -- 80

É útil para gerar combinações de propósito (por exemplo, 3 categorias contra 2 estados dão 6 linhas). A sintaxe antiga FROM a, b sem WHERE faz o mesmo, e é por isso que um WHERE esquecido gera milhares de linhas sem aviso.

## Self join: a tabela contra ela própria

Usa a mesma tabela duas vezes com aliases diferentes. Exemplo: pares de clientes da mesma cidade. A condição a.id < b.id evita emparelhar um cliente consigo próprio e devolver cada par duas vezes.

    SELECT a.nome AS cliente_a, b.nome AS cliente_b, a.cidade
    FROM clientes a
    INNER JOIN clientes b ON a.cidade = b.cidade AND a.id < b.id
    ORDER BY a.cidade, a.id, b.id;

Dá 4 pares: Ana com Diogo, Ana com Hugo e Diogo com Hugo (Lisboa), e Bruno com Filipe (Porto).

## Vários joins numa consulta

Encadeia JOIN após JOIN; cada ON liga a tabela nova a uma que já está na consulta. Linhas entregues de clientes de Lisboa, com produto e categoria:

    SELECT c.nome AS cliente, e.id AS encomenda, p.nome AS produto,
           k.nome AS categoria, l.quantidade * l.preco_unitario AS total_linha
    FROM clientes c
    INNER JOIN encomendas e ON e.cliente_id = c.id
    INNER JOIN linhas_encomenda l ON l.encomenda_id = e.id
    INNER JOIN produtos p ON p.id = l.produto_id
    INNER JOIN categorias k ON k.id = p.categoria_id
    WHERE c.cidade = 'Lisboa' AND e.estado = 'entregue'
    ORDER BY e.id, l.id;

Resultado: 8 linhas; a primeira é Ana Ribeiro, encomenda 1, Romance Policial, Livros, 25.80.

**NOTA:** o SQLite mostra 25.8 e 14.9 em vez de 25.80 e 14.90, porque guarda estes valores como números reais e não tem formato fixo de casas decimais. Os outros três mostram duas casas decimais. A formatação de números não é tema deste módulo; aqui o valor é o mesmo.

## O clássico erro: multiplicar linhas

Cada encomenda tem várias linhas. Se juntares clientes, encomendas e linhas e depois contares encomendas, cada encomenda é contada tantas vezes quantas as suas linhas.

    SELECT c.nome, COUNT(e.id) AS encomendas_contadas, COUNT(DISTINCT e.id) AS encomendas_reais
    FROM clientes c
    INNER JOIN encomendas e ON e.cliente_id = c.id
    INNER JOIN linhas_encomenda l ON l.encomenda_id = e.id
    WHERE c.id = 1 GROUP BY c.nome;

Resultado nos quatro motores: Ana Ribeiro, 7 contadas, 3 reais. A Ana tem 3 encomendas com 2, 2 e 3 linhas: 7 linhas no join. A regra: antes de agregar, pergunta qual é a granularidade do resultado do join (uma linha por quê?). Somas de valores da tabela «um» (por exemplo um total guardado na encomenda) ficam inflacionadas da mesma forma. Soluções: contar com DISTINCT, ou agregar primeiro numa derived table (ver mais abaixo) e só depois juntar.

## USING e NATURAL JOIN

USING (coluna) é uma abreviatura de ON quando as duas tabelas têm uma coluna com o mesmo nome e o resultado traz essa coluna uma só vez. No esquema da loja as chaves chamam-se id nas tabelas «um» e cliente_id nas tabelas «muitos», por isso preciso de renomear numa derived table:

    SELECT nome, e.id AS encomenda
    FROM (SELECT id AS cliente_id, nome FROM clientes) c
    JOIN encomendas e USING (cliente_id)
    WHERE cliente_id = 3
    ORDER BY e.id;

Dá Carla Mendes com as encomendas 4 e 11 no SQLite, PostgreSQL e MySQL. No SQL Server falha com Msg 102: Incorrect syntax near 'USING'.

NATURAL JOIN junta automaticamente por todas as colunas com o mesmo nome. É perigoso: clientes e encomendas partilham a coluna id, e o resultado é um join de clientes.id com encomendas.id, que não tem sentido.

    SELECT COUNT(*) AS linhas FROM clientes NATURAL JOIN encomendas;   -- 8 (errado: o correto seria 12)

Dá 8 em SQLite, PostgreSQL e MySQL. O SQL Server não suporta NATURAL JOIN e responde com um erro de sintaxe pouco claro (Incorrect syntax near ';'). **ATENÇÃO:** evita NATURAL JOIN em código real: se alguém acrescentar uma coluna com o mesmo nome a uma das tabelas, a consulta muda de significado sem erro.

## Subconsultas

Uma subconsulta é um SELECT dentro de parênteses, dentro de outra consulta. Há três formas principais.

Escalar: devolve um só valor e usa-se onde caberia um número. Produtos acima do preço médio:

    SELECT nome, preco FROM produtos
    WHERE preco > (SELECT AVG(preco) FROM produtos)
    ORDER BY preco DESC;

Resultado: Conjunto de Panelas (89.90), Teclado Mecânico (79.00), Auscultadores Bluetooth (49.90).

Em lista (IN): devolve uma coluna de valores. Clientes que já encomendaram eletrónica (categoria 2):

    SELECT nome FROM clientes
    WHERE id IN (SELECT e.cliente_id FROM encomendas e
                 INNER JOIN linhas_encomenda l ON l.encomenda_id = e.id
                 INNER JOIN produtos p ON p.id = l.produto_id
                 WHERE p.categoria_id = 2)
    ORDER BY nome;

Resultado: Ana Ribeiro, Bruno Costa, Diogo Pires.

Correlacionada: refere colunas da consulta exterior e é reavaliada para cada linha. Produtos mais caros do que a média da sua própria categoria:

    SELECT p.nome, p.categoria_id, p.preco
    FROM produtos p
    WHERE p.preco > (SELECT AVG(q.preco) FROM produtos q WHERE q.categoria_id = p.categoria_id)
    ORDER BY p.categoria_id, p.nome;

Resultado: Atlas Mundial (categoria 1), Auscultadores Bluetooth e Teclado Mecânico (2), Conjunto de Panelas (3).

**ATENÇÃO:** uma subconsulta escalar tem de devolver no máximo uma linha. A Ana tem 3 encomendas, por isso (SELECT id FROM encomendas e WHERE e.cliente_id = c.id) quebra, e cada motor reage de forma diferente:

    PostgreSQL: ERROR:  more than one row returned by a subquery used as an expression
    MySQL:      ERROR 1242 (21000): Subquery returns more than 1 row
    SQL Server: Msg 512, Level 16: Subquery returned more than 1 value.
    SQLite:     sem erro: devolve a primeira linha (Ana Ribeiro, 1)

O SQLite é o mais perigoso: o resultado parece válido e está errado.

## EXISTS, IN e JOIN

Três formas de perguntar «clientes com encomendas pendentes». EXISTS devolve verdadeiro se a subconsulta encontrar pelo menos uma linha e pára logo que a encontra:

    SELECT nome FROM clientes c
    WHERE EXISTS (SELECT 1 FROM encomendas e WHERE e.cliente_id = c.id AND e.estado = 'pendente')
    ORDER BY nome;

Dá Ana Ribeiro, Bruno Costa e Filipe Lopes. Um JOIN daria o mesmo, mas repetiria o cliente que tivesse duas pendentes e precisaria de DISTINCT. Regra prática: para «existe pelo menos um», usa EXISTS ou IN; para trazer colunas da outra tabela, usa JOIN.

Clientes sem encomendas: além do LEFT JOIN com IS NULL, servem NOT EXISTS e NOT IN (todos dão Graça Nunes e Hugo Teixeira).

    SELECT nome FROM clientes c
    WHERE NOT EXISTS (SELECT 1 FROM encomendas e WHERE e.cliente_id = c.id)
    ORDER BY nome;

Produtos nunca vendidos: o mesmo padrão dá zero linhas, porque os 10 produtos já foram todos vendidos. Para ter algo para ver, pergunta antes: produtos sem nenhuma venda entregue.

    SELECT p.nome FROM produtos p
    WHERE NOT EXISTS (SELECT 1 FROM linhas_encomenda l
                      INNER JOIN encomendas e ON e.id = l.encomenda_id
                      WHERE l.produto_id = p.id AND e.estado = 'entregue')
    ORDER BY p.nome;

Resultado: Atlas Mundial, Candeeiro de Mesa, Conjunto de Panelas, Manta de Sofá.

### A armadilha do NOT IN com NULL

Se a lista de um NOT IN contiver um NULL, o resultado é sempre vazio, porque x NOT IN (a, NULL) é desconhecido (nunca verdadeiro). O Hugo é o único cliente sem email (NULL). Clientes cujo email não está entre os emails dos clientes de Lisboa:

    SELECT nome FROM clientes
    WHERE email NOT IN (SELECT email FROM clientes WHERE cidade = 'Lisboa')
    ORDER BY nome;

Resultado nos quatro motores: zero linhas, sem erro nem aviso, porque a lista inclui o NULL do Hugo (que é de Lisboa). Com a lista do Porto (sem NULL) o Hugo também desaparece, porque NULL NOT IN (...) é desconhecido: dá Ana, Carla, Diogo, Eva e Graça. A forma segura é NOT EXISTS:

    SELECT c.nome FROM clientes c
    WHERE NOT EXISTS (SELECT 1 FROM clientes x WHERE x.cidade = 'Lisboa' AND x.email = c.email)
    ORDER BY c.nome;

Devolve Bruno, Carla, Eva, Filipe, Graça e Hugo.

**DICA:** usa NOT EXISTS por defeito para «não tem correspondência». Se usares NOT IN, garante que a subconsulta nunca devolve NULL (por exemplo com WHERE coluna IS NOT NULL).

## UNION, UNION ALL, INTERSECT e EXCEPT

Operações de conjuntos combinam o resultado de duas consultas com o mesmo número de colunas e tipos compatíveis. Os nomes das colunas vêm da primeira. O ORDER BY escreve-se uma só vez, no fim.

| Operador | Resultado | Duplicados |
|---|---|---|
| UNION | linhas de A ou de B | eliminados |
| UNION ALL | todas as linhas de A e de B | mantidos |
| INTERSECT | linhas que existem em A e em B | eliminados |
| EXCEPT | linhas de A que não existem em B | eliminados |

    SELECT cidade FROM clientes UNION SELECT 'Viseu' ORDER BY cidade;

Dá as 5 cidades distintas mais Viseu. UNION ALL entre as encomendas entregues e as pendentes dá 8 valores de cliente_id, com repetições; é mais rápido porque não procura duplicados, por isso usa-o quando as repetições não importam ou são desejadas.

    SELECT cliente_id FROM encomendas WHERE estado = 'entregue'
    INTERSECT SELECT cliente_id FROM encomendas WHERE estado = 'pendente' ORDER BY cliente_id;

Clientes com encomendas entregues e pendentes: 1 e 2. E clientes que nunca encomendaram, com EXCEPT:

    SELECT id FROM clientes EXCEPT SELECT cliente_id FROM encomendas ORDER BY id;

Dá 7 e 8. Os quatro motores dão resultados iguais. O MySQL 8.4 suporta INTERSECT e EXCEPT (executei ambos; também INTERSECT ALL). No Oracle o EXCEPT chama-se MINUS (não executado: não há instância Oracle; confirma na documentação). Nos nossos motores, MINUS é um erro:

    PostgreSQL: ERROR:  syntax error at or near "SELECT"
    MySQL:      ERROR 1064 (42000): You have an error in your SQL syntax ...
    SQLite:     near "SELECT": syntax error

No SQL Server não dá erro, mas o resultado é enganador: devolve dois resultados (8 ids de clientes e 12 cliente_id) em vez de um. Tudo indica que lê MINUS como alias da tabela clientes e trata o segundo SELECT como uma consulta separada (inferência minha, não confirmada na documentação).

## Derived tables (subconsultas no FROM)

Uma subconsulta no FROM comporta-se como uma tabela temporária só para esta consulta. É a forma de agregar antes de juntar (e de evitar a multiplicação de linhas). Clientes com pelo menos 2 encomendas:

    SELECT c.nome, t.total_encomendas
    FROM clientes c
    INNER JOIN (SELECT e.cliente_id, COUNT(*) AS total_encomendas
                FROM encomendas e
                GROUP BY e.cliente_id) t ON t.cliente_id = c.id
    WHERE t.total_encomendas >= 2
    ORDER BY c.id;

Resultado: Ana Ribeiro 3, Bruno Costa 3, Carla Mendes 2, Diogo Pires 2. O alias (aqui t) é obrigatório em alguns motores. Experimenta SELECT cliente_id FROM (SELECT cliente_id FROM encomendas WHERE estado = 'pendente') ORDER BY 1; sem alias: SQLite e PostgreSQL 17 funcionam (1, 2, 6); o MySQL dá ERROR 1248 (42000): Every derived table must have its own alias; o SQL Server dá Msg 156: Incorrect syntax near the keyword 'ORDER'. Escreve sempre o alias. As CTE (WITH), que dão nome a uma subconsulta, ficam para o módulo 06.

## Nos outros dialetos

| Tema | SQLite 3.45 | PostgreSQL 17 | MySQL 8.4 | SQL Server 2025 |
|---|---|---|---|---|
| RIGHT JOIN | sim (desde 3.39) | sim | sim | sim |
| FULL OUTER JOIN | sim (desde 3.39) | sim | erro 1064, usa UNION | sim |
| USING (coluna) | sim | sim | sim | erro de sintaxe |
| NATURAL JOIN | sim | sim | sim | erro de sintaxe |
| CROSS JOIN | sim | sim | sim | sim |
| Escalar com várias linhas | devolve a 1.ª linha | erro | erro 1242 | erro 512 |
| INTERSECT e EXCEPT | sim | sim | sim | sim |
| INTERSECT ALL | erro de sintaxe | sim | sim | erro 324 |
| MINUS | erro | erro | erro | sem erro (ver acima) |
| Derived table sem alias | aceita | aceita | erro 1248 | erro 156 |
| Ordem dos NULL em ORDER BY ascendente | NULL primeiro | NULL no fim | NULL primeiro | NULL primeiro |

A última linha apareceu nos testes: em ORDER BY ascendente, o PostgreSQL põe os NULL no fim e os outros três no início. Se a ordem importa, trata os NULL de forma explícita (por exemplo com COALESCE, como no FULL OUTER JOIN acima). O EXCEPT ALL não foi executado: confirma na documentação de cada motor.

**NOTA:** Oracle e SAP HANA não foram executados (não há instância). No Oracle, EXCEPT chama-se MINUS; para o resto confirma na documentação oficial de cada produto.

## Exercícios

**PRATICAR:** faz os exercícios 9 a 12 do módulo de exercícios práticos (11) e confere com o gabarito (13).

## Fontes oficiais

- PostgreSQL 17, tabelas combinadas (joins): https://www.postgresql.org/docs/17/queries-table-expressions.html
- PostgreSQL 17, UNION, INTERSECT e EXCEPT: https://www.postgresql.org/docs/17/queries-union.html
- PostgreSQL 17, expressões de subconsulta: https://www.postgresql.org/docs/17/functions-subquery.html
- MySQL 8.4, sintaxe de JOIN: https://dev.mysql.com/doc/refman/8.4/en/join.html
- MySQL 8.4, INTERSECT: https://dev.mysql.com/doc/refman/8.4/en/intersect.html
- MySQL 8.4, EXCEPT: https://dev.mysql.com/doc/refman/8.4/en/except.html
- SQLite, instrução SELECT: https://www.sqlite.org/lang_select.html
- SQLite 3.39.0, notas de versão (RIGHT e FULL OUTER JOIN): https://www.sqlite.org/releaselog/3_39_0.html
- SQL Server, joins: https://learn.microsoft.com/en-us/sql/relational-databases/performance/joins?view=sql-server-ver17
- SQL Server, EXCEPT e INTERSECT: https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-except-and-intersect-transact-sql?view=sql-server-ver17
