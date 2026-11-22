# 13 Soluções e critérios

Soluções dos exercícios do módulo 11. Todas foram executadas durante a escrita do curso e os resultados mostrados são reais. Há sempre mais de uma solução correta: compara o comportamento, não o código.

## Módulo 01 · Primeiros programas

### Exercício 1

          * Exercicio 1: apresentacao da loja.
           IDENTIFICATION DIVISION.
           PROGRAM-ID. LOJA.
           PROCEDURE DIVISION.
           PRINCIPAL.
               DISPLAY "Loja de estudo".
               DISPLAY "Clientes: 8".
               DISPLAY "Produtos: 10".
               STOP RUN.

    cobc -x -o loja ex1.cob
    ./loja
    Loja de estudo
    Clientes: 8
    Produtos: 10

    cobc -x -j ex1.cob
    Loja de estudo
    Clientes: 8
    Produtos: 10

O asterisco na coluna 7 faz da primeira linha um comentário. A opção -j compila e executa de seguida (o executável chama-se ex1, como o ficheiro).

### Exercício 2

          * Exercicio 2: ficha da cliente 005, escrita a mao.
           IDENTIFICATION DIVISION.
           PROGRAM-ID. FICHA.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-CLI-ID              PIC 9(03)  VALUE 5.
           01  WS-CLI-NOME            PIC X(20)  VALUE "Eva Martins".
           01  WS-CLI-EMAIL           PIC X(30)
                                      VALUE "eva.martins@exemplo.pt".
           01  WS-CLI-CIDADE          PIC X(10)  VALUE "Coimbra".
           01  WS-CLI-DATA-REGISTO    PIC 9(08)  VALUE 20240630.
           PROCEDURE DIVISION.
           PRINCIPAL.
               DISPLAY "Id:     " WS-CLI-ID.
               DISPLAY "Nome:   " WS-CLI-NOME.
               DISPLAY "Email:  " WS-CLI-EMAIL.
               DISPLAY "Cidade: " WS-CLI-CIDADE.
               DISPLAY "Desde:  " WS-CLI-DATA-REGISTO.
               STOP RUN.

    cobc -x -o ficha ex2.cob
    ./ficha
    Id:     005
    Nome:   Eva Martins
    Email:  eva.martins@exemplo.pt
    Cidade: Coimbra
    Desde:  20240630

O 5 aparece como 005: um campo numérico PIC 9(03) tem sempre 3 dígitos, com zeros à esquerda. O nome (20 posições), o email (30) e a cidade (10) são preenchidos com espaços à direita, que a saída não deixa ver mas ocupam o tamanho declarado. O VALUE do email foi escrito na linha seguinte, na área B, para não passar da coluna 72.

### Exercício 3

          * Exercicio 3: ler nome e cidade e cumprimentar.
           IDENTIFICATION DIVISION.
           PROGRAM-ID. REGISTO.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-NOME                PIC X(20).
           01  WS-CIDADE              PIC X(10).
           PROCEDURE DIVISION.
           PRINCIPAL.
               DISPLAY "Nome: " WITH NO ADVANCING.
               ACCEPT WS-NOME.
               DISPLAY "Cidade: " WITH NO ADVANCING.
               ACCEPT WS-CIDADE.
               DISPLAY "Bem-vinda(o), " WS-NOME "de " WS-CIDADE "!".
               STOP RUN.

    cobc -x -o registo ex3.cob
    (echo Hugo Teixeira; echo Lisboa) | ./registo
    Nome: Cidade: Bem-vinda(o), Hugo Teixeira       de Lisboa    !

    (echo Graca Nunes; echo Faro) | ./registo
    Nome: Cidade: Bem-vinda(o), Graca Nunes         de Faro      !

    ./registo < /dev/null
    Nome: Cidade: Bem-vinda(o),                     de           !

Num pipe as respostas não aparecem no ecrã, por isso as perguntas ficam seguidas. Os campos têm 20 e 10 posições e são preenchidos com espaços: é isso que alarga o espaço antes do «de» e do «!». Sem entrada, o ACCEPT não dá erro e as variáveis ficam com espaços. A versão em formato livre:

    *> Exercicio 3 em formato livre.
    identification division.
    program-id. registo.
    data division.
    working-storage section.
    01 ws-nome   pic x(20).
    01 ws-cidade pic x(10).
    procedure division.
    principal.
        display "Nome: " with no advancing.
        accept ws-nome.
        display "Cidade: " with no advancing.
        accept ws-cidade.
        display "Bem-vinda(o), " ws-nome "de " ws-cidade "!".
        stop run.

    cobc -x -free -o registol ex3livre.cob
    (echo Hugo Teixeira; echo Lisboa) | ./registol
    Nome: Cidade: Bem-vinda(o), Hugo Teixeira       de Lisboa    !

### Exercício 4

Compilação do programa original (três erros):

    cobc -x -o q ex4-quebrado.cob
    ex4-quebrado.cob:6: error: syntax error, unexpected DATA
        6 >        01  DATA                   PIC 9(08)  VALUE 20240509.
    ex4-quebrado.cob:10: error: syntax error, unexpected DATA
       10 >            DISPLAY "Registo: " DATA.
    ex4-quebrado.cob:11: error: 'FECHAR' is not defined
       11 >            PERFORM FECHAR.

Erro 1: DATA é uma palavra reservada (a mesma que abre a DATA DIVISION), por isso não serve de nome de variável. O compilador queixa-se na linha 6 e de novo na 10, onde a variável é usada. Renomeia para WS-DATA nas duas linhas. Depois da correção, o erro da linha 6 passa a ser outro:

    ex4-quebrado.cob:6: error: syntax error, unexpected Identifier
        6 >        01  WS-DATA                PIC 9(08)  VALUE 20240509.
    ex4-quebrado.cob:10: error: 'WS-DATA' is not defined
    ex4-quebrado.cob:11: error: 'FECHAR' is not defined

Erro 2: falta o ponto no fim da linha 5 (VALUE "Diogo Pires"). O compilador aponta à linha 6, a seguinte, e a variável WS-DATA «não existe» na linha 10 só porque a sua declaração não chegou a ser lida: é uma consequência. Põe o ponto na linha 5. Resta:

    ex4-quebrado.cob:11: error: 'FECHAR' is not defined
       11 >            PERFORM FECHAR.

Erro 3: o parágrafo chama-se FECHA, não FECHAR (gralha). Corrige o PERFORM:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. FICHA.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-NOME                PIC X(20)  VALUE "Diogo Pires".
           01  WS-DATA                PIC 9(08)  VALUE 20240509.
           PROCEDURE DIVISION.
           PRINCIPAL.
               DISPLAY "Cliente: " WS-NOME.
               DISPLAY "Registo: " WS-DATA.
               PERFORM FECHA.
               STOP RUN.
           FECHA.
               DISPLAY "Fim da ficha".

    cobc -x -o sol ex4-sol.cob
    ./sol
    Cliente: Diogo Pires
    Registo: 20240509
    Fim da ficha

## Módulo 02 · Dados e PICTURE

### Exercício 5

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL5.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  PRO-DISPLAY.
               05  PD-ID           PIC 9(03).
               05  PD-NOME         PIC X(25).
               05  PD-CATEGORIA    PIC 9(02).
               05  PD-PRECO        PIC 9(05)V99.
               05  PD-STOCK        PIC 9(05).
           01  PRO-COMP.
               05  PC-ID           PIC 9(03)    COMP.
               05  PC-NOME         PIC X(25).
               05  PC-CATEGORIA    PIC 9(02)    COMP.
               05  PC-PRECO        PIC 9(05)V99 COMP-3.
               05  PC-STOCK        PIC 9(05)    COMP.
           PROCEDURE DIVISION.
           PRINCIPAL.
               DISPLAY "PRO-DISPLAY: " FUNCTION LENGTH(PRO-DISPLAY)
                       " bytes"
               DISPLAY "  PD-PRECO : " FUNCTION LENGTH(PD-PRECO)
               DISPLAY "PRO-COMP   : " FUNCTION LENGTH(PRO-COMP) " bytes"
               DISPLAY "  PC-ID    : " FUNCTION LENGTH(PC-ID)
               DISPLAY "  PC-PRECO : " FUNCTION LENGTH(PC-PRECO)
               DISPLAY "  PC-STOCK : " FUNCTION LENGTH(PC-STOCK)
               STOP RUN.

Saída:

    PRO-DISPLAY: 42 bytes
      PD-PRECO : 7
    PRO-COMP   : 36 bytes
      PC-ID    : 2
      PC-PRECO : 4
      PC-STOCK : 4

O grupo em COMP ocupa 36 bytes em vez de 42 (poupa 6): ID passa de 3 a 2, categoria de 2 a 1, stock de 5 a 4 e preço de 7 a 4. O preço tem 7 dígitos e o COMP-3 guarda dois por byte mais meio byte de sinal: (7 + 1) a dividir por 2 dá 4 bytes.

### Exercício 6

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL6.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  ENC-ESTADO          PIC X(10).
               88  ENC-PENDENTE    VALUE "pendente".
               88  ENC-ENVIADA     VALUE "enviada".
               88  ENC-ENTREGUE    VALUE "entregue".
               88  ENC-CANCELADA   VALUE "cancelada".
               88  ENC-ABERTA      VALUE "pendente" "enviada".
           01  ESTADOS-VALORES.
               05  FILLER          PIC X(10) VALUE "pendente".
               05  FILLER          PIC X(10) VALUE "enviada".
               05  FILLER          PIC X(10) VALUE "entregue".
               05  FILLER          PIC X(10) VALUE "cancelada".
           01  TAB-ESTADOS REDEFINES ESTADOS-VALORES.
               05  ESTADO          PIC X(10) OCCURS 4 TIMES.
           01  I                   PIC 9(01).
           PROCEDURE DIVISION.
           PRINCIPAL.
               PERFORM VARYING I FROM 1 BY 1 UNTIL I > 4
                   MOVE ESTADO(I) TO ENC-ESTADO
                   IF ENC-ABERTA
                       DISPLAY ENC-ESTADO " -> aberta"
                   ELSE
                       DISPLAY ENC-ESTADO " -> fechada"
                   END-IF
               END-PERFORM
               SET ENC-CANCELADA TO TRUE
               DISPLAY "Depois do SET: [" ENC-ESTADO "]"
               STOP RUN.

Saída:

    pendente   -> aberta
    enviada    -> aberta
    entregue   -> fechada
    cancelada  -> fechada
    Depois do SET: [cancelada ]

O 88 com dois valores é verdadeiro para qualquer um deles, e SET ... TO TRUE escreve o valor no campo (com espaços à direita até aos 10 caracteres).

### Exercício 7

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL7.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-PRODUTOS ASSIGN TO "produtos.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-PRODUTOS.
           01  LINHA-PRODUTO       PIC X(42).
           WORKING-STORAGE SECTION.
           01  REG-PRODUTO.
               05  PRO-ID              PIC 9(03).
               05  PRO-NOME            PIC X(25).
               05  PRO-CATEGORIA-ID    PIC 9(02).
               05  PRO-PRECO           PIC 9(05)V99.
               05  PRO-STOCK           PIC 9(05).
                   88  SEM-STOCK       VALUE ZERO.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           01  WS-VALOR                PIC 9(08)V99.
           01  WS-TOTAL                PIC 9(09)V99 VALUE ZERO.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-PRODUTOS
               READ F-PRODUTOS
                   AT END SET FIM-DO-FICHEIRO TO TRUE
               END-READ
               PERFORM UNTIL FIM-DO-FICHEIRO
                   MOVE LINHA-PRODUTO TO REG-PRODUTO
                   COMPUTE WS-VALOR = PRO-PRECO * PRO-STOCK
                   ADD WS-VALOR TO WS-TOTAL
                   IF SEM-STOCK
                       DISPLAY PRO-ID " " PRO-NOME " SEM STOCK"
                   ELSE
                       DISPLAY PRO-ID " " PRO-NOME " " PRO-PRECO
                               " x " PRO-STOCK " = " WS-VALOR
                   END-IF
                   READ F-PRODUTOS
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                   END-READ
               END-PERFORM
               CLOSE F-PRODUTOS
               DISPLAY "Valor total do stock: " WS-TOTAL
               STOP RUN.

Saída:

    001 Romance Policial          00012.90 x 00040 = 00000516.00
    002 Livro de Receitas         00018.50 x 00025 = 00000462.50
    003 Atlas Mundial             00029.99 x 00010 = 00000299.90
    004 Auscultadores Bluetooth   00049.90 x 00030 = 00001497.00
    005 Carregador USB-C          00014.90 x 00100 = 00001490.00
    006 Teclado Mecanico          SEM STOCK
    007 Candeeiro de Mesa         00022.00 x 00015 = 00000330.00
    008 Conjunto de Panelas       00089.90 x 00008 = 00000719.20
    009 Manta de Sofa             00034.50 x 00020 = 00000690.00
    010 Caneca de Ceramica        00006.50 x 00200 = 00001300.00
    Valor total do stock: 000007304.60

O valor de um produto chega a 99999.99 vezes 99999, por isso WS-VALOR leva 8 inteiros; o total leva 9. Com PICTURE pequenas o MOVE ou o COMPUTE cortariam os dígitos mais importantes em silêncio. O 88 sobre PRO-STOCK com VALUE ZERO dá nome ao teste do produto 6 (Teclado Mecânico).

