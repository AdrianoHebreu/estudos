# 11 Exercícios práticos

36 exercícios, quatro por módulo, mais um projeto final. Cada aula indica com **PRATICAR** os exercícios que lhe correspondem. Compila e executa-os com o GnuCOBOL (o módulo 00 explica o ambiente com Docker) e respeita as colunas do formato fixo. Só consultas o módulo 13 depois de tentares.

## Módulo 01 · Primeiros programas

### Exercício 1 · Apresentação da loja

**Nível:** Iniciante

Escreve um programa LOJA, em formato fixo, que mostre três linhas: «Loja de estudo», «Clientes: 8» e «Produtos: 10». Usa só IDENTIFICATION DIVISION e PROCEDURE DIVISION, um comentário (asterisco na coluna 7) no início do ficheiro e termina com STOP RUN. Compila-o com cobc -x -o loja e executa-o. Depois compila-o outra vez com a opção que compila e executa de uma só vez.

### Exercício 2 · Ficha de cliente

**Nível:** Iniciante

Consulta o ficheiro clientes.dat e escolhe o cliente 005. Escreve um programa FICHA que declare na WORKING-STORAGE SECTION uma variável por campo (id, nome, email, cidade, data de registo, com os tamanhos do ficheiro, 9(03), X(20), X(30), X(10) e 9(08)), cada uma com o seu VALUE, e que mostre a ficha com uma etiqueta por linha. O que acontece ao 5 no campo PIC 9(03)? E aos espaços à direita do nome e do email?

### Exercício 3 · Registo por ACCEPT

**Nível:** Intermédio

Escreve um programa REGISTO que pergunte o nome (PIC X(20)) e a cidade (PIC X(10)) com ACCEPT e mostre uma mensagem de boas-vindas com os dois valores (por exemplo «Bem-vinda(o), Hugo Teixeira de Lisboa!»). Executa-o por pipe com os clientes Hugo Teixeira (Lisboa) e Graca Nunes (Faro), e uma terceira vez sem entrada nenhuma (redirecionando de /dev/null). Observa o preenchimento com espaços. Escreve depois a mesma versão em formato livre e compila-a com -free.

### Exercício 4 · Caça aos erros

**Nível:** Avançado

O programa abaixo tem três erros. Compila-o, lê as mensagens do cobc e corrige um erro de cada vez, recompilando até o programa funcionar. Para cada erro, indica a linha que o compilador aponta, a linha onde está realmente o problema e porque é que a mensagem engana.

           IDENTIFICATION DIVISION.
           PROGRAM-ID. FICHA.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-NOME                PIC X(20)  VALUE "Diogo Pires"
           01  DATA                   PIC 9(08)  VALUE 20240509.
           PROCEDURE DIVISION.
           PRINCIPAL.
               DISPLAY "Cliente: " WS-NOME.
               DISPLAY "Registo: " DATA.
               PERFORM FECHAR.
               STOP RUN.
           FECHA.
               DISPLAY "Fim da ficha".

## Módulo 02 · Dados e PICTURE

### Exercício 5 · Quantos bytes ocupa o produto?

**Nível:** Iniciante

O registo de produto da loja tem os campos ID (3 dígitos), nome (25 caracteres), categoria (2 dígitos), preço (5 inteiros e 2 decimais) e stock (5 dígitos). Escreve um programa com dois grupos: PRO-DISPLAY, com todos os campos numéricos em DISPLAY, e PRO-COMP, igual mas com ID, categoria e stock em COMP e o preço em COMP-3. Com FUNCTION LENGTH mostra o tamanho de cada grupo e o do campo preço e do ID no segundo. Responde: quantos bytes poupa o segundo grupo e porquê o preço em COMP-3 ocupa 4 bytes?

### Exercício 6 · Estados da encomenda com nível 88

**Nível:** Iniciante

Declara um campo ENC-ESTADO PIC X(10) com nomes de condição para os quatro estados da loja (pendente, enviada, entregue, cancelada) e mais um, ENC-ABERTA, verdadeiro para pendente e para enviada. Guarda os quatro estados numa tabela criada com VALUE, REDEFINES e OCCURS. Percorre a tabela, move cada estado para ENC-ESTADO e mostra se a encomenda está aberta ou fechada. No fim usa SET ENC-CANCELADA TO TRUE e mostra o conteúdo do campo.

### Exercício 7 · Valor do stock

**Nível:** Intermédio

