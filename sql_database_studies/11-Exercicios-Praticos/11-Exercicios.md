# 11 Exercícios práticos

36 exercícios, quatro por módulo, mais um projeto final. Cada aula indica com **PRATICAR** os exercícios que lhe correspondem. Resolve-os no SQLite (Python) e, sempre que o exercício o pedir, num segundo dialeto. Só consultas o módulo 13 depois de tentares.

## Módulo 01 · Primeiras consultas

# Exercícios do módulo 01 (exercícios 1 a 4)

Base m01, com o ficheiro loja.sql carregado.

### Exercício 1 · Preços com IVA

**Nível:** Iniciante

Lista o nome, o preço e o preço com IVA a 23% (coluna com o alias preco_com_iva) dos produtos cujo preço está entre 10 e 30 euros, extremos incluídos. Ordena do preço com IVA mais alto para o mais baixo.

### Exercício 2 · Clientes e estados sem repetidos

**Nível:** Iniciante

a) Lista os estados diferentes que existem nas encomendas, por ordem alfabética, sem repetições.

b) Lista o id, o nome, a cidade e a data de registo dos clientes de Lisboa ou do Porto registados depois de 2024-02-01, por ordem de data de registo.

### Exercício 3 · A armadilha do NULL

**Nível:** Intermédio

Queres todos os clientes cujo email é diferente de ana.ribeiro@exemplo.pt, incluindo os que não têm email. Um colega escreveu WHERE email <> 'ana.ribeiro@exemplo.pt' e esqueceu-se do Hugo.

a) Explica porque é que o Hugo Teixeira não aparece nesse resultado.

b) Escreve a consulta correta (id, nome, email), com o Hugo e sem a Ana, e coloca no fim os clientes sem email, de forma que funcione nos quatro motores (sem NULLS LAST).

### Exercício 4 · Segunda página, em quatro dialetos

**Nível:** Avançado

Ordena os produtos por preço decrescente (desempate por id) e mostra a segunda página de 3 produtos (isto é, a 4.ª, a 5.ª e a 6.ª posições), com id, nome e preço.

a) Escreve a consulta para o SQLite, o PostgreSQL e o MySQL, e outra para o SQL Server.

b) Mostra o nome e o preço de cada um desses produtos numa só coluna chamada ficha, no formato Nome (preço), com a sintaxe de concatenação certa para cada motor. Repara no formato do preço em cada motor e explica a diferença.

## Módulo 02 · Agregação e funções

### Exercício 5 · Contar e somar

**Nível:** Iniciante

Com uma única consulta sobre a tabela encomendas, mostra o número total de encomendas (total) e o número de encomendas que não estão canceladas (validas). Sem usar WHERE nem JOIN, usa COUNT com uma expressão CASE. Depois, numa segunda consulta, calcula o valor total do stock da loja (preço vezes stock de cada produto, somado) com o nome valor_stock.

### Exercício 6 · Clientes com várias encomendas

**Nível:** Intermédio

Mostra, por cliente (coluna cliente_id), quantas encomendas não canceladas tem, mantendo só os clientes com pelo menos 2. Ordena por número de encomendas decrescente e depois por cliente_id. Usa WHERE para excluir as canceladas e HAVING para o filtro dos grupos, repetindo a expressão da agregação (sem usar o alias no HAVING) para que corra em todos os dialetos.

### Exercício 7 · Níveis de stock

**Nível:** Intermédio

Classifica cada produto pelo stock: esgotado (stock 0), baixo (1 a 19) e normal (20 ou mais). Mostra quantos produtos há em cada nível (colunas nivel e n), ordenados do menor para o maior n. Depois lista os clientes de Lisboa com a coluna contacto, que mostra o email ou o texto (sem email) quando o email é NULL.

### Exercício 8 · Encomendas por mês e intervalo de datas

**Nível:** Avançado

Escreve, para cada um dos quatro dialetos (SQLite, PostgreSQL, MySQL e SQL Server), duas consultas: (a) o número de encomendas por mês no formato AAAA-MM (colunas mes e n), mantendo só os meses com pelo menos 2 encomendas; (b) a data da primeira encomenda, a da última e o número de dias entre as duas (colunas primeira, ultima e dias). Confirma que os resultados são iguais nos quatro.

## Módulo 03 · Joins e subconsultas

### Exercício 9 · Pendentes por cliente, incluindo zeros

**Nível:** Iniciante

