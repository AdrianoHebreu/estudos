      * Contador no WORKING-STORAGE: o valor persiste entre chamadas.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CONTAR.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-N                   PIC 9(04) VALUE 0.
       PROCEDURE DIVISION.
           ADD 1 TO WS-N.
           DISPLAY "contar:  chamada " WS-N.
           GOBACK.