Copia produtos.dat para a pasta do programa. Lê os dez produtos para um grupo REG-PRODUTO (usa um campo PIC X(42) para a linha lida). Para cada produto calcula o valor em stock (preço vezes stock) e mostra id, nome, preço, stock e valor. O produto sem stock deve aparecer com a indicação SEM STOCK, usando um nível 88 sobre o campo do stock. No fim mostra o valor total do stock da loja. Escolhe PICTURE grandes o suficiente para que nada seja truncado.

### Exercício 8 · Os clientes ao contrário

**Nível:** Avançado

Lê clientes.dat e guarda os oito clientes numa tabela com OCCURS 8 TIMES INDEXED BY IX-CLI, onde cada elemento tem o id, os primeiros 8 caracteres do nome (um MOVE de X(20) para X(8) trunca) e o ano de registo (usa um REDEFINES da data para o obteres). Depois mostra a tabela do último cliente para o primeiro, usando só SET UP BY e SET DOWN BY para mexer no índice. Por fim, acrescenta um acesso ao elemento 9 através de um subscrito numérico e compila com -debug: copia a mensagem de erro que aparece e diz o que acontece quando compilas sem -debug.

## Módulo 03 · Instruções e fluxo

### Exercício 9 · Total da linha com IVA

**Nível:** Iniciante

A linha 15 de linhas.dat é a encomenda 8: 4 unidades do produto 4 (Auscultadores Bluetooth) a 49.90. Escreve um programa que calcula o total da linha (MULTIPLY ... GIVING), o IVA a 23% duas vezes, uma sem ROUNDED e outra com ROUNDED (COMPUTE), e o total com IVA, e mostra os quatro valores. Depois muda a quantidade para 100 e guarda o total da linha num campo pequeno, PIC 9(03)V99 com o valor inicial 7.77: mostra o que fica nele sem ON SIZE ERROR; depois volta a pôr lá 7.77 e repete o cálculo com ON SIZE ERROR, mostrando o que fica.

### Exercício 10 · Portes por escalão

**Nível:** Intermédio

A loja cobra portes conforme o total da encomenda: menos de 20.00, portes de 4.99; de 20.00 a 49.99, portes de 2.99; a partir de 50.00, portes grátis. Guarda numa tabela (VALUE, REDEFINES e OCCURS, como no módulo 02) os totais 12.90, 19.99, 20.00, 49.99, 50.00 e 249.50. Percorre-os com PERFORM VARYING, calcula os portes de cada um com EVALUATE TRUE num parágrafo à parte, mostra total e portes, e no fim a soma dos portes. O parágrafo principal só deve chamar os outros.

### Exercício 11 · Validar e reformatar

**Nível:** Intermédio

Parte A: a data de registo do cliente 1 é 20240115 (AAAAMMDD). Define um grupo com ano, mês e dia (REDEFINES) e outro grupo, DATA-FORMATADA, com dia, FILLER "/", mês, FILLER "/" e ano. Usa MOVE CORRESPONDING para preencher o segundo e mostra «15/01/2024».

Parte B: tens quatro códigos de produto lidos como texto X(03): "004", "0A4", "4  " e três espaços. Para cada um, usa a condição de classe NUMERIC: se for numérico, move-o para um campo 9(03) e mostra-o; se não, escreve que é inválido. Percorre os quatro com PERFORM VARYING.

### Exercício 12 · Paginação

**Nível:** Avançado

Uma listagem de linhas de encomenda mostra 10 linhas por página. Escreve um programa com um parágrafo PAGINAR que, dado o total de linhas, usa DIVIDE ... REMAINDER para calcular o número de páginas (a última pode ficar incompleta) e depois, com PERFORM VARYING de um parágrafo, mostra para cada página a primeira e a última linha («pagina 3: linhas 21 a 26»). Chama-o com 26 linhas (as de linhas.dat), 20 linhas e 0 linhas e confirma que o último caso não mostra páginas. A última linha de cada página nunca pode ser maior do que o total.

## Módulo 04 · Ficheiros sequenciais

### Exercício 13 · Produtos sem stock

**Nível:** Iniciante

Copia produtos.dat para a pasta do programa. Lê o ficheiro com o ciclo de leitura antecipada e uma flag com nível 88. Para cada produto mostra o id, o nome, o preço e o stock. No fim mostra quantos produtos leste e quantos não têm stock (stock igual a zero).

### Exercício 14 · Encomendas abertas

**Nível:** Intermédio