Lista o nome, a cidade e o número de encomendas pendentes de todos os clientes, ordenados por nome. Quem não tem nenhuma encomenda pendente tem de aparecer com 0. Atenção ao sítio onde pões a condição do estado.

### Exercício 10 · Receita por categoria

**Nível:** Intermédio

Calcula a receita de cada categoria (soma de quantidade vezes preco_unitario das linhas de encomenda), ignorando as encomendas canceladas. Mostra o nome da categoria e a receita, da maior para a menor. Precisas de juntar quatro tabelas.

### Exercício 11 · Produtos que Lisboa nunca comprou

**Nível:** Intermédio

Encontra os produtos que nenhum cliente de Lisboa comprou (em qualquer estado de encomenda). Resolve de três maneiras (NOT EXISTS, NOT IN e LEFT JOIN com uma derived table) e confirma que dão o mesmo resultado. Explica porque é que o NOT IN seria perigoso se linhas_encomenda.produto_id aceitasse NULL.

### Exercício 12 · Clientes com uma encomenda acima da média

**Nível:** Avançado

Calcula o valor total de cada encomenda (soma das suas linhas) e a média desses totais. Lista os clientes cuja encomenda mais cara é superior a essa média, com o valor dessa encomenda, da maior para a menor. Usa uma derived table para o total por encomenda e uma subconsulta para a média, sem cair no erro de multiplicar linhas.

## Módulo 04 · Modificar dados e transações

# Exercícios do módulo 04 (exercícios 13 a 16)

Base m04, recriada com o ficheiro loja.sql antes de começares. Os exercícios são independentes entre si (usam ids diferentes). Corre cada um nos quatro motores sempre que possível. Usa ORDER BY nas consultas de verificação.

### Exercício 13 · Inserir, atualizar e apagar

**Nível:** Iniciante

a) Com um só INSERT, acrescenta dois produtos: o id 11 «Mochila Urbana» (categoria 3, preço 39.90, stock 12) e o id 12 «Rato Sem Fios» (categoria 2, preço 19.90, stock 50).

b) Aplica um desconto de 10% (arredondado a duas casas decimais) a todos os produtos com stock igual ou superior a 100.

c) Apaga o produto 12.

d) Confirma o resultado com um SELECT dos produtos 5, 10, 11 e 12, ordenados por id. Quantas linhas esperas e porquê?

### Exercício 14 · O id gerado, em cada dialeto

**Nível:** Intermédio

Cria uma tabela lista_espera com um id gerado automaticamente, produto_id (inteiro obrigatório) e email (texto obrigatório). Escreve a versão de cada dialeto (SQLite, PostgreSQL, MySQL e SQL Server).

a) Insere o pedido (produto 6, ana.ribeiro@exemplo.pt) e mostra o id gerado.

b) Insere de uma só vez três pedidos: (6, bruno.costa@exemplo.pt), (6, carla.mendes@exemplo.pt) e (3, diogo.pires@exemplo.pt). Em cada dialeto, que id obténs pelo mecanismo do «último id» e quais são os ids realmente inseridos? Onde for possível, obtém-nos todos.

c) Apaga os pedidos do produto 6 e mostra quantas linhas foram apagadas (e, onde existir, quais).

### Exercício 15 · Upsert da reposição de stock

**Nível:** Intermédio

Chegou uma lista de reposição com duas linhas: o produto 3 (Atlas Mundial, categoria 1, preço 29.99) passa a ter stock 15, e o produto 21 «Cadeira de Escritório» (categoria 3, preço 119.00, stock 6) é novo. Com um único comando por dialeto, atualiza o que existe e insere o que não existe (em caso de conflito atualiza o stock e o preço).

a) Escreve a solução para SQLite, PostgreSQL, MySQL e SQL Server.

b) Executa a sintaxe do MySQL no PostgreSQL e a do PostgreSQL no SQL Server. Que erros obténs?

### Exercício 16 · Uma venda com SAVEPOINT

**Nível:** Avançado

Regista a encomenda 13 (cliente 5, data 2025-06-10, estado pendente) numa só transação:

a) Insere a linha 27 (encomenda 13, produto 4, quantidade 1, preço 49.90) e baixa em 1 o stock do produto 4. Cria um savepoint.

b) Insere a linha 28 (encomenda 13, produto 6, quantidade 1, preço 79.00) e baixa em 1 o stock do produto 6. Verifica o stock: o que vês e porque é um problema (consulta o stock inicial do produto 6)?

c) Volta ao savepoint, de modo a manter só a primeira linha, e confirma a transação. Mostra o stock final dos produtos 4 e 6 e as linhas da encomenda 13.

