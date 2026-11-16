# 12 Consulta rápida

Uma página para consultar no dia a dia. Todas as diferenças entre dialetos foram executadas no curso em SQLite 3.45.3, PostgreSQL 17.12, MySQL 8.4.13 e SQL Server 2025. Para o detalhe, vê o módulo indicado.

## Ordem lógica de uma consulta (módulos 01 e 02)

| Passo | Cláusula | Nota |
|---|---|---|
| 1 | FROM e JOIN | Define as linhas de partida |
| 2 | WHERE | Filtra linhas antes de agrupar |
| 3 | GROUP BY | Agrupa |
| 4 | HAVING | Filtra grupos |
| 5 | SELECT | Calcula colunas e aliases |
| 6 | ORDER BY | Ordena; sem ele a ordem não é garantida |
| 7 | LIMIT, TOP ou FETCH | Limita o resultado |

## Limitar resultados (módulo 01)

| Sistema | Forma |
|---|---|
| SQLite, PostgreSQL, MySQL | LIMIT n OFFSET m |
| SQL Server | TOP n, ou OFFSET m ROWS FETCH NEXT n ROWS ONLY (exige ORDER BY) |
| PostgreSQL e SQL Server | FETCH FIRST n ROWS ONLY |

**ATENÇÃO:** FETCH falha no SQLite e no MySQL, e TOP só corre no SQL Server.

## NULL (módulo 01)

| Pergunta | Resposta |
|---|---|
| Testar nulo | IS NULL e IS NOT NULL, nunca = NULL |
| NOT IN com NULL na lista | Não devolve nada: usa NOT EXISTS |
| Ordem dos NULL em ORDER BY ascendente | No fim no PostgreSQL; no início nos outros três |
| Substituir NULL | COALESCE(x, valor), que existe nos quatro |

## Texto e números (módulo 02)

| Tarefa | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| Concatenar | Dois traços verticais | Dois traços verticais | CONCAT (os traços verticais são OR e dão 0) | + ou CONCAT; os traços verticais funcionam na 2025 |
| Divisão 7/2 | 3 | 3 | 3.5000 (DIV para inteira) | 3 |
| AVG de coluna inteira | 44.8 | 44.8 | 44.8 | 44 |
| Tamanho de texto | LENGTH em caracteres | LENGTH em caracteres | LENGTH conta bytes | LEN |

**DICA:** para uma divisão com decimais portável, converte primeiro um dos operandos para DECIMAL e confirma o resultado no teu sistema.

## Joins e conjuntos (módulo 03)

| Operação | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| INNER e LEFT JOIN | Sim | Sim | Sim | Sim |
| RIGHT JOIN | Sim (desde a 3.39) | Sim | Sim | Sim |
| FULL OUTER JOIN | Sim (desde a 3.39) | Sim | Não (erro 1064): usa LEFT UNION RIGHT | Sim |

**Regra:** um JOIN pode multiplicar linhas. Confirma sempre a contagem antes e depois.

## Alterar dados (módulo 04)

| Tarefa | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| Obter o id gerado | RETURNING | RETURNING | LAST_INSERT_ID() | OUTPUT ou SCOPE_IDENTITY() |
| Upsert | ON CONFLICT | ON CONFLICT | ON DUPLICATE KEY UPDATE | MERGE |
| Iniciar transação | BEGIN | BEGIN | START TRANSACTION | BEGIN TRANSACTION |

**ATENÇÃO:** UPDATE e DELETE sem WHERE afetam a tabela inteira. Em caso de dúvida, corre primeiro o SELECT com o mesmo WHERE, ou usa uma transação com ROLLBACK.

## Modelar e criar tabelas (módulo 05)

