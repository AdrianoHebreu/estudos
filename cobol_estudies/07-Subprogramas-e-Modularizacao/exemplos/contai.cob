      * Igual a CONTAR, mas com INITIAL: reinicia a cada chamada.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CONTAI IS INITIAL.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-N                   PIC 9(04) VALUE 0.
       PROCEDURE DIVISION.
           ADD 1 TO WS-N.
           DISPLAY "contai:  chamada " WS-N.
           GOBACK.