d) Se em vez de ROLLBACK TO SAVEPOINT fizesses ROLLBACK, o que ficaria gravado?

## Módulo 05 · Modelação e DDL

# Exercícios do módulo 05 (exercícios 17 a 20)

Base m05, com o ficheiro loja.sql carregado. Salvo indicação em contrário, corre cada exercício nos quatro sistemas (SQLite, PostgreSQL, MySQL, SQL Server).

### Exercício 17 · Lista de desejos (N:M)

**Nível:** Iniciante

Os clientes querem guardar produtos numa lista de desejos. Cria a tabela lista_desejos, de ligação entre clientes e produtos, com as colunas cliente_id, produto_id e adicionado_em (data, obrigatória). Um cliente não pode ter o mesmo produto duas vezes na lista (usa uma chave primária composta) e, se o cliente ou o produto forem apagados, a linha da lista deve desaparecer com eles. Insere (1, 6, '2026-11-01'), (1, 4, '2026-11-02') e (2, 6, '2026-11-03'), tenta inserir de novo (1, 6, '2026-11-04') e lista o nome do cliente e o nome do produto, ordenados por cliente e produto. No fim, apaga a tabela.

### Exercício 18 · Tabela de cupões

**Nível:** Intermédio

Cria a tabela cupoes com: id gerado automaticamente (usa a sintaxe própria de cada sistema), codigo (texto até 20 carateres, obrigatório e único), desconto_pct (inteiro obrigatório entre 1 e 90), valido_ate (data obrigatória) e ativo (booleano obrigatório, por omissão verdadeiro; no SQL Server usa BIT).

a) Escreve o CREATE TABLE para cada um dos quatro sistemas, destacando as linhas que mudam.

b) Insere ('NATAL10', 10, '2026-12-31') e depois três linhas inválidas: o mesmo código com desconto 15; um desconto de 100; um cupão sem data de validade. Indica que restrição falhou em cada caso e confirma que só ficou uma linha.

### Exercício 19 · O PRAGMA do SQLite

**Nível:** Intermédio

Numa ligação nova ao SQLite com a loja carregada:

a) Consulta PRAGMA foreign_keys.

b) Insere uma encomenda (id 900, cliente_id 999, '2026-11-13', 'nova'). Foi aceite? Escreve um LEFT JOIN que encontre as encomendas sem cliente (órfãs) e apaga a linha 900.

c) Liga as chaves estrangeiras com o PRAGMA, repete o INSERT (id 901) e conta as encomendas órfãs.

d) Explica numa frase por que razão isto não acontece no PostgreSQL, MySQL e SQL Server.

### Exercício 20 · Alterar a estrutura

**Nível:** Avançado

Cria fornecedores (id inteiro chave primária, nome VARCHAR(30) obrigatório) com as linhas (1, 'Papelaria Central') e (2, 'Tech Norte'). Depois:

a) Acrescenta a coluna pais (VARCHAR(30), obrigatória, por omissão 'PT').

b) Renomeia nome para designacao.

c) Alarga designacao para VARCHAR(100), mantendo-a obrigatória.

Faz as alíneas a) a c) em PostgreSQL, MySQL e SQL Server (cada um com a sua sintaxe). No SQLite, a alínea c) não é possível com ALTER: mostra o erro e resolve-a reconstruindo a tabela (criar a nova, copiar com INSERT ... SELECT, apagar a antiga, renomear). Confirma no fim que as duas linhas têm pais igual a 'PT'.

## Módulo 06 · Consultas avançadas

# Exercícios do módulo 06 (exercícios 21 a 24)

Base m06, com o ficheiro loja.sql carregado, mais a tabela funcionarios criada na aula (id, nome, chefe_id).

### Exercício 21 · Clientes que gastam muito

**Nível:** Iniciante

Usa uma CTE que calcule o gasto total de cada cliente (soma de quantidade vezes preço unitário das linhas, ignorando encomendas canceladas). Na consulta principal mostra o nome e o gasto dos clientes que gastaram mais de 150, do maior para o menor.

### Exercício 22 · Quem trabalha debaixo do Rui?

**Nível:** Intermédio

Com uma CTE recursiva, lista todos os funcionários que dependem direta ou indiretamente de Rui Santos (id 2), com o nível de profundidade (1 para subordinados diretos). Não incluas o próprio Rui. Escreve a versão para PostgreSQL/MySQL/SQLite e indica o que mudas para o SQL Server.

