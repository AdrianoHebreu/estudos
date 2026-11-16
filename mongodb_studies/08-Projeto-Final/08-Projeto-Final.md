# 08 Projeto final

## O que vais fazer

Vais construir o **catálogo e as encomendas da loja em MongoDB**, a correr num stack de Docker Compose com um replica set, e com uma pequena aplicação em Python por cima. O projeto junta tudo o que aprendeste: modelação, CRUD, agregações, índices, drivers e transações, segurança e operação.

**NOTA:** o projeto é aberto. O módulo 11 traz uma grelha para te avaliares, e não um código para copiar.

## Requisitos

### 1. Ambiente (módulos 01 e 07)

- Um `compose.yaml` com um replica set de 3 nós e autenticação.
- Volumes nomeados e segredos fora do ficheiro (variáveis de ambiente ou ficheiros que não vão para o Git).
- Um utilizador da aplicação com os papéis mínimos, e não o root.

### 2. Modelo (módulo 03)

Parte dos dados do módulo 00 e remodela-os:

- Encomendas com as linhas incorporadas, com o nome e o preço do produto no momento da compra.
- Produtos referenciados e clientes referenciados, e explica porquê em cada caso.
- Validação com `$jsonSchema` em pelo menos duas coleções.
- Dinheiro em `Decimal128`.

### 3. Operações (módulos 02 e 06)

Uma pequena aplicação em Python com pymongo que permite:

| Função | Descrição |
|---|---|
| Criar encomenda | Regista a encomenda e baixa o stock dos produtos numa transação |
| Cancelar encomenda | Repõe o stock numa transação |
| Pesquisar produtos | Por categoria, por intervalo de preço e por texto |
| Paginar | Listar encomendas de um cliente com paginação estável |

### 4. Agregações (módulo 04)

Escreve cinco relatórios como pipelines:

1. Receita por categoria e por mês.
2. Top 3 de clientes por valor gasto.
3. Produtos com stock baixo e vendas recentes.
4. Número de encomendas e valor médio por estado.
5. Um relatório com `$facet` que devolva em simultâneo o total por estado e a distribuição por escalões de preço.

### 5. Desempenho (módulo 05)

- Gera pelo menos 100 000 encomendas sintéticas.
- Mede os relatórios e as pesquisas antes e depois dos índices, com `explain("executionStats")`.
- Justifica cada índice, e apaga os que não ajudam.

### 6. Operação (módulo 07)

- Faz uma cópia de segurança com `mongodump` e prova que a restauras com `mongorestore` noutra base.
- Para o nó primário e mostra a eleição e a aplicação a continuar a funcionar.
- Escreve uma lista de verificação de produção com o que ficou por fazer.

## Entregáveis

| Entregável | Conteúdo |
|---|---|
| Ambiente | O `compose.yaml` e como o arrancar e parar |
| Modelo | Scripts de criação das coleções, validações e índices |
| Aplicação | O código Python e os testes |
| Relatórios | Os cinco pipelines |
| Medições | Planos e números antes e depois dos índices |
| README | Como correr, decisões de modelação e limitações |

## Passo a passo

| Fase | O que fazes |
|---|---|
| 1 | Arranca o replica set com autenticação e cria o utilizador da aplicação |
| 2 | Remodela os dados da loja e carrega-os |
| 3 | Escreve a aplicação e as transações, com testes |
| 4 | Escreve os relatórios e confirma os valores à mão |
| 5 | Gera os dados, mede, cria índices e mede outra vez |
| 6 | Faz a cópia, a restauração e o teste de eleição |

**DICA:** confirma cada relatório com uma conta feita à mão sobre os dados originais. Só depois o corras sobre os dados sintéticos.

## Grelha de avaliação

Cada critério vale de 0 a 3 (0 = ausente, 1 = fraco, 2 = bom, 3 = muito bom).

| Critério | O que procurar |
|---|---|
| Ambiente | Replica set com autenticação a funcionar, sem segredos no repositório |
| Modelo | Decisões de incorporar e referenciar justificadas |
| Validação | `$jsonSchema` com erros reais testados |
| Transações | A encomenda é atómica e há teste de falha |
| Relatórios | Valores certos, confirmados à mão |
| Índices | Cada um justificado com um plano, e os inúteis removidos |
| Segurança | Utilizador com papéis mínimos |
| Operação | Cópia restaurada e eleição demonstrada |
| Documentação | Alguém consegue correr o projeto só com o README |

Somando 9 critérios de 0 a 3, o máximo é 27. Até 13 há lacunas importantes; de 14 a 22 o trabalho está sólido; a partir de 23 está pronto para mostrar.

## Erros comuns

| Erro | Como evitar |
|---|---|
| Modelar como se fosse relacional | Parte dos padrões de acesso, e não das tabelas |
| Arrays que crescem sem limite | Usa referências ou o padrão bucket |
| Índices a mais | Mede cada um e remove os que não ajudam |
| Transações onde o modelo bastava | Incorpora para tornar a operação atómica |
| Credenciais no compose | Variáveis de ambiente e ficheiros ignorados pelo Git |
| Não testar a restauração | Uma cópia que nunca foi restaurada não é uma cópia |

## Exercícios

**PRATICAR:** o exercício 29 do módulo 09 é este projeto. O módulo 11 traz a grelha de avaliação.

## Fontes oficiais

- [Documentação do MongoDB](https://www.mongodb.com/docs/manual/)
- [Replicação](https://www.mongodb.com/docs/manual/replication/)
- [Transações](https://www.mongodb.com/docs/manual/core/transactions/)
- [Validação de esquema](https://www.mongodb.com/docs/manual/core/schema-validation/)
- [PyMongo](https://pymongo.readthedocs.io/)