### Exercício 8

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL8.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-CLIENTES ASSIGN TO "clientes.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-CLIENTES.
           01  LINHA-CLIENTE       PIC X(71).
           WORKING-STORAGE SECTION.
           01  REG-CLIENTE.
               05  CLI-ID              PIC 9(03).
               05  CLI-NOME            PIC X(20).
               05  CLI-EMAIL           PIC X(30).
               05  CLI-CIDADE          PIC X(10).
               05  CLI-DATA-REGISTO    PIC 9(08).
               05  CLI-DATA-PARTES REDEFINES CLI-DATA-REGISTO.
                   10  CLI-ANO         PIC 9(04).
                   10  CLI-MES         PIC 9(02).
                   10  CLI-DIA         PIC 9(02).
           01  TAB-CLIENTES.
               05  CLIENTE OCCURS 8 TIMES INDEXED BY IX-CLI.
                   10  TC-ID           PIC 9(03).
                   10  TC-NOME         PIC X(08).
                   10  TC-ANO          PIC 9(04).
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-CLIENTES
               SET IX-CLI TO 1
               READ F-CLIENTES
                   AT END SET FIM-DO-FICHEIRO TO TRUE
               END-READ
               PERFORM UNTIL FIM-DO-FICHEIRO
                   MOVE LINHA-CLIENTE TO REG-CLIENTE
                   MOVE CLI-ID   TO TC-ID(IX-CLI)
                   MOVE CLI-NOME TO TC-NOME(IX-CLI)
                   MOVE CLI-ANO  TO TC-ANO(IX-CLI)
                   SET IX-CLI UP BY 1
                   READ F-CLIENTES
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                   END-READ
               END-PERFORM
               CLOSE F-CLIENTES
               SET IX-CLI DOWN BY 1
               PERFORM 8 TIMES
                   DISPLAY TC-ID(IX-CLI) " [" TC-NOME(IX-CLI) "] "
                           TC-ANO(IX-CLI)
                   IF IX-CLI > 1
                       SET IX-CLI DOWN BY 1
                   END-IF
               END-PERFORM
               STOP RUN.

Saída:

    008 [Hugo Tei] 2024
    007 [Graca Nu] 2024
    006 [Filipe L] 2024
    005 [Eva Mart] 2024
    004 [Diogo Pi] 2024
    003 [Carla Me] 2024
    002 [Bruno Co] 2024
    001 [Ana Ribe] 2024

Depois de ler o oitavo cliente o índice avança para 9, por isso o programa recua uma posição antes de mostrar. Com um subscrito numérico (WS-POS a valer 9) e a compilação cobc -x -debug -o sol8d sol8d.cob:

    libcob: sol8d.cob:57: error: subscript of 'TC-NOME' out of bounds: 9
    note: maximum subscript for 'TC-NOME': 8

O programa pára com o erro. Sem -debug, como no exemplo limites.cob, não há verificação: o programa lê a memória a seguir à tabela e continua, sem erro.

## Módulo 03 · Instruções e fluxo

### Exercício 9

           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX09.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-QTD              PIC 9(03)    VALUE 4.
           01  WS-PRECO            PIC 9(05)V99 VALUE 49.90.
           01  WS-TAXA-IVA         PIC 9V99     VALUE 0.23.
           01  WS-TOTAL-LINHA      PIC 9(07)V99.
           01  WS-IVA-CORTADO      PIC 9(07)V99.
           01  WS-IVA              PIC 9(07)V99.
           01  WS-COM-IVA          PIC 9(07)V99.
           01  WS-PEQUENO          PIC 9(03)V99 VALUE 7.77.
           PROCEDURE DIVISION.
           0000-PRINCIPAL.
               MULTIPLY WS-QTD BY WS-PRECO GIVING WS-TOTAL-LINHA
               COMPUTE WS-IVA-CORTADO = WS-TOTAL-LINHA * WS-TAXA-IVA
               COMPUTE WS-IVA ROUNDED = WS-TOTAL-LINHA * WS-TAXA-IVA
               ADD WS-TOTAL-LINHA WS-IVA GIVING WS-COM-IVA
               DISPLAY "Total da linha  : " WS-TOTAL-LINHA
               DISPLAY "IVA sem ROUNDED : " WS-IVA-CORTADO
               DISPLAY "IVA com ROUNDED : " WS-IVA
               DISPLAY "Total com IVA   : " WS-COM-IVA
               MOVE 100 TO WS-QTD
               MOVE 49.90 TO WS-PRECO
               COMPUTE WS-PEQUENO = WS-QTD * WS-PRECO
               DISPLAY "Sem SIZE ERROR  : " WS-PEQUENO
               MOVE 7.77 TO WS-PEQUENO
               COMPUTE WS-PEQUENO = WS-QTD * WS-PRECO
                   ON SIZE ERROR
                       DISPLAY "Estouro; o campo ficou: " WS-PEQUENO
               END-COMPUTE
               STOP RUN.

    Total da linha  : 0000199.60
    IVA sem ROUNDED : 0000045.90
    IVA com ROUNDED : 0000045.91
    Total com IVA   : 0000245.51
    Sem SIZE ERROR  : 990.00
    Estouro; o campo ficou: 007.77

MULTIPLY ... GIVING deixa o resultado num campo à parte. O 199.60 x 0.23 dá 45.908: sem ROUNDED guarda 45.90, com ROUNDED 45.91. Sem ON SIZE ERROR, 100 x 49.90 = 4990.00 não cabe em 9(03)V99 e fica 990.00 (perdeu o 4 à esquerda) sem aviso; com ON SIZE ERROR o campo ficou intacto (007.77) e o programa pôde reagir.

### Exercício 10

           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX10.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  TOTAIS-ENC.
               05  FILLER          PIC 9(05)V99 VALUE 12.90.
               05  FILLER          PIC 9(05)V99 VALUE 19.99.
               05  FILLER          PIC 9(05)V99 VALUE 20.00.
               05  FILLER          PIC 9(05)V99 VALUE 49.99.
               05  FILLER          PIC 9(05)V99 VALUE 50.00.
               05  FILLER          PIC 9(05)V99 VALUE 249.50.
           01  TAB-TOTAIS          REDEFINES TOTAIS-ENC.
               05  TOTAL-ENC       PIC 9(05)V99 OCCURS 6 TIMES.
           01  WS-INDICE           PIC 9(02).
           01  WS-PORTES           PIC 9(03)V99.
           01  WS-SOMA-PORTES      PIC 9(05)V99 VALUE ZERO.
           PROCEDURE DIVISION.
           0000-PRINCIPAL.
               PERFORM 1000-CALCULAR-PORTES
                   VARYING WS-INDICE FROM 1 BY 1 UNTIL WS-INDICE > 6
               DISPLAY "Soma dos portes: " WS-SOMA-PORTES
               STOP RUN.
           1000-CALCULAR-PORTES.
               EVALUATE TRUE
                   WHEN TOTAL-ENC(WS-INDICE) < 20
                       MOVE 4.99 TO WS-PORTES
                   WHEN TOTAL-ENC(WS-INDICE) < 50
                       MOVE 2.99 TO WS-PORTES
                   WHEN OTHER
                       MOVE ZERO TO WS-PORTES
               END-EVALUATE
               ADD WS-PORTES TO WS-SOMA-PORTES
               DISPLAY "Total " TOTAL-ENC(WS-INDICE)
                       " portes " WS-PORTES.

    Total 00012.90 portes 004.99
    Total 00019.99 portes 004.99
    Total 00020.00 portes 002.99
    Total 00049.99 portes 002.99
    Total 00050.00 portes 000.00
    Total 00249.50 portes 000.00
    Soma dos portes: 00015.96

O EVALUATE TRUE testa as condições por ordem e só corre o primeiro WHEN verdadeiro, por isso basta testar < 20 e < 50: o resto cai no WHEN OTHER. Os valores de fronteira (19.99, 20.00, 49.99, 50.00) caem nos escalões certos. 4.99 + 4.99 + 2.99 + 2.99 = 15.96.

### Exercício 11

           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX11.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  CLI-DATA-REGISTO    PIC 9(08)    VALUE 20240115.
           01  CLI-DATA-PARTES     REDEFINES CLI-DATA-REGISTO.
               05  ANO             PIC 9(04).
               05  MES             PIC 9(02).
               05  DIA             PIC 9(02).
           01  DATA-FORMATADA.
               05  DIA             PIC 9(02).
               05  FILLER          PIC X        VALUE "/".
               05  MES             PIC 9(02).
               05  FILLER          PIC X        VALUE "/".
               05  ANO             PIC 9(04).
           01  CODIGOS-TXT.
               05  FILLER          PIC X(03)    VALUE "004".
               05  FILLER          PIC X(03)    VALUE "0A4".
               05  FILLER          PIC X(03)    VALUE "4  ".
               05  FILLER          PIC X(03)    VALUE "   ".
           01  TAB-CODIGOS         REDEFINES CODIGOS-TXT.
               05  CODIGO-TXT      PIC X(03)    OCCURS 4 TIMES.
           01  WS-INDICE           PIC 9(02).
           01  WS-PRODUTO-ID       PIC 9(03).
           PROCEDURE DIVISION.
           0000-PRINCIPAL.
               MOVE CORRESPONDING CLI-DATA-PARTES TO DATA-FORMATADA
               DISPLAY "Data: " DATA-FORMATADA
               PERFORM VARYING WS-INDICE FROM 1 BY 1 UNTIL WS-INDICE > 4
                   IF CODIGO-TXT(WS-INDICE) IS NUMERIC
                       MOVE CODIGO-TXT(WS-INDICE) TO WS-PRODUTO-ID
                       DISPLAY "[" CODIGO-TXT(WS-INDICE) "] valido: "
                               WS-PRODUTO-ID
                   ELSE
                       DISPLAY "[" CODIGO-TXT(WS-INDICE) "] invalido"
                   END-IF
               END-PERFORM
               STOP RUN.

    Data: 15/01/2024
    [004] valido: 004
    [0A4] invalido
    [4  ] invalido
    [   ] invalido

O MOVE CORRESPONDING só copia ANO, MES e DIA (os FILLER não têm nome) e cada um vai para o seu lugar, já com as barras. «4  » e os três espaços não são NUMERIC, por isso a validação recusa-os antes de entrarem num campo numérico.

### Exercício 12

           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX12.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-POR-PAGINA       PIC 9(02)    VALUE 10.
           01  WS-TOTAL-LINHAS     PIC 9(03).
           01  WS-PAGINAS          PIC 9(03).
           01  WS-RESTO            PIC 9(03).
           01  WS-PAGINA           PIC 9(03).
           01  WS-PRIMEIRA         PIC 9(03).
           01  WS-ULTIMA           PIC 9(03).
           PROCEDURE DIVISION.
           0000-PRINCIPAL.
               MOVE 26 TO WS-TOTAL-LINHAS
               PERFORM 1000-PAGINAR
               MOVE 20 TO WS-TOTAL-LINHAS
               PERFORM 1000-PAGINAR
               MOVE 0 TO WS-TOTAL-LINHAS
               PERFORM 1000-PAGINAR
               STOP RUN.
           1000-PAGINAR.
               DIVIDE WS-TOTAL-LINHAS BY WS-POR-PAGINA
                   GIVING WS-PAGINAS REMAINDER WS-RESTO
               IF WS-RESTO > 0
                   ADD 1 TO WS-PAGINAS
               END-IF
               DISPLAY WS-TOTAL-LINHAS " linhas: " WS-PAGINAS " paginas"
               PERFORM 1100-MOSTRAR-PAGINA
                   VARYING WS-PAGINA FROM 1 BY 1
                   UNTIL WS-PAGINA > WS-PAGINAS.
           1100-MOSTRAR-PAGINA.
               COMPUTE WS-PRIMEIRA = (WS-PAGINA - 1) * WS-POR-PAGINA + 1
               COMPUTE WS-ULTIMA = WS-PAGINA * WS-POR-PAGINA
               IF WS-ULTIMA > WS-TOTAL-LINHAS
                   MOVE WS-TOTAL-LINHAS TO WS-ULTIMA
               END-IF
               DISPLAY "  pagina " WS-PAGINA ": linhas "
                       WS-PRIMEIRA " a " WS-ULTIMA.

    026 linhas: 003 paginas
      pagina 001: linhas 001 a 010
      pagina 002: linhas 011 a 020
      pagina 003: linhas 021 a 026
    020 linhas: 002 paginas
      pagina 001: linhas 001 a 010
      pagina 002: linhas 011 a 020
    000 linhas: 000 paginas

DIVIDE ... GIVING REMAINDER dá 2 páginas e resto 6 para 26 linhas, e o IF do resto soma uma página. A última linha de cada página é limitada ao total (26, não 30). Com 0 linhas o quociente e o resto são 0, o PERFORM VARYING não corre nenhuma vez e não aparece nenhuma página.

## Módulo 04 · Ficheiros sequenciais

### Exercício 13

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL13.
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
               05  PRO-CATEGORIA       PIC 9(02).
               05  PRO-PRECO           PIC 9(05)V99.
               05  PRO-STOCK           PIC 9(05).
           WORKING-STORAGE SECTION.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           01  WS-TOTAL                PIC 9(03) VALUE ZEROS.
           01  WS-SEM-STOCK            PIC 9(03) VALUE ZEROS.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-PRODUTOS
               PERFORM LER-PRODUTO
               PERFORM UNTIL FIM-DO-FICHEIRO
                   ADD 1 TO WS-TOTAL
                   DISPLAY PRO-ID " " PRO-NOME " " PRO-PRECO
                           " stock " PRO-STOCK
                   IF PRO-STOCK = ZERO
                       ADD 1 TO WS-SEM-STOCK
                   END-IF
                   PERFORM LER-PRODUTO
               END-PERFORM
               CLOSE F-PRODUTOS
               DISPLAY "Produtos: " WS-TOTAL
               DISPLAY "Sem stock: " WS-SEM-STOCK
               STOP RUN.
           LER-PRODUTO.
               READ F-PRODUTOS
                   AT END SET FIM-DO-FICHEIRO TO TRUE
               END-READ.

Saída:

    001 Romance Policial          00012.90 stock 00040
    002 Livro de Receitas         00018.50 stock 00025
    003 Atlas Mundial             00029.99 stock 00010
    004 Auscultadores Bluetooth   00049.90 stock 00030
    005 Carregador USB-C          00014.90 stock 00100
    006 Teclado Mecanico          00079.00 stock 00000
    007 Candeeiro de Mesa         00022.00 stock 00015
    008 Conjunto de Panelas       00089.90 stock 00008
    009 Manta de Sofa             00034.50 stock 00020
    010 Caneca de Ceramica        00006.50 stock 00200
    Produtos: 010
    Sem stock: 001

