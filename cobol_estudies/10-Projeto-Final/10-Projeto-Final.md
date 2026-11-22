# 10 Projeto final

## O que vais fazer

Vais construir o **processamento noturno de encomendas da loja**, como se faz em COBOL na vida real: um conjunto de programas em lote (*batch*) que lê um ficheiro de encomendas, valida-o, atualiza o stock num ficheiro indexado e produz um relatório de faturação e um ficheiro de rejeições. O projeto junta tudo o que aprendeste: dados e PICTURE, instruções e fluxo, ficheiros sequenciais e indexados, relatórios, subprogramas e copybooks, e tratamento de erros.

**NOTA:** o projeto é aberto. O módulo 13 traz uma grelha para te avaliares, e não um código para copiar.

## O ciclo do processamento

    encomendas-novas.dat  ->  VALIDAR  ->  validas.dat      ->  ATUALIZAR STOCK  ->  produtos.idx (stock novo)
                                 |                                    |
                                 v                                    v
                           rejeicoes.dat                       FATURAR  ->  faturas.rpt (relatório)

Cada passo é um programa próprio, que comunica com o seguinte através de ficheiros e de um código de saída.

## Requisitos

### 1. Dados e copybooks (módulos 02 e 07)

- Usa os copybooks da loja (`cliente.cpy`, `produto.cpy`, `encomenda.cpy`, `linha.cpy`) com `COPY`.
- Cria um copybook novo para o registo de uma encomenda nova (cabeçalho e linhas num só ficheiro, com um indicador do tipo de registo).
- Todo o dinheiro em decimal (PIC com V ou COMP-3), e nunca em vírgula flutuante.

### 2. Validar (módulos 03 e 08)

Um programa que lê `encomendas-novas.dat` e rejeita, com o motivo, os registos que:

| Regra | Rejeição |
|---|---|
| O cliente não existe no ficheiro de clientes | Cliente desconhecido |
| O produto não existe | Produto desconhecido |
| A quantidade não é numérica ou é zero | Quantidade inválida |
| A data não é uma data válida | Data inválida |

Os registos válidos vão para `validas.dat` e os rejeitados para `rejeicoes.dat`, com o motivo.

### 3. Atualizar o stock (módulo 06)

- Carrega os produtos para um ficheiro indexado.
- Para cada linha válida, lê o produto pela chave e abate o stock com `REWRITE`.
- Se o stock não chegar, rejeita a **encomenda inteira** com o motivo «stock insuficiente» e não abates nenhuma das suas linhas.

### 4. Faturar (módulo 05)

- Relatório com cabeçalho, uma linha por artigo, subtotal por encomenda, IVA a 23% e total, e total geral no fim.
- Valores com PICTURE de edição, e paginação.
- Quebra de controlo por encomenda.

### 5. Controlo e qualidade (módulos 07 e 08)

- Subprograma de cálculo do IVA e do total, chamado pelo programa de faturação.
- `FILE STATUS` em todos os ficheiros e uma rotina central de tratamento de erros.
- Cada programa devolve um código de saída: 0 se correu bem, 4 se houve rejeições, 8 em caso de erro grave.
- Um pequeno conjunto de casos de teste (ficheiros de entrada com e sem erros) e a prova de que o resultado é o esperado.

## Entregáveis

| Entregável | Conteúdo |
|---|---|
| Programas | Os `.cob` e os copybooks |
| Dados de teste | Ficheiros de entrada com casos bons e maus |
| Resultados | Os ficheiros e o relatório produzidos, com a conta feita à mão para confirmar um total |
| Script de execução | Um `.sh` que compila e corre o ciclo todo (com Docker) |
| README | Como compilar e correr, as decisões e as limitações |

## Passo a passo

| Fase | O que fazes |
|---|---|
| 1 | Escreve o copybook e os dados de teste, com os casos bons e maus |
| 2 | Faz o programa de validação e confirma as rejeições |
| 3 | Carrega o ficheiro indexado e faz a atualização do stock |
| 4 | Faz o relatório de faturação e o subprograma do IVA |
| 5 | Acrescenta os códigos de saída e a rotina de erros |
| 6 | Escreve o script que corre o ciclo todo e confirma os totais à mão |

**DICA:** confirma o total geral do relatório com uma conta feita à mão (ou com um `awk`) sobre os ficheiros de dados. Um total que bate certo vale mais do que um relatório bonito.

## Grelha de avaliação

Cada critério vale de 0 a 3 (0 = ausente, 1 = fraco, 2 = bom, 3 = muito bom).

| Critério | O que procurar |
|---|---|
| Dados | Copybooks usados, dinheiro em decimal, layouts documentados |
| Validação | As quatro regras funcionam e cada rejeição tem motivo |
| Stock | REWRITE por chave, e uma encomenda sem stock não abate nada |
| Relatório | Colunas alinhadas, quebras de controlo e totais certos |
| Modularidade | Subprograma e copybooks, sem código duplicado |
| Erros | FILE STATUS em tudo, rotina central e códigos de saída |
| Testes | Casos com e sem erros, e resultado esperado confirmado à mão |
| Legibilidade | Nomes claros, parágrafos curtos, sem GO TO |
| Documentação | Alguém consegue compilar e correr só com o README |

Somando 9 critérios de 0 a 3, o máximo é 27. Até 13 há lacunas importantes; de 14 a 22 o trabalho está sólido; a partir de 23 está pronto para mostrar.

## Erros comuns

| Erro | Como evitar |
|---|---|
| Ultrapassar a coluna 72 | O texto depois dela é cortado em silêncio: confirma com o compilador |
| DISPLAY na coluna 7 | É lido como linha de depuração e ignorado |
| Não usar FILE STATUS | Um ficheiro em falta termina o programa com um erro seco |
| Estouro sem SIZE ERROR | O número fica truncado em silêncio |
| Abater stock linha a linha | Se uma linha falha, as anteriores já foram abatidas: valida a encomenda inteira primeiro |
| Dados com acentos em PIC X | Cada letra acentuada em UTF-8 ocupa 2 bytes e desalinha o registo |

## Depende do ambiente

- **GnuCOBOL (Docker):** é o que usaste no curso. Os ficheiros indexados e a ordenação dependem do gestor de ficheiros do compilador.
- **Mainframe:** o mesmo ciclo corre em JCL, com ficheiros VSAM e outro compilador. Esse ambiente não foi executado no curso: confirma sempre na documentação do teu compilador.
- **Produção real:** há ainda cópias de segurança, reinício a meio do lote e controlo de versões dos programas, que ficam fora deste projeto.

## Exercícios

**PRATICAR:** o exercício 37 do módulo 11 é este projeto. O módulo 13 traz a grelha de avaliação.

## Fontes oficiais

- [Manual de programação do GnuCOBOL](https://gnucobol.sourceforge.io/doc/gnucobol.html)
- [FAQ do GnuCOBOL](https://gnucobol.sourceforge.io/faq/index.html)
- [Documentação do IBM Enterprise COBOL para z/OS](https://www.ibm.com/docs/en/cobol-zos/6.4)