Lê encomendas.dat e conta quantas encomendas há em cada estado (pendente, enviada, entregue, cancelada) com um EVALUATE. As encomendas ainda abertas (pendente e enviada) devem ser gravadas, com WRITE FROM, num ficheiro novo, abertas.dat. No fim mostra as quatro contagens e confere o conteúdo do ficheiro criado. Repara no tamanho em bytes do ficheiro: cada linha tem os espaços finais do estado cortados?

### Exercício 15 · O ficheiro existe?

**Nível:** Intermédio

Escreve um programa que recebe do teclado (ACCEPT) o nome de um ficheiro de texto, o liga ao SELECT por uma variável (ASSIGN TO nome-de-variável) e usa FILE STATUS. Se o OPEN INPUT der 00, conta os registos e mostra o total; se der 35, mostra «o ficheiro não existe»; para qualquer outro estado mostra o código. Testa com clientes.dat, linhas.dat, um nome que não exista e um caminho dentro de uma pasta que não exista.

### Exercício 16 · Total de cada encomenda

**Nível:** Avançado

Lê linhas.dat e calcula o total de cada encomenda (quantidade vezes preço unitário somado) com uma quebra de controlo: guarda o número da encomenda atual e, sempre que muda, grava e mostra o total acumulado e recomeça a soma. Grava os totais num ficheiro totais-enc.dat com o número da encomenda (4 dígitos) e o total (PIC 9(08)V99). Não te esqueças do último grupo no fim do ficheiro. Depois confere: a soma dos totais é igual ao total geral do ficheiro? Aparece alguma encomenda repetida? Porquê?

## Módulo 05 · Relatórios e texto

### Exercício 17 · Tabela de stock formatada

**Nível:** Iniciante

Copia produtos.dat para a pasta do programa. Lê os dez produtos e escreve uma tabela com id, nome, preço, stock e valor em stock (preço vezes stock), tudo com PICTURE de edição ao estilo português (ponto nos milhares, vírgula nos decimais, via DECIMAL-POINT IS COMMA). O produto sem stock deve ter as colunas de stock e de valor em branco, não a zero. No fim mostra o total do stock da loja.

### Exercício 18 · Fichas de cliente com STRING e UNSTRING

**Nível:** Intermédio

Lê clientes.dat e mostra, para cada cliente, uma linha do tipo «001 ANA RIBEIRO (Lisboa) - exemplo.pt»: id, nome em maiúsculas (com INSPECT CONVERTING), cidade entre parênteses (montada com STRING) e o domínio do email (obtido com UNSTRING no arroba). O cliente sem email deve mostrar «(sem email)» completo, sem ser cortado. No fim mostra quantos clientes não têm email. Explica porque DELIMITED BY SPACE corta «(sem email)».

### Exercício 19 · Encomendas atrasadas

**Nível:** Intermédio

Lê encomendas.dat e, tomando 2025-06-30 como data de referência, lista só as encomendas abertas (estado pendente ou enviada, com um nível 88). Para cada uma mostra a data com barras, o estado e os dias passados desde a data da encomenda; marca como ATRASADA as que têm mais de 30 dias. No fim mostra quantas estão abertas e quantas atrasadas.

### Exercício 20 · Stock por categoria com quebra de controlo

**Nível:** Avançado

Escreve para um ficheiro stock.txt um relatório do stock por categoria: cabeçalho com número de página, uma linha por produto (nome, preço, stock, valor), um subtotal por categoria com o nome da categoria (lido de categorias.dat para uma tabela em memória) e o total geral. Cada página tem no máximo 8 linhas e usa WRITE ... AFTER ADVANCING PAGE para mudar de página. Confirma primeiro que produtos.dat está ordenado por categoria: a quebra de controlo só funciona com dados ordenados. Mostra o ficheiro com cat -v.

## Módulo 06 · Ficheiros indexados e ordenação

### Exercício 21 · Encomendas indexadas

**Nível:** Iniciante

Carrega encomendas.dat (12 registos) para um ficheiro indexado encomendas.idx, com chave primária o ID da encomenda e chave alternativa o ID do cliente, que admite duplicados. Usa FILE STATUS e INVALID KEY no WRITE e mostra quantas encomendas foram gravadas. Depois lê por chave a encomenda 8 (mostra cliente e estado) e a encomenda 50 (mostra que não existe e o estado do ficheiro). Organiza o programa em parágrafos.

### Exercício 22 · Ficha do cliente com as encomendas

**Nível:** Intermédio