O PRO-STOCK é comparado com ZERO depois da leitura antecipada, dentro do ciclo. Só o produto 006 (Teclado Mecanico) não tem stock.

### Exercício 14

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL14.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-ENCOMENDAS ASSIGN TO "encomendas.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
               SELECT F-ABERTAS ASSIGN TO "abertas.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-ENCOMENDAS.
           01  REG-ENCOMENDA.
               05  ENC-ID              PIC 9(04).
               05  ENC-CLIENTE-ID      PIC 9(03).
               05  ENC-DATA            PIC 9(08).
               05  ENC-ESTADO          PIC X(10).
           FD  F-ABERTAS.
           01  REG-ABERTA              PIC X(25).
           WORKING-STORAGE SECTION.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           01  WS-PENDENTES            PIC 9(02) VALUE ZEROS.
           01  WS-ENVIADAS             PIC 9(02) VALUE ZEROS.
           01  WS-ENTREGUES            PIC 9(02) VALUE ZEROS.
           01  WS-CANCELADAS           PIC 9(02) VALUE ZEROS.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-ENCOMENDAS
               OPEN OUTPUT F-ABERTAS
               PERFORM LER-ENCOMENDA
               PERFORM UNTIL FIM-DO-FICHEIRO
                   EVALUATE ENC-ESTADO
                       WHEN "pendente"
                           ADD 1 TO WS-PENDENTES
                           WRITE REG-ABERTA FROM REG-ENCOMENDA
                       WHEN "enviada"
                           ADD 1 TO WS-ENVIADAS
                           WRITE REG-ABERTA FROM REG-ENCOMENDA
                       WHEN "entregue"
                           ADD 1 TO WS-ENTREGUES
                       WHEN "cancelada"
                           ADD 1 TO WS-CANCELADAS
                   END-EVALUATE
                   PERFORM LER-ENCOMENDA
               END-PERFORM
               CLOSE F-ENCOMENDAS F-ABERTAS
               DISPLAY "pendentes " WS-PENDENTES
               DISPLAY "enviadas " WS-ENVIADAS
               DISPLAY "entregues " WS-ENTREGUES
               DISPLAY "canceladas " WS-CANCELADAS
               STOP RUN.
           LER-ENCOMENDA.
               READ F-ENCOMENDAS
                   AT END SET FIM-DO-FICHEIRO TO TRUE
               END-READ.

Saída:

    pendentes 03
    enviadas 03
    entregues 05
    canceladas 01

O ficheiro abertas.dat ficou com as seis encomendas abertas (os espaços no fim do estado são cortados pelo LINE SEQUENTIAL):

    000600220250322enviada
    000700520250401enviada
    000800120250415pendente
    000900620250420pendente
    001100320250512enviada
    001200220250601pendente

O EVALUATE conta cada estado e só grava as encomendas que ainda não terminaram. Como o OPEN OUTPUT apaga o ficheiro, correr o programa duas vezes dá o mesmo resultado.

### Exercício 15

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL15.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-DADOS ASSIGN TO WS-NOME
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-ESTADO.
           DATA DIVISION.
           FILE SECTION.
           FD  F-DADOS.
           01  REG-DADOS               PIC X(80).
           WORKING-STORAGE SECTION.
           01  WS-NOME                 PIC X(30).
           01  WS-ESTADO               PIC XX.
           01  WS-N-REGISTOS           PIC 9(05) VALUE ZEROS.
           PROCEDURE DIVISION.
           PRINCIPAL.
               ACCEPT WS-NOME
               OPEN INPUT F-DADOS
               EVALUATE WS-ESTADO
                   WHEN "00"
                       PERFORM CONTAR-REGISTOS
                       CLOSE F-DADOS
                       DISPLAY FUNCTION TRIM(WS-NOME) ": "
                               WS-N-REGISTOS " registos"
                   WHEN "35"
                       DISPLAY FUNCTION TRIM(WS-NOME)
                               ": o ficheiro nao existe"
                   WHEN OTHER
                       DISPLAY FUNCTION TRIM(WS-NOME)
                               ": erro de abertura, estado " WS-ESTADO
               END-EVALUATE
               STOP RUN.
           CONTAR-REGISTOS.
               READ F-DADOS
               PERFORM UNTIL WS-ESTADO NOT = "00"
                   ADD 1 TO WS-N-REGISTOS
                   READ F-DADOS
               END-PERFORM.

Quatro execuções, com o nome do ficheiro enviado por pipe (echo nome | ./ex15):

    clientes.dat: 00008 registos
    linhas.dat: 00026 registos
    encomendas.txt: o ficheiro nao existe
    /nada/x.dat: o ficheiro nao existe

O estado 00 conta os registos; o 35 dá uma mensagem própria; qualquer outro estado mostra o código. O ciclo de contagem lê até o estado deixar de ser 00 (o fim do ficheiro é o estado 10), por isso não precisa de AT END.

### Exercício 16

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL16.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-LINHAS ASSIGN TO "linhas.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
               SELECT F-TOTAIS ASSIGN TO "totais-enc.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-LINHAS.
           01  REG-LINHA.
               05  LIN-ID              PIC 9(04).
               05  LIN-ENCOMENDA-ID    PIC 9(04).
               05  LIN-PRODUTO-ID      PIC 9(03).
               05  LIN-QUANTIDADE      PIC 9(03).
               05  LIN-PRECO-UNIT      PIC 9(05)V99.
           FD  F-TOTAIS.
           01  REG-TOTAL               PIC X(14).
           WORKING-STORAGE SECTION.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           01  WS-ENC-ATUAL            PIC 9(04) VALUE ZEROS.
           01  WS-TOTAL-ENC            PIC 9(08)V99 VALUE ZEROS.
           01  WS-SAIDA.
               05  SAI-ENCOMENDA       PIC 9(04).
               05  SAI-TOTAL           PIC 9(08)V99.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-LINHAS
               OPEN OUTPUT F-TOTAIS
               PERFORM LER-LINHA
               IF NOT FIM-DO-FICHEIRO
                   MOVE LIN-ENCOMENDA-ID TO WS-ENC-ATUAL
               END-IF
               PERFORM UNTIL FIM-DO-FICHEIRO
                   IF LIN-ENCOMENDA-ID NOT = WS-ENC-ATUAL
                       PERFORM GRAVAR-TOTAL
                       MOVE LIN-ENCOMENDA-ID TO WS-ENC-ATUAL
                   END-IF
                   COMPUTE WS-TOTAL-ENC = WS-TOTAL-ENC
                       + LIN-QUANTIDADE * LIN-PRECO-UNIT
                   PERFORM LER-LINHA
               END-PERFORM
               IF WS-ENC-ATUAL NOT = ZERO
                   PERFORM GRAVAR-TOTAL
               END-IF
               CLOSE F-LINHAS F-TOTAIS
               STOP RUN.
           LER-LINHA.
               READ F-LINHAS
                   AT END SET FIM-DO-FICHEIRO TO TRUE
               END-READ.
           GRAVAR-TOTAL.
               MOVE WS-ENC-ATUAL TO SAI-ENCOMENDA
               MOVE WS-TOTAL-ENC TO SAI-TOTAL
               WRITE REG-TOTAL FROM WS-SAIDA
               DISPLAY "encomenda " SAI-ENCOMENDA " total " SAI-TOTAL
               MOVE ZEROS TO WS-TOTAL-ENC.

Saída:

    encomenda 0001 total 00000040.70
    encomenda 0002 total 00000049.90
    encomenda 0003 total 00000044.50
    encomenda 0004 total 00000089.90
    encomenda 0005 total 00000108.80
    encomenda 0006 total 00000073.99
    encomenda 0007 total 00000047.50
    encomenda 0008 total 00000099.80
    encomenda 0009 total 00000022.00
    encomenda 0010 total 00000083.70
    encomenda 0011 total 00000158.90
    encomenda 0012 total 00000145.00
    encomenda 0002 total 00000014.90
    encomenda 0009 total 00000013.00
    encomenda 0006 total 00000012.90

O ficheiro totais-enc.dat tem uma linha por quebra, por exemplo 00010000004070 (encomenda 0001, total 40.70, sem ponto decimal). A soma dos 15 totais é 1005.49, igual ao total geral do módulo. As encomendas 2, 9 e 6 aparecem duas vezes porque as últimas três linhas de linhas.dat estão fora de ordem: a quebra de controlo só funciona com os registos ordenados pela chave (a ordenação fica para o módulo 06).

## Módulo 05 · Relatórios e texto

### Exercício 17

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL17.
           ENVIRONMENT DIVISION.
           CONFIGURATION SECTION.
           SPECIAL-NAMES.
               DECIMAL-POINT IS COMMA.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT ARQ-PRO ASSIGN TO "produtos.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  ARQ-PRO.
           01  REG-PRO.
               05  PRO-ID          PIC 9(03).
               05  PRO-NOME        PIC X(25).
               05  PRO-CATEGORIA   PIC 9(02).
               05  PRO-PRECO       PIC 9(05)V99.
               05  PRO-STOCK       PIC 9(05).
           WORKING-STORAGE SECTION.
           01  WS-FIM              PIC X VALUE "N".
               88  FIM-FICHEIRO    VALUE "S".
           01  WS-VALOR            PIC 9(07)V99.
           01  WS-TOTAL            PIC 9(08)V99 VALUE ZERO.
           01  LIN-PRODUTO.
               05  L-ID            PIC ZZ9.
               05  FILLER          PIC XX VALUE SPACES.
               05  L-NOME          PIC X(25).
               05  L-PRECO         PIC ZZ.ZZ9,99.
               05  L-STOCK         PIC ZZ.ZZ9 BLANK WHEN ZERO.
               05  L-VALOR         PIC Z.ZZZ.ZZ9,99 BLANK WHEN ZERO.
           01  L-TOTAL             PIC ZZ.ZZZ.ZZ9,99.
           PROCEDURE DIVISION.
           PRINCIPAL.
               DISPLAY "Id  Produto                    Preco  Stock"
                   "        Valor"
               OPEN INPUT ARQ-PRO
               PERFORM UNTIL FIM-FICHEIRO
                   READ ARQ-PRO
                       AT END SET FIM-FICHEIRO TO TRUE
                       NOT AT END PERFORM MOSTRAR
                   END-READ
               END-PERFORM
               CLOSE ARQ-PRO
               MOVE WS-TOTAL TO L-TOTAL
               DISPLAY "Total do stock: " L-TOTAL
               STOP RUN.
           MOSTRAR.
               COMPUTE WS-VALOR = PRO-PRECO * PRO-STOCK
               ADD WS-VALOR TO WS-TOTAL
               MOVE PRO-ID TO L-ID
               MOVE PRO-NOME TO L-NOME
               MOVE PRO-PRECO TO L-PRECO
               MOVE PRO-STOCK TO L-STOCK
               MOVE WS-VALOR TO L-VALOR
               DISPLAY LIN-PRODUTO.

Saída:

    Id  Produto                    Preco  Stock        Valor
      1  Romance Policial             12,90    40      516,00
      2  Livro de Receitas            18,50    25      462,50
      3  Atlas Mundial                29,99    10      299,90
      4  Auscultadores Bluetooth      49,90    30    1.497,00
      5  Carregador USB-C             14,90   100    1.490,00
      6  Teclado Mecanico             79,00
      7  Candeeiro de Mesa            22,00    15      330,00
      8  Conjunto de Panelas          89,90     8      719,20
      9  Manta de Sofa                34,50    20      690,00
     10  Caneca de Ceramica            6,50   200    1.300,00
    Total do stock:      7.304,60

O PICTURE ZZ.ZZ9,99 só funciona com a vírgula decimal porque o programa declara DECIMAL-POINT IS COMMA. O produto 6 não tem stock: BLANK WHEN ZERO deixa as colunas de stock e de valor em branco em vez de 0,00. O total (7.304,60) bate com a soma dos valores.

### Exercício 18

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL18.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT ARQ-CLI ASSIGN TO "clientes.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  ARQ-CLI.
           01  REG-CLI.
               05  CLI-ID          PIC 9(03).
               05  CLI-NOME        PIC X(20).
               05  CLI-EMAIL       PIC X(30).
               05  CLI-CIDADE      PIC X(10).
               05  CLI-DATA        PIC 9(08).
           WORKING-STORAGE SECTION.
           01  WS-FIM              PIC X VALUE "N".
               88  FIM-FICHEIRO    VALUE "S".
           01  WS-LINHA            PIC X(60).
           01  WS-NOME-MAIUS       PIC X(20).
           01  WS-UTILIZADOR       PIC X(30).
           01  WS-DOMINIO          PIC X(30).
           01  WS-SEM-EMAIL        PIC 99 VALUE ZERO.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT ARQ-CLI
               PERFORM UNTIL FIM-FICHEIRO
                   READ ARQ-CLI
                       AT END SET FIM-FICHEIRO TO TRUE
                       NOT AT END PERFORM MOSTRAR
                   END-READ
               END-PERFORM
               CLOSE ARQ-CLI
               DISPLAY "Clientes sem email: " WS-SEM-EMAIL
               STOP RUN.
           MOSTRAR.
               MOVE CLI-NOME TO WS-NOME-MAIUS
               INSPECT WS-NOME-MAIUS CONVERTING
                   "abcdefghijklmnopqrstuvwxyz" TO
                   "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
               MOVE SPACES TO WS-DOMINIO WS-UTILIZADOR WS-LINHA
               IF CLI-EMAIL = SPACES
                   MOVE "(sem email)" TO WS-DOMINIO
                   ADD 1 TO WS-SEM-EMAIL
               ELSE
                   UNSTRING CLI-EMAIL DELIMITED BY "@"
                       INTO WS-UTILIZADOR WS-DOMINIO
                   END-UNSTRING
               END-IF
               STRING CLI-ID DELIMITED BY SIZE
                   " " DELIMITED BY SIZE
                   WS-NOME-MAIUS DELIMITED BY "  "
                   " (" DELIMITED BY SIZE
                   CLI-CIDADE DELIMITED BY SPACE
                   ") - " DELIMITED BY SIZE
                   WS-DOMINIO DELIMITED BY "  "
                   INTO WS-LINHA
               END-STRING
               DISPLAY WS-LINHA.

