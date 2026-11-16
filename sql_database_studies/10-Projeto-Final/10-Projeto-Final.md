# 10 Projeto final

## O que vais fazer

Vais construir um **módulo de relatórios para a loja** que funciona em pelo menos **dois dialetos diferentes** (por exemplo SQLite e PostgreSQL, ou SQLite e SQL Server). O objetivo é juntar tudo o que aprendeste: modelação, consultas, transações, índices, objetos da base de dados, SQL a partir de código e, sobretudo, as diferenças entre dialetos.

**NOTA:** este projeto não tem uma solução única. O módulo 13 traz uma grelha para te avaliares, e não um código para copiar.

## Requisitos

### 1. Modelo de dados (módulo 05)

Parte do `loja.sql` do módulo 00 e acrescenta:

- Uma tabela `avaliacoes` (cliente, produto, nota de 1 a 5, comentário, data) com chaves estrangeiras e uma restrição CHECK na nota.
- Uma tabela `moradas` (um cliente pode ter várias) ou outra relação 1:N que justifiques.
- Chaves automáticas, valores por omissão e restrições adequados a cada dialeto.

### 2. Consultas (módulos 01 a 03 e 06)

Escreve estes seis relatórios, cada um como uma consulta (ou vista):

| # | Relatório |
|---|---|
| 1 | Receita total por categoria e por mês |
| 2 | Os 3 clientes que mais gastaram, com o valor e a posição no ranking |
| 3 | Produtos com stock baixo e que tiveram vendas, ordenados por urgência |
| 4 | Clientes sem encomendas entregues |
| 5 | Receita acumulada mês a mês (janela) |
| 6 | Média das notas por produto, incluindo produtos sem avaliações |

### 3. Escritas seguras (módulo 04)

- Um procedimento (função, procedimento armazenado ou código) que **regista uma encomenda** com as suas linhas e **atualiza o stock** dentro de uma transação, e que faz ROLLBACK se faltar stock.
- Um teste que mostra o ROLLBACK a funcionar.

### 4. Desempenho (módulo 07)

- Gera pelo menos 100 000 encomendas sintéticas.
- Mede o relatório 1 antes e depois de criares os índices certos, com o plano de execução em cada dialeto.

### 5. Código (módulo 09)

- Um programa Python que corre os seis relatórios e as escritas **com parâmetros** (nunca com f-strings), escolhendo o dialeto por configuração.
- Uma camada de acesso a dados onde ficam isoladas as diferenças entre dialetos (paginação, datas, concatenação, upsert).

### 6. Dialetos (módulo 08)

- Uma tabela no teu `README` com o que **teve de mudar** de um dialeto para o outro, e porquê.
- Pelo menos **três** diferenças que descobriste por executares e não por leres.

## Entregáveis

| Entregável | Conteúdo |
|---|---|
| Esquema | Um ficheiro de DDL por dialeto |
| Dados | Script de carga e gerador dos dados sintéticos |
| Relatórios | Os seis relatórios, por dialeto |
| Programa | O código Python e o ficheiro de configuração |
| Medições | Planos e tempos antes e depois dos índices |
| README | Como correr, tabela de diferenças entre dialetos e limitações |

## Passo a passo

| Fase | O que fazes |
|---|---|
| 1 | Cria o esquema e carrega os dados num dialeto, e só depois no segundo |
| 2 | Escreve os seis relatórios no primeiro dialeto e confirma os resultados à mão |
| 3 | Porta-os para o segundo e anota cada alteração |
| 4 | Escreve a transação da encomenda e o teste de ROLLBACK |
| 5 | Gera os dados, mede, cria índices e mede outra vez |
| 6 | Isola as diferenças na camada de acesso e escreve o README |

**DICA:** confirma cada relatório com uma conta feita à mão sobre os dados do `loja.sql` (por exemplo, a receita de uma encomenda). Só depois o corras sobre os dados sintéticos.

## Grelha de avaliação

Cada critério vale de 0 a 3 (0 = ausente, 1 = fraco, 2 = bom, 3 = muito bom).

| Critério | O que procurar |
|---|---|
| Modelo | Chaves, restrições e normalização adequadas |
| Corretude | Os relatórios dão o valor certo, confirmado à mão |
| NULL e junções | Produtos sem avaliações e clientes sem encomendas tratados |
| Transações | A encomenda é atómica e o ROLLBACK está testado |
| Desempenho | Medições antes e depois, com o plano |
| Segurança | Só consultas parametrizadas |
| Portabilidade | As diferenças estão isoladas e documentadas |
| Descobertas | Pelo menos três diferenças verificadas por execução |
| Documentação | Alguém consegue correr o projeto só com o README |

Somando 9 critérios de 0 a 3, o máximo é 27. Até 13 há lacunas importantes; de 14 a 22 o trabalho está sólido; a partir de 23 está pronto para mostrar.

## Erros comuns

| Erro | Como evitar |
|---|---|
| Confiar num resultado só porque corre | Confirma com uma conta feita à mão |
| Esquecer o ORDER BY | Sem ele a ordem não é garantida |
| Juntar tabelas e multiplicar linhas | Compara a contagem antes e depois do JOIN |
| Medir só uma vez | Repete e anota a variação |
| Dados sintéticos pouco realistas | Varia as distribuições, para o índice contar |
| Escrever SQL à medida de um só sistema | Isola as diferenças logo desde o início |

## Exercícios

**PRATICAR:** o exercício 37 do módulo 11 é este projeto. O módulo 13 traz a grelha de avaliação.

## Fontes oficiais

- [SQLite, linguagem SQL](https://www.sqlite.org/lang.html)
- [PostgreSQL 17, documentação](https://www.postgresql.org/docs/17/)
- [MySQL 8.4, manual](https://dev.mysql.com/doc/refman/8.4/en/)
- [SQL Server, referência de T-SQL](https://learn.microsoft.com/sql/t-sql/language-reference)
- [Python, módulo sqlite3](https://docs.python.org/3/library/sqlite3.html)
