      *> LIMITES.COB - erros que so o -debug apanha
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LIMITES.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-OPCAO                PIC 9 VALUE ZERO.
       01  WS-I                    PIC 9 VALUE 5.
       01  WS-CIDADES.
           05  WS-CIDADE           PIC X(10) OCCURS 3 TIMES.
       01  WS-NOME                 PIC X(10) VALUE "ABCDEFGHIJ".
       01  WS-POS                  PIC 99 VALUE 8.
       01  WS-ZERO                 PIC 99 VALUE 0.
       01  WS-CHECK                PIC X(10) VALUE "intacto".
       PROCEDURE DIVISION.
       PRINCIPAL.
           ACCEPT WS-OPCAO
           EVALUATE WS-OPCAO
               WHEN 1
                   MOVE "Lisboa" TO WS-CIDADE (WS-I)
                   DISPLAY "subscrito " WS-I " aceite"
               WHEN 2
                   DISPLAY WS-NOME (WS-POS:5)
               WHEN 3
                   DISPLAY WS-NOME (WS-ZERO:5)
           END-EVALUATE
           DISPLAY "WS-CHECK=[" WS-CHECK "]"
           STOP RUN.