Saída:

    001 ANA RIBEIRO (Lisboa) - exemplo.pt
    002 BRUNO COSTA (Porto) - exemplo.pt
    003 CARLA MENDES (Braga) - exemplo.pt
    004 DIOGO PIRES (Lisboa) - exemplo.pt
    005 EVA MARTINS (Coimbra) - exemplo.pt
    006 FILIPE LOPES (Porto) - exemplo.pt
    007 GRACA NUNES (Faro) - exemplo.pt
    008 HUGO TEIXEIRA (Lisboa) - (sem email)
    Clientes sem email: 01

O STRING com DELIMITED BY de dois espaços corta o nome no primeiro par de espaços, preservando «Ana Ribeiro»; o mesmo critério no domínio evita que «(sem email)» seja cortado no espaço do meio, como acontece com DELIMITED BY SPACE. O UNSTRING parte o email no arroba. O INSPECT CONVERTING passa o nome a maiúsculas (só letras sem acento).

### Exercício 19

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL19.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT ARQ-ENC ASSIGN TO "encomendas.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  ARQ-ENC.
           01  REG-ENC.
               05  ENC-ID          PIC 9(04).
               05  ENC-CLIENTE     PIC 9(03).
               05  ENC-DATA        PIC 9(08).
               05  ENC-ESTADO      PIC X(10).
                   88  ENC-ABERTA  VALUES "pendente" "enviada".
           WORKING-STORAGE SECTION.
           01  WS-FIM              PIC X VALUE "N".
               88  FIM-FICHEIRO    VALUE "S".
           01  WS-REFERENCIA       PIC 9(08) VALUE 20250630.
           01  WS-DIAS             PIC S9(05).
           01  WS-ABERTAS          PIC 99 VALUE ZERO.
           01  WS-ATRASADAS        PIC 99 VALUE ZERO.
           01  WS-DATA-TXT         PIC 9999/99/99.
           01  WS-DIAS-ED          PIC ZZ9.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT ARQ-ENC
               PERFORM UNTIL FIM-FICHEIRO
                   READ ARQ-ENC
                       AT END SET FIM-FICHEIRO TO TRUE
                       NOT AT END
                           IF ENC-ABERTA PERFORM MOSTRAR END-IF
                   END-READ
               END-PERFORM
               CLOSE ARQ-ENC
               DISPLAY "Abertas: " WS-ABERTAS " Atrasadas: " WS-ATRASADAS
               STOP RUN.
           MOSTRAR.
               ADD 1 TO WS-ABERTAS
               COMPUTE WS-DIAS = FUNCTION INTEGER-OF-DATE(WS-REFERENCIA)
                   - FUNCTION INTEGER-OF-DATE(ENC-DATA)
               MOVE ENC-DATA TO WS-DATA-TXT
               MOVE WS-DIAS TO WS-DIAS-ED
               DISPLAY ENC-ID " " WS-DATA-TXT " " ENC-ESTADO
                   WS-DIAS-ED " dias" WITH NO ADVANCING
               IF WS-DIAS > 30
                   ADD 1 TO WS-ATRASADAS
                   DISPLAY "  ATRASADA"
               ELSE
                   DISPLAY SPACE
               END-IF.

Saída:

    0006 2025/03/22 enviada   100 dias  ATRASADA
    0007 2025/04/01 enviada    90 dias  ATRASADA
    0008 2025/04/15 pendente   76 dias  ATRASADA
    0009 2025/04/20 pendente   71 dias  ATRASADA
    0011 2025/05/12 enviada    49 dias  ATRASADA
    0012 2025/06/01 pendente   29 dias
    Abertas: 06 Atrasadas: 05

O nível 88 com VALUES agrupa os dois estados abertos. A diferença entre os números inteiros das duas datas dá os dias. A encomenda 12 tem 29 dias, por isso não é marcada como atrasada. O DISPLAY com WITH NO ADVANCING deixa o cursor na mesma linha.

### Exercício 20

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL20.
           ENVIRONMENT DIVISION.
           CONFIGURATION SECTION.
           SPECIAL-NAMES.
               DECIMAL-POINT IS COMMA.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT ARQ-CAT ASSIGN TO "categorias.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
               SELECT ARQ-PRO ASSIGN TO "produtos.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
               SELECT ARQ-REL ASSIGN TO "stock.txt"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  ARQ-CAT.
           01  REG-CAT.
               05  CAT-ID          PIC 9(02).
               05  CAT-NOME        PIC X(15).
           FD  ARQ-PRO.
           01  REG-PRO.
               05  PRO-ID          PIC 9(03).
               05  PRO-NOME        PIC X(25).
               05  PRO-CATEGORIA   PIC 9(02).
               05  PRO-PRECO       PIC 9(05)V99.
               05  PRO-STOCK       PIC 9(05).
           FD  ARQ-REL.
           01  REG-REL             PIC X(60).
           WORKING-STORAGE SECTION.
           01  WS-FIM              PIC X VALUE "N".
               88  FIM-FICHEIRO    VALUE "S".
           01  TAB-CATEGORIAS.
               05  NOME-CAT        PIC X(15) OCCURS 3 TIMES.
           01  WS-CAT-ANT          PIC 99 VALUE ZERO.
           01  WS-VALOR            PIC 9(07)V99.
           01  WS-SUB              PIC 9(08)V99 VALUE ZERO.
           01  WS-TOTAL            PIC 9(08)V99 VALUE ZERO.
           01  WS-LIN              PIC 99 VALUE 99.
           01  WS-PAG              PIC 99 VALUE ZERO.
           01  CAB.
               05  FILLER          PIC X(40) VALUE "STOCK POR CATEGORIA".
               05  FILLER          PIC X(07) VALUE "Pagina ".
               05  CAB-PAG         PIC Z9.
           01  LIN-DET.
               05  D-NOME          PIC X(25).
               05  D-PRECO         PIC ZZ.ZZ9,99.
               05  D-STOCK         PIC ZZ.ZZ9 BLANK WHEN ZERO.
               05  D-VALOR         PIC Z.ZZZ.ZZ9,99 BLANK WHEN ZERO.
           01  LIN-SUB.
               05  FILLER          PIC X(06) VALUE "Total ".
               05  S-NOME          PIC X(15).
               05  FILLER          PIC X(24) VALUE ALL ".".
               05  S-VALOR         PIC ZZ.ZZZ.ZZ9,99.
           01  LIN-GER.
               05  FILLER          PIC X(45) VALUE "TOTAL GERAL".
               05  G-VALOR         PIC ZZ.ZZZ.ZZ9,99.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT ARQ-CAT
               PERFORM UNTIL FIM-FICHEIRO
                   READ ARQ-CAT
                       AT END SET FIM-FICHEIRO TO TRUE
                       NOT AT END MOVE CAT-NOME TO NOME-CAT(CAT-ID)
                   END-READ
               END-PERFORM
               CLOSE ARQ-CAT
               MOVE "N" TO WS-FIM
               OPEN INPUT ARQ-PRO OUTPUT ARQ-REL
               PERFORM UNTIL FIM-FICHEIRO
                   READ ARQ-PRO
                       AT END SET FIM-FICHEIRO TO TRUE
                       NOT AT END PERFORM TRATAR
                   END-READ
               END-PERFORM
               IF WS-CAT-ANT NOT = ZERO
                   PERFORM SUBTOTAL
               END-IF
               MOVE WS-TOTAL TO G-VALOR
               WRITE REG-REL FROM LIN-GER AFTER ADVANCING 2 LINES
               CLOSE ARQ-PRO ARQ-REL
               STOP RUN.
           TRATAR.
               IF WS-CAT-ANT NOT = ZERO AND PRO-CATEGORIA NOT = WS-CAT-ANT
                   PERFORM SUBTOTAL
               END-IF
               MOVE PRO-CATEGORIA TO WS-CAT-ANT
               IF WS-LIN >= 8
                   PERFORM CABECALHO
               END-IF
               COMPUTE WS-VALOR = PRO-PRECO * PRO-STOCK
               ADD WS-VALOR TO WS-SUB
               MOVE PRO-NOME TO D-NOME
               MOVE PRO-PRECO TO D-PRECO
               MOVE PRO-STOCK TO D-STOCK
               MOVE WS-VALOR TO D-VALOR
               WRITE REG-REL FROM LIN-DET AFTER ADVANCING 1 LINE
               ADD 1 TO WS-LIN.
           SUBTOTAL.
               MOVE NOME-CAT(WS-CAT-ANT) TO S-NOME
               MOVE WS-SUB TO S-VALOR
               WRITE REG-REL FROM LIN-SUB AFTER ADVANCING 1 LINE
               ADD 1 TO WS-LIN
               ADD WS-SUB TO WS-TOTAL
               MOVE ZERO TO WS-SUB.
           CABECALHO.
               ADD 1 TO WS-PAG
               MOVE WS-PAG TO CAB-PAG
               IF WS-PAG = 1
                   WRITE REG-REL FROM CAB AFTER ADVANCING 1 LINE
               ELSE
                   WRITE REG-REL FROM CAB AFTER ADVANCING PAGE
               END-IF
               MOVE 1 TO WS-LIN.

Saída (ficheiro stock.txt, com cat -v):


    STOCK POR CATEGORIA                     Pagina  1
    Romance Policial             12,90    40      516,00
    Livro de Receitas            18,50    25      462,50
    Atlas Mundial                29,99    10      299,90
    Total Livros         ........................     1.278,40
    Auscultadores Bluetooth      49,90    30    1.497,00
    Carregador USB-C             14,90   100    1.490,00
    Teclado Mecanico             79,00
    Total Eletronica     ........................     2.987,00^LSTOCK POR CATEGORIA                     Pagina  2
    Candeeiro de Mesa            22,00    15      330,00
    Conjunto de Panelas          89,90     8      719,20
    Manta de Sofa                34,50    20      690,00
    Caneca de Ceramica            6,50   200    1.300,00
    Total Casa           ........................     3.039,20

    TOTAL GERAL                                       7.304,60

É a mesma quebra de controlo do relatório da aula: o produtos.dat já vem ordenado por categoria (confirmado ao ler o ficheiro); com outra ordem terias de ordenar primeiro. O subtotal é escrito quando a categoria muda e outra vez no fim. O carácter de mudança de página (^L) aparece colado ao fim da linha anterior.

## Módulo 06 · Ficheiros indexados e ordenação

### Exercício 21

           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX21.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-ENTRADA ASSIGN TO "encomendas.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
               SELECT F-ENCOMENDAS ASSIGN TO "encomendas.idx"
                   ORGANIZATION IS INDEXED
                   ACCESS MODE IS DYNAMIC
                   RECORD KEY IS ENC-ID
                   ALTERNATE RECORD KEY IS ENC-CLIENTE-ID
                       WITH DUPLICATES
                   FILE STATUS IS WS-ESTADO.
           DATA DIVISION.
           FILE SECTION.
           FD  F-ENTRADA.
           01  REG-ENTRADA             PIC X(25).
           FD  F-ENCOMENDAS.
           01  REG-ENCOMENDA.
               05  ENC-ID              PIC 9(04).
               05  ENC-CLIENTE-ID      PIC 9(03).
               05  ENC-DATA            PIC 9(08).
               05  ENC-ESTADO          PIC X(10).
           WORKING-STORAGE SECTION.
           01  WS-ESTADO               PIC XX.
           01  WS-N                    PIC 99    VALUE 0.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           PROCEDURE DIVISION.
           0000-PRINCIPAL.
               PERFORM 1000-CARREGAR
               PERFORM 2000-CONSULTAR
               STOP RUN.
           1000-CARREGAR.
               OPEN INPUT F-ENTRADA
               OPEN OUTPUT F-ENCOMENDAS
               PERFORM UNTIL FIM-DO-FICHEIRO
                   READ F-ENTRADA
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                       NOT AT END
                           WRITE REG-ENCOMENDA FROM REG-ENTRADA
                               INVALID KEY
                                   DISPLAY "falhou: " WS-ESTADO
                               NOT INVALID KEY ADD 1 TO WS-N
                           END-WRITE
                   END-READ
               END-PERFORM
               CLOSE F-ENTRADA F-ENCOMENDAS
               DISPLAY "Gravadas: " WS-N.
           2000-CONSULTAR.
               OPEN INPUT F-ENCOMENDAS
               MOVE 8 TO ENC-ID
               PERFORM 2100-LER
               MOVE 50 TO ENC-ID
               PERFORM 2100-LER
               CLOSE F-ENCOMENDAS.
           2100-LER.
               READ F-ENCOMENDAS
                   INVALID KEY
                       DISPLAY "encomenda " ENC-ID " nao existe, estado "
                               WS-ESTADO
                   NOT INVALID KEY
                       DISPLAY "encomenda " ENC-ID " cliente "
                               ENC-CLIENTE-ID " " ENC-ESTADO
               END-READ.

Saída:

    Gravadas: 12
    encomenda 0008 cliente 001 pendente
    encomenda 0050 nao existe, estado 23

A chave alternativa ENC-CLIENTE-ID tem WITH DUPLICATES porque um cliente pode ter várias encomendas. O READ do 50 dá INVALID KEY com estado 23 (registo não existe). Em modo DYNAMIC a carga não exige ordem de chave.