Com clientes.idx (carregado como na aula, com chave alternativa na cidade) e o encomendas.idx do exercício 21, escreve um programa que, para os clientes 1, 2 e 9, lê o cliente por chave e mostra «cliente NNN nome». Se o cliente existir, lista as suas encomendas (número e estado) com START na chave alternativa do cliente e READ NEXT, parando quando o cliente mudar. Se não existir, mostra que não existe. Usa um parágrafo para a ficha e outro para as encomendas.

### Exercício 23 · Manutenção de clientes

**Nível:** Intermédio

Parte de um clientes.idx acabado de carregar. Num só programa (ACCESS MODE DYNAMIC): grava o cliente 9 (Ines Faria, ines.faria@exemplo.pt, Faro, 20241201) e tenta gravá-lo outra vez, mostrando o estado; muda a cidade do cliente 3 para Faro com REWRITE; apaga o cliente 5; e lista todos os clientes por ordem de cidade (START >= com LOW-VALUES na chave alternativa). Regista o estado do REWRITE e do DELETE. Observa a ordem dos clientes de Faro e explica-a.

### Exercício 24 · Totais por produto com SORT

**Nível:** Avançado

Ordena linhas.dat por produto com SORT (USING) e, num OUTPUT PROCEDURE, calcula para cada produto o total de unidades e o valor (quantidade vezes preço unitário), com quebra de controlo no produto. Mostra uma linha por produto («produto 001 unidades 00007 valor 90.30», com o valor editado). Confirma os totais de pelo menos dois produtos somando à mão as linhas de linhas.dat.

## Módulo 07 · Subprogramas e modularização

### Exercício 25 · Preço com desconto e os modos de passagem

**Nível:** Iniciante

Escreve um subprograma PRECOFIM que recebe um preço (9(05)V99) e uma percentagem de desconto (9(02)) e devolve o preço final num terceiro parâmetro, com ROUNDED. Se a percentagem for superior a 50, o subprograma corta-a para 50 (altera o próprio parâmetro). O programa principal lê produtos.dat (com COPY do copybook produto.cpy) e mostra o preço e o preço com 15% de desconto, passando a percentagem BY CONTENT. No fim chama o subprograma com percentagem 70, uma vez BY CONTENT e outra BY REFERENCE, e mostra o valor da percentagem depois de cada chamada. Explica a diferença e porque é que o campo do resultado tem de levar BY REFERENCE explícito.

### Exercício 26 · Validar emails com um subprograma

**Nível:** Intermédio

Escreve um subprograma VALEMAIL que recebe um email (X(30)) e devolve no RETURN-CODE: 0 se tem exatamente uma arroba e pelo menos um ponto, 4 se está em branco e 8 em qualquer outro caso (usa INSPECT ... TALLYING). O principal lê clientes.dat (COPY de cliente.cpy, compilado com a opção -I), chama VALEMAIL para cada cliente e lista os que não passam, com o código; no fim mostra quantos são. Testa ainda dois emails escritos à mão, um sem arroba e outro com duas arrobas.

### Exercício 27 · Estatísticas que persistem entre chamadas

**Nível:** Intermédio

Escreve um subprograma ESTATS com um parâmetro de função: "A" acumula um valor (conta, soma e guarda o maior) e "R" devolve o resumo num grupo; qualquer outra função dá RETURN-CODE 8. O estado fica na WORKING-STORAGE do próprio subprograma. O principal chama "A" com o valor de cada uma das 26 linhas de linhas.dat (quantidade vezes preço unitário), pede o resumo, executa CANCEL "ESTATS", pede outra vez o resumo e experimenta a função "X". Explica o que o CANCEL fez ao estado.

### Exercício 28 · Módulo dinâmico com tratamento de falhas

**Nível:** Avançado

Escreve um subprograma BUSCACLI que recebe um id de cliente e devolve o nome e a cidade (procurando em clientes.dat), com RETURN-CODE 0 se encontrou e 4 se não. O principal lê encomendas.dat, e para cada encomenda pendente mostra o id da encomenda, o nome e a cidade do cliente; no fim procura o cliente 99. O nome do módulo a chamar é lido com ACCEPT e a chamada usa CALL com variável e ON EXCEPTION (sem depender de NOT ON EXCEPTION). Compila o BUSCACLI como módulo (cobc -m) para uma pasta lib/ e o principal à parte; executa com COB_LIBRARY_PATH=lib e o nome certo, com um nome errado, e sem COB_LIBRARY_PATH.

## Módulo 08 · Erros e depuração

### Exercício 29 · Rotina central de FILE STATUS

**Nível:** Iniciante

