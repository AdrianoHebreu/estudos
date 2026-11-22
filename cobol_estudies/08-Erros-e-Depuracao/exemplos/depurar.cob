      *> DEPURAR.COB - linhas de depuracao (D na coluna 7)
       IDENTIFICATION DIVISION.
       PROGRAM-ID. DEPURAR.
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SOURCE-COMPUTER. PC WITH DEBUGGING MODE.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-PRECO                PIC 9(05)V99 VALUE 12.90.
       01  WS-QTD                  PIC 9(03) VALUE 4.
       01  WS-TOTAL                PIC 9(05)V99 VALUE ZERO.
       PROCEDURE DIVISION.
       PRINCIPAL.
      D    DISPLAY "D> antes: preco=" WS-PRECO " qtd=" WS-QTD
           COMPUTE WS-TOTAL = WS-PRECO * WS-QTD
      D    DISPLAY "D> depois: total=" WS-TOTAL
           DISPLAY "Total: " WS-TOTAL
           STOP RUN.