### Exercício 22

           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX22.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-CLIENTES ASSIGN TO "clientes.idx"
                   ORGANIZATION IS INDEXED
                   ACCESS MODE IS RANDOM
                   RECORD KEY IS CLI-ID
                   ALTERNATE RECORD KEY IS CLI-CIDADE WITH DUPLICATES
                   FILE STATUS IS WS-ESTADO-C.
               SELECT F-ENCOMENDAS ASSIGN TO "encomendas.idx"
                   ORGANIZATION IS INDEXED
                   ACCESS MODE IS DYNAMIC
                   RECORD KEY IS ENC-ID
                   ALTERNATE RECORD KEY IS ENC-CLIENTE-ID
                       WITH DUPLICATES
                   FILE STATUS IS WS-ESTADO-E.
           DATA DIVISION.
           FILE SECTION.
           FD  F-CLIENTES.
           01  REG-CLIENTE.
               05  CLI-ID              PIC 9(03).
               05  CLI-NOME            PIC X(20).
               05  CLI-EMAIL           PIC X(30).
               05  CLI-CIDADE          PIC X(10).
               05  CLI-DATA-REGISTO    PIC 9(08).
           FD  F-ENCOMENDAS.
           01  REG-ENCOMENDA.
               05  ENC-ID              PIC 9(04).
               05  ENC-CLIENTE-ID      PIC 9(03).
               05  ENC-DATA            PIC 9(08).
               05  ENC-ESTADO          PIC X(10).
           WORKING-STORAGE SECTION.
           01  WS-ESTADO-C             PIC XX.
           01  WS-ESTADO-E             PIC XX.
           01  WS-PEDIDO               PIC 9(03).
           01  WS-FIM                  PIC X.
               88  FIM-DA-LISTA                  VALUE "S".
           PROCEDURE DIVISION.
           0000-PRINCIPAL.
               OPEN INPUT F-CLIENTES F-ENCOMENDAS
               MOVE 1 TO WS-PEDIDO
               PERFORM 1000-FICHA
               MOVE 2 TO WS-PEDIDO
               PERFORM 1000-FICHA
               MOVE 9 TO WS-PEDIDO
               PERFORM 1000-FICHA
               CLOSE F-CLIENTES F-ENCOMENDAS
               STOP RUN.
           1000-FICHA.
               MOVE WS-PEDIDO TO CLI-ID
               READ F-CLIENTES
                   INVALID KEY
                       DISPLAY "cliente " WS-PEDIDO " nao existe"
                   NOT INVALID KEY
                       DISPLAY "cliente " CLI-ID " " CLI-NOME
                       PERFORM 2000-ENCOMENDAS
               END-READ.
           2000-ENCOMENDAS.
               MOVE "N" TO WS-FIM
               MOVE CLI-ID TO ENC-CLIENTE-ID
               START F-ENCOMENDAS KEY IS = ENC-CLIENTE-ID
                   INVALID KEY
                       DISPLAY "   sem encomendas"
                       SET FIM-DA-LISTA TO TRUE
               END-START
               PERFORM UNTIL FIM-DA-LISTA
                   READ F-ENCOMENDAS NEXT
                       AT END SET FIM-DA-LISTA TO TRUE
                       NOT AT END
                           IF ENC-CLIENTE-ID = CLI-ID
                               DISPLAY "   encomenda " ENC-ID " "
                                       ENC-ESTADO
                           ELSE
                               SET FIM-DA-LISTA TO TRUE
                           END-IF
                   END-READ
               END-PERFORM.

Saída:

    cliente 001 Ana Ribeiro
       encomenda 0001 entregue
       encomenda 0003 entregue
       encomenda 0008 pendente
    cliente 002 Bruno Costa
       encomenda 0002 entregue
       encomenda 0006 enviada
       encomenda 0012 pendente
    cliente 009 nao existe

Para cada cliente: READ pela chave primária; se existe, START na chave alternativa de encomendas e READ NEXT enquanto ENC-CLIENTE-ID for igual (o ciclo continuaria para outros clientes, por isso o IF pára-o). O cliente 9 não existe e nem chega às encomendas. Pressupõe clientes.idx carregado como na aula e encomendas.idx do exercício 21.

### Exercício 23

           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX23.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-CLIENTES ASSIGN TO "clientes.idx"
                   ORGANIZATION IS INDEXED
                   ACCESS MODE IS DYNAMIC
                   RECORD KEY IS CLI-ID
                   ALTERNATE RECORD KEY IS CLI-CIDADE WITH DUPLICATES
                   FILE STATUS IS WS-ESTADO.
           DATA DIVISION.
           FILE SECTION.
           FD  F-CLIENTES.
           01  REG-CLIENTE.
               05  CLI-ID              PIC 9(03).
               05  CLI-NOME            PIC X(20).
               05  CLI-EMAIL           PIC X(30).
               05  CLI-CIDADE          PIC X(10).
               05  CLI-DATA-REGISTO    PIC 9(08).
           WORKING-STORAGE SECTION.
           01  WS-ESTADO               PIC XX.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DA-LISTA                  VALUE "S".
           PROCEDURE DIVISION.
           0000-PRINCIPAL.
               OPEN I-O F-CLIENTES
               PERFORM 1000-ACRESCENTAR
               PERFORM 1000-ACRESCENTAR
               PERFORM 2000-MUDAR-CIDADE
               PERFORM 3000-APAGAR
               PERFORM 4000-LISTAR
               CLOSE F-CLIENTES
               STOP RUN.
           1000-ACRESCENTAR.
               MOVE 9 TO CLI-ID
               MOVE "Ines Faria" TO CLI-NOME
               MOVE "ines.faria@exemplo.pt" TO CLI-EMAIL
               MOVE "Faro" TO CLI-CIDADE
               MOVE 20241201 TO CLI-DATA-REGISTO
               WRITE REG-CLIENTE
                   INVALID KEY DISPLAY "WRITE 9: estado " WS-ESTADO
                   NOT INVALID KEY DISPLAY "WRITE 9 ok"
               END-WRITE.
           2000-MUDAR-CIDADE.
               MOVE 3 TO CLI-ID
               READ F-CLIENTES
               MOVE "Faro" TO CLI-CIDADE
               REWRITE REG-CLIENTE
               DISPLAY "REWRITE 3: estado " WS-ESTADO.
           3000-APAGAR.
               MOVE 5 TO CLI-ID
               DELETE F-CLIENTES
               DISPLAY "DELETE 5: estado " WS-ESTADO.
           4000-LISTAR.
               MOVE LOW-VALUES TO CLI-CIDADE
               START F-CLIENTES KEY IS >= CLI-CIDADE
               PERFORM UNTIL FIM-DA-LISTA
                   READ F-CLIENTES NEXT
                       AT END SET FIM-DA-LISTA TO TRUE
                       NOT AT END
                           DISPLAY CLI-CIDADE " " CLI-ID " " CLI-NOME
                   END-READ
               END-PERFORM.

Saída:

    WRITE 9 ok
    WRITE 9: estado 22
    REWRITE 3: estado 00
    DELETE 5: estado 00
    Faro       007 Graca Nunes
    Faro       009 Ines Faria
    Faro       003 Carla Mendes
    Lisboa     001 Ana Ribeiro
    Lisboa     004 Diogo Pires
    Lisboa     008 Hugo Teixeira
    Porto      002 Bruno Costa
    Porto      006 Filipe Lopes

Mudar a cidade com REWRITE actualiza também a chave alternativa: o cliente 3 aparece agora em Faro. O 5 desapareceu, e o segundo WRITE do 9 deu estado 22. Dentro de Faro a ordem é 007, 009, 003: nos meus testes os duplicados saem pela ordem em que entraram na chave, não pela chave primária.

### Exercício 24

           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX24.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-LINHAS ASSIGN TO "linhas.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
               SELECT F-TRABALHO ASSIGN TO "trabalho.tmp".
           DATA DIVISION.
           FILE SECTION.
           FD  F-LINHAS.
           01  REG-LINHA               PIC X(21).
           SD  F-TRABALHO.
           01  REG-TRABALHO.
               05  TRB-ID              PIC 9(04).
               05  TRB-ENCOMENDA-ID    PIC 9(04).
               05  TRB-PRODUTO-ID      PIC 9(03).
               05  TRB-QUANTIDADE      PIC 9(03).
               05  TRB-PRECO-UNITARIO  PIC 9(05)V99.
           WORKING-STORAGE SECTION.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           01  WS-PRODUTO-ATUAL        PIC 9(03).
           01  WS-UNIDADES             PIC 9(05).
           01  WS-VALOR                PIC 9(07)V99.
           01  WS-VALOR-ED             PIC Z,ZZZ,ZZ9.99.
           PROCEDURE DIVISION.
           0000-PRINCIPAL.
               SORT F-TRABALHO
                   ON ASCENDING KEY TRB-PRODUTO-ID
                   USING F-LINHAS
                   OUTPUT PROCEDURE IS 1000-TOTAIS
               STOP RUN.
           1000-TOTAIS SECTION.
           1000-INICIO.
               RETURN F-TRABALHO
                   AT END SET FIM-DO-FICHEIRO TO TRUE
               END-RETURN
               PERFORM UNTIL FIM-DO-FICHEIRO
                   MOVE TRB-PRODUTO-ID TO WS-PRODUTO-ATUAL
                   MOVE 0 TO WS-UNIDADES WS-VALOR
                   PERFORM UNTIL FIM-DO-FICHEIRO
                           OR TRB-PRODUTO-ID NOT = WS-PRODUTO-ATUAL
                       ADD TRB-QUANTIDADE TO WS-UNIDADES
                       COMPUTE WS-VALOR = WS-VALOR
                           + TRB-QUANTIDADE * TRB-PRECO-UNITARIO
                       RETURN F-TRABALHO
                           AT END SET FIM-DO-FICHEIRO TO TRUE
                       END-RETURN
                   END-PERFORM
                   MOVE WS-VALOR TO WS-VALOR-ED
                   DISPLAY "produto " WS-PRODUTO-ATUAL " unidades "
                           WS-UNIDADES " valor " WS-VALOR-ED
               END-PERFORM.

Saída:

    produto 001 unidades 00007 valor        90.30
    produto 002 unidades 00003 valor        55.50
    produto 003 unidades 00001 valor        29.99
    produto 004 unidades 00004 valor       199.60
    produto 005 unidades 00007 valor       104.30
    produto 006 unidades 00001 valor        79.00
    produto 007 unidades 00003 valor        66.00
    produto 008 unidades 00002 valor       179.80
    produto 009 unidades 00003 valor       103.50
    produto 010 unidades 00015 valor        97.50

O SORT lê linhas.dat com USING e ordena por produto; o OUTPUT PROCEDURE faz a quebra de controlo: lê o primeiro registo e, para cada produto, acumula quantidade e valor até o produto mudar. Os totais foram conferidos fora do COBOL, somando as 26 linhas.

## Módulo 07 · Subprogramas e modularização

### Exercício 25

Ficheiro precofim.cob:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. PRECOFIM.
           DATA DIVISION.
           LINKAGE SECTION.
           01  LK-PRECO               PIC 9(05)V99.
           01  LK-PERC                PIC 9(02).
           01  LK-FINAL               PIC 9(05)V99.
           PROCEDURE DIVISION USING LK-PRECO LK-PERC LK-FINAL.
               IF LK-PERC > 50
                   MOVE 50 TO LK-PERC
               END-IF
               COMPUTE LK-FINAL ROUNDED = LK-PRECO * (100 - LK-PERC) / 100
               GOBACK.

Ficheiro sol25.cob:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL25.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-PRODUTOS ASSIGN TO "dados/produtos.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-PRODUTOS.
               COPY "produto.cpy".
           WORKING-STORAGE SECTION.
           01  WS-FIM                 PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO              VALUE "S".
           01  WS-PERC                PIC 9(02) VALUE 15.
           01  WS-FINAL               PIC 9(05)V99.
           01  WS-CEM                 PIC 9(05)V99 VALUE 100.
           01  WS-ED-PRE              PIC Z(4)9.99.
           01  WS-ED-FIN              PIC Z(4)9.99.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-PRODUTOS
               READ F-PRODUTOS AT END SET FIM-DO-FICHEIRO TO TRUE END-READ
               PERFORM UNTIL FIM-DO-FICHEIRO
                   CALL "PRECOFIM" USING PRO-PRECO
                                         BY CONTENT WS-PERC
                                         BY REFERENCE WS-FINAL
                   MOVE PRO-PRECO TO WS-ED-PRE
                   MOVE WS-FINAL TO WS-ED-FIN
                   DISPLAY PRO-ID " " PRO-NOME WS-ED-PRE " " WS-ED-FIN
                   READ F-PRODUTOS
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                   END-READ
               END-PERFORM
               CLOSE F-PRODUTOS
               MOVE 70 TO WS-PERC
               CALL "PRECOFIM" USING WS-CEM
                                     BY CONTENT WS-PERC
                                     BY REFERENCE WS-FINAL
               DISPLAY "BY CONTENT:   perc=" WS-PERC " final=" WS-FINAL
               CALL "PRECOFIM" USING WS-CEM
                                     BY REFERENCE WS-PERC WS-FINAL
               DISPLAY "BY REFERENCE: perc=" WS-PERC " final=" WS-FINAL
               STOP RUN.

    cobc -x -I copybooks -o s25 sol25.cob precofim.cob
    ./s25
    001 Romance Policial            12.90    10.97
    002 Livro de Receitas           18.50    15.73
    003 Atlas Mundial               29.99    25.49
    004 Auscultadores Bluetooth     49.90    42.42
    005 Carregador USB-C            14.90    12.67
    006 Teclado Mecanico            79.00    67.15
    007 Candeeiro de Mesa           22.00    18.70
    008 Conjunto de Panelas         89.90    76.42
    009 Manta de Sofa               34.50    29.33
    010 Caneca de Ceramica           6.50     5.53
    BY CONTENT:   perc=70 final=00050.00
    BY REFERENCE: perc=50 final=00050.00