### Exercício 23 · Última encomenda de cada cliente

**Nível:** Intermédio

Para cada cliente com encomendas, mostra a encomenda mais recente (id, data e estado). Usa uma função de janela com PARTITION BY e desempata por id decrescente, para o caso de duas encomendas na mesma data.

### Exercício 24 · Receita por mês e categoria

**Nível:** Avançado

Faz um pivot com CASE: uma linha por mês (formato AAAA-MM), uma coluna por categoria (Livros, Eletrónica, Casa) com a receita (sem encomendas canceladas) e uma coluna de total. Depois reescreve a consulta com PIVOT no SQL Server e compara os valores vazios nos dois métodos.

## Módulo 07 · Índices e desempenho

# Exercícios do módulo 07 (exercícios 25 a 28)

Todos usam a tabela pedidos da aula 07 (100 000 linhas geradas por fórmula), criada com o código da secção «O que é um índice». Podes resolvê-los em SQLite com Python (compara o plano com `EXPLAIN QUERY PLAN`) ou no motor da tua escolha. Mede sempre o plano e o tempo antes e depois de cada índice.

### Exercício 25 · O primeiro índice

**Nível:** Iniciante

a) Mostra o plano e mede o tempo da consulta `SELECT * FROM pedidos WHERE email = 'user77777@exemplo.pt'` sem nenhum índice além da chave primária.

b) Cria um índice em email, repete a consulta e diz que palavra do plano mudou e o que isso significa (varrimento ou procura).

### Exercício 26 · A ordem das colunas

**Nível:** Intermédio

Considera as três consultas: (A) `WHERE cliente_id = 77`; (B) `WHERE estado = 'pendente' AND cliente_id = 77`; (C) `WHERE estado = 'cancelado'` (seleciona só o id).

a) Cria o índice (estado, cliente_id) e diz, pelo plano, quais das três consultas o usam para procurar.

b) Apaga-o, cria (cliente_id, estado) e repete. Qual das duas ordens serve melhor se só existirem as consultas A e B? E se existir também a C?

### Exercício 27 · Consulta não sargável

**Nível:** Intermédio

Queres contar os pedidos de março de 2024 (com um índice em data_pedido). Escreve a consulta de duas maneiras: uma que aplica uma função à coluna (strftime no SQLite, TO_CHAR no PostgreSQL) e outra com um intervalo de datas. Compara os planos e os tempos e explica porque é que uma delas não consegue procurar no índice.

### Exercício 28 · Um índice para uma consulta

**Nível:** Avançado

A consulta `SELECT data_pedido, total FROM pedidos WHERE cliente_id = 77 AND estado = 'entregue' ORDER BY data_pedido` é executada milhares de vezes por dia.

a) Mostra o plano sem índices e com um índice só em cliente_id.

b) Desenha um único índice que evite a ordenação e que também dispense a visita à tabela. Mostra o plano.

c) Mede quanto custa esse índice na escrita: copia as 100 000 linhas para uma tabela com o índice e para outra sem ele, e compara os tempos.

## Módulo 08 · Dialetos de SQL

# Exercícios do módulo 08 (exercícios 29 a 32)

Base m08, com o ficheiro loja.sql carregado. Corre cada exercício nos quatro sistemas (SQLite, PostgreSQL, MySQL, SQL Server) e compara os resultados.

### Exercício 29 · Página 3 de clientes

**Nível:** Iniciante

Mostra a página 3 da lista de clientes, com 3 clientes por página e ordenados por nome. Cada linha deve ter a forma Nome <email>, e quando o cliente não tem email deve aparecer sem email entre os sinais (por exemplo Hugo Teixeira <sem email>). Escreve a query para os quatro sistemas, usando só a sintaxe que cada um aceita para paginar, e indica quais as duas variantes de paginação que usaste.

### Exercício 30 · Três resultados silenciosos

**Nível:** Intermédio

Corre nos quatro sistemas:

a) SELECT COUNT(*) FROM clientes WHERE nome = 'ana ribeiro';

b) O id do primeiro cliente de SELECT id FROM clientes ORDER BY email, id (só a primeira linha).

c) SELECT 10 / 4 AS a, 10.0 / 4 AS b;

Regista numa tabela os resultados de cada sistema, indica quais divergem e porquê, e reescreve a), b) e c) de modo que os quatro dêem o mesmo valor lógico: 1 linha para a), o id 1 para b) e um decimal 2.5 para c).

### Exercício 31 · Alertas de stock

