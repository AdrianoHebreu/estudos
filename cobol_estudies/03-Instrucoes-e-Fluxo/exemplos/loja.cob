      *> LOJA.COB - encomenda 8 com IVA a 23% e classificacao do stock
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LOJA.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
      *> Linhas da encomenda 8 (valores de linhas.dat)
       01  LINHAS-ENC-8.
           05  FILLER          PIC 9(03)    VALUE 1.
           05  FILLER          PIC 9(03)    VALUE 1.
           05  FILLER          PIC 9(05)V99 VALUE 12.90.
           05  FILLER          PIC 9(03)    VALUE 2.
           05  FILLER          PIC 9(03)    VALUE 2.
           05  FILLER          PIC 9(05)V99 VALUE 18.50.
           05  FILLER          PIC 9(03)    VALUE 4.
           05  FILLER          PIC 9(03)    VALUE 4.
           05  FILLER          PIC 9(05)V99 VALUE 49.90.
       01  TAB-LINHAS          REDEFINES LINHAS-ENC-8.
           05  LINHA           OCCURS 3 TIMES.
               10  LIN-PRODUTO PIC 9(03).
               10  LIN-QTD     PIC 9(03).
               10  LIN-PRECO   PIC 9(05)V99.
      *> Stocks dos 10 produtos (valores de produtos.dat)
       01  STOCKS-LOJA.
           05  FILLER          PIC 9(05)    VALUE 40.
           05  FILLER          PIC 9(05)    VALUE 25.
           05  FILLER          PIC 9(05)    VALUE 10.
           05  FILLER          PIC 9(05)    VALUE 30.
           05  FILLER          PIC 9(05)    VALUE 100.
           05  FILLER          PIC 9(05)    VALUE 0.
           05  FILLER          PIC 9(05)    VALUE 15.
           05  FILLER          PIC 9(05)    VALUE 8.
           05  FILLER          PIC 9(05)    VALUE 20.
           05  FILLER          PIC 9(05)    VALUE 200.
       01  TAB-STOCKS          REDEFINES STOCKS-LOJA.
           05  STOCK-PRODUTO   PIC 9(05)    OCCURS 10 TIMES.
       01  WS-INDICE           PIC 9(02).
       01  WS-IVA-TAXA         PIC 9V99     VALUE 0.23.
       01  WS-LINHA-TOTAL      PIC 9(07)V99.
       01  WS-LINHA-IVA        PIC 9(07)V99.
       01  WS-SOMA-SEM-IVA     PIC 9(07)V99 VALUE ZERO.
       01  WS-SOMA-IVA         PIC 9(07)V99 VALUE ZERO.
       01  WS-SOMA-COM-IVA     PIC 9(07)V99 VALUE ZERO.
       01  WS-STOCK-ATUAL      PIC 9(05).
           88  STOCK-ESGOTADO               VALUE 0.
           88  STOCK-BAIXO                  VALUE 1 THRU 19.
           88  STOCK-NORMAL                 VALUE 20 THRU 99999.
       01  WS-CONTA-ESGOTADO   PIC 9(02)    VALUE ZERO.
       01  WS-CONTA-BAIXO      PIC 9(02)    VALUE ZERO.
       01  WS-CONTA-NORMAL     PIC 9(02)    VALUE ZERO.
       PROCEDURE DIVISION.
       0000-PRINCIPAL.
           PERFORM 1000-CALCULAR-ENCOMENDA
           PERFORM 2000-CLASSIFICAR-STOCK
           PERFORM 3000-MOSTRAR-RESUMO
           STOP RUN.
       1000-CALCULAR-ENCOMENDA.
           DISPLAY "--- Encomenda 8 ---"
           PERFORM 1100-CALCULAR-LINHA
               VARYING WS-INDICE FROM 1 BY 1 UNTIL WS-INDICE > 3
           COMPUTE WS-SOMA-COM-IVA = WS-SOMA-SEM-IVA + WS-SOMA-IVA.
       1100-CALCULAR-LINHA.
           COMPUTE WS-LINHA-TOTAL =
                   LIN-QTD(WS-INDICE) * LIN-PRECO(WS-INDICE)
           COMPUTE WS-LINHA-IVA ROUNDED =
                   WS-LINHA-TOTAL * WS-IVA-TAXA
               ON SIZE ERROR
                   DISPLAY "IVA nao cabe na linha " WS-INDICE
           END-COMPUTE
           ADD WS-LINHA-TOTAL TO WS-SOMA-SEM-IVA
           ADD WS-LINHA-IVA   TO WS-SOMA-IVA
           DISPLAY "produto " LIN-PRODUTO(WS-INDICE)
                   " qtd " LIN-QTD(WS-INDICE)
                   " total " WS-LINHA-TOTAL
                   " iva " WS-LINHA-IVA.
       2000-CLASSIFICAR-STOCK.
           PERFORM VARYING WS-INDICE FROM 1 BY 1
                   UNTIL WS-INDICE > 10
               MOVE STOCK-PRODUTO(WS-INDICE) TO WS-STOCK-ATUAL
               EVALUATE TRUE
                   WHEN STOCK-ESGOTADO
                       ADD 1 TO WS-CONTA-ESGOTADO
                   WHEN STOCK-BAIXO
                       ADD 1 TO WS-CONTA-BAIXO
                   WHEN STOCK-NORMAL
                       ADD 1 TO WS-CONTA-NORMAL
               END-EVALUATE
           END-PERFORM.
       3000-MOSTRAR-RESUMO.
           DISPLAY "Sem IVA : " WS-SOMA-SEM-IVA
           DISPLAY "IVA 23% : " WS-SOMA-IVA
           DISPLAY "Com IVA : " WS-SOMA-COM-IVA
           DISPLAY "--- Stock dos 10 produtos ---"
           DISPLAY "esgotados: " WS-CONTA-ESGOTADO
           DISPLAY "baixos   : " WS-CONTA-BAIXO
           DISPLAY "normais  : " WS-CONTA-NORMAL.