O PRECOFIM corta a percentagem em 50 e devolve o preço final. Com BY CONTENT o principal continua a ver 70 (o subprograma alterou uma cópia); com BY REFERENCE vê 50. Atenção: o BY CONTENT vale para todos os argumentos seguintes até aparecer outro modo, por isso o WS-FINAL tem de levar BY REFERENCE explícito, senão o resultado perde-se (nas minhas execuções ficou a 0.00). Também usei um campo WS-CEM em vez do literal 100.00: com o literal o resultado saiu errado.

### Exercício 26

Ficheiro valemail.cob:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. VALEMAIL.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-ARROBAS             PIC 9(02).
           01  WS-PONTOS              PIC 9(02).
           LINKAGE SECTION.
           01  LK-EMAIL               PIC X(30).
           PROCEDURE DIVISION USING LK-EMAIL.
           PRINCIPAL.
               MOVE 0 TO WS-ARROBAS WS-PONTOS
               IF LK-EMAIL = SPACES
                   MOVE 4 TO RETURN-CODE
               ELSE
                   INSPECT LK-EMAIL TALLYING WS-ARROBAS FOR ALL "@"
                   INSPECT LK-EMAIL TALLYING WS-PONTOS FOR ALL "."
                   IF WS-ARROBAS = 1 AND WS-PONTOS > 0
                       MOVE 0 TO RETURN-CODE
                   ELSE
                       MOVE 8 TO RETURN-CODE
                   END-IF
               END-IF
               GOBACK.

Ficheiro sol26.cob:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL26.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-CLIENTES ASSIGN TO "dados/clientes.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-CLIENTES.
               COPY "cliente.cpy".
           WORKING-STORAGE SECTION.
           01  WS-FIM                 PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO              VALUE "S".
           01  WS-TESTE               PIC X(30).
           01  WS-N-MAU               PIC 9(02) VALUE 0.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-CLIENTES
               READ F-CLIENTES AT END SET FIM-DO-FICHEIRO TO TRUE END-READ
               PERFORM UNTIL FIM-DO-FICHEIRO
                   CALL "VALEMAIL" USING CLI-EMAIL
                   IF RETURN-CODE NOT = 0
                       DISPLAY CLI-ID " " CLI-NOME " rc=" RETURN-CODE
                       ADD 1 TO WS-N-MAU
                   END-IF
                   READ F-CLIENTES
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                   END-READ
               END-PERFORM
               CLOSE F-CLIENTES
               DISPLAY "clientes com email em falta ou invalido: " WS-N-MAU
               MOVE "semarroba.exemplo.pt" TO WS-TESTE
               CALL "VALEMAIL" USING WS-TESTE
               DISPLAY WS-TESTE " rc=" RETURN-CODE
               MOVE "a@b@exemplo.pt" TO WS-TESTE
               CALL "VALEMAIL" USING WS-TESTE
               DISPLAY WS-TESTE " rc=" RETURN-CODE
               STOP RUN.

    cobc -x -I copybooks -o s26 sol26.cob valemail.cob
    ./s26
    008 Hugo Teixeira        rc=+000000004
    clientes com email em falta ou invalido: 01
    semarroba.exemplo.pt           rc=+000000008
    a@b@exemplo.pt                 rc=+000000008

O RETURN-CODE é a única informação que volta: 4 para email em branco, 8 para formato inválido. Só o cliente 8 falha na loja. O RETURN-CODE tem de ser lido logo a seguir ao CALL, antes de outro CALL o alterar.

### Exercício 27

Ficheiro estats.cob:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. ESTATS.
           DATA DIVISION.
           WORKING-STORAGE SECTION.
           01  WS-N                   PIC 9(04) VALUE 0.
           01  WS-SOMA                PIC 9(09)V99 VALUE 0.
           01  WS-MAX                 PIC 9(07)V99 VALUE 0.
           LINKAGE SECTION.
           01  LK-FUNCAO              PIC X.
           01  LK-VALOR               PIC 9(07)V99.
           01  LK-RESUMO.
               05  LK-R-N             PIC 9(04).
               05  LK-R-SOMA          PIC 9(09)V99.
               05  LK-R-MAX           PIC 9(07)V99.
           PROCEDURE DIVISION USING LK-FUNCAO LK-VALOR LK-RESUMO.
           PRINCIPAL.
               MOVE 0 TO RETURN-CODE
               EVALUATE LK-FUNCAO
                   WHEN "A"
                       ADD 1 TO WS-N
                       ADD LK-VALOR TO WS-SOMA
                       IF LK-VALOR > WS-MAX
                           MOVE LK-VALOR TO WS-MAX
                       END-IF
                   WHEN "R"
                       MOVE WS-N TO LK-R-N
                       MOVE WS-SOMA TO LK-R-SOMA
                       MOVE WS-MAX TO LK-R-MAX
                   WHEN OTHER
                       MOVE 8 TO RETURN-CODE
               END-EVALUATE
               GOBACK.

Ficheiro sol27.cob:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL27.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-LINHAS ASSIGN TO "dados/linhas.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-LINHAS.
               COPY "linha.cpy".
           WORKING-STORAGE SECTION.
           01  WS-FIM                 PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO              VALUE "S".
           01  WS-FUNCAO              PIC X.
           01  WS-VALOR               PIC 9(07)V99.
           01  WS-RESUMO.
               05  WS-R-N             PIC 9(04).
               05  WS-R-SOMA          PIC 9(09)V99.
               05  WS-R-MAX           PIC 9(07)V99.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-LINHAS
               READ F-LINHAS AT END SET FIM-DO-FICHEIRO TO TRUE END-READ
               PERFORM UNTIL FIM-DO-FICHEIRO
                   MOVE "A" TO WS-FUNCAO
                   COMPUTE WS-VALOR = LIN-QUANTIDADE * LIN-PRECO-UNITARIO
                   CALL "ESTATS" USING WS-FUNCAO WS-VALOR WS-RESUMO
                   READ F-LINHAS
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                   END-READ
               END-PERFORM
               CLOSE F-LINHAS
               PERFORM MOSTRAR
               DISPLAY "CANCEL ESTATS"
               CANCEL "ESTATS"
               PERFORM MOSTRAR
               MOVE "X" TO WS-FUNCAO
               CALL "ESTATS" USING WS-FUNCAO WS-VALOR WS-RESUMO
               DISPLAY "funcao X: rc=" RETURN-CODE
               STOP RUN.
           MOSTRAR.
               MOVE "R" TO WS-FUNCAO
               CALL "ESTATS" USING WS-FUNCAO WS-VALOR WS-RESUMO
               DISPLAY "linhas=" WS-R-N " soma=" WS-R-SOMA
                       " maior=" WS-R-MAX.

    cobc -x -I copybooks -o s27 sol27.cob estats.cob
    ./s27
    linhas=0026 soma=000001005.49 maior=0000099.80
    CANCEL ESTATS
    linhas=0000 soma=000000000.00 maior=0000000.00
    funcao X: rc=+000000008

Os acumuladores estão na WORKING-STORAGE do ESTATS e sobrevivem entre as 26 chamadas. O CANCEL descarrega o módulo: a chamada seguinte encontra os valores iniciais (VALUE 0). A soma é 1005.49 (sem IVA, incluindo a encomenda cancelada) e o maior valor de linha é 99.80 (2 x 49.90).

### Exercício 28

Ficheiros buscacli.cob e sol28.cob:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. BUSCACLI.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-CLIENTES ASSIGN TO "dados/clientes.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-CLIENTES.
               COPY "cliente.cpy".
           WORKING-STORAGE SECTION.
           01  WS-FIM                 PIC X.
               88  FIM-DO-FICHEIRO              VALUE "S".
           LINKAGE SECTION.
           01  LK-ID                  PIC 9(03).
           01  LK-NOME                PIC X(20).
           01  LK-CIDADE              PIC X(10).
           PROCEDURE DIVISION USING LK-ID LK-NOME LK-CIDADE.
           PRINCIPAL.
               MOVE 4 TO RETURN-CODE
               MOVE SPACES TO LK-NOME LK-CIDADE
               MOVE "N" TO WS-FIM
               OPEN INPUT F-CLIENTES
               READ F-CLIENTES AT END SET FIM-DO-FICHEIRO TO TRUE END-READ
               PERFORM UNTIL FIM-DO-FICHEIRO
                   IF CLI-ID = LK-ID
                       MOVE CLI-NOME TO LK-NOME
                       MOVE CLI-CIDADE TO LK-CIDADE
                       MOVE 0 TO RETURN-CODE
                       SET FIM-DO-FICHEIRO TO TRUE
                   ELSE
                       READ F-CLIENTES
                           AT END SET FIM-DO-FICHEIRO TO TRUE
                       END-READ
                   END-IF
               END-PERFORM
               CLOSE F-CLIENTES
               GOBACK.

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SOL28.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-ENCOMENDAS ASSIGN TO "dados/encomendas.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-ENCOMENDAS.
               COPY "encomenda.cpy".
           WORKING-STORAGE SECTION.
           01  WS-FIM                 PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO              VALUE "S".
           01  WS-MODULO              PIC X(08).
           01  WS-FALHOU              PIC X     VALUE "N".
           01  WS-CLI-ID              PIC 9(03).
           01  WS-NOME                PIC X(20).
           01  WS-CIDADE              PIC X(10).
           PROCEDURE DIVISION.
           PRINCIPAL.
               ACCEPT WS-MODULO
               OPEN INPUT F-ENCOMENDAS
               READ F-ENCOMENDAS
                   AT END SET FIM-DO-FICHEIRO TO TRUE
               END-READ
               PERFORM UNTIL FIM-DO-FICHEIRO OR WS-FALHOU = "S"
                   IF ENC-ESTADO = "pendente"
                       MOVE ENC-CLIENTE-ID TO WS-CLI-ID
                       PERFORM PROCURAR-CLIENTE
                   END-IF
                   READ F-ENCOMENDAS
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                   END-READ
               END-PERFORM
               CLOSE F-ENCOMENDAS
               IF WS-FALHOU = "N"
                   MOVE 99 TO WS-CLI-ID
                   PERFORM PROCURAR-CLIENTE
               END-IF
               STOP RUN.
           PROCURAR-CLIENTE.
               CALL WS-MODULO USING WS-CLI-ID WS-NOME WS-CIDADE
                   ON EXCEPTION
                       MOVE "S" TO WS-FALHOU
                       DISPLAY "modulo " WS-MODULO " nao encontrado"
               END-CALL
               IF WS-FALHOU = "N"
                   IF RETURN-CODE = 0
                       DISPLAY ENC-ID " " WS-NOME WS-CIDADE
                   ELSE
                       DISPLAY "cliente " WS-CLI-ID
                               " nao existe (rc=" RETURN-CODE ")"
                   END-IF
               END-IF.

    cobc -m -I copybooks -o lib/buscacli.so buscacli.cob
    cobc -x -I copybooks -o s28 sol28.cob
    echo BUSCACLI | COB_LIBRARY_PATH=lib ./s28
    0008 Ana Ribeiro         Lisboa    
    0009 Filipe Lopes        Porto     
    0012 Bruno Costa         Porto     
    cliente 099 nao existe (rc=+000000004)

    echo BUSCACLX | COB_LIBRARY_PATH=lib ./s28
    modulo BUSCACLX nao encontrado

    echo BUSCACLI | ./s28
    modulo BUSCACLI nao encontrado

O módulo fica em lib/buscacli.so e o nome do ficheiro tem de coincidir com o PROGRAM-ID. Sem COB_LIBRARY_PATH o CALL não o encontra e o ON EXCEPTION trata o erro sem rebentar. Uso um interruptor (WS-FALHOU) em vez de NOT ON EXCEPTION, que no 3.2.0 também corre depois de um DISPLAY dentro do ON EXCEPTION. O cliente 99 não existe: BUSCACLI devolve rc=4.

## Módulo 08 · Erros e depuração

### Exercício 29

          *> EX29.COB - rotina central de FILE STATUS
           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX29.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-PRODUTOS ASSIGN TO WS-NOME-FICH
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-ESTADO.
           DATA DIVISION.
           FILE SECTION.
           FD  F-PRODUTOS.
           01  REG-PRODUTO             PIC X(42).
           WORKING-STORAGE SECTION.
           01  WS-NOME-FICH            PIC X(20).
           01  WS-ESTADO               PIC XX.
           01  WS-MENSAGEM             PIC X(30).
           01  WS-FIM                  PIC X VALUE "N".
               88  FIM-FICHEIRO        VALUE "S".
           01  WS-LIDOS                PIC 9(03) VALUE ZERO.
           PROCEDURE DIVISION.
           PRINCIPAL.
               MOVE "produtos.dat" TO WS-NOME-FICH
               PERFORM CONTAR-FICHEIRO
               MOVE "produtos-2026.dat" TO WS-NOME-FICH
               PERFORM CONTAR-FICHEIRO
               STOP RUN.
           CONTAR-FICHEIRO.
               MOVE ZERO TO WS-LIDOS
               MOVE "N" TO WS-FIM
               OPEN INPUT F-PRODUTOS
               PERFORM TRADUZIR-ESTADO
               DISPLAY FUNCTION TRIM (WS-NOME-FICH) ": OPEN -> "
                   FUNCTION TRIM (WS-MENSAGEM)
               IF WS-ESTADO = "00"
                   PERFORM UNTIL FIM-FICHEIRO
                       READ F-PRODUTOS
                           AT END SET FIM-FICHEIRO TO TRUE
                           NOT AT END ADD 1 TO WS-LIDOS
                       END-READ
                   END-PERFORM
                   CLOSE F-PRODUTOS
                   DISPLAY "    registos lidos: " WS-LIDOS
               ELSE
                   MOVE 8 TO RETURN-CODE
               END-IF.
           TRADUZIR-ESTADO.
               EVALUATE WS-ESTADO
                   WHEN "00" MOVE "sucesso" TO WS-MENSAGEM
                   WHEN "35" MOVE "ficheiro nao existe" TO WS-MENSAGEM
                   WHEN OTHER MOVE "estado nao previsto" TO WS-MENSAGEM
               END-EVALUATE.