**Nível:** Intermédio

a) Cria a tabela m08_alertas (produto_id inteiro, chave primária; minimo inteiro, obrigatório). Faz um upsert de (6, 10), depois de (6, 20) e de (4, 5), usando o mecanismo de cada sistema, e mostra a tabela ordenada por produto_id: devem ficar duas linhas, com o produto 6 a ter mínimo 20.

b) Por categoria, lista numa só célula, por ordem alfabética e separados por vírgula, os nomes dos produtos com stock inferior a 20.

c) Indica o erro que obténs se usares nos outros sistemas a sintaxe de upsert do PostgreSQL (ON CONFLICT) no MySQL e no SQL Server.

### Exercício 32 · Migrar uma query do PostgreSQL

**Nível:** Avançado

Esta query corre no PostgreSQL:

    SELECT nome || ' (' || cidade || ')' AS cliente,
           DATE '2025-01-01' - data_registo AS dias,
           email IS NULL AS sem_email
    FROM clientes
    WHERE cidade ILIKE 'lisboa'
    ORDER BY email DESC NULLS LAST
    LIMIT 2 OFFSET 1;

Escreve uma versão para o SQLite, uma para o MySQL e uma para o SQL Server que dêem as mesmas duas linhas (com sem_email como 0 ou 1). Procura ter o máximo de código comum: indica que partes ficaram iguais nos quatro e quais tiveste de isolar por dialeto, e justifica cada alteração com o erro ou o comportamento que a motivou.

## Módulo 09 · SQL em código e objetos

# Exercícios do módulo 09 (exercícios 33 a 36)

Base m09 (ou SQLite em memória), com o ficheiro loja.sql carregado. Os exercícios 33 a 35 usam o módulo sqlite3 do Python; o 36 usa PostgreSQL.

### Exercício 33 · Produtos por categoria com parâmetros

**Nível:** Iniciante

Em Python (sqlite3), escreve uma consulta que devolva o nome e o preço dos produtos de uma categoria (pelo nome da categoria, por exemplo Eletrónica) com stock superior a um valor mínimo, ordenados por preço crescente. Passa os dois valores como parâmetros nomeados (:categoria e :minimo). Depois escreve a mesma consulta com marcadores ? e confirma que dá o mesmo resultado. Testa também com Casa e mínimo 10.

### Exercício 34 · Atacar e corrigir uma pesquisa

**Nível:** Intermédio

Escreve uma função por_estado_mau(estado) que lista id, cliente_id e estado das encomendas de um estado, construindo o SQL com uma f-string. Mostra dois ataques: um que devolva todas as encomendas e outro, com UNION, que faça aparecer os emails dos clientes na coluna do estado. Depois escreve por_estado_bom(estado) com parâmetros e mostra que as mesmas entradas já não devolvem nada.

### Exercício 35 · Registar uma encomenda de forma atómica

**Nível:** Intermédio

Escreve registar_encomenda(con, cliente_id, itens), em que itens é uma lista de pares (produto_id, quantidade). Numa única transação deve inserir a encomenda (estado pendente), inserir as linhas com o preço atual do produto e abater o stock. Se algum produto não tiver stock suficiente, levanta ValueError e nada pode ficar gravado. Mostra as contagens de encomendas, linhas e os stocks dos produtos 5 e 6 antes, depois de uma encomenda válida e depois de uma encomenda que falha no segundo item.

### Exercício 36 · Conta de análise com privilégios mínimos

**Nível:** Avançado

No PostgreSQL, cria uma vista v_resumo_cliente com o id, a cidade, o número de encomendas (sem canceladas) e o gasto total de cada cliente, sem expor nome nem email. Cria um role analista_m09 com login que só pode fazer SELECT nessa vista. Liga-te como esse role e mostra que a vista funciona (os 4 clientes que mais gastaram) e que ler a tabela clientes é recusado. No fim retira o privilégio e apaga o role e a vista. Em MySQL e SQL Server, indica os comandos equivalentes para criar a conta (não é preciso executar).

## Projeto final

### Exercício 37 · Módulo de relatórios portável para a loja

**Nível:** Avançado

Constrói o módulo de relatórios da loja a funcionar em pelo menos dois dialetos, seguindo o módulo 10: modelo, seis relatórios, transação de encomenda, índices medidos, programa em Python com parâmetros e uma tabela das diferenças entre dialetos.

**PRATICAR:** faz o projeto por fases e usa a grelha do módulo 10 e a consulta rápida do módulo 12.