| Tarefa | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| Chave automática | INTEGER PRIMARY KEY AUTOINCREMENT | SERIAL ou IDENTITY | AUTO_INCREMENT | IDENTITY(1,1) |
| Chaves estrangeiras | Desligadas por omissão: PRAGMA foreign_keys = ON | Ativas | Ativas | Ativas |
| Valor por omissão com data | DEFAULT CURRENT_DATE | DEFAULT CURRENT_DATE | DEFAULT (CURRENT_DATE), com parênteses | DEFAULT CURRENT_DATE |
| JSON nativo | Funções sobre texto | Sim | Sim | Tipo JSON na 2025 |

**ATENÇÃO:** o SQLite não tem DECIMAL exato (aparecem resíduos como 242.60000000000002) e sem STRICT aceita texto numa coluna INTEGER.

## Consultas avançadas (módulo 06)

| Tarefa | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| CTE recursiva | WITH RECURSIVE | WITH RECURSIVE | WITH RECURSIVE | WITH, sem a palavra RECURSIVE |
| Juntar texto de um grupo | GROUP_CONCAT ou STRING_AGG | STRING_AGG | GROUP_CONCAT | STRING_AGG |
| Agregado com FILTER | Sim | Sim | Não | Não |
| Funções de janela | Sim | Sim | Sim | Sim |

## Índices e desempenho (módulo 07)

| Tarefa | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| Ver o plano | EXPLAIN QUERY PLAN | EXPLAIN ANALYZE | EXPLAIN ANALYZE | SHOWPLAN_TEXT, STATISTICS IO e TIME |

**Regras:** indexa as colunas de WHERE, JOIN e ORDER BY mais usadas, com a coluna mais seletiva primeiro nos índices compostos. Uma função sobre a coluna ou um LIKE com % à frente impede o uso do índice. Mede antes e depois.

## SQL em código (módulo 09)

| Driver | Placeholder |
|---|---|
| sqlite3 | ? ou :nome |
| psycopg e PyMySQL | %s |
| pyodbc | ? |

**ATENÇÃO:** nunca montes SQL com f-strings a partir de dados do utilizador. Usa sempre parâmetros.

## Objetos da base de dados (módulo 09)

| Objeto | Nota |
|---|---|
| Vista | Existe nos quatro |
| Vista materializada | Só no PostgreSQL |
| Triggers | No SQL Server não há BEFORE nem FOR EACH ROW |
| Permissões | GRANT com utilizadores de privilégios mínimos; os utilizadores de teste só viram a vista |

## Armadilhas de cada sistema (módulos 01 a 08)

| Sistema | Armadilha |
|---|---|
| SQLite | Aceita alias no WHERE e colunas fora do GROUP BY; ignora maiúsculas no LIKE só para ASCII |
| PostgreSQL | Ordena NULL no fim; não aceita alias no HAVING |
| MySQL | Os traços verticais são OR; CONCAT com NULL devolve NULL; LENGTH conta bytes |
| SQL Server | ISNULL trunca ao tipo do primeiro argumento; OFFSET FETCH exige ORDER BY; o sqlcmd tem QUOTED_IDENTIFIER desligado |

## Lista de verificação antes de mudar de sistema (módulo 08)

1. Paginação: LIMIT, TOP ou OFFSET FETCH.
2. Concatenação e NULL.
3. Datas: data atual, soma e diferença.
4. Chaves automáticas e como obter o id.
5. Upsert.
6. Divisão de inteiros e tipos decimais.
7. Comparação de texto com maiúsculas e minúsculas.
8. Ordem dos NULL.
9. FULL OUTER JOIN e FILTER.
10. Aspas de identificadores.
11. Planos de execução e índices.
12. Corre a suite de testes contra o sistema novo, e não só contra o antigo.

## Exercícios

**PRATICAR:** usa esta página para resolver os exercícios do módulo 11 sem abrir a documentação.

## Fontes oficiais

- [SQLite, linguagem SQL](https://www.sqlite.org/lang.html)
- [PostgreSQL 17, documentação](https://www.postgresql.org/docs/17/)
- [MySQL 8.4, manual](https://dev.mysql.com/doc/refman/8.4/en/)
- [SQL Server, referência de T-SQL](https://learn.microsoft.com/sql/t-sql/language-reference)