Execução (o código de saída lido com echo $? a seguir):

    produtos.dat: OPEN -> sucesso
        registos lidos: 010
    produtos-2026.dat: OPEN -> ficheiro nao existe
    codigo de saida: 8

O mesmo SELECT serve para os dois ficheiros porque o nome vem de uma variável; o OPEN falhado não mata o programa porque há FILE STATUS. O RETURN-CODE 8 só é posto no caminho do erro e o STOP RUN entrega-o ao shell.

### Exercício 30

          *> EX30.COB - validar linhas de encomenda novas
           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX30.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-LINHAS ASSIGN TO "linhas-novas.dat"
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-ESTADO.
           DATA DIVISION.
           FILE SECTION.
           FD  F-LINHAS.
           01  REG-LINHA.
               05  LIN-ID              PIC 9(04).
               05  LIN-ENCOMENDA-ID    PIC 9(04).
               05  LIN-PRODUTO-ID      PIC 9(03).
               05  LIN-QUANTIDADE      PIC 9(03).
               05  LIN-PRECO           PIC 9(05)V99.
           WORKING-STORAGE SECTION.
           78  MAX-PRODUTO             VALUE 10.
           78  MAX-QUANTIDADE          VALUE 100.
           01  WS-ESTADO               PIC XX.
           01  WS-FIM                  PIC X VALUE "N".
               88  FIM-FICHEIRO        VALUE "S".
           01  WS-MOTIVO               PIC X(25).
               88  SEM-MOTIVO          VALUE SPACES.
           01  WS-VALOR                PIC 9(07)V99.
           01  WS-TOTAL                PIC 9(07)V99 VALUE ZERO.
           01  WS-TOTAL-ED             PIC Z,ZZZ,ZZ9.99.
           01  WS-ACEITES              PIC 9(03) VALUE ZERO.
           01  WS-REJEITADAS           PIC 9(03) VALUE ZERO.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-LINHAS
               IF WS-ESTADO NOT = "00"
                   DISPLAY "ERRO " WS-ESTADO " no OPEN"
                   MOVE 12 TO RETURN-CODE
                   STOP RUN
               END-IF
               PERFORM UNTIL FIM-FICHEIRO
                   READ F-LINHAS
                       AT END SET FIM-FICHEIRO TO TRUE
                       NOT AT END PERFORM PROCESSAR-LINHA
                   END-READ
               END-PERFORM
               CLOSE F-LINHAS
               MOVE WS-TOTAL TO WS-TOTAL-ED
               DISPLAY "aceites=" WS-ACEITES " rejeitadas=" WS-REJEITADAS
                   " total=" WS-TOTAL-ED
               IF WS-REJEITADAS > 0
                   MOVE 4 TO RETURN-CODE
               END-IF
               STOP RUN.
           PROCESSAR-LINHA.
               PERFORM VALIDAR-LINHA
               IF SEM-MOTIVO
                   COMPUTE WS-VALOR = LIN-QUANTIDADE * LIN-PRECO
                       ON SIZE ERROR MOVE "valor demasiado grande"
                           TO WS-MOTIVO
                   END-COMPUTE
               END-IF
               IF SEM-MOTIVO
                   ADD WS-VALOR TO WS-TOTAL
                   ADD 1 TO WS-ACEITES
                   DISPLAY "OK        " LIN-ID " valor " WS-VALOR
               ELSE
                   ADD 1 TO WS-REJEITADAS
                   DISPLAY "REJEITADA " LIN-ID " " WS-MOTIVO
               END-IF.
           VALIDAR-LINHA.
               MOVE SPACES TO WS-MOTIVO
               EVALUATE TRUE
                   WHEN LIN-ID NOT NUMERIC
                       MOVE "id nao numerico" TO WS-MOTIVO
                   WHEN LIN-PRODUTO-ID NOT NUMERIC
                       MOVE "produto nao numerico" TO WS-MOTIVO
                   WHEN LIN-PRODUTO-ID < 1
                        OR LIN-PRODUTO-ID > MAX-PRODUTO
                       MOVE "produto fora do intervalo" TO WS-MOTIVO
                   WHEN LIN-QUANTIDADE NOT NUMERIC
                       MOVE "quantidade nao numerica" TO WS-MOTIVO
                   WHEN LIN-QUANTIDADE < 1
                        OR LIN-QUANTIDADE > MAX-QUANTIDADE
                       MOVE "quantidade fora do limite" TO WS-MOTIVO
                   WHEN LIN-PRECO NOT NUMERIC
                       MOVE "preco nao numerico" TO WS-MOTIVO
                   WHEN LIN-PRECO = 0
                       MOVE "preco a zero" TO WS-MOTIVO
               END-EVALUATE.

    OK        0001 valor 0000025.80
    REJEITADA 0002 quantidade fora do limite
    REJEITADA 00A3 id nao numerico
    REJEITADA 0004 produto fora do intervalo
    REJEITADA 0005 preco a zero
    OK        0006 valor 0000089.70
    REJEITADA 0007 quantidade nao numerica
    REJEITADA 0008 quantidade fora do limite
    aceites=002 rejeitadas=006 total=      115.50
    codigo de saida: 4

A ordem das regras no EVALUATE importa: NOT NUMERIC vem sempre antes da comparação de intervalo, para nunca comparar lixo. A linha 7 (quantidade com espaços) é apanhada pelo NOT NUMERIC; a 2 (quantidade 000) pelo intervalo.

### Exercício 31

Sem -debug (compilado com -Wall, que não avisa nada) o programa corre até ao fim e escreve resultados errados, sem um único erro:

    carregados: 10
    sufixo do 1o nome: rregador U
    total de 5A  unidades do 1o:     6,579.00

O nome do primeiro produto é Romance Policial, não tem «rregador U», e 5A unidades de 12,90 não são 6 579,00. Com -debug aparecem os erros, um de cada vez (cada correção revela o seguinte):

    libcob: ex31.cob:39: error: subscript of 'TAB-NOME' out of bounds: 9
    note: maximum subscript for 'TAB-NOME': 8

Erro 1 (linha 39, MOVE ... TO TAB-NOME (WS-N)): a tabela tem OCCURS 8 e o ficheiro tem 10 produtos. Correção: OCCURS 10 TIMES. Sem -debug, as posições 9 e 10 escreveram por cima da memória a seguir à tabela, estragaram o WS-POS (que ficou com «Ma», de «Manta de Sofa») e é por isso que o sufixo saiu mal.

    libcob: ex31c.cob:45: error: length of 'TAB-NOME' out of bounds: 10, starting at: 20, maximum: 25

Erro 2 (referência por posição): TAB-NOME tem 25 caracteres; a partir da posição 20 só há 6. Correção: WS-POS VALUE 16 (16 + 10 - 1 = 25). A mensagem mostra a linha 45 e o nome ex31c porque corri uma cópia intermédia com a primeira correção; no teu programa a linha é a que o libcob indicar.

    libcob: ex31c.cob:47: error: 'WS-QTD' (Type: NUMERIC DISPLAY) not numeric: '5A '

Erro 3 (COMPUTE): o ACCEPT para WS-QTD-TXT deixou o texto 5A e um espaço num campo que o REDEFINES trata como número. Correção: validar antes de calcular (programa completo em ex31ok.cob):

               IF WS-QTD NOT NUMERIC
                   DISPLAY "quantidade invalida: [" WS-QTD-TXT "]"
                   MOVE 4 TO RETURN-CODE
               ELSE
                   COMPUTE WS-TOTAL = TAB-PRECO (1) * WS-QTD
                   ...
               END-IF

Programa corrigido, compilado com -debug, com as entradas 005 e 5A:

    carregados: 10
    sufixo do 1o nome: l
    total de 005 unidades do 1o:        64.50

    carregados: 10
    sufixo do 1o nome: l
    quantidade invalida: [5A ]       (código de saída 4)

### Exercício 32

          *> EX32.COB - contagem de encomendas por estado
           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX32.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-ENCOMENDAS ASSIGN TO WS-NOME-FICH
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-ESTADO.
           DATA DIVISION.
           FILE SECTION.
           FD  F-ENCOMENDAS.
           01  REG-ENCOMENDA.
               05  ENC-ID              PIC 9(04).
               05  ENC-CLIENTE-ID      PIC 9(03).
               05  ENC-DATA            PIC 9(08).
               05  ENC-ESTADO          PIC X(10).
           WORKING-STORAGE SECTION.
           01  WS-NOME-FICH            PIC X(30).
           01  WS-ESTADO               PIC XX.
           01  WS-FIM                  PIC X VALUE "N".
               88  FIM-FICHEIRO        VALUE "S".
           01  WS-ERROS-FICHEIRO       PIC 99 VALUE ZERO.
           01  WS-CONTAGENS.
               05  CNT-PENDENTE        PIC 9(03) VALUE ZERO.
               05  CNT-ENVIADA         PIC 9(03) VALUE ZERO.
               05  CNT-ENTREGUE        PIC 9(03) VALUE ZERO.
               05  CNT-CANCELADA       PIC 9(03) VALUE ZERO.
               05  CNT-DESCONHECIDO    PIC 9(03) VALUE ZERO.
           PROCEDURE DIVISION.
           DECLARATIVES.
           ERROS-ENCOMENDAS SECTION.
               USE AFTER STANDARD ERROR PROCEDURE ON F-ENCOMENDAS.
           REGISTAR-ERRO.
               ADD 1 TO WS-ERROS-FICHEIRO
               DISPLAY "[declarative] " FUNCTION TRIM (WS-NOME-FICH)
                   " estado " WS-ESTADO.
           END DECLARATIVES.
           PROGRAMA SECTION.
           PRINCIPAL.
               ACCEPT WS-NOME-FICH
               OPEN INPUT F-ENCOMENDAS
               IF WS-ESTADO NOT = "00"
                   MOVE 12 TO RETURN-CODE
                   STOP RUN
               END-IF
               PERFORM UNTIL FIM-FICHEIRO
                   READ F-ENCOMENDAS
                       AT END SET FIM-FICHEIRO TO TRUE
                       NOT AT END PERFORM CONTAR-ESTADO
                   END-READ
               END-PERFORM
               CLOSE F-ENCOMENDAS
               DISPLAY "pendente=" CNT-PENDENTE " enviada=" CNT-ENVIADA
                   " entregue=" CNT-ENTREGUE " cancelada=" CNT-CANCELADA
               IF CNT-DESCONHECIDO > 0
                   DISPLAY "estados desconhecidos: " CNT-DESCONHECIDO
                   MOVE 4 TO RETURN-CODE
               END-IF
               STOP RUN.
           CONTAR-ESTADO.
          D    DISPLAY "D> lido " ENC-ID " [" ENC-ESTADO "]"
               EVALUATE ENC-ESTADO
                   WHEN "pendente"  ADD 1 TO CNT-PENDENTE
                   WHEN "enviada"   ADD 1 TO CNT-ENVIADA
                   WHEN "entregue"  ADD 1 TO CNT-ENTREGUE
                   WHEN "cancelada" ADD 1 TO CNT-CANCELADA
                   WHEN OTHER       ADD 1 TO CNT-DESCONHECIDO
               END-EVALUATE.

Os quatro casos, executados:

    A) encomendas.dat
    pendente=003 enviada=003 entregue=005 cancelada=001            (saída 0)

    B) o mesmo, compilado com -fdebugging-line (primeiras linhas)
    D> lido 0001 [entregue  ]
    D> lido 0002 [entregue  ]
    D> lido 0003 [entregue  ]
    pendente=003 enviada=003 entregue=005 cancelada=001            (saída 0)

    C) nao-existe.dat
    [declarative] nao-existe.dat estado 35                         (saída 12)

    D) encomendas.dat mais a linha perdida
    pendente=003 enviada=003 entregue=005 cancelada=001
    estados desconhecidos: 001                                     (saída 4)

Sem -fdebugging-line a linha D é ignorada (caso A); com a opção aparece (caso B), sem mexer no código. O declarative corre no OPEN falhado (estado 35); como o READ tem AT END, o fim do ficheiro não o dispara. Pendente, enviada, entregue e cancelada somam 12, o total de encomendas.dat.

## Módulo 09 · COBOL no mundo real

### Exercício 33
          *> EX33.COB - clientes.dat para EBCDIC
           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX33.
           ENVIRONMENT DIVISION.
           CONFIGURATION SECTION.
           SPECIAL-NAMES.
               ALPHABET ALFA-NATIVO IS NATIVE
               ALPHABET ALFA-EBCDIC IS EBCDIC.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-ENTRADA ASSIGN TO "clientes.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
               SELECT F-SAIDA ASSIGN TO "clientes.ebc"
                   ORGANIZATION IS SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-ENTRADA.
           01  REG-ENTRADA             PIC X(71).
           FD  F-SAIDA.
           01  REG-SAIDA               PIC X(71).
           WORKING-STORAGE SECTION.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-ENTRADA OUTPUT F-SAIDA
               PERFORM UNTIL FIM-DO-FICHEIRO
                   READ F-ENTRADA
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                       NOT AT END
                           INSPECT REG-ENTRADA
                               CONVERTING ALFA-NATIVO TO ALFA-EBCDIC
                           MOVE REG-ENTRADA TO REG-SAIDA
                           WRITE REG-SAIDA
                   END-READ
               END-PERFORM
               CLOSE F-ENTRADA F-SAIDA
               STOP RUN.

    ex33.py (Python):
    dados = open("clientes.ebc", "rb").read()
    print(len(dados), "bytes")
    for i in range(0, 3 * 71, 71):
        print(dados[i:i + 71].decode("cp037"))

    Saída do contentor e do Python:
    568
    IGUAIS
    568 bytes
    001Ana Ribeiro         ana.ribeiro@exemplo.pt        Lisboa    20240115
    002Bruno Costa         bruno.costa@exemplo.pt        Porto     20240203
    003Carla Mendes        carla.mendes@exemplo.pt       Braga     20240321