Escreve um programa que abre e conta os registos de dois ficheiros, um a seguir ao outro: produtos.dat (existe) e produtos-2026.dat (não existe). Usa um único SELECT com o nome do ficheiro numa variável (ASSIGN TO WS-NOME-FICH) e um parágrafo CONTAR-FICHEIRO executado duas vezes. Requisitos: (1) FILE STATUS e um parágrafo TRADUZIR-ESTADO, com EVALUATE, que põe uma mensagem legível em WS-MENSAGEM para os estados 00, 35 e qualquer outro; (2) para cada ficheiro, escreve o nome, o resultado do OPEN e, se abriu, o número de registos lidos; (3) se algum OPEN falhar, o programa termina com RETURN-CODE 8. Confirma o código de saída no shell com echo $? e compila com -Wall.

### Exercício 30 · Validar linhas de encomenda

**Nível:** Intermédio

Cria o ficheiro linhas-novas.dat com estas 8 linhas (o desenho é o de linhas.dat: ID 9(04), ENCOMENDA-ID 9(04), PRODUTO-ID 9(03), QUANTIDADE 9(03), PRECO-UNITARIO 9(05)V99, tudo seguido; a linha 7 tem dois espaços na quantidade):

    000100010010020001290
    000200010030000000500
    00A300020050020000900
    000400030110050000100
    000500040040100000000
    000600050020030002990
    000700060081  0000100
    000800060071500000350

Escreve um programa que lê o ficheiro e valida cada linha pela ordem: ID numérico; produto numérico e entre 1 e 10; quantidade numérica e entre 1 e 100; preço diferente de zero. Usa nível 78 para os limites e um EVALUATE TRUE para as regras. Para cada linha escreve OK com o valor (quantidade vezes preço) ou REJEITADA com o motivo. No fim escreve quantas foram aceites, quantas rejeitadas e o valor total das aceites (com máscara de edição). O programa termina com RETURN-CODE 4 se houve rejeições e 12 se o ficheiro não abre.

### Exercício 31 · Caçar três erros com -debug

**Nível:** Intermédio

O programa seguinte carrega produtos.dat numa tabela, mostra um pedaço do nome do primeiro produto e calcula o preço de N unidades (N lido do teclado). Tem três erros que o compilador não apanha. (1) Compila-o com -Wall e corre-o com echo 5A e pipe, sem -debug, e regista o que escreve (repara no nome e no total). (2) Compila com cobc -x -debug e corre-o outra vez: lê a mensagem de erro, corrige o erro apontado, recompila e repete até o programa correr sem erros em execução. (3) Para cada erro, indica a linha, a mensagem do libcob e a correção. (4) Acrescenta uma validação para que a entrada 5A seja recusada com RETURN-CODE 4 em vez de dar um total sem sentido. Pista: o terceiro erro não é de tabelas.

          *> EX31.COB - tem 3 erros. Encontra-os com cobc -debug
           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX31.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-PRODUTOS ASSIGN TO "produtos.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-PRODUTOS.
           01  REG-PRODUTO.
               05  PRO-ID              PIC 9(03).
               05  PRO-NOME            PIC X(25).
               05  PRO-CATEGORIA-ID    PIC 9(02).
               05  PRO-PRECO           PIC 9(05)V99.
               05  PRO-STOCK           PIC 9(05).
           WORKING-STORAGE SECTION.
           01  WS-FIM                  PIC X VALUE "N".
               88  FIM-FICHEIRO        VALUE "S".
           01  WS-N                    PIC 99 VALUE ZERO.
           01  WS-TABELA.
               05  WS-ITEM OCCURS 8 TIMES.
                   10  TAB-NOME        PIC X(25).
                   10  TAB-PRECO       PIC 9(05)V99.
           01  WS-POS                  PIC 99 VALUE 20.
           01  WS-QTD-TXT              PIC X(03).
           01  WS-QTD REDEFINES WS-QTD-TXT PIC 9(03).
           01  WS-TOTAL                PIC 9(07)V99.
           01  WS-TOTAL-ED             PIC Z,ZZZ,ZZ9.99.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-PRODUTOS
               PERFORM UNTIL FIM-FICHEIRO
                   READ F-PRODUTOS
                       AT END SET FIM-FICHEIRO TO TRUE
                       NOT AT END
                           ADD 1 TO WS-N
                           MOVE PRO-NOME TO TAB-NOME (WS-N)
                           MOVE PRO-PRECO TO TAB-PRECO (WS-N)
                   END-READ
               END-PERFORM
               CLOSE F-PRODUTOS
               DISPLAY "carregados: " WS-N
               DISPLAY "sufixo do 1o nome: " TAB-NOME (1) (WS-POS:10)
               ACCEPT WS-QTD-TXT
               COMPUTE WS-TOTAL = TAB-PRECO (1) * WS-QTD
               MOVE WS-TOTAL TO WS-TOTAL-ED
               DISPLAY "total de " WS-QTD " unidades do 1o: " WS-TOTAL-ED
               STOP RUN.

