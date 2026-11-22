      *> TOTAIS.COB - contar linhas de encomenda e somar valores
       IDENTIFICATION DIVISION.
       PROGRAM-ID. TOTAIS.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-LINHAS ASSIGN TO "linhas.dat"
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
       WORKING-STORAGE SECTION.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       01  WS-N-LINHAS             PIC 9(04) VALUE ZEROS.
       01  WS-UNIDADES             PIC 9(06) VALUE ZEROS.
       01  WS-VALOR-LINHA          PIC 9(08)V99.
       01  WS-TOTAL                PIC 9(08)V99 VALUE ZEROS.
       01  WS-TOTAL-E1             PIC 9(08)V99 VALUE ZEROS.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-LINHAS
           PERFORM LER-LINHA
           PERFORM UNTIL FIM-DO-FICHEIRO
               ADD 1 TO WS-N-LINHAS
               ADD LIN-QUANTIDADE TO WS-UNIDADES
               COMPUTE WS-VALOR-LINHA =
                   LIN-QUANTIDADE * LIN-PRECO-UNIT
               ADD WS-VALOR-LINHA TO WS-TOTAL
               IF LIN-ENCOMENDA-ID = 1
                   DISPLAY "enc 1, produto " LIN-PRODUTO-ID
                           " x" LIN-QUANTIDADE " = " WS-VALOR-LINHA
                   ADD WS-VALOR-LINHA TO WS-TOTAL-E1
               END-IF
               PERFORM LER-LINHA
           END-PERFORM
           CLOSE F-LINHAS
           DISPLAY "Linhas:    " WS-N-LINHAS
           DISPLAY "Unidades:  " WS-UNIDADES
           DISPLAY "Total enc 1: " WS-TOTAL-E1
           DISPLAY "Total geral: " WS-TOTAL
           STOP RUN.
       LER-LINHA.
           READ F-LINHAS
               AT END SET FIM-DO-FICHEIRO TO TRUE
           END-READ.