O INSPECT CONVERTING com os dois alfabetos converte os 71 carateres de cada registo; 8 registos dão 568 bytes e o cmp com o iconv CP037 não encontrou diferenças. Os dados dos clientes (letras, dígitos, espaço, arroba e ponto) não têm símbolos que a GnuCOBOL e o CP037 traduzam de forma diferente.

### Exercício 34
          *> EX34.COB - linhas.dat para linhas.bin com COMP-3
           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX34.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-ENTRADA ASSIGN TO "linhas.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
               SELECT F-SAIDA ASSIGN TO "linhas.bin"
                   ORGANIZATION IS SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-ENTRADA.
           01  REG-ENTRADA.
               05  ENT-ID              PIC 9(04).
               05  ENT-ENCOMENDA-ID    PIC 9(04).
               05  ENT-PRODUTO-ID      PIC 9(03).
               05  ENT-QUANTIDADE      PIC 9(03).
               05  ENT-PRECO           PIC 9(05)V99.
           FD  F-SAIDA.
           01  REG-SAIDA.
               05  SAI-ID              PIC 9(04).
               05  SAI-ENCOMENDA-ID    PIC 9(04).
               05  SAI-PRODUTO-ID      PIC 9(03).
               05  SAI-QUANTIDADE      PIC S9(03) COMP-3.
               05  SAI-PRECO           PIC S9(05)V99 COMP-3.
           WORKING-STORAGE SECTION.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-ENTRADA OUTPUT F-SAIDA
               PERFORM UNTIL FIM-DO-FICHEIRO
                   READ F-ENTRADA
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                       NOT AT END
                           MOVE ENT-ID           TO SAI-ID
                           MOVE ENT-ENCOMENDA-ID TO SAI-ENCOMENDA-ID
                           MOVE ENT-PRODUTO-ID   TO SAI-PRODUTO-ID
                           MOVE ENT-QUANTIDADE   TO SAI-QUANTIDADE
                           MOVE ENT-PRECO        TO SAI-PRECO
                           WRITE REG-SAIDA
                   END-READ
               END-PERFORM
               MOVE 9999 TO SAI-ID
               MOVE 1    TO SAI-ENCOMENDA-ID
               MOVE 1    TO SAI-PRODUTO-ID
               MOVE 1    TO SAI-QUANTIDADE
               MOVE -5   TO SAI-PRECO
               WRITE REG-SAIDA
               CLOSE F-ENTRADA F-SAIDA
               DISPLAY LENGTH OF REG-SAIDA " bytes por registo"
               STOP RUN.

    from decimal import Decimal

    TAM = 4 + 4 + 3 + 2 + 4          # = 17 bytes

    def comp3(b, casas=0):
        h = b.hex()
        v = Decimal(int(h[:-1])).scaleb(-casas)
        return -v if h[-1] == "d" else v

    bruto = open("linhas.bin", "rb").read()
    print(len(bruto), "bytes,", len(bruto) // TAM, "registos")
    total = Decimal(0); enc1 = Decimal(0)
    for i in range(0, len(bruto), TAM):
        r = bruto[i:i + TAM]
        enc = int(r[4:8]); qtd = comp3(r[11:13]); preco = comp3(r[13:17], 2)
        if int(r[0:4]) == 9999:
            print("ultimo:", r[11:13].hex(), r[13:17].hex(), qtd, preco)
            continue
        total += qtd * preco
        if enc == 1:
            enc1 += qtd * preco
    print("total geral:", total, " encomenda 1:", enc1)

    # controlo directo sobre o ficheiro de texto
    t = Decimal(0); e = Decimal(0)
    for l in open("linhas.dat"):
        l = l.rstrip("\r\n")
        q, p = int(l[11:14]), Decimal(int(l[14:21])).scaleb(-2)
        t += q * p
        e += q * p if int(l[4:8]) == 1 else 0
    print("controlo   :", t, " encomenda 1:", e)

    Saída (COBOL, depois Python):
    17 bytes por registo
    459 bytes, 27 registos
    ultimo: 001c 0000500d 1 -5.00
    total geral: 1005.49  encomenda 1: 40.70
    controlo   : 1005.49  encomenda 1: 40.70

Cada registo ocupa 17 bytes (4 + 4 + 3 + 2 + 4). O preço da nota de crédito, -5.00, ficou como 0000500d: os mesmos dígitos do 5.00 positivo, com o nibble final d (negativo) em vez de c. O total geral e o da encomenda 1 batem com o cálculo feito em linhas.dat.

### Exercício 35
          *> EX35.COB - produtos.dat para CSV e JSON
           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX35.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-ENTRADA ASSIGN TO "produtos.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
               SELECT F-CSV ASSIGN TO "produtos.csv"
                   ORGANIZATION IS LINE SEQUENTIAL.
               SELECT F-JSON ASSIGN TO "produtos.jsonl"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-ENTRADA.
           01  REG-PRODUTO.
               05  PRO-ID              PIC 9(03).
               05  PRO-NOME            PIC X(25).
               05  PRO-CATEGORIA-ID    PIC 9(02).
               05  PRO-PRECO           PIC 9(05)V99.
               05  PRO-STOCK           PIC 9(05).
           FD  F-CSV.
           01  LINHA-CSV               PIC X(80).
           FD  F-JSON.
           01  LINHA-JSON              PIC X(200).
           WORKING-STORAGE SECTION.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           01  WS-PRECO-ED             PIC Z(4)9.99.
           01  WS-JSON                 PIC X(200).
           01  WS-TAM                  PIC 9(04).
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-ENTRADA OUTPUT F-CSV F-JSON
               MOVE "id;nome;categoria_id;preco;stock" TO LINHA-CSV
               WRITE LINHA-CSV
               PERFORM UNTIL FIM-DO-FICHEIRO
                   READ F-ENTRADA
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                       NOT AT END
                           MOVE PRO-PRECO TO WS-PRECO-ED
                           MOVE SPACES TO LINHA-CSV
                           STRING PRO-ID DELIMITED BY SIZE
                                  ";" DELIMITED BY SIZE
                                  FUNCTION TRIM(PRO-NOME) DELIMITED BY SIZE
                                  ";" DELIMITED BY SIZE
                                  PRO-CATEGORIA-ID DELIMITED BY SIZE
                                  ";" DELIMITED BY SIZE
                                  FUNCTION TRIM(WS-PRECO-ED)
                                      DELIMITED BY SIZE
                                  ";" DELIMITED BY SIZE
                                  PRO-STOCK DELIMITED BY SIZE
                               INTO LINHA-CSV
                           END-STRING
                           WRITE LINHA-CSV
                           MOVE SPACES TO WS-JSON
                           JSON GENERATE WS-JSON FROM REG-PRODUTO
                               COUNT IN WS-TAM
                           END-JSON
                           MOVE WS-JSON(1:WS-TAM) TO LINHA-JSON
                           WRITE LINHA-JSON
                   END-READ
               END-PERFORM
               CLOSE F-ENTRADA F-CSV F-JSON
               STOP RUN.

    import csv, json
    from decimal import Decimal

    with open("produtos.csv", newline="") as f:
        linhas = list(csv.DictReader(f, delimiter=";"))
    with open("produtos.jsonl") as f:
        jsons = [json.loads(l, parse_float=Decimal)["REG-PRODUTO"] for l in f]
    print(len(linhas), len(jsons))
    print(linhas[2])
    print(jsons[2])
    tc = sum(Decimal(l["preco"]) * int(l["stock"]) for l in linhas)
    tj = sum(j["PRO-PRECO"] * j["PRO-STOCK"] for j in jsons)
    print(tc, tj, tc == tj)

    Primeiras linhas de produtos.csv:
    001;Romance Policial;01;12.90;00040
    002;Livro de Receitas;01;18.50;00025

    Uma linha de produtos.jsonl:
    {"REG-PRODUTO":{"PRO-ID":3,"PRO-NOME":"Atlas Mundial","PRO-CATEGORIA-ID":1,"PRO-PRECO":29.99,"PRO-STOCK":10}}

    Saída do Python:
    10 10
    {'id': '003', 'nome': 'Atlas Mundial', 'categoria_id': '01', 'preco': '29.99', 'stock': '00010'}
    {'PRO-ID': 3, 'PRO-NOME': 'Atlas Mundial', 'PRO-CATEGORIA-ID': 1, 'PRO-PRECO': Decimal('29.99'), 'PRO-STOCK': 10}
    7304.60 7304.60 True

No CSV o id mantém os zeros porque o STRING copia o campo PIC 9(03) tal como está; no JSON o id é um número (003 passou a 3), tal como PRO-CATEGORIA-ID e PRO-STOCK. O PRO-PRECO PIC 9(05)V99 saiu como número com duas casas (29.99), por isso o Python leu-o como Decimal sem erros de arredondamento. O total de stock é 7304.60 nos dois ficheiros.

### Exercício 36
    /* desconto_c.c - desconto em percentagem, em centimos, arredondado */
    int desconto_c(int centimos, int pct)
    {
        return (centimos * (100 - pct) + 50) / 100;
    }

          *> EX36.COB - COBOL chama a funcao C desconto_c
           IDENTIFICATION DIVISION.
           PROGRAM-ID. EX36.
           ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT F-ENTRADA ASSIGN TO "produtos.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.
           DATA DIVISION.
           FILE SECTION.
           FD  F-ENTRADA.
           01  REG-PRODUTO.
               05  PRO-ID              PIC 9(03).
               05  PRO-NOME            PIC X(25).
               05  PRO-CATEGORIA-ID    PIC 9(02).
               05  PRO-PRECO           PIC 9(05)V99.
               05  PRO-STOCK           PIC 9(05).
           WORKING-STORAGE SECTION.
           01  WS-FIM                  PIC X     VALUE "N".
               88  FIM-DO-FICHEIRO               VALUE "S".
           01  WS-PCT                  BINARY-LONG VALUE 15.
           01  WS-CENT                 BINARY-LONG.
           01  WS-RES                  BINARY-LONG.
           01  WS-NOVO                 PIC 9(05)V99.
           01  WS-ED-ANT               PIC Z(4)9.99.
           01  WS-ED-NOVO              PIC Z(4)9.99.
           01  WS-TOTAL                PIC 9(07)V99 VALUE 0.
           01  WS-ED-TOTAL             PIC Z(6)9.99.
           PROCEDURE DIVISION.
           PRINCIPAL.
               OPEN INPUT F-ENTRADA
               PERFORM UNTIL FIM-DO-FICHEIRO
                   READ F-ENTRADA
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                       NOT AT END
                           COMPUTE WS-CENT = PRO-PRECO * 100
                           CALL "desconto_c" USING BY VALUE WS-CENT WS-PCT
                               RETURNING WS-RES
                           COMPUTE WS-NOVO = WS-RES / 100
                           ADD WS-NOVO TO WS-TOTAL
                           MOVE PRO-PRECO TO WS-ED-ANT
                           MOVE WS-NOVO   TO WS-ED-NOVO
                           DISPLAY PRO-ID " " PRO-NOME " " WS-ED-ANT
                                   " -> " WS-ED-NOVO
                   END-READ
               END-PERFORM
               CLOSE F-ENTRADA
               MOVE WS-TOTAL TO WS-ED-TOTAL
               DISPLAY "Soma dos precos com desconto: " WS-ED-TOTAL
               STOP RUN.

    Compilado com cobc -x -o ex36 ex36.cob desconto_c.c:
    001 Romance Policial             12.90 ->    10.97
    002 Livro de Receitas            18.50 ->    15.73
    003 Atlas Mundial                29.99 ->    25.49
    004 Auscultadores Bluetooth      49.90 ->    42.42
    005 Carregador USB-C             14.90 ->    12.67
    006 Teclado Mecanico             79.00 ->    67.15
    007 Candeeiro de Mesa            22.00 ->    18.70
    008 Conjunto de Panelas          89.90 ->    76.42
    009 Manta de Sofa                34.50 ->    29.33
    010 Caneca de Ceramica            6.50 ->     5.53
    Soma dos precos com desconto:     304.41

    Compilado sem o ficheiro C (cobc -x -o sem36 ex36.cob), o programa compila mas falha ao executar:
    libcob: error: module 'desconto_c' not found
    libcob: warning: implicit CLOSE of F-ENTRADA ('produtos.dat')

    Cálculo independente em Python (preço em cêntimos vezes 85, mais 50, a dividir por 100, somado):
    304.41

O COBOL passa o preço em cêntimos e a percentagem por valor (BY VALUE) e recebe o resultado em RETURNING; a soma 304.41 coincide com o cálculo independente. Sem o ficheiro C o cobc compila na mesma, porque o CALL com literal é resolvido só em execução, e o erro aparece quando o programa chega ao CALL.

## Projeto final · Exercício 37

O projeto é aberto, por isso não há uma solução única. Usa a grelha do módulo 10 (9 critérios, de 0 a 3, máximo 27) e esta tabela para avaliares cada parte.

| Parte | Está bom quando... | Sinal de alerta |
|---|---|---|
| Dados | Copybooks com COPY, dinheiro em decimal, layouts documentados | Descrições repetidas em cada programa, dinheiro em COMP-2 |
| Validação | As quatro regras funcionam e cada rejeição tem o seu motivo | Rejeições sem motivo ou regras em falta |
| Stock | REWRITE por chave, e a encomenda sem stock não abate nenhuma linha | Linhas abatidas antes de validar a encomenda toda |
| Relatório | Quebra de controlo por encomenda, IVA e totais certos (confirmados à mão) | Total nunca conferido |
| Modularidade | Subprograma para o IVA e copybooks partilhados | Código duplicado |
| Erros | FILE STATUS em tudo, rotina central e códigos de saída 0, 4 e 8 | Programa que termina com erro seco do libcob |
| Testes | Entradas com casos bons e maus e resultado esperado confirmado | Só o caso feliz |

**DICA:** confirma o total geral com um awk sobre os ficheiros de dados. Um total que bate certo vale mais do que um relatório bonito.