### Exercício 32 · Contagem por estado com tratador de erros

**Nível:** Avançado

Escreve um programa que lê do teclado (ACCEPT) o nome de um ficheiro com o desenho de encomendas.dat e conta as encomendas por estado (pendente, enviada, entregue, cancelada; tudo o resto é «desconhecido»). Requisitos: (1) DECLARATIVES com USE AFTER STANDARD ERROR PROCEDURE no ficheiro, que conta os erros e escreve o nome do ficheiro e o estado; (2) uma linha de depuração (D na coluna 7) que escreve cada registo lido e só aparece se compilares com -fdebugging-line; (3) um EVALUATE para classificar os estados; (4) RETURN-CODE 0 se tudo correu bem, 4 se houve estados desconhecidos e 12 se o ficheiro não abriu. Testa quatro casos: encomendas.dat; um ficheiro que não existe; encomendas.dat com uma linha extra 001300120250615perdida; e a primeira situação compilada com e sem -fdebugging-line. Em cada um confirma o código de saída.

## Módulo 09 · COBOL no mundo real

### Exercício 33 · De ASCII para EBCDIC

**Nível:** Iniciante

Escreve um programa que leia clientes.dat (71 carateres por registo) e grave clientes.ebc com cada registo convertido para EBCDIC (ALPHABET e INSPECT CONVERTING, ficheiro ORGANIZATION IS SEQUENTIAL). Confirma que o ficheiro tem 568 bytes e que é byte a byte igual ao que o iconv produz com a tabela CP037 a partir do mesmo texto (sem os fins de linha). Por fim, lê os três primeiros registos em Python com a tabela cp037 e mostra-os.

### Exercício 34 · Linhas de encomenda em COMP-3

**Nível:** Intermédio

Converte linhas.dat para linhas.bin com QUANTIDADE como S9(03) COMP-3 e PRECO-UNITARIO como S9(05)V99 COMP-3 (os restantes campos ficam em texto). Acrescenta um último registo de «nota de crédito» (id 9999, encomenda 1, produto 1, quantidade 1, preço -5.00) e mostra o tamanho do registo. Em Python, lê o ficheiro por posições, calcula o total geral e o total da encomenda 1 (sem a nota de crédito) e confirma com um cálculo feito diretamente em linhas.dat. Mostra também os bytes do preço da nota de crédito em hexadecimal e explica o último nibble.

### Exercício 35 · Produtos em CSV e JSON

**Nível:** Intermédio

Gera, a partir de produtos.dat, um produtos.csv (separador ponto e vírgula, cabeçalho, preço com ponto decimal, como 12.90) com STRING e um produtos.jsonl (um objeto por linha) com JSON GENERATE. Em Python, lê os dois ficheiros e confirma que o valor total de stock (preço vezes stock) é igual nos dois. Descreve o que aconteceu aos zeros à esquerda do id e à representação do preço no JSON.

### Exercício 36 · Desconto numa função em C

**Nível:** Avançado

Escreve em C a função desconto_c(centimos, pct), que devolve o preço em cêntimos depois de um desconto percentual, arredondado. Num programa COBOL, lê produtos.dat, converte cada preço para cêntimos, chama a função com 15 por cento (parâmetros por valor, resultado com RETURNING) e mostra o preço antigo, o novo e, no fim, a soma dos preços novos. Confirma a soma com um cálculo independente (por exemplo em Python). Compila uma vez com o ficheiro C e uma vez sem ele, e regista o erro que aparece.

## Projeto final

### Exercício 37 · Processamento noturno de encomendas da loja

**Nível:** Avançado

Constrói o processamento em lote das encomendas da loja, seguindo o módulo 10: validação com ficheiro de rejeições, atualização do stock num ficheiro indexado (rejeitando a encomenda inteira sem stock), relatório de faturação com quebras de controlo e IVA calculado num subprograma, tratamento central de erros com FILE STATUS, códigos de saída e casos de teste.

**PRATICAR:** faz o projeto por fases e usa a grelha do módulo 10 e a consulta rápida do módulo 12.
